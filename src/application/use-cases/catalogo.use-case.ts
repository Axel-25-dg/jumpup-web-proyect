import type { CatalogoRepository } from '@/domain/ports/catalogo.repository'
import type { Catalogo } from '@/domain/entities/catalogo.entity'
import type { CreateCatalogoDto, UpdateCatalogoDto } from '@/application/dtos/catalogo.dto'
import type { PaginatedResult } from '@/domain/entities/paginated-result.entity'

export class CatalogoUseCase {
  private readonly repository: CatalogoRepository

  constructor(repository: CatalogoRepository) {
    this.repository = repository
  }

  getAll(params?: Record<string, any>): Promise<PaginatedResult<Catalogo>> {
    return this.repository.getAll(params)
  }

  getById(id: number): Promise<Catalogo> {
    return this.repository.getById(id)
  }

  create(data: CreateCatalogoDto): Promise<Catalogo> {
    return this.repository.create(data)
  }

  update(id: number, data: UpdateCatalogoDto): Promise<Catalogo> {
    return this.repository.update(id, data)
  }

  delete(id: number): Promise<void> {
    return this.repository.delete(id)
  }
}