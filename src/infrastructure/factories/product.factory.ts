import { AxiosProductRepository } from '@/infrastructure/adapters/axios-product.repository'
import { ProductUseCase } from '@/application/use-cases/product.use-case'

export const productUseCase = new ProductUseCase(new AxiosProductRepository())
