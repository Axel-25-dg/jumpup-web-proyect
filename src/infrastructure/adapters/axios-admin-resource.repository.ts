import { apiClient } from '../http/axios-client'
import type { AdminResourceRepository } from '@/domain/ports/admin-resource.repository'
import type { AdminResource } from '@/domain/entities/admin-resource.entity'
import type { CreateAdminResourceDto, UpdateAdminResourceDto } from '@/application/dtos/admin-resource.dto'
import type { PaginatedResult } from '@/domain/entities/paginated-result.entity'
import { parseApiError } from '../http/parse-api-error'

export class AxiosAdminResourceRepository implements AdminResourceRepository {
  async getAll(params?: Record<string, any>): Promise<PaginatedResult<AdminResource>> {
    try {
      const { data } = await apiClient.get<PaginatedResult<AdminResource>>('/resources/', { params })
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async getById(id: number): Promise<AdminResource> {
    try {
      const { data } = await apiClient.get<AdminResource>(`/resources/${id}/`)
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async create(payload: CreateAdminResourceDto): Promise<AdminResource> {
    try {
      const { data } = await apiClient.post<AdminResource>('/resources/', payload)
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async createWithFormData(formData: FormData): Promise<AdminResource> {
    try {
      const { data } = await apiClient.post<AdminResource>('/resources/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async update(id: number, payload: UpdateAdminResourceDto): Promise<AdminResource> {
    try {
      const { data } = await apiClient.patch<AdminResource>(`/resources/${id}/`, payload)
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async updateWithFormData(id: number, formData: FormData): Promise<AdminResource> {
    try {
      const { data } = await apiClient.patch<AdminResource>(`/resources/${id}/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async delete(id: number): Promise<void> {
    try {
      await apiClient.delete(`/resources/${id}/`)
    } catch (err) {
      throw parseApiError(err)
    }
  }
}