import type { Router } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useMockAuthStore } from '@/stores/mockAuth'
import { config } from '@/config'
import { ElMessage } from 'element-plus'

/**
 * 注册路由守卫
 * @param router 路由实例
 */
export function setupRouterGuards(router: Router) {
  // 全局前置守卫
  router.beforeEach((to, from, next) => {
    // 设置页面标题
    document.title = `${to.meta.title ? to.meta.title + ' - ' : ''}${config.appTitle}`
    
    // 开发模式下直接放行所有路由
    if (import.meta.env.DEV) {
      next()
      return
    }
    
    // 是否使用模拟认证
    const useMockAuth = config.api.useMockData
    
    // 获取认证存储
    const authStore = useMockAuth ? useMockAuthStore() : useAuthStore()
    
    // 检查是否已登录
    const token = useMockAuth 
      ? localStorage.getItem('mockToken')
      : localStorage.getItem('token')
    
    if (config.enableDevLogs) {
      console.log(`路由守卫: 正在导航到 ${to.path}`)
      console.log(`要求认证: ${to.meta.requiresAuth ? '是' : '否'}`)
      console.log(`认证状态: ${token ? '已登录' : '未登录'}`)
      console.log(`使用模拟认证: ${useMockAuth ? '是' : '否'}`)
    }
    
    // 处理认证逻辑
    if (to.meta.requiresAuth && !token) {
      // 需要登录但未登录，重定向到登录页
      ElMessage.warning('请先登录')
      next({ name: 'Login', query: { redirect: to.fullPath } })
    } else if (to.name === 'Login' && token) {
      // 已登录用户访问登录页，重定向到首页
      next({ path: '/' })
    } else {
      // 其他情况正常导航
      next()
    }
  })
  
  // 全局解析守卫
  router.beforeResolve(async (to, from, next) => {
    // 在组件解析之前执行
    try {
      // 如果需要在页面加载前执行异步操作，可以在这里进行
      next()
    } catch (error) {
      console.error('导航解析错误:', error)
      next(false)
    }
  })
  
  // 全局后置钩子
  router.afterEach((to, from) => {
    // 导航完成后执行
    if (config.enableDevLogs) {
      console.log(`导航完成: ${from.path} -> ${to.path}`)
    }
    
    // 滚动到页面顶部
    window.scrollTo(0, 0)
  })
} 