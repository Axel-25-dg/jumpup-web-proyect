import { useState, useEffect } from 'react'
import {
  Users,
  BookOpen,
  ShoppingBag,
  Package,
  Tags,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  Plus,
  ArrowRight,
  ShieldCheck,
  Activity,
  Zap,
  LayoutGrid,
  Bell
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/presentation/components/ui/card'
import { Button } from '@/presentation/components/ui/button'
import { Badge } from '@/presentation/components/ui/badge'
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
      <div className="space-y-8 animate-in fade-in duration-700">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-40 w-full rounded-3xl" />
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

  const stats = [
    { label: 'Total Usuarios', value: data?.users ?? 0, trend: '+12%', icon: Users, color: 'text-sky-600', bg: 'bg-sky-50 dark:bg-sky-900/20' },
    { label: 'Nuevos Registros', value: '24', trend: '+18.2%', icon: Zap, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
    { label: 'Aulas', value: data?.classrooms ?? 0, trend: '-5%', icon: Package, color: 'text-sky-500', bg: 'bg-sky-50 dark:bg-sky-900/20' },
    { label: 'Cursos Activos', value: data?.courses ?? 0, trend: '+2%', icon: BarChart3, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
  ]

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-1000">
      {/* --- HEADER SECTION --- */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sky-600">
            <ShieldCheck size={20} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Acceso Administrativo</span>
          </div>
          <h1 className="text-5xl font-black tracking-tighter text-slate-900">Central de Control</h1>
          <p className="text-slate-500 font-medium max-w-md">Monitorea el crecimiento, gestiona usuarios y supervisa las operaciones de JumpUp en tiempo real.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" size="lg" className="rounded-2xl h-14 border-2 font-black hover:bg-slate-50 transition-all px-6">
             <Bell className="mr-2 h-5 w-5 text-slate-400" />
             Notificaciones
          </Button>
          <Button asChild size="lg" className="rounded-2xl h-14 bg-sky-600 hover:bg-sky-700 font-black shadow-xl shadow-sky-200 transition-all px-8 group">
            <Link to="/management/courses/new">
              <Plus className="mr-2 h-5 w-5 group-hover:rotate-90 transition-transform" />
              Nuevo Curso
            </Link>
          </Button>
        </div>
      </div>

      {/* --- ANALYTICS OVERVIEW --- */}
      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <Card key={i} className="border-none shadow-xl shadow-slate-200/50 bg-white rounded-[2.5rem] overflow-hidden hover:-translate-y-2 transition-all duration-500 group">
            <CardContent className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div className={`${stat.bg} ${stat.color} p-4 rounded-3xl transition-transform group-hover:scale-110`}>
                  <stat.icon size={24} />
                </div>
                <Badge className={`${stat.trend.startsWith('+') ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'} border-none font-black text-[10px] px-2 py-1 rounded-lg`}>
                  {stat.trend.startsWith('+') ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
                  {stat.trend}
                </Badge>
              </div>
              <p className="text-4xl font-black text-slate-900 leading-tight">{stat.value}</p>
              <span className="text-[11px] font-black uppercase tracking-widest text-slate-400 mt-2 block">{stat.label}</span>
            </CardContent>
          </Card>
        ))}
      </section>

      <div className="grid gap-10 lg:grid-cols-3">
        {/* --- RECENT USERS TABLE-LIKE VIEW --- */}
        <Card className="lg:col-span-2 border-none shadow-2xl shadow-slate-200/50 bg-white rounded-[3rem] overflow-hidden">
          <CardHeader className="p-10 pb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle className="text-3xl font-black text-slate-900">Nuevos Usuarios</CardTitle>
                <CardDescription className="font-bold text-slate-400 uppercase tracking-widest text-xs mt-2">Actividad de registro hoy</CardDescription>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar en el sistema..."
                  className="w-full pl-12 pr-4 h-12 bg-slate-50 rounded-2xl text-sm font-bold border-none focus:ring-2 focus:ring-sky-500/20 transition-all shadow-inner"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-10 pt-0">
            <div className="space-y-4">
              {[
                { name: 'Ana Garcia', email: 'ana@example.com', role: 'Student', date: 'Hace 5 min', color: 'bg-sky-100 text-sky-600' },
                { name: 'Carlos Ruiz', email: 'carlos@example.com', role: 'Student', date: 'Hace 12 min', color: 'bg-amber-100 text-amber-600' },
                { name: 'Elena Beltran', email: 'elena@example.com', role: 'Teacher', date: 'Hace 45 min', color: 'bg-indigo-100 text-indigo-600' },
                { name: 'Juan Perez', email: 'juan@example.com', role: 'Student', date: 'Hace 1 hora', color: 'bg-sky-100 text-sky-600' },
              ].map((user, i) => (
                <div key={i} className="flex items-center justify-between p-5 rounded-[2rem] bg-slate-50 hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 border border-transparent hover:border-slate-100 group">
                  <div className="flex items-center gap-5">
                    <div className={`h-14 w-14 rounded-2xl flex items-center justify-center font-black text-xl shadow-sm ${user.color}`}>
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-black text-slate-900 text-base">{user.name}</p>
                      <p className="text-xs font-bold text-slate-400">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-8">
                    <div className="hidden sm:block text-right">
                       <Badge variant="outline" className="font-black text-[10px] uppercase tracking-widest border-2 py-1 px-3 rounded-lg">
                        {user.role}
                      </Badge>
                    </div>
                    <span className="text-[10px] font-black text-slate-300 uppercase w-20 text-right">{user.date}</span>
                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl bg-white shadow-sm opacity-0 group-hover:opacity-100 transition-all">
                      <ArrowUpRight className="h-5 w-5 text-slate-400" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="ghost" className="w-full mt-8 h-14 rounded-2xl font-black text-xs uppercase tracking-[0.2em] text-sky-600 hover:bg-sky-50 transition-all">
              Ver el directorio completo
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        {/* --- SYSTEM SHORTCUTS --- */}
        <div className="space-y-8">
          <Card className="border-none shadow-2xl shadow-slate-200/50 bg-slate-900 text-white rounded-[3rem] overflow-hidden">
            <CardHeader className="p-10 pb-6">
              <CardTitle className="text-2xl font-black flex items-center gap-3 italic">
                <LayoutGrid className="text-sky-400" />
                Módulos
              </CardTitle>
            </CardHeader>
            <CardContent className="p-10 pt-0 space-y-4">
               {[
                 { to: '/management/courses', label: 'Cursos', icon: BookOpen, count: 'Gestionar' },
                 { to: '/admin/categories', label: 'Categorías', icon: Tags, count: '12' },
                 { to: '/admin/products', label: 'Tienda XP', icon: ShoppingBag, count: '48' },
                 { to: '/admin/orders', label: 'Pedidos', icon: Package, count: '156' },
                 { to: '/admin/users', label: 'Gestión Usuarios', icon: Users, count: '1.2k' },
               ].map((item, i) => (
                 <Link key={i} to={item.to} className="flex items-center justify-between p-5 rounded-2xl bg-white/5 hover:bg-white/10 transition-all group">
                   <div className="flex items-center gap-4">
                     <div className="p-2 bg-white/5 rounded-xl group-hover:bg-sky-500/20 transition-colors">
                        <item.icon size={20} className="text-sky-400" />
                     </div>
                     <span className="font-black text-sm">{item.label}</span>
                   </div>
                   <div className="flex items-center gap-4">
                     <span className="text-[10px] font-black text-white/30 group-hover:text-sky-300 transition-colors">{item.count}</span>
                     <ArrowRight size={16} className="text-white/10 group-hover:text-white group-hover:translate-x-1 transition-all" />
                   </div>
                 </Link>
               ))}
            </CardContent>
          </Card>

          {/* --- SERVER HEALTH CARD --- */}
          <Card className="border-none shadow-xl bg-gradient-to-br from-indigo-600 to-blue-700 text-white rounded-[3rem] p-10 relative overflow-hidden group">
            <Activity className="absolute -right-8 -bottom-8 h-32 w-32 text-white/10 group-hover:scale-125 transition-transform duration-1000" />
            <div className="relative z-10">
              <h3 className="text-2xl font-black mb-3">Sistemas</h3>
              <p className="text-indigo-100/70 text-sm font-medium mb-8 leading-relaxed">Infraestructura JumpUp operando al <span className="text-white font-bold">99.9%</span> de eficiencia.</p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-3 w-3 rounded-full bg-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.6)] animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">Sincronizado</span>
                </div>
                <Button variant="ghost" className="h-10 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-black text-[10px] uppercase">
                  Log Status
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
