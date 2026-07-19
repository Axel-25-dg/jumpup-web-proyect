import type { AnnouncementRepository } from '@/domain/ports/announcement.repository'
import type { Announcement } from '@/domain/entities/announcement.entity'
import type { CreateAnnouncementDto, UpdateAnnouncementDto } from '@/application/dtos/announcement.dto'
import type { PaginatedResult } from '@/domain/entities/paginated-result.entity'

export class AnnouncementUseCase {
  private readonly repository: AnnouncementRepository

  constructor(repository: AnnouncementRepository) {
    this.repository = repository
  }

  getAll(params?: Record<string, any>): Promise<PaginatedResult<Announcement>> {
    return this.repository.getAll(params)
  }

  getById(id: number): Promise<Announcement> {
    return this.repository.getById(id)
  }

  create(data: CreateAnnouncementDto): Promise<Announcement> {
    return this.repository.create(data)
  }

  update(id: number, data: UpdateAnnouncementDto): Promise<Announcement> {
    return this.repository.update(id, data)
  }

  delete(id: number): Promise<void> {
    return this.repository.delete(id)
  }
}