import axios from 'axios'
import { ElMessage } from 'element-plus'
import { config as appConfig } from '@/config'
import type { ApiResponse } from '@/types'
import { handleMockApiRequest } from './mockService'

// 声明window.config类型，解决TS错误
declare global {
  interface Window {
    config?: {
      api: {
        useMockData: boolean
      }
    }
  }
}

// 创建axios实例
const api = axios.create({
  baseURL: appConfig.api.baseUrl,
  timeout: appConfig.api.timeout,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
api.interceptors.request.use(
  config => {
    // 从localStorage获取token
    const useMockData = window.config?.api.useMockData || appConfig.api.useMockData
    const token = localStorage.getItem(useMockData ? 'mockToken' : 'token')
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  response => {
    // 直接返回响应数据
    return response.data
  },
  error => {
    // 处理错误
    if (error.response) {
      // 服务器响应错误
      const { status, data } = error.response
      switch (status) {
        case 400:
          ElMessage.error(data.message || '请求参数错误')
          break
        case 401:
          ElMessage.error('会话已过期，请重新登录')
          localStorage.removeItem('token')
          window.location.href = '/auth/login'
          break
        case 403:
          ElMessage.error('您没有操作权限')
          break
        case 404:
          ElMessage.error('请求的资源不存在')
          break
        case 500:
          ElMessage.error('服务器内部错误')
          break
        default:
          ElMessage.error(`请求错误：${data.message || status}`)
      }
    } else if (error.request) {
      // 请求未收到响应
      ElMessage.error('网络连接错误，请稍后重试')
    } else {
      // 请求配置错误
      ElMessage.error(`请求错误: ${error.message}`)
    }
    return Promise.reject(error)
  }
)

// 使用模拟数据模式时，修改API请求函数
if (appConfig.api.useMockData) {
  // 重写API方法以使用模拟数据
  const originalGet = api.get
  const originalPost = api.post
  const originalPut = api.put
  const originalDelete = api.delete
  
  // 用any类型处理，因为AxiosInstance的类型太复杂
  const mockApi = api as any
  
  mockApi.get = async function<T>(...args: any[]): Promise<ApiResponse<T>> {
    const url = args[0]
    const params = args[1]?.params
    
    // 添加一个小延迟模拟网络请求
    await new Promise(resolve => setTimeout(resolve, Math.random() * 300 + 200))
    return handleMockApiRequest<T>('GET', url, null, params)
  }
  
  mockApi.post = async function<T>(...args: any[]): Promise<ApiResponse<T>> {
    const url = args[0]
    const data = args[1]
    
    await new Promise(resolve => setTimeout(resolve, Math.random() * 300 + 200))
    return handleMockApiRequest<T>('POST', url, data, null)
  }
  
  mockApi.put = async function<T>(...args: any[]): Promise<ApiResponse<T>> {
    const url = args[0]
    const data = args[1]
    
    await new Promise(resolve => setTimeout(resolve, Math.random() * 300 + 200))
    return handleMockApiRequest<T>('PUT', url, data, null)
  }
  
  mockApi.delete = async function<T>(...args: any[]): Promise<ApiResponse<T>> {
    const url = args[0]
    const params = args[1]?.params
    
    await new Promise(resolve => setTimeout(resolve, Math.random() * 300 + 200))
    return handleMockApiRequest<T>('DELETE', url, null, params)
  }
  
  console.log('已启用API模拟模式 - 所有请求将使用本地模拟数据')
}

export default api 