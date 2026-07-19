import { useState, useEffect } from 'react'
import {
  Users,
  BookOpen,
  Tags,
  Plus,
  ShieldCheck,
  Activity,
  LayoutGrid,
  Award,
  MessageSquare,
  Video,
  ShoppingBag,
  Receipt,
  GraduationCap,
  DollarSign,
  UserCheck,
  FileText,
  Layers,
  Puzzle,
  Megaphone,
  FolderOpen,
  Building2,
} from 'lucide-react'
import { Button } from '@/presentation/components/ui/button'
import { Skeleton } from '@/presentation/components/ui/skeleton'
import { Link } from 'react-router-dom'
import { getAdminDashboardUseCase } from '@/infrastructure/factories/dashboard.factory'
import type { AdminDashboardData } from '@/domain/ports/dashboard.repository'

type Stat = {
  label: string
  value: number
  icon: any
  color: string
  bg: string
  to?: string
}

type Shortcut = {
  to: string
  label: string
  icon: any
  badge: string
}

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
      <div className="space-y-8 animate-in fade-in duration-700">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-4 w-80" />
          </div>
          <Skeleton className="h-12 w-40 rounded-2xl" />
        </div>
        <Skeleton className="h-32 w-full rounded-3xl" />
        <div className="grid gap-6 lg:grid-cols-3">
          <Skeleton className="h-80 rounded-3xl lg:col-span-2" />
          <Skeleton className="h-80 rounded-3xl" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <ShieldCheck className="h-16 w-16 text-red-300 mx-auto mb-4" />
          <p className="text-red-500 font-bold text-lg">{error}</p>
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            className="mt-4 rounded-xl"
          >
            Reintentar
          </Button>
        </div>
      </div>
    )
  }

  const stats: Stat[] = [
    { label: 'Usuarios', value: data?.users ?? 0, icon: Users, color: 'text-sky-600', bg: 'bg-sky-50', to: '/admin/users' },
    { label: 'Profesores', value: data?.teachers ?? 0, icon: UserCheck, color: 'text-indigo-600', bg: 'bg-indigo-50', to: '/admin/users' },
    { label: 'Estudiantes', value: data?.students ?? 0, icon: GraduationCap, color: 'text-emerald-600', bg: 'bg-emerald-50', to: '/admin/users' },
    { label: 'Cursos', value: data?.courses ?? 0, icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-50', to: '/admin/management/courses' },
    { label: 'Aulas', value: data?.classrooms ?? 0, icon: Building2, color: 'text-amber-600', bg: 'bg-amber-50', to: '/admin/classrooms' },
    { label: 'Ventas', value: data?.ventas_directas ?? 0, icon: DollarSign, color: 'text-rose-600', bg: 'bg-rose-50', to: '/admin/ordenes-compra' },
    { label: 'Certificados', value: data?.certificates ?? 0, icon: Award, color: 'text-purple-600', bg: 'bg-purple-50', to: '/admin/certificates' },
  ]

  const shortcutGroups: { title: string; items: Shortcut[] }[] = [
    {
      title: 'Académico',
      items: [
        { to: '/admin/management/courses', label: 'Cursos', icon: BookOpen, badge: 'CRUD' },
        { to: '/admin/management/modules', label: 'Módulos', icon: Layers, badge: 'CRUD' },
        { to: '/admin/management/lessons', label: 'Lecciones', icon: FileText, badge: 'CRUD' },
        { to: '/admin/management/exercises', label: 'Ejercicios', icon: Puzzle, badge: 'CRUD' },
        { to: '/admin/management/languages', label: 'Idiomas', icon: Tags, badge: 'CRUD' },
      ],
    },
    {
      title: 'Usuarios',
      items: [
        { to: '/admin/users', label: 'Usuarios', icon: Users, badge: 'RBAC' },
        { to: '/admin/classrooms', label: 'Aulas', icon: Building2, badge: 'CRUD' },
        { to: '/admin/certificates', label: 'Certificados', icon: Award, badge: 'Emitir' },
      ],
    },
    {
      title: 'E-Commerce',
      items: [
        { to: '/admin/catalogo', label: 'Catálogo', icon: ShoppingBag, badge: 'CRUD' },
        { to: '/admin/ordenes-compra', label: 'Órdenes', icon: Receipt, badge: 'Read' },
      ],
    },
    {
      title: 'Comunicación',
      items: [
        { to: '/admin/announcements', label: 'Anuncios', icon: Megaphone, badge: 'CRUD' },
        { to: '/admin/forum-categories', label: 'Foro', icon: MessageSquare, badge: 'CRUD' },
        { to: '/admin/resources', label: 'Recursos', icon: FolderOpen, badge: 'CRUD' },
        { to: '/admin/live-sessions', label: 'Sesiones', icon: Video, badge: 'CRUD' },
      ],
    },
  ]

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-1000">
      {/* ===== HEADER ===== */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sky-600 mb-1">
            <ShieldCheck size={16} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Acceso Administrativo</span>
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-slate-900">Panel de Control</h1>
          <p className="text-slate-500 font-medium max-w-lg">
            {data?.users ?? 0} usuarios · {data?.courses ?? 0} cursos · {data?.ventas_directas ?? 0} ventas
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button asChild size="lg" className="rounded-xl h-12 bg-sky-600 hover:bg-sky-700 font-black shadow-lg shadow-sky-200 px-6">
            <Link to="/admin/management/courses/new">
              <Plus className="mr-2 h-5 w-5" />
              Nuevo Curso
            </Link>
          </Button>
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