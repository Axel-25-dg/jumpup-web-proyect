import { apiClient } from '../http/axios-client'
import type { ForumCategoryRepository } from '@/domain/ports/forum-category.repository'
import type { ForumCategory } from '@/domain/entities/forum-category.entity'
import type { CreateForumCategoryDto, UpdateForumCategoryDto } from '@/application/dtos/forum-category.dto'
import type { PaginatedResult } from '@/domain/entities/paginated-result.entity'
import { parseApiError } from '../http/parse-api-error'

export class AxiosForumCategoryRepository implements ForumCategoryRepository {
  async getAll(params?: Record<string, any>): Promise<PaginatedResult<ForumCategory>> {
    try {
      const { data } = await apiClient.get<PaginatedResult<ForumCategory>>('/forum-categories/', { params })
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async getById(id: number): Promise<ForumCategory> {
    try {
      const { data } = await apiClient.get<ForumCategory>(`/forum-categories/${id}/`)
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async create(payload: CreateForumCategoryDto): Promise<ForumCategory> {
    try {
      const { data } = await apiClient.post<ForumCategory>('/forum-categories/', payload)
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async update(id: number, payload: UpdateForumCategoryDto): Promise<ForumCategory> {
    try {
      const { data } = await apiClient.patch<ForumCategory>(`/forum-categories/${id}/`, payload)
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async delete(id: number): Promise<void> {
    try {
      await apiClient.delete(`/forum-categories/${id}/`)
    } catch (err) {
      throw parseApiError(err)
    }
  }
}