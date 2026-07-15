import { OrderUseCase } from '@/application/use-cases/order.use-case'
import { AxiosOrderRepository } from '@/infrastructure/repositories/axios-order.repository'

export const orderUseCase = new OrderUseCase(new AxiosOrderRepository())
