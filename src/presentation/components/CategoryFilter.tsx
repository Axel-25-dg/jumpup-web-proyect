import { useCatalogStore } from '@/presentation/store/catalog.store'
import { Button } from '@/presentation/components/ui/button'
import { cn } from '@/presentation/utils/cn'

interface CategoryFilterProps {
  layout?: 'horizontal' | 'vertical'
}

export function CategoryFilter({ layout = 'horizontal' }: CategoryFilterProps) {
  const categories = useCatalogStore((s) => s.categories)
  const filters = useCatalogStore((s) => s.filters)
  const setFilters = useCatalogStore((s) => s.setFilters)
  const fetchProducts = useCatalogStore((s) => s.fetchProducts)

  const handleSelect = (categoryId: number | null) => {
    setFilters({ categoryId })
    fetchProducts()
  }

  const containerClass =
    layout === 'vertical' ? 'flex flex-col gap-1' : 'flex gap-2 overflow-x-auto pb-2 scrollbar-thin'

  const buttonClass = layout === 'vertical' ? 'justify-start' : 'shrink-0'

  return (
    <div className={containerClass}>
      <Button
        variant={filters.categoryId === null ? 'default' : 'ghost'}
        size="sm"
        className={cn(buttonClass, filters.categoryId === null && 'pointer-events-none')}
        onClick={() => handleSelect(null)}
      >
        Todos
      </Button>

      {categories.map((cat) => (
        <Button
          key={cat.id}
          variant={filters.categoryId === cat.id ? 'default' : 'ghost'}
          size="sm"
          className={cn(
            buttonClass,
            filters.categoryId === cat.id && 'pointer-events-none',
          )}
          onClick={() => handleSelect(cat.id)}
        >
          {cat.name}
        </Button>
      ))}
    </div>
  )
}
