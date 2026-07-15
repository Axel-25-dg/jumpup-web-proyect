import type { IOrderRepository } from '@/domain/ports/order.port'
import type { Order, CreateOrderRequest } from '@/domain/entities/order.entity'
import type { PaginatedResult } from '@/domain/entities/paginated-result.entity'

export class OrderUseCase {
  private readonly orderRepository: IOrderRepository
  constructor(orderRepository: IOrderRepository) {
    this.orderRepository = orderRepository
  }

  async createOrder(request: CreateOrderRequest): Promise<Order> {
    return this.orderRepository.createOrder(request)
  }

  async getOrders(page: number = 1): Promise<PaginatedResult<Order>> {
    return this.orderRepository.getOrders(page)
  }

  async getOrder(id: number): Promise<Order> {
    return this.orderRepository.getOrder(id)
  }

  async cancelOrder(id: number): Promise<Order> {
    return this.orderRepository.cancelOrder(id)
  }
}
