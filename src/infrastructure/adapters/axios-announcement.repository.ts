import { apiClient } from '../http/axios-client'
import type { AnnouncementRepository } from '@/domain/ports/announcement.repository'
import type { Announcement } from '@/domain/entities/announcement.entity'
import type { CreateAnnouncementDto, UpdateAnnouncementDto } from '@/application/dtos/announcement.dto'
import type { PaginatedResult } from '@/domain/entities/paginated-result.entity'
import { parseApiError } from '../http/parse-api-error'

export class AxiosAnnouncementRepository implements AnnouncementRepository {
  async getAll(params?: Record<string, any>): Promise<PaginatedResult<Announcement>> {
    try {
      const { data } = await apiClient.get<PaginatedResult<Announcement>>('/announcements/', { params })
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async getById(id: number): Promise<Announcement> {
    try {
      const { data } = await apiClient.get<Announcement>(`/announcements/${id}/`)
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async create(payload: CreateAnnouncementDto): Promise<Announcement> {
    try {
      const { data } = await apiClient.post<Announcement>('/announcements/', payload)
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async update(id: number, payload: UpdateAnnouncementDto): Promise<Announcement> {
    try {
      const { data } = await apiClient.patch<Announcement>(`/announcements/${id}/`, payload)
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async delete(id: number): Promise<void> {
    try {
      await apiClient.delete(`/announcements/${id}/`)
    } catch (err) {
      throw parseApiError(err)
    }
  }
}