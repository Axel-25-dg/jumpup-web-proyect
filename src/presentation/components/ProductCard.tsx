import { ShoppingBag, Star, Zap, Clock } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Badge } from '@/presentation/components/ui/badge'
import { Button } from '@/presentation/components/ui/button'
import { formatPrice } from '@/presentation/utils/formatters'
import type { Product } from '@/domain/entities/product.entity'
import { cn } from '@/presentation/utils/cn'

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const { id, name, category, price, stock, image } = product

  return (
    <div className="group relative bg-card/40 backdrop-blur-sm border border-border/50 rounded-[2rem] overflow-hidden flex flex-col h-full transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2">
      {/* Image Container */}
      <div className="relative h-56 w-full overflow-hidden">
        {image ? (
          <img
            src={image}
            alt={name}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted/30">
            <ShoppingBag className="h-16 w-16 text-muted-foreground/20" />
          </div>
        )}

        {/* Overlay Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
           <Badge className="bg-white/90 backdrop-blur-md text-primary font-black border-none shadow-sm px-3 py-1 rounded-xl">
             {category.name}
           </Badge>
           {stock < 10 && stock > 0 && (
              <Badge className="bg-amber-500 text-white font-black border-none shadow-sm px-3 py-1 rounded-xl animate-pulse">
                ¡Últimos cupos!
              </Badge>
           )}
        </div>

        {/* Action Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
           <Button asChild className="w-full h-12 rounded-xl font-black shadow-lg shadow-primary/20 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
             <Link to={`/products/${id}`}>Ver Programa Completo</Link>
           </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col p-6">
        <div className="flex items-center gap-1 mb-3">
           {[1, 2, 3, 4, 5].map((s) => (
             <Star key={s} size={12} className="fill-amber-400 text-amber-400" />
           ))}
           <span className="text-[10px] font-black text-muted-foreground ml-1">(4.9)</span>
        </div>

        <h3 className="text-xl font-black text-foreground leading-tight tracking-tight mb-3 line-clamp-2 group-hover:text-primary transition-colors">
          {name}
        </h3>

        <div className="flex items-center gap-4 mb-6">
           <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              <Clock size={14} className="text-primary" /> 12 Semanas
           </div>
           <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              <Zap size={14} className="text-amber-500" /> Nivel Avanzado
           </div>
        </div>

        <div className="mt-auto flex items-center justify-between">
          <div className="flex flex-col">
             <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest line-through decoration-rose-500/50">
               {formatPrice(price * 1.2)}
             </span>
             <span className="text-2xl font-black text-foreground">
               {formatPrice(price)}
             </span>
          </div>

          <div className={cn(
            "h-10 w-10 rounded-xl flex items-center justify-center border transition-colors",
            stock > 0 ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600" : "bg-destructive/10 border-destructive/20 text-destructive"
          )}>
            <ShoppingBag size={20} />
          </div>
        </div>
      </div>
    </div>
  )
}
