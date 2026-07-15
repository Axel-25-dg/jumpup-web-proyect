import { X, Minus, Plus } from 'lucide-react'
import { Button } from '@/presentation/components/ui/button'
import { formatPrice } from '@/presentation/utils/formatters'
import type { CartItem } from '@/domain/entities/cart.entity'

interface CartItemProps {
  item: CartItem
  onUpdateQuantity: (quantity: number) => void
  onRemove: () => void
  isLoading?: boolean
}

export function CartItemComponent({
  item,
  onUpdateQuantity,
  onRemove,
  isLoading = false,
}: CartItemProps) {
  return (
    <div className="flex gap-4 rounded-lg border p-4">
      {item.image_url && (
        <img
          src={item.image_url}
          alt={item.name}
          className="h-20 w-20 rounded object-cover"
        />
      )}

      <div className="flex-1">
        <h3 className="font-medium">{item.name}</h3>
        <p className="text-sm text-muted-foreground">{formatPrice(item.price)}</p>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => onUpdateQuantity(Math.max(1, item.quantity - 1))}
          disabled={isLoading || item.quantity <= 1}
        >
          <Minus className="h-4 w-4" />
        </Button>

        <span className="w-8 text-center font-medium">{item.quantity}</span>

        <Button
          variant="outline"
          size="icon"
          onClick={() => onUpdateQuantity(item.quantity + 1)}
          disabled={isLoading}
        >
          <Plus className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={onRemove}
          disabled={isLoading}
          className="ml-2"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="text-right">
        <p className="font-semibold">{formatPrice(item.price * item.quantity)}</p>
      </div>
    </div>
  )
}
