import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Video,
  Plus,
  Calendar,
  Clock,
  Users,
  MoreVertical,
  Edit2,
  Trash2,
  AlertCircle
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
import {
  getTeacherLiveSessionsUseCase,
  cancelLiveSessionUseCase
} from '@/infrastructure/factories/teacher.factory'
import { useAuthStore } from '@/presentation/store/auth.store'
import type { LiveSession } from '@/domain/entities/live-session.entity'
import { toast } from 'sonner'

export default function ManageLiveSessionsPage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming')
  const [sessions, setSessions] = useState<LiveSession[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [sessionToCancel, setSessionToCancel] = useState<LiveSession | null>(null)
  const [isCancelling, setIsCancelling] = useState(false)
  const user = useAuthStore(s => s.user)

  useEffect(() => {
    const fetchSessions = async () => {
      if (!user?.user_id) return
      try {
        const result = await getTeacherLiveSessionsUseCase.execute(user.user_id)
        setSessions(result.results || [])
      } catch (error) {
        console.error('Error fetching live sessions:', error)
        toast.error('Ocurrió un error al cargar las sesiones')
      } finally {
        setIsLoading(false)
      }
    }
    fetchSessions()
  }, [user?.user_id])

  const handleCancelSession = async () => {
    if (!sessionToCancel) return
    setIsCancelling(true)
    try {
      await cancelLiveSessionUseCase.execute(sessionToCancel.id)
      setSessions(prev => prev.map(s =>
        s.id === sessionToCancel.id ? { ...s, status: 'cancelled' } : s
      ))
      toast.success(`Sesión "${sessionToCancel.title}" cancelada`)
    } catch (error) {
      console.error('Error cancelling session:', error)
      toast.error(error instanceof Error ? error.message : 'Error al cancelar la sesión')
    } finally {
      setIsCancelling(false)
      setSessionToCancel(null)
    }
  }

  const upcomingSessions = sessions.filter(s => s.status === 'upcoming' || s.status === 'live')
  const pastSessions = sessions.filter(s => s.status === 'past' || s.status === 'cancelled')
  const displayedSessions = activeTab === 'upcoming' ? upcomingSessions : pastSessions

  return (
    <div className="animate-in fade-in duration-500">
      {/* Header Editorial */}
      <section className="border-b border-slate-900/10 dark:border-white/10 px-4 sm:px-8 md:px-12 py-10 md:py-20">
        <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-10">
          <div className="space-y-6 max-w-2xl">
            <div className="chip">
              <Video className="h-3.5 w-3.5 text-sky-500" />
              Live Streaming
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.05] text-slate-900 dark:text-white">
              Sesiones <br />
              <span className="text-sky-500">en Vivo.</span>
            </h1>
            <p className="text-base sm:text-lg leading-relaxed text-slate-600 dark:text-slate-300 max-w-lg">
              Programa y gestiona tus clases virtuales con integración directa de streaming y chat en tiempo real.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 shrink-0 w-full lg:w-auto">
            <div className="flex border border-slate-900/10 dark:border-white/10 p-1">
              <button
                onClick={() => setActiveTab('upcoming')}
                className={`flex-1 sm:flex-none px-4 sm:px-6 py-2 label-caps transition-colors text-xs sm:text-sm ${activeTab === 'upcoming' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
              >
                Próximas ({upcomingSessions.length})
              </button>
              <button
                onClick={() => setActiveTab('past')}
                className={`flex-1 sm:flex-none px-4 sm:px-6 py-2 label-caps transition-colors text-xs sm:text-sm ${activeTab === 'past' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
              >
                Historial
              </button>
            </div>
            <Button asChild size="lg" className="gap-2 group w-full sm:w-auto">
              <Link to="/teacher/live/new">
                <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform" />
                Programar
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Sessions Grid Editorial */}
      <section className="border-b border-slate-900/10 dark:border-white/10">
        <div className="grid gap-px bg-slate-900/10 dark:bg-white/10">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-80 bg-white dark:bg-slate-950 animate-pulse" />
              ))}
            </div>
          ) : displayedSessions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {displayedSessions.map((session) => (
                <div key={session.id} className={`group bg-white dark:bg-slate-950 p-6 sm:p-8 md:p-10 flex flex-col justify-between card-hover min-h-[320px] ${session.status === 'cancelled' ? 'opacity-50 grayscale' : ''}`}>
                  <div>
                    <div className="flex items-start justify-between mb-8">
                      <div className="flex h-12 w-12 items-center justify-center border border-slate-900/10 dark:border-white/10">
                        {session.status === 'live' ? (
                          <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                          </span>
                        ) : (
                          <Calendar className="h-5 w-5 text-sky-500" />
                        )}
                      </div>

                      {(session.status === 'upcoming' || session.status === 'live') && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="h-8 w-8 flex items-center justify-center border border-transparent hover:border-slate-900/10 dark:hover:border-white/10 transition-colors">
                              <MoreVertical className="h-4 w-4 text-slate-400" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="rounded-none border-slate-900 dark:border-white border-2">
                            <DropdownMenuItem
                              onClick={() => navigate(`/teacher/live/${session.id}/edit`)}
                              className="label-caps py-3 cursor-pointer"
                            >
                              <Edit2 className="mr-2 h-4 w-4" /> Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setSessionToCancel(session)}
                              className="label-caps py-3 text-red-600 cursor-pointer"
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Cancelar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>

                    <h3 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white leading-tight mb-4 group-hover:text-sky-500 transition-colors">
                      {session.title}
                    </h3>

                    <div className="space-y-2 mb-8">
                      <div className="flex items-center text-xs font-bold uppercase tracking-widest text-slate-400">
                        <Calendar className="h-3.5 w-3.5 mr-2" />
                        {new Date(session.scheduled_date).toLocaleDateString('es-ES', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long'
                        })}
                      </div>
                      <div className="flex items-center text-xs font-bold uppercase tracking-widest text-slate-400">
                        <Clock className="h-3.5 w-3.5 mr-2" />
                        {new Date(session.scheduled_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        <span className="mx-2 opacity-30">|</span>
                        {session.duration_minutes} MIN
                      </div>
                      <div className="flex items-center text-xs font-bold uppercase tracking-widest text-slate-400">
                        <Users className="h-3.5 w-3.5 mr-2" />
                        {session.enrolled_count || 0} INSCRITOS
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {session.status === 'live' ? (
                      <Button
                        asChild
                        variant="default"
                        className="w-full h-12 rounded-none bg-rose-500 hover:bg-rose-600 text-white font-black"
                      >
                        <a href={session.join_url || '#'} target="_blank" rel="noopener noreferrer">
                          UNIRSE AHORA
                        </a>
                      </Button>
                    ) : session.status === 'upcoming' ? (
                      <Button
                        asChild
                        variant="outline"
                        className="w-full h-12 rounded-none border-2 border-slate-900 dark:border-white font-black hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-slate-950 transition-all"
                      >
                        <Link to={`/live/${session.id}`}>INICIAR SALA</Link>
                      </Button>
                    ) : (
                      <div className="w-full h-12 flex items-center justify-center border border-slate-900/10 dark:border-white/10 label-caps text-slate-400">
                        {session.status === 'cancelled' ? 'SESIÓN CANCELADA' : 'SESIÓN FINALIZADA'}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-950 py-40 px-10 text-center border-l border-slate-900/10 dark:border-white/10">
              <div className="flex h-20 w-20 items-center justify-center border border-slate-900/10 dark:border-white/10 mx-auto mb-8">
                <Video className="h-8 w-8 text-slate-200 dark:text-slate-800" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tighter">Vacío.</h3>
              <p className="label-caps text-slate-400 dark:text-slate-500 mb-8 max-w-xs mx-auto">
                {activeTab === 'upcoming'
                  ? 'No tienes sesiones programadas para el futuro.'
                  : 'Tu historial de clases en vivo está vacío.'}
              </p>
              {activeTab === 'upcoming' && (
                <Button asChild variant="outline" className="rounded-none border-slate-900 dark:border-white border-2 px-8">
                  <Link to="/teacher/live/new">PROGRAMAR PRIMERA SESIÓN</Link>
                </Button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={!!sessionToCancel} onOpenChange={(open) => !open && !isCancelling && setSessionToCancel(null)}>
        <AlertDialogContent className="rounded-none border-4 border-slate-900 dark:border-white bg-white dark:bg-slate-950 max-w-md">
          <AlertDialogHeader>
            <div className="flex h-16 w-16 items-center justify-center border border-slate-900/10 dark:border-white/10 mb-6">
              <AlertCircle className="h-8 w-8 text-rose-500" />
            </div>
            <AlertDialogTitle className="text-3xl font-black tracking-tighter uppercase leading-none text-slate-900 dark:text-white mb-4">
              ¿Cancelar <br /> Sesión?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base text-slate-600 dark:text-slate-400 leading-relaxed">
              Estás a punto de cancelar la sesión <span className="font-bold text-slate-900 dark:text-white underline decoration-rose-500 decoration-2">"{sessionToCancel?.title}"</span>. Esta acción no se puede deshacer y notificará a todos los estudiantes inscritos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-10 sm:justify-start gap-4">
            <AlertDialogCancel disabled={isCancelling} className="rounded-none border-2 border-slate-900 dark:border-white h-12 px-8 label-caps">
              Mantener
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={isCancelling}
              onClick={handleCancelSession}
              className="bg-rose-500 hover:bg-rose-600 text-white rounded-none h-12 px-8 label-caps border-none"
            >
              {isCancelling ? 'PROCESANDO...' : 'SÍ, CANCELAR'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
