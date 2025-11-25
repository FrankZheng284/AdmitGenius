import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '@/types'
import { AuthService } from '@/api/services/auth'
import { UserService } from '@/api/services/user'
import { ElMessage } from 'element-plus'

export const useAuthStore = defineStore('auth', () => {
  // 状态
  const token = ref<string | null>(localStorage.getItem('token'))
  const user = ref<User | null>(null)
  const loading = ref(false)

  // 计算属性
  const isAuthenticated = computed(() => !!token.value)
  const isAdmin = computed(() => user.value?.role === 'ADMIN')
  const isExpert = computed(() => user.value?.role === 'EXPERT')

  // 加载用户信息
  async function loadUser() {
    if (!token.value || !localStorage.getItem('userId')) return

    const userId = parseInt(localStorage.getItem('userId') || '0', 10)
    if (userId <= 0) return

    try {
      loading.value = true
      const userData = await UserService.getUserById(userId)
      if (userData) {
        user.value = userData
      }
    } catch (error) {
      console.error('Failed to load user:', error)
      // 如果加载用户信息失败，可能是令牌过期，清除登录状态
      logout()
    } finally {
      loading.value = false
    }
  }

  // 登录
  async function login(email: string, password: string) {
    try {
      loading.value = true
      const response = await AuthService.login({ email, password })
      if (response.data) {
        token.value = response.data.token
        user.value = response.data.user
        
        // 存储令牌和用户ID
        localStorage.setItem('token', response.data.token)
        localStorage.setItem('userId', String(response.data.user.id))
        
        ElMessage.success('登录成功')
        return true
      }
      return false
    } catch (error) {
      console.error('Login failed:', error)
      return false
    } finally {
      loading.value = false
    }
  }

  // 注册
  async function register(registerData: {
    email: string
    password: string
    name: string
    currentSchool?: string
    gpa?: number
    greScore?: number
    gmatScore?: number
  }) {
    try {
      loading.value = true
      const response = await AuthService.register(registerData)
      // 检查响应是否成功
      if (response && (response.success || response.data)) {
        ElMessage.success('注册成功，请登录')
        return true
      }
      return false
    } catch (error) {
      console.error('Registration failed:', error)
      return false
    } finally {
      loading.value = false
    }
  }

  // 专家注册
  async function registerExpert(expertData: {
    email: string
    password: string
    name: string
    institution: string
    title: string
    expertiseArea: string
    yearsOfExperience: number
    bio: string
  }) {
    try {
      loading.value = true
      const response = await AuthService.registerExpert(expertData)
      // 检查响应是否成功
      if (response && (response.success || response.data)) {
        ElMessage.success('专家注册申请提交成功，请等待审核')
        return true
      }
      return false
    } catch (error) {
      console.error('Expert registration failed:', error)
      return false
    } finally {
      loading.value = false
    }
  }

  // 登出
  function logout() {
    token.value = null
    user.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('userId')
  }

  function updateUser(userData: User) {
    user.value = userData
  }

  function clearUser() {
    user.value = null
  }

  // 初始化时加载用户信息
  if (token.value) {
    loadUser()
  }

  return {
    user,
    token,
    loading,
    isAuthenticated,
    isAdmin,
    isExpert,
    login,
    register,
    registerExpert,
    logout,
    loadUser,
    updateUser,
    clearUser
  }
}) 