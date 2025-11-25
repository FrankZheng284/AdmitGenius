export interface Essay {
  id: number
  userId: number
  title: string
  content: string
  essayType: string
  status?: 'DRAFT' | 'COMPLETED'
  createdAt?: string
  updatedAt?: string
  generatedBy?: 'STUDENT' | 'AI_MODEL'
  wordLimit?: number
  schoolId?: number
  prompt?: string
}

export interface EssaySuggestion {
  id: number
  essayId: number
  originalText: string
  suggestedText: string
  reason: string
  createdAt: string
  status: 'PENDING' | 'APPLIED' | 'IGNORED'
}

export interface EssayGenerationRequest {
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
}

export interface EssayPolishRequest {
  essayId: number
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
} 