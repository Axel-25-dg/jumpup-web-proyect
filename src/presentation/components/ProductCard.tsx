import { ShoppingBag } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Badge } from '@/presentation/components/ui/badge'
import { Button } from '@/presentation/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/presentation/components/ui/card'
import { formatPrice } from '@/presentation/utils/formatters'
import type { Product } from '@/domain/entities/product.entity'

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const { id, name, category, price, stock, image } = product

  return (
    <Card className="flex flex-col overflow-hidden transition-shadow hover:shadow-md">
      <CardHeader className="p-0">
        {image ? (
          <img src={image} alt={name} className="h-48 w-full object-cover" />
        ) : (
          <div className="flex h-48 w-full items-center justify-center bg-muted">
            <ShoppingBag className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 text-sm font-semibold leading-tight">{name}</h3>
          <Badge variant="secondary" className="shrink-0 text-xs">
            {category.name}
          </Badge>
        </div>

        <p className="text-lg font-bold text-primary">{formatPrice(price)}</p>

        {stock > 0 ? (
          <Badge variant="outline" className="w-fit border-green-500 text-green-600">
            {stock} en stock
          </Badge>
        ) : (
          <Badge variant="destructive" className="w-fit">
            Agotado
          </Badge>
        )}
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button asChild className="w-full" size="sm">
          <Link to={`/products/${id}`}>Ver detalle</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
