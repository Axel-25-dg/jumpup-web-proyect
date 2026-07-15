import type { Cart } from '@/domain/entities/cart.entity'

export interface ICartRepository {
  getCart(): Promise<Cart>
  addItem(productId: number, quantity: number): Promise<Cart>
  updateItem(productId: number, quantity: number): Promise<Cart>
  removeItem(productId: number): Promise<Cart>
  clearCart(): Promise<void>
}
