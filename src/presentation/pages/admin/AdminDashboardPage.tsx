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
import { Card, CardContent } from '@/presentation/components/ui/card'
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
      </div>

      {/* ===== STATS ROW ===== */}
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
        {stats.map((stat, i) => (
          <Link key={i} to={stat.to || '#'}>
            <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group">
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`${stat.bg} ${stat.color} p-2.5 rounded-xl shrink-0 transition-transform group-hover:scale-110`}>
                  <stat.icon size={18} />
                </div>
                <div className="min-w-0">
                  <p className="text-xl font-black text-slate-900 leading-none mb-0.5">{stat.value}</p>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block truncate">{stat.label}</span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* ===== TWO COLUMN LAYOUT ===== */}
      <div className="grid gap-8 lg:grid-cols-5">
        {/* ===== QUICK LINKS ===== */}
        <div className="lg:col-span-3 space-y-6">
          <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
            <LayoutGrid className="h-5 w-5 text-sky-500" />
            Gestión Rápida
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {shortcutGroups.map((group) => (
              <div key={group.title} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-5 py-3 border-b border-slate-50">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{group.title}</span>
                </div>
                <div className="p-2 space-y-0.5">
                  {group.items.map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 rounded-lg bg-slate-50 text-slate-400 group-hover:bg-sky-50 group-hover:text-sky-500 transition-colors">
                          <item.icon size={15} />
                        </div>
                        <span className="text-sm font-bold text-slate-700 group-hover:text-sky-600 transition-colors">{item.label}</span>
                      </div>
                      <span className="text-[9px] font-bold text-slate-300 uppercase tracking-wider">{item.badge}</span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ===== SIDEBAR ===== */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats Card */}
          <div>
            <h2 className="text-lg font-black text-slate-800 flex items-center gap-2 mb-4">
              <Activity className="h-5 w-5 text-sky-500" />
              Indicadores
            </h2>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm divide-y divide-slate-50">
              {stats.map((stat, i) => (
                <div key={i} className="flex items-center justify-between px-5 py-3 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`${stat.bg} ${stat.color} p-2 rounded-lg`}>
                      <stat.icon size={15} />
                    </div>
                    <span className="text-sm font-bold text-slate-600">{stat.label}</span>
                  </div>
                  <span className="font-black text-slate-900">{stat.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Systems Card */}
          <Card className="border-none shadow-lg bg-gradient-to-br from-indigo-600 to-blue-700 text-white rounded-2xl overflow-hidden relative group">
            <Activity className="absolute -right-6 -bottom-6 h-24 w-24 text-white/10 group-hover:scale-125 transition-transform duration-700" />
            <CardContent className="p-6 relative z-10">
              <h3 className="text-lg font-black mb-2">Sistemas</h3>
              <p className="text-indigo-100/80 text-sm font-medium mb-5 leading-relaxed">
                Infraestructura operando al <span className="text-white font-bold">99.9%</span>
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.6)] animate-pulse" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-indigo-200">En línea</span>
                </div>
                <Button variant="ghost" size="sm" className="h-8 px-3 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold text-[10px] uppercase">
                  Logs
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}