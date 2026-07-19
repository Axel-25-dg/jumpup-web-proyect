import { apiClient } from '../http/axios-client';
import { parseApiError } from '../http/parse-api-error';
import type { PaginatedResult } from '@/domain/entities/paginated-result.entity';
import type { ForumReport } from '@/domain/entities/forum-report.entity';

export class AxiosForumReportRepository {
  async getAll(params?: Record<string, any>): Promise<PaginatedResult<ForumReport>> {
    try {
      const { data } = await apiClient.get<PaginatedResult<ForumReport>>('/forum-reports/', { params });
      return data;
    } catch (err) {
      throw parseApiError(err);
    }
  }

  async updateStatus(id: number, status: string): Promise<ForumReport> {
    try {
      const { data } = await apiClient.patch<ForumReport>(`/forum-reports/${id}/`, { status });
      return data;
    } catch (err) {
      throw parseApiError(err);
    }
  }
}