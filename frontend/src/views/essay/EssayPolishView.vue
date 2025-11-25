<template>
  <div class="essay-polish-container">
    <div class="polish-header">
      <h1 class="page-title">文书润色 - {{ essay.title }}</h1>
      <div class="header-actions">
        <el-button @click="goBack">
          <el-icon><Back /></el-icon>
          返回详情
        </el-button>
        <el-button type="primary" @click="saveChanges" :loading="saving">
          <el-icon><Check /></el-icon>
          保存修改
        </el-button>
      </div>
    </div>

    <el-row :gutter="20" class="polish-main" v-loading="loading">
      <el-col :span="6">
        <el-card class="tools-card">
          <template #header>
            <div class="card-header">
              <h3>润色工具</h3>
            </div>
          </template>
          
          <div class="tools-section">
            <h4>优化需求</h4>
            <el-form :model="polishForm" label-position="top">
              <el-form-item>
                <el-checkbox-group v-model="polishForm.focusAreas">
                  <el-checkbox value="improveStructure">改善结构</el-checkbox>
                  <el-checkbox value="enhanceLanguage">提升语言</el-checkbox>
                  <el-checkbox value="checkGrammar">检查语法</el-checkbox>
                  <el-checkbox value="reduceClichés">减少陈词滥调</el-checkbox>
                  <el-checkbox value="addExamples">添加例证</el-checkbox>
                </el-checkbox-group>
              </el-form-item>
              
              <el-form-item label="关注点">
                <el-select
                  v-model="polishForm.focusPoints"
                  multiple
                  filterable
                  allow-create
                  default-first-option
                  placeholder="请输入或选择关注点"
                  style="width: 100%"
                >
                  <el-option
                    v-for="item in defaultFocusPoints"
                    :key="item"
                    :label="item"
                    :value="item"
                  />
                </el-select>
              </el-form-item>

              <el-form-item label="避免点">
                <el-select
                  v-model="polishForm.avoidPoints"
                  multiple
                  filterable
                  allow-create
                  default-first-option
                  placeholder="请输入或选择避免点"
                  style="width: 100%"
                >
                  <el-option
                    v-for="item in defaultAvoidPoints"
                    :key="item"
                    :label="item"
                    :value="item"
                  />
                </el-select>
                <div class="avoid-points-tips">
                  <el-tag size="small" type="info">提示：您可以输入自定义的避免点，或从常用选项中选择</el-tag>
                </div>
              </el-form-item>
              
              <el-form-item>
                <el-input
                  v-model="polishForm.customDescription"
                  type="textarea"
                  :rows="4"
                  placeholder="详细说明您的优化需求..."
                />
              </el-form-item>
            </el-form>
          </div>
          
          <div class="tools-section">
            <h4>语言风格</h4>
            <el-select v-model="polishForm.tonePreference" placeholder="选择语言风格" style="width: 100%">
              <el-option label="专业且个人化" value="专业且个人化" />
              <el-option label="学术严谨" value="学术严谨" />
              <el-option label="生动活泼" value="生动活泼" />
              <el-option label="简洁明了" value="简洁明了" />
            </el-select>
          </div>
          
          <div class="tools-section">
            <h4>目标字数</h4>
            <el-input-number 
              v-model="polishForm.targetWordCount" 
              :min="100" 
              :max="2000"
              style="width: 100%"
            />
          </div>
          
          <div class="tools-section">
            <h4>行动</h4>
            <div class="actions-buttons">
              <el-button type="primary" @click="generatePolish" :loading="polishing">
                <template v-if="polishing">
                  AI正在生成润色建议，请耐心等待...
                </template>
                <template v-else>
                  生成润色建议
                </template>
              </el-button>
              <el-button type="danger" @click="resetContent">
                重置内容
              </el-button>
            </div>
          </div>
        </el-card>
        
        <el-card class="stats-card">
          <template #header>
            <div class="card-header">
              <h3>文书统计</h3>
            </div>
          </template>
          
          <div class="stats-item">
            <span class="stats-label">字数</span>
            <span class="stats-value">{{ wordCount }}</span>
          </div>
          
          <div class="stats-item">
            <span class="stats-label">段落数</span>
            <span class="stats-value">{{ paragraphCount }}</span>
          </div>
          
          <div class="stats-item">
            <span class="stats-label">平均段落长度</span>
            <span class="stats-value">{{ avgParagraphLength }} 字</span>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="18">
        <el-card class="editor-card">
          <div class="editor-container">
            <el-input
              v-model="editableContent"
              type="textarea"
              :rows="20"
              resize="none"
            />
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Back, Check } from '@element-plus/icons-vue'
import { EssayService } from '@/api/services/essay'
import type { Essay } from '@/types'

const route = useRoute()
const router = useRouter()

// 状态
const loading = ref(false)
const polishing = ref(false)
const saving = ref(false)

// 数据
const essay = ref<Essay>({
  id: 0,
  title: '',
  content: '',
  userId: 0
})
const originalContent = ref('')
const editableContent = ref('')

// 表单
const defaultFocusPoints = [
  '突出个人特色',
  '强调学术成就',
  '展示领导能力',
  '体现创新思维',
  '突出研究兴趣',
  '强调职业目标',
  '展示团队合作',
  '体现跨文化能力'
]

const defaultAvoidPoints = [
  '避免过度谦虚',
  '避免使用陈词滥调',
  '避免过于口语化',
  '避免过于正式',
  '避免重复内容',
  '避免过于冗长',
  '避免过于简短',
  '避免偏离主题',
  '避免过度使用专业术语',
  '避免过于主观',
  '避免过于客观',
  '避免使用模糊表述',
  '避免使用过于夸张的形容词',
  '避免使用过于消极的词汇',
  '避免使用过于积极的词汇',
  '避免使用过于复杂的句式'
]

const polishForm = reactive({
  focusAreas: [] as string[],
  focusPoints: [] as string[],
  avoidPoints: [] as string[],
  customDescription: '',
  tonePreference: '专业且个人化',
  targetWordCount: 500
})

// 计算属性
const wordCount = computed(() => {
  if (!editableContent.value) return 0
  return editableContent.value.length
})

const paragraphCount = computed(() => {
  if (!editableContent.value) return 0
  return editableContent.value.split(/\n\n+/).filter(p => p.trim()).length
})

const avgParagraphLength = computed(() => {
  if (paragraphCount.value === 0) return 0
  return Math.round(wordCount.value / paragraphCount.value)
})

// 获取文书详情
const fetchEssayDetail = async () => {
  const essayId = Number(route.params.id)
  if (!essayId) {
    ElMessage.error('文书ID无效')
    router.push('/essay')
    return
  }
  
  loading.value = true
  try {
    const response = await EssayService.getEssayById(essayId)
    if (response) {
      essay.value = response
      originalContent.value = response.content || ''
      editableContent.value = response.content || ''
    } else {
      ElMessage.error('获取文书失败')
      router.push('/essay')
    }
  } catch (error) {
    console.error('获取文书详情失败:', error)
    ElMessage.error('获取文书详情失败，请稍后重试')
    router.push('/essay')
  } finally {
    loading.value = false
  }
}

// 生成润色建议
const generatePolish = async () => {
  if (!essay.value.id || !essay.value.userId) return
  
  // 检查是否选择了润色选项
  if (polishForm.focusAreas.length === 0) {
    ElMessage.warning('请至少选择一个优化需求')
    return
  }
  
  polishing.value = true
  
  // 显示开始提示
  ElMessage.info('AI正在分析您的文书，请耐心等待（可能需要30-60秒）...')
  
  try {
    const polishData = {
      userId: essay.value.userId,
      improveStructure: polishForm.focusAreas.includes('improveStructure'),
      enhanceLanguage: polishForm.focusAreas.includes('enhanceLanguage'),
      checkGrammar: polishForm.focusAreas.includes('checkGrammar'),
      reduceClichés: polishForm.focusAreas.includes('reduceClichés'),
      addExamples: polishForm.focusAreas.includes('addExamples'),
      tonePreference: polishForm.tonePreference,
      customDescription: polishForm.customDescription,
      targetWordCount: polishForm.targetWordCount,
      focusPoints: polishForm.focusPoints,
      avoidPoints: polishForm.avoidPoints
    }
    
    const response = await EssayService.polishEssay(essay.value.id, polishData)
    
    if (response && response.content) {
      ElMessage.success('润色生成成功！')
      editableContent.value = response.content
    } else {
      ElMessage.error('生成润色建议失败')
    }
  } catch (error) {
    console.error('生成润色建议失败:', error)
    
    // 判断错误类型并给出相应提示
    const errorMessage = error instanceof Error ? error.message : String(error)
    if (errorMessage.includes('timeout')) {
      ElMessage.error('AI生成时间较长，请稍后重试。您也可以尝试缩短文书内容或简化润色要求。')
    } else if (errorMessage.includes('网络')) {
      ElMessage.error('网络连接问题，请检查网络后重试')
    } else {
      ElMessage.error('生成润色建议失败，请稍后重试')
    }
  } finally {
    polishing.value = false
  }
}

// 重置内容
const resetContent = () => {
  ElMessageBox.confirm(
    '确定要重置内容为原始版本吗？所有修改将丢失。',
    '重置内容',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    editableContent.value = originalContent.value
    ElMessage.success('内容已重置')
  }).catch(() => {
    // 取消操作
  })
}

// 保存修改
const saveChanges = async () => {
  if (!essay.value.id) return
  
  saving.value = true
  try {
    const updatedEssay = {
      ...essay.value,
      content: editableContent.value
    }
    
    const response = await EssayService.updateEssay(essay.value.id, updatedEssay)
    
    if (response && response.id) {
      ElMessage.success('文书已成功保存')
      router.push(`/essay/${essay.value.id}`)
    } else {
      ElMessage.error('保存失败')
    }
  } catch (error) {
    console.error('保存文书失败:', error)
    ElMessage.error('保存文书失败，请稍后重试')
  } finally {
    saving.value = false
  }
}

// 返回详情页
const goBack = () => {
  router.push(`/essay/${essay.value.id}`)
}

// 组件挂载时获取数据
onMounted(async () => {
  await fetchEssayDetail()
})
</script>

<style scoped lang="scss">
.essay-polish-container {
  padding: 20px;
  max-width: 1600px;
  margin: 0 auto;
}

.polish-header {
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
  
  .header-actions {
    display: flex;
    gap: 12px;
  }
}

.polish-main {
  margin-bottom: 30px;
}

.tools-card, .stats-card {
  margin-bottom: 20px;
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
    }
  }
  
  .tools-section {
    margin-bottom: 20px;
    
    &:last-child {
      margin-bottom: 0;
    }
    
    h4 {
      font-size: 14px;
      margin: 0 0 12px 0;
      color: #606266;
    }
    
    .actions-buttons {
      display: flex;
      flex-direction: column;
      gap: 10px;
      
      .el-button {
        width: 100% !important;
        margin: 0 !important;
        box-sizing: border-box;
        display: block;
      }
    }
  }
}

.stats-card {
  .stats-item {
    display: flex;
    justify-content: space-between;
    padding: 10px 0;
    border-bottom: 1px solid #EBEEF5;
    
    &:last-child {
      border-bottom: none;
    }
    
    .stats-label {
      color: #606266;
    }
    
    .stats-value {
      font-weight: 500;
      color: #303133;
    }
  }
}

.editor-card {
  .editor-container {
    .el-textarea {
      font-size: 16px;
      line-height: 1.8;
      
      ::v-deep(.el-textarea__inner) {
        padding: 15px;
        font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', Arial, sans-serif;
      }
    }
  }
}

.avoid-points-tips {
  margin-top: 8px;
  display: flex;
  justify-content: flex-start;
  
  .el-tag {
    white-space: normal !important;
    word-wrap: break-word;
    word-break: break-all;
    line-height: 1.5;
    max-width: 100%;
    height: auto !important;
  }
}
</style> 