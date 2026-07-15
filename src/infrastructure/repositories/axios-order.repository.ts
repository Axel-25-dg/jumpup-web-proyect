import type { IOrderRepository } from '@/domain/ports/order.port'
import type { Order, CreateOrderRequest } from '@/domain/entities/order.entity'
import type { PaginatedResult } from '@/domain/entities/paginated-result.entity'
import { apiClient } from '@/infrastructure/http/axios-client'

export class AxiosOrderRepository implements IOrderRepository {
  async createOrder(request: CreateOrderRequest): Promise<Order> {
    const response = await apiClient.post<Order>('/ordenes-compra/', request)
    return response.data
  }

  async getOrders(page: number = 1): Promise<PaginatedResult<Order>> {
    const response = await apiClient.get<PaginatedResult<Order>>('/ordenes-compra/', {
      params: { page },
    })
    return response.data
  }

  async getOrder(id: number): Promise<Order> {
    const response = await apiClient.get<Order>(`/ordenes-compra/${id}/`)
    return response.data
  }

  async cancelOrder(id: number): Promise<Order> {
    const response = await apiClient.patch<Order>(`/ordenes-compra/${id}/cancel/`)
    return response.data
  }
}
