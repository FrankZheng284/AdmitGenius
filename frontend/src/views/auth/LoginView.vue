<template>
  <div class="login-container">
    <h2 class="title">欢迎回来</h2>
    <p class="subtitle">登录您的账号继续使用 留学者指南</p>
    
    <el-form
      ref="loginFormRef"
      :model="loginForm"
      :rules="loginRules"
      class="login-form"
      status-icon
    >
      <el-form-item prop="email">
        <el-input
          v-model="loginForm.email"
          placeholder="邮箱"
          prefix-icon="Message"
        />
      </el-form-item>
      
      <el-form-item prop="password">
        <el-input
          v-model="loginForm.password"
          type="password"
          placeholder="密码"
          prefix-icon="Lock"
          show-password
        />
      </el-form-item>
      
      <div class="form-options">
        <el-checkbox v-model="rememberMe">记住我</el-checkbox>
        <router-link to="/auth/reset-password" class="forgot-password">忘记密码?</router-link>
      </div>
      
      <el-form-item>
        <el-button
          type="primary"
          class="login-button"
          :loading="loading"
          @click="handleLogin"
        >
          登录
        </el-button>

        <div v-if="config.api.useMockData" class="mock-option">
          <el-button 
            type="success" 
            plain 
            class="mock-button" 
            :loading="loading" 
            @click="handleMockLogin"
          >
            演示模式登录
          </el-button>
          <div class="mock-tip">无需真实账号，用于演示</div>
        </div>
      </el-form-item>
    </el-form>
    
    <div class="register-link">
      还没有账号? <router-link to="/auth/register">立即注册</router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Message, Lock } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import { useMockAuthStore } from '@/stores/mockAuth'
import { config } from '@/config'
import type { FormInstance, FormRules } from 'element-plus'

const router = useRouter()
const authStore = useAuthStore()
const mockAuthStore = useMockAuthStore()
const loginFormRef = ref<FormInstance>()
const loading = ref(false)
const rememberMe = ref(false)

// 登录表单数据
const loginForm = reactive({
  email: '',
  password: ''
})

// 表单验证规则
const loginRules = reactive<FormRules>({
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少为6个字符', trigger: 'blur' }
  ]
})

// 登录处理
const handleLogin = async () => {
  if (!loginFormRef.value) return
  
  await loginFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      
      try {
        const success = await authStore.login(loginForm.email, loginForm.password)
        
        if (success) {
          router.push('/dashboard')
        } else {
          ElMessage.error('登录失败，请检查您的邮箱和密码')
        }
      } catch (error) {
        console.error('Login error:', error)
        ElMessage.error('登录时发生错误，请稍后重试')
      } finally {
        loading.value = false
      }
    }
  })
}

// 模拟登录处理
const handleMockLogin = async () => {
  loading.value = true
  
  try {
    // 使用固定的演示账号
    const success = await mockAuthStore.login('demo@example.com', 'password123')
    
    if (success) {
      router.push('/dashboard')
    } else {
      ElMessage.error('演示模式登录失败')
    }
  } catch (error) {
    console.error('Mock login error:', error)
    ElMessage.error('登录时发生错误')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="scss">
.login-container {
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

.login-form {
  margin-bottom: 24px;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  
  .forgot-password {
    color: #409EFF;
    text-decoration: none;
    font-size: 14px;
    
    &:hover {
      text-decoration: underline;
    }
  }
}

.login-button {
  width: 100%;
  padding: 12px 20px;
  font-size: 16px;
}

.mock-option {
  margin-top: 16px;
  text-align: center;
}

.mock-button {
  width: 100%;
}

.mock-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 8px;
}

.register-link {
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
</style> 