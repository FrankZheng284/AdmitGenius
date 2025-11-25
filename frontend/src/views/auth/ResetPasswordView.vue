<template>
  <div class="reset-password-container">
    <h2 class="title">重置密码</h2>
    <p class="subtitle">请输入您的邮箱地址，我们将向您发送重置密码的链接</p>
    
    <el-form
      ref="resetFormRef"
      :model="resetForm"
      :rules="resetRules"
      class="reset-form"
      status-icon
    >
      <el-form-item prop="email">
        <el-input
          v-model="resetForm.email"
          placeholder="邮箱"
          prefix-icon="Message"
        />
      </el-form-item>
      
      <el-form-item>
        <el-button
          type="primary"
          class="reset-button"
          :loading="loading"
          @click="handleResetPassword"
        >
          发送重置链接
        </el-button>
      </el-form-item>
    </el-form>
    
    <div class="login-link">
      记起密码了? <router-link to="/auth/login">返回登录</router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Message } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import type { FormInstance, FormRules } from 'element-plus'

const router = useRouter()
const authStore = useAuthStore()
const resetFormRef = ref<FormInstance>()
const loading = ref(false)

// 重置密码表单数据
const resetForm = reactive({
  email: ''
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

// 表单验证规则
const resetRules = reactive<FormRules>({
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { validator: validateEmail, trigger: 'blur' }
  ]
})

// 重置密码处理
const handleResetPassword = async () => {
  if (!resetFormRef.value) return
  
  await resetFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      
      try {
        // 这里需要调用后端API发送重置密码邮件
        // const success = await authStore.sendResetPasswordEmail(resetForm.email)
        
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        ElMessage.success('重置密码链接已发送到您的邮箱')
        router.push('/auth/login')
      } catch (error) {
        console.error('Reset password error:', error)
        ElMessage.error('发送重置链接失败，请稍后重试')
      } finally {
        loading.value = false
      }
    }
  })
}
</script>

<style scoped lang="scss">
.reset-password-container {
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

.reset-form {
  margin-bottom: 24px;
}

.reset-button {
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
</style> 