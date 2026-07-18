import type { OrdenCompraRepository } from '@/domain/ports/orden-compra.repository'
import type { OrdenCompra } from '@/domain/entities/orden-compra.entity'
import type { PaginatedResult } from '@/domain/entities/paginated-result.entity'

export class OrdenCompraUseCase {
  private readonly repository: OrdenCompraRepository

  constructor(repository: OrdenCompraRepository) {
    this.repository = repository
  }

  getAll(params?: Record<string, any>): Promise<PaginatedResult<OrdenCompra>> {
    return this.repository.getAll(params)
  }

  getById(id: number): Promise<OrdenCompra> {
    return this.repository.getById(id)
  }
}