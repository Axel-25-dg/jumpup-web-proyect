import { AxiosOrdenCompraRepository } from '@/infrastructure/adapters/axios-orden-compra.repository'
import { OrdenCompraUseCase } from '@/application/use-cases/orden-compra.use-case'

const repository = new AxiosOrdenCompraRepository()
export const ordenCompraUseCase = new OrdenCompraUseCase(repository)