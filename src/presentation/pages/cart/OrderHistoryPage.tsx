import { useEffect } from 'react'
import { useOrderStore } from '@/presentation/store/order.store'
import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/components/ui/card'
import { Badge } from '@/presentation/components/ui/badge'
import { Button } from '@/presentation/components/ui/button'
import { formatPrice } from '@/presentation/utils/formatters'
import { useNavigate } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'

export default function OrderHistoryPage() {
  const navigate = useNavigate()
  const { orders, isLoading, fetchOrders, currentPage } = useOrderStore()

  useEffect(() => {
    fetchOrders(currentPage)
  }, [fetchOrders, currentPage])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline">Pendiente</Badge>
      case 'paid':
        return <Badge className="bg-green-100 text-green-800">Pagada</Badge>
      case 'cancelled':
        return <Badge variant="destructive">Cancelada</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  if (isLoading && orders.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12">
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 bg-muted rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 text-center">
        <p className="mb-4 text-muted-foreground">No tienes órdenes aún</p>
        <Button onClick={() => navigate('/catalog')}>Comenzar a comprar</Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="mb-8 text-3xl font-bold">Mis órdenes</h1>

      <div className="space-y-4">
        {orders.map((order) => (
          <Card
            key={order.id}
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => navigate(`/order-confirmation/${order.id}`)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Orden #{order.id}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {new Date(order.created_at).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {order.items.length} artículo{order.items.length !== 1 ? 's' : ''}
                  </p>
                  <div className="mt-2 flex gap-2">
                    {order.items.slice(0, 3).map((item) => (
                      <span
                        key={item.id}
                        className="inline-block max-w-xs truncate rounded bg-muted px-2 py-1 text-xs"
                      >
                        {item.name}
                      </span>
                    ))}
                    {order.items.length > 3 && (
                      <span className="text-xs text-muted-foreground">
                        +{order.items.length - 3} más
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatPrice(order.total)}</p>
                  <div className="mt-2">{getStatusBadge(order.status)}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
