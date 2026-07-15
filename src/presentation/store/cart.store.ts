import { create } from 'zustand'
import { cartUseCase } from '@/infrastructure/factories/cart.factory'
import type { Cart } from '@/domain/entities/cart.entity'

interface CartState {
  cart: Cart | null
  isLoading: boolean
  error: string | null
}

interface CartActions {
  fetchCart(): Promise<void>
  addItem(productId: number, quantity: number): Promise<void>
  updateItem(productId: number, quantity: number): Promise<void>
  removeItem(productId: number): Promise<void>
  clearCart(): Promise<void>
}

export const useCartStore = create<CartState & CartActions>((set) => ({
  cart: null,
  isLoading: false,
  error: null,

  async fetchCart() {
    set({ isLoading: true, error: null })
    try {
      const cart = await cartUseCase.getCart()
      set({ cart, isLoading: false })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar carrito'
      set({ error: message, isLoading: false })
    }
  },

  async addItem(productId: number, quantity: number) {
    set({ isLoading: true, error: null })
    try {
      const cart = await cartUseCase.addItem(productId, quantity)
      set({ cart, isLoading: false })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al agregar artículo'
      set({ error: message, isLoading: false })
    }
  },

  async updateItem(productId: number, quantity: number) {
    set({ isLoading: true, error: null })
    try {
      const cart = await cartUseCase.updateItem(productId, quantity)
      set({ cart, isLoading: false })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al actualizar artículo'
      set({ error: message, isLoading: false })
    }
  },

  async removeItem(productId: number) {
    set({ isLoading: true, error: null })
    try {
      const cart = await cartUseCase.removeItem(productId)
      set({ cart, isLoading: false })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al eliminar artículo'
      set({ error: message, isLoading: false })
    }
  },

  async clearCart() {
    set({ isLoading: true, error: null })
    try {
      await cartUseCase.clearCart()
      set({ cart: null, isLoading: false })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al limpiar carrito'
      set({ error: message, isLoading: false })
    }
  },
}))
