import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Receipt,
  CreditCard,
  Clock,
  CheckCircle,
  XCircle,
  Package,
  DollarSign,
  User,
  Calendar,
} from 'lucide-react'
import { Button } from '@/presentation/components/ui/button'
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

export default function AdminOrdenCompraDetailPage() {
  const { id } = useParams()
  const [orden, setOrden] = useState<OrdenCompra | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadOrden = async () => {
      if (!id) return
      setIsLoading(true)
      try {
        const data = await ordenCompraUseCase.getById(Number(id))
        setOrden(data)
      } catch (err) {
        console.error('Error loading order:', err)
        setError('Error al cargar la orden')
        toast.error('No se pudo cargar la orden')
      } finally {
        setIsLoading(false)
      }
    }
    loadOrden()
  }, [id])

  if (isLoading) {
    return (
      <div className="animate-in fade-in duration-500 max-w-4xl mx-auto p-8 space-y-8">
        <Skeleton className="h-12 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (error || !orden) {
    return (
      <div className="animate-in fade-in duration-500 max-w-4xl mx-auto p-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" asChild className="-ml-2">
            <Link to="/admin/ordenes-compra"><ArrowLeft className="h-5 w-5" /></Link>
          </Button>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Orden no encontrada</h1>
          </div>
        </div>
        <div className="border border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-900/20 p-6 text-sm font-bold text-red-600 dark:text-red-400">
          {error || 'La orden solicitada no existe o fue eliminada.'}
        </div>
      </div>
    )
  }

  const EstadoIcon = ESTADO_ICONS[orden.estado] || CreditCard

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="animate-in fade-in duration-500 max-w-4xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-8 md:px-12 py-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild className="-ml-2">
            <Link to="/admin/ordenes-compra"><ArrowLeft className="h-5 w-5" /></Link>
          </Button>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              Orden #{orden.id}
            </h1>
            <p className="text-sm text-slate-500">Detalle de la transacción</p>
          </div>
        </div>
        <span className={`label-caps px-3 py-1.5 inline-flex items-center gap-1.5 ${ESTADO_STYLES[orden.estado] || 'bg-slate-100 text-slate-500'}`}>
          <EstadoIcon className="h-4 w-4" />
          {ESTADO_LABELS[orden.estado] || orden.estado}
        </span>
      </div>

      {/* INFO CARD */}
      <div className="mx-8 md:mx-12 mb-8 border border-slate-900/10 dark:border-white/10 bg-white dark:bg-[#0a0a0b]">
        <div className="p-8 md:p-10">
          <div className="flex flex-col md:flex-row items-start justify-between gap-8 mb-8">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 flex items-center justify-center border-2 border-sky-500/20 text-sky-500 bg-sky-500/5">
                <Receipt className="h-8 w-8" />
              </div>
              <div>
                <p className="text-3xl font-black text-slate-900 dark:text-white">${orden.total}</p>
                <p className="label-micro text-slate-400 mt-1 uppercase tracking-widest">Total de la orden</p>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-900/10 dark:border-white/10 pt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex items-start gap-3">
              <User className="h-5 w-5 text-sky-500 mt-0.5 shrink-0" />
              <div>
                <p className="label-micro text-slate-400 mb-1 uppercase tracking-widest">Estudiante</p>
                <p className="font-bold text-slate-900 dark:text-white">{orden.estudiante_email}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-sky-500 mt-0.5 shrink-0" />
              <div>
                <p className="label-micro text-slate-400 mb-1 uppercase tracking-widest">Fecha de Transacción</p>
                <p className="font-bold text-slate-900 dark:text-white">{formatDate(orden.fecha_creacion)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* DETAILS */}
      <div className="mx-8 md:mx-12 mb-12 border border-slate-900/10 dark:border-white/10 bg-white dark:bg-[#0a0a0b]">
        <div className="px-8 md:px-10 py-5 border-b border-slate-900/10 dark:border-white/10">
          <h2 className="font-black text-slate-900 dark:text-white flex items-center gap-2 uppercase tracking-widest text-xs">
            <Package className="h-4 w-4 text-sky-500" />
            Productos ({orden.detalles?.length || 0})
          </h2>
        </div>

        {orden.detalles && orden.detalles.length > 0 ? (
          <div className="divide-y divide-slate-900/5 dark:divide-white/5">
            {orden.detalles.map((detalle) => (
              <div key={detalle.id} className="px-8 md:px-10 py-5 flex items-center justify-between card-hover group">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 shrink-0 flex items-center justify-center border border-slate-900/10 dark:border-white/10 text-sky-500 bg-sky-50 dark:bg-sky-900/20">
                    <Package className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                      {detalle.producto_info?.titulo || `Producto #${detalle.producto}`}
                    </p>
                    {detalle.producto_info?.tipo && (
                      <p className="label-micro text-slate-400 uppercase tracking-widest mt-0.5">
                        {detalle.producto_info.tipo === 'curso' ? 'Curso' : 'Libro'}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <DollarSign className="h-4 w-4 text-slate-400" />
                  <span className="font-black text-lg text-slate-900 dark:text-white">${detalle.precio_unitario}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-8 md:px-10 py-12 text-center">
            <Package className="h-8 w-8 text-slate-300 mx-auto mb-4" />
            <p className="label-caps text-slate-400">Sin detalles disponibles</p>
          </div>
        )}

        {/* Total footer */}
        <div className="px-8 md:px-10 py-5 border-t border-slate-900/10 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02]">
          <div className="flex items-center justify-between">
            <span className="font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest text-xs">Total</span>
            <span className="text-2xl font-black text-slate-900 dark:text-white">${orden.total}</span>
          </div>
        </div>
      </div>

      {/* Back button */}
      <div className="px-8 md:px-12 pb-12">
        <Button variant="outline" asChild>
          <Link to="/admin/ordenes-compra"><ArrowLeft className="h-4 w-4 mr-2" /> Volver a Órdenes</Link>
        </Button>
      </div>
    </div>
  )
}