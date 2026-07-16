import { useParams, useNavigate, Link } from 'react-router-dom'
import { useEffect } from 'react'
import { useOrderStore } from '@/presentation/store/order.store'
import { Button } from '@/presentation/components/ui/button'
import { formatPrice } from '@/presentation/utils/formatters'
import { CheckCircle, ArrowRight, Package, Calendar, CreditCard, Sparkles } from 'lucide-react'
import { cn } from '@/presentation/utils/cn'

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
      <div className="max-w-3xl mx-auto px-4 py-20">
        <div className="animate-pulse space-y-8">
           <div className="h-20 w-20 bg-muted rounded-full mx-auto" />
           <div className="h-10 w-64 bg-muted rounded-2xl mx-auto" />
           <div className="h-64 bg-muted rounded-[2.5rem]" />
        </div>
      </div>
    )
  }

  if (!currentOrder) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="bg-destructive/10 p-6 rounded-[2rem] inline-block mb-6">
           <Package className="h-12 w-12 text-destructive" />
        </div>
        <h2 className="text-2xl font-black text-foreground mb-4">¡Ups! Orden no encontrada</h2>
        <p className="text-muted-foreground mb-8">No pudimos localizar los detalles de tu pedido.</p>
        <Button onClick={() => navigate('/catalog')} className="rounded-2xl font-black px-8">
          Explorar Catálogo
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Success Header */}
      <div className="text-center mb-12">
        <div className="relative inline-block mb-6">
           <div className="absolute -inset-4 bg-emerald-500/20 blur-2xl rounded-full animate-pulse" />
           <div className="relative bg-emerald-500 p-4 rounded-full shadow-lg shadow-emerald-500/20">
              <CheckCircle className="h-12 w-12 text-white" />
           </div>
           <div className="absolute -top-2 -right-2">
              <Sparkles className="h-6 w-6 text-amber-400 animate-bounce" />
           </div>
        </div>
        <h1 className="text-4xl font-black tracking-tight text-foreground mb-2">
          ¡Gracias por tu <span className="text-primary">confianza</span>!
        </h1>
        <p className="text-muted-foreground font-medium text-lg">
          Tu orden <span className="text-foreground font-bold">#{currentOrder.id}</span> ha sido procesada con éxito.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-[2.5rem] overflow-hidden shadow-sm">
            <div className="px-8 py-6 border-b border-border/50 bg-muted/20">
               <h3 className="font-black uppercase tracking-widest text-xs text-muted-foreground">Resumen de Artículos</h3>
            </div>
            <div className="p-8 space-y-6">
               {currentOrder.items.map((item) => (
                 <div key={item.id} className="flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                       <div className="h-14 w-14 bg-muted rounded-2xl flex items-center justify-center border border-border/50 group-hover:border-primary/30 transition-colors">
                          <Package className="text-muted-foreground group-hover:text-primary transition-colors" size={24} />
                       </div>
                       <div>
                          <h4 className="font-bold text-foreground leading-tight">{item.name}</h4>
                          <p className="text-sm text-muted-foreground">Cantidad: {item.quantity}</p>
                       </div>
                    </div>
                    <span className="font-black text-foreground">{formatPrice(item.subtotal)}</span>
                 </div>
               ))}

               <div className="pt-6 border-t border-border/50 space-y-2">
                  <div className="flex justify-between text-sm">
                     <span className="text-muted-foreground font-medium">Subtotal</span>
                     <span className="font-bold text-foreground">{formatPrice(currentOrder.total)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-4">
                     <span className="text-lg font-black text-foreground">Total Pagado</span>
                     <span className="text-2xl font-black text-primary">{formatPrice(currentOrder.total)}</span>
                  </div>
               </div>
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
           <div className="bg-card/30 border border-border/50 rounded-[2rem] p-6 space-y-6">
              <h3 className="font-black uppercase tracking-widest text-[10px] text-muted-foreground">Detalles del Pedido</h3>

              <div className="space-y-4">
                 <div className="flex items-start gap-4">
                    <div className="p-2 bg-primary/10 rounded-xl">
                       <Calendar className="text-primary" size={18} />
                    </div>
                    <div>
                       <p className="text-[10px] font-black uppercase text-muted-foreground">Fecha</p>
                       <p className="text-sm font-bold text-foreground">
                          {new Date(currentOrder.created_at).toLocaleDateString('es-ES', {
                            day: 'numeric', month: 'long', year: 'numeric'
                          })}
                       </p>
                    </div>
                 </div>

                 <div className="flex items-start gap-4">
                    <div className="p-2 bg-emerald-500/10 rounded-xl">
                       <CreditCard className="text-emerald-500" size={18} />
                    </div>
                    <div>
                       <p className="text-[10px] font-black uppercase text-muted-foreground">Estado de Pago</p>
                       <span className={cn(
                          "inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider mt-1",
                          currentOrder.status === 'paid' ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"
                       )}>
                          {currentOrder.status === 'paid' ? 'Completado' : 'Pendiente'}
                       </span>
                    </div>
                 </div>
              </div>
           </div>

           <div className="space-y-3">
              <Button asChild className="w-full h-14 rounded-2xl font-black text-lg shadow-lg shadow-primary/20">
                 <Link to="/learning" className="flex items-center justify-center gap-2">
                    Empezar a aprender <ArrowRight size={20} />
                 </Link>
              </Button>
              <Button variant="ghost" asChild className="w-full h-12 rounded-2xl font-bold text-muted-foreground">
                 <Link to="/orders">Ver historial de órdenes</Link>
              </Button>
           </div>
        </div>
      </div>
    </div>
  )
}
