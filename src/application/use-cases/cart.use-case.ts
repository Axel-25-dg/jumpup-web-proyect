import type { ICartRepository } from '@/domain/ports/cart.port'
import type { Cart } from '@/domain/entities/cart.entity'

export class CartUseCase {
  private readonly cartRepository: ICartRepository
  constructor(cartRepository: ICartRepository) {
    this.cartRepository = cartRepository
  }

  async getCart(): Promise<Cart> {
    return this.cartRepository.getCart()
  }

  async addItem(productId: number, quantity: number): Promise<Cart> {
    return this.cartRepository.addItem(productId, quantity)
  }

  async updateItem(productId: number, quantity: number): Promise<Cart> {
    return this.cartRepository.updateItem(productId, quantity)
  }

  async removeItem(productId: number): Promise<Cart> {
    return this.cartRepository.removeItem(productId)
  }

  async clearCart(): Promise<void> {
    return this.cartRepository.clearCart()
  }
}
