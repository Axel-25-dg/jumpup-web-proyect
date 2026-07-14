import { SlidersHorizontal } from 'lucide-react'
import { Button } from '@/presentation/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/presentation/components/ui/sheet'
import { Badge } from '@/presentation/components/ui/badge'
import { CategoryFilter } from '@/presentation/components/CategoryFilter'
import { SortSelect } from '@/presentation/components/SortSelect'
import { useCatalogStore } from '@/presentation/store/catalog.store'

function FilterContent() {
  const resetFilters = useCatalogStore((s) => s.resetFilters)
  const fetchProducts = useCatalogStore((s) => s.fetchProducts)
  const activeFilterCount = useCatalogStore((s) => s.activeFilterCount)

  const handleReset = () => {
    resetFilters()
    fetchProducts()
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="mb-2 text-sm font-medium">Categoría</p>
        <div className="flex flex-col gap-1">
          <CategoryFilter layout="vertical" />
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium">Ordenamiento</p>
        <SortSelect />
      </div>

      {activeFilterCount > 0 && (
        <Button variant="ghost" size="sm" onClick={handleReset} className="self-start">
          Limpiar filtros
        </Button>
      )}
    </div>
  )
}

interface FilterPanelProps {
  className?: string
}

export function FilterPanel({ className }: FilterPanelProps) {
  const activeFilterCount = useCatalogStore((s) => s.activeFilterCount)

  return (
    <>
      {/* Sidebar visible en escritorio */}
      <aside className={`hidden lg:block ${className ?? ''}`}>
        <FilterContent />
      </aside>

      {/* Botón + Sheet visible en móvil */}
      <div className="lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="relative">
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Filtros
              {activeFilterCount > 0 && (
                <Badge className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full p-0 text-xs">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72">
            <SheetHeader className="mb-6">
              <SheetTitle>Filtros</SheetTitle>
            </SheetHeader>
            <FilterContent />
          </SheetContent>
        </Sheet>
      </div>
    </>
  )
}
