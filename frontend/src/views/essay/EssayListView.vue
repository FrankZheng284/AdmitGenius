<template>
  <div class="essay-list-container">
    <div class="header-actions">
      <h1 class="page-title">我的文书</h1>
      <div class="action-buttons">
        <el-button @click="router.push('/essay/view')">
          <el-icon><Setting /></el-icon>
          文书管理
        </el-button>
        <el-button type="primary" @click="router.push('/essay/create')">
          <el-icon><Plus /></el-icon>
          创建文书
        </el-button>
      </div>
    </div>

    <!-- 筛选和搜索 -->
    <el-card class="filter-card">
      <el-form :inline="true" :model="filterForm">
        <el-form-item label="文书类型">
          <el-select v-model="filterForm.essayType" placeholder="选择文书类型" clearable>
            <el-option
              v-for="option in essayTypesForFilter"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="关键词">
          <el-input
            v-model="filterForm.keyword"
            placeholder="搜索标题或内容"
            clearable
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="resetFilter">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 文书列表 -->
    <el-card v-loading="loading">
      <template v-if="filteredEssays.length > 0">
        <div class="essay-list">
          <el-card
            v-for="essay in filteredEssays"
            :key="essay.id"
            class="essay-item"
            shadow="hover"
          >
            <div class="essay-item-header">
              <h3 class="essay-title" @click="viewEssay(essay.id)">{{ essay.title }}</h3>
              <div class="essay-actions">
                <el-button-group>
                  <el-button type="primary" link @click="viewEssay(essay.id)">
                    <el-icon><View /></el-icon>
                    查看
                  </el-button>
                  <el-button type="primary" link @click="editEssay(essay.id)">
                    <el-icon><EditPen /></el-icon>
                    编辑
                  </el-button>
                  <el-button type="success" link @click="polishEssay(essay.id)">
                    <el-icon><MagicStick /></el-icon>
                    润色
                  </el-button>
                  <el-button type="danger" link @click="confirmDelete(essay)">
                    <el-icon><Delete /></el-icon>
                    删除
                  </el-button>
                </el-button-group>
              </div>
            </div>
            
            <div class="essay-meta">
              <el-tag size="small">{{ getEssayTypeLabel(essay.essayType) }}</el-tag>
              <span class="essay-date">{{ formatDate(essay.updatedAt || essay.createdAt) }}</span>
              <span class="essay-word-count">{{ getWordCount(essay.content) }} 字</span>
              <el-tag
                v-if="essay.wordLimit"
                :type="getWordCount(essay.content) > essay.wordLimit ? 'danger' : 'success'"
                size="small"
              >
                {{ getWordCount(essay.content) > essay.wordLimit ? '超出字数限制' : '符合字数限制' }}
              </el-tag>
            </div>
            
            <div class="essay-preview">
              {{ getContentPreview(essay.content) }}
            </div>
          </el-card>
        </div>
      </template>
      
      <el-empty v-else description="暂无文书" />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search, Refresh, View, EditPen, Delete, Setting, MagicStick } from '@element-plus/icons-vue'
import { EssayService } from '@/api/services/essay'
import { useAuthStore } from '@/stores/auth'
import type { Essay } from '@/types'

const router = useRouter()
const authStore = useAuthStore()

// 状态
const loading = ref(false)
const allUserEssays = ref<Essay[]>([])

// 筛选表单
const filterForm = reactive({
  essayType: '',
  keyword: ''
})

// 文书类型选项 (统一为对象数组)
const essayTypesForFilter = [
  { label: '所有类型', value: '' },
  { label: '个人陈述', value: 'PERSONAL_STATEMENT' },
  { label: '目的声明 (SOP)', value: 'STATEMENT_OF_PURPOSE' },
  { label: '多元化声明', value: 'DIVERSITY_STATEMENT' },
  { label: '为何选择这所学校', value: 'WHY_THIS_SCHOOL' },
  { label: '课外活动', value: 'EXTRACURRICULAR_ACTIVITY' },
  { label: '挑战经历', value: 'CHALLENGE' },
  { label: '领导力经历', value: 'LEADERSHIP' },
  { label: '未来目标', value: 'FUTURE_GOALS' },
  { label: '补充文书', value: 'SUPPLEMENTAL' },
  { label: '其他', value: 'OTHER' }
]

// 从英文枚举值获取中文标签的映射或函数
const getEssayTypeLabel = (value?: string) => {
  if (!value) return '未知类型';
  const foundType = essayTypesForFilter.find(t => t.value === value);
  return foundType ? foundType.label : value;
};

// 计算属性，用于根据筛选条件显示文书
const filteredEssays = computed(() => {
  return allUserEssays.value.filter(essay => {
    const typeMatch = filterForm.essayType ? essay.essayType === filterForm.essayType : true;
    const keywordMatch = filterForm.keyword 
      ? (essay.title?.toLowerCase().includes(filterForm.keyword.toLowerCase()) || 
         essay.content?.toLowerCase().includes(filterForm.keyword.toLowerCase())) 
      : true;
    return typeMatch && keywordMatch;
  });
});

// 获取文书列表
const fetchEssays = async () => {
  if (!authStore.user?.id) {
    allUserEssays.value = [];
    return;
  }
  
  loading.value = true
  try {
    const userEssays = await EssayService.getUserEssays(authStore.user.id)
    allUserEssays.value = userEssays || []; 
  } catch (error) {
    console.error('获取文书列表失败:', error)
    ElMessage.error('获取文书列表失败')
    allUserEssays.value = [];
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  ElMessage.info('筛选已应用');
}

// 重置筛选
const resetFilter = () => {
  filterForm.essayType = ''
  filterForm.keyword = ''
  ElMessage.info('筛选已重置');
}

// 查看文书
const viewEssay = (id: number) => {
  router.push(`/essay/${id}`)
}

// 编辑文书
const editEssay = (id: number) => {
  router.push(`/essay/edit/${id}`)
}

// 润色文书
const polishEssay = (id: number) => {
  router.push(`/essay/polish/${id}`)
}

// 确认删除
const confirmDelete = (essay: Essay) => {
  ElMessageBox.confirm(
    `确定要删除文书"${essay.title}"吗？`,
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      await EssayService.deleteEssay(essay.id)
      ElMessage.success('删除成功')
      fetchEssays()
    } catch (error) {
      console.error('删除文书失败:', error)
      ElMessage.error('删除失败')
    }
  })
}

// 格式化日期
const formatDate = (dateString?: string) => {
  if (!dateString) return '未知日期'
  
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// 获取字数
const getWordCount = (content?: string) => {
  if (!content) return 0
  return content.replace(/<[^>]+>/g, '').length
}

// 获取内容预览
const getContentPreview = (content?: string) => {
  if (!content) return ''
  const plainText = content.replace(/<[^>]+>/g, '')
  return plainText.length > 200 ? plainText.slice(0, 200) + '...' : plainText
}

// 组件挂载时获取数据
onMounted(() => {
  fetchEssays()
})
</script>

<style scoped lang="scss">
.essay-list-container {
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

.filter-card {
  margin-bottom: 24px;
}

.essay-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.essay-item {
  .essay-item-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 12px;

    .essay-title {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: #303133;
      cursor: pointer;
      
      &:hover {
        color: #409eff;
      }
    }
  }

  .essay-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 12px;
    font-size: 14px;
    color: #909399;
  }

  .essay-preview {
    font-size: 14px;
    color: #606266;
    line-height: 1.6;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3;
    overflow: hidden;
  }
}

@media (max-width: 768px) {
  .essay-list {
    grid-template-columns: 1fr;
  }
  
  .header-actions {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
    
    .el-button {
      width: 100%;
    }
  }
}
</style> 