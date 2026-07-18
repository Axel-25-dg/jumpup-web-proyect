import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Receipt, CreditCard, Clock, CheckCircle, XCircle, ArrowRight } from 'lucide-react'
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

export default function AdminOrdenesCompraPage() {
  const [ordenes, setOrdenes] = useState<OrdenCompra[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadOrdenes = async () => {
    try {
      setLoading(true)
      const result = await ordenCompraUseCase.getAll()
      setOrdenes(result.results || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar las órdenes')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOrdenes()
  }, [])

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="p-6 max-w-7xl mx-auto w-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Órdenes de Compra</h1>
          <p className="text-slate-500 mt-1">Revisa las transacciones y detalles de compra</p>
        </div>
        <div className="flex items-center gap-2 text-sm font-bold text-slate-400 bg-slate-50 rounded-xl px-4 py-2">
          <Receipt className="w-4 h-4" />
          {ordenes.length} órdenes
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 font-medium">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-sky-500 border-t-transparent" />
        </div>
      ) : ordenes.length > 0 ? (
        <div className="space-y-4">
          {ordenes.map((orden) => {
            const EstadoIcon = ESTADO_ICONS[orden.estado] || CreditCard
            return (
              <div key={orden.id} className="rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow">
                {/* Header */}
                <div className="p-6 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between border-b border-slate-100">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-sky-50 flex items-center justify-center">
                      <Receipt className="h-6 w-6 text-sky-500" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-slate-800">Orden #{orden.id}</span>
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${ESTADO_STYLES[orden.estado] || 'bg-slate-100 text-slate-500'}`}>
                          <EstadoIcon className="w-3 h-3" />
                          {ESTADO_LABELS[orden.estado] || orden.estado}
                        </span>
                      </div>
                      <p className="text-sm font-bold text-slate-500 mt-0.5">{orden.estudiante_email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="text-right">
                      <p className="text-2xl font-black text-slate-800">${orden.total}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{formatDate(orden.fecha_creacion)}</p>
                    </div>
                    <Link
                      to={`/admin/ordenes-compra/${orden.id}`}
                      className="rounded-lg p-2 text-slate-400 hover:bg-sky-50 hover:text-sky-600 transition-colors"
                      title="Ver detalle"
                    >
                      <ArrowRight className="h-5 w-5" />
                    </Link>
                  </div>
                </div>
                {/* Items preview */}
                {orden.detalles && orden.detalles.length > 0 && (
                  <div className="px-6 py-3 flex flex-wrap gap-2">
                    {orden.detalles.slice(0, 3).map((detalle) => (
                      <span key={detalle.id} className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-3 py-1 text-xs font-bold text-slate-600">
                        {detalle.producto_info?.titulo || `Producto #${detalle.producto}`}
                        <span className="text-slate-400">· ${detalle.precio_unitario}</span>
                      </span>
                    ))}
                    {orden.detalles.length > 3 && (
                      <span className="inline-flex items-center rounded-full bg-slate-50 px-3 py-1 text-xs font-bold text-sky-600">
                        +{orden.detalles.length - 3} más
                      </span>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-200">
          <Receipt className="h-12 w-12 text-slate-200 mb-4" />
          <h3 className="text-lg font-black text-slate-800">Sin órdenes</h3>
          <p className="text-slate-500 font-medium mt-2">No hay órdenes de compra registradas.</p>
        </div>
      )}
    </div>
  )
}