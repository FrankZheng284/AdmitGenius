<template>
  <div class="post-detail-container">
    <!-- 返回按钮 -->
    <div class="back-button">
      <el-button link @click="goBack">
        <el-icon class="mr-1"><ArrowLeft /></el-icon>
        返回论坛
      </el-button>
    </div>

    <el-skeleton :loading="loading" animated v-if="loading">
      <template #template>
        <div class="post-skeleton">
          <div class="skeleton-header">
            <el-skeleton-item variant="circle" style="width: 50px; height: 50px" />
            <div style="flex: 1; margin-left: 16px">
              <el-skeleton-item variant="text" style="width: 25%; margin-right: 10px" />
              <el-skeleton-item variant="text" style="width: 30%" />
            </div>
          </div>
          <el-skeleton-item variant="h1" style="width: 80%; margin: 20px 0" />
          <el-skeleton-item variant="p" style="width: 100%; height: 300px; margin-bottom: 20px" />
          <el-skeleton-item variant="h3" style="width: 30%; margin: 20px 0" />
          <div v-for="n in 3" :key="n" class="comment-skeleton">
            <div class="skeleton-header">
              <el-skeleton-item variant="circle" style="width: 40px; height: 40px" />
              <div style="flex: 1; margin-left: 16px">
                <el-skeleton-item variant="text" style="width: 25%" />
                <el-skeleton-item variant="text" style="width: 20%" />
              </div>
            </div>
            <el-skeleton-item variant="p" style="width: 100%; margin-top: 10px" />
          </div>
        </div>
      </template>
    </el-skeleton>

    <div v-if="!loading && post" class="post-content">
      <el-row :gutter="24">
        <el-col :span="17">
          <!-- 帖子主体 -->
          <el-card class="post-card" :class="{ 'expert-post-card': post.author?.role === 'EXPERT' }">
            <div class="post-header">
              <div class="post-meta">
                <div class="post-author">
                  <el-avatar :size="50" :src="post.author?.profilePicture || post.author?.avatar" :alt="post.author?.fullName" />
                  <div class="author-info">
                    <div class="author-name-section">
                      <span class="author-name" :class="{ 'expert-post-author': post.author?.role === 'EXPERT' }">
                        {{ formatUserName(post.author) }}
                      </span>
                      <el-tag 
                        v-if="post.author?.role === 'EXPERT'" 
                        type="warning" 
                        size="small" 
                        class="expert-post-tag"
                        effect="dark"
                      >
                        <el-icon><Trophy /></el-icon>
                        专家认证
                      </el-tag>
                    </div>
                    <div class="post-time">{{ formatTime(post.createdAt || '') }}</div>
                  </div>
                </div>
                <div class="post-actions">
                  <el-tag size="large" :type="getCategoryTagType(post.category || '') as 'primary' | 'success' | 'warning' | 'info' | 'danger'">
                    {{ getCategoryName(post.category || '') }}
                  </el-tag>
                  <el-button 
                    v-if="canDeletePost" 
                    type="danger" 
                    text 
                    size="small"
                    @click="handleDeletePost"
                    class="delete-btn"
                  >
                    <el-icon><Delete /></el-icon>
                    删除帖子
                  </el-button>
                </div>
              </div>
              <h1 class="post-title">{{ post.title }}</h1>
              <div class="post-tags" v-if="post.tags && post.tags.length">
                <el-tag
                  v-for="tag in post.tags"
                  :key="tag"
                  size="small"
                  effect="plain"
                  class="post-tag"
                >
                  {{ tag }}
                </el-tag>
              </div>
            </div>

            <div class="post-body" v-html="post.content"></div>

            <div class="post-footer">
              <div class="post-stats">
                <div class="stat-item">
                  <el-icon><View /></el-icon>
                  <span>{{ post.views }} 浏览</span>
                </div>
                <div class="stat-item">
                  <el-icon><ChatRound /></el-icon>
                  <span>{{ post.comments?.length || 0 }} 回复</span>
                </div>
              </div>
              <div class="post-actions">
                <el-button 
                  :type="post.likedByCurrentUser ? 'primary' : 'default'" 
                  @click.stop="handleLike"
                >
                  <el-icon><StarFilled v-if="post.likedByCurrentUser" /><Star v-else /></el-icon>
                  {{ post.likedByCurrentUser ? '已赞' : '点赞' }} ({{ post.likes }})
                </el-button>
                <el-button type="primary" @click="scrollToCommentForm">
                  <el-icon><ChatDotRound /></el-icon>
                  回复
                </el-button>
                <el-button 
                  v-if="canDeletePost" 
                  type="danger" 
                  plain 
                  @click="handleDeletePost"
                >
                  <el-icon><Delete /></el-icon>
                  删除
                </el-button>
              </div>
            </div>
          </el-card>

          <!-- 评论区 -->
          <el-card class="comments-card">
            <template #header>
              <div class="card-header">
                <span>评论 ({{ post.comments?.length || 0 }})</span>
              </div>
            </template>

            <div v-if="post.comments && post.comments.length > 0" class="comments-list">
              <div v-for="comment in post.comments" :key="comment.id" 
                   class="comment-item"
                   :class="{ 'expert-comment': comment.author?.role === 'EXPERT' }">
                <div class="comment-author">
                  <el-avatar :size="40" :src="comment.author?.profilePicture" :alt="formatUserName(comment.author)" />
                  <div class="author-info">
                    <div class="author-name-section">
                      <span class="author-name" :class="{ 'expert-comment-author': comment.author?.role === 'EXPERT' }">
                        {{ formatUserName(comment.author) }}
                      </span>
                      <el-tag 
                        v-if="comment.author?.role === 'EXPERT'" 
                        type="warning" 
                        size="small" 
                        class="expert-comment-tag"
                        effect="dark"
                      >
                        <el-icon><Medal /></el-icon>
                        专家
                      </el-tag>
                    </div>
                    <div class="comment-time">{{ formatTime(comment.createdAt || new Date().toISOString()) }}</div>
                  </div>
                </div>
                <div class="comment-content" :class="{ 'expert-comment-content': comment.author?.role === 'EXPERT' }">
                  {{ comment.content }}
                </div>
                <div class="comment-actions">
                  <el-button text size="small" @click="replyToComment(comment)">
                    <el-icon><ChatLineRound /></el-icon>
                    回复
                  </el-button>
                </div>
              </div>
            </div>

            <el-empty 
              v-else 
              description="暂无评论，来发表第一条评论吧!"
            />

            <div class="comment-form" ref="commentFormRef">
              <h3 class="form-title">发表评论</h3>
              <div v-if="replyTo" class="reply-to">
                回复: <span class="reply-name">{{ formatUserName(replyTo.author) }}</span>
                <el-button text type="info" size="small" @click="cancelReply">取消回复</el-button>
              </div>
              <el-form :model="commentForm" :rules="commentRules" ref="formRef">
                <el-form-item prop="content">
                  <el-input
                    v-model="commentForm.content"
                    type="textarea"
                    :rows="4"
                    placeholder="写下你的评论..."
                    resize="none"
                  />
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" @click="submitComment" :loading="submitting">
                    发表评论
                  </el-button>
                </el-form-item>
              </el-form>
            </div>
          </el-card>
        </el-col>

        <el-col :span="7">
          <!-- 作者信息 -->
          <el-card class="author-card">
            <template #header>
              <div class="card-header">
                <span>关于作者</span>
              </div>
            </template>
            <div class="author-profile">
              <el-avatar :size="80" :src="post.author?.profilePicture" :alt="formatUserName(post.author)" />
              <h3 class="profile-name">{{ formatUserName(post.author) }}</h3>
              <p class="profile-description">{{ post.author?.bio || '这个用户很懒，还没有填写个人简介~' }}</p>
              <div class="profile-stats">
                <div class="stat-item">
                  <div class="stat-value">{{ post.author?.postsCount || 0 }}</div>
                  <div class="stat-label">发帖数</div>
                </div>
                <div class="stat-item">
                  <div class="stat-value">{{ post.author?.likesReceived || 0 }}</div>
                  <div class="stat-label">获赞数</div>
                </div>
              </div>
              <el-button type="primary" plain @click="navigateToUserProfile(post.author?.id || 0)">
                查看主页
              </el-button>
            </div>
          </el-card>

          <!-- 相关帖子 -->
          <!-- <el-card class="related-posts-card">
            <template #header>
              <div class="card-header">
                <span>相关帖子</span>
              </div>
            </template>
            <div class="related-posts" v-if="relatedPosts.length > 0">
              <div v-for="rPost in relatedPosts" :key="rPost.id" class="related-post-item" @click="navigateToPost(rPost.id)">
                <div class="related-post-title">{{ rPost.title }}</div>
                <div class="related-post-meta">
                  <span class="post-author">{{ rPost.author?.fullName }}</span>
                  <span class="post-stats">{{ rPost.views }}浏览 · {{ rPost.likes }}赞</span>
                </div>
              </div>
            </div>
            <el-empty v-else description="暂无相关帖子" />
          </el-card> -->

          <!-- 热门话题 -->
          <el-card class="hot-topics-card">
            <template #header>
              <div class="card-header">
                <span>热门话题</span>
              </div>
            </template>
            <div class="hot-topics">
              <el-tag
                v-for="tag in hotTopics"
                :key="tag.id"
                @click="navigateToTopicPage(tag.name)"
                class="topic-tag"
                effect="plain"
              >
                {{ tag.name }} ({{ tag.count }})
              </el-tag>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <el-empty
      v-if="!loading && !post"
      description="未找到该帖子或已被删除"
    >
      <el-button type="primary" @click="goBack">返回论坛</el-button>
    </el-empty>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, nextTick, reactive } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage, ElMessageBox, FormInstance, FormRules } from 'element-plus';
import { 
  ArrowLeft, View, ChatRound, Star, StarFilled, ChatDotRound, 
  ChatLineRound, Delete, Medal, Trophy 
} from '@element-plus/icons-vue';
import { ForumService } from '@/api/services/forum';
import { useAuthStore } from '@/stores/auth';
import { useMockAuthStore } from '@/stores/mockAuth';
import { config } from '@/config';
import type { ForumPost, ForumComment, ForumCategory } from '@/types';

const route = useRoute();
const router = useRouter();
const loading = ref(true);
const post = ref<ForumPost | null>(null);
// const relatedPosts = ref<ForumPost[]>([]);
const submitting = ref(false);
const formRef = ref<FormInstance>();
const commentFormRef = ref<HTMLElement>();
const replyTo = ref<ForumComment | null>(null);

// 获取认证store
const authStore = useAuthStore();
const mockAuthStore = useMockAuthStore();
const store = computed(() => {
  return config.api.useMockData ? mockAuthStore : authStore;
});

// 检查当前用户是否可以删除帖子
const canDeletePost = computed(() => {
  if (!post.value || !store.value.user) return false;
  
  const currentUser = store.value.user;
  const postAuthor = post.value.author;
  
  // 管理员可以删除所有帖子
  if (currentUser.role === 'ADMIN') return true;
  
  // 帖子作者可以删除自己的帖子
  if (postAuthor && currentUser.id === postAuthor.id) return true;
  
  return false;
});

// 热门话题数据（从API获取）
const hotTopics = ref<Array<{id: number, name: string, count: number}>>([]);

// 评论表单数据
const commentForm = ref({
  content: '',
  parentId: null as number | null
});

// 表单验证规则
const commentRules = reactive<FormRules>({
  content: [
    { required: true, message: '请输入评论内容', trigger: 'blur' },
    { min: 3, max: 500, message: '评论长度应在3到500个字符之间', trigger: 'blur' }
  ]
});

// 分类标签类型映射
const getCategoryTagType = (category: string): string => {
  const typeMap: Record<string, string> = {
    experience: 'success',
    schools: 'primary',
    exams: 'warning',
    visa: 'info',
    life: 'danger',
    all: 'info'
  };
  return typeMap[category] || 'info';
};

// 获取分类名称
const getCategoryName = (category: string): string => {
  const nameMap: Record<string, string> = {
    experience: '申请经验',
    schools: '院校讨论',
    exams: '考试准备',
    visa: '签证问题',
    life: '生活交流',
    all: '全部'
  };
  return nameMap[category] || '其他';
};

// 格式化时间
const formatTime = (timestamp: string | number | Date): string => {
  if (!timestamp) return '刚刚';
  const date = new Date(timestamp);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diff < 60) {
    return `${diff}秒前`;
  } else if (diff < 3600) {
    return `${Math.floor(diff / 60)}分钟前`;
  } else if (diff < 86400) {
    return `${Math.floor(diff / 3600)}小时前`;
  } else if (diff < 604800) {
    return `${Math.floor(diff / 86400)}天前`;
  } else {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }
};

// 格式化用户显示名称
const formatUserName = (author: any) => {
  if (!author) return '未知用户';
  
  if (author.fullName && author.fullName.trim()) {
    return author.fullName;
  } else if (author.email) {
    // 从邮箱中提取用户名作为显示名
    return author.email.split('@')[0];
  } else {
    return `用户 ${author.id || ''}`;
  }
};

// 获取帖子详情
const fetchPostDetail = async () => {
  const postId = parseInt(route.params.id as string, 10);
  if (isNaN(postId)) {
    loading.value = false;
    ElMessage.error('无效的帖子ID');
    return;
  }

  try {
    loading.value = true;
    const response = await ForumService.getPostById(postId);
    // ForumService.getPostById 现在直接返回 ForumPost
    post.value = response;
    // fetchRelatedPosts();
  } catch (error) {
    console.error('Failed to fetch post details:', error);
    ElMessage.error('获取帖子详情失败');
  } finally {
    loading.value = false;
  }
};

// 获取热门话题
const fetchHotTopics = async () => {
  try {
    const topics = await ForumService.getHotTopics();
    hotTopics.value = topics;
  } catch (error: any) {
    console.error('Failed to fetch hot topics:', error);
    // 如果获取失败，可以使用默认数据或者不显示
  }
};

// 获取相关帖子
// const fetchRelatedPosts = async () => {
//   if (!post.value) return;
  
//   try {
//     // 这里应该是调用获取相关帖子的API，现在用模拟数据代替
//     // relatedPosts.value = [
//     //   {
//     //     id: 101,
//     //     title: '分享我的CS申请经验和timeline',
//     //     content: '',
//     //     userId: 1,
//     //     author: { id: 1, fullName: '申请达人', profilePicture: '', email: '' },
//     //     views: 324,
//     //     likes: 42
//     //   } as ForumPost,
//     //   {
//     //     id: 102,
//     //     title: '如何准备托福写作，我的提分经验',
//     //     content: '',
//     //     userId: 2,
//     //     author: { id: 2, fullName: '留学顾问', profilePicture: '', email: '' },
//     //     views: 256,
//     //     likes: 38
//     //   } as ForumPost,
//     //   {
//     //     id: 103,
//     //     title: '美国大学申请文书经验总结',
//     //     content: '',
//     //     userId: 3,
//     //     author: { id: 3, fullName: '美研新手', profilePicture: '', email: '' },
//     //     views: 198,
//     //     likes: 25
//     //   } as ForumPost
//     // ];
//   } catch (error) {
//     console.error('Failed to fetch related posts:', error);
//   }
// };

// 处理点赞
const handleLike = async () => {
  if (!post.value) return;
  
  try {
    const response = await ForumService.likePost(post.value.id);
    // ForumService.likePost 现在直接返回更新后的 ForumPost
    post.value.likedByCurrentUser = response.likedByCurrentUser;
    post.value.likes = response.likes;
    ElMessage.success(response.likedByCurrentUser ? '点赞成功' : '已取消点赞');
  } catch (error) {
    console.error('Failed to like post:', error);
    ElMessage.error('操作失败，请稍后重试');
  }
};

// 删除帖子
const handleDeletePost = async () => {
  if (!post.value) return;
  
  try {
    await ElMessageBox.confirm(
      '删除后无法恢复，确定要删除这篇帖子吗？',
      '确认删除',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning',
        confirmButtonClass: 'el-button--danger'
      }
    );
    
    await ForumService.deletePost(post.value.id);
    ElMessage.success('帖子删除成功');
    // 删除成功后跳转回论坛列表
    router.push('/forum');
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Failed to delete post:', error);
      ElMessage.error('删除失败，请稍后重试');
    }
  }
};

// 回复评论
const replyToComment = (comment: ForumComment) => {
  replyTo.value = comment;
  commentForm.value.parentId = comment.id;
  
  // 滚动到评论框
  scrollToCommentForm();
};

// 取消回复
const cancelReply = () => {
  replyTo.value = null;
  commentForm.value.parentId = null;
};

// 滚动到评论框
const scrollToCommentForm = () => {
  nextTick(() => {
    commentFormRef.value?.scrollIntoView({ behavior: 'smooth' });
  });
};

// 提交评论
const submitComment = async () => {
  if (!formRef.value) return;
  
  await formRef.value.validate(async (valid) => {
    if (valid && post.value) {
      try {
        submitting.value = true;
        const commentData = {
          content: commentForm.value.content,
          parentId: commentForm.value.parentId
        };
        
        const response = await ForumService.addComment(post.value.id, commentData);
        // ForumService.addComment 现在直接返回 ForumComment
        if (!post.value.comments) {
          post.value.comments = [];
        }
        post.value.comments.push(response);
        
        // 重置表单
        commentForm.value.content = '';
        cancelReply();
        
        ElMessage.success('评论发表成功');
      } catch (error) {
        console.error('Failed to submit comment:', error);
        ElMessage.error('评论发表失败，请稍后重试');
      } finally {
        submitting.value = false;
      }
    }
  });
};

// 导航到用户主页
const navigateToUserProfile = (userId: number) => {
  router.push(`/user/${userId}`);
};

// 导航到帖子详情
const navigateToPost = (postId: number) => {
  if (postId !== parseInt(route.params.id as string, 10)) {
    router.push(`/forum/post/${postId}`);
  }
};

// 导航到话题页面
const navigateToTopicPage = (topic: string) => {
  router.push({
    path: '/forum',
    query: { topic }
  });
};

// 返回论坛
const goBack = () => {
  router.push('/forum');
};

onMounted(() => {
  fetchPostDetail();
  fetchHotTopics();
});
</script>

<style scoped lang="scss">
.post-detail-container {
  padding-bottom: 40px;
}

.back-button {
  margin-bottom: 16px;
}

.post-skeleton {
  margin-bottom: 24px;
  
  .skeleton-header {
    display: flex;
    align-items: center;
    margin-bottom: 16px;
  }
  
  .comment-skeleton {
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px solid #ebeef5;
    
    .skeleton-header {
      margin-bottom: 10px;
    }
  }
}

.post-card {
  margin-bottom: 24px;
  
  &.expert-post-card {
    background: linear-gradient(135deg, #fff7e6 0%, #fff1f0 100%);
    border: 2px solid #faad14;
    box-shadow: 0 4px 12px rgba(250, 173, 20, 0.2);
    position: relative;
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, #faad14, #ff7875, #faad14);
      border-radius: 8px 8px 0 0;
    }
  }

  .post-header {
    .post-meta {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 20px;

      .post-author {
        display: flex;
        align-items: center;

        .author-info {
          margin-left: 16px;
          
          .author-name-section {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 8px;
          }

          .author-name {
            font-size: 16px;
            font-weight: 600;
            color: #303133;
            
            &.expert-post-author {
              font-weight: 700;
              color: #fa8c16;
              text-shadow: 0 1px 2px rgba(250, 140, 22, 0.1);
            }
          }

          .post-time {
            font-size: 14px;
            color: #909399;
          }
        }
      }
    }
  }
  
  .post-body {
    font-size: 16px;
    line-height: 1.8;
    color: #303133;
    margin-bottom: 24px;
    
    p {
      margin-bottom: 16px;
    }
    
    img {
      max-width: 100%;
      margin: 16px 0;
    }
  }
  
  .post-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 20px;
    border-top: 1px solid #ebeef5;
    
    .post-stats {
      display: flex;
      gap: 16px;
      
      .stat-item {
        display: flex;
        align-items: center;
        gap: 4px;
        color: #909399;
        font-size: 14px;
      }
    }
    
    .post-actions {
      display: flex;
      gap: 12px;
    }
  }
}

.comments-card {
  .card-header {
    font-size: 18px;
    font-weight: 600;
    color: #303133;
  }
  
  .comments-list {
    margin-bottom: 32px;
  }
  
  .comment-item {
    border-bottom: 1px solid #ebeef5;
    padding: 20px 0;

    &:last-child {
      border-bottom: none;
    }
    
    &.expert-comment {
      background: linear-gradient(135deg, #fff8e1 0%, #fff3e0 50%, #ffecdf 100%);
      border: 2px solid #ff9800;
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 20px;
      position: relative;
      box-shadow: 0 4px 12px rgba(255, 152, 0, 0.15);
      
      &::before {
        content: '★';
        position: absolute;
        left: 12px;
        top: 12px;
        color: #ff9800;
        font-size: 16px;
        font-weight: bold;
        animation: sparkle 2s ease-in-out infinite;
      }
      
      &::after {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 6px;
        background: linear-gradient(180deg, #ff9800, #f57c00, #e65100);
        border-radius: 6px 0 0 6px;
        box-shadow: 0 0 10px rgba(255, 152, 0, 0.3);
      }
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(255, 152, 0, 0.25);
        transition: all 0.3s ease;
      }
    }

    .comment-author {
      display: flex;
      align-items: center;
      margin-bottom: 12px;

      .author-info {
        margin-left: 12px;
        flex: 1;

        .author-name-section {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 4px;
        }

        .author-name {
          font-size: 14px;
          font-weight: 500;
          color: #303133;
          
          &.expert-comment-author {
            font-weight: 800;
            color: #e65100;
            text-shadow: 0 1px 3px rgba(230, 81, 0, 0.2);
            font-size: 15px;
          }
        }

        .comment-time {
          font-size: 12px;
          color: #909399;
        }
      }
    }

    .comment-content {
      color: #606266;
      line-height: 1.6;
      margin-bottom: 12px;
      padding-left: 52px;
      
      &.expert-comment-content {
        color: #1a1a1a;
        font-weight: 600;
        background: linear-gradient(135deg, rgba(255, 152, 0, 0.1), rgba(255, 193, 7, 0.1));
        padding: 16px 20px;
        border-radius: 8px;
        border-left: 4px solid #ff9800;
        margin-left: 0;
        padding-left: 20px;
        box-shadow: inset 0 1px 3px rgba(255, 152, 0, 0.1);
        border: 1px solid rgba(255, 152, 0, 0.2);
      }
    }

    .comment-actions {
      padding-left: 52px;
      
      .expert-comment & {
        padding-left: 0;
      }
    }
  }
  
  .expert-comment-tag {
    background: linear-gradient(135deg, #ff9800, #f57c00);
    border: none;
    color: white;
    font-weight: 700;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
    box-shadow: 0 2px 6px rgba(255, 152, 0, 0.3);
    
    .el-icon {
      font-size: 12px;
      filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.3));
    }
  }
}

.author-card, .related-posts-card, .hot-topics-card {
  margin-bottom: 24px;
  
  .card-header {
    font-size: 18px;
    font-weight: 600;
    color: #303133;
  }
}

.author-card {
  .author-profile {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    
    .el-avatar {
      margin-bottom: 16px;
    }
    
    .profile-name {
      font-size: 18px;
      font-weight: 600;
      color: #303133;
      margin: 0 0 8px 0;
    }
    
    .profile-description {
      color: #606266;
      font-size: 14px;
      line-height: 1.6;
      margin-bottom: 16px;
    }
    
    .profile-stats {
      display: flex;
      width: 100%;
      margin-bottom: 16px;
      
      .stat-item {
        flex: 1;
        text-align: center;
        
        .stat-value {
          font-size: 20px;
          font-weight: 600;
          color: #409EFF;
        }
        
        .stat-label {
          font-size: 14px;
          color: #606266;
        }
      }
    }
  }
}

.related-posts-card {
  .related-post-item {
    padding: 12px 0;
    border-bottom: 1px solid #ebeef5;
    cursor: pointer;
    
    &:last-child {
      border-bottom: none;
    }
    
    &:hover {
      background-color: #f5f7fa;
    }
    
    .related-post-title {
      font-size: 15px;
      font-weight: 500;
      color: #303133;
      margin-bottom: 8px;
      line-height: 1.4;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }
    
    .related-post-meta {
      display: flex;
      justify-content: space-between;
      font-size: 13px;
      color: #909399;
      
      .post-author {
        font-weight: 500;
      }
    }
  }
}

.hot-topics-card {
  .hot-topics {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    
    .topic-tag {
      cursor: pointer;
      margin-bottom: 8px;
    }
  }
}

@media (max-width: 992px) {
  .post-card .post-header .post-meta {
    flex-direction: column;
    align-items: flex-start;
    
    .post-author {
      margin-bottom: 16px;
    }
  }
}

@media (max-width: 768px) {
  .post-card .post-footer {
    flex-direction: column;
    gap: 16px;
    
    .post-stats {
      margin-bottom: 8px;
    }
  }
}

.expert-post-tag {
  background: linear-gradient(135deg, #faad14, #fa8c16);
  border: none;
  color: white;
  font-weight: 600;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  
  .el-icon {
    font-size: 12px;
    filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.2));
  }
}

// 星星闪烁动画
@keyframes sparkle {
  0%, 100% {
    opacity: 0.7;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.2);
  }
}
</style> 