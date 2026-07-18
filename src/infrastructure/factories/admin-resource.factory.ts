import { AxiosAdminResourceRepository } from '@/infrastructure/adapters/axios-admin-resource.repository'
import { AdminResourceUseCase } from '@/application/use-cases/admin-resource.use-case'

const repository = new AxiosAdminResourceRepository()
export const adminResourceUseCase = new AdminResourceUseCase(repository)