import type { Category } from '../entities/category.entity'
import type { CreateCategoryDto, UpdateCategoryDto } from '@/application/dtos/category.dto'

export interface CategoryRepository {
  getCategories(): Promise<Category[]>
  getCategoryById(id: number): Promise<Category>
  createCategory(data: CreateCategoryDto): Promise<Category>
  updateCategory(id: number, data: UpdateCategoryDto): Promise<Category>
  deleteCategory(id: number): Promise<void>
}
