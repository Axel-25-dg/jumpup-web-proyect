import { apiClient } from '../http/axios-client'
import type { OrdenCompraRepository } from '@/domain/ports/orden-compra.repository'
import type { OrdenCompra } from '@/domain/entities/orden-compra.entity'
import type { PaginatedResult } from '@/domain/entities/paginated-result.entity'
import { parseApiError } from '../http/parse-api-error'

export class AxiosOrdenCompraRepository implements OrdenCompraRepository {
  async getAll(params?: Record<string, any>): Promise<PaginatedResult<OrdenCompra>> {
    try {
      const { data } = await apiClient.get<PaginatedResult<OrdenCompra>>('/ordenes-compra/', { params })
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async getById(id: number): Promise<OrdenCompra> {
    try {
      const { data } = await apiClient.get<OrdenCompra>(`/ordenes-compra/${id}/`)
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }
}