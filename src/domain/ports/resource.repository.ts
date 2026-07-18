import type { Resource } from '../entities/resource.entity';
import type { PaginatedResult } from '../entities/paginated-result.entity';

export interface ResourceRepository {
  getAllByTeacher(teacherId: number, params?: Record<string, any>): Promise<PaginatedResult<Resource>>;
  create(data: FormData): Promise<Resource>;
  delete(id: number): Promise<void>;
}
