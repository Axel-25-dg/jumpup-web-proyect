import { CartUseCase } from '@/application/use-cases/cart.use-case'
import { AxiosCartRepository } from '@/infrastructure/repositories/axios-cart.repository'

export const cartUseCase = new CartUseCase(new AxiosCartRepository())
