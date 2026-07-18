import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { PlusCircle, Edit2, Trash2, MessageSquare } from 'lucide-react'
import { forumCategoryUseCase } from '@/infrastructure/factories/forum-category.factory'
import type { ForumCategory } from '@/domain/entities/forum-category.entity'

export default function AdminForumCategoriesPage() {
  const [categories, setCategories] = useState<ForumCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadCategories = async () => {
    try {
      setLoading(true)
      const result = await forumCategoryUseCase.getAll()
      setCategories(result.results || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar las categorías del foro')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCategories()
  }, [])

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Estás seguro de eliminar esta categoría del foro?')) return
    try {
      await forumCategoryUseCase.delete(id)
      setCategories((prev) => prev.filter((c) => c.id !== id))
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al eliminar')
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto w-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Categorías del Foro</h1>
          <p className="text-slate-500 mt-1">Gestiona las categorías del foro de la comunidad</p>
        </div>
        <Link
          to="/admin/forum-categories/new"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/30 transition-all hover:-translate-y-0.5 hover:bg-indigo-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 active:translate-y-0"
        >
          <PlusCircle className="w-5 h-5" />
          Nueva Categoría
        </Link>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 font-medium">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50/80 text-xs font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Icono</th>
                <th className="px-6 py-4">Nombre</th>
                <th className="px-6 py-4">Descripción</th>
                <th className="px-6 py-4">Orden</th>
                <th className="px-6 py-4">Hilos</th>
                <th className="px-6 py-4">Activo</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {categories.map((category) => (
                <tr key={category.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-400">#{category.id}</td>
                  <td className="px-6 py-4">
                    <span className="text-2xl">{category.icon || '💬'}</span>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-700">{category.name}</td>
                  <td className="px-6 py-4 text-slate-500 max-w-xs truncate">{category.description}</td>
                  <td className="px-6 py-4 text-slate-500">{category.order}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{category.thread_count}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {category.is_active ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                        Activo
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">
                        Inactivo
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        to={`/admin/forum-categories/${category.id}/edit`}
                        className="rounded-lg p-2 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                        title="Editar"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(category.id)}
                        className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-500">
                    No hay categorías de foro registradas.
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