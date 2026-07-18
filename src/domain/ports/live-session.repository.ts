import type { LiveSession } from '../entities/live-session.entity';
import type { PaginatedResult } from '../entities/paginated-result.entity';

export interface LiveSessionRepository {
  getAllByTeacher(teacherId: number, params?: Record<string, any>): Promise<PaginatedResult<LiveSession>>;
  create(data: Partial<LiveSession>): Promise<LiveSession>;
  update(id: number, data: Partial<LiveSession>): Promise<LiveSession>;
  cancel(id: number): Promise<void>;
  delete(id: number): Promise<void>;
}
