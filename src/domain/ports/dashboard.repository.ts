import type { Achievement } from '../entities/stats.entity';

export interface StudentDashboardData {
  total_xp: number;
  level: number;
  xp_progress: number;
  xp_for_next_level: number;
  current_streak: number;
  longest_streak: number;
  progress_percentage: number;
  completed_lessons: number;
  total_lessons: number;
  achievements_count: number;
  certificates_count: number;
  active_classrooms: number;
}

export interface RankingUser {
  user__username: string;
  total_xp: number;
  level: number;
}

export interface TeacherDashboardData {
  classrooms: number;
  students: number;
  resources: number;
  lessons: number;
  certificates: number;
}

export interface AdminDashboardData {
  users: number;
  teachers: number;
  students: number;
  courses: number;
  classrooms: number;
  ventas_directas: number;
  certificates: number;
}

export interface DashboardRepository {
  getStudentData(): Promise<StudentDashboardData>;
  getTeacherData(): Promise<TeacherDashboardData>;
  getAdminData(): Promise<AdminDashboardData>;
  getRanking(limit?: number): Promise<RankingUser[]>;
  getAchievements(limit?: number): Promise<Achievement[]>;
}
