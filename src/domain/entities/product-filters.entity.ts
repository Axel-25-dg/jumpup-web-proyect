export type OrderingOption = 'price' | '-price' | 'name' | '-name' | 'stock'

/** Criterios de búsqueda/orden del catálogo de productos. */
export interface ProductFilters {
  search: string
  categoryId: number | null
  ordering: OrderingOption
}
