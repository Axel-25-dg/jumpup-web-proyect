import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Video,
  Plus,
  Calendar,
  Clock,
  Users,
  PlayCircle,
  MoreVertical,
  Edit2,
  Trash2,
  AlertCircle
} from 'lucide-react'
import { Card, CardContent } from '@/presentation/components/ui/card'
import { Button } from '@/presentation/components/ui/button'
import { Skeleton } from '@/presentation/components/ui/skeleton'
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
    } catch (error: any) {
      console.error('Error cancelling session:', error)
      toast.error(error?.detail || 'Error al cancelar la sesión')
    } finally {
      setIsCancelling(false)
      setSessionToCancel(null)
    }
  }

  const upcomingSessions = sessions.filter(s => s.status === 'upcoming' || s.status === 'live')
  const pastSessions = sessions.filter(s => s.status === 'past' || s.status === 'cancelled')
  const displayedSessions = activeTab === 'upcoming' ? upcomingSessions : pastSessions

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">Sesiones en Vivo</h1>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-1">Programa y gestiona tus clases virtuales</p>
        </div>
        <Button
          asChild
          className="h-12 rounded-2xl font-black bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-500/20 px-6"
        >
          <Link to="/teacher/live/new">
            <Plus className="mr-2 h-5 w-5" /> Programar Sesión
          </Link>
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'upcoming' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
        >
          Próximas Sesiones
          {upcomingSessions.length > 0 && (
            <span className="ml-2 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-xs font-black px-2 py-0.5 rounded-full">
              {upcomingSessions.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('past')}
          className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'past' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
        >
          Historial
        </button>
      </div>

      <div className="grid gap-6">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2].map(i => (
              <Skeleton key={i} className="h-32 w-full rounded-[2rem]" />
            ))}
          </div>
        ) : displayedSessions.length > 0 ? (
          displayedSessions.map((session) => (
            <Card key={session.id} className={`border-none shadow-xl ${session.status === 'live' ? 'shadow-rose-500/10 ring-2 ring-rose-500/20' : session.status === 'cancelled' ? 'opacity-60' : 'shadow-slate-200/50 dark:shadow-none'} bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden`}>
              <CardContent className="p-6 md:p-8 flex flex-col md:flex-row gap-6 items-center">
                {/* Date/Time Block */}
                <div className="flex flex-col items-center justify-center min-w-[120px] p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <span className={`text-xs font-black uppercase tracking-widest ${session.status === 'live' ? 'text-rose-500 animate-pulse' : session.status === 'cancelled' ? 'text-slate-400' : 'text-slate-400 dark:text-slate-500'}`}>
                    {session.status === 'live' ? 'EN VIVO' : session.status === 'cancelled' ? 'CANCELADA' : new Date(session.scheduled_date).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}
                  </span>
                  <span className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                    {new Date(session.scheduled_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {/* Info */}
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">{session.title}</h3>
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                    <div className="flex items-center text-sm font-bold text-slate-500">
                      <Clock className="h-4 w-4 mr-1.5" />
                      {session.duration_minutes} min
                    </div>
                    <div className="flex items-center text-sm font-bold text-slate-500">
                      <Users className="h-4 w-4 mr-1.5" />
                      {session.enrolled_count || 0} confirmados
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 w-full md:w-auto">
                  {session.status === 'live' ? (
                    <Button
                      asChild={!!session.join_url}
                      className="flex-1 md:flex-none h-12 rounded-xl font-black bg-rose-500 hover:bg-rose-600 shadow-lg shadow-rose-500/20 text-white"
                    >
                      {session.join_url ? (
                        <a href={session.join_url} target="_blank" rel="noopener noreferrer">
                          <Video className="mr-2 h-5 w-5" /> Entrar a Sala
                        </a>
                      ) : (
                        <span><Video className="mr-2 h-5 w-5" /> Entrar a Sala</span>
                      )}
                    </Button>
                  ) : session.status === 'upcoming' ? (
                    <Button
                      onClick={() => session.join_url && window.open(session.join_url, '_blank')}
                      variant="outline"
                      className="flex-1 md:flex-none h-12 rounded-xl font-bold text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                    >
                      <PlayCircle className="mr-2 h-5 w-5" /> Iniciar Ahora
                    </Button>
                  ) : null}

                  {(session.status === 'upcoming' || session.status === 'live') && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-12 w-12 rounded-xl shrink-0 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800">
                          <MoreVertical className="h-5 w-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-48 rounded-2xl bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 p-2">
                        <DropdownMenuItem
                          onClick={() => navigate(`/teacher/live/${session.id}/edit`)}
                          className="font-bold py-3 cursor-pointer text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl"
                        >
                          <Edit2 className="mr-2 h-4 w-4" /> Editar Detalles
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setSessionToCancel(session)}
                          className="font-bold py-3 text-red-600 dark:text-red-400 cursor-pointer focus:bg-red-50 dark:focus:bg-red-900/30 rounded-xl"
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Cancelar Sesión
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="py-20 text-center">
            <Calendar className="h-12 w-12 text-slate-200 dark:text-slate-700 mx-auto mb-4" />
            <h3 className="text-lg font-black text-slate-900 dark:text-white">No hay sesiones</h3>
            <p className="text-slate-500 font-medium mt-2">
              {activeTab === 'upcoming'
                ? 'No tienes sesiones próximas. ¡Programa tu primera clase!'
                : 'No tienes historial de sesiones.'}
            </p>
            {activeTab === 'upcoming' && (
              <Button asChild className="mt-4 bg-indigo-600 hover:bg-indigo-700 rounded-xl font-black">
                <Link to="/teacher/live/new">
                  <Plus className="mr-2 h-4 w-4" /> Programar Sesión
                </Link>
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={!!sessionToCancel} onOpenChange={(open) => !open && !isCancelling && setSessionToCancel(null)}>
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader>
            <div className="mx-auto bg-amber-100 dark:bg-amber-900/30 p-3 rounded-full w-fit mb-4">
              <AlertCircle className="h-8 w-8 text-amber-600 dark:text-amber-400" />
            </div>
            <AlertDialogTitle className="text-center text-2xl font-black">¿Cancelar sesión?</AlertDialogTitle>
            <AlertDialogDescription className="text-center font-medium">
              Se cancelará la sesión{' '}
              <span className="font-bold text-slate-900 dark:text-white">"{sessionToCancel?.title}"</span>.
              Los alumnos inscritos serán notificados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center gap-3 mt-6">
            <AlertDialogCancel disabled={isCancelling} className="rounded-xl h-12 px-6 font-bold">
              No, mantener
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={isCancelling}
              onClick={handleCancelSession}
              className="bg-amber-500 hover:bg-amber-600 text-white rounded-xl h-12 px-6 font-bold"
            >
              {isCancelling ? 'Cancelando...' : 'Sí, cancelar sesión'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
