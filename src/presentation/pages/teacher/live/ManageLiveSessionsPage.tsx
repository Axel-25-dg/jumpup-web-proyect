import { useState, useEffect } from 'react'
import {
  Video,
  Plus,
  Calendar,
  Clock,
  Users,
  PlayCircle,
  MoreVertical,
  Edit2,
  Trash2
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
import { getTeacherLiveSessionsUseCase } from '@/infrastructure/factories/teacher.factory'
import { useAuthStore } from '@/presentation/store/auth.store'
import type { LiveSession } from '@/domain/entities/live-session.entity'

export default function ManageLiveSessionsPage() {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming')
  const [sessions, setSessions] = useState<LiveSession[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const user = useAuthStore(s => s.user)

  useEffect(() => {
    const fetchSessions = async () => {
      if (!user?.user_id) return
      try {
        const result = await getTeacherLiveSessionsUseCase.execute(user.user_id)
        setSessions(result.results || [])
      } catch (error) {
        console.error('Error fetching live sessions:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchSessions()
  }, [user?.user_id])

  const upcomingSessions = sessions.filter(s => s.status === 'upcoming' || s.status === 'live')
  const pastSessions = sessions.filter(s => s.status === 'past')
  const displayedSessions = activeTab === 'upcoming' ? upcomingSessions : pastSessions

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">Sesiones en Vivo</h1>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-1">Programa y gestiona tus clases virtuales</p>
        </div>
        <div className="flex gap-3">
          <Button className="h-12 rounded-2xl font-black bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-500/20 px-6">
            <Plus className="mr-2 h-5 w-5" /> Programar Sesión
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl w-fit">
        <button 
          onClick={() => setActiveTab('upcoming')}
          className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'upcoming' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Próximas Sesiones
        </button>
        <button 
          onClick={() => setActiveTab('past')}
          className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'past' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Historial
        </button>
      </div>

      <div className="grid gap-6">
        {isLoading ? (
          <div className="space-y-4">
             {[1,2].map(i => (
               <Skeleton key={i} className="h-32 w-full rounded-[2rem]" />
             ))}
          </div>
        ) : displayedSessions.length > 0 ? (
          displayedSessions.map((session) => (
            <Card key={session.id} className={`border-none shadow-xl ${session.status === 'live' ? 'shadow-rose-500/10 ring-2 ring-rose-500/20' : 'shadow-slate-200/50'} bg-white rounded-[2rem] overflow-hidden`}>
              <CardContent className="p-6 md:p-8 flex flex-col md:flex-row gap-6 items-center">
                {/* Date/Time Block */}
                <div className="flex flex-col items-center justify-center min-w-[120px] p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className={`text-xs font-black uppercase tracking-widest ${session.status === 'live' ? 'text-rose-500 animate-pulse' : 'text-slate-400'}`}>
                    {session.status === 'live' ? 'EN VIVO' : new Date(session.scheduled_date).toLocaleDateString()}
                  </span>
                  <span className="text-2xl font-black text-slate-900 mt-1">
                    {new Date(session.scheduled_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
  
                {/* Info */}
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-xl font-black text-slate-900 mb-2">{session.title}</h3>
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
                    <Button className="flex-1 md:flex-none h-12 rounded-xl font-black bg-rose-500 hover:bg-rose-600 shadow-lg shadow-rose-500/20">
                      <Video className="mr-2 h-5 w-5" /> Entrar a Sala
                    </Button>
                  ) : (
                    <Button variant="outline" className="flex-1 md:flex-none h-12 rounded-xl font-bold text-indigo-600 border-indigo-200 hover:bg-indigo-50">
                      <PlayCircle className="mr-2 h-5 w-5" /> Iniciar Ahora
                    </Button>
                  )}
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-12 w-12 rounded-xl shrink-0">
                        <MoreVertical className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent  className="w-48 rounded-2xl">
                      <DropdownMenuItem className="font-bold py-3 cursor-pointer">
                        <Edit2 className="mr-2 h-4 w-4" /> Editar Detalles
                      </DropdownMenuItem>
                      <DropdownMenuItem className="font-bold py-3 text-red-600 cursor-pointer focus:bg-red-50 focus:text-red-700">
                        <Trash2 className="mr-2 h-4 w-4" /> Cancelar Sesión
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="py-20 text-center">
             <Calendar className="h-12 w-12 text-slate-200 mx-auto mb-4" />
             <h3 className="text-lg font-black text-slate-900">No hay sesiones</h3>
             <p className="text-slate-500 font-medium">No se encontraron sesiones para esta categoría.</p>
          </div>
        )}
      </div>
    </div>
  )
}
