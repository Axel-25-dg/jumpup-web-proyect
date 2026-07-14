import type { Category } from '../entities/category.entity'

export interface CategoryRepository {
  getCategories(): Promise<Category[]>
}
