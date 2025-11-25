<template>
  <div class="essay-container">
    <div class="header-actions">
      <h1 class="page-title">我的文书管理</h1>
      <div class="action-buttons">
        <el-button @click="router.push('/essay')">
          <el-icon><Back /></el-icon>
          返回列表
        </el-button>
        <el-button type="primary" @click="createNewEssay">
          <el-icon><Plus /></el-icon>
          创建新文书
        </el-button>
      </div>
    </div>
    
    <div class="essay-filters">
      <el-input
        v-model="searchQuery"
        placeholder="搜索文书标题"
        clearable
        @clear="handleSearch"
        @input="debounceSearch"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
      
      <el-select v-model="typeFilter" placeholder="文书类型" clearable @change="handleSearch">
        <el-option v-for="type in essayTypes" :key="type.value" :label="type.label" :value="type.value" />
      </el-select>
      
      <el-select v-model="statusFilter" placeholder="状态" clearable @change="handleSearch">
        <el-option label="草稿" value="DRAFT" />
        <el-option label="完成" value="COMPLETED" />
      </el-select>
      
      <el-select v-model="sortOption" placeholder="排序" @change="handleSearch">
        <el-option label="最近更新" value="updatedAt_desc" />
        <el-option label="最早创建" value="createdAt_asc" />
        <el-option label="标题排序" value="title_asc" />
      </el-select>
    </div>
    
    <div class="essay-list" v-loading="loading">
      <template v-if="essays.length">
        <el-card v-for="essay in essays" :key="essay.id" class="essay-card">
          <div class="essay-card-header">
            <h3 class="essay-title">{{ essay.title }}</h3>
            <el-tag size="small" :type="getStatusTagType(essay.status || 'DRAFT')">
              {{ essay.status === 'DRAFT' ? '草稿' : '完成' }}
            </el-tag>
          </div>
          
          <div class="essay-meta">
            <span class="essay-type">{{ getEssayTypeLabel(essay.essayType || 'PERSONAL_STATEMENT') }}</span>
            <span class="essay-date">最后更新: {{ formatDate(essay.updatedAt || essay.createdAt || '') }}</span>
            <span class="essay-words">
              <el-icon><Document /></el-icon>
              {{ getWordCount(essay.content) }}字
              <template v-if="essay.wordLimit">
                / 上限{{ essay.wordLimit }}字
              </template>
            </span>
          </div>
          
          <div class="essay-content">
            <p>{{ limitText(essay.content || '', 200) }}</p>
          </div>
          
          <div class="essay-actions">
            <el-button type="primary" @click="viewEssayDetail(essay.id)">查看</el-button>
            <el-button type="success" @click="polishEssay(essay.id)">润色</el-button>
            <el-button @click="editEssay(essay.id)">编辑</el-button>
            <el-popconfirm
              title="确定删除此文书吗？"
              @confirm="deleteEssay(essay.id)"
              width="220"
            >
              <template #reference>
                <el-button type="danger">删除</el-button>
              </template>
            </el-popconfirm>
          </div>
        </el-card>
      </template>
      
      <el-empty v-else-if="!loading" description="没有找到文书，点击创建新文书开始写作">
        <el-button type="primary" @click="createNewEssay">创建新文书</el-button>
      </el-empty>
    </div>
    
    <div class="pagination-container" v-if="total > pageSize">
      <el-pagination
        background
        layout="prev, pager, next"
        :total="total"
        :page-size="pageSize"
        v-model:current-page="currentPage"
        @current-change="handlePageChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Search, Plus, Document, Back } from '@element-plus/icons-vue'
import { EssayService } from '@/api/services/essay'
import { useAuthStore } from '@/stores/auth'
import type { Essay } from '@/types'

const router = useRouter()
const authStore = useAuthStore()

// 状态
const loading = ref(false)
const essays = ref<Essay[]>([])
const total = ref(0)

// 筛选和分页
const searchQuery = ref('')
const typeFilter = ref('')
const statusFilter = ref('')
const sortOption = ref('updatedAt_desc')
const currentPage = ref(1)
const pageSize = ref(10)

// 文书类型选项
const essayTypes = [
  { label: '个人陈述', value: 'PERSONAL_STATEMENT' },
  { label: '目的声明', value: 'STATEMENT_OF_PURPOSE' },
  { label: '多元化声明', value: 'DIVERSITY_STATEMENT' },
  { label: '为何选择这所学校', value: 'WHY_THIS_SCHOOL' },
  { label: '课外活动', value: 'EXTRACURRICULAR_ACTIVITY' },
  { label: '挑战经历', value: 'CHALLENGE' },
  { label: '领导力经历', value: 'LEADERSHIP' },
  { label: '未来目标', value: 'FUTURE_GOALS' },
  { label: '补充文书', value: 'SUPPLEMENTAL' },
  { label: '其他', value: 'OTHER' }
]

// 获取文书类型显示名称
const getEssayTypeLabel = (type: string) => {
  const typeOption = essayTypes.find(t => t.value === type)
  return typeOption ? typeOption.label : type
}

// 获取文书列表
const fetchEssays = async () => {
  if (!authStore.user?.id) return
  
  loading.value = true
  try {
    const params = {
      page: currentPage.value - 1,
      size: pageSize.value,
      keyword: searchQuery.value,
      type: typeFilter.value,
      status: statusFilter.value,
      sort: sortOption.value
    }
    
    const response = await EssayService.getUserEssays(authStore.user.id, params)
    
    // response 直接是 Essay[] 数组
    if (Array.isArray(response)) {
      essays.value = response
      total.value = response.length
    } else if (response) {
      // 如果响应是分页对象格式
      essays.value = response.content || []
      total.value = response.totalElements || 0
    } else {
      essays.value = []
      total.value = 0
    }
  } catch (error) {
    console.error('获取文书列表失败:', error)
    ElMessage.error('获取文书列表失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 搜索防抖
let debounceTimeout = null as any
const debounceSearch = () => {
  if (debounceTimeout) {
    clearTimeout(debounceTimeout)
  }
  
  debounceTimeout = setTimeout(() => {
    handleSearch()
  }, 300)
}

// 处理搜索
const handleSearch = () => {
  currentPage.value = 1
  fetchEssays()
}

// 处理分页
const handlePageChange = (page: number) => {
  currentPage.value = page
  fetchEssays()
}

// 创建新文书
const createNewEssay = () => {
  router.push('/essay/create')
}

// 查看文书详情
const viewEssayDetail = (id: number) => {
  router.push(`/essay/${id}`)
}

// 编辑文书
const editEssay = (id: number) => {
  // 这里可以改为专门的编辑页面，或者使用详情页的编辑模式
  router.push(`/essay/${id}?edit=true`)
}

// 润色文书
const polishEssay = (id: number) => {
  router.push(`/essay/polish/${id}`)
}

// 删除文书
const deleteEssay = async (id: number) => {
  try {
    const response = await EssayService.deleteEssay(id)
    
    if (response.success) {
      ElMessage.success('文书已删除')
      // 刷新列表
      fetchEssays()
    } else {
      ElMessage.error(response.message || '删除失败')
    }
  } catch (error) {
    console.error('删除文书失败:', error)
    ElMessage.error('删除文书失败，请稍后重试')
  }
}

// 格式化日期
const formatDate = (date: string | Date) => {
  if (!date) return '未知'
  
  const d = new Date(date)
  return d.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 限制文本长度
const limitText = (text: string, maxLength: number) => {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

// 获取字数统计
const getWordCount = (content: string) => {
  if (!content) return 0
  return content.replace(/<[^>]+>/g, '').length
}

// 获取状态标签类型
const getStatusTagType = (status: string) => {
  return status === 'DRAFT' ? 'warning' : 'success'
}

// 组件挂载时获取数据
onMounted(() => {
  fetchEssays()
})
</script>

<style scoped lang="scss">
.essay-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;

  .page-title {
    margin: 0;
    font-size: 24px;
    font-weight: 600;
    color: #303133;
  }

  .action-buttons {
    display: flex;
    gap: 12px;
  }
}

.essay-filters {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  flex-wrap: wrap;
  
  .el-input, .el-select {
    width: 200px;
  }
  
  @media (max-width: 768px) {
    .el-input, .el-select {
      width: 100%;
    }
  }
}

.essay-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
}

.essay-card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  }
  
  .essay-card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    
    .essay-title {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
    }
  }
  
  .essay-meta {
    display: flex;
    gap: 16px;
    font-size: 14px;
    color: #909399;
    margin-bottom: 16px;
    
    .essay-type {
      color: #409EFF;
    }
    
    .essay-words {
      display: flex;
      align-items: center;
      gap: 5px;
    }
  }
  
  .essay-content {
    margin-bottom: 16px;
    color: #606266;
    font-size: 14px;
    line-height: 1.6;
    
    p {
      margin: 0;
    }
  }
  
  .essay-actions {
    display: flex;
    gap: 10px;
  }
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}

@media (max-width: 768px) {
  .essay-actions {
    flex-wrap: wrap;
    
    .el-button {
      flex: 1;
      min-width: calc(50% - 5px);
    }
  }
}
</style> 