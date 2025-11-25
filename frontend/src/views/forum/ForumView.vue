<template>
  <div class="forum-container">
    <el-row :gutter="24">
      <el-col :span="16">
        <!-- 论坛头部区域 -->
        <div class="forum-header">
          <h1 class="forum-title">申请交流论坛</h1>
          <p class="forum-description">分享你的申请经验、提问、讨论留学相关话题</p>
          <div class="forum-actions">
            <el-input
              v-model="searchQuery"
              placeholder="搜索帖子..."
              class="search-input"
              @keyup.enter="searchPosts"
              clearable
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
              <template #append>
                <el-button @click="searchPosts" :icon="Search" />
              </template>
            </el-input>
            <el-button type="primary" @click="openNewPostDialog">
              <el-icon><Plus /></el-icon>
              发布新帖
            </el-button>
          </div>
        </div>

        <!-- 论坛分类选项卡 -->
        <el-card class="forum-card">
          <el-tabs v-model="activeTab" @tab-click="handleTabClick">
            <el-tab-pane label="全部帖子" name="all"></el-tab-pane>
            <el-tab-pane label="申请经验" name="experience"></el-tab-pane>
            <el-tab-pane label="院校讨论" name="schools"></el-tab-pane>
            <el-tab-pane label="考试准备" name="exams"></el-tab-pane>
            <el-tab-pane label="签证问题" name="visa"></el-tab-pane>
            <el-tab-pane label="生活交流" name="life"></el-tab-pane>
          </el-tabs>

          <!-- 论坛排序选项 -->
          <div class="forum-sort">
            <span class="sort-label">排序: </span>
            <el-radio-group v-model="sortOption" size="small" @change="sortPosts">
              <el-radio-button value="latest">最新</el-radio-button>
              <el-radio-button value="popular">热门</el-radio-button>
              <el-radio-button value="replies">回复最多</el-radio-button>
            </el-radio-group>
          </div>

          <!-- 帖子列表 -->
          <el-skeleton :loading="loading" animated v-if="loading">
            <template #template>
              <div v-for="n in 5" :key="n" class="post-skeleton">
                <div class="skeleton-header">
                  <el-skeleton-item variant="circle" style="width: 40px; height: 40px" />
                  <div style="flex: 1; margin-left: 16px">
                    <el-skeleton-item variant="text" style="width: 25%; margin-right: 10px" />
                    <el-skeleton-item variant="text" style="width: 30%" />
                  </div>
                </div>
                <el-skeleton-item variant="h3" style="width: 50%; margin: 16px 0 8px 0" />
                <el-skeleton-item variant="text" style="width: 100%" />
                <el-skeleton-item variant="text" style="width: 80%" />
                <div class="skeleton-footer">
                  <el-skeleton-item variant="text" style="width: 15%" />
                  <el-skeleton-item variant="text" style="width: 15%" />
                  <el-skeleton-item variant="text" style="width: 15%" />
                </div>
              </div>
            </template>
          </el-skeleton>

          <div v-if="!loading" class="forum-posts">
            <div
              v-for="post in posts"
              :key="post.id"
              class="post-item"
              :class="{ 'expert-post': post.isExpertPost }"
              @click="navigateToPost(post.id)"
            >
              <div class="post-header">
                <div class="post-author">
                  <el-avatar 
                    :src="getUserAvatar(post.author)" 
                    :alt="formatUserName(post.author)" 
                  />
                  <div class="author-info">
                    <div class="author-name-row">
                      <span class="author-name" :class="{ 'expert-author': post.isExpertPost }">
                        {{ formatUserName(post.author) }}
                      </span>
                      <el-tag 
                        v-if="post.isExpertPost" 
                        type="warning" 
                        size="small" 
                        class="expert-tag"
                        effect="dark"
                      >
                        <el-icon><Star /></el-icon>
                        专家认证
                      </el-tag>
                      <el-tag 
                        v-if="post.isExpertPost && post.expertTag" 
                        type="danger" 
                        size="small" 
                        class="expert-field-tag"
                        effect="plain"
                      >
                        {{ post.expertTag }}
                      </el-tag>
                    </div>
                    <span class="post-time">{{ formatTime(post.createdAt || '') }}</span>
                  </div>
                </div>
                <div class="post-category">
                  <el-tag size="small" :type="getCategoryTagType(post.category || '') as any">
                    {{ getCategoryName(post.category || '') }}
                  </el-tag>
                </div>
              </div>

              <h2 class="post-title" :class="{ 'expert-title': post.isExpertPost }">
                <el-icon v-if="post.isExpertPost" class="expert-title-icon"><Trophy /></el-icon>
                {{ post.title }}
              </h2>
              <p class="post-excerpt">{{ post.excerpt }}</p>

              <div class="post-footer">
                <div class="post-stats">
                  <div class="stat-item">
                    <el-icon><View /></el-icon>
                    <span>{{ post.views || 0 }} 浏览</span>
                  </div>
                  <div class="stat-item">
                    <el-icon><ChatRound /></el-icon>
                    <span>{{ post.commentCount || 0 }} 回复</span>
                  </div>
                  <div class="stat-item">
                    <el-icon><StarFilled v-if="post.likedByCurrentUser" /><Star v-else /></el-icon>
                    <span>{{ post.likes || 0 }} 赞</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 分页器 -->
            <div class="pagination-container">
              <el-pagination
                v-model:current-page="currentPage"
                v-model:page-size="pageSize"
                :page-sizes="[10, 20, 30, 50]"
                layout="total, sizes, prev, pager, next, jumper"
                :total="totalPosts"
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
              />
            </div>
          </div>

          <el-empty
            v-if="!loading && posts.length === 0"
            description="暂无相关帖子"
          >
            <el-button type="primary" @click="openNewPostDialog">发表第一篇帖子</el-button>
          </el-empty>
        </el-card>
      </el-col>

      <el-col :span="8">
        <!-- 侧边栏卡片 -->
        <el-card class="sidebar-card community-card">
          <template #header>
            <div class="card-header">
              <span>社区信息</span>
            </div>
          </template>
          <div class="community-stats">
            <div class="stat-item">
              <div class="stat-value">{{ communityStats.members }}</div>
              <div class="stat-label">社区成员</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ communityStats.posts }}</div>
              <div class="stat-label">总帖子数</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ communityStats.activeUsers }}</div>
              <div class="stat-label">今日活跃</div>
            </div>
          </div>
        </el-card>

        <!-- 热门话题卡片 -->
        <el-card class="sidebar-card hot-topics-card">
          <template #header>
            <div class="card-header">
              <span>热门话题</span>
            </div>
          </template>
          <div class="hot-topics">
            <div
              v-for="topic in hotTopics"
              :key="topic.id"
              class="hot-topic-item"
              @click="setActiveTag(topic.name)"
            >
              <el-icon><Promotion /></el-icon>
              <span class="topic-name">{{ topic.name }}</span>
              <span class="topic-count">{{ topic.count }}</span>
            </div>
          </div>
        </el-card>

        <!-- 活跃用户卡片 -->
        <el-card class="sidebar-card active-users-card">
          <template #header>
            <div class="card-header">
              <span>活跃用户</span>
            </div>
          </template>
          <div class="active-users">
            <div
              v-for="user in activeUsers"
              :key="user.id"
              class="active-user-item"
              @click="navigateToUserProfile(user.id)"
            >
              <el-avatar :src="user.avatar" :alt="user.name" />
              <div class="user-info">
                <span class="user-name">{{ user.name }}</span>
                <span class="user-contribution">发布 {{ user.posts }} 帖子</span>
              </div>
            </div>
          </div>
        </el-card>

        <!-- 社区规则卡片 -->
        <el-card class="sidebar-card rules-card">
          <template #header>
            <div class="card-header">
              <span>社区规则</span>
            </div>
          </template>
          <ul class="rules-list">
            <li>尊重每一位社区成员，禁止人身攻击</li>
            <li>分享内容须遵守相关法律法规</li>
            <li>帖子内容应当与留学申请相关</li>
            <li>禁止发布广告、垃圾信息</li>
            <li>违反规则的内容将被删除</li>
          </ul>
        </el-card>
      </el-col>
    </el-row>

    <!-- 发布新帖对话框 -->
    <el-dialog
      v-model="dialogVisible"
      title="发布新帖"
      width="50%"
      :before-close="handleDialogClose"
    >
      <el-form :model="newPost" label-position="top" :rules="postRules" ref="postFormRef">
        <el-form-item label="标题" prop="title">
          <el-input v-model="newPost.title" placeholder="请输入帖子标题" />
        </el-form-item>
        <el-form-item label="分类" prop="category">
          <el-select 
            v-model="newPost.category" 
            placeholder="请选择帖子分类" 
            style="width: 100%"
            clearable
            :validate-event="true"
          >
            <el-option label="申请经验" value="experience" />
            <el-option label="院校讨论" value="schools" />
            <el-option label="考试准备" value="exams" />
            <el-option label="签证问题" value="visa" />
            <el-option label="生活交流" value="life" />
          </el-select>
        </el-form-item>
        <el-form-item label="内容" prop="content">
          <el-input
            v-model="newPost.content"
            type="textarea"
            :rows="8"
            placeholder="请输入帖子内容..."
          />
        </el-form-item>
        
        <!-- 专家帖子选项 -->
        <el-form-item v-if="isExpert" label="专家帖子" class="expert-post-form-item">
          <el-checkbox v-model="newPost.isExpertPost" size="large">
            发布为专家帖子（将显示专家标识）
          </el-checkbox>
          <div class="expert-post-hint">
            专家帖子将获得更高的曝光度，并显示您的专业认证标识
          </div>
        </el-form-item>
        
        <!-- 专家标签输入（仅在选择专家帖子时显示） -->
        <el-form-item v-if="isExpert && newPost.isExpertPost" label="专家标签" class="expert-tag-form-item">
          <el-input
            v-model="newPost.expertTag"
            placeholder="请输入专家标签（如：商科申请、理工科申请等）"
            maxlength="20"
            show-word-limit
            clearable
          >
            <template #prefix>
              <el-icon><Star /></el-icon>
            </template>
          </el-input>
          <div class="expert-tag-hint">
            专家标签将显示在您的帖子上，帮助用户识别您的专业领域
          </div>
        </el-form-item>
        
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitPost" :loading="submitting">
            发布
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { Search, Plus, View, ChatRound, Star, StarFilled, Promotion, Trophy } from '@element-plus/icons-vue';
import type { TabsPaneContext, FormInstance, FormRules } from 'element-plus';
import { ForumService } from '@/api/services/forum';
import type { ForumPost, ForumCategory, User } from '@/types';
import { UserRole } from '@/types';
import { ElMessage } from 'element-plus';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const authStore = useAuthStore();

// 计算属性
const isExpert = computed(() => authStore.isExpert);

const loading = ref(true);
const activeTab = ref('all');
const sortOption = ref('latest');
const posts = ref<ForumPost[]>([]);
const currentPage = ref(1);
const pageSize = ref(10);
const totalPosts = ref(0);
const searchQuery = ref('');
const dialogVisible = ref(false);
const submitting = ref(false);
const postFormRef = ref<FormInstance>();

// 新帖表单数据
const newPost = reactive({
  title: '',
  category: '',
  content: '',
  isExpertPost: false,
  expertTag: ''
});

// 表单验证规则
const postRules = reactive<FormRules>({
  title: [
    { required: true, message: '请输入帖子标题', trigger: 'blur' },
    { min: 5, max: 100, message: '标题长度应在5到100个字符之间', trigger: 'blur' }
  ],
  category: [
    { required: true, message: '请选择帖子分类', trigger: 'change' }
  ],
  content: [
    { required: true, message: '请输入帖子内容', trigger: 'blur' },
    { min: 10, message: '内容不能少于10个字符', trigger: 'blur' }
  ]
});

// 社区统计数据
const communityStats = reactive({
  members: 0,
  posts: 0,
  activeUsers: 0
});

// 热门话题
const hotTopics = ref<Array<{id: number, name: string, count: number}>>([]);

// 活跃用户
const activeUsers = ref<Array<{id: number, name: string, avatar: string, posts: number}>>([]);

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

// 获取帖子列表
const fetchPosts = async () => {
  try {
    loading.value = true;
    const response = await ForumService.getPosts({
      page: currentPage.value - 1, // 后端通常从0开始
      size: pageSize.value,
      category: activeTab.value === 'all' ? undefined : activeTab.value,
      sort: sortOption.value,
      keyword: searchQuery.value
    });
    
    // ForumService.getPosts 现在直接返回 PaginatedResponse<ForumPost>
    posts.value = response.content.map((post: ForumPost) => {
      // 确保作者信息完整
      const author = post.author || {
        id: post.userId || 0,
        fullName: '未知用户',
        email: '',
        profilePicture: '/default-avatar.png',
        role: UserRole.USER
      };
      
      return {
        ...post,
        author,
        likedByCurrentUser: !!post.likedByCurrentUser,
        views: post.views || 0,
        commentCount: post.commentCount || 0,
        likes: post.likes || 0,
        excerpt: post.excerpt || (post.content?.substring(0, 150) + '...' || ''),
        createdAt: post.createdAt || new Date().toISOString(),
        category: post.category || 'experience'
      };
    });

    console.log('Processed posts:', posts.value);
    totalPosts.value = response.totalElements || 0;
    currentPage.value = response.page + 1; // 前端显示从1开始
    pageSize.value = response.size || 10;
  } catch (error: any) {
    console.error('Failed to fetch forum posts:', error);
    posts.value = [];
    totalPosts.value = 0;
    ElMessage.error(error.response?.data?.message || '获取帖子列表失败');
  } finally {
    loading.value = false;
  }
};

// 搜索帖子
const searchPosts = () => {
  currentPage.value = 1;
  fetchPosts();
};

// 排序帖子
const sortPosts = () => {
  fetchPosts();
};

// 处理标签点击
const handleTabClick = (tab: TabsPaneContext) => {
  currentPage.value = 1;
  fetchPosts();
};

// 处理分页大小改变
const handleSizeChange = (size: number) => {
  pageSize.value = size;
  fetchPosts();
};

// 处理页码改变
const handleCurrentChange = (page: number) => {
  currentPage.value = page;
  fetchPosts();
};

// 导航到帖子详情页
const navigateToPost = (postId: number) => {
  router.push(`/forum/post/${postId}`);
};

// 导航到用户主页
const navigateToUserProfile = (userId: number) => {
  router.push(`/user/${userId}`);
};

// 设置活跃标签
const setActiveTag = (tagName: string) => {
  searchQuery.value = tagName;
  searchPosts();
};

// 打开新帖对话框
const openNewPostDialog = () => {
  dialogVisible.value = true;
};

// 关闭对话框
const handleDialogClose = (done: () => void) => {
  done();
};

// 提交新帖
const submitPost = async () => {
  if (!postFormRef.value) return;
  
  try {
    await postFormRef.value.validate();
    submitting.value = true;
    
    // 确保所有必填字段都有值
    if (!newPost.title || !newPost.category || !newPost.content) {
      ElMessage.error('请填写所有必填字段');
      return;
    }

    console.log('Submitting post:', newPost);

    const response = await ForumService.createPost({
      title: newPost.title.trim(),
      content: newPost.content.trim(),
      category: newPost.category,
      isExpertPost: newPost.isExpertPost,
      expertTag: newPost.expertTag
    });

    // ForumService.createPost直接返回ForumPost，不是ApiResponse
    ElMessage.success('发布成功');
    dialogVisible.value = false;
    // 重置表单
    newPost.title = '';
    newPost.category = '';
    newPost.content = '';
    newPost.isExpertPost = false;
    newPost.expertTag = '';
    // 重新获取帖子列表
    await fetchPosts();
  } catch (error: any) {
    console.error('Failed to create post:', error);
    ElMessage.error(error.response?.data?.message || '发布失败，请重试');
  } finally {
    submitting.value = false;
  }
};

// 格式化用户显示名称
const formatUserName = (author: any) => {
  if (!author) return '未知用户';
  
  if (author.fullName && author.fullName.trim()) {
    return author.fullName
  } else if (author.email) {
    // 从邮箱中提取用户名作为显示名
    return author.email.split('@')[0]
  } else {
    return `用户 ${author.id || ''}`
  }
};

// 获取用户头像
const getUserAvatar = (author: any) => {
  if (!author) return '/default-avatar.png';
  return author.profilePicture || '/default-avatar.png';
};

// 获取社区统计数据
const fetchCommunityStats = async () => {
  try {
    const stats = await ForumService.getCommunityStats();
    Object.assign(communityStats, stats);
  } catch (error: any) {
    console.error('Failed to fetch community stats:', error);
    ElMessage.error('获取社区统计数据失败');
  }
};

// 获取热门话题
const fetchHotTopics = async () => {
  try {
    const topics = await ForumService.getHotTopics();
    hotTopics.value = topics;
  } catch (error: any) {
    console.error('Failed to fetch hot topics:', error);
    ElMessage.error('获取热门话题失败');
  }
};

// 获取活跃用户
const fetchActiveUsers = async () => {
  try {
    const users = await ForumService.getActiveUsers();
    activeUsers.value = users;
  } catch (error: any) {
    console.error('Failed to fetch active users:', error);
    ElMessage.error('获取活跃用户失败');
  }
};

// 获取侧边栏数据
const fetchSidebarData = async () => {
  await Promise.all([
    fetchCommunityStats(),
    fetchHotTopics(),
    fetchActiveUsers()
  ]);
};

// 在组件挂载时获取数据
onMounted(async () => {
  await Promise.all([
    fetchPosts(),
    fetchSidebarData()
  ]);
});
</script>

<style scoped lang="scss">
.forum-container {
  padding-bottom: 40px;
}

.forum-header {
  margin-bottom: 24px;
  
  .forum-title {
    font-size: 28px;
    font-weight: 600;
    margin: 0 0 8px 0;
    color: #303133;
  }
  
  .forum-description {
    font-size: 16px;
    color: #606266;
    margin: 0 0 24px 0;
  }
  
  .forum-actions {
    display: flex;
    gap: 16px;
    margin-bottom: 16px;
    
    .search-input {
      flex: 1;
    }
    
    @media (max-width: 768px) {
      flex-direction: column;
      gap: 12px;
    }
  }
}

.forum-card {
  margin-bottom: 24px;
  
  .forum-sort {
    display: flex;
    align-items: center;
    margin: 16px 0;
    
    .sort-label {
      margin-right: 8px;
      color: #606266;
    }
  }
  
  .post-skeleton {
    padding: 20px 0;
    border-bottom: 1px solid #ebeef5;
    
    .skeleton-header {
      display: flex;
      align-items: center;
      margin-bottom: 16px;
    }
    
    .skeleton-footer {
      display: flex;
      justify-content: space-between;
      margin-top: 16px;
    }
  }
  
  .forum-posts {
    .post-item {
      padding: 24px 0;
      border-bottom: 1px solid #ebeef5;
      cursor: pointer;
      transition: background-color 0.2s;
      
      &:hover {
        background-color: #f5f7fa;
      }
      
      &:last-child {
        border-bottom: none;
      }
      
      .post-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
        
        .post-author {
          display: flex;
          align-items: center;
          
          .author-info {
            flex: 1;
            margin-left: 12px;
            
            .author-name-row {
              display: flex;
              align-items: center;
              gap: 8px;
              margin-bottom: 4px;
            }
            
            .author-name {
              font-size: 14px;
              font-weight: 500;
              color: #303133;
            }
            
            .expert-tag {
              display: flex;
              align-items: center;
              gap: 2px;
              
              .el-icon {
                font-size: 12px;
              }
            }
            
            .post-time {
              font-size: 13px;
              color: #909399;
            }
          }
        }
      }
      
      .post-title {
        font-size: 18px;
        font-weight: 600;
        margin: 0 0 12px 0;
        color: #303133;
      }
      
      .post-excerpt {
        font-size: 14px;
        color: #606266;
        margin: 0 0 16px 0;
        line-height: 1.6;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
      }
      
      .post-footer {
        .post-stats {
          display: flex;
          gap: 16px;
          
          .stat-item {
            display: flex;
            align-items: center;
            gap: 4px;
            color: #909399;
            font-size: 13px;
          }
        }
      }
    }
  }
  
  .pagination-container {
    padding: 20px 0;
    display: flex;
    justify-content: center;
  }
}

.sidebar-card {
  margin-bottom: 24px;
  
  .card-header {
    font-size: 18px;
    font-weight: 600;
    color: #303133;
  }
  
  &.community-card {
    .community-stats {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      
      .stat-item {
        flex: 1;
        text-align: center;
        padding: 16px 0;
        
        .stat-value {
          font-size: 24px;
          font-weight: 600;
          color: #409EFF;
          margin-bottom: 8px;
        }
        
        .stat-label {
          font-size: 14px;
          color: #606266;
        }
      }
    }
  }
  
  &.hot-topics-card {
    .hot-topics {
      .hot-topic-item {
        display: flex;
        align-items: center;
        padding: 12px 0;
        border-bottom: 1px solid #ebeef5;
        cursor: pointer;
        transition: background-color 0.2s;
        
        &:last-child {
          border-bottom: none;
        }
        
        &:hover {
          background-color: #f5f7fa;
        }
        
        .el-icon {
          margin-right: 8px;
          color: #409EFF;
        }
        
        .topic-name {
          flex: 1;
          font-size: 14px;
          color: #303133;
        }
        
        .topic-count {
          font-size: 13px;
          color: #909399;
          background-color: #f0f2f5;
          border-radius: 10px;
          padding: 2px 8px;
        }
      }
    }
  }
  
  &.active-users-card {
    .active-users {
      .active-user-item {
        display: flex;
        align-items: center;
        padding: 12px 0;
        border-bottom: 1px solid #ebeef5;
        cursor: pointer;
        transition: background-color 0.2s;
        
        &:last-child {
          border-bottom: none;
        }
        
        &:hover {
          background-color: #f5f7fa;
        }
        
        .el-avatar {
          margin-right: 12px;
        }
        
        .user-info {
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        
        .user-name {
          font-size: 14px;
          font-weight: 500;
          color: #303133;
          margin-bottom: 4px;
        }
        
        .user-contribution {
          font-size: 13px;
          color: #909399;
        }
      }
    }
  }
  
  &.rules-card {
    .rules-list {
      padding-left: 20px;
      margin: 0;
      
      li {
        color: #606266;
        margin-bottom: 10px;
        font-size: 14px;
        line-height: 1.6;
        
        &:last-child {
          margin-bottom: 0;
        }
      }
    }
  }
}

.expert-field-tag {
  border: 1px solid #ff7875;
  color: #d4380d;
  font-weight: 600;
  background-color: rgba(255, 120, 117, 0.1);
}

.expert-post-hint {
  font-size: 12px;
  color: #909399;
  margin-top: 8px;
  line-height: 1.4;
  padding: 8px 12px;
  background: rgba(250, 173, 20, 0.05);
  border-left: 3px solid #faad14;
  border-radius: 0 4px 4px 0;
}

.expert-post {
  background: linear-gradient(135deg, #fff7e6 0%, #fff1f0 100%);
  border: 2px solid #faad14;
  border-radius: 8px;
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
  
  &:hover {
    box-shadow: 0 6px 20px rgba(250, 173, 20, 0.3);
    transform: translateY(-2px);
    transition: all 0.3s ease;
  }
}

.expert-author {
  font-weight: 700;
  color: #fa8c16;
  text-shadow: 0 1px 2px rgba(250, 140, 22, 0.1);
}

.expert-title {
  color: #d4380d;
  font-weight: 700;
  display: flex;
  align-items: center;
  
  .expert-title-icon {
    margin-right: 8px;
    color: #faad14;
    font-size: 20px;
    filter: drop-shadow(0 1px 2px rgba(250, 173, 20, 0.3));
  }
}

.expert-tag {
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

.expert-tag-form-item {
  margin-top: 0;
  transition: all 0.3s ease;
  
  .el-input {
    transition: all 0.3s ease;
    
    &:hover {
      box-shadow: 0 2px 8px rgba(250, 173, 20, 0.2);
    }
    
    &:focus-within {
      box-shadow: 0 2px 12px rgba(250, 173, 20, 0.3);
    }
  }
  
  .el-input__prefix {
    color: #faad14;
  }
}

.expert-tag-hint {
  font-size: 12px;
  color: #909399;
  margin-top: 8px;
  line-height: 1.4;
  padding-left: 32px;
  position: relative;
  
  &::before {
    content: '💡';
    position: absolute;
    left: 8px;
    top: 0;
  }
}

.expert-post-form-item {
  margin-top: 0;
  transition: all 0.3s ease;
  
  .el-checkbox {
    transition: all 0.3s ease;
    
    &:hover {
      box-shadow: 0 2px 8px rgba(250, 173, 20, 0.2);
    }
    
    &:focus-within {
      box-shadow: 0 2px 12px rgba(250, 173, 20, 0.3);
    }
  }
}
</style> 