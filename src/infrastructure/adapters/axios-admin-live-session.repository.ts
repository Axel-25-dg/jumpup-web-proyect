import { apiClient } from '../http/axios-client'
import type { AdminLiveSessionRepository } from '@/domain/ports/admin-live-session.repository'
import type { AdminLiveSession } from '@/domain/entities/admin-live-session.entity'
import type { CreateAdminLiveSessionDto, UpdateAdminLiveSessionDto } from '@/application/dtos/admin-live-session.dto'
import type { PaginatedResult } from '@/domain/entities/paginated-result.entity'
import { parseApiError } from '../http/parse-api-error'

export class AxiosAdminLiveSessionRepository implements AdminLiveSessionRepository {
  async getAll(params?: Record<string, any>): Promise<PaginatedResult<AdminLiveSession>> {
    try {
      const { data } = await apiClient.get<PaginatedResult<AdminLiveSession>>('/live-sessions/', { params })
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async getById(id: number): Promise<AdminLiveSession> {
    try {
      const { data } = await apiClient.get<AdminLiveSession>(`/live-sessions/${id}/`)
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async create(payload: CreateAdminLiveSessionDto): Promise<AdminLiveSession> {
    try {
      const { data } = await apiClient.post<AdminLiveSession>('/live-sessions/', payload)
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async update(id: number, payload: UpdateAdminLiveSessionDto): Promise<AdminLiveSession> {
    try {
      const { data } = await apiClient.patch<AdminLiveSession>(`/live-sessions/${id}/`, payload)
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async delete(id: number): Promise<void> {
    try {
      await apiClient.delete(`/live-sessions/${id}/`)
    } catch (err) {
      throw parseApiError(err)
    }
  }
}