import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { PlusCircle, Edit2, Trash2, Package, Tag, DollarSign, Calendar } from 'lucide-react'
import { catalogoUseCase } from '@/infrastructure/factories/catalogo.factory'
import type { Catalogo } from '@/domain/entities/catalogo.entity'

const TIPO_STYLES: Record<string, string> = {
  curso: 'bg-sky-100 text-sky-700',
  libro: 'bg-amber-100 text-amber-700',
}

const TIPO_LABELS: Record<string, string> = {
  curso: 'Curso',
  libro: 'Libro',
}

export default function AdminCatalogoPage() {
  const [items, setItems] = useState<Catalogo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadItems = async () => {
    try {
      setLoading(true)
      const result = await catalogoUseCase.getAll()
      setItems(result.results || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar el catálogo')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadItems()
  }, [])

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Estás seguro de eliminar este producto del catálogo?')) return
    try {
      await catalogoUseCase.delete(id)
      setItems((prev) => prev.filter((item) => item.id !== id))
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al eliminar')
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  return (
    <div className="p-6 max-w-7xl mx-auto w-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Catálogo</h1>
          <p className="text-slate-500 mt-1">Gestiona los productos y cursos a la venta</p>
        </div>
        <Link
          to="/admin/catalogo/new"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-sky-500/30 transition-all hover:-translate-y-0.5 hover:bg-sky-400 focus:outline-none focus:ring-4 focus:ring-sky-500/20 active:translate-y-0"
        >
          <PlusCircle className="w-5 h-5" />
          Nuevo Producto
        </Link>
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
      ) : items.length > 0 ? (
        <div className="grid gap-4">
          {items.map((item) => (
            <div key={item.id} className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6 flex flex-col md:flex-row gap-6 items-start md:items-center hover:shadow-md transition-shadow">
              {/* Icon block */}
              <div className="flex flex-col items-center min-w-[80px]">
                <div className="h-14 w-14 rounded-2xl bg-sky-50 flex items-center justify-center">
                  <Package className="h-7 w-7 text-sky-500" />
                </div>
                <span className={`mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold ${TIPO_STYLES[item.tipo] || 'bg-slate-100 text-slate-500'}`}>
                  {TIPO_LABELS[item.tipo] || item.tipo}
                </span>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Tag className="w-4 h-4 text-sky-500 shrink-0" />
                  <h3 className="font-black text-slate-800 truncate">{item.titulo}</h3>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-slate-500">
                  <span className="flex items-center gap-1">
                    <DollarSign className="w-3 h-3" /> ${item.precio}
                  </span>
                  {item.curso_info && <span>· {item.curso_info.title}</span>}
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {formatDate(item.creado_at)}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 w-full md:w-auto">
                <Link
                  to={`/admin/catalogo/${item.id}/edit`}
                  className="rounded-lg p-2 text-slate-400 hover:bg-sky-50 hover:text-sky-600 transition-colors"
                  title="Editar"
                >
                  <Edit2 className="h-4 w-4" />
                </Link>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                  title="Eliminar"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-200">
          <Package className="h-12 w-12 text-slate-200 mb-4" />
          <h3 className="text-lg font-black text-slate-800">Catálogo vacío</h3>
          <p className="text-slate-500 font-medium mt-2">No hay productos en el catálogo aún.</p>
          <Link
            to="/admin/catalogo/new"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-sky-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg"
          >
            <PlusCircle className="w-5 h-5" /> Agregar Producto
          </Link>
        </div>
      )}
    </div>
  )
}