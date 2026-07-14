import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, ShoppingBag, ShoppingCart } from 'lucide-react'
import { productUseCase } from '@/infrastructure/factories/product.factory'
import type { Product } from '@/domain/entities/product.entity'
import { formatPrice } from '@/presentation/utils/formatters'
import { Badge } from '@/presentation/components/ui/badge'
import { Button } from '@/presentation/components/ui/button'
import { Skeleton } from '@/presentation/components/ui/skeleton'

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [product, setProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return

    setIsLoading(true)
    setError(null)

    productUseCase
      .getProduct(Number(id))
      .then((data) => setProduct(data))
      .catch(() => setError('No se pudo cargar el producto.'))
      .finally(() => setIsLoading(false))
  }, [id])

  return (
    <div className="container mx-auto max-w-4xl px-4 py-6">
      <Button variant="ghost" size="sm" className="mb-6" onClick={() => navigate(-1)}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Volver
      </Button>

      {isLoading && <ProductDetailSkeleton />}

      {error && (
        <div className="flex min-h-64 items-center justify-center">
          <p className="text-destructive">{error}</p>
        </div>
      )}

      {!isLoading && !error && product && (
        <div className="grid gap-8 md:grid-cols-2">
          {/* Imagen */}
          <div className="overflow-hidden rounded-lg">
            {product.image ? (
              <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-72 items-center justify-center rounded-lg bg-muted">
                <ShoppingBag className="h-20 w-20 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Información */}
          <div className="flex flex-col gap-4">
            <div>
              <Badge variant="secondary" className="mb-2">
                {product.category.name}
              </Badge>
              <h1 className="text-2xl font-bold">{product.name}</h1>
            </div>

            <p className="text-3xl font-bold text-primary">{formatPrice(product.price)}</p>

            {product.stock > 0 ? (
              <Badge variant="outline" className="w-fit border-green-500 text-green-600">
                {product.stock} unidades disponibles
              </Badge>
            ) : (
              <Badge variant="destructive" className="w-fit">
                Agotado
              </Badge>
            )}

            <p className="text-sm leading-relaxed text-muted-foreground">{product.description}</p>

            <Button
              size="lg"
              className="mt-auto"
              disabled={product.stock === 0}
              title="Disponible en el módulo 6"
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              Agregar al carrito
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

function ProductDetailSkeleton() {
  return (
    <div className="grid gap-8 md:grid-cols-2">
      <Skeleton className="h-72 w-full rounded-lg" />
      <div className="flex flex-col gap-4">
        <Skeleton className="h-5 w-24 rounded-full" />
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-5 w-28 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <Skeleton className="mt-auto h-11 w-full" />
      </div>
    </div>
  )
}
