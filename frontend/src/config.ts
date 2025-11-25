/**
 * 应用配置
 */
export const config = {
  /**
   * 应用标题
   */
  appTitle: '留学者指南',
  
  /**
   * API设置
   */
  api: {
    /**
     * API基础URL
     * 注意：这里应该是后端服务的基础路径，不包含 /api。
     * /api 前缀将由 Vite 代理处理，或者在各个 service 调用中添加。
     * 为了与 Vite 代理配置一致，这里我们设置为空字符串或仅域名。
     * Vite 会将前端发起的 /api/... 请求代理到 target + /api/... 
     * 或者，如果 service 调用中已包含 /api，则这里设置为空，
     * Vite 代理的 key 是 /api，target 是 http://localhost:7077。
     * 当前选择：baseUrl 设置为空，service 中调用路径以 /api 开头。
     */
    baseUrl: '',
    
    /**
     * 请求超时时间（毫秒）
     */
    timeout: 10000,
    
    /**
     * 是否使用模拟数据
     * 如果设为true，将不发送实际API请求，而是使用本地模拟数据
     */
    useMockData: false,
    
    /**
     * 请求头配置
     */
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  },
  
  /**
   * 启用开发者工具日志
   */
  enableDevLogs: true,
  
  /**
   * 首选语言
   */
  language: 'zh-CN'
} 