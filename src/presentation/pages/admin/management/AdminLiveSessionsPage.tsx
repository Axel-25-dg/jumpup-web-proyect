import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { PlusCircle, Edit2, Trash2, Video, Calendar, Users } from 'lucide-react'
import { adminLiveSessionUseCase } from '@/infrastructure/factories/admin-live-session.factory'
import type { AdminLiveSession } from '@/domain/entities/admin-live-session.entity'

const STATUS_STYLES: Record<string, string> = {
  scheduled: 'bg-indigo-100 text-indigo-700',
  live: 'bg-rose-100 text-rose-700 animate-pulse',
  ended: 'bg-slate-100 text-slate-500',
  cancelled: 'bg-amber-100 text-amber-700',
}

const STATUS_LABELS: Record<string, string> = {
  scheduled: 'Programada',
  live: 'En vivo',
  ended: 'Finalizada',
  cancelled: 'Cancelada',
}

export default function AdminLiveSessionsPage() {
  const [sessions, setSessions] = useState<AdminLiveSession[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadSessions = async () => {
    try {
      setLoading(true)
      const result = await adminLiveSessionUseCase.getAll()
      setSessions(result.results || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar las sesiones')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSessions()
  }, [])

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Estás seguro de cancelar esta sesión?')) return
    try {
      await adminLiveSessionUseCase.delete(id)
      setSessions((prev) => prev.filter((s) => s.id !== id))
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al cancelar')
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="p-6 max-w-7xl mx-auto w-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Sesiones en Vivo</h1>
          <p className="text-slate-500 mt-1">Gestiona las sesiones de videotutoría</p>
        </div>
        <Link
          to="/admin/live-sessions/new"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-rose-500/30 transition-all hover:-translate-y-0.5 hover:bg-rose-400 focus:outline-none focus:ring-4 focus:ring-rose-500/20 active:translate-y-0"
        >
          <PlusCircle className="w-5 h-5" />
          Nueva Sesión
        </Link>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 font-medium">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-rose-500 border-t-transparent" />
        </div>
      ) : sessions.length > 0 ? (
        <div className="grid gap-4">
          {sessions.map((session) => (
            <div key={session.id} className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6 flex flex-col md:flex-row gap-6 items-start md:items-center hover:shadow-md transition-shadow">
              {/* Date/Time block */}
              <div className="flex flex-col items-center min-w-[90px]">
                <span className="text-xs font-bold uppercase text-slate-400">{formatDate(session.scheduled_at)}</span>
                <span className="text-xl font-black text-slate-800">{formatTime(session.scheduled_at)}</span>
                <span className="text-xs font-bold text-slate-400">{session.duration_min} min</span>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Video className="w-4 h-4 text-rose-500 shrink-0" />
                  <h3 className="font-black text-slate-800 truncate">{session.title}</h3>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-slate-500">
                  <span>{session.teacher_email}</span>
                  {session.course_title && <span>· {session.course_title}</span>}
                  <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {session.participant_count}/{session.max_students}</span>
                </div>
              </div>

              {/* Status + Actions */}
              <div className="flex items-center gap-3 w-full md:w-auto">
                <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${STATUS_STYLES[session.status] || 'bg-slate-100 text-slate-500'}`}>
                  {STATUS_LABELS[session.status] || session.status}
                </span>
                <Link
                  to={`/admin/live-sessions/${session.id}/edit`}
                  className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                  title="Editar"
                >
                  <Edit2 className="h-4 w-4" />
                </Link>
                {session.status === 'scheduled' && (
                  <button
                    onClick={() => handleDelete(session.id)}
                    className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                    title="Cancelar"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-200">
          <Calendar className="h-12 w-12 text-slate-200 mb-4" />
          <h3 className="text-lg font-black text-slate-800">No hay sesiones</h3>
          <p className="text-slate-500 font-medium mt-2">No se han creado sesiones en vivo aún.</p>
          <Link
            to="/admin/live-sessions/new"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-rose-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg"
          >
            <PlusCircle className="w-5 h-5" /> Programar Sesión
          </Link>
        </div>
      )}
    </div>
  )
}