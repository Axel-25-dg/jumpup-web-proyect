import { apiClient } from '../http/axios-client';
import { parseApiError } from '../http/parse-api-error';
import type { PaginatedResult } from '@/domain/entities/paginated-result.entity';
import type { ForumThread } from '@/domain/entities/forum-thread.entity';

export class AxiosForumThreadRepository {
  async getAll(params?: Record<string, any>): Promise<PaginatedResult<ForumThread>> {
    try {
      const { data } = await apiClient.get<PaginatedResult<ForumThread>>('/forum-threads/', { params });
      return data;
    } catch (err) {
      throw parseApiError(err);
    }
  }

  async getById(id: number): Promise<ForumThread> {
    try {
      const { data } = await apiClient.get<ForumThread>(`/forum-threads/${id}/`);
      return data;
    } catch (err) {
      throw parseApiError(err);
    }
  }

  async pin(id: number): Promise<{ is_pinned: boolean }> {
    try {
      const { data } = await apiClient.post<{ is_pinned: boolean }>(`/forum-threads/${id}/pin/`);
      return data;
    } catch (err) {
      throw parseApiError(err);
    }
  }

  async close(id: number): Promise<{ is_closed: boolean }> {
    try {
      const { data } = await apiClient.post<{ is_closed: boolean }>(`/forum-threads/${id}/close/`);
      return data;
    } catch (err) {
      throw parseApiError(err);
    }
  }

  async delete(id: number): Promise<void> {
    try {
      await apiClient.delete(`/forum-threads/${id}/`);
    } catch (err) {
      throw parseApiError(err);
    }
  }
}