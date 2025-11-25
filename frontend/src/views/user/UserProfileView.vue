<template>
  <div class="user-profile-container">
    <!-- 返回按钮 -->
    <div class="back-button">
      <el-button link @click="goBack">
        <el-icon class="mr-1"><ArrowLeft /></el-icon>
        返回上一页
      </el-button>
    </div>

    <el-skeleton :loading="loading" animated>
      <template #template>
        <div class="skeleton-content">
          <div class="profile-skeleton">
            <el-skeleton-item variant="circle" style="width: 120px; height: 120px; margin: 0 auto" />
            <el-skeleton-item variant="h1" style="width: 30%; margin: 20px auto" />
            <el-skeleton-item variant="p" style="width: 60%; margin: 10px auto" />
            <el-skeleton-item variant="p" style="width: 40%; margin: 10px auto" />
          </div>
          <div class="stats-skeleton">
            <el-skeleton-item variant="rect" style="width: 100%; height: 120px; margin: 20px 0" />
          </div>
          <div class="posts-skeleton">
            <el-skeleton-item variant="h3" style="width: 25%; margin: 20px 0" />
            <div v-for="n in 3" :key="n" style="margin-bottom: 20px;">
              <el-skeleton-item variant="rect" style="width: 100%; height: 150px" />
            </div>
          </div>
        </div>
      </template>

      <div v-if="!loading && userProfile" class="profile-content">
        <!-- 用户基本信息 -->
        <el-card class="profile-header">
          <div class="profile-info">
            <el-avatar 
              :size="120" 
              :src="userProfile.profilePicture || undefined" 
              :alt="getUserDisplayName(userProfile)"
            >
              <el-icon><User /></el-icon>
            </el-avatar>
            <div class="profile-details">
              <h1 class="profile-name">{{ getUserDisplayName(userProfile) }}</h1>
              <p class="profile-bio">{{ userProfile.bio || '这个用户很懒，还没有填写个人简介~' }}</p>
              <div class="profile-meta">
                <span class="join-date">
                  <el-icon><Calendar /></el-icon>
                  加入时间：{{ formatDate(userProfile.createdAt) }}
                </span>
                <el-tag v-if="userProfile.role" :type="getRoleTagType(userProfile.role) || 'info'">
                  {{ getRoleText(userProfile.role) }}
                </el-tag>
              </div>
            </div>
          </div>
        </el-card>

        <!-- 统计数据 -->
        <el-card class="stats-card">
          <template #header>
            <h2 class="section-title">用户统计</h2>
          </template>
          <el-row :gutter="20">
            <el-col :xs="12" :sm="6">
              <div class="stat-item">
                <div class="stat-value">{{ userStats.postsCount }}</div>
                <div class="stat-label">发帖数</div>
              </div>
            </el-col>
            <el-col :xs="12" :sm="6">
              <div class="stat-item">
                <div class="stat-value">{{ userStats.likesReceived }}</div>
                <div class="stat-label">获赞数</div>
              </div>
            </el-col>
            <el-col :xs="12" :sm="6">
              <div class="stat-item">
                <div class="stat-value">{{ userStats.commentsCount }}</div>
                <div class="stat-label">评论数</div>
              </div>
            </el-col>
            <el-col :xs="12" :sm="6">
              <div class="stat-item">
                <div class="stat-value">{{ userStats.viewsReceived }}</div>
                <div class="stat-label">浏览量</div>
              </div>
            </el-col>
          </el-row>
        </el-card>

        <!-- 用户动态 -->
        <el-card class="activities-card">
          <template #header>
            <div class="section-header">
              <h2 class="section-title">用户动态</h2>
              <el-radio-group v-model="activeTab" @change="handleTabChange">
                <el-radio-button value="posts">发布的帖子</el-radio-button>
                <el-radio-button value="comments">评论回复</el-radio-button>
              </el-radio-group>
            </div>
          </template>

          <!-- 发布的帖子 -->
          <div v-if="activeTab === 'posts'" class="user-posts">
            <div v-if="userPosts.length === 0" class="empty-state">
              <el-empty description="用户暂未发布任何帖子" />
            </div>
            <div v-else class="posts-list">
              <div 
                v-for="post in userPosts" 
                :key="post.id" 
                class="post-item"
                @click="navigateToPost(post.id)"
              >
                <div class="post-content">
                  <h3 class="post-title">{{ post.title }}</h3>
                  <p class="post-excerpt">{{ post.excerpt || (post.content?.substring(0, 120) + '...') }}</p>
                  <div class="post-meta">
                    <span class="post-date">{{ formatDate(post.createdAt) }}</span>
                    <el-tag size="small" type="info">{{ getCategoryText(post.category || '') }}</el-tag>
                    <div class="post-stats">
                      <span class="stat">
                        <el-icon><View /></el-icon>
                        {{ post.views }}
                      </span>
                      <span class="stat">
                        <el-icon><ChatDotRound /></el-icon>
                        {{ post.commentCount }}
                      </span>
                      <span class="stat">
                        <el-icon><Star /></el-icon>
                        {{ post.likes }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 评论回复 -->
          <div v-if="activeTab === 'comments'" class="user-comments">
            <div v-if="userComments.length === 0" class="empty-state">
              <el-empty description="用户暂未发表任何评论" />
            </div>
            <div v-else class="comments-list">
              <div 
                v-for="comment in userComments" 
                :key="comment.id" 
                class="comment-item"
                @click="navigateToPost(comment.postId)"
              >
                <div class="comment-content">
                  <p class="comment-text">{{ comment.content }}</p>
                  <div class="comment-meta">
                    <span class="comment-post">
                      回复了帖子：<strong>{{ (comment as any).postTitle || '未知帖子' }}</strong>
                    </span>
                    <span class="comment-date">{{ formatDate(comment.createdAt) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 分页 -->
          <div v-if="totalItems > pageSize" class="pagination-wrapper">
            <el-pagination
              v-model:current-page="currentPage"
              v-model:page-size="pageSize"
              :page-sizes="[10, 20, 50]"
              :total="totalItems"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
            />
          </div>
        </el-card>
      </div>

      <!-- 用户不存在状态 -->
      <div v-if="!loading && !userProfile" class="error-state">
        <el-empty description="用户不存在或已被删除">
          <el-button type="primary" @click="goBack">返回上一页</el-button>
        </el-empty>
      </div>
    </el-skeleton>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { 
  ArrowLeft, 
  User, 
  Calendar, 
  View, 
  ChatDotRound, 
  Star 
} from '@element-plus/icons-vue'
import { UserService } from '@/api/services/user'
import { ForumService } from '@/api/services/forum'
import type { User as UserType, ForumPost, ForumComment } from '@/types'

const route = useRoute()
const router = useRouter()

// 状态管理
const loading = ref(true)
const userProfile = ref<UserType | null>(null)
const userPosts = ref<ForumPost[]>([])
const userComments = ref<ForumComment[]>([])
const activeTab = ref('posts')

// 分页状态
const currentPage = ref(1)
const pageSize = ref(10)
const totalItems = ref(0)

// 用户统计数据
const userStats = reactive({
  postsCount: 0,
  likesReceived: 0,
  commentsCount: 0,
  viewsReceived: 0
})

// 当前用户ID
const userId = computed(() => Number(route.params.id))

// 获取用户基本信息
const fetchUserProfile = async () => {
  try {
    const response = await UserService.getUserById(userId.value)
    if (response) {
      userProfile.value = response
      // 更新统计数据，使用安全访问
      userStats.postsCount = (response as any).postsCount || 0
      userStats.likesReceived = (response as any).likesReceived || 0
      userStats.commentsCount = (response as any).commentsCount || 0
      userStats.viewsReceived = (response as any).viewsReceived || 0
    }
  } catch (error) {
    console.error('获取用户信息失败:', error)
    ElMessage.error('获取用户信息失败')
    userProfile.value = null
  }
}

// 获取用户发布的帖子
const fetchUserPosts = async () => {
  try {
    const response = await ForumService.getUserPosts(userId.value, {
      page: currentPage.value - 1,
      size: pageSize.value
    })
    
    if (response && response.content) {
      userPosts.value = response.content
      totalItems.value = response.totalElements || 0
    }
  } catch (error) {
    console.error('获取用户帖子失败:', error)
    userPosts.value = []
  }
}

// 获取用户评论
const fetchUserComments = async () => {
  try {
    const response = await ForumService.getUserComments(userId.value, {
      page: currentPage.value - 1,
      size: pageSize.value
    })
    
    if (response && response.content) {
      userComments.value = response.content
      totalItems.value = response.totalElements || 0
    }
  } catch (error) {
    console.error('获取用户评论失败:', error)
    userComments.value = []
  }
}

// 处理标签切换
const handleTabChange = () => {
  currentPage.value = 1
  if (activeTab.value === 'posts') {
    fetchUserPosts()
  } else {
    fetchUserComments()
  }
}

// 处理分页大小变化
const handleSizeChange = (newSize: number) => {
  pageSize.value = newSize
  currentPage.value = 1
  if (activeTab.value === 'posts') {
    fetchUserPosts()
  } else {
    fetchUserComments()
  }
}

// 处理页码变化
const handleCurrentChange = (newPage: number) => {
  currentPage.value = newPage
  if (activeTab.value === 'posts') {
    fetchUserPosts()
  } else {
    fetchUserComments()
  }
}

// 导航到帖子详情
const navigateToPost = (postId: number) => {
  router.push(`/forum/post/${postId}`)
}

// 返回上一页
const goBack = () => {
  router.go(-1)
}

// 格式化日期
const formatDate = (dateString?: string) => {
  if (!dateString) return '未知时间'
  
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  const minute = 60 * 1000
  const hour = minute * 60
  const day = hour * 24
  const month = day * 30
  
  if (diff < minute) {
    return '刚刚'
  } else if (diff < hour) {
    return `${Math.floor(diff / minute)}分钟前`
  } else if (diff < day) {
    return `${Math.floor(diff / hour)}小时前`
  } else if (diff < month) {
    return `${Math.floor(diff / day)}天前`
  } else {
    return date.toLocaleDateString('zh-CN')
  }
}

// 获取角色标签类型
const getRoleTagType = (role: string) => {
  switch (role) {
    case 'ADMIN':
      return 'danger'
    case 'EXPERT':
      return 'warning'
    case 'SCHOOL_ASSISTANT':
      return 'info'
    default:
      return ''
  }
}

// 获取角色文本
const getRoleText = (role: string) => {
  switch (role) {
    case 'ADMIN':
      return '管理员'
    case 'EXPERT':
      return '专家'
    case 'SCHOOL_ASSISTANT':
      return '院校助理'
    case 'USER':
      return '普通用户'
    default:
      return '用户'
  }
}

// 获取分类文本
const getCategoryText = (category: string) => {
  switch (category) {
    case 'experience':
      return '申请经验'
    case 'question':
      return '问题求助'
    case 'sharing':
      return '资源分享'
    case 'discussion':
      return '讨论交流'
    default:
      return '其他'
  }
}

// 获取用户显示名称
const getUserDisplayName = (user: UserType | null) => {
  if (!user) {
    return '未知用户'
  }
  
  if (user.fullName && user.fullName.trim()) {
    return user.fullName
  } else if (user.email) {
    // 从邮箱中提取用户名作为显示名
    return user.email.split('@')[0]
  } else {
    return `用户 ${user.id || ''}`
  }
}

// 组件挂载时获取数据
onMounted(async () => {
  loading.value = true
  await Promise.all([
    fetchUserProfile(),
    fetchUserPosts()
  ])
  loading.value = false
})
</script>

<style scoped lang="scss">
.user-profile-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.back-button {
  margin-bottom: 16px;
}

.profile-header {
  margin-bottom: 24px;
  
  .profile-info {
    display: flex;
    gap: 24px;
    align-items: flex-start;
    
    @media (max-width: 768px) {
      flex-direction: column;
      align-items: center;
      text-align: center;
    }
    
    .profile-details {
      flex: 1;
      
      .profile-name {
        margin: 0 0 12px 0;
        font-size: 32px;
        font-weight: 600;
        color: #303133;
      }
      
      .profile-bio {
        margin: 0 0 16px 0;
        font-size: 16px;
        color: #606266;
        line-height: 1.6;
      }
      
      .profile-meta {
        display: flex;
        align-items: center;
        gap: 16px;
        flex-wrap: wrap;
        
        .join-date {
          display: flex;
          align-items: center;
          gap: 4px;
          color: #909399;
          font-size: 14px;
        }
      }
    }
  }
}

.stats-card {
  margin-bottom: 24px;
  
  .stat-item {
    text-align: center;
    padding: 16px;
    border-radius: 8px;
    background: #f8f9fa;
    
    .stat-value {
      font-size: 32px;
      font-weight: 600;
      color: #409eff;
      margin-bottom: 8px;
    }
    
    .stat-label {
      font-size: 14px;
      color: #909399;
    }
  }
}

.activities-card {
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    @media (max-width: 768px) {
      flex-direction: column;
      gap: 16px;
    }
    
    .section-title {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: #303133;
    }
  }
}

.posts-list, .comments-list {
  .post-item, .comment-item {
    padding: 20px;
    border: 1px solid #ebeef5;
    border-radius: 8px;
    margin-bottom: 16px;
    cursor: pointer;
    transition: all 0.3s;
    
    &:hover {
      border-color: #c6e2ff;
      box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
    }
    
    &:last-child {
      margin-bottom: 0;
    }
  }
  
  .post-content {
    .post-title {
      margin: 0 0 12px 0;
      font-size: 18px;
      font-weight: 600;
      color: #303133;
      line-height: 1.4;
    }
    
    .post-excerpt {
      margin: 0 0 16px 0;
      color: #606266;
      line-height: 1.6;
    }
    
    .post-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 12px;
      
      .post-date {
        color: #909399;
        font-size: 14px;
      }
      
      .post-stats {
        display: flex;
        gap: 16px;
        
        .stat {
          display: flex;
          align-items: center;
          gap: 4px;
          color: #909399;
          font-size: 14px;
        }
      }
    }
  }
  
  .comment-content {
    .comment-text {
      margin: 0 0 12px 0;
      color: #303133;
      line-height: 1.6;
    }
    
    .comment-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 12px;
      
      .comment-post {
        color: #606266;
        font-size: 14px;
        
        strong {
          color: #409eff;
        }
      }
      
      .comment-date {
        color: #909399;
        font-size: 14px;
      }
    }
  }
}

.empty-state {
  padding: 40px 0;
}

.error-state {
  padding: 80px 20px;
  text-align: center;
}

.pagination-wrapper {
  margin-top: 24px;
  display: flex;
  justify-content: center;
}

.section-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

// 骨架屏样式
.skeleton-content {
  .profile-skeleton {
    text-align: center;
    margin-bottom: 40px;
  }
  
  .stats-skeleton, .posts-skeleton {
    margin-bottom: 40px;
  }
}
</style> 