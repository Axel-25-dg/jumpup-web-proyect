import type { CategoryRepository } from '@/domain/ports/category.repository'
import type { Category } from '@/domain/entities/category.entity'
import type { CreateCategoryDto, UpdateCategoryDto } from '@/application/dtos/category.dto'

export class CategoryUseCase {
  private readonly categoryRepository: CategoryRepository

  constructor(categoryRepository: CategoryRepository) {
    this.categoryRepository = categoryRepository
  }

  getCategories(): Promise<Category[]> {
    return this.categoryRepository.getCategories()
  }

  getCategoryById(id: number): Promise<Category> {
    return this.categoryRepository.getCategoryById(id)
  }

  createCategory(data: CreateCategoryDto): Promise<Category> {
    return this.categoryRepository.createCategory(data)
  }

  updateCategory(id: number, data: UpdateCategoryDto): Promise<Category> {
    return this.categoryRepository.updateCategory(id, data)
  }

  deleteCategory(id: number): Promise<void> {
    return this.categoryRepository.deleteCategory(id)
  }
}
