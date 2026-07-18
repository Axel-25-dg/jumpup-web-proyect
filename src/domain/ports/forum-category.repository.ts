import type { ForumCategory } from '../entities/forum-category.entity'
import type { CreateForumCategoryDto, UpdateForumCategoryDto } from '@/application/dtos/forum-category.dto'
import type { PaginatedResult } from '../entities/paginated-result.entity'

export interface ForumCategoryRepository {
  getAll(params?: Record<string, any>): Promise<PaginatedResult<ForumCategory>>
  getById(id: number): Promise<ForumCategory>
  create(data: CreateForumCategoryDto): Promise<ForumCategory>
  update(id: number, data: UpdateForumCategoryDto): Promise<ForumCategory>
  delete(id: number): Promise<void>
}