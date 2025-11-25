import request from '@/utils/request'
import type { Essay, EssaySuggestion } from '@/types'

// mockEssay 和 mockSuggestions 已移除

export const EssayService = {
  // 创建文书
  createEssay(data: Partial<Essay>) {
    return request<Essay>({
      url: '/api/essays',
      method: 'post',
      data
    })
  },

  // 更新文书
  updateEssay(id: number, data: Partial<Essay>) {
    return request<Essay>({
      url: `/api/essays/${id}`, // 修正 URL
      method: 'put', // 修正方法
      data
    })
  },

  // 删除文书
  deleteEssay(id: number) {
    return request<{ success: boolean, message?: string }>({
      url: `/api/essays/${id}`, // 修正 URL
      method: 'delete' // 修正方法
    })
  },

  // 获取用户的所有文书
  getUserEssays(userId: number, params?: {
    page?: number
    size?: number
    keyword?: string
    type?: string
    status?: string
    sort?: string
  }) {
    return request<Essay[] | { content: Essay[], totalElements: number, page: number, size: number }>({
      url: `/api/essays/user/${userId}`,
      method: 'get',
      params: params
    });
  },

  // 获取文书详情
  getEssayById(id: number) {
    return request<Essay>({
      url: `/api/essays/${id}`,
      method: 'get'
    })
  },

  // 生成文书
  generateEssay(data: {
    userId: number
    schoolName?: string
    programName?: string
    programType?: string
    applicationType?: string
    applicationYear?: string
    applicationRound?: string
    essayTitle?: string
    essayPrompt?: string
    essayType?: string
    minWordCount?: number
    maxWordCount?: number
    major?: string
    degree?: string
    currentSchool?: string
    gpa?: number
    gradeScale?: string
    toeflScore?: number
    toeflReading?: number
    toeflListening?: number
    toeflSpeaking?: number
    toeflWriting?: number
    ieltsScore?: number
    ieltsReading?: number
    ieltsListening?: number
    ieltsSpeaking?: number
    ieltsWriting?: number
    greTotal?: number
    greVerbal?: number
    greQuantitative?: number
    greAnalytical?: number
    gmatTotal?: number
    gmatVerbal?: number
    gmatQuantitative?: number
    gmatIntegrated?: number
    gmatAnalytical?: number
    researchExperience?: string[]
    workExperience?: string[]
    projectExperience?: string[]
    volunteerExperience?: string[]
    leadershipExperience?: string[]
    awards?: string[]
    publications?: string[]
    strengths?: string[]
    weaknesses?: string[]
    careerGoals?: string[]
    personalStatement?: string
    motivationForApplication?: string
    whyThisSchool?: string
    fitWithProgram?: string
    specificProfessorsOfInterest?: string[]
    specificCoursesOfInterest?: string[]
  }) {
    return request<Essay>({
      url: '/api/essays/generation',
      method: 'post',
      data
    })
  },

  // 润色文书
  polishEssay(essayId: number, data: {
    userId: number
    improveStructure?: boolean
    enhanceLanguage?: boolean
    checkGrammar?: boolean
    reduceClichés?: boolean
    addExamples?: boolean
    tonePreference?: string
    focusPoints?: string[]
    avoidPoints?: string[]
    customDescription?: string
    targetWordCount?: number
  }) {
    return request<Essay>({
      url: `/api/essays/polish/${essayId}`,
      method: 'post',
      data: {
        essayId: essayId,
        ...data
      }
    })
  },

  // 获取文书建议 - 暂时返回空建议列表，并保留警告
  getEssaySuggestions(essayId: number) {
    console.warn(`getEssaySuggestions for essayId: ${essayId} is not implemented with a real API yet. Returning empty suggestions.`);
    // 确保返回的结构与 EssayDetailView.vue 中 fetchSuggestions 的期望一致 ({ data: EssaySuggestion[] })
    return Promise.resolve({ data: [] as EssaySuggestion[] }); 
  },

  // 获取用户个人信息
  getUserProfile() {
    return request<any>({
      url: '/api/users/profile',
      method: 'get'
    })
  },

  // 获取用户教育经历
  getEducations() {
    return request<any>({
      url: '/api/educations',
      method: 'get'
    })
  },

  // 获取用户项目经历
  getProjects() {
    return request<any>({
      url: '/api/projects',
      method: 'get'
    })
  }
}

// Re-add generateEssay and polishEssay parameters for completeness, but keep them as they were.
// For generateEssay data parameter:
// userId: number, schoolName?: string, programName?: string, programType?: string, applicationType?: string, applicationYear?: string, applicationRound?: string, essayTitle?: string, essayPrompt?: string, essayType?: string, minWordCount?: number, maxWordCount?: number, major?: string, degree?: string, currentSchool?: string, gpa?: number, gradeScale?: string, toeflScore?: number, toeflReading?: number, toeflListening?: number, toeflSpeaking?: number, toeflWriting?: number, ieltsScore?: number, ieltsReading?: number, ieltsListening?: number, ieltsSpeaking?: number, ieltsWriting?: number, greTotal?: number, greVerbal?: number, greQuantitative?: number, greAnalytical?: number, gmatTotal?: number, gmatVerbal?: number, gmatQuantitative?: number, gmatIntegrated?: number, gmatAnalytical?: number, researchExperience?: string[], workExperience?: string[], projectExperience?: string[], volunteerExperience?: string[], leadershipExperience?: string[], awards?: string[], publications?: string[], strengths?: string[], weaknesses?: string[], careerGoals?: string[], personalStatement?: string, motivationForApplication?: string, whyThisSchool?: string, fitWithProgram?: string, specificProfessorsOfInterest?: string[], specificCoursesOfInterest?: string[]

// For polishEssay data parameter:
// userId: number, improveStructure?: boolean, enhanceLanguage?: boolean, checkGrammar?: boolean, reduceClichés?: boolean, addExamples?: boolean, tonePreference?: string, focusPoints?: string[], avoidPoints?: string[], customDescription?: string, targetWordCount?: number

// 