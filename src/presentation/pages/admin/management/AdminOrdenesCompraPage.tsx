import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Receipt,
  CreditCard,
  Clock,
  CheckCircle,
  XCircle,
  ArrowRight,
  Search,
  ArrowLeft,
  ShoppingBag,
} from 'lucide-react'
import { Button } from '@/presentation/components/ui/button'
import { Input } from '@/presentation/components/ui/input'
import { Skeleton } from '@/presentation/components/ui/skeleton'
import { toast } from 'sonner'
import { ordenCompraUseCase } from '@/infrastructure/factories/orden-compra.factory'
import type { OrdenCompra } from '@/domain/entities/orden-compra.entity'

const ESTADO_STYLES: Record<string, string> = {
  pagada: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400',
  pendiente: 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400',
  cancelada: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400',
}

const ESTADO_LABELS: Record<string, string> = {
  pagada: 'Pagada',
  pendiente: 'Pendiente',
  cancelada: 'Cancelada',
}

const ESTADO_ICONS: Record<string, any> = {
  pagada: CheckCircle,
  pendiente: Clock,
  cancelada: XCircle,
}

export default function AdminOrdenesCompraPage() {
  const navigate = useNavigate()
  const [ordenes, setOrdenes] = useState<OrdenCompra[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  const loadOrdenes = async () => {
    setIsLoading(true)
    try {
      const result = await ordenCompraUseCase.getAll()
      setOrdenes(result.results || [])
    } catch (err) {
      console.error('Error loading orders:', err)
      toast.error('No se pudieron cargar las órdenes')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { loadOrdenes() }, [])

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const filteredOrdenes = ordenes.filter(o =>
    o.estudiante_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(o.id).includes(searchTerm)
  )

  return (
    <div className="animate-in fade-in duration-500">
      {/* HERO */}
      <section className="border-b border-slate-900/10 dark:border-white/10 px-8 md:px-12 py-12 md:py-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" asChild className="-ml-2">
                <Link to="/admin"><ArrowLeft className="h-4 w-4" /></Link>
              </Button>
              <div className="chip">
                <ShoppingBag className="h-3.5 w-3.5 text-sky-500" />
                E-Commerce
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
              Órdenes de <span className="text-sky-500">Compra</span>.
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Revisa las transacciones y el historial de compras de los estudiantes.
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm font-bold text-slate-500 dark:text-slate-400 border border-slate-900/10 dark:border-white/10 px-4 py-2">
            <Receipt className="h-4 w-4" />
            {ordenes.length} órdenes
          </div>
        </div>
      </section>

      {/* TOOLBAR */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center px-8 md:px-10 py-5 border-b border-slate-900/10 dark:border-white/10">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Buscar por email o ID de orden..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* ORDERS LIST */}
      <div className="divide-y divide-slate-900/5 dark:divide-white/5 bg-transparent">
        {isLoading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex gap-4 items-center">
                <Skeleton className="h-12 w-12 shrink-0" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredOrdenes.length > 0 ? (
          filteredOrdenes.map((orden) => {
            const EstadoIcon = ESTADO_ICONS[orden.estado] || CreditCard
            return (
              <div key={orden.id} className="p-6 flex flex-col md:flex-row items-center gap-6 card-hover group cursor-pointer" onClick={() => navigate(`/admin/ordenes-compra/${orden.id}`)}>
                <div className="h-12 w-12 shrink-0 flex items-center justify-center border border-slate-900/10 dark:border-white/10 text-sky-500 bg-sky-50 dark:bg-sky-900/20">
                  <Receipt className="h-6 w-6" />
                </div>
                <div className="flex-1 min-w-0 text-center md:text-left">
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-1">
                    <span className="font-mono font-bold text-sm text-slate-900 dark:text-white">Orden #{orden.id}</span>
                    <span className={`label-caps px-2 py-0.5 inline-flex items-center gap-1 ${ESTADO_STYLES[orden.estado] || 'bg-slate-100 text-slate-500'}`}>
                      <EstadoIcon className="h-3 w-3" />
                      {ESTADO_LABELS[orden.estado] || orden.estado}
                    </span>
                    <span className="label-caps px-2 py-0.5 border border-slate-900/10 dark:border-white/10 text-slate-500 font-mono">
                      ${orden.total}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">{orden.estudiante_email}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {formatDate(orden.fecha_creacion)}
                    {orden.detalles && orden.detalles.length > 0 && (
                      <> · {orden.detalles.length} producto(s)</>
                    )}
                  </p>
                </div>
                <div className="shrink-0">
                  <Button variant="ghost" size="icon" className="h-9 w-9">
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )
          })
        ) : (
          <div className="py-20 text-center">
            <div className="flex h-16 w-16 items-center justify-center border border-slate-900/10 dark:border-white/10 mx-auto mb-6">
              <Receipt className="h-6 w-6 text-sky-500" />
            </div>
            <p className="label-caps text-slate-400 dark:text-slate-500">
              {searchTerm ? 'No se encontraron órdenes' : 'No hay órdenes de compra registradas'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}