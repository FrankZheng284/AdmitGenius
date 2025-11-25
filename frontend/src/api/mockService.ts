import { MockService } from './services/mock'
import type { 
  ApiResponse, 
  User, 
  Essay, 
  School, 
  Recommendation,
  ForumPost
} from '@/types'

/**
 * 模拟API处理器
 * 根据请求的URL和方法返回适当的模拟数据
 */
export function handleMockApiRequest<T>(
  method: string,
  url: string,
  data?: any,
  params?: any
): ApiResponse<any> {
  console.log(`处理模拟API请求: ${method} ${url}`, { data, params })
  
  // 延迟处理，模拟网络延迟
  const delay = Math.random() * 300 + 200 // 200-500ms随机延迟
  
  // 提取URL路径部分（移除查询参数）
  const path = url.split('?')[0]
  
  // 根据URL路径和HTTP方法返回适当的模拟数据
  let responseData: any = null
  
  try {
    // 用户认证相关
    if (path === '/auth/signin' && method === 'POST') {
      responseData = handleAuthSignIn(data)
    } 
    else if (path === '/auth/signup' && method === 'POST') {
      responseData = handleAuthSignUp(data)
    }
    
    // 用户信息相关
    else if (path.match(/\/users\/\d+$/) && method === 'GET') {
      const userId = extractIdFromPath(path, '/users/')
      responseData = handleGetUserById(userId)
    }
    else if (path.match(/\/users\/\d+$/) && method === 'PUT') {
      const userId = extractIdFromPath(path, '/users/')
      responseData = handleUpdateUser(userId, data)
    }
    
    // 文书相关
    else if (path === '/essays' && method === 'GET') {
      responseData = handleGetEssays()
    }
    else if (path === '/essays' && method === 'POST') {
      responseData = handleCreateEssay(data)
    }
    else if (path.match(/\/essays\/\d+$/) && method === 'GET') {
      const essayId = extractIdFromPath(path, '/essays/')
      responseData = handleGetEssayById(essayId)
    }
    
    // 院校推荐相关
    else if (path === '/recommendations/generate' && method === 'POST') {
      responseData = handleGenerateRecommendations(data)
    }
    else if (path === '/recommendations' && method === 'GET') {
      responseData = handleGetRecommendations()
    }
    else if (path === '/recommendations/schools' && method === 'GET') {
      responseData = handleGetAllSchools()
    }
    else if (path === '/recommendations/programs' && method === 'GET') {
      responseData = handleGetPrograms()
    }
    else if (path === '/recommendations/countries' && method === 'GET') {
      responseData = handleGetCountries()
    }
    
    // 如果没有匹配的路径，返回404错误
    else {
      return {
        success: false,
        message: `找不到API端点: ${method} ${path}`,
        errors: ['未实现的模拟API']
      }
    }
    
    return {
      success: true,
      message: '操作成功',
      data: responseData
    }
  } catch (error: any) {
    console.error('模拟API处理错误:', error)
    return {
      success: false,
      message: `处理请求时出错: ${error.message || '未知错误'}`,
      errors: [error.message || '未知错误']
    }
  }
}

// 辅助函数 - 从路径中提取ID
function extractIdFromPath(path: string, prefix: string): number {
  const idStr = path.replace(prefix, '')
  return parseInt(idStr, 10)
}

// 认证处理函数
function handleAuthSignIn(data: any): { token: string; user: User } {
  // 简单验证
  if (!data.email || !data.password) {
    throw new Error('邮箱和密码不能为空')
  }
  
  // 返回模拟用户和令牌
  return {
    token: 'mock_token_' + Math.random().toString(36).substring(2, 15),
    user: MockService.getMockUser()
  }
}

function handleAuthSignUp(data: any): User {
  // 简单验证
  if (!data.email || !data.password || !data.fullName) {
    throw new Error('缺少必要注册信息')
  }
  
  // 返回模拟注册的用户
  return {
    ...MockService.getMockUser(),
    email: data.email,
    fullName: data.fullName
  }
}

// 用户相关处理函数
function handleGetUserById(userId: number): User {
  return MockService.getMockUser()
}

function handleUpdateUser(userId: number, userData: Partial<User>): User {
  const user = MockService.getMockUser()
  return {
    ...user,
    ...userData
  }
}

// 文书相关处理函数
function handleGetEssays(): Essay[] {
  return MockService.getMockEssays()
}

function handleCreateEssay(essayData: any): Essay {
  const essays = MockService.getMockEssays()
  const newEssay: Essay = {
    id: Math.max(...essays.map(e => e.id), 0) + 1,
    title: essayData.title || '新文书',
    content: essayData.content || '',
    status: 'DRAFT',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  
  return newEssay
}

function handleGetEssayById(essayId: number): Essay {
  const essays = MockService.getMockEssays()
  const essay = essays.find(e => e.id === essayId)
  
  if (!essay) {
    throw new Error(`找不到ID为${essayId}的文书`)
  }
  
  return essay
}

// 院校推荐相关处理函数
function handleGenerateRecommendations(data: any): Recommendation[] {
  return MockService.getMockRecommendations()
}

function handleGetRecommendations(): Recommendation[] {
  return MockService.getMockRecommendations()
}

function handleGetAllSchools(): School[] {
  return MockService.getMockSchools()
}

function handleGetPrograms(): string[] {
  return MockService.getAvailablePrograms()
}

function handleGetCountries(): string[] {
  return MockService.getAvailableCountries()
} 