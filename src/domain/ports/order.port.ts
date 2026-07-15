import type { Order, CreateOrderRequest } from '@/domain/entities/order.entity'
import type { PaginatedResult } from '@/domain/entities/paginated-result.entity'

export interface IOrderRepository {
  createOrder(request: CreateOrderRequest): Promise<Order>
  getOrders(page: number): Promise<PaginatedResult<Order>>
  getOrder(id: number): Promise<Order>
  cancelOrder(id: number): Promise<Order>
}
