export type OrderStatus = 'pending' | 'paid' | 'cancelled'

export interface OrderItem {
  id: number
  order_id: number
  product_id: number
  name: string
  quantity: number
  unit_price: number
  subtotal: number
}

export interface Order {
  id: number
  student_id: number
  status: OrderStatus
  total: number
  items: OrderItem[]
  created_at: string
  updated_at: string
}

export interface CreateOrderRequest {
  items?: Array<{ product_id: number; quantity: number }>
}
