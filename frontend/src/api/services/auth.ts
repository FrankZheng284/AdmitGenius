import api from '@/api'
import type { ApiResponse, User, UserLoginRequest, UserRegisterRequest, ExpertRegisterRequest } from '@/types'

export const AuthService = {
  /**
   * 用户登录
   * @param loginData 登录信息
   */
  login: (loginData: UserLoginRequest): Promise<ApiResponse<{ token: string; user: User }>> => {
    return api.post('/api/auth/signin', loginData)
  },

  /**
   * 用户注册
   * @param registerData 注册信息
   */
  register: (registerData: UserRegisterRequest): Promise<ApiResponse<User>> => {
    return api.post('/api/auth/signup', registerData)
  },

  /**
   * 专家用户注册
   * @param expertData 专家注册信息
   */
  registerExpert: (expertData: ExpertRegisterRequest): Promise<ApiResponse<User>> => {
    return api.post('/api/auth/signup-expert', expertData)
  }
} 