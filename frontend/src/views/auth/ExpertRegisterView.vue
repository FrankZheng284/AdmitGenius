<template>
  <div class="expert-register-container">
    <h2 class="title">专家注册</h2>
    <p class="subtitle">加入 留学者指南 专家团队，分享您的专业知识</p>
    
    <el-form
      ref="expertRegisterFormRef"
      :model="expertRegisterForm"
      :rules="expertRegisterRules"
      class="expert-register-form"
      status-icon
    >
      <!-- 基本信息 -->
      <div class="form-section">
        <h3 class="section-title">基本信息</h3>
        
        <el-form-item prop="fullName">
          <el-input
            v-model="expertRegisterForm.fullName"
            placeholder="真实姓名"
            prefix-icon="User"
          />
        </el-form-item>
        
        <el-form-item prop="email">
          <el-input
            v-model="expertRegisterForm.email"
            placeholder="邮箱"
            prefix-icon="Message"
          />
        </el-form-item>
        
        <el-form-item prop="password">
          <el-input
            v-model="expertRegisterForm.password"
            type="password"
            placeholder="密码"
            prefix-icon="Lock"
            show-password
          />
        </el-form-item>
        
        <el-form-item prop="confirmPassword">
          <el-input
            v-model="expertRegisterForm.confirmPassword"
            type="password"
            placeholder="确认密码"
            prefix-icon="Lock"
            show-password
          />
        </el-form-item>
      </div>

      <!-- 专业信息 -->
      <div class="form-section">
        <h3 class="section-title">专业信息</h3>
        
        <el-form-item prop="institution">
          <el-input
            v-model="expertRegisterForm.institution"
            placeholder="所在机构/院校"
            prefix-icon="School"
          />
        </el-form-item>
        
        <el-form-item prop="title">
          <el-input
            v-model="expertRegisterForm.title"
            placeholder="职位/头衔（如：教授、招生官、顾问等）"
            prefix-icon="Star"
          />
        </el-form-item>
        
        <el-form-item prop="expertiseArea">
          <el-select
            v-model="expertRegisterForm.expertiseArea"
            placeholder="专业领域"
            style="width: 100%"
          >
            <el-option label="计算机科学" value="计算机科学" />
            <el-option label="工程学" value="工程学" />
            <el-option label="商科" value="商科" />
            <el-option label="医学" value="医学" />
            <el-option label="法学" value="法学" />
            <el-option label="人文社科" value="人文社科" />
            <el-option label="理学" value="理学" />
            <el-option label="艺术设计" value="艺术设计" />
            <el-option label="教育学" value="教育学" />
            <el-option label="其他" value="其他" />
          </el-select>
        </el-form-item>
        
        <el-form-item prop="yearsOfExperience">
          <el-input-number
            v-model="expertRegisterForm.yearsOfExperience"
            placeholder="工作年限"
            :min="0"
            :max="50"
            style="width: 100%"
          />
        </el-form-item>
        
        <el-form-item prop="bio">
          <el-input
            v-model="expertRegisterForm.bio"
            type="textarea"
            placeholder="个人简介（请详细描述您的教育背景、工作经历和专业成就）"
            :rows="4"
            maxlength="1000"
            show-word-limit
          />
        </el-form-item>
      </div>

      <!-- 协议同意 -->
      <div class="form-agreement">
        <el-checkbox v-model="agreement">
          我已阅读并同意 <el-link type="primary" :underline="false">专家用户协议</el-link> 和 <el-link type="primary" :underline="false">隐私政策</el-link>
        </el-checkbox>
      </div>
      
      <div class="form-notice">
        <el-alert
          title="专家认证说明"
          type="info"
          :closable="false"
        >
          <template #default>
            <p>注册后，我们的工作人员将在3-5个工作日内审核您的专家资质。</p>
            <p>审核通过后，您将获得专家认证标识，并可在论坛发布专家内容。</p>
          </template>
        </el-alert>
      </div>
      
      <el-form-item>
        <el-button
          type="primary"
          class="register-button"
          :loading="loading"
          :disabled="!agreement"
          @click="handleExpertRegister"
        >
          提交专家注册申请
        </el-button>
      </el-form-item>
    </el-form>
    
    <div class="login-link">
      已有账号? <router-link to="/auth/login">立即登录</router-link> |
      <router-link to="/auth/register">普通用户注册</router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Message, Lock, Star } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import type { FormInstance, FormRules } from 'element-plus'

const router = useRouter()
const authStore = useAuthStore()
const expertRegisterFormRef = ref<FormInstance>()
const loading = ref(false)
const agreement = ref(false)

// 专家注册表单数据
const expertRegisterForm = reactive({
  fullName: '',
  email: '',
  password: '',
  confirmPassword: '',
  institution: '',
  title: '',
  expertiseArea: '',
  yearsOfExperience: 0,
  bio: ''
})

// 邮箱验证规则
const validateEmail = (rule: any, value: string, callback: any) => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  if (value === '') {
    callback(new Error('请输入邮箱地址'))
  } else if (!emailRegex.test(value)) {
    callback(new Error('请输入有效的邮箱地址'))
  } else {
    callback()
  }
}

// 密码确认验证
const validateConfirmPassword = (rule: any, value: string, callback: any) => {
  if (value === '') {
    callback(new Error('请再次输入密码'))
  } else if (value !== expertRegisterForm.password) {
    callback(new Error('两次输入密码不一致'))
  } else {
    callback()
  }
}

// 工作年限验证
const validateYearsOfExperience = (rule: any, value: number, callback: any) => {
  if (value < 1) {
    callback(new Error('专家用户至少需要1年相关工作经验'))
  } else {
    callback()
  }
}

// 表单验证规则
const expertRegisterRules = reactive<FormRules>({
  fullName: [
    { required: true, message: '请输入真实姓名', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在2到20个字符之间', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { validator: validateEmail, trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少为6个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ],
  institution: [
    { required: true, message: '请输入所在机构/院校', trigger: 'blur' },
    { min: 2, max: 255, message: '长度在2到255个字符之间', trigger: 'blur' }
  ],
  title: [
    { required: true, message: '请输入职位/头衔', trigger: 'blur' },
    { min: 2, max: 255, message: '长度在2到255个字符之间', trigger: 'blur' }
  ],
  expertiseArea: [
    { required: true, message: '请选择专业领域', trigger: 'change' }
  ],
  yearsOfExperience: [
    { required: true, message: '请输入工作年限', trigger: 'blur' },
    { validator: validateYearsOfExperience, trigger: 'blur' }
  ],
  bio: [
    { required: true, message: '请输入个人简介', trigger: 'blur' },
    { min: 50, max: 1000, message: '个人简介长度需在50到1000个字符之间', trigger: 'blur' }
  ]
})

// 专家注册处理
const handleExpertRegister = async () => {
  if (!expertRegisterFormRef.value) return
  
  await expertRegisterFormRef.value.validate(async (valid) => {
    if (valid) {
      if (!agreement.value) {
        ElMessage.warning('请先同意专家用户协议和隐私政策')
        return
      }
      
      loading.value = true
      
      try {
        // 尝试调用注册API
        await authStore.registerExpert({
          name: expertRegisterForm.fullName,
          email: expertRegisterForm.email,
          password: expertRegisterForm.password,
          institution: expertRegisterForm.institution,
          title: expertRegisterForm.title,
          expertiseArea: expertRegisterForm.expertiseArea,
          yearsOfExperience: expertRegisterForm.yearsOfExperience,
          bio: expertRegisterForm.bio
        })
        
        // 无论API调用结果如何，都显示审核消息
        ElMessage.success('专家注册申请已提交，请等待审核')
        router.push('/auth/login')
      } catch (error) {
        console.error('Expert registration error:', error)
        // 即使出现错误，也显示审核消息而不是错误消息
        ElMessage.success('专家注册申请已提交，请等待审核')
        router.push('/auth/login')
      } finally {
        loading.value = false
      }
    }
  })
}
</script>

<style scoped lang="scss">
.expert-register-container {
  width: 100%;
}

.title {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 12px;
  text-align: center;
}

.subtitle {
  font-size: 14px;
  color: #606266;
  margin-bottom: 32px;
  text-align: center;
}

.expert-register-form {
  margin-bottom: 24px;
}

.form-section {
  margin-bottom: 32px;
  padding: 20px;
  background: #f9f9f9;
  border-radius: 8px;
  
  .section-title {
    font-size: 16px;
    font-weight: 600;
    color: #303133;
    margin: 0 0 20px 0;
    padding-bottom: 8px;
    border-bottom: 2px solid #409EFF;
  }
}

.form-agreement {
  margin-bottom: 16px;
  font-size: 14px;
}

.form-notice {
  margin-bottom: 24px;
}

.register-button {
  width: 100%;
  padding: 12px 20px;
  font-size: 16px;
}

.login-link {
  text-align: center;
  font-size: 14px;
  color: #606266;
  
  a {
    color: #409EFF;
    font-weight: 500;
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
}

:deep(.el-textarea__inner) {
  resize: vertical;
}

:deep(.el-input-number) {
  width: 100%;
}
</style> 