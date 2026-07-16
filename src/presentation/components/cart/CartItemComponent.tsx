import { Trash2, Minus, Plus, Bookmark } from 'lucide-react'
import { Button } from '@/presentation/components/ui/button'
import { formatPrice } from '@/presentation/utils/formatters'
import type { CartItem } from '@/domain/entities/cart.entity'
import { cn } from '@/presentation/utils/cn'

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
    <div className={cn("flex flex-col sm:flex-row gap-6 p-8 group transition-all duration-300 hover:bg-primary/[0.02]")}>
      {/* Product Image */}
      <div className="relative shrink-0">
        <div className="absolute inset-0 bg-primary/10 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.name}
            className="h-32 w-32 md:h-24 md:w-24 rounded-3xl object-cover relative z-10 shadow-lg border-2 border-white"
          />
        ) : (
          <div className="h-32 w-32 md:h-24 md:w-24 rounded-3xl bg-muted flex items-center justify-center relative z-10 border-2 border-white text-muted-foreground font-black text-xl">
             {item.name.slice(0, 1)}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <div className="flex items-start justify-between gap-4">
           <div>
              <h3 className="text-lg font-black text-foreground tracking-tight group-hover:text-primary transition-colors">{item.name}</h3>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Curso Digital • Acceso Vitalicio</p>
           </div>
           <div className="text-right">
              <p className="text-xl font-black text-foreground">{formatPrice(item.price)}</p>
           </div>
        </div>

        {/* Actions Row */}
        <div className="flex items-center justify-between mt-6">
           <div className="flex items-center gap-1.5 p-1 bg-muted/50 rounded-2xl border border-border/50">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-xl hover:bg-white hover:shadow-sm"
                onClick={() => onUpdateQuantity(Math.max(1, item.quantity - 1))}
                disabled={isLoading || item.quantity <= 1}
              >
                <Minus className="h-3.5 w-3.5" />
              </Button>

              <span className="w-8 text-center text-sm font-black text-foreground">{item.quantity}</span>

              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-xl hover:bg-white hover:shadow-sm"
                onClick={() => onUpdateQuantity(item.quantity + 1)}
                disabled={isLoading}
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
           </div>

           <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-9 px-3 rounded-xl text-xs font-bold text-muted-foreground hover:text-indigo-600 hover:bg-indigo-50 transition-colors gap-2"
              >
                 <Bookmark size={14} /> <span className="hidden sm:inline">Guardar</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-9 px-3 rounded-xl text-xs font-bold text-rose-500 hover:bg-rose-50 transition-colors gap-2"
                onClick={onRemove}
                disabled={isLoading}
              >
                <Trash2 size={14} /> <span className="hidden sm:inline">Eliminar</span>
              </Button>
           </div>
        </div>
      </div>
    </div>
  )
}
