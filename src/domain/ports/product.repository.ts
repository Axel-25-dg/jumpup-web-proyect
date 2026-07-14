import type { Product } from '../entities/product.entity'
import type { PaginatedResult } from '../entities/paginated-result.entity'
import type { ProductFilters } from '../entities/product-filters.entity'

export interface ProductRepository {
  getProducts(filters?: Partial<ProductFilters>, page?: number): Promise<PaginatedResult<Product>>
  getProduct(id: number): Promise<Product>
}
