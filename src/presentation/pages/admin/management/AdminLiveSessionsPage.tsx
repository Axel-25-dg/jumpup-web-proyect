import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Plus,
  Edit2,
  Trash2,
  Video,
  Calendar,
  Users,
  Radio,
  ArrowLeft,
  Search,
  MoreVertical,
  Play,
  Square,
  AlertCircle,
  Eye,
} from 'lucide-react'
import { Button } from '@/presentation/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/presentation/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/presentation/components/ui/alert-dialog'
import { toast } from 'sonner'
import { adminLiveSessionRepo } from '@/infrastructure/factories/admin-live-session.factory'
import type { AdminLiveSession } from '@/domain/entities/admin-live-session.entity'

const STATUS_STYLES: Record<string, string> = {
  scheduled: 'border-indigo-200 text-indigo-600 bg-indigo-50 dark:bg-indigo-900/10',
  live: 'border-rose-200 text-rose-600 bg-rose-50 dark:bg-rose-900/10',
  ended: 'border-slate-900/10 text-slate-500 dark:border-white/10',
  cancelled: 'border-amber-200 text-amber-600 bg-amber-50 dark:bg-amber-900/10',
}

const STATUS_LABELS: Record<string, string> = {
  scheduled: 'Programada',
  live: 'En vivo',
  ended: 'Finalizada',
  cancelled: 'Cancelada',
}

export default function AdminLiveSessionsPage() {
  const navigate = useNavigate()
  const [sessions, setSessions] = useState<AdminLiveSession[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [sessionToDelete, setSessionToDelete] = useState<AdminLiveSession | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [actionLoading, setActionLoading] = useState<number | null>(null)

  const loadSessions = async () => {
    try {
      setIsLoading(true)
      const result = await adminLiveSessionRepo.getAll()
      setSessions(result.results || [])
    } catch (err) {
      console.error('Error fetching sessions:', err)
      toast.error('No se pudieron cargar las sesiones en vivo')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { loadSessions() }, [])

  const handleStartSession = async (session: AdminLiveSession) => {
    setActionLoading(session.id)
    try {
      await adminLiveSessionRepo.start(session.id)
      toast.success(`Sesión "${session.title}" iniciada`)
      loadSessions()
    } catch {
      toast.error('Error al iniciar la sesión')
    } finally {
      setActionLoading(null)
    }
  }

  const handleEndSession = async (session: AdminLiveSession) => {
    setActionLoading(session.id)
    try {
      await adminLiveSessionRepo.end(session.id)
      toast.success(`Sesión "${session.title}" finalizada`)
      loadSessions()
    } catch {
      toast.error('Error al finalizar la sesión')
    } finally {
      setActionLoading(null)
    }
  }

  const handleDeleteSession = async () => {
    if (!sessionToDelete) return
    setIsDeleting(true)
    try {
      await adminLiveSessionRepo.delete(sessionToDelete.id)
      setSessions(prev => prev.filter(s => s.id !== sessionToDelete.id))
      toast.success(`Sesión "${sessionToDelete.title}" cancelada con éxito`)
    } catch (error) {
      console.error('Error deleting session:', error)
      toast.error('Ocurrió un error al cancelar la sesión')
    } finally {
      setIsDeleting(false)
      setSessionToDelete(null)
    }
  }

  const formatDate = (d: string) => new Date(d).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })

  const formatTime = (d: string) => new Date(d).toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit'
  })

  const filteredSessions = sessions.filter(s =>
    s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.teacher_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.course_title?.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <div className="animate-in fade-in duration-500">
      {/* HERO */}
      <section className="border-b border-slate-900/10 dark:border-white/10 px-8 md:px-12 py-14 md:py-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" asChild className="-ml-2 rounded-none hover:bg-slate-100 dark:hover:bg-white/5">
                <Link to="/admin"><ArrowLeft className="h-4 w-4" /></Link>
              </Button>
              <div className="chip">
                <Radio className="h-3.5 w-3.5 text-sky-500" />
                Transmisión Técnica
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white uppercase">
              Sesiones en <span className="text-sky-500">Vivo</span>.
            </h1>
            <p className="text-base text-slate-500 dark:text-slate-400 max-w-lg font-medium">
              Sincronización de clases magistrales y tutorías personalizadas en tiempo real.
            </p>
          </div>
          <Button
            onClick={() => navigate('/admin/live-sessions/new')}
            className="rounded-none bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold uppercase text-[11px] tracking-[0.2em] px-8 py-6 h-auto hover:bg-sky-500 dark:hover:bg-sky-500 hover:text-white transition-all"
          >
            <Plus className="h-4 w-4 mr-2" /> Programar Sesión
          </Button>
        </div>
      </section>

      {/* TOOLBAR */}
      <div className="border-b border-slate-900/10 dark:border-white/10 p-6 md:p-8 flex flex-col lg:flex-row gap-6 justify-between items-center bg-white dark:bg-transparent">
        <div className="relative w-full lg:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            placeholder="BUSCAR POR TÍTULO, DOCENTE O CURSO..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border border-slate-900/10 dark:border-white/10 bg-transparent py-3.5 pl-12 pr-4 text-[11px] font-bold uppercase tracking-widest outline-none focus:border-sky-500 transition-colors"
          />
        </div>
        <div className="label-caps border border-slate-900/10 dark:border-white/10 text-slate-500 px-6 py-3 bg-slate-50 dark:bg-white/5 font-mono">
          {sessions.length} SESIONES PROGRAMADAS
        </div>
      </div>

      {/* DATA TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1200px] text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-900/10 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02]">
              <th className="px-8 py-5 label-caps text-slate-400">Programación</th>
              <th className="px-8 py-5 label-caps text-slate-400">Sesión / Contenido</th>
              <th className="px-8 py-5 label-caps text-slate-400">Audiencia</th>
              <th className="px-8 py-5 label-caps text-slate-400">Estado Operativo</th>
              <th className="px-8 py-5 label-caps text-slate-400 text-right">Gestión</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-900/5 dark:divide-white/5">
            {isLoading ? (
              [1, 2, 3].map(i => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={5} className="px-8 py-8"><div className="h-4 bg-slate-100 dark:bg-white/5 w-full" /></td>
                </tr>
              ))
            ) : filteredSessions.length > 0 ? (
              filteredSessions.map((session) => (
                <tr key={session.id} className="card-hover group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 border border-slate-900/10 dark:border-white/10 flex items-center justify-center bg-slate-50 dark:bg-white/5">
                        <Calendar className="h-4 w-4 text-slate-400" />
                      </div>
                      <div>
                        <p className="text-xs font-black text-slate-900 dark:text-white uppercase font-mono">{formatDate(session.scheduled_at)}</p>
                        <p className="label-micro text-slate-400 mt-0.5 font-mono">{formatTime(session.scheduled_at)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className={`h-10 w-10 shrink-0 flex items-center justify-center border ${session.status === 'live' ? 'border-rose-500 bg-rose-500 text-white animate-pulse' : 'border-slate-900/10 bg-slate-50 text-sky-500'}`}>
                        {session.status === 'live' ? <Play className="h-4 w-4 fill-current" /> : <Video className="h-4 w-4" />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight group-hover:text-sky-500 transition-colors">
                          {session.title}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="label-micro text-slate-400 font-mono uppercase">
                            {session.course_title || 'TRANSVERSAL'}
                          </span>
                          <span className="h-1 w-1 rounded-full bg-slate-300" />
                          <span className="label-micro text-slate-400 font-mono">{session.teacher_email}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                      <Users className="h-3.5 w-3.5 text-slate-400" />
                      <span className="label-micro text-slate-600 dark:text-slate-300 font-bold font-mono">
                        {session.participant_count} / {session.max_students}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`label-micro px-3 py-1 border font-bold ${STATUS_STYLES[session.status] || 'border-slate-900/10 text-slate-500'}`}>
                      {STATUS_LABELS[session.status] || session.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-none border-slate-900/10 hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-slate-900 transition-all font-bold text-[10px] uppercase tracking-widest h-9"
                        onClick={() => navigate(`/admin/live-sessions/${session.id}/edit`)}
                      >
                        <Edit2 className="h-3.5 w-3.5 mr-2" /> Editar
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="icon" className="rounded-none border-slate-900/10 h-9 w-9">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-none border-slate-900/10 dark:border-white/10">
                          <DropdownMenuItem onSelect={() => navigate(`/admin/live-sessions/${session.id}`)} className="label-micro py-3">
                            <Eye className="h-4 w-4 mr-2" /> Ver Detalle
                          </DropdownMenuItem>
                          {session.status === 'scheduled' && (
                            <DropdownMenuItem onSelect={() => handleStartSession(session)} disabled={actionLoading === session.id} className="label-micro py-3 text-emerald-600 focus:text-emerald-600">
                              <Play className="h-4 w-4 mr-2" /> Iniciar Sesión
                            </DropdownMenuItem>
                          )}
                          {session.status === 'live' && (
                            <DropdownMenuItem onSelect={() => handleEndSession(session)} disabled={actionLoading === session.id} className="label-micro py-3 text-rose-600 focus:text-rose-600">
                              <Square className="h-4 w-4 mr-2" /> Finalizar Sesión
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onSelect={() => setSessionToDelete(session)} className="label-micro py-3 text-rose-500 focus:text-rose-500">
                            <Trash2 className="h-4 w-4 mr-2" /> Cancelar Sesión
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="py-24 text-center">
                  <div className="flex h-16 w-16 items-center justify-center border border-slate-900/10 dark:border-white/10 mx-auto mb-6">
                    <Radio className="h-6 w-6 text-slate-300" />
                  </div>
                  <p className="label-caps text-slate-400">No se encontraron sesiones programadas</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Dialog */}
      <AlertDialog open={!!sessionToDelete} onOpenChange={(open) => !open && !isDeleting && setSessionToDelete(null)}>
        <AlertDialogContent className="rounded-none border-slate-900/10">
          <AlertDialogHeader>
            <div className="flex h-16 w-16 items-center justify-center border border-rose-500/20 bg-rose-500/5 mx-auto mb-6">
              <AlertCircle className="h-8 w-8 text-rose-500" />
            </div>
            <AlertDialogTitle className="text-center text-2xl font-black uppercase tracking-tight">Cancelar Sesión</AlertDialogTitle>
            <AlertDialogDescription className="text-center text-sm font-medium py-4">
              ¿Desea cancelar definitivamente la sesión <span className="text-slate-900 dark:text-white font-bold uppercase">"{sessionToDelete?.title}"</span>? Se notificará automáticamente a los alumnos inscritos sobre la cancelación.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center gap-3 pt-4">
            <AlertDialogCancel className="rounded-none font-bold uppercase text-[10px] tracking-[0.2em]">Cerrar</AlertDialogCancel>
            <AlertDialogAction disabled={isDeleting} onClick={handleDeleteSession} className="rounded-none bg-rose-600 hover:bg-rose-700 font-bold uppercase text-[10px] tracking-[0.2em]">
              {isDeleting ? 'Cancelando...' : 'Confirmar Cancelación'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}