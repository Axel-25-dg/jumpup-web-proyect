import { useParams, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useOrderStore } from '@/presentation/store/order.store'
import { Button } from '@/presentation/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/components/ui/card'
import { formatPrice } from '@/presentation/utils/formatters'
import { CheckCircle, ArrowLeft } from 'lucide-react'

export default function OrderConfirmationPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { currentOrder, fetchOrder, isLoading } = useOrderStore()

  useEffect(() => {
    if (id) {
      fetchOrder(Number(id))
    }
  }, [id, fetchOrder])

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12">
        <div className="space-y-4">
          <div className="h-12 bg-muted rounded animate-pulse"></div>
          <div className="h-64 bg-muted rounded animate-pulse"></div>
        </div>
      </div>
    )
  }

  if (!currentOrder) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 text-center">
        <p className="mb-4 text-muted-foreground">Orden no encontrada</p>
        <Button onClick={() => navigate('/catalog')}>Volver al catálogo</Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <div className="mb-8 text-center">
        <CheckCircle className="mx-auto mb-4 h-16 w-16 text-green-600" />
        <h1 className="mb-2 text-3xl font-bold">¡Orden confirmada!</h1>
        <p className="text-muted-foreground">Orden #{currentOrder.id}</p>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Detalles de la orden</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Estado</p>
              <p className="font-semibold capitalize">
                {currentOrder.status === 'pending' ? 'Pendiente de pago' : 'Pagada'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="font-semibold">{formatPrice(currentOrder.total)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Fecha</p>
              <p className="font-semibold">
                {new Date(currentOrder.created_at).toLocaleDateString('es-ES')}
              </p>
            </div>
          </div>

          <div className="border-t pt-4">
            <p className="mb-3 font-semibold">Artículos</p>
            <div className="space-y-2">
              {currentOrder.items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>
                    {item.name} x {item.quantity}
                  </span>
                  <span>{formatPrice(item.subtotal)}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button variant="outline" onClick={() => navigate(-1)} className="flex-1">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>
        <Button onClick={() => navigate('/orders')} className="flex-1">
          Ver mis órdenes
        </Button>
      </div>
    </div>
  )
}
