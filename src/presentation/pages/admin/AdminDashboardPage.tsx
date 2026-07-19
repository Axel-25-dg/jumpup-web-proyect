import { useState, useEffect } from 'react'
import {
  Users,
  BookOpen,
  Package,
  Tags,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  Plus,
  ArrowRight,
  ShieldCheck,
  Activity,
  Zap,
  LayoutGrid,
  Bell,
  Award,
  MessageSquare,
  Video,
} from 'lucide-react'
import { Button } from '@/presentation/components/ui/button'
import { Skeleton } from '@/presentation/components/ui/skeleton'
import { Link } from 'react-router-dom'
import { getAdminDashboardUseCase } from '@/infrastructure/factories/dashboard.factory'
import type { AdminDashboardData } from '@/domain/ports/dashboard.repository'

export default function AdminDashboardPage() {
  const [data, setData] = useState<AdminDashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        const result = await getAdminDashboardUseCase.execute()
        setData(result)
      } catch (err: any) {
        console.error('Error fetching admin dashboard data:', err)
        setError(err.message || 'No se pudo cargar la información del panel.')
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <Skeleton className="h-[220px] w-full" />
        <div className="grid grid-cols-2 lg:grid-cols-4 border-l border-slate-900/10 dark:border-white/10">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-40 w-full border-b border-r border-slate-900/10 dark:border-white/10" />)}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-10 border border-dashed border-slate-900/10 dark:border-white/10">
        <div className="flex h-16 w-16 items-center justify-center border border-rose-200 dark:border-rose-900/30 mb-6">
          <ShieldCheck className="h-6 w-6 text-rose-500" />
        </div>
        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{error}</p>
      </div>
    )
  }

  const stats = [
    { label: 'Total Usuarios', value: data?.users ?? 0, trend: '+12%', up: true, icon: Users },
    { label: 'Nuevos Registros', value: '24', trend: '+18.2%', up: true, icon: Zap },
    { label: 'Aulas', value: data?.classrooms ?? 0, trend: '-5%', up: false, icon: Package },
    { label: 'Cursos Activos', value: data?.courses ?? 0, trend: '+2%', up: true, icon: BookOpen },
  ]

  const navItems = [
    { to: '/admin/users', label: 'Usuarios', icon: Users },
    { to: '/admin/classrooms', label: 'Aulas Virtuales', icon: Users },
    { to: '/admin/certificates', label: 'Certificados', icon: Award },
    { to: '/admin/management/courses', label: 'Cursos', icon: BookOpen },
    { to: '/admin/management/modules', label: 'Módulos', icon: BookOpen },
    { to: '/admin/management/lessons', label: 'Lecciones', icon: BookOpen },
    { to: '/admin/management/exercises', label: 'Ejercicios', icon: BookOpen },
    { to: '/admin/announcements', label: 'Anuncios', icon: Bell },
    { to: '/admin/forum-categories', label: 'Foro Categorías', icon: MessageSquare },
    { to: '/admin/resources', label: 'Recursos', icon: BookOpen },
    { to: '/admin/live-sessions', label: 'Sesiones en Vivo', icon: Video },
    { to: '/admin/management/languages', label: 'Idiomas', icon: Tags },
  ]

  const recentUsers = [
    { name: 'Ana Garcia', email: 'ana@example.com', role: 'Estudiante', time: 'Hace 5 min' },
    { name: 'Carlos Ruiz', email: 'carlos@example.com', role: 'Estudiante', time: 'Hace 12 min' },
    { name: 'Elena Beltran', email: 'elena@example.com', role: 'Profesor', time: 'Hace 45 min' },
    { name: 'Juan Perez', email: 'juan@example.com', role: 'Estudiante', time: 'Hace 1h' },
  ]

  return (
    <div className="animate-in fade-in duration-500">
      {/* HERO — editorial */}
      <section className="border-b border-slate-900/10 dark:border-white/10 px-8 md:px-12 py-14 md:py-20">
        <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-10">
          <div className="space-y-6">
            <div className="chip">
              <ShieldCheck className="h-3.5 w-3.5 text-sky-500" />
              Acceso Administrativo
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.05] text-slate-900 dark:text-white">
              Central de <span className="text-sky-500">Control</span>.
            </h1>
            <p className="text-base sm:text-lg leading-relaxed text-slate-600 dark:text-slate-300 max-w-lg">
              Monitorea el crecimiento, gestiona usuarios y supervisa las operaciones de JumpUp en tiempo real.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Button variant="outline" size="lg" className="gap-2">
              <Bell className="h-4 w-4" />
              Notificaciones
            </Button>
            <Button asChild size="lg" className="gap-2 group">
              <Link to="/admin/management/courses/new">
                <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform" />
                Nuevo Curso
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* STATS GRID — editorial */}
      <section className="border-b border-slate-900/10 dark:border-white/10">
        <div className="grid grid-cols-2 lg:grid-cols-4 border-l border-slate-900/10 dark:border-white/10">
          {stats.map((stat, i) => (
            <div key={i} className="p-8 md:p-10 border-b border-r border-slate-900/10 dark:border-white/10 group card-hover">
              <div className="flex items-start justify-between mb-6">
                <div className="flex h-12 w-12 items-center justify-center border border-slate-900/10 dark:border-white/10">
                  <stat.icon className="h-5 w-5 text-sky-500" />
                </div>
                <div className={`flex items-center gap-1 label-caps ${stat.up ? 'text-emerald-600' : 'text-rose-500'}`}>
                  {stat.up ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                  {stat.trend}
                </div>
              </div>
              <p className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white">{stat.value}</p>
              <p className="mt-2 label-caps text-slate-500 dark:text-slate-400">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* MAIN CONTENT */}
      <div className="grid gap-px lg:grid-cols-3 border-b border-slate-900/10 dark:border-white/10">

        {/* RECENT USERS */}
        <div className="lg:col-span-2 border-r border-slate-900/10 dark:border-white/10">
          <div className="flex items-center justify-between px-8 md:px-10 py-6 border-b border-slate-900/10 dark:border-white/10">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Nuevos Usuarios</h2>
              <p className="label-caps text-slate-400 dark:text-slate-500 mt-1">Actividad de registro hoy</p>
            </div>
            <div className="relative w-64 hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar en el sistema..."
                className="w-full pl-10 pr-4 h-10 text-sm border border-slate-900/10 dark:border-white/10 bg-transparent focus:outline-none focus:border-sky-500 dark:focus:border-sky-500 text-slate-900 dark:text-white placeholder:text-slate-400"
              />
            </div>
          </div>

          <div className="divide-y divide-slate-900/5 dark:divide-white/5">
            {recentUsers.map((user, i) => (
              <div key={i} className="flex items-center gap-5 px-8 md:px-10 py-5 card-hover">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-slate-900/10 dark:border-white/10 font-bold text-sm text-sky-500">
                  {user.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{user.name}</p>
                  <p className="label-micro text-slate-400 dark:text-slate-500">{user.email}</p>
                </div>
                <div className="hidden sm:flex items-center gap-6">
                  <span className="label-caps text-slate-400 dark:text-slate-500">{user.role}</span>
                  <span className="label-micro text-slate-300 dark:text-slate-600">{user.time}</span>
                  <ArrowUpRight className="h-4 w-4 text-slate-300 dark:text-slate-600" />
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-900/10 dark:border-white/10 p-6">
            <Button variant="ghost" className="w-full gap-2 group" asChild>
              <Link to="/admin/users">
                Ver directorio completo
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
        </div>

        {/* NAV SHORTCUTS */}
        <aside>
          <div className="flex items-center justify-between px-8 py-6 border-b border-slate-900/10 dark:border-white/10">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Gestión</h2>
              <p className="label-caps text-slate-400 dark:text-slate-500 mt-1">Módulos del sistema</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center border border-slate-900/10 dark:border-white/10">
              <LayoutGrid className="h-4 w-4 text-sky-500" />
            </div>
          </div>

          <div className="divide-y divide-slate-900/5 dark:divide-white/5">
            {navItems.map((item, i) => (
              <Link key={i} to={item.to} className="flex items-center gap-4 px-8 py-4 card-hover group">
                <item.icon className="h-4 w-4 text-sky-500 shrink-0" />
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex-1">{item.label}</span>
                <ArrowRight className="h-4 w-4 text-slate-300 dark:text-slate-600 group-hover:translate-x-1 transition-transform" />
              </Link>
            ))}
          </div>

          {/* System status */}
          <div className="border-t border-slate-900/10 dark:border-white/10 px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="label-caps text-slate-900 dark:text-white">Sistemas</p>
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 bg-emerald-500" />
                  </span>
                  <span className="label-micro text-emerald-600">99.9% operativo</span>
                </div>
              </div>
              <div className="flex h-10 w-10 items-center justify-center border border-slate-900/10 dark:border-white/10">
                <Activity className="h-4 w-4 text-sky-500" />
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}