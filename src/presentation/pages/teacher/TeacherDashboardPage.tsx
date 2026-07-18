import { useState, useEffect } from 'react'
import {
  Users,
  Video,
  BookOpen,
  MessageSquare,
  Plus,
  Sparkles,
  Trophy
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/presentation/components/ui/card'
import { Button } from '@/presentation/components/ui/button'
import { Skeleton } from '@/presentation/components/ui/skeleton'
import { Link } from 'react-router-dom'
import { getTeacherDashboardUseCase } from '@/infrastructure/factories/dashboard.factory'
import type { TeacherDashboardData } from '@/domain/ports/dashboard.repository'

export default function TeacherDashboardPage() {
  const [data, setData] = useState<TeacherDashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        const result = await getTeacherDashboardUseCase.execute()
        setData(result)
      } catch (err: any) {
        console.error('Error fetching teacher dashboard data:', err)
        setError(err.message || 'No se pudo cargar la información del panel.')
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  if (isLoading) {
    return (
      <div className="space-y-8 animate-in fade-in duration-700">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-40 w-full rounded-[2rem]" />
          ))}
        </div>
        <div className="grid gap-8 lg:grid-cols-3">
          <Skeleton className="h-96 lg:col-span-2 rounded-[2.5rem]" />
          <Skeleton className="h-96 rounded-[2.5rem]" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-red-500 font-bold">{error}</p>
      </div>
    )
  }

  const teacherStats = [
    { label: 'Mis Estudiantes', value: data?.students ?? 0, sub: 'Activos hoy', icon: Users, color: 'text-sky-600', bg: 'bg-sky-50 dark:bg-sky-900/20' },
    { label: 'Aulas Activas', value: data?.classrooms ?? 0, sub: '3 niveles MCER', icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { label: 'Recursos', value: data?.resources ?? 0, sub: 'Material didáctico', icon: MessageSquare, color: 'text-sky-500', bg: 'bg-sky-50 dark:bg-sky-900/20' },
    { label: 'Certificados', value: data?.certificates ?? 0, sub: 'Emitidos', icon: Trophy, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
  ]

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">Panel del Profesor</h1>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-1">Gestiona tus clases y motiva a tus alumnos</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="h-12 rounded-2xl font-bold border-2 px-6">Ver Horario</Button>
          <Button asChild className="h-12 rounded-2xl font-black bg-sky-600 hover:bg-sky-700 shadow-xl shadow-sky-500/20 px-6">
            <Link to="/teacher/live">
              <Plus className="mr-2 h-5 w-5" /> Nueva Sesión Live
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {teacherStats.map((stat, i) => (
          <Card key={i} className="border-none shadow-xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden group hover:-translate-y-1 transition-all">
            <CardContent className="p-6">
              <div className={`${stat.bg} ${stat.color} p-3 rounded-2xl w-fit mb-4`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <p className="text-3xl font-black text-slate-900 dark:text-white leading-tight">{stat.value}</p>
              <div className="flex flex-col mt-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{stat.label}</span>
                <span className="text-xs font-bold text-slate-500 mt-1">{stat.sub}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content: Upcoming Sessions */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="border-none shadow-2xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden">
            <CardHeader className="p-8 pb-4">
              <CardTitle className="text-2xl font-black">Próximas Sesiones en Vivo</CardTitle>
              <CardDescription className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">Tus clases programadas para hoy y mañana</CardDescription>
            </CardHeader>
            <CardContent className="p-8 pt-0 space-y-4">
              {/* Sesiones dinámicas irían aquí */}
              <div className="text-center py-10 border-2 border-dashed rounded-3xl border-slate-100">
                <Video className="h-10 w-10 text-slate-200 mx-auto mb-3" />
                <p className="text-sm font-black text-slate-400 uppercase tracking-widest">No hay sesiones programadas</p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions for Teachers */}
          <div className="grid sm:grid-cols-2 gap-4">
            <Link to="/classrooms" className="group">
              <div className="p-6 rounded-[2rem] bg-sky-600 text-white shadow-xl shadow-sky-500/20 hover:scale-[1.02] transition-all">
                <Users className="h-8 w-8 mb-4 opacity-50" />
                <h4 className="text-xl font-black mb-1">Mis Aulas</h4>
                <p className="text-sky-100/70 text-xs font-bold">Ver y gestionar alumnos</p>
              </div>
            </Link>
            <Link to="/forum" className="group">
              <div className="p-6 rounded-[2rem] bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/30 hover:border-sky-500/50 transition-all">
                <MessageSquare className="h-8 w-8 mb-4 text-sky-600" />
                <h4 className="text-xl font-black text-slate-900 dark:text-white mb-1">Moderación</h4>
                <p className="text-slate-400 text-xs font-bold">4 hilos nuevos hoy</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Sidebar: Live Activity Monitoring */}
        <aside className="space-y-6">
          <Card className="border-none shadow-2xl shadow-slate-200/50 dark:shadow-none bg-[#0F0E1A] rounded-[2.5rem] overflow-hidden relative">
             <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/10 rounded-full blur-3xl" />
             <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl" />
             <CardHeader className="p-8 pb-4 relative z-10">
               <div className="flex items-center gap-3">
                 <CardTitle className="text-xl font-black text-white">Live Activity</CardTitle>
                 <span className="relative flex h-3 w-3">
                   <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                   <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                 </span>
               </div>
               <CardDescription className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">Monitoreo en tiempo real</CardDescription>
             </CardHeader>
             <CardContent className="p-8 pt-0 space-y-4 relative z-10">
                <div className="space-y-3">
                  {/* Mock Activity Logs */}
                  <div className="p-3 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
                    <p className="text-[10px] font-black text-sky-400 uppercase tracking-widest mb-1">CURSO Completado</p>
                    <p className="text-sm font-medium text-slate-200">Ana Silva ha finalizado el Módulo 1 de Inglés B2</p>
                    <p className="text-xs font-bold text-slate-500 mt-2">Hace 2 min</p>
                  </div>
                  <div className="p-3 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
                    <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">NUEVO ALUMNO</p>
                    <p className="text-sm font-medium text-slate-200">Carlos Ruiz se ha unido al aula "Grupo Mañana"</p>
                    <p className="text-xs font-bold text-slate-500 mt-2">Hace 5 min</p>
                  </div>
                  <div className="p-3 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
                    <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest mb-1">Duda en Foro</p>
                    <p className="text-sm font-medium text-slate-200">Maria José preguntó sobre verbos irregulares</p>
                    <p className="text-xs font-bold text-slate-500 mt-2">Hace 12 min</p>
                  </div>
                </div>
             </CardContent>
          </Card>

          <Card className="border-none bg-amber-500 text-slate-900 rounded-[2.5rem] p-8">
            <Sparkles className="h-8 w-8 mb-4 opacity-50" />
            <h3 className="text-xl font-black mb-2">Tip del Día</h3>
            <p className="text-amber-900/70 text-sm font-bold">Las sesiones con feedback visual tienen un 40% más de retención.</p>
          </Card>
        </aside>
      </div>
    </div>
  )
}
