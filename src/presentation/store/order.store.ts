import { create } from 'zustand'
import { orderUseCase } from '@/infrastructure/factories/order.factory'
import type { Order } from '@/domain/entities/order.entity'
import type { PaginatedResult } from '@/domain/entities/paginated-result.entity'

interface OrderState {
  orders: Order[]
  currentOrder: Order | null
  paginatedResult: PaginatedResult<Order> | null
  isLoading: boolean
  error: string | null
  totalCount: number
  currentPage: number
}

interface OrderActions {
  createOrder(items?: Array<{ product_id: number; quantity: number }>): Promise<Order>
  fetchOrders(page: number): Promise<void>
  fetchOrder(id: number): Promise<void>
  cancelOrder(id: number): Promise<void>
  setPage(page: number): void
}

export const useOrderStore = create<OrderState & OrderActions>((set) => ({
  orders: [],
  currentOrder: null,
  paginatedResult: null,
  isLoading: false,
  error: null,
  totalCount: 0,
  currentPage: 1,

  async createOrder(items) {
    set({ isLoading: true, error: null })
    try {
      const order = await orderUseCase.createOrder({ items })
      set({ currentOrder: order, isLoading: false })
      return order
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al crear orden'
      set({ error: message, isLoading: false })
      throw err
    }
  },

  async fetchOrders(page = 1) {
    set({ isLoading: true, error: null })
    try {
      const result = await orderUseCase.getOrders(page)
      set({
        orders: result.results,
        paginatedResult: result,
        totalCount: result.count,
        currentPage: page,
        isLoading: false,
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar órdenes'
      set({ error: message, isLoading: false })
    }
  },

  async fetchOrder(id) {
    set({ isLoading: true, error: null })
    try {
      const order = await orderUseCase.getOrder(id)
      set({ currentOrder: order, isLoading: false })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar orden'
      set({ error: message, isLoading: false })
    }
  },

  async cancelOrder(id) {
    set({ isLoading: true, error: null })
    try {
      const order = await orderUseCase.cancelOrder(id)
      set((state) => ({
        orders: state.orders.map((o) => (o.id === id ? order : o)),
        currentOrder: state.currentOrder?.id === id ? order : state.currentOrder,
        isLoading: false,
      }))
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cancelar orden'
      set({ error: message, isLoading: false })
    }
  },

  setPage(page) {
    set({ currentPage: page })
  },
}))
