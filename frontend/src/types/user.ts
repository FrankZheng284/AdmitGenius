export interface User {
  id: number;
  email: string;
  fullName: string;
  phone?: string;
  bio?: string;
  profilePicture?: string;
  role?: string;
  undergraduateSchool?: string;
  gpa?: number;
  greScore?: number;
  gmatScore?: number;
  toeflScore?: number;
  ieltsScore?: number;
  targetMajor?: string;
} 