// 用户相关类型

// UserRole 枚举
export enum UserRole {
  USER = 'USER',
  SCHOOL_ASSISTANT = 'SCHOOL_ASSISTANT', 
  ADMIN = 'ADMIN',
  EXPERT = 'EXPERT'
}

export interface User {
  id: number
  email: string
  fullName: string
  profilePicture?: string
  avatar?: string
  role?: string
  undergraduateSchool?: string
  gpa?: number
  greScore?: number
  gmatScore?: number
  createdAt?: string
  updatedAt?: string
  savedSchools?: number[]
  bio?: string
  postsCount?: number
  likesReceived?: number
  commentsCount?: number
  viewsReceived?: number
  
  // 专家用户特有字段
  institution?: string
  expertiseArea?: string
  title?: string
  yearsOfExperience?: number
  ratingAvg?: number
  reviewCount?: number
  isVerified?: boolean
  verifiedAt?: string
}

export interface UserLoginRequest {
  email: string
  password: string
}

export interface UserRegisterRequest {
  email: string
  password: string
  name: string
  undergraduateSchool?: string
  gpa?: number
  greScore?: number
  gmatScore?: number
}

export interface ExpertRegisterRequest {
  email: string
  password: string
  name: string
  institution: string
  title: string
  expertiseArea: string
  yearsOfExperience: number
  bio: string
}

// 文书相关类型
export interface Essay {
  id: number
  title: string
  content: string
  userId?: number
  schoolId?: number
  applicationId?: number
  wordLimit?: number
  essayType?: string
  type?: string
  status?: string
  prompt?: string
  generatedBy?: string
  createdAt?: string
  updatedAt?: string
}

export interface EssayCreateRequest {
  title: string
  content: string
  applicationId?: number
  wordLimit?: number
  essayType?: string
}

export interface EssayPolishRequest {
  essayId: number
  requirements?: string
}

export interface EssaySuggestion {
  id: number
  essayId: number
  originalText: string
  suggestedText: string
  reason: string
  status?: string
  createdAt?: string
}

// 推荐相关类型
export interface School {
  id: number;
  name: string;
  location?: string;
  ranking?: number;
  acceptanceRate?: number;
  description?: string;
  website?: string;
  imageUrl?: string;
  city?: string;
  country?: string;
  type?: string;
  programs?: SchoolProgram[];
  averageGPA?: number;
  averageGRE?: number;
  averageGMAT?: number;
  averageGREAW?: number;
}

export interface Recommendation {
  id: number
  userId?: number
  schoolIds?: number[]
  schoolId?: number
  school?: School
  matchScore?: number
  reasons?: string[]
  applicationDeadline?: string
  createdAt?: string
}

// This is what the frontend PREFERENCE DIALOG uses
export interface RecommendationPreference {
  country?: string[]
  // regions?: string[]; // Not currently used in dialog or backend DTO
  ranking?: [number, number] // e.g., [1, 50]
  programs?: string[]
}

// This should match the backend RecommendationRequestDTO structure
export interface RecommendationRequest { // Renaming from BackendRecommendationRequest for consistency
  userId: number;
  gpa?: number;
  undergraduateSchool?: string;
  toeflScore?: number;
  ieltsScore?: number;
  greScore?: number;
  greVerbal?: number;
  greQuantitative?: number;
  greAnalytical?: number;
  gmatScore?: number;
  targetMajor?: string;
  targetDegree?: string;
  locationPreferences?: string[];
  schoolTypePreferences?: string[];
  rankingRange?: [number, number]; // Added to match preferences.ranking format
  recommendationType?: string;
  count?: number;
  // Add other fields from DTO if needed for other recommendation types later
}

// 论坛相关类型

// Define ForumCategory type
export type ForumCategory = 'experience' | 'schools' | 'exams' | 'visa' | 'life' | 'all'; // 'all' for filter, maybe not for post itself

export interface ForumPost {
  id: number;
  title: string;
  content: string;
  excerpt?: string; // Added excerpt
  userId: number;
  author?: User; // User already has profilePicture/avatar
  likes: number;
  comments?: ForumComment[]; // Uncommented to hold comments for detail view
  commentCount?: number; // Added commentCount
  createdAt?: string;
  updatedAt?: string; // Added updatedAt
  category?: string; // Added category (can be string or ForumCategory if stricter typing is needed for submission)
  views?: number; // Added views
  likedByCurrentUser?: boolean; // Added likedByCurrentUser
  tags?: string[]; // Added tags
  
  // 专家帖子相关字段
  isExpertPost?: boolean; // 是否为专家帖子
  expertTag?: string; // 专家标签
}

export interface ForumComment {
  id: number
  content: string
  userId: number
  author?: User & {
    role?: string;
    profilePicture?: string;
  }
  postId: number
  createdAt?: string
  updatedAt?: string
}

export interface ForumPostCreateRequest {
  title: string
  content: string
  category?: string
  isExpertPost?: boolean
  expertTag?: string
}

export interface ForumCommentCreateRequest {
  content: string
}

// API响应类型
export interface ApiResponse<T> {
  success: boolean
  message?: string
  data?: T
  errors?: any
}

// 通用分页响应
export interface PaginatedResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

// 新增：社区统计数据类型
export interface CommunityStatsData {
  totalUsers: number;
  totalPosts: number;
  activeToday?: number; // 可选，因为后端可能后续才支持
}

export interface SchoolProgram {
  id: number;
  name: string;
  degreeType: string;
  department: string;
  durationYears: number;
  tuitionFee: number;
  scholarshipAvailable: boolean;
  admissionRequirements?: string;
  description?: string;
  keywords?: string[];
} 