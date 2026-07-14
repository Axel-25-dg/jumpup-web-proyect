import { useEffect, useRef, useState } from 'react'
import { Search, X } from 'lucide-react'
import { Input } from '@/presentation/components/ui/input'
import { Button } from '@/presentation/components/ui/button'
import { useCatalogStore } from '@/presentation/store/catalog.store'

const DEBOUNCE_MS = 300

export function SearchBar() {
  const storeSearch = useCatalogStore((s) => s.filters.search)
  const setFilters = useCatalogStore((s) => s.setFilters)
  const fetchProducts = useCatalogStore((s) => s.fetchProducts)

  const [localValue, setLocalValue] = useState(storeSearch)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setLocalValue(storeSearch)
  }, [storeSearch])

  const handleChange = (value: string) => {
    setLocalValue(value)

    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }

    timerRef.current = setTimeout(() => {
      setFilters({ search: value })
      fetchProducts()
    }, DEBOUNCE_MS)
  }

  const handleClear = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }
    setLocalValue('')
    setFilters({ search: '' })
    fetchProducts()
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [])

  return (
    <div className="relative w-full max-w-sm">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="text"
        placeholder="Buscar productos..."
        value={localValue}
        onChange={(e) => handleChange(e.target.value)}
        className="pl-9 pr-9"
        aria-label="Buscar productos"
      />
      {localValue && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2"
          onClick={handleClear}
          aria-label="Limpiar búsqueda"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}
