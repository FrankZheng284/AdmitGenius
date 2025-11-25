import type { ApiResponse } from '@/types/api'
import api from '@/utils/api'

export interface Education {
  id: number;
  school: string;
  degree: string;
  major: string;
  startDate: string;
  endDate: string;
  achievement?: string;
}

export interface Project {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  content: string;
  isLeader: boolean;
}

export class ProfileService {
  // 教育经历相关
  static async getEducations(): Promise<ApiResponse<Education[]>> {
    return await api.get('/api/educations')
  }

  static async createEducation(data: Omit<Education, 'id'>): Promise<ApiResponse<Education>> {
    return await api.post('/api/educations', data)
  }

  static async updateEducation(id: number, data: Partial<Education>): Promise<ApiResponse<Education>> {
    return await api.put(`/api/educations/${id}`, data)
  }

  static async deleteEducation(id: number): Promise<ApiResponse<void>> {
    return await api.delete(`/api/educations/${id}`)
  }

  // 项目经历相关
  static async getProjects(): Promise<ApiResponse<Project[]>> {
    return await api.get('/api/projects')
  }

  static async createProject(data: Omit<Project, 'id'>): Promise<ApiResponse<Project>> {
    return await api.post('/api/projects', data)
  }

  static async updateProject(id: number, data: Partial<Project>): Promise<ApiResponse<Project>> {
    return await api.put(`/api/projects/${id}`, data)
  }

  static async deleteProject(id: number): Promise<ApiResponse<void>> {
    return await api.delete(`/api/projects/${id}`)
  }
} 