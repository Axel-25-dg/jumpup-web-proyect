import { useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { CategoryFilter } from '@/presentation/components/CategoryFilter'
import { FilterPanel } from '@/presentation/components/FilterPanel'
import { ProductCard } from '@/presentation/components/ProductCard'
import { ProductCardSkeleton } from '@/presentation/components/ProductCardSkeleton'
import { SearchBar } from '@/presentation/components/SearchBar'
import { useCatalogStore } from '@/presentation/store/catalog.store'
import { Button } from '@/presentation/components/ui/button'

const PAGE_SIZE = 12

export default function CatalogPage() {
  const products = useCatalogStore((s) => s.products)
  const categories = useCatalogStore((s) => s.categories)
  const isLoading = useCatalogStore((s) => s.isLoading)
  const totalCount = useCatalogStore((s) => s.totalCount)
  const currentPage = useCatalogStore((s) => s.currentPage)
  const fetchProducts = useCatalogStore((s) => s.fetchProducts)
  const fetchCategories = useCatalogStore((s) => s.fetchCategories)
  const setPage = useCatalogStore((s) => s.setPage)

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))

  useEffect(() => {
    if (categories.length === 0) {
      fetchCategories()
    }
  }, [categories.length, fetchCategories])

  useEffect(() => {
    fetchProducts()
  }, [currentPage, fetchProducts])

  const handlePrev = () => {
    if (currentPage > 1) setPage(currentPage - 1)
  }

  const handleNext = () => {
    if (currentPage < totalPages) setPage(currentPage + 1)
  }

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Catálogo</h1>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <SearchBar />
        <div className="lg:hidden">
          <FilterPanel />
        </div>
        <p className="ml-auto text-sm text-muted-foreground">
          {totalCount} resultado{totalCount !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="mb-6 hidden lg:block">
        <CategoryFilter layout="horizontal" />
      </div>

      <div className="lg:grid lg:grid-cols-[240px_1fr] lg:gap-8">
        <FilterPanel className="sticky top-20 h-fit" />

        <div>
          {isLoading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="flex min-h-64 items-center justify-center">
              <p className="text-muted-foreground">No se encontraron productos</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {!isLoading && products.length > 0 && (
            <div className="mt-8 flex items-center justify-center gap-4">
              <Button variant="outline" size="sm" onClick={handlePrev} disabled={currentPage === 1}>
                <ChevronLeft className="mr-1 h-4 w-4" />
                Anterior
              </Button>
              <span className="text-sm text-muted-foreground">
                Página {currentPage} de {totalPages}
              </span>
              <Button variant="outline" size="sm" onClick={handleNext} disabled={currentPage === totalPages}>
                Siguiente
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
