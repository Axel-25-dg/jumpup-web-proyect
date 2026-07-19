import { apiClient } from '../http/axios-client';
import { parseApiError } from '../http/parse-api-error';
import type { PaginatedResult } from '@/domain/entities/paginated-result.entity';
import type { ForumPost } from '@/domain/entities/forum-post.entity';

export class AxiosForumPostRepository {
  async getAll(params?: Record<string, any>): Promise<PaginatedResult<ForumPost>> {
    try {
      const { data } = await apiClient.get<PaginatedResult<ForumPost>>('/forum-posts/', { params });
      return data;
    } catch (err) {
      throw parseApiError(err);
    }
  }

  async delete(id: number): Promise<void> {
    try {
      await apiClient.delete(`/forum-posts/${id}/`);
    } catch (err) {
      throw parseApiError(err);
    }
  }
}