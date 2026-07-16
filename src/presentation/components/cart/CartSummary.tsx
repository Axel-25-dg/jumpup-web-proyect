import { Button } from '@/presentation/components/ui/button'
import { formatPrice } from '@/presentation/utils/formatters'
import type { Cart } from '@/domain/entities/cart.entity'
import { Sparkles, ArrowRight, ShieldCheck } from 'lucide-react'

interface CartSummaryProps {
  cart: Cart | null
  isLoading?: boolean
  onCheckout?: () => void
}

export function CartSummary({ cart, isLoading = false, onCheckout }: CartSummaryProps) {
  if (!cart || cart.items.length === 0) return null

  return (
    <div className="bg-card/50 backdrop-blur-md border border-border/50 rounded-[2.5rem] p-8 shadow-2xl shadow-primary/5 sticky top-10 animate-in fade-in slide-in-from-right-4 duration-700">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 bg-primary/10 rounded-xl">
           <Sparkles className="text-primary" size={20} />
        </div>
        <h2 className="text-xl font-black text-foreground tracking-tight">Resumen</h2>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center group">
          <span className="text-sm font-bold text-muted-foreground">Subtotal</span>
          <span className="font-black text-foreground">{formatPrice(cart.total_price)}</span>
        </div>

        <div className="flex justify-between items-center group">
          <div className="flex flex-col">
             <span className="text-sm font-bold text-muted-foreground">Descuentos</span>
             <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Cupón Aplicado</span>
          </div>
          <span className="font-black text-emerald-500">-$0.00</span>
        </div>

        <div className="pt-6 border-t border-border/50">
          <div className="flex justify-between items-end">
            <span className="text-lg font-black text-foreground uppercase tracking-tight">Total</span>
            <div className="text-right">
               <span className="text-3xl font-black text-primary block leading-none">
                 {formatPrice(cart.total_price)}
               </span>
               <span className="text-[10px] font-bold text-muted-foreground">IVA Incluido</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10 space-y-4">
        <Button
          onClick={onCheckout}
          disabled={isLoading || cart.items.length === 0}
          className="w-full h-16 rounded-2xl font-black text-lg shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all group"
        >
          {isLoading ? (
            <div className="flex items-center gap-3">
               <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
               Procesando...
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              Finalizar Pago <ArrowRight className="group-hover:translate-x-1 transition-transform" />
            </div>
          )}
        </Button>

        <div className="flex items-center justify-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest py-2">
           <ShieldCheck size={14} className="text-emerald-500" /> Transacción Segura
        </div>
      </div>

      {/* Trust Badge */}
      <div className="mt-8 p-4 bg-muted/30 rounded-2xl border border-border/50">
         <p className="text-[10px] font-medium text-muted-foreground leading-relaxed text-center">
            Al completar tu compra, aceptas nuestros <span className="text-foreground font-bold underline">Términos de Servicio</span> y la Política de Reembolso de 30 días.
         </p>
      </div>
    </div>
  )
}
