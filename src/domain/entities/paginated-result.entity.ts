/** Genérico reutilizable para cualquier endpoint paginado de Django REST Framework. */
export interface PaginatedResult<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}
