import type { ForumCategoryRepository } from '@/domain/ports/forum-category.repository'
import type { ForumCategory } from '@/domain/entities/forum-category.entity'
import type { CreateForumCategoryDto, UpdateForumCategoryDto } from '@/application/dtos/forum-category.dto'
import type { PaginatedResult } from '@/domain/entities/paginated-result.entity'

export class ForumCategoryUseCase {
  private readonly repository: ForumCategoryRepository

  constructor(repository: ForumCategoryRepository) {
    this.repository = repository
  }

  getAll(params?: Record<string, any>): Promise<PaginatedResult<ForumCategory>> {
    return this.repository.getAll(params)
  }

  getById(id: number): Promise<ForumCategory> {
    return this.repository.getById(id)
  }

  create(data: CreateForumCategoryDto): Promise<ForumCategory> {
    return this.repository.create(data)
  }

  update(id: number, data: UpdateForumCategoryDto): Promise<ForumCategory> {
    return this.repository.update(id, data)
  }

  delete(id: number): Promise<void> {
    return this.repository.delete(id)
  }
}