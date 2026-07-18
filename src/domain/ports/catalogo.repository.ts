import type { Catalogo } from '../entities/catalogo.entity'
import type { CreateCatalogoDto, UpdateCatalogoDto } from '@/application/dtos/catalogo.dto'
import type { PaginatedResult } from '../entities/paginated-result.entity'

export interface CatalogoRepository {
  getAll(params?: Record<string, any>): Promise<PaginatedResult<Catalogo>>
  getById(id: number): Promise<Catalogo>
  create(data: CreateCatalogoDto): Promise<Catalogo>
  update(id: number, data: UpdateCatalogoDto): Promise<Catalogo>
  delete(id: number): Promise<void>
}