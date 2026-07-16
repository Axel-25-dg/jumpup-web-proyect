import { apiClient } from '@/infrastructure/http/axios-client'
import { parseApiError } from '@/infrastructure/http/parse-api-error'
import type { ProductRepository } from '@/domain/ports/product.repository'
import type { Product } from '@/domain/entities/product.entity'
import type { PaginatedResult } from '@/domain/entities/paginated-result.entity'
import type { ProductFilters } from '@/domain/entities/product-filters.entity'

export class AxiosProductRepository implements ProductRepository {
  async getProducts(filters?: Partial<ProductFilters>, page = 1): Promise<PaginatedResult<Product>> {
    const params: Record<string, string | number> = { page, page_size: 12 }

    if (filters?.search) {
      params.search = filters.search
    }
    if (filters?.categoryId !== undefined && filters.categoryId !== null) {
      params.category = filters.categoryId
    }
    if (filters?.ordering) {
      params.ordering = filters.ordering
    }

    try {
      const { data } = await apiClient.get<PaginatedResult<Product>>('/products/', { params })
      return data
    } catch (err) {
      // Intento fallback si el 404 es por la barra diagonal
      try {
        const { data } = await apiClient.get<PaginatedResult<Product>>('/products', { params })
        return data
      } catch {
        throw parseApiError(err)
      }
    }
  }

  async getProduct(id: number): Promise<Product> {
    try {
      const { data } = await apiClient.get<Product>(`/products/${id}/`)
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }
}
