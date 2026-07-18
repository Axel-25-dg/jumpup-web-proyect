import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { PlusCircle, Edit2, Trash2, Bell } from 'lucide-react'
import { announcementUseCase } from '@/infrastructure/factories/announcement.factory'
import type { Announcement } from '@/domain/entities/announcement.entity'

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadAnnouncements = async () => {
    try {
      setLoading(true)
      const result = await announcementUseCase.getAll()
      setAnnouncements(result.results || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar los anuncios')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAnnouncements()
  }, [])

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Estás seguro de eliminar este anuncio?')) return
    try {
      await announcementUseCase.delete(id)
      setAnnouncements((prev) => prev.filter((a) => a.id !== id))
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al eliminar')
    }
  }

  const getStatusBadge = (announcement: Announcement) => {
    const now = new Date()
    const start = new Date(announcement.start_date)
    const end = new Date(announcement.end_date)

    if (!announcement.is_active) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">
          Inactivo
        </span>
      )
    }
    if (now < start) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
          Programado
        </span>
      )
    }
    if (now > end) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">
          Expirado
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
        Activo
      </span>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto w-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Anuncios</h1>
          <p className="text-slate-500 mt-1">Gestiona los anuncios del sistema</p>
        </div>
        <Link
          to="/admin/announcements/new"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-sky-500/30 transition-all hover:-translate-y-0.5 hover:bg-sky-400 focus:outline-none focus:ring-4 focus:ring-sky-500/20 active:translate-y-0"
        >
          <PlusCircle className="w-5 h-5" />
          Nuevo Anuncio
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
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50/80 text-xs font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Título</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4">Inicio</th>
                <th className="px-6 py-4">Fin</th>
                <th className="px-6 py-4">Autor</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {announcements.map((announcement) => (
                <tr key={announcement.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-400">#{announcement.id}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-sky-500 shrink-0" />
                      <span className="font-bold text-slate-700">{announcement.title}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(announcement)}</td>
                  <td className="px-6 py-4 text-slate-500 text-xs">
                    {new Date(announcement.start_date).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="px-6 py-4 text-slate-500 text-xs">
                    {new Date(announcement.end_date).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    {announcement.author_username || `#${announcement.author}`}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        to={`/admin/announcements/${announcement.id}/edit`}
                        className="rounded-lg p-2 text-slate-400 hover:bg-sky-50 hover:text-sky-600 transition-colors"
                        title="Editar"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(announcement.id)}
                        className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {announcements.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    No hay anuncios registrados.
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