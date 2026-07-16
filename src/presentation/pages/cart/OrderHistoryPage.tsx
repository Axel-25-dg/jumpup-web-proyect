import { useEffect } from 'react'
import { useOrderStore } from '@/presentation/store/order.store'
import { Button } from '@/presentation/components/ui/button'
import { formatPrice } from '@/presentation/utils/formatters'
import { useNavigate, Link } from 'react-router-dom'
import { ChevronRight, Package, Calendar, Clock, ArrowLeft, ShoppingBag } from 'lucide-react'
import { cn } from '@/presentation/utils/cn'

export default function OrderHistoryPage() {
  const navigate = useNavigate()
  const { orders, isLoading, fetchOrders, currentPage } = useOrderStore()

  useEffect(() => {
    fetchOrders(currentPage)
  }, [fetchOrders, currentPage])

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return { label: 'Pendiente', classes: 'bg-amber-500/10 text-amber-600 border-amber-500/20' }
      case 'paid':
        return { label: 'Pagada', classes: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' }
      case 'cancelled':
        return { label: 'Cancelada', classes: 'bg-destructive/10 text-destructive-600 border-destructive/20' }
      default:
        return { label: status, classes: 'bg-muted text-muted-foreground border-border/50' }
    }
  }

  if (isLoading && orders.length === 0) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 space-y-6">
        <div className="h-10 w-48 bg-muted rounded-xl animate-pulse" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-card rounded-[2rem] border border-border/50 animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
           <h1 className="text-4xl font-black tracking-tight text-foreground">
             Mis <span className="text-primary">Órdenes</span>
           </h1>
           <p className="text-muted-foreground font-medium mt-2">
             Historial de tus adquisiciones y aprendizaje.
           </p>
        </div>
        <Button variant="ghost" asChild className="rounded-xl font-bold text-muted-foreground hover:text-primary transition-colors">
           <Link to="/profile" className="flex items-center gap-2">
             <ArrowLeft size={18} /> Volver a perfil
           </Link>
        </Button>
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-card/30 backdrop-blur-sm border-2 border-dashed border-border rounded-[2.5rem] text-center">
          <div className="bg-primary/10 p-6 rounded-full mb-6">
             <ShoppingBag className="h-12 w-12 text-primary" />
          </div>
          <h2 className="text-2xl font-black text-foreground tracking-tight">No tienes órdenes aún</h2>
          <p className="text-muted-foreground font-medium mt-2 max-w-xs mx-auto">
            Tus compras aparecerán aquí una vez que realices tu primer pedido.
          </p>
          <Button asChild className="mt-8 rounded-2xl px-10 font-black">
            <Link to="/catalog">Explorar Catálogo</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-6">
          {orders.map((order) => {
            const status = getStatusInfo(order.status)
            return (
              <div
                key={order.id}
                onClick={() => navigate(`/order-confirmation/${order.id}`)}
                className="group relative bg-card/40 hover:bg-card/60 backdrop-blur-sm border border-border/50 rounded-[2rem] p-6 transition-all duration-300 cursor-pointer hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1"
              >
                <div className="flex flex-col lg:flex-row gap-8">
                  {/* Order Meta */}
                  <div className="lg:w-1/4 space-y-4">
                    <div className="flex items-center gap-3">
                       <div className="p-2.5 bg-muted rounded-xl group-hover:bg-primary/10 transition-colors">
                          <Package className="text-muted-foreground group-hover:text-primary transition-colors" size={20} />
                       </div>
                       <div>
                          <p className="text-[10px] font-black uppercase text-muted-foreground">ID Orden</p>
                          <p className="font-bold text-foreground">#{order.id}</p>
                       </div>
                    </div>

                    <div className="flex items-center gap-3">
                       <div className="p-2.5 bg-muted rounded-xl">
                          <Calendar className="text-muted-foreground" size={20} />
                       </div>
                       <div>
                          <p className="text-[10px] font-black uppercase text-muted-foreground">Fecha</p>
                          <p className="text-sm font-bold text-foreground">
                            {new Date(order.created_at).toLocaleDateString('es-ES', {
                              day: 'numeric', month: 'short', year: 'numeric'
                            })}
                          </p>
                       </div>
                    </div>
                  </div>

                  {/* Order Items & Summary */}
                  <div className="lg:flex-1 space-y-4">
                     <div className="flex flex-wrap gap-2">
                        {order.items.map((item) => (
                           <div key={item.id} className="inline-flex items-center px-3 py-1 bg-muted/50 rounded-lg border border-border/30 text-[11px] font-bold text-muted-foreground">
                              {item.name} <span className="ml-2 text-[10px] opacity-60">x{item.quantity}</span>
                           </div>
                        ))}
                     </div>
                     <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                           <Clock size={14} /> Pedido procesado
                        </span>
                     </div>
                  </div>

                  {/* Status & Total */}
                  <div className="lg:w-1/5 flex flex-row lg:flex-col justify-between items-center lg:items-end lg:justify-center gap-4">
                     <div className="text-right">
                        <p className="text-[10px] font-black uppercase text-muted-foreground mb-1">Total</p>
                        <p className="text-xl font-black text-primary">{formatPrice(order.total)}</p>
                     </div>
                     <div className={cn(
                        "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border",
                        status.classes
                     )}>
                        {status.label}
                     </div>
                  </div>

                  <div className="absolute top-1/2 -right-2 -translate-y-1/2 opacity-0 group-hover:opacity-100 group-hover:right-4 transition-all duration-300">
                     <ChevronRight className="text-primary" size={24} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
