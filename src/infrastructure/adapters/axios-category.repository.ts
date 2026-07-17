import { apiClient } from '@/infrastructure/http/axios-client'
import { parseApiError } from '@/infrastructure/http/parse-api-error'
import type { CategoryRepository } from '@/domain/ports/category.repository'
import type { Category } from '@/domain/entities/category.entity'
import type { PaginatedResult } from '@/domain/entities/paginated-result.entity'
import type { CreateCategoryDto, UpdateCategoryDto } from '@/application/dtos/category.dto'

export class AxiosCategoryRepository implements CategoryRepository {
  async getCategories(): Promise<Category[]> {
    try {
      const { data } = await apiClient.get<PaginatedResult<Category>>('/categories/', {
        params: { page_size: 100 },
      })
      return data.results
    } catch (err) {
      try {
        const { data } = await apiClient.get<PaginatedResult<Category>>('/categories', {
          params: { page_size: 100 },
        })
        return data.results
      } catch {
        throw parseApiError(err)
      }
    }
  }

  async getCategoryById(id: number): Promise<Category> {
    try {
      const { data } = await apiClient.get<Category>(`/categories/${id}/`)
      return data
    } catch (err) {
      try {
        const { data } = await apiClient.get<Category>(`/categories/${id}`)
        return data
      } catch {
        throw parseApiError(err)
      }
    }
  }

  async createCategory(dto: CreateCategoryDto): Promise<Category> {
    try {
      const { data } = await apiClient.post<Category>('/categories/', dto)
      return data
    } catch (err) {
      try {
        const { data } = await apiClient.post<Category>('/categories', dto)
        return data
      } catch {
        throw parseApiError(err)
      }
    }
  }

  async updateCategory(id: number, dto: UpdateCategoryDto): Promise<Category> {
    try {
      const { data } = await apiClient.patch<Category>(`/categories/${id}/`, dto)
      return data
    } catch (err) {
      try {
        const { data } = await apiClient.patch<Category>(`/categories/${id}`, dto)
        return data
      } catch {
        throw parseApiError(err)
      }
    }
  }

  async deleteCategory(id: number): Promise<void> {
    try {
      await apiClient.delete(`/categories/${id}/`)
    } catch (err) {
      try {
        await apiClient.delete(`/categories/${id}`)
      } catch {
        throw parseApiError(err)
      }
    }
  }
}
