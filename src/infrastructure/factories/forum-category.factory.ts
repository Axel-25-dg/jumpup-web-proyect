import { AxiosForumCategoryRepository } from '@/infrastructure/adapters/axios-forum-category.repository'
import { ForumCategoryUseCase } from '@/application/use-cases/forum-category.use-case'

const repository = new AxiosForumCategoryRepository()
export const forumCategoryUseCase = new ForumCategoryUseCase(repository)