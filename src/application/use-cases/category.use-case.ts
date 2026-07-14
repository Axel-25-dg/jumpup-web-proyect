import type { CategoryRepository } from '@/domain/ports/category.repository'
import type { Category } from '@/domain/entities/category.entity'

export class CategoryUseCase {
  private readonly categoryRepository: CategoryRepository

  constructor(categoryRepository: CategoryRepository) {
    this.categoryRepository = categoryRepository
  }

  getCategories(): Promise<Category[]> {
    return this.categoryRepository.getCategories()
  }
}
