import axios from 'axios'
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { ElMessage } from 'element-plus'

// 创建 axios 实例
const service: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:7077',
  timeout: 60000
})

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    // 从 localStorage 获取 token
    const token = localStorage.getItem('token')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse) => {
    // 首先检查 HTTP 状态码
    if (response.status >= 200 && response.status < 300) {
      const res = response.data
      // 检查 res 是否是后端统一的包装对象 (通过是否存在 code 字段判断)
      // 并假设所有包装对象的 code 字段名固定为 'code' 或 'status' 等
      if (res && typeof res.code !== 'undefined') { 
        // 后端返回了包含 code 的标准包装结构
        if (res.code === 200 || res.code === 0 || res.success === true) { // 假设 0, 200 或 success:true 代表业务成功
          // 如果外层有 data 字段包装实际数据，则返回 res.data
          // 如果外层没有 data 字段，实际数据就是 res 本身，则也可能直接返回 res
          // 具体取决于后端API设计，这里假设如果成功，期望的数据在 res.data
          // 如果后端有时成功了但没有 res.data（例如某些仅返回成功消息的接口），则需要调整
          return res.data !== undefined ? res.data : res; // 优先返回 res.data，否则返回整个 res
        } else {
          ElMessage.error(res.message || '操作失败')
          return Promise.reject(new Error(res.message || '操作失败'))
        }
      } else {
        // 如果 res 不是包装对象 (例如直接返回的 EssayDTO), 则认为成功并直接返回 res
        return res
      }
    } else {
      // 此处理论上不应该到达，因为非2xx会被视为error进入下一个处理函数
      // 但为保险起见，添加处理
      ElMessage.error(`请求错误: ${response.status}`)
      return Promise.reject(new Error(`请求错误: ${response.status}`))
    }
  },
  (error) => {
    console.error('Request Error Interceptor:', error); // 添加更详细的日志
    if (error.response) {
      // 请求已发出，但服务器响应的状态码不在 2xx 范围内
      const res = error.response.data;
      let message = '服务器错误'; // 默认错误消息
      if (res) {
        if (typeof res === 'string') {
            message = res;
        } else if (res.message) {
            message = res.message;
        } else if (error.response.statusText) {
            message = error.response.statusText;
        }
      }
      ElMessage.error(message);
      return Promise.reject(new Error(message)); // 使用提取或默认的消息
    } else if (error.request) {
      // 请求已发出，但没有收到响应
      ElMessage.error('网络请求超时或服务器无响应')
      return Promise.reject(new Error('网络请求超时或服务器无响应'));
    } else {
      // 在设置请求时发生了一些事情，触发了错误
      ElMessage.error(error.message || '请求发起失败')
      return Promise.reject(error)
    }
  }
)

// 封装请求方法
const request = <T = any>(config: AxiosRequestConfig): Promise<T> => {
  return service.request<any, T>(config)
}

export default request 