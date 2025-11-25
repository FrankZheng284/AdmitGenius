import api from '@/api'
import type { ApiResponse, ForumPost, ForumComment, ForumPostCreateRequest, ForumCommentCreateRequest, PaginatedResponse, User } from '@/types'

// 定义 getPosts 方法接受的参数类型
interface GetPostsParams {
  page?: number;
  size?: number;
  sort?: string; // 例如 'latest', 'popular'
  keyword?: string; // 对应后端的 keyword
  category?: string;
}

// Helper function to map backend DTO to frontend ForumPost (can be shared if needed)
const mapDtoToForumPost = (dto: any): ForumPost => {
  // 优先使用完整的author对象，如果不存在则使用单独的字段构建
  let authorData: User;
  if (dto.author && typeof dto.author === 'object') {
    // 使用完整的UserDTO对象
    authorData = {
      id: dto.author.id || dto.authorId || 0,
      fullName: dto.author.fullName || dto.authorName || '未知作者',
      avatar: dto.author.profilePicture || dto.authorProfilePicture || '/default-avatar.png',
      profilePicture: dto.author.profilePicture || dto.authorProfilePicture || '/default-avatar.png',
      email: dto.author.email || dto.authorEmail || '',
      // 添加统计数据字段
      postsCount: dto.author.postsCount || 0,
      likesReceived: dto.author.likesReceived || 0,
      commentsCount: dto.author.commentsCount || 0,
      viewsReceived: dto.author.viewsReceived || 0,
      bio: dto.author.bio || '',
      role: dto.author.role || 'USER'
    };
  } else {
    // 使用单独的字段构建（向后兼容）
    authorData = {
      id: dto.authorId || 0,
      fullName: dto.authorName || '未知作者',
      avatar: dto.authorProfilePicture || '/default-avatar.png',
      profilePicture: dto.authorProfilePicture || '/default-avatar.png',
      email: dto.authorEmail || ''
    };
  }
  
  return {
    id: dto.id,
    title: dto.title,
    content: dto.content, // Full content from backend
    excerpt: dto.excerpt,
    userId: dto.authorId,
    author: authorData,
    likes: dto.likes || 0,
    // For single post view, backend DTO should include comments array directly
    comments: Array.isArray(dto.comments) ? dto.comments.map(mapCommentDtoToForumComment) : [], 
    commentCount: dto.commentCount !== undefined ? dto.commentCount : (dto.comments?.length || 0),
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
    category: dto.category,
    views: dto.views || 0,
    likedByCurrentUser: dto.likedByCurrentUser || false,
    tags: Array.isArray(dto.tags) ? dto.tags : [],
    // 专家帖子相关字段
    isExpertPost: dto.isExpertPost || false,
    expertTag: dto.expertTag || undefined
  };
};

const mapCommentDtoToForumComment = (commentDto: any): ForumComment => {
  const commentAuthorData: User = {
    id: commentDto.authorId || 0,
    fullName: commentDto.authorName || '未知作者',
    avatar: commentDto.authorProfilePicture || '/default-avatar.png',
    profilePicture: commentDto.authorProfilePicture || '/default-avatar.png',
    email: commentDto.authorEmail || '',
    role: commentDto.authorRole || 'USER'
  };
  return {
    id: commentDto.id,
    content: commentDto.content,
    userId: commentDto.authorId,
    author: commentAuthorData,
    postId: commentDto.postId,
    createdAt: commentDto.createdAt,
    updatedAt: commentDto.updatedAt,
    // likes: commentDto.likes || 0, // If CommentDTO has likes
  };
};

// Define a type for the raw paginated DTO from backend for ForumPost
interface ForumPostPaginatedDto {
  content: any[]; // Array of raw post DTOs
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

// Define a type for a raw single ForumPost DTO from backend
interface ForumPostRawDto { /* Define fields as they come from backend if needed for casting */}
// Define a type for a raw single ForumComment DTO from backend
interface ForumCommentRawDto { /* Define fields as they come from backend if needed for casting */}

export const ForumService = {
  /**
   * 获取论坛帖子列表
   * @param params 包含分页、排序、关键词、分类等参数的对象
   */
  getPosts: async (params: GetPostsParams = {}): Promise<PaginatedResponse<ForumPost>> => {
    const { page = 0, size = 10, sort, keyword, category } = params;
    
    const queryParams: Record<string, any> = {
      page,
      size
    };

    if (keyword) {
      queryParams.query = keyword;
    }
    if (category && category !== 'all') { // Assuming 'all' means no category filter
      queryParams.category = category;
    }

    // 将前端的 sort 选项传递给后端
    if (sort) {
      queryParams.sort = sort; // 直接传递sort选项给后端处理
      if (sort === 'popular') {
        // 对于popular排序，同时设置数据库排序参数
        queryParams.sort = 'popular';
      } else if (sort === 'replies') {
        // 对于replies排序，后端会特殊处理
        queryParams.sort = 'replies';
      }
    }

    try {
      // Get response from API
      const response = await api.get('/api/forum/posts', { params: queryParams }) as any;
      
      // Check if the response is wrapped in ApiResponse
      let serverPaginatedData: ForumPostPaginatedDto;
      if (response && typeof response === 'object' && 'success' in response && 'data' in response) {
        // Response is wrapped in ApiResponse
        console.log('Received wrapped ApiResponse:', response);
        if (!response.success) {
          throw new Error(response.message || 'API request failed');
        }
        serverPaginatedData = response.data;
      } else {
        // Response is already unwrapped (by interceptor)
        serverPaginatedData = response;
      }

      // Enhanced defensive check
      if (typeof serverPaginatedData !== 'object' || 
          serverPaginatedData === null || 
          !Array.isArray(serverPaginatedData.content)) {
        console.error('ForumService.getPosts: Invalid data received from /forum/posts API or content is not an array. Data:', serverPaginatedData);
        return {
          content: [],
          page: params.page || 0,
          size: params.size || 10,
          totalElements: 0,
          totalPages: 0,
        };
      }
      
      const mappedContent = serverPaginatedData.content.map((dto: any) => mapDtoToForumPost(dto));

      return {
        ...serverPaginatedData, 
        content: mappedContent,
      };
    } catch (error: any) {
      console.error('ForumService.getPosts error:', error);
      throw error;
    }
  },

  /**
   * 创建论坛帖子
   * @param postData 帖子数据
   */
  createPost: async (postData: ForumPostCreateRequest): Promise<ForumPost> => {
    const response = await api.post('/api/forum/posts', postData) as any;
    
    // Check if the response is wrapped in ApiResponse
    let createdServerDto: any;
    if (response && typeof response === 'object' && 'success' in response && 'data' in response) {
      // Response is wrapped in ApiResponse
      if (!response.success) {
        throw new Error(response.message || 'API request failed');
      }
      createdServerDto = response.data;
    } else {
      // Response is already unwrapped (by interceptor)
      createdServerDto = response;
    }
    
    return mapDtoToForumPost(createdServerDto);
  },

  /**
   * 获取帖子详情
   * @param id 帖子ID
   */
  getPostById: async (id: number): Promise<ForumPost> => {
    const response = await api.get(`/api/forum/posts/${id}`) as any;
    
    // Check if the response is wrapped in ApiResponse
    let serverDto: any;
    if (response && typeof response === 'object' && 'success' in response && 'data' in response) {
      // Response is wrapped in ApiResponse
      if (!response.success) {
        throw new Error(response.message || 'API request failed');
      }
      serverDto = response.data;
    } else {
      // Response is already unwrapped (by interceptor)
      serverDto = response;
    }
    
    return mapDtoToForumPost(serverDto);
  },

  /**
   * 发表评论
   * @param postId 帖子ID
   * @param commentData 评论数据
   */
  addComment: async (postId: number, commentData: ForumCommentCreateRequest): Promise<ForumComment> => {
    const response = await api.post(`/api/forum/posts/${postId}/comments`, commentData) as any;
    
    // Check if the response is wrapped in ApiResponse
    let createdServerCommentDto: any;
    if (response && typeof response === 'object' && 'success' in response && 'data' in response) {
      // Response is wrapped in ApiResponse
      if (!response.success) {
        throw new Error(response.message || 'API request failed');
      }
      createdServerCommentDto = response.data;
    } else {
      // Response is already unwrapped (by interceptor)
      createdServerCommentDto = response;
    }
    
    return mapCommentDtoToForumComment(createdServerCommentDto);
  },

  /**
   * 点赞帖子
   * @param postId 帖子ID
   */
  likePost: async (postId: number): Promise<ForumPost> => {
    const response = await api.post(`/api/forum/posts/${postId}/toggle-like`) as any;
    
    // Check if the response is wrapped in ApiResponse
    let updatedServerDto: any;
    if (response && typeof response === 'object' && 'success' in response && 'data' in response) {
      // Response is wrapped in ApiResponse
      if (!response.success) {
        throw new Error(response.message || 'API request failed');
      }
      updatedServerDto = response.data;
    } else {
      // Response is already unwrapped (by interceptor)
      updatedServerDto = response;
    }
    
    return mapDtoToForumPost(updatedServerDto);
  },

  /**
   * 删除帖子 (仅管理员)
   * @param postId 帖子ID
   */
  deletePost: async (postId: number): Promise<void> => {
    await api.delete(`/api/forum/posts/${postId}`);
    // 不需要返回值，如果成功，HTTP 状态码会是 204
    // 如果失败，api 拦截器会处理错误
  },

  /**
   * 获取用户发布的帖子
   * @param userId 用户ID
   * @param params 分页参数
   */
  getUserPosts: async (userId: number, params: { page?: number; size?: number } = {}): Promise<PaginatedResponse<ForumPost>> => {
    const { page = 0, size = 10 } = params;
    
    try {
      const response = await api.get(`/api/forum/users/${userId}/posts`, { 
        params: { page, size } 
      }) as any;
      
      let serverPaginatedData: ForumPostPaginatedDto;
      if (response && typeof response === 'object' && 'success' in response && 'data' in response) {
        if (!response.success) {
          throw new Error(response.message || 'API request failed');
        }
        serverPaginatedData = response.data;
      } else {
        serverPaginatedData = response;
      }

      if (typeof serverPaginatedData !== 'object' || 
          serverPaginatedData === null || 
          !Array.isArray(serverPaginatedData.content)) {
        console.error('ForumService.getUserPosts: Invalid data received. Data:', serverPaginatedData);
        return {
          content: [],
          page: params.page || 0,
          size: params.size || 10,
          totalElements: 0,
          totalPages: 0,
        };
      }
      
      const mappedContent = serverPaginatedData.content.map((dto: any) => mapDtoToForumPost(dto));

      return {
        ...serverPaginatedData, 
        content: mappedContent,
      };
    } catch (error: any) {
      console.error('ForumService.getUserPosts error:', error);
      // 如果API不存在，返回空数据而不是抛出错误
      if (error.response?.status === 404) {
        return {
          content: [],
          page: params.page || 0,
          size: params.size || 10,
          totalElements: 0,
          totalPages: 0,
        };
      }
      throw error;
    }
  },

  /**
   * 获取用户发表的评论
   * @param userId 用户ID
   * @param params 分页参数
   */
  getUserComments: async (userId: number, params: { page?: number; size?: number } = {}): Promise<PaginatedResponse<ForumComment & { postTitle?: string }>> => {
    const { page = 0, size = 10 } = params;
    
    try {
      const response = await api.get(`/api/forum/users/${userId}/comments`, { 
        params: { page, size } 
      }) as any;
      
      let serverPaginatedData: any;
      if (response && typeof response === 'object' && 'success' in response && 'data' in response) {
        if (!response.success) {
          throw new Error(response.message || 'API request failed');
        }
        serverPaginatedData = response.data;
      } else {
        serverPaginatedData = response;
      }

      if (typeof serverPaginatedData !== 'object' || 
          serverPaginatedData === null || 
          !Array.isArray(serverPaginatedData.content)) {
        console.error('ForumService.getUserComments: Invalid data received. Data:', serverPaginatedData);
        return {
          content: [],
          page: params.page || 0,
          size: params.size || 10,
          totalElements: 0,
          totalPages: 0,
        };
      }
      
      const mappedContent = serverPaginatedData.content.map((dto: any) => ({
        ...mapCommentDtoToForumComment(dto),
        postTitle: dto.postTitle || '未知帖子'
      }));

      return {
        ...serverPaginatedData, 
        content: mappedContent,
      };
    } catch (error: any) {
      console.error('ForumService.getUserComments error:', error);
      // 如果API不存在，返回空数据而不是抛出错误
      if (error.response?.status === 404) {
        return {
          content: [],
          page: params.page || 0,
          size: params.size || 10,
          totalElements: 0,
          totalPages: 0,
        };
      }
      throw error;
    }
  },

  /**
   * 删除评论
   * @param id 评论ID
   */
  deleteComment: async (id: number): Promise<void> => {
    await api.delete(`/api/forum/comments/${id}`) as any;
  },

  /**
   * 获取社区统计信息
   */
  getCommunityStats: async (): Promise<any> => {
    const response = await api.get('/api/forum/stats') as any;
    
    // Check if the response is wrapped in ApiResponse
    let serverData: any;
    if (response && typeof response === 'object' && 'success' in response && 'data' in response) {
      if (!response.success) {
        throw new Error(response.message || 'API request failed');
      }
      serverData = response.data;
    } else {
      serverData = response;
    }
    
    return serverData;
  },

  /**
   * 获取热门话题
   */
  getHotTopics: async (): Promise<any[]> => {
    const response = await api.get('/api/forum/hot-topics') as any;
    
    // Check if the response is wrapped in ApiResponse
    let serverData: any;
    if (response && typeof response === 'object' && 'success' in response && 'data' in response) {
      if (!response.success) {
        throw new Error(response.message || 'API request failed');
      }
      serverData = response.data;
    } else {
      serverData = response;
    }
    
    return Array.isArray(serverData) ? serverData : [];
  },

  /**
   * 获取活跃用户
   */
  getActiveUsers: async (): Promise<any[]> => {
    const response = await api.get('/api/forum/active-users') as any;
    
    // Check if the response is wrapped in ApiResponse
    let serverData: any;
    if (response && typeof response === 'object' && 'success' in response && 'data' in response) {
      if (!response.success) {
        throw new Error(response.message || 'API request failed');
      }
      serverData = response.data;
    } else {
      serverData = response;
    }
    
    return Array.isArray(serverData) ? serverData : [];
  }
} 