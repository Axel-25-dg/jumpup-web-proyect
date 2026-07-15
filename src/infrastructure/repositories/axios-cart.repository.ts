import type { ICartRepository } from '@/domain/ports/cart.port'
import type { Cart } from '@/domain/entities/cart.entity'
import { apiClient } from '@/infrastructure/http/axios-client'

export class AxiosCartRepository implements ICartRepository {
  async getCart(): Promise<Cart> {
    const response = await apiClient.get<Cart>('/carrito/')
    return response.data
  }

  async addItem(productId: number, quantity: number): Promise<Cart> {
    const response = await apiClient.post<Cart>('/carrito/', {
      product_id: productId,
      quantity,
    })
    return response.data
  }

  async updateItem(productId: number, quantity: number): Promise<Cart> {
    const response = await apiClient.patch<Cart>(`/carrito/${productId}/`, {
      quantity,
    })
    return response.data
  }

  async removeItem(productId: number): Promise<Cart> {
    const response = await apiClient.delete<Cart>(`/carrito/${productId}/`)
    return response.data
  }

  async clearCart(): Promise<void> {
    await apiClient.delete('/carrito/clear/')
  }
}
