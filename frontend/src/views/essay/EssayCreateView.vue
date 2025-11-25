<template>
  <div class="essay-create-container">
    <div class="header-actions">
      <h1 class="page-title">创建文书</h1>
      <div class="buttons">
        <el-button @click="goBack">
          <el-icon><ArrowLeft /></el-icon>
          返回列表
        </el-button>
        <el-button type="primary" @click="saveEssay" :loading="saving">
          <el-icon><Check /></el-icon>
          保存文书
        </el-button>
      </div>
    </div>
    
    <el-card>
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
                  v-for="typeOption in essayTypes"
                  :key="typeOption.value"
                  :label="typeOption.label"
                  :value="typeOption.value"
                />
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
          <el-button type="primary" @click="saveEssay" :loading="saving">保存文书</el-button>
          
          <el-popconfirm
            title="确定生成AI文书吗？这将覆盖当前内容"
            width="220"
            @confirm="generateEssayContent"
          >
            <template #reference>
              <el-button type="success" :loading="generating">
                <el-icon><MagicStick /></el-icon>
                AI生成文书
              </el-button>
            </template>
          </el-popconfirm>

          <el-button type="info" @click="importPersonalInfo">
            <el-icon><Upload /></el-icon>
            导入个人信息
          </el-button>

          <el-button type="warning" @click="testPolishFunction">
            <el-icon><Tools /></el-icon>
            测试润色功能
          </el-button>
        </el-space>
      </div>
    </el-card>
    
    <el-dialog
      v-model="showAIOptionsDialog"
      title="AI文书生成选项"
      width="500px"
    >
      <el-form :model="aiOptions" label-position="top">
        <el-form-item label="文书风格">
          <el-select v-model="aiOptions.style" placeholder="选择文书风格" style="width: 100%">
            <el-option label="正式学术" value="academic" />
            <el-option label="专业简练" value="professional" />
            <el-option label="个性化表达" value="personal" />
            <el-option label="故事叙述" value="narrative" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="字数目标">
          <el-slider
            v-model="aiOptions.targetLength"
            :marks="{
              100: '100',
              300: '300',
              500: '500',
              700: '700',
              900: '900'
            }"
            :min="100"
            :max="1000"
            :step="50"
          />
        </el-form-item>
        
        <el-form-item label="其他要求或补充信息">
          <el-input
            v-model="aiOptions.additionalInfo"
            type="textarea"
            :rows="3"
            placeholder="添加关于您背景、经历或特定要突出的信息..."
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showAIOptionsDialog = false">取消</el-button>
          <el-button type="primary" @click="confirmGenerateEssay" :loading="generating">
            生成文书
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Check, MagicStick, Upload, Tools } from '@element-plus/icons-vue'
import { EssayService } from '@/api/services/essay'
import RecommendationService from '@/api/services/recommendation'
import { useAuthStore } from '@/stores/auth'
import type { FormInstance } from 'element-plus'
import type { School } from '@/types'

const router = useRouter()
const authStore = useAuthStore()
const formRef = ref<FormInstance>()

// 状态
const saving = ref(false)
const generating = ref(false)
const showAIOptionsDialog = ref(false)
const schools = ref<School[]>([])

// 定义个人信息相关类型
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

// 文书表单
const essayForm = reactive({
  title: '',
  content: '',
  essayType: 'PERSONAL_STATEMENT',
  userId: authStore.user?.id || 0,
  schoolId: undefined as number | undefined,
  wordLimit: undefined as number | undefined,
  prompt: ''
})

// AI生成选项
const aiOptions = reactive({
  style: 'personal',
  targetLength: 500,
  additionalInfo: ''
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

// 获取学校列表
const fetchSchools = async () => {
  try {
    const schoolData = await RecommendationService.getAllSchools({ page: 0, size: 1000 }); // Fetch a large list, assuming not too many schools for a dropdown
    if (schoolData && schoolData.content) {
      console.log('Fetched schools for dropdown:', JSON.stringify(schoolData.content.slice(0,5))); // Log first 5
      // Defensive check for undefined id or name before assigning
      const validSchools = schoolData.content.filter(school => school && school.id !== undefined && school.name !== undefined);
      if (validSchools.length !== schoolData.content.length) {
        console.warn('Some schools were filtered out due to missing id or name.');
      }
      schools.value = validSchools;
    } else {
      console.log('No school data content received or schoolData is null/undefined for dropdown.');
      schools.value = []; // Ensure it's an array even if no content
    }
  } catch (error) {
    console.error('Error fetching schools:', error)
    ElMessage.error('获取学校列表失败')
  }
}

// 保存文书
const saveEssay = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    
    saving.value = true
    const response = await EssayService.createEssay({
      ...essayForm
    })
    
    if (response && response.id) {
      ElMessage.success('文书保存成功')
      router.push(`/essay/${response.id}`)
    } else {
      console.error('保存文书后未能获取到有效的文书对象或ID:', response);
    }
  } catch (error) {
    console.error('保存文书失败:', error)
    ElMessage.error('保存文书失败，请检查表单并重试')
  } finally {
    saving.value = false
  }
}

// 打开AI生成选项对话框
const generateEssayContent = () => {
  if (!essayForm.title || !essayForm.essayType) {
    ElMessage.warning('请先填写文书标题和类型')
    return
  }
  
  showAIOptionsDialog.value = true
}

// 确认生成文书
const confirmGenerateEssay = async () => {
  generating.value = true
  showAIOptionsDialog.value = false
  
  try {
    const generateParams = {
      title: essayForm.title,
      essayType: essayForm.essayType,
      schoolId: essayForm.schoolId,
      wordLimit: essayForm.wordLimit || aiOptions.targetLength,
      prompt: essayForm.prompt,
      style: aiOptions.style,
      targetLength: aiOptions.targetLength,
      additionalInfo: aiOptions.additionalInfo,
      userId: authStore.user?.id || 0
    }
    
    const generatedEssay = await EssayService.generateEssay(generateParams)
    
    if (generatedEssay && typeof generatedEssay.content === 'string') {
      essayForm.content = generatedEssay.content
      ElMessage.success('AI文书生成成功')
    } else {
      console.error('AI 生成文书失败: 返回结果无效', generatedEssay)
    }
  } catch (error) {
    console.error('生成文书失败:', error)
    ElMessage.error('生成文书失败，请稍后重试')
  } finally {
    generating.value = false
  }
}

// 返回列表
const goBack = () => {
  router.push('/essay')
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

// 测试润色功能
const testPolishFunction = async () => {
  if (!essayForm.content || !essayForm.title) {
    ElMessage.warning('请先填写文书标题和内容后再测试润色功能')
    return
  }
  
  try {
    // 首先保存文书
    const savedEssay = await EssayService.createEssay({
      ...essayForm
    })
    
    if (savedEssay && savedEssay.id) {
      // 然后测试润色功能
      const polishData = {
        userId: authStore.user?.id || 0,
        improveStructure: true,
        enhanceLanguage: true,
        checkGrammar: true,
        customDescription: '这是润色功能测试'
      }
      
      const polishedEssay = await EssayService.polishEssay(savedEssay.id, polishData)
      
      if (polishedEssay) {
        ElMessage.success('润色功能测试成功！')
        essayForm.content = polishedEssay.content
      }
    }
  } catch (error) {
    console.error('润色功能测试失败:', error)
    ElMessage.error('润色功能测试失败，请检查后端服务和配置')
  }
}

// 组件挂载时获取数据
onMounted(() => {
  fetchSchools()
})
</script>

<style scoped lang="scss">
.essay-create-container {
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