import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '@/types/user'
import { ElMessage } from 'element-plus'
import { MockService } from '@/api/services/mock'

/**
 * 模拟认证状态存储
 * 用于在没有后端API的情况下模拟登录和认证
 */
export const useMockAuthStore = defineStore('mockAuth', () => {
  // 状态
  const token = ref<string | null>(localStorage.getItem('mockToken'))
  const user = ref<User | null>(null)
  const loading = ref(false)

  // 计算属性
  const isAuthenticated = computed(() => !!token.value)
  const isAdmin = computed(() => user.value?.role === 'ADMIN')

  // 加载用户信息
  function loadUser() {
    if (!token.value) return
    
    // 使用模拟数据
    user.value = MockService.getMockUser()
    console.log('已加载模拟用户数据', user.value)
  }

  // 模拟登录
  async function login(email: string, password: string) {
    try {
      loading.value = true
      
      // 简单模拟验证 - 任何非空值都能登录
      if (email && password) {
        // 生成模拟令牌
        const mockToken = 'mock_' + Math.random().toString(36).substring(2, 15)
        token.value = mockToken
        
        // 使用模拟用户数据
        user.value = MockService.getMockUser()
        
        // 存储令牌到localStorage
        localStorage.setItem('mockToken', mockToken)
        localStorage.setItem('mockUserId', '1')
        
        console.log('模拟登录成功')
        ElMessage.success('登录成功（演示模式）')
        return true
      }
      
      return false
    } catch (error) {
      console.error('模拟登录失败:', error)
      return false
    } finally {
      loading.value = false
    }
  }

  // 模拟注册
  async function register(registerData: {
    email: string
    password: string
    fullName: string
  }) {
    try {
      loading.value = true
      
      // 简单模拟验证 - 任何有效输入都能注册成功
      if (registerData.email && registerData.password && registerData.fullName) {
        ElMessage.success('注册成功，请登录（演示模式）')
        return true
      }
      
      return false
    } catch (error) {
      console.error('模拟注册失败:', error)
      return false
    } finally {
      loading.value = false
    }
  }

  // 登出
  function logout() {
    token.value = null
    user.value = null
    localStorage.removeItem('mockToken')
    localStorage.removeItem('mockUserId')
    ElMessage.success('已退出登录（演示模式）')
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

  // 初始化时加载模拟用户数据
  function loadMockUser() {
    user.value = {
      id: 1,
      email: 'test@example.com',
      fullName: '测试用户',
      phone: '13800138000',
      bio: '我是一名申请留学的学生，希望能获得更多的申请指导和帮助。',
      profilePicture: '',
      role: 'USER',
      undergraduateSchool: '某大学',
      gpa: 3.8,
      greScore: 320,
      toeflScore: 100
    }
  }

  return {
    user,
    token,
    loading,
    isAuthenticated,
    isAdmin,
    login,
    register,
    logout,
    loadUser,
    updateUser,
    clearUser,
    loadMockUser
  }
}) 