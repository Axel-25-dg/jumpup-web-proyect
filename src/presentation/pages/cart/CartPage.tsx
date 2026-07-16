import { useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useCartStore } from '@/presentation/store/cart.store'
import { CartItemComponent } from '@/presentation/components/cart/CartItemComponent'
import { CartSummary } from '@/presentation/components/cart/CartSummary'
import { useOrderStore } from '@/presentation/store/order.store'
import { ShoppingBag, ArrowLeft, ShieldCheck, Truck, RotateCcw } from 'lucide-react'
import { Button } from '@/presentation/components/ui/button'
import { cn } from '@/presentation/utils/cn'

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
           <h1 className="text-4xl font-black tracking-tight text-foreground">
             Tu <span className="text-primary">Carrito</span>
           </h1>
           <p className="text-muted-foreground font-medium mt-2">
             Revisa tus cursos y materiales antes de finalizar la compra.
           </p>
        </div>
        <Button variant="ghost" asChild className="rounded-xl font-bold text-muted-foreground hover:text-primary transition-colors">
           <Link to="/catalog" className="flex items-center gap-2">
             <ArrowLeft size={18} /> Seguir explorando
           </Link>
        </Button>
      </div>

      {!cart || cart.items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-card/50 backdrop-blur-sm border-2 border-dashed border-border rounded-[2.5rem] text-center animate-in zoom-in-95 duration-500">
          <div className="relative mb-8">
             <div className="absolute -inset-4 bg-primary/20 blur-2xl rounded-full animate-pulse" />
             <ShoppingBag className="h-20 w-20 text-primary relative" />
          </div>
          <h2 className="text-2xl font-black text-foreground tracking-tight">Tu carrito está vacío</h2>
          <p className="text-muted-foreground font-medium mt-2 max-w-xs mx-auto">
            Parece que aún no has añadido ningún curso a tu lista de aprendizaje.
          </p>
          <Button asChild className="mt-8 rounded-2xl px-10 font-black shadow-lg shadow-primary/20">
            <Link to="/catalog">Ver Catálogo de Cursos</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Items List */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-card/30 rounded-[2rem] border border-border/50 overflow-hidden">
               <div className="px-8 py-4 border-b border-border/50 bg-muted/20 flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Producto</span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hidden md:block">Cantidad y Precio</span>
               </div>
               <div className="divide-y divide-border/50">
                {cart.items.map((item) => (
                  <CartItemComponent
                    key={item.product_id}
                    item={item}
                    onUpdateQuantity={(quantity: number) => updateItem(item.product_id, quantity)}
                    onRemove={() => removeItem(item.product_id)}
                    isLoading={isLoading}
                  />
                ))}
               </div>
            </div>

            {/* Guarantees */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
               {[
                 { icon: ShieldCheck, title: 'Pago Seguro', desc: 'Encriptación SSL de 256 bits', color: 'text-emerald-500' },
                 { icon: Truck, title: 'Acceso Instantáneo', desc: 'Material disponible tras el pago', color: 'text-blue-500' },
                 { icon: RotateCcw, title: 'Garantía 30 Días', desc: 'Devolución total si no te gusta', color: 'text-amber-500' }
               ].map((item, i) => (
                 <div key={i} className="flex items-center gap-4 p-5 bg-card/50 rounded-2xl border border-border/40 shadow-sm">
                    <div className={cn("p-2 rounded-xl bg-white shadow-sm", item.color)}>
                       <item.icon size={20} />
                    </div>
                    <div>
                       <p className="text-xs font-black text-foreground uppercase tracking-wider">{item.title}</p>
                       <p className="text-[10px] font-medium text-muted-foreground">{item.desc}</p>
                    </div>
                 </div>
               ))}
            </div>
          </div>

          {/* Sidebar Summary */}
          <div className="lg:col-span-4 sticky top-10">
            <CartSummary
              cart={cart}
              isLoading={orderLoading}
              onCheckout={handleCheckout}
            />
          </div>
        </div>
      )}
    </div>
  )
}
