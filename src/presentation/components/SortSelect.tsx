import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/presentation/components/ui/select'
import { useCatalogStore } from '@/presentation/store/catalog.store'
import type { OrderingOption } from '@/domain/entities/product-filters.entity'

interface SortOption {
  label: string
  value: OrderingOption
}

const SORT_OPTIONS: SortOption[] = [
  { label: 'Nombre A-Z', value: 'name' },
  { label: 'Nombre Z-A', value: '-name' },
  { label: 'Precio ↑', value: 'price' },
  { label: 'Precio ↓', value: '-price' },
  { label: 'Stock ↑', value: 'stock' },
]

export function SortSelect() {
  const ordering = useCatalogStore((s) => s.filters.ordering)
  const setFilters = useCatalogStore((s) => s.setFilters)
  const fetchProducts = useCatalogStore((s) => s.fetchProducts)

  const handleChange = (value: string) => {
    setFilters({ ordering: value as OrderingOption })
    fetchProducts()
  }

  return (
    <div className="flex items-center gap-2">
      <span className="shrink-0 text-sm text-muted-foreground">Ordenar por</span>
      <Select value={ordering} onValueChange={handleChange}>
        <SelectTrigger className="w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {SORT_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
