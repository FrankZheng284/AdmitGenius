import type { User } from '@/types/user'
import type { ApiResponse } from '@/types/api'
import api from '@/utils/api'

export class UserService {
  static async getCurrentUserProfile(): Promise<ApiResponse<User>> {
    return await api.get('/api/users/profile')
  }

  static async updateCurrentUserProfile(data: Partial<User>): Promise<ApiResponse<User>> {
    return await api.put('/api/users/profile', data)
  }

  static async uploadAvatar(file: File): Promise<ApiResponse<string>> {
    const formData = new FormData()
    formData.append('file', file)
    return await api.post('/api/users/upload-avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  }

  static async changePassword(data: { currentPassword: string; newPassword: string }): Promise<ApiResponse<void>> {
    return await api.post('/api/users/change-password', data)
  }

  /**
   * 获取用户详情
   * @param userId 用户ID
   */
  static async getUserById(userId: number): Promise<User> {
    const response = await api.get<ApiResponse<User>>(`/api/users/${userId}`)
    
    // 处理ApiResponse结构
    if (response && typeof response === 'object' && 'success' in response && 'data' in response) {
      const apiResponse = response as any
      if (!apiResponse.success) {
        throw new Error(apiResponse.message || '获取用户信息失败')
      }
      return apiResponse.data as User
    } else {
      // 如果响应已经被拦截器解包
      return response as unknown as User
    }
  }

  /**
   * 更新用户信息
   * @param userId 用户ID
   * @param userData 用户数据
   */
  static async updateUser(userId: number, userData: Partial<User>): Promise<User> {
    return await api.put<User>(`/api/users/${userId}`, userData) as unknown as User
  }

  /**
   * 获取用户保存的院校ID列表
   * @param userId 用户ID
   */
  static async getSavedSchools(userId: number): Promise<number[]> {
    const response = await api.get(`/api/users/${userId}/saved-schools`)
    // API拦截器已经处理了ApiResponse，直接返回data字段
    return response.data as number[]
  }

  /**
   * 更新用户保存的院校列表
   * @param userId 用户ID
   * @param schoolIds 院校ID列表
   */
  static async updateSavedSchools(userId: number, schoolIds: number[]): Promise<void> {
    await api.post(`/api/users/${userId}/saved-schools`, { schoolIds })
  }

  /**
   * 切换院校收藏状态
   * @param userId 用户ID
   * @param schoolId 院校ID
   * @param isSaved 是否收藏
   */
  static async toggleSavedSchool(userId: number, schoolId: number, isSaved: boolean): Promise<void> {
    await api.post(`/api/users/${userId}/saved-schools/${schoolId}`, { saved: isSaved })
  }
} 