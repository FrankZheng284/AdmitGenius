<template>
  <div class="essay-edit-container">
    <div class="header-actions">
      <h1 class="page-title">编辑文书</h1>
      <div class="buttons">
        <el-button @click="goBack">
          <el-icon><ArrowLeft /></el-icon>
          返回列表
        </el-button>
        <el-button type="primary" @click="saveEssay" :loading="saving">
          <el-icon><Check /></el-icon>
          保存修改
        </el-button>
      </div>
    </div>
    
    <el-card v-loading="loading">
      <el-form :model="essayForm" label-position="top" :rules="rules" ref="formRef">
        <el-row :gutter="20">
          <el-col :xs="24" :sm="12">
            <el-form-item label="文书标题" prop="title">
              <el-input v-model="essayForm.title" placeholder="请输入文书标题" />
            </el-form-item>
          </el-col>
          
          <el-col :xs="24" :sm="12">
            <el-form-item label="文书类型" prop="essayType">
              <el-select v-model="essayForm.essayType" placeholder="请选择文书类型" style="width: 100%">
                <el-option
                  v-for="type in essayTypes"
                  :key="type.value"
                  :label="type.label"
                  :value="type.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          
          <el-col :xs="24" :sm="12">
            <el-form-item label="状态">
              <el-select v-model="essayForm.status" placeholder="请选择状态" style="width: 100%">
                <el-option label="草稿" value="DRAFT" />
                <el-option label="已完成" value="COMPLETED" />
              </el-select>
            </el-form-item>
          </el-col>
          
          <el-col :xs="24" :sm="12">
            <el-form-item label="申请院校">
              <el-select
                v-model="essayForm.schoolId"
                placeholder="请选择申请院校（可选）"
                filterable
                clearable
                style="width: 100%"
              >
                <el-option
                  v-for="school in schools"
                  :key="school.id"
                  :label="school.name"
                  :value="school.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          
          <el-col :xs="24" :sm="12">
            <el-form-item label="字数限制">
              <el-input-number v-model="essayForm.wordLimit" :min="0" :max="10000" placeholder="字数限制（可选）" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="文书提示（Prompt）">
          <el-input
            v-model="essayForm.prompt"
            type="textarea"
            :rows="3"
            placeholder="输入申请文书要求/提示（例如：请描述您为什么选择这所学校，以及您的职业规划）"
          />
        </el-form-item>
        
        <el-form-item label="文书内容" prop="content">
          <el-input
            v-model="essayForm.content"
            type="textarea"
            :rows="15"
            placeholder="开始撰写您的文书..."
          />
        </el-form-item>
      </el-form>
      
      <div class="form-actions">
        <el-space>
          <el-button @click="goBack">取消</el-button>
          <el-button type="primary" @click="saveEssay" :loading="saving">保存修改</el-button>
          
          <el-popconfirm
            title="确定优化文书吗？这将基于当前内容进行AI优化"
            width="280"
            @confirm="openPolishDialog"
          >
            <template #reference>
              <el-button type="success" :loading="generating">
                <el-icon><MagicStick /></el-icon>
                AI优化
              </el-button>
            </template>
          </el-popconfirm>

          <el-button type="info" @click="importPersonalInfo">
            <el-icon><Upload /></el-icon>
            导入个人信息
          </el-button>
        </el-space>
      </div>
    </el-card>

    <!-- AI优化选项对话框 -->
    <el-dialog
      v-model="showPolishDialog"
      title="AI文书优化选项"
      width="500px"
    >
      <el-form :model="polishOptions" label-position="top">
        <el-form-item label="优化重点">
          <el-checkbox-group v-model="polishOptions.focusAreas">
            <el-checkbox label="improveStructure">改善文章结构</el-checkbox>
            <el-checkbox label="enhanceLanguage">提升语言表达</el-checkbox>
            <el-checkbox label="checkGrammar">语法检查</el-checkbox>
            <el-checkbox label="reduceClichés">减少陈词滥调</el-checkbox>
            <el-checkbox label="addExamples">添加具体例子</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        
        <el-form-item label="语言风格">
          <el-select v-model="polishOptions.tonePreference" placeholder="选择语言风格" style="width: 100%">
            <el-option label="专业正式" value="professional" />
            <el-option label="个人化表达" value="personal" />
            <el-option label="学术严谨" value="academic" />
            <el-option label="故事叙述" value="narrative" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="目标字数">
          <el-input-number 
            v-model="polishOptions.targetWordCount" 
            :min="100" 
            :max="2000" 
            :step="50"
            style="width: 100%" 
          />
        </el-form-item>
        
        <el-form-item label="特别要求">
          <el-input
            v-model="polishOptions.customDescription"
            type="textarea"
            :rows="3"
            placeholder="请描述您希望重点优化的方面或特殊要求..."
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showPolishDialog = false">取消</el-button>
          <el-button type="primary" @click="confirmPolishEssay" :loading="generating">
            开始优化
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Check, MagicStick, Upload } from '@element-plus/icons-vue'
import { EssayService } from '@/api/services/essay'
import RecommendationService from '@/api/services/recommendation'
import { useAuthStore } from '@/stores/auth'
import type { FormInstance } from 'element-plus'
import type { School, Essay } from '@/types'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const formRef = ref<FormInstance>()

// 状态
const loading = ref(false)
const saving = ref(false)
const generating = ref(false)
const showPolishDialog = ref(false)
const schools = ref<School[]>([])

// 文书表单
const essayForm = reactive<Partial<Essay>>({
  id: undefined,
  title: '',
  content: '',
  essayType: undefined,
  userId: authStore.user?.id,
  schoolId: undefined,
  wordLimit: undefined,
  prompt: '',
  status: 'DRAFT'
})

// AI优化选项
const polishOptions = reactive({
  focusAreas: [] as string[],
  tonePreference: 'personal',
  targetWordCount: 500,
  customDescription: ''
})

// 文书类型选项
const essayTypes = [
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

// 表单验证规则
const rules = {
  title: [
    { required: true, message: '请输入文书标题', trigger: 'blur' },
    { min: 2, max: 100, message: '标题长度应在2到100个字符之间', trigger: 'blur' }
  ],
  essayType: [
    { required: true, message: '请选择文书类型', trigger: 'change' }
  ],
  content: [
    { required: true, message: '请输入文书内容', trigger: 'blur' }
  ]
}

interface Education {
  school: string
  major: string
  degree: string
  startDate: string
  endDate: string
  gpa?: number
  description?: string
}

interface Project {
  name: string
  role: string
  startDate: string
  endDate: string
  description?: string
}

interface WorkExperience {
  company: string
  position: string
  startDate: string
  endDate: string
  description?: string
}

interface UserProfile {
  education: Education[]
  projects: Project[]
  workExperience: WorkExperience[]
}

// 获取学校列表
const fetchSchools = async () => {
  try {
    const schoolData = await RecommendationService.getAllSchools({ page: 0, size: 1000 });
    if (schoolData && schoolData.content) {
      const validSchools = schoolData.content.filter(school => school && school.id !== undefined && school.name !== undefined);
      if (validSchools.length !== schoolData.content.length) {
        console.warn('Some schools were filtered out from dropdown in EssayEditView due to missing id or name.');
      }
      schools.value = validSchools;
    } else {
      schools.value = [];
    }
  } catch (error) {
    console.error('Error fetching schools in EssayEditView:', error);
    ElMessage.error('获取学校列表失败');
  }
}

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
    const essayData = await EssayService.getEssayById(essayId)
    if (essayData && typeof essayData.id !== 'undefined') {
      Object.assign(essayForm, essayData)
      // 设置默认目标字数
      polishOptions.targetWordCount = essayForm.wordLimit || 500
    } else {
      ElMessage.error('获取文书失败')
      console.error('Failed to fetch essay details or data invalid for ID:', essayId, essayData)
    }
  } catch (error) {
    console.error('获取文书详情失败:', error)
    ElMessage.error('获取文书详情失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 保存文书
const saveEssay = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    if (!essayForm.id) {
      ElMessage.error('文书ID丢失，无法更新')
      return
    }
    
    saving.value = true
    const updatedEssay = await EssayService.updateEssay(essayForm.id, essayForm as Essay)
    
    if (updatedEssay && updatedEssay.id) {
      ElMessage.success('文书修改成功')
      router.push(`/essay/${updatedEssay.id}`)
    } else {
      console.error('更新文书失败: 返回结果无效', updatedEssay)
    }
  } catch (error) {
    console.error('保存文书修改失败:', error)
  } finally {
    saving.value = false
  }
}

// 返回列表
const goBack = () => {
  router.push('/essay')
}

// 打开AI优化对话框
const openPolishDialog = () => {
  if (!essayForm.content || essayForm.content.trim().length === 0) {
    ElMessage.warning('请先填写文书内容再进行AI优化')
    return
  }
  
  showPolishDialog.value = true
}

// 确认AI优化
const confirmPolishEssay = async () => {
  if (!essayForm.id || !authStore.user?.id) {
    ElMessage.error('用户信息或文书ID缺失')
    return
  }
  
  if (polishOptions.focusAreas.length === 0) {
    ElMessage.warning('请至少选择一个优化重点')
    return
  }
  
  generating.value = true
  showPolishDialog.value = false
  
  try {
    ElMessage.info('AI正在优化您的文书，请耐心等待（可能需要30-60秒）...')
    
    // 构建优化参数
    const polishData = {
      userId: authStore.user.id,
      improveStructure: polishOptions.focusAreas.includes('improveStructure'),
      enhanceLanguage: polishOptions.focusAreas.includes('enhanceLanguage'),
      checkGrammar: polishOptions.focusAreas.includes('checkGrammar'),
      reduceClichés: polishOptions.focusAreas.includes('reduceClichés'),
      addExamples: polishOptions.focusAreas.includes('addExamples'),
      tonePreference: polishOptions.tonePreference,
      targetWordCount: polishOptions.targetWordCount,
      customDescription: polishOptions.customDescription,
      focusPoints: polishOptions.customDescription ? [polishOptions.customDescription] : [],
      avoidPoints: []
    }
    
    const polishedEssay = await EssayService.polishEssay(essayForm.id, polishData)
    
    if (polishedEssay && polishedEssay.content) {
      essayForm.content = polishedEssay.content
      ElMessage.success('AI文书优化完成！请查看优化后的内容')
    } else {
      ElMessage.error('文书优化失败，请稍后重试')
      console.error('Polish essay failed: invalid response', polishedEssay)
    }
  } catch (error) {
    console.error('AI优化文书失败:', error)
    ElMessage.error('AI优化失败，请检查网络连接后重试')
  } finally {
    generating.value = false
  }
}

// 导入个人信息
const importPersonalInfo = async () => {
  try {
    let importedContent = ''
    
    // 获取用户基本信息
    const userResponse = await EssayService.getUserProfile()
    if (userResponse.success && userResponse.data) {
      const userInfo = userResponse.data
      
      // 添加基本个人信息
      if (userInfo.fullName) {
        importedContent += `姓名：${userInfo.fullName}\n\n`
      }
      
      if (userInfo.bio) {
        importedContent += `个人简介：\n${userInfo.bio}\n\n`
      }
    }
    
    // 获取教育经历
    try {
      const educationResponse = await EssayService.getEducations()
      if (educationResponse.success && educationResponse.data && educationResponse.data.length > 0) {
        importedContent += '教育经历：\n'
        educationResponse.data.forEach((edu: any) => {
          importedContent += `- ${edu.school} (${edu.startDate} - ${edu.endDate})\n`
          importedContent += `  专业：${edu.major}\n`
          importedContent += `  学位：${edu.degree}\n`
          if (edu.achievement) importedContent += `  主要成就：${edu.achievement}\n`
          importedContent += '\n'
        })
      }
    } catch (error) {
      console.warn('获取教育经历失败:', error)
    }
    
    // 获取项目经历
    try {
      const projectResponse = await EssayService.getProjects()
      if (projectResponse.success && projectResponse.data && projectResponse.data.length > 0) {
        importedContent += '项目经历：\n'
        projectResponse.data.forEach((project: any) => {
          importedContent += `- ${project.name} (${project.startDate} - ${project.endDate})\n`
          importedContent += `  角色：${project.isLeader ? '负责人' : '成员'}\n`
          if (project.content) importedContent += `  项目内容：${project.content}\n`
          importedContent += '\n'
        })
      }
    } catch (error) {
      console.warn('获取项目经历失败:', error)
    }
    
    // 将导入的内容添加到文书内容中
    if (importedContent.trim()) {
      if (essayForm.content) {
        essayForm.content += '\n\n' + importedContent
      } else {
        essayForm.content = importedContent
      }
      
      ElMessage.success('个人信息导入成功')
    } else {
      ElMessage.warning('暂无个人信息可导入，请先在个人资料页面完善您的教育经历和项目经历')
    }
  } catch (error) {
    console.error('导入个人信息失败:', error)
    ElMessage.error('导入个人信息失败，请稍后重试')
  }
}

// 组件挂载时获取数据
onMounted(() => {
  fetchEssayDetail()
  fetchSchools()
})
</script>

<style scoped lang="scss">
.essay-edit-container {
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
  
  .buttons {
    display: flex;
    gap: 12px;
  }
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 24px;
}

@media (max-width: 768px) {
  .header-actions {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
    
    .buttons {
      width: 100%;
      justify-content: space-between;
    }
  }
  
  .form-actions {
    flex-direction: column;
    gap: 12px;
    
    .el-space {
      width: 100%;
      
      .el-button {
        width: 100%;
      }
    }
  }
}
</style> 