import { apiClient } from '../http/axios-client';
import type { LiveSessionRepository } from '@/domain/ports/live-session.repository';
import type { LiveSession } from '@/domain/entities/live-session.entity';
import type { PaginatedResult } from '@/domain/entities/paginated-result.entity';
import { parseApiError } from '../http/parse-api-error';

export class AxiosLiveSessionRepository implements LiveSessionRepository {
  async getAllByTeacher(teacherId: number, params?: Record<string, any>): Promise<PaginatedResult<LiveSession>> {
    try {
      const { data } = await apiClient.get<PaginatedResult<LiveSession>>('/live-sessions/', { 
        params: { ...params, teacher_id: teacherId } 
      });
      return data;
    } catch (err) {
      throw parseApiError(err);
    }
  }

  async create(payload: Partial<LiveSession>): Promise<LiveSession> {
    try {
      const { data } = await apiClient.post<LiveSession>('/live-sessions/', payload);
      return data;
    } catch (err) {
      throw parseApiError(err);
    }
  }
}
