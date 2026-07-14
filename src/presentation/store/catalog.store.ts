import { create } from 'zustand'
import { categoryUseCase } from '@/infrastructure/factories/category.factory'
import { productUseCase } from '@/infrastructure/factories/product.factory'
import type { Category } from '@/domain/entities/category.entity'
import type { Product } from '@/domain/entities/product.entity'
import type { ProductFilters } from '@/domain/entities/product-filters.entity'

interface CatalogState {
  products: Product[]
  categories: Category[]
  filters: ProductFilters
  isLoading: boolean
  error: string | null
  totalCount: number
  currentPage: number
  activeFilterCount: number
}

interface CatalogActions {
  fetchProducts(): Promise<void>
  fetchCategories(): Promise<void>
  setFilters(partial: Partial<ProductFilters>): void
  resetFilters(): void
  setPage(page: number): void
}

const DEFAULT_FILTERS: ProductFilters = {
  search: '',
  categoryId: null,
  ordering: 'name',
}

function countActiveFilters(filters: ProductFilters): number {
  let count = 0
  if (filters.search.trim() !== '') count++
  if (filters.categoryId !== null) count++
  if (filters.ordering !== DEFAULT_FILTERS.ordering) count++
  return count
}

export const useCatalogStore = create<CatalogState & CatalogActions>((set, get) => ({
  products: [],
  categories: [],
  filters: { ...DEFAULT_FILTERS },
  isLoading: false,
  error: null,
  totalCount: 0,
  currentPage: 1,
  activeFilterCount: 0,

  async fetchProducts() {
    set({ isLoading: true, error: null })
    try {
      const { filters, currentPage } = get()
      const data = await productUseCase.getProducts(filters, currentPage)
      set({
        products: data.results,
        totalCount: data.count,
        isLoading: false,
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar productos'
      set({ error: message, isLoading: false })
    }
  },

  async fetchCategories() {
    try {
      const data = await categoryUseCase.getCategories()
      set({ categories: data })
    } catch {
      // Las categorías son opcionales; no bloquear la UI si fallan
    }
  },

  setFilters(partial) {
    set((state) => {
      const newFilters = { ...state.filters, ...partial }
      return {
        filters: newFilters,
        currentPage: 1,
        activeFilterCount: countActiveFilters(newFilters),
      }
    })
  },

  resetFilters() {
    set({
      filters: { ...DEFAULT_FILTERS },
      currentPage: 1,
      activeFilterCount: 0,
    })
  },

  setPage(page) {
    set({ currentPage: page })
  },
}))
