import { apiClient } from '../http/axios-client';
import type { DashboardRepository, StudentDashboardData, TeacherDashboardData, AdminDashboardData, RankingUser } from '@/domain/ports/dashboard.repository';
import type { Achievement } from '@/domain/entities/stats.entity';
import { parseApiError } from '../http/parse-api-error';

export class AxiosDashboardRepository implements DashboardRepository {
  async getStudentData(): Promise<StudentDashboardData> {
    try {
      const { data } = await apiClient.get<StudentDashboardData>('/dashboard/student/');
      return data;
    } catch (err) {
      throw parseApiError(err);
    }
  }

  async getTeacherData(): Promise<TeacherDashboardData> {
    try {
      const { data } = await apiClient.get<TeacherDashboardData>('/dashboard/teacher/');
      return data;
    } catch (err) {
      throw parseApiError(err);
    }
  }

  async getAdminData(): Promise<AdminDashboardData> {
    try {
      const { data } = await apiClient.get<AdminDashboardData>('/dashboard/admin/');
      return data;
    } catch (err) {
      throw parseApiError(err);
    }
  }

  async getRanking(limit: number = 5): Promise<RankingUser[]> {
    try {
      const { data } = await apiClient.get<RankingUser[]>('/ranking/');
      return Array.isArray(data) ? data.slice(0, limit) : [];
    } catch (err) {
      throw parseApiError(err);
    }
  }

  async getAchievements(limit: number = 3): Promise<Achievement[]> {
    try {
      const { data } = await apiClient.get<any>('/my-achievements/');
      // Handling potential pagination or direct array
      const results = data.results || data;
      return Array.isArray(results) ? results.slice(0, limit) : [];
    } catch (err) {
      throw parseApiError(err);
    }
  }
}
