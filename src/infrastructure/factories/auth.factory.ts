import { AxiosAuthRepository } from '@/infrastructure/adapters/axios-auth.repository'
import { AuthUseCase } from '@/application/use-cases/auth.use-case'

export const authUseCase = new AuthUseCase(new AxiosAuthRepository())
