import type { Category } from './category.entity'

export interface Product {
  id: number
  name: string
  description: string
  price: number
  stock: number
  category: Category
  image: string | null
  is_active: boolean
}
