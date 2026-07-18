import type { OrdenCompra } from '../entities/orden-compra.entity'
import type { PaginatedResult } from '../entities/paginated-result.entity'

export interface OrdenCompraRepository {
  getAll(params?: Record<string, any>): Promise<PaginatedResult<OrdenCompra>>
  getById(id: number): Promise<OrdenCompra>
}