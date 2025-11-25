<template>
  <div class="dashboard-container">
    <!-- 欢迎横幅 -->
    <el-card class="welcome-card">
      <div class="welcome-content">
        <div class="welcome-left">
          <h1 class="welcome-title">欢迎回来，{{ userName }}</h1>
          <p class="welcome-subtitle">留学者指南 将助您实现留学梦想</p>
          <div class="welcome-actions">
            <el-button type="primary" @click="goToEssayCreate">创建文书</el-button>
            <el-button @click="goToRecommendation">获取院校推荐</el-button>
          </div>
        </div>
        <div class="welcome-right">
          <img src="@/assets/dashboard-hero.svg" alt="Dashboard Hero" class="welcome-image">
        </div>
      </div>
    </el-card>

    <!-- 统计数据卡片 -->
    <div class="data-cards">
      <el-card class="data-card">
        <template #header>
          <div class="card-header">
            <span>文书数量</span>
            <el-icon class="card-icon"><Document /></el-icon>
          </div>
        </template>
        <div class="card-content">
          <h2 class="card-value">{{ stats.essayCount || 0 }}</h2>
          <p class="card-desc">您已创建的文书总数</p>
        </div>
        <div class="card-action">
          <el-link type="primary" @click="goToEssay">查看全部文书</el-link>
        </div>
      </el-card>

      <el-card class="data-card">
        <template #header>
          <div class="card-header">
            <span>匹配院校</span>
            <el-icon class="card-icon"><School /></el-icon>
          </div>
        </template>
        <div class="card-content">
          <h2 class="card-value">{{ stats.matchedSchools || 0 }}</h2>
          <p class="card-desc">系统为您匹配的院校</p>
        </div>
        <div class="card-action">
          <el-link type="primary" @click="goToRecommendation">查看推荐</el-link>
        </div>
      </el-card>

      <el-card class="data-card">
        <template #header>
          <div class="card-header">
            <span>论坛帖子</span>
            <el-icon class="card-icon"><ChatDotRound /></el-icon>
          </div>
        </template>
        <div class="card-content">
          <h2 class="card-value">{{ stats.forumPosts || 0 }}</h2>
          <p class="card-desc">最新社区动态</p>
        </div>
        <div class="card-action">
          <el-link type="primary" @click="goToForum">查看论坛</el-link>
        </div>
      </el-card>
    </div>

    <!-- 快捷操作 -->
    <h2 class="section-title">快捷操作</h2>
    <div class="quick-actions">
      <el-card class="action-card" shadow="hover" @click="goToEssayCreate">
        <el-icon class="action-icon"><EditPen /></el-icon>
        <h3 class="action-title">创建文书</h3>
        <p class="action-desc">创建新的文书并使用AI优化</p>
      </el-card>

      <el-card class="action-card" shadow="hover" @click="goToRecommendation">
        <el-icon class="action-icon"><Compass /></el-icon>
        <h3 class="action-title">获取推荐</h3>
        <p class="action-desc">基于您的背景获取匹配院校</p>
      </el-card>

      <el-card class="action-card" shadow="hover" @click="goToSchools">
        <el-icon class="action-icon"><Search /></el-icon>
        <h3 class="action-title">浏览院校</h3>
        <p class="action-desc">查看完整院校数据库</p>
      </el-card>

      <el-card class="action-card" shadow="hover" @click="goToForumCreate">
        <el-icon class="action-icon"><ChatDotSquare /></el-icon>
        <h3 class="action-title">论坛讨论</h3>
        <p class="action-desc">创建新的讨论主题</p>
      </el-card>
    </div>

    <!-- 最近文书 -->
    <div class="recent-section">
      <div class="section-header">
        <h2 class="section-title">最近文书</h2>
        <el-link type="primary" @click="goToEssay">查看全部</el-link>
      </div>

      <div v-if="recentEssays.length" class="recent-essays">
        <el-card v-for="essay in recentEssays" :key="essay.id" class="recent-essay-card" shadow="hover">
          <h3 class="essay-title">{{ essay.title }}</h3>
          <p class="essay-preview">{{ limitText(essay.content, 100) }}</p>
          <div class="essay-footer">
            <span class="essay-date">{{ formatDate(essay.updatedAt || essay.createdAt) }}</span>
            <el-button type="primary" size="small" text @click="goToEssayDetail(essay.id)">
              查看详情
            </el-button>
          </div>
        </el-card>
      </div>
      <el-empty v-else description="暂无文书记录" />
    </div>

    <!-- 最近论坛帖子 -->
    <div class="recent-section">
      <div class="section-header">
        <h2 class="section-title">最新讨论</h2>
        <el-link type="primary" @click="goToForum">查看全部</el-link>
      </div>

      <div v-if="recentPosts.length" class="recent-posts">
        <el-card v-for="post in recentPosts" :key="post.id" class="recent-post-card" shadow="hover">
          <h3 class="post-title">{{ post.title }}</h3>
          <p class="post-preview">{{ limitText(post.content, 80) }}</p>
          <div class="post-footer">
            <div class="post-info">
              <span>{{ post.author?.fullName || '匿名用户' }}</span>
              <span class="post-date">{{ formatDate(post.createdAt) }}</span>
            </div>
            <div class="post-stats">
              <span class="post-stat"><el-icon><ChatDotRound /></el-icon> {{ post.comments?.length || 0 }}</span>
              <span class="post-stat"><el-icon><Star /></el-icon> {{ post.likes }}</span>
            </div>
          </div>
        </el-card>
      </div>
      <el-empty v-else description="暂无讨论" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Document, School, ChatDotRound, EditPen, Compass, Search, ChatDotSquare, Star } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import { EssayService } from '@/api/services/essay'
import { ForumService } from '@/api/services/forum'
import RecommendationService from '@/api/services/recommendation'
import type { Essay, ForumPost } from '@/types'

const router = useRouter()
const authStore = useAuthStore()

// 用户姓名
const userName = computed(() => {
  return authStore.user?.fullName?.split(' ')[0] || '同学'
})

// 统计数据
const stats = ref({
  essayCount: 0,
  matchedSchools: 0,
  forumPosts: 0
})

// 最近文书和论坛帖子
const recentEssays = ref<Essay[]>([])
const recentPosts = ref<ForumPost[]>([])

// 获取用户数据
const fetchUserData = async () => {
  if (!authStore.user?.id) return
  
  try {
    // 获取用户文书
    const essayResponse = await EssayService.getUserEssays(authStore.user.id)
    if (essayResponse && Array.isArray(essayResponse)) {
      recentEssays.value = essayResponse.slice(0, 3)
      stats.value.essayCount = essayResponse.length
    }
    
    // 获取推荐院校数量
    const recommendationResponse = await RecommendationService.getSimpleRecommendations(authStore.user.id)
    if (recommendationResponse) {
      stats.value.matchedSchools = recommendationResponse.length
    }
    
    // 获取最新论坛帖子
    const forumResponse = await ForumService.getPosts({ page: 0, size: 3 })
    if (forumResponse?.content) {
      recentPosts.value = forumResponse.content
      stats.value.forumPosts = forumResponse.totalElements
    }
  } catch (error) {
    console.error('Error fetching user data:', error)
  }
}

// 格式化日期
const formatDate = (dateString?: string) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// 限制文本长度
const limitText = (text: string, maxLength: number) => {
  if (!text) return ''
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
}

// 页面导航
const goToEssay = () => router.push('/essay')
const goToEssayCreate = () => router.push('/essay/create')
const goToEssayDetail = (id: number) => router.push(`/essay/${id}`)
const goToRecommendation = () => router.push('/recommendation')
const goToSchools = () => router.push('/schools')
const goToForum = () => router.push('/forum')
const goToForumCreate = () => router.push('/forum?action=create')

// 页面加载时获取数据
onMounted(() => {
  fetchUserData()
})
</script>

<style scoped lang="scss">
.dashboard-container {
  padding: 0 0 32px 0;
}

.welcome-card {
  margin-bottom: 24px;
  background: linear-gradient(120deg, #1677ff 0%, #0958d9 100%);
  color: white;
  
  .welcome-content {
    display: flex;
    align-items: center;
  }
  
  .welcome-left {
    flex: 1;
  }
  
  .welcome-right {
    flex: 1;
    display: flex;
    justify-content: flex-end;
  }
  
  .welcome-title {
    font-size: 28px;
    margin: 0 0 12px 0;
    font-weight: 600;
  }
  
  .welcome-subtitle {
    font-size: 16px;
    margin: 0 0 24px 0;
    opacity: 0.9;
  }
  
  .welcome-image {
    max-width: 300px;
    max-height: 180px;
  }
  
  :deep(.el-card__body) {
    padding: 32px;
  }
}

.data-cards {
  display: flex;
  gap: 16px;
  margin-bottom: 32px;
  
  .data-card {
    flex: 1;
    
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 16px;
      font-weight: 500;
    }
    
    .card-icon {
      font-size: 20px;
      color: #1677ff;
    }
    
    .card-content {
      padding: 16px 0;
    }
    
    .card-value {
      font-size: 32px;
      font-weight: 600;
      margin: 0 0 8px 0;
      color: #303133;
    }
    
    .card-desc {
      font-size: 14px;
      color: #606266;
      margin: 0;
    }
    
    .card-action {
      text-align: right;
    }
  }
}

.section-title {
  font-size: 20px;
  font-weight: 500;
  margin: 0 0 16px 0;
  color: #303133;
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 32px;
  
  .action-card {
    cursor: pointer;
    transition: transform 0.3s;
    
    &:hover {
      transform: translateY(-5px);
    }
    
    .action-icon {
      font-size: 36px;
      color: #1677ff;
      margin-bottom: 16px;
    }
    
    .action-title {
      font-size: 16px;
      font-weight: 500;
      margin: 0 0 8px 0;
      color: #303133;
    }
    
    .action-desc {
      font-size: 14px;
      color: #606266;
      margin: 0;
    }
    
    :deep(.el-card__body) {
      padding: 24px;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }
  }
}

.recent-section {
  margin-bottom: 32px;
  
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }
  
  .recent-essays, .recent-posts {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
  }
}

.recent-essay-card, .recent-post-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  
  :deep(.el-card__body) {
    flex: 1;
    display: flex;
    flex-direction: column;
  }
  
  .essay-title, .post-title {
    font-size: 16px;
    font-weight: 500;
    margin: 0 0 12px 0;
    color: #303133;
  }
  
  .essay-preview, .post-preview {
    font-size: 14px;
    color: #606266;
    flex: 1;
    margin: 0 0 16px 0;
    line-height: 1.5;
  }
  
  .essay-footer, .post-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: auto;
  }
  
  .essay-date, .post-date {
    font-size: 12px;
    color: #909399;
  }
  
  .post-info {
    font-size: 12px;
    color: #606266;
    display: flex;
    flex-direction: column;
    
    .post-date {
      margin-top: 4px;
    }
  }
  
  .post-stats {
    display: flex;
    gap: 12px;
    
    .post-stat {
      display: flex;
      align-items: center;
      font-size: 12px;
      color: #909399;
      
      .el-icon {
        margin-right: 4px;
      }
    }
  }
}

@media (max-width: 1200px) {
  .quick-actions {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .recent-essays, .recent-posts {
    grid-template-columns: repeat(2, 1fr) !important;
  }
}

@media (max-width: 768px) {
  .welcome-content {
    flex-direction: column;
    
    .welcome-right {
      margin-top: 24px;
    }
  }
  
  .data-cards {
    flex-direction: column;
  }
  
  .recent-essays, .recent-posts {
    grid-template-columns: 1fr !important;
  }
}
</style> 