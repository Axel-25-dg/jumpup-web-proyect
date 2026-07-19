import type { AdminLiveSession } from '../entities/admin-live-session.entity'
import type { CreateAdminLiveSessionDto, UpdateAdminLiveSessionDto } from '@/application/dtos/admin-live-session.dto'
import type { PaginatedResult } from '../entities/paginated-result.entity'

export interface AdminLiveSessionRepository {
  getAll(params?: Record<string, any>): Promise<PaginatedResult<AdminLiveSession>>
  getById(id: number): Promise<AdminLiveSession>
  create(data: CreateAdminLiveSessionDto): Promise<AdminLiveSession>
  update(id: number, data: UpdateAdminLiveSessionDto): Promise<AdminLiveSession>
  delete(id: number): Promise<void>
}