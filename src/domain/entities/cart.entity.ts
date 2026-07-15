export interface CartItem {
  id: string
  product_id: number
  name: string
  price: number
  quantity: number
  image_url?: string
}

export interface Cart {
  id: number
  student_id: number
  items: CartItem[]
  total_price: number
  created_at: string
  updated_at: string
}
