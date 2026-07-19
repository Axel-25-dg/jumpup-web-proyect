import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Receipt, CreditCard, Clock, CheckCircle, XCircle, Package, DollarSign, User, Calendar } from 'lucide-react'
import { ordenCompraUseCase } from '@/infrastructure/factories/orden-compra.factory'
import type { OrdenCompra } from '@/domain/entities/orden-compra.entity'

const ESTADO_STYLES: Record<string, string> = {
  pagada: 'bg-emerald-100 text-emerald-700',
  pendiente: 'bg-amber-100 text-amber-700',
  cancelada: 'bg-red-100 text-red-700',
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
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadOrden = async () => {
      if (!id) return
      try {
        setLoading(true)
        const data = await ordenCompraUseCase.getById(Number(id))
        setOrden(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar la orden')
      } finally {
        setLoading(false)
      }
    }
    loadOrden()
  }, [id])

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-sky-500 border-t-transparent" />
      </div>
    )
  }

  if (error || !orden) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <Link to="/admin/ordenes-compra" className="inline-flex items-center gap-2 text-sm font-bold text-sky-600 hover:text-sky-700 mb-6">
          <ArrowLeft className="w-4 h-4" /> Volver a órdenes
        </Link>
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 font-medium">
          {error || 'Orden no encontrada'}
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
    <div className="p-6 max-w-3xl mx-auto w-full">
      <Link
        to="/admin/ordenes-compra"
        className="inline-flex items-center gap-2 text-sm font-bold text-sky-600 hover:text-sky-700 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Volver a órdenes
      </Link>

      {/* Order Header */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="h-14 w-14 rounded-2xl bg-sky-50 flex items-center justify-center">
              <Receipt className="h-7 w-7 text-sky-500" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-800">Orden #{orden.id}</h1>
              <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${ESTADO_STYLES[orden.estado] || 'bg-slate-100 text-slate-500'}`}>
                <EstadoIcon className="w-3 h-3" />
                {ESTADO_LABELS[orden.estado] || orden.estado}
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-black text-slate-800">${orden.total}</p>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">Total</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl">
          <div className="flex items-center gap-3">
            <User className="h-5 w-5 text-slate-400" />
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Estudiante</p>
              <p className="font-bold text-slate-800">{orden.estudiante_email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-slate-400" />
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Fecha</p>
              <p className="font-bold text-slate-800">{formatDate(orden.fecha_creacion)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Order Details */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="font-black text-slate-800 flex items-center gap-2">
            <Package className="h-4 w-4 text-sky-500" />
            Productos ({orden.detalles?.length || 0})
          </h2>
        </div>

        {orden.detalles && orden.detalles.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {orden.detalles.map((detalle) => (
              <div key={detalle.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-sky-50 flex items-center justify-center">
                    <Package className="h-5 w-5 text-sky-500" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">
                      {detalle.producto_info?.titulo || `Producto #${detalle.producto}`}
                    </p>
                    {detalle.producto_info?.tipo && (
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                        {detalle.producto_info.tipo === 'curso' ? 'Curso' : 'Libro'}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-slate-400" />
                  <span className="font-black text-slate-800">${detalle.precio_unitario}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-6 py-8 text-center">
            <p className="text-sm font-bold text-slate-400">Sin detalles disponibles</p>
          </div>
        )}

        {/* Total footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <span className="font-black text-slate-600">Total</span>
            <span className="text-xl font-black text-slate-800">${orden.total}</span>
          </div>
        </div>
      </div>
    </div>
  )
}