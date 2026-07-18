import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { PlusCircle, Edit2, Trash2, FileText, Video, Image, Music, Globe, File } from 'lucide-react'
import { adminResourceUseCase } from '@/infrastructure/factories/admin-resource.factory'
import type { AdminResource } from '@/domain/entities/admin-resource.entity'

const TYPE_ICONS: Record<string, any> = {
  pdf: FileText,
  audio: Music,
  video: Video,
  word: FileText,
  image: Image,
  link: Globe,
  other: File,
}

const TYPE_COLORS: Record<string, string> = {
  pdf: 'text-rose-600 bg-rose-50',
  audio: 'text-purple-600 bg-purple-50',
  video: 'text-indigo-600 bg-indigo-50',
  word: 'text-blue-600 bg-blue-50',
  image: 'text-emerald-600 bg-emerald-50',
  link: 'text-sky-600 bg-sky-50',
  other: 'text-slate-600 bg-slate-50',
}

export default function AdminResourcesPage() {
  const [resources, setResources] = useState<AdminResource[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadResources = async () => {
    try {
      setLoading(true)
      const result = await adminResourceUseCase.getAll()
      setResources(result.results || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar los recursos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadResources()
  }, [])

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Estás seguro de eliminar este recurso?')) return
    try {
      await adminResourceUseCase.delete(id)
      setResources((prev) => prev.filter((r) => r.id !== id))
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
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Recursos</h1>
          <p className="text-slate-500 mt-1">Gestiona todos los recursos compartidos por los profesores</p>
        </div>
        <Link
          to="/admin/resources/new"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/30 transition-all hover:-translate-y-0.5 hover:bg-emerald-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 active:translate-y-0"
        >
          <PlusCircle className="w-5 h-5" />
          Nuevo Recurso
        </Link>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 font-medium">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50/80 text-xs font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-6 py-4">Tipo</th>
                <th className="px-6 py-4">Título</th>
                <th className="px-6 py-4">Profesor</th>
                <th className="px-6 py-4">Curso</th>
                <th className="px-6 py-4">Público</th>
                <th className="px-6 py-4">Fecha</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {resources.map((resource) => {
                const Icon = TYPE_ICONS[resource.resource_type] || File
                const colorClasses = TYPE_COLORS[resource.resource_type] || 'text-slate-600 bg-slate-50'
                return (
                  <tr key={resource.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorClasses}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-700">{resource.title}</div>
                      {resource.description && (
                        <div className="text-xs text-slate-400 truncate max-w-[200px]">{resource.description}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs">{resource.teacher_email}</td>
                    <td className="px-6 py-4 text-slate-500 text-xs">{resource.course_title || '—'}</td>
                    <td className="px-6 py-4">
                      {resource.is_public ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                          Sí
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
                          No
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-400">{formatDate(resource.created_at)}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/admin/resources/${resource.id}/edit`}
                          className="rounded-lg p-2 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                          title="Editar"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(resource.id)}
                          className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {resources.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    No hay recursos registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}