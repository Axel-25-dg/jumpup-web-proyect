import type { AdminLiveSessionRepository } from '@/domain/ports/admin-live-session.repository'
import type { AdminLiveSession } from '@/domain/entities/admin-live-session.entity'
import type { CreateAdminLiveSessionDto, UpdateAdminLiveSessionDto } from '@/application/dtos/admin-live-session.dto'
import type { PaginatedResult } from '@/domain/entities/paginated-result.entity'

export class AdminLiveSessionUseCase {
  private readonly repository: AdminLiveSessionRepository

  constructor(repository: AdminLiveSessionRepository) {
    this.repository = repository
  }

  getAll(params?: Record<string, any>): Promise<PaginatedResult<AdminLiveSession>> {
    return this.repository.getAll(params)
  }

  getById(id: number): Promise<AdminLiveSession> {
    return this.repository.getById(id)
  }

  create(data: CreateAdminLiveSessionDto): Promise<AdminLiveSession> {
    return this.repository.create(data)
  }

  update(id: number, data: UpdateAdminLiveSessionDto): Promise<AdminLiveSession> {
    return this.repository.update(id, data)
  }

  delete(id: number): Promise<void> {
    return this.repository.delete(id)
  }
}