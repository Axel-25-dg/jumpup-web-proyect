import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Video,
  Calendar,
  Clock,
  Users,
  Globe,
  Play,
  Square,
  Edit2,
  User,
  Loader2,
  Radio,
} from 'lucide-react'
import { Button } from '@/presentation/components/ui/button'
import { Skeleton } from '@/presentation/components/ui/skeleton'
import { toast } from 'sonner'
import { adminLiveSessionRepo } from '@/infrastructure/factories/admin-live-session.factory'
import type { AdminLiveSession } from '@/domain/entities/admin-live-session.entity'

const STATUS_STYLES: Record<string, string> = {
  scheduled: 'border-indigo-200 text-indigo-600 bg-indigo-50 dark:bg-indigo-900/10',
  live: 'border-rose-200 text-rose-600 bg-rose-50 dark:bg-rose-900/10 animate-pulse',
  ended: 'border-slate-900/10 text-slate-500 dark:border-white/10',
  cancelled: 'border-amber-200 text-amber-600 bg-amber-50 dark:bg-amber-900/10',
}

const STATUS_LABELS: Record<string, string> = {
  scheduled: 'Programada',
  live: 'En vivo',
  ended: 'Finalizada',
  cancelled: 'Cancelada',
}

interface Participant {
  id: number
  student: number
  student_email: string
  student_username: string
  joined_at: string
  left_at: string | null
  is_active: boolean
}

export default function AdminLiveSessionDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [session, setSession] = useState<AdminLiveSession | null>(null)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  const loadData = async () => {
    if (!id) return
    setIsLoading(true)
    try {
      const [sessionData, participantsData] = await Promise.all([
        adminLiveSessionRepo.getById(Number(id)),
        adminLiveSessionRepo.getParticipants(Number(id)),
      ])
      setSession(sessionData)
      setParticipants(participantsData)
    } catch (error) {
      console.error('Error loading session:', error)
      toast.error('No se pudo cargar la sesión')
      navigate('/admin/live-sessions')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { loadData() }, [id])

  const handleStart = async () => {
    if (!session) return
    setActionLoading(true)
    try {
      await adminLiveSessionRepo.start(session.id)
      toast.success('Sesión iniciada')
      loadData()
    } catch {
      toast.error('Error al iniciar la sesión')
    } finally {
      setActionLoading(false)
    }
  }

  const handleEnd = async () => {
    if (!session) return
    setActionLoading(true)
    try {
      await adminLiveSessionRepo.end(session.id)
      toast.success('Sesión finalizada')
      loadData()
    } catch {
      toast.error('Error al finalizar la sesión')
    } finally {
      setActionLoading(false)
    }
  }

  const formatDate = (d: string) => new Date(d).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const formatTime = (d: string) => new Date(d).toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
  })

  if (isLoading) {
    return (
      <div className="animate-in fade-in duration-500 max-w-4xl mx-auto p-8 space-y-8">
        <Skeleton className="h-12 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!session) return null

  return (
    <div className="animate-in fade-in duration-500 max-w-4xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-8 md:px-12 py-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild className="-ml-2">
            <Link to="/admin/live-sessions"><ArrowLeft className="h-5 w-5" /></Link>
          </Button>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              {session.title}
            </h1>
            <p className="text-sm text-slate-500">Detalle de la sesión en vivo</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate(`/admin/live-sessions/${session.id}/edit`)}>
            <Edit2 className="h-4 w-4 mr-2" /> Editar
          </Button>
          {session.status === 'scheduled' && (
            <Button size="sm" onClick={handleStart} disabled={actionLoading} className="bg-emerald-600 hover:bg-emerald-700">
              {actionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Play className="h-4 w-4 mr-2" />}
              Iniciar
            </Button>
          )}
          {session.status === 'live' && (
            <Button size="sm" onClick={handleEnd} disabled={actionLoading} className="bg-rose-600 hover:bg-rose-700">
              {actionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Square className="h-4 w-4 mr-2" />}
              Finalizar
            </Button>
          )}
        </div>
      </div>

      {/* INFO CARD */}
      <div className="mx-8 md:mx-12 mb-8 border border-slate-900/10 dark:border-white/10 bg-white dark:bg-[#0a0a0b]">
        <div className="p-8 md:p-10">
          <div className="flex items-center gap-4 mb-8">
            <div className={`h-16 w-16 flex items-center justify-center border-2 ${session.status === 'live' ? 'border-rose-500 bg-rose-500 text-white' : 'border-sky-500/20 text-sky-500 bg-sky-500/5'}`}>
              {session.status === 'live' ? <Radio className="h-8 w-8 animate-pulse" /> : <Video className="h-8 w-8" />}
            </div>
            <div>
              <span className={`label-caps px-3 py-1.5 inline-flex items-center gap-1.5 ${STATUS_STYLES[session.status] || ''}`}>
                {STATUS_LABELS[session.status] || session.status}
              </span>
              <p className="text-sm text-slate-500 mt-1">{session.description}</p>
            </div>
          </div>

          <div className="border-t border-slate-900/10 dark:border-white/10 pt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-sky-500 mt-0.5 shrink-0" />
              <div>
                <p className="label-micro text-slate-400 mb-1 uppercase tracking-widest">Programación</p>
                <p className="font-bold text-slate-900 dark:text-white">{formatDate(session.scheduled_at)}</p>
                <p className="text-sm text-slate-500">{formatTime(session.scheduled_at)}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-sky-500 mt-0.5 shrink-0" />
              <div>
                <p className="label-micro text-slate-400 mb-1 uppercase tracking-widest">Duración Estimada</p>
                <p className="font-bold text-slate-900 dark:text-white">{session.duration_min} minutos</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Users className="h-5 w-5 text-sky-500 mt-0.5 shrink-0" />
              <div>
                <p className="label-micro text-slate-400 mb-1 uppercase tracking-widest">Participantes</p>
                <p className="font-bold text-slate-900 dark:text-white">{session.participant_count} / {session.max_students}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <User className="h-5 w-5 text-sky-500 mt-0.5 shrink-0" />
              <div>
                <p className="label-micro text-slate-400 mb-1 uppercase tracking-widest">Docente</p>
                <p className="font-bold text-slate-900 dark:text-white">{session.teacher_email}</p>
              </div>
            </div>
            {session.meeting_url && (
              <div className="md:col-span-2 flex items-start gap-3">
                <Globe className="h-5 w-5 text-sky-500 mt-0.5 shrink-0" />
                <div>
                  <p className="label-micro text-slate-400 mb-1 uppercase tracking-widest">URL de la Sesión</p>
                  <a href={session.meeting_url} target="_blank" rel="noopener noreferrer" className="font-bold text-sky-500 hover:text-sky-600 underline break-all">
                    {session.meeting_url}
                  </a>
                </div>
              </div>
            )}
            {session.course_title && (
              <div className="flex items-start gap-3">
                <Video className="h-5 w-5 text-sky-500 mt-0.5 shrink-0" />
                <div>
                  <p className="label-micro text-slate-400 mb-1 uppercase tracking-widest">Curso Vinculado</p>
                  <p className="font-bold text-slate-900 dark:text-white">{session.course_title}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* PARTICIPANTS */}
      <div className="mx-8 md:mx-12 mb-12 border border-slate-900/10 dark:border-white/10 bg-white dark:bg-[#0a0a0b]">
        <div className="px-8 md:px-10 py-5 border-b border-slate-900/10 dark:border-white/10">
          <h2 className="font-black text-slate-900 dark:text-white flex items-center gap-2 uppercase tracking-widest text-xs">
            <Users className="h-4 w-4 text-sky-500" />
            Participantes ({participants.length})
          </h2>
        </div>

        {participants.length > 0 ? (
          <div className="divide-y divide-slate-900/5 dark:divide-white/5">
            {participants.map((p) => (
              <div key={p.id} className="px-8 md:px-10 py-4 flex items-center justify-between card-hover group">
                <div className="flex items-center gap-4">
                  <div className="h-9 w-9 shrink-0 flex items-center justify-center border border-slate-900/10 dark:border-white/10 text-xs font-black text-sky-500 bg-sky-50 dark:bg-sky-900/20 uppercase">
                    {p.student_username?.slice(0, 2) || 'U'}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{p.student_email}</p>
                    <p className="label-micro text-slate-400">
                      {p.is_active ? 'Activo' : 'Inactivo'} · Se unió {new Date(p.joined_at).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                </div>
                <span className={`label-micro px-2 py-0.5 ${p.is_active ? 'text-emerald-600 bg-emerald-50' : 'text-slate-400 bg-slate-50'}`}>
                  {p.is_active ? 'EN SESIÓN' : 'SALIÓ'}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-8 md:px-10 py-12 text-center">
            <Users className="h-8 w-8 text-slate-300 mx-auto mb-4" />
            <p className="label-caps text-slate-400">Sin participantes registrados</p>
          </div>
        )}
      </div>

      {/* Back */}
      <div className="px-8 md:px-12 pb-12">
        <Button variant="outline" asChild>
          <Link to="/admin/live-sessions"><ArrowLeft className="h-4 w-4 mr-2" /> Volver a Sesiones</Link>
        </Button>
      </div>
    </div>
  )
}