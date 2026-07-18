import type { Announcement } from '../entities/announcement.entity'
import type { CreateAnnouncementDto, UpdateAnnouncementDto } from '@/application/dtos/announcement.dto'
import type { PaginatedResult } from '../entities/paginated-result.entity'

export interface AnnouncementRepository {
  getAll(params?: Record<string, any>): Promise<PaginatedResult<Announcement>>
  getById(id: number): Promise<Announcement>
  create(data: CreateAnnouncementDto): Promise<Announcement>
  update(id: number, data: UpdateAnnouncementDto): Promise<Announcement>
  delete(id: number): Promise<void>
}