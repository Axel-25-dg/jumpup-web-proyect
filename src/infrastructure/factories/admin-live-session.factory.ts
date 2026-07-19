import { AxiosAdminLiveSessionRepository } from '@/infrastructure/adapters/axios-admin-live-session.repository'
import { AdminLiveSessionUseCase } from '@/application/use-cases/admin-live-session.use-case'

const repository = new AxiosAdminLiveSessionRepository()
export const adminLiveSessionUseCase = new AdminLiveSessionUseCase(repository)