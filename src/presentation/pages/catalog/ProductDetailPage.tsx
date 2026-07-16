import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { ArrowLeft, ShoppingBag, ShoppingCart, Star, Clock, Globe, ShieldCheck, PlayCircle, Plus, Minus, CheckCircle2, Sparkles } from 'lucide-react'
import { productUseCase } from '@/infrastructure/factories/product.factory'
import type { Product } from '@/domain/entities/product.entity'
import { formatPrice } from '@/presentation/utils/formatters'
import { Badge } from '@/presentation/components/ui/badge'
import { Button } from '@/presentation/components/ui/button'
import { Skeleton } from '@/presentation/components/ui/skeleton'
import { useCartStore } from '@/presentation/store/cart.store'
export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { addItem: addToCart, isLoading: cartIsLoading } = useCartStore()

  const [product, setProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    if (!id) return

    setIsLoading(true)
    setError(null)

    productUseCase
      .getProduct(Number(id))
      .then((data) => setProduct(data))
      .catch(() => setError('No se pudo cargar el producto.'))
      .finally(() => setIsLoading(false))
  }, [id])

  const handleAddToCart = async () => {
    if (!product) return
    try {
      await addToCart(product.id, quantity)
      navigate('/cart')
    } catch (err) {
      console.error('Error al agregar al carrito:', err)
    }
  }

  if (isLoading) return <ProductDetailSkeleton />

  if (error || !product) {
     return (
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
           <div className="p-6 bg-destructive/10 rounded-full inline-block mb-6">
              <ShoppingBag className="h-12 w-12 text-destructive" />
           </div>
           <h2 className="text-3xl font-black text-foreground mb-4">¡Ups! Error de Carga</h2>
           <p className="text-muted-foreground mb-8">{error || 'El programa que buscas no está disponible.'}</p>
           <Button onClick={() => navigate('/catalog')} className="rounded-2xl px-8 font-black">
              Volver al Catálogo
           </Button>
        </div>
     )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-in fade-in duration-700">
      {/* Navigation */}
      <div className="mb-10 flex items-center justify-between">
         <Button variant="ghost" className="rounded-xl font-bold text-muted-foreground hover:text-primary" onClick={() => navigate(-1)}>
           <ArrowLeft className="mr-2 h-4 w-4" /> Volver atrás
         </Button>
         <div className="hidden md:flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground">
            <Link to="/catalog" className="hover:text-primary transition-colors">Catálogo</Link>
            <span>/</span>
            <span className="text-foreground">{product.category.name}</span>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Column: Media & Highlights */}
        <div className="lg:col-span-7 space-y-10">
           <div className="relative group">
              <div className="absolute -inset-4 bg-primary/10 blur-3xl rounded-[3rem] opacity-50 -z-10" />
              <div className="relative aspect-video rounded-[2.5rem] overflow-hidden border border-border/50 shadow-2xl">
                 {product.image ? (
                   <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                 ) : (
                   <div className="w-full h-full bg-muted flex items-center justify-center">
                      <ShoppingBag size={80} className="text-muted-foreground/20" />
                   </div>
                 )}
                 <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                    <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/40 cursor-pointer hover:scale-110 transition-transform">
                       <PlayCircle size={48} className="text-white fill-white" />
                    </div>
                 </div>
              </div>
           </div>

           <div className="space-y-6">
              <h2 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-3">
                 <div className="h-8 w-1.5 bg-primary rounded-full" />
                 Sobre este Programa
              </h2>
              <p className="text-lg leading-relaxed text-muted-foreground font-medium">
                 {product.description}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {[
                    'Acceso de por vida al contenido',
                    'Certificado oficial de finalización',
                    'Mentoría 1-a-1 semanal',
                    'Proyectos reales del mundo laboral'
                 ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 p-4 bg-card/40 border border-border/50 rounded-2xl">
                       <CheckCircle2 size={20} className="text-emerald-500 shrink-0" />
                       <span className="font-bold text-foreground text-sm">{item}</span>
                    </div>
                 ))}
              </div>
           </div>
        </div>

        {/* Right Column: Checkout Card */}
        <div className="lg:col-span-5">
           <div className="sticky top-24 space-y-6">
              <div className="bg-card/60 backdrop-blur-xl border border-border/50 rounded-[2.5rem] p-10 shadow-2xl shadow-primary/5">
                 <Badge className="bg-primary/10 text-primary border-none font-black px-4 py-1.5 rounded-full mb-6">
                    {product.category.name}
                 </Badge>

                 <h1 className="text-4xl font-black text-foreground tracking-tighter leading-[1.1] mb-4">
                    {product.name}
                 </h1>

                 <div className="flex items-center gap-4 mb-8">
                    <div className="flex items-center gap-1">
                       {[1,2,3,4,5].map(s => <Star key={s} size={14} className="fill-amber-400 text-amber-400" />)}
                    </div>
                    <span className="text-sm font-black text-muted-foreground uppercase tracking-widest">(4.9/5) • 12.4k Estudiantes</span>
                 </div>

                 <div className="space-y-6 mb-10">
                    <div className="flex items-end gap-3">
                       <span className="text-5xl font-black text-primary tracking-tighter">
                          {formatPrice(product.price)}
                       </span>
                       <span className="text-lg font-bold text-muted-foreground line-through mb-1.5">
                          {formatPrice(product.price * 1.5)}
                       </span>
                    </div>

                    <div className="flex items-center gap-6 text-[11px] font-black uppercase tracking-[0.15em] text-muted-foreground">
                       <div className="flex items-center gap-2">
                          <Clock size={16} className="text-primary" /> 48 Horas
                       </div>
                       <div className="flex items-center gap-2">
                          <Globe size={16} className="text-primary" /> Español
                       </div>
                       <div className="flex items-center gap-2">
                          <ShieldCheck size={16} className="text-primary" /> Garantía
                       </div>
                    </div>
                 </div>

                 <div className="space-y-4">
                    <div className="flex items-center gap-4">
                       <div className="flex-1 flex items-center justify-between h-14 px-6 bg-muted/50 border border-border/50 rounded-2xl">
                          <button
                             onClick={() => setQuantity(Math.max(1, quantity - 1))}
                             className="p-2 hover:bg-white rounded-xl transition-colors disabled:opacity-30"
                             disabled={quantity <= 1}
                          >
                             <Minus size={20} />
                          </button>
                          <span className="text-lg font-black text-foreground">{quantity}</span>
                          <button
                             onClick={() => setQuantity(quantity + 1)}
                             className="p-2 hover:bg-white rounded-xl transition-colors"
                          >
                             <Plus size={20} />
                          </button>
                       </div>
                       <div className="px-6 py-4 bg-emerald-500/10 text-emerald-600 rounded-2xl border border-emerald-500/20">
                          <span className="text-xs font-black uppercase tracking-widest block">Disponibles</span>
                          <span className="text-lg font-black">{product.stock}</span>
                       </div>
                    </div>

                    <Button
                       className="w-full h-16 rounded-2xl font-black text-xl shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all flex items-center justify-center gap-3"
                       disabled={product.stock === 0 || cartIsLoading}
                       onClick={handleAddToCart}
                    >
                       {cartIsLoading ? (
                          <>
                             <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                             Agregando...
                          </>
                       ) : (
                          <>
                             <ShoppingCart size={24} /> Agregar al Carrito
                          </>
                       )}
                    </Button>
                 </div>
              </div>

              <div className="p-6 bg-indigo-600 rounded-[2rem] text-white flex items-center gap-6 group cursor-pointer hover:bg-indigo-700 transition-colors">
                 <div className="h-12 w-12 bg-white/20 rounded-2xl flex items-center justify-center">
                    <Sparkles size={24} />
                 </div>
                 <div>
                    <h4 className="font-black text-sm uppercase tracking-widest">¿Tienes una Beca?</h4>
                    <p className="text-xs text-white/80 font-medium">Aplica tu cupón de descuento ahora.</p>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  )
}

function ProductDetailSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-20">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-7 space-y-10">
           <Skeleton className="aspect-video w-full rounded-[2.5rem]" />
           <div className="space-y-4">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
           </div>
        </div>
        <div className="lg:col-span-5">
           <Skeleton className="h-[500px] w-full rounded-[2.5rem]" />
        </div>
      </div>
    </div>
  )
}
