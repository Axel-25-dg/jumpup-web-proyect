import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Filter, Search, Sparkles, X } from 'lucide-react'
import { CategoryFilter } from '@/presentation/components/CategoryFilter'
import { FilterPanel } from '@/presentation/components/FilterPanel'
import { ProductCard } from '@/presentation/components/ProductCard'
import { ProductCardSkeleton } from '@/presentation/components/ProductCardSkeleton'
import { useCatalogStore } from '@/presentation/store/catalog.store'
import { Button } from '@/presentation/components/ui/button'
import { Input } from '@/presentation/components/ui/input'
import { cn } from '@/presentation/utils/cn'
import SEO from '@/presentation/components/SEO'

const PAGE_SIZE = 12

export default function CatalogPage() {
  const [searchParams] = useSearchParams()
  const products = useCatalogStore((s) => s.products)
  const isLoading = useCatalogStore((s) => s.isLoading)
  const totalCount = useCatalogStore((s) => s.totalCount)
  const currentPage = useCatalogStore((s) => s.currentPage)
  const fetchProducts = useCatalogStore((s) => s.fetchProducts)
  const fetchCategories = useCatalogStore((s) => s.fetchCategories)
  const setPage = useCatalogStore((s) => s.setPage)
  const filters = useCatalogStore((s) => s.filters)
  const setFilters = useCatalogStore((s) => s.setFilters)
  const resetFilters = useCatalogStore((s) => s.resetFilters)

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))

  // Cargar categorías al montar
  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  // Sincronizar parámetro 'q' o 'search' de la URL con el filtro de búsqueda
  useEffect(() => {
    const qParam = searchParams.get('q') || searchParams.get('search')
    if (qParam !== null && qParam !== filters.search) {
      setFilters({ search: qParam })
    }
  }, [searchParams])

  // Centralizar carga de productos
  useEffect(() => {
    fetchProducts()
  }, [fetchProducts, currentPage, filters.search, filters.categoryId, filters.ordering])

  const handleSearchChange = (value: string) => {
    setFilters({ search: value })
  }

  const handleClearSearch = () => {
    setFilters({ search: '' })
  }

  const handlePrev = () => {
    if (currentPage > 1) setPage(currentPage - 1)
  }

  const handleNext = () => {
    if (currentPage < totalPages) setPage(currentPage + 1)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-in fade-in duration-500">
      <SEO
        title="Catálogo de Cursos de Idiomas - JumpUp"
        description="Explora el catálogo premium de cursos de idiomas de JumpUp: inglés, francés, alemán, italiano y más, con tutoría de IA y certificaciones."
        keywords="cursos de idiomas, aprender ingles, catalogo de idiomas, JumpUp, UTE, certificaciones de idiomas"
        canonicalUrl="https://jumpup-idiomas.uaeftt-ute.site/catalog"
      />
      {/* Header & Hero-like Section */}
      <div className="relative mb-16">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/10 blur-[100px] rounded-full -z-10" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[80px] rounded-full -z-10" />

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.2em] mb-4">
              <Sparkles size={14} /> El futuro del aprendizaje
            </div>
            <h1 className="text-5xl font-black tracking-tighter text-foreground leading-[1.1]">
              Explora Nuestro <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-indigo-500 to-primary bg-[length:200%_auto] animate-gradient">
                Catálogo Premium
              </span>
            </h1>
            <p className="text-muted-foreground font-medium mt-4 text-lg">
              Domina las habilidades más demandadas con programas diseñados por expertos de la industria.
            </p>
          </div>

          <div className="flex flex-col gap-4 w-full md:w-auto">
            {/* Buscador Funcional */}
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
              <Input
                type="text"
                value={filters.search}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Buscar cursos, bootcamps..."
                className="pl-12 pr-10 h-14 w-full md:w-[400px] bg-card/50 backdrop-blur-sm border-border/50 rounded-2xl font-bold focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
              />
              {filters.search && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                >
                  <X size={16} />
                </button>
              )}
            </div>
            <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-widest text-muted-foreground px-2">
              <span>{totalCount} PROGRAMAS DISPONIBLES</span>
              <button className="flex items-center gap-2 hover:text-primary transition-colors lg:hidden">
                <Filter size={14} /> FILTRAR
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Bar */}
      <div className="mb-12 overflow-x-auto pb-4 no-scrollbar">
        <CategoryFilter layout="horizontal" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Sidebar Filters */}
        <aside className="hidden lg:block lg:col-span-3">
          <div className="sticky top-24 bg-card/30 backdrop-blur-sm border border-border/40 rounded-[2.5rem] p-8">
            <FilterPanel />
          </div>
        </aside>

        {/* Product Grid */}
        <main className="lg:col-span-9">
          {isLoading ? (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 bg-card/20 rounded-[3rem] border-2 border-dashed border-border/50">
              <div className="p-6 bg-muted rounded-full mb-6">
                <Search size={40} className="text-muted-foreground/50" />
              </div>
              <h3 className="text-2xl font-black text-foreground">No encontramos lo que buscas</h3>
              <p className="text-muted-foreground font-medium mt-2">Intenta ajustar tus filtros o búsqueda.</p>
              <Button variant="link" onClick={() => resetFilters()} className="mt-4 font-bold text-primary">
                Limpiar todos los filtros
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 xl:grid-cols-3">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {!isLoading && products.length > 0 && (
            <div className="mt-16 flex items-center justify-center gap-6">
              <Button
                variant="ghost"
                size="lg"
                onClick={handlePrev}
                disabled={currentPage === 1}
                className="rounded-2xl font-black hover:bg-primary/10 hover:text-primary disabled:opacity-30"
              >
                <ChevronLeft size={20} className="mr-2" /> Anterior
              </Button>

              <div className="flex gap-2">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={cn(
                      "w-10 h-10 rounded-xl font-black text-sm transition-all",
                      currentPage === i + 1
                        ? "bg-primary text-white shadow-lg shadow-primary/20 scale-110"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    )}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              <Button
                variant="ghost"
                size="lg"
                onClick={handleNext}
                disabled={currentPage === totalPages}
                className="rounded-2xl font-black hover:bg-primary/10 hover:text-primary disabled:opacity-30"
              >
                Siguiente <ChevronRight size={20} className="ml-2" />
              </Button>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
