import { apiClient } from '../http/axios-client';
import type { ResourceRepository } from '@/domain/ports/resource.repository';
import type { Resource } from '@/domain/entities/resource.entity';
import type { PaginatedResult } from '@/domain/entities/paginated-result.entity';
import { parseApiError } from '../http/parse-api-error';

export class AxiosResourceRepository implements ResourceRepository {
  async getAllByTeacher(teacherId: number, params?: Record<string, any>): Promise<PaginatedResult<Resource>> {
    try {
      const { data } = await apiClient.get<PaginatedResult<Resource>>('/resources/', { 
        params: { ...params, teacher_id: teacherId } 
      });
      return data;
    } catch (err) {
      throw parseApiError(err);
    }
  }

  async create(payload: FormData): Promise<Resource> {
    try {
      const { data } = await apiClient.post<Resource>('/resources/', payload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return data;
    } catch (err) {
      throw parseApiError(err);
    }
  }

  async delete(id: number): Promise<void> {
    try {
      await apiClient.delete(`/resources/${id}/`);
    } catch (err) {
      throw parseApiError(err);
    }
  }
}
