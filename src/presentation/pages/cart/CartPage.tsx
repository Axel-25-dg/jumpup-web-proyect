import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCartStore } from '@/presentation/store/cart.store'
import { CartItemComponent } from '@/presentation/components/cart/CartItemComponent'
import { CartSummary } from '@/presentation/components/cart/CartSummary'
import { useOrderStore } from '@/presentation/store/order.store'

export default function CartPage() {
  const navigate = useNavigate()
  const { cart, isLoading, fetchCart, updateItem, removeItem } = useCartStore()
  const { createOrder, isLoading: orderLoading } = useOrderStore()

  useEffect(() => {
    fetchCart()
  }, [fetchCart])

  const handleCheckout = async () => {
    try {
      const items = cart?.items.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
      })) || []

      const order = await createOrder(items)
      navigate(`/order-confirmation/${order.id}`)
    } catch (error) {
      console.error('Error al crear orden:', error)
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <h1 className="mb-8 text-3xl font-bold">Carrito de compras</h1>

      {cart?.items.length === 0 ? (
        <div className="rounded-lg border p-8 text-center">
          <p className="mb-4 text-lg text-muted-foreground">Tu carrito está vacío</p>
          <a href="/catalog" className="text-primary hover:underline">
            Continuar comprando
          </a>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            {cart?.items.map((item) => (
              <CartItemComponent
                key={item.product_id}
                item={item}
                onUpdateQuantity={(quantity: number) => updateItem(item.product_id, quantity)}
                onRemove={() => removeItem(item.product_id)}
                isLoading={isLoading}
              />
            ))}
          </div>

          <CartSummary
            cart={cart}
            isLoading={orderLoading}
            onCheckout={handleCheckout}
          />
        </div>
      )}
    </div>
  )
}
