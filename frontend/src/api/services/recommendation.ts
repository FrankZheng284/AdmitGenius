import api from '@/api'
import { config } from '@/config'
import { MockService } from './mock'
import type { Recommendation, RecommendationRequest, School, ApiResponse, PaginatedResponse } from '@/types'

// Helper function to simulate Promise for mock data
const resolveMock = <T>(data: T): Promise<T> => Promise.resolve(data)

// Define parameters for paginated school list fetching
interface GetSchoolsPaginatedParams {
  page?: number;
  size?: number;
  // Potentially add sort parameters if needed by backend/frontend
}

const RecommendationService = {
  /**
   * 生成推荐
   * @param requestData 推荐请求数据
   */
  generateRecommendation: async (data: RecommendationRequest): Promise<Recommendation> => {
    if (config.api.useMockData) {
      const mockRecommendations = MockService.getMockRecommendations()
      // Assuming the first mock recommendation is suitable for a POST response simulation
      const mockResponse = mockRecommendations.length > 0 ? mockRecommendations[0] : {} as Recommendation
      return resolveMock(mockResponse)
    }
    return await api.post<Recommendation>('/api/recommendations/generate', data) as unknown as Recommendation
  },

  /**
   * 获取用户的推荐
   * @param userId 用户ID
   */
  getUserRecommendations: async (userId: number): Promise<Recommendation[]> => {
    if (config.api.useMockData) {
      // Example: Filter mock recommendations by userId or return all for a default user
      const userRecs = MockService.getMockRecommendations().filter(rec => rec.userId === userId || (userId === 1 && rec.userId === undefined))
      return resolveMock(userRecs)
    }
    return await api.get<Recommendation[]>(`/api/recommendations/user/${userId}`) as unknown as Recommendation[]
  },

  /**
   * 获取简化推荐
   * @param userId 用户ID
   */
  getSimpleRecommendations: async (userId: number): Promise<School[]> => {
    if (config.api.useMockData) {
      // Example: Return a slice of mock schools as simple recommendations
      return resolveMock(MockService.getMockSchools().slice(0, 3))
    }
    return await api.get<School[]>(`/api/recommendations/simple/${userId}`) as unknown as School[]
  },

  /**
   * 提交推荐反馈
   * @param itemId 推荐项ID
   * @param feedback 反馈数据
   */
  provideFeedback: async (itemId: number, feedback: { feedback: string, applied: boolean }): Promise<void> => {
    if (config.api.useMockData) {
      console.log('Mock: Feedback provided for item', itemId, feedback)
      return resolveMock(undefined) // Simulate void promise for mock
    }
    // For POST requests expected to return no content (HTTP 204 or 200 with empty body handled by interceptor)
    await api.post<void>(`/api/recommendations/feedback/${itemId}`, feedback)
    return
  },

  /**
   * 获取所有学校列表 (分页)
   */
  getAllSchools: async (params: GetSchoolsPaginatedParams = {}): Promise<PaginatedResponse<School>> => {
    if (config.api.useMockData) {
      // Simulate pagination for mock data
      const allMockSchools = MockService.getMockSchools();
      const page = params.page || 0;
      const size = params.size || 10;
      const start = page * size;
      const end = start + size;
      const content = allMockSchools.slice(start, end);
      return resolveMock({
        content: content,
        page: page,
        size: size,
        totalElements: allMockSchools.length,
        totalPages: Math.ceil(allMockSchools.length / size)
      });
    }
    return await api.get('/api/recommendations/schools', { params }) as unknown as PaginatedResponse<School>;
  },

  /**
   * 获取学校详情
   * @param id 学校ID
   */
  getSchoolById: async (id: number): Promise<School> => {
    if (config.api.useMockData) {
      const school = MockService.getMockSchools().find(s => s.id === id)
      if (school) {
        return resolveMock(school)
      }
      return Promise.reject(new Error('Mock: School not found'))
    }
    return await api.get<School>(`/api/recommendations/schools/${id}`) as unknown as School
  },

  /**
   * 按国家筛选学校 (分页)
   */
  getSchoolsByCountry: async (country: string, params: GetSchoolsPaginatedParams = {}): Promise<PaginatedResponse<School>> => {
    // Mock data handling would need more complex filtering + pagination logic here
    return await api.get(`/api/recommendations/schools/country/${country}`, { params }) as unknown as PaginatedResponse<School>;
  },

  /**
   * 按专业筛选学校 (分页)
   */
  getSchoolsByProgram: async (programName: string, params: GetSchoolsPaginatedParams = {}): Promise<PaginatedResponse<School>> => {
    // Mock data handling would need more complex filtering + pagination logic here
    return await api.get(`/api/recommendations/schools/program/${programName}`, { params }) as unknown as PaginatedResponse<School>;
  },

  /**
   * 搜索学校 (分页)
   */
  searchSchools: async (query: string, params: GetSchoolsPaginatedParams = {}): Promise<PaginatedResponse<School>> => {
    const queryParams = { ...params, q: query };
    // Mock data handling would need more complex filtering + pagination logic here
    return await api.get('/api/recommendations/schools/search', { params: queryParams }) as unknown as PaginatedResponse<School>;
  },

  /**
   * 获取可申请专业列表
   */
  getAvailablePrograms: async (): Promise<string[]> => {
    if (config.api.useMockData) {
      return resolveMock(MockService.getAvailablePrograms())
    }
    return await api.get<string[]>('/api/recommendations/programs') as unknown as string[]
  },

  /**
   * 获取可申请国家/地区列表
   */
  getAvailableCountries: async (): Promise<string[]> => {
    if (config.api.useMockData) {
      return resolveMock(MockService.getAvailableCountries())
    }
    return await api.get<string[]>('/api/recommendations/countries') as unknown as string[]
  }
}

export default RecommendationService