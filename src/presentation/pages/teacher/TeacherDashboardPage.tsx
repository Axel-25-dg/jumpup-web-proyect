import { useState, useEffect } from 'react'
import {
  Users,
  Video,
  BookOpen,
  MessageSquare,
  Plus,
  Sparkles,
  Trophy,
  Calendar,
  ArrowRight,
  Lightbulb,
} from 'lucide-react'
import { Button } from '@/presentation/components/ui/button'
import { Link } from 'react-router-dom'
import { getTeacherDashboardUseCase } from '@/infrastructure/factories/dashboard.factory'
import { getTeacherLiveSessionsUseCase } from '@/infrastructure/factories/teacher.factory'
import type { TeacherDashboardData } from '@/domain/ports/dashboard.repository'
import type { LiveSession } from '@/domain/entities/live-session.entity'
import { useAuthStore } from '@/presentation/store/auth.store'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/presentation/components/ui/dialog'

export default function TeacherDashboardPage() {
  const [data, setData] = useState<TeacherDashboardData | null>(null)
  const [upcomingSessions, setUpcomingSessions] = useState<LiveSession[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const user = useAuthStore(s => s.user)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [dashboardResult, sessionsResult] = await Promise.all([
          getTeacherDashboardUseCase.execute(),
          user?.user_id ? getTeacherLiveSessionsUseCase.execute(user.user_id) : Promise.resolve({ results: [] })
        ])
        
        setData(dashboardResult)
        
        // Filter only upcoming sessions
        const upcoming = (sessionsResult.results || []).filter((s: LiveSession) => s.status === 'upcoming' || s.status === 'live')
        setUpcomingSessions(upcoming.slice(0, 3)) // Show max 3

      } catch (err) {
        console.error('Error fetching teacher dashboard data:', err)
        setError(err instanceof Error ? err.message : 'No se pudo cargar la información del panel.')
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [user?.user_id])

  if (isLoading) {
    return (
      <div className="p-12 space-y-12 animate-pulse">
        <div className="space-y-4">
          <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800" />
          <div className="h-12 w-1/2 bg-slate-200 dark:bg-slate-800" />
          <div className="h-6 w-1/3 bg-slate-200 dark:bg-slate-800" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-slate-200 dark:bg-slate-800 border border-slate-200 dark:border-slate-800">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-48 bg-white dark:bg-slate-950" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-12 border border-slate-900/10 dark:border-white/10 m-12">
        <p className="text-sm font-bold tracking-tight text-slate-900 dark:text-white mb-4 uppercase">{error}</p>
        <Button onClick={() => window.location.reload()} variant="outline" size="sm" className="rounded-none border-slate-900 dark:border-white">
          Reintentar
        </Button>
      </div>
    )
  }

  const teacherStats = [
    { label: 'Mis Estudiantes', value: data?.students ?? 0, sub: 'Activos hoy', icon: Users },
    { label: 'Aulas Activas', value: data?.classrooms ?? 0, sub: '3 niveles MCER', icon: BookOpen },
    { label: 'Recursos', value: data?.resources ?? 0, sub: 'Material didáctico', icon: MessageSquare },
    { label: 'Certificados', value: data?.certificates ?? 0, sub: 'Emitidos', icon: Trophy },
  ]

  return (
    <div className="animate-in fade-in duration-500">
      {/* HERO — editorial */}
      <section className="border-b border-slate-900/10 dark:border-white/10 px-8 md:px-12 py-14 md:py-20">
        <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-10">
          <div className="space-y-6 max-w-2xl">
            <div className="chip">
              <Sparkles className="h-3.5 w-3.5 text-sky-500" />
              Panel del Profesor
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.05] text-slate-900 dark:text-white">
              Hola, <span className="text-sky-500">{user?.username ?? 'Profesor'}</span>.
            </h1>
            <p className="text-base sm:text-lg leading-relaxed text-slate-600 dark:text-slate-300 max-w-lg">
              Gestiona tus clases, sesiones en vivo y motiva a tus alumnos a alcanzar nuevos niveles.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="lg" className="gap-2">
                  <Calendar className="h-4 w-4" />
                  Ver Horario
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Horario (Próximamente)</DialogTitle>
                  <DialogDescription>
                    La vista de calendario y gestión de horarios estará disponible en la próxima actualización.
                  </DialogDescription>
                </DialogHeader>
              </DialogContent>
            </Dialog>
            <Button asChild size="lg" className="gap-2 group">
              <Link to="/teacher/live/new">
                <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform" />
                Nueva Sesión
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* STATS GRID — editorial */}
      <section className="border-b border-slate-900/10 dark:border-white/10">
        <div className="grid grid-cols-2 lg:grid-cols-4 border-l border-slate-900/10 dark:border-white/10">
          {teacherStats.map((stat, i) => (
            <div key={i} className="p-8 md:p-10 border-b border-r border-slate-900/10 dark:border-white/10 card-hover">
              <div className="flex h-12 w-12 items-center justify-center border border-slate-900/10 dark:border-white/10 mb-6">
                <stat.icon className="h-5 w-5 text-sky-500" />
              </div>
              <p className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white">{stat.value}</p>
              <p className="mt-2 label-caps text-slate-500 dark:text-slate-400">{stat.label}</p>
              <p className="mt-1 text-sm text-slate-400 dark:text-slate-500">{stat.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* MAIN CONTENT */}
      <div className="grid gap-px lg:grid-cols-3 border-b border-slate-900/10 dark:border-white/10">

        {/* UPCOMING SESSIONS */}
        <div className="lg:col-span-2 border-r border-slate-900/10 dark:border-white/10">
          <div className="flex items-center justify-between px-8 md:px-10 py-6 border-b border-slate-900/10 dark:border-white/10">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Próximas Sesiones</h2>
              <p className="label-caps text-slate-400 dark:text-slate-500 mt-1">Clases programadas</p>
            </div>
            <Button asChild variant="ghost" size="sm" className="gap-1 group">
              <Link to="/teacher/live">
                Ver todas
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>

          <div className="divide-y divide-slate-900/5 dark:divide-white/5">
            {upcomingSessions.length > 0 ? (
              upcomingSessions.map(session => (
                <div key={session.id} className="flex items-center gap-5 px-8 md:px-10 py-5 card-hover">
                  <div className="flex h-12 w-12 items-center justify-center border border-slate-900/10 dark:border-white/10 shrink-0">
                    <Video className="h-5 w-5 text-sky-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-900 dark:text-white truncate text-sm tracking-tight">{session.title}</h4>
                    <p className="label-micro text-slate-400 dark:text-slate-500 mt-0.5">
                      {new Date(session.scheduled_date).toLocaleString()}
                    </p>
                  </div>
                  <Button asChild variant="outline" size="sm" className="shrink-0">
                    <Link to={`/teacher/live/${session.id}`}>Entrar</Link>
                  </Button>
                </div>
              ))
            ) : (
              <div className="text-center py-20 px-10">
                <div className="flex h-16 w-16 items-center justify-center border border-slate-900/10 dark:border-white/10 mx-auto mb-6">
                  <Video className="h-6 w-6 text-sky-500" />
                </div>
                <p className="label-caps text-slate-400 dark:text-slate-500 mb-4">No hay sesiones programadas</p>
                <Button asChild variant="outline" size="sm">
                  <Link to="/teacher/live/new">Programar una sesión</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Quick Access */}
          <div className="border-t border-slate-900/10 dark:border-white/10 grid grid-cols-2 border-l border-slate-900/10 dark:border-white/10">
            {[
              { to: '/teacher/classrooms', title: 'Mis Aulas', desc: 'Ver y gestionar alumnos', icon: Users },
              { to: '/teacher/courses', title: 'Mis Cursos', desc: 'Contenido educativo', icon: BookOpen },
            ].map((link, i) => (
              <Link key={i} to={link.to} className="group p-8 border-b border-r border-slate-900/10 dark:border-white/10 card-hover flex items-center gap-5">
                <div className="flex h-12 w-12 items-center justify-center border border-slate-900/10 dark:border-white/10">
                  <link.icon className="h-5 w-5 text-sky-500" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm tracking-tight">{link.title}</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{link.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* SIDEBAR */}
        <aside>
          {/* Live activity */}
          <div className="px-8 py-6 border-b border-slate-900/10 dark:border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Live Activity</h2>
                <p className="label-caps text-slate-400 dark:text-slate-500 mt-1">Monitoreo en tiempo real</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center border border-slate-900/10 dark:border-white/10">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 bg-emerald-500" />
                </span>
              </div>
            </div>
            <div className="py-10 text-center border border-dashed border-slate-900/10 dark:border-white/10">
              <p className="label-caps text-slate-400 dark:text-slate-500">Sin actividad reciente</p>
            </div>
          </div>

          {/* Tip del día */}
          <div className="px-8 py-6 border-b border-slate-900/10 dark:border-white/10">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center border border-slate-900/10 dark:border-white/10">
                <Lightbulb className="h-4 w-4 text-sky-500" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Tip del Día</h3>
                <p className="label-micro text-slate-400 dark:text-slate-500">Mejora tu enseñanza</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              Las sesiones con feedback visual tienen un <span className="font-bold text-slate-900 dark:text-white">40% más</span> de retención. Intenta usar la pizarra virtual en tu próxima clase.
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}
