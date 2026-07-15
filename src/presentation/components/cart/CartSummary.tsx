import { Button } from '@/presentation/components/ui/button'
import { formatPrice } from '@/presentation/utils/formatters'
import type { Cart } from '@/domain/entities/cart.entity'
import { Link } from 'react-router-dom'

interface CartSummaryProps {
  cart: Cart | null
  isLoading?: boolean
  onCheckout?: () => void
}

export function CartSummary({ cart, isLoading = false, onCheckout }: CartSummaryProps) {
  if (!cart || cart.items.length === 0) {
    return (
      <div className="rounded-lg border p-6 text-center">
        <p className="mb-4 text-muted-foreground">Tu carrito está vacío</p>
        <Button asChild>
          <Link to="/catalog">Continuar comprando</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4 rounded-lg border p-6">
      <h2 className="text-lg font-semibold">Resumen de compra</h2>

      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <span>{formatPrice(cart.total_price)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Envío</span>
          <span>Gratis</span>
        </div>
        <div className="border-t pt-2">
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span>{formatPrice(cart.total_price)}</span>
          </div>
        </div>
      </div>

      <Button
        onClick={onCheckout}
        disabled={isLoading || cart.items.length === 0}
        className="w-full"
      >
        {isLoading ? 'Procesando...' : 'Proceder a pagar'}
      </Button>
    </div>
  )
}
