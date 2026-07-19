import { apiClient } from '../http/axios-client'
import type { CatalogoRepository } from '@/domain/ports/catalogo.repository'
import type { Catalogo } from '@/domain/entities/catalogo.entity'
import type { CreateCatalogoDto, UpdateCatalogoDto } from '@/application/dtos/catalogo.dto'
import type { PaginatedResult } from '@/domain/entities/paginated-result.entity'
import { parseApiError } from '../http/parse-api-error'

export class AxiosCatalogoRepository implements CatalogoRepository {
  async getAll(params?: Record<string, any>): Promise<PaginatedResult<Catalogo>> {
    try {
      const { data } = await apiClient.get<PaginatedResult<Catalogo>>('/catalogo/', { params })
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async getById(id: number): Promise<Catalogo> {
    try {
      const { data } = await apiClient.get<Catalogo>(`/catalogo/${id}/`)
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async create(payload: CreateCatalogoDto): Promise<Catalogo> {
    try {
      const { data } = await apiClient.post<Catalogo>('/catalogo/', payload)
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async update(id: number, payload: UpdateCatalogoDto): Promise<Catalogo> {
    try {
      const { data } = await apiClient.patch<Catalogo>(`/catalogo/${id}/`, payload)
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async delete(id: number): Promise<void> {
    try {
      await apiClient.delete(`/catalogo/${id}/`)
    } catch (err) {
      throw parseApiError(err)
    }
  }
}