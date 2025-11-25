<template>
  <div class="register-container">
    <h2 class="title">创建账号</h2>
    <p class="subtitle">加入 留学者指南，开启您的留学申请之旅</p>
    
    <el-form
      ref="registerFormRef"
      :model="registerForm"
      :rules="registerRules"
      class="register-form"
      status-icon
    >
      <el-form-item prop="fullName">
        <el-input
          v-model="registerForm.fullName"
          placeholder="姓名"
          prefix-icon="User"
        />
      </el-form-item>
      
      <el-form-item prop="email">
        <el-input
          v-model="registerForm.email"
          placeholder="邮箱"
          prefix-icon="Message"
        />
      </el-form-item>
      
      <el-form-item prop="password">
        <el-input
          v-model="registerForm.password"
          type="password"
          placeholder="密码"
          prefix-icon="Lock"
          show-password
        />
      </el-form-item>
      
      <el-form-item prop="confirmPassword">
        <el-input
          v-model="registerForm.confirmPassword"
          type="password"
          placeholder="确认密码"
          prefix-icon="Lock"
          show-password
        />
      </el-form-item>
      
      <el-collapse v-model="activeCollapse">
        <el-collapse-item title="教育背景（选填）" name="education">
          <el-form-item prop="currentSchool">
            <el-input
              v-model="registerForm.currentSchool"
              placeholder="本科院校"
              prefix-icon="School"
            />
          </el-form-item>
          
          <div class="form-row">
            <el-form-item prop="gpa" class="form-item-half">
              <el-input
                v-model.number="registerForm.gpa"
                placeholder="GPA"
                type="number"
              />
            </el-form-item>
            
            <el-form-item prop="greScore" class="form-item-half">
              <el-input
                v-model.number="registerForm.greScore"
                placeholder="GRE 分数"
                type="number"
              />
            </el-form-item>
          </div>
        </el-collapse-item>
      </el-collapse>
      
      <div class="form-agreement">
        <el-checkbox v-model="agreement">
          我已阅读并同意 <el-link type="primary" :underline="false">用户协议</el-link> 和 <el-link type="primary" :underline="false">隐私政策</el-link>
        </el-checkbox>
      </div>
      
      <el-form-item>
        <el-button
          type="primary"
          class="register-button"
          :loading="loading"
          :disabled="!agreement"
          @click="handleRegister"
        >
          注册
        </el-button>
      </el-form-item>
    </el-form>
    
    <div class="login-link">
      已有账号? <router-link to="/auth/login">立即登录</router-link> |
      <router-link to="/auth/register-expert">专家注册</router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Message, Lock, School } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import type { FormInstance, FormRules } from 'element-plus'

const router = useRouter()
const authStore = useAuthStore()
const registerFormRef = ref<FormInstance>()
const loading = ref(false)
const agreement = ref(false)
const activeCollapse = ref<string[]>([])

// 注册表单数据
const registerForm = reactive({
  fullName: '',
  email: '',
  password: '',
  confirmPassword: '',
  currentSchool: '',
  gpa: undefined as number | undefined,
  greScore: undefined as number | undefined
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
  } else if (value !== registerForm.password) {
    callback(new Error('两次输入密码不一致'))
  } else {
    callback()
  }
}

// GPA验证
const validateGpa = (rule: any, value: number | undefined, callback: any) => {
  if (value !== undefined) {
    if (value < 0 || value > 4.0) {
      callback(new Error('GPA应在0-4.0之间'))
    } else {
      callback()
    }
  } else {
    callback()
  }
}

// 表单验证规则
const registerRules = reactive<FormRules>({
  fullName: [
    { required: true, message: '请输入姓名', trigger: 'blur' },
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
  gpa: [
    { validator: validateGpa, trigger: 'blur' }
  ]
})

// 注册处理
const handleRegister = async () => {
  if (!registerFormRef.value) return
  
  await registerFormRef.value.validate(async (valid) => {
    if (valid) {
      if (!agreement.value) {
        ElMessage.warning('请先同意用户协议和隐私政策')
        return
      }
      
      loading.value = true
      
      try {
        const success = await authStore.register({
          name: registerForm.fullName,
          email: registerForm.email,
          password: registerForm.password,
          currentSchool: registerForm.currentSchool || undefined,
          gpa: registerForm.gpa,
          greScore: registerForm.greScore
        })
        
        if (success) {
          ElMessage.success('注册成功，请登录')
          router.push('/auth/login')
        } else {
          ElMessage.error('注册失败，请稍后重试')
        }
      } catch (error) {
        console.error('Registration error:', error)
        ElMessage.error('注册时发生错误，请稍后重试')
      } finally {
        loading.value = false
      }
    }
  })
}
</script>

<style scoped lang="scss">
.register-container {
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

.register-form {
  margin-bottom: 24px;
}

.form-row {
  display: flex;
  gap: 12px;
  margin-bottom: 22px;
  
  .form-item-half {
    flex: 1;
    margin-bottom: 0;
  }
}

.form-agreement {
  margin-bottom: 24px;
  font-size: 14px;
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

:deep(.el-collapse) {
  border: none;
  margin-bottom: 24px;
  
  .el-collapse-item__header {
    font-size: 14px;
    color: #606266;
    border-bottom: none;
  }
  
  .el-collapse-item__wrap {
    border-bottom: none;
  }
}
</style> 