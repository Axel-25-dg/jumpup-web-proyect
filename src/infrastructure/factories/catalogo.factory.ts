import { AxiosCatalogoRepository } from '@/infrastructure/adapters/axios-catalogo.repository'
import { CatalogoUseCase } from '@/application/use-cases/catalogo.use-case'

const repository = new AxiosCatalogoRepository()
export const catalogoUseCase = new CatalogoUseCase(repository)