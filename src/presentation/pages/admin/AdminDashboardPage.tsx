import {
  Users,
  ShoppingBag,
  Package,
  Tags,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  Plus,
  ArrowRight
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/presentation/components/ui/card'
import { Button } from '@/presentation/components/ui/button'
import { Badge } from '@/presentation/components/ui/badge'
import { Link } from 'react-router-dom'

export default function AdminDashboardPage() {
  const stats = [
    { label: 'Total Usuarios', value: '1,284', trend: '+12%', icon: Users, color: 'text-sky-600', bg: 'bg-sky-50 dark:bg-sky-900/20' },
    { label: 'Ventas (Mes)', $value: '$12,450', trend: '+18%', icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { label: 'Órdenes Pendientes', value: '24', trend: '-5%', icon: Package, color: 'text-sky-500', bg: 'bg-sky-50 dark:bg-sky-900/20' },
    { label: 'Cursos Activos', value: '42', trend: '+2%', icon: BarChart3, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
  ]

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">Panel de Administración</h1>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-1">Gestión centralizada de JumpUp</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="rounded-xl font-bold border-2">Descargar Reporte</Button>
          <Button className="rounded-xl font-black bg-sky-600 hover:bg-sky-700 shadow-lg shadow-sky-500/20">
            <Plus className="mr-2 h-4 w-4" /> Nuevo Producto
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <Card key={i} className="border-none shadow-xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 rounded-3xl overflow-hidden hover:-translate-y-1 transition-all">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className={`${stat.bg} ${stat.color} p-3 rounded-2xl`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <Badge className={`${stat.trend.startsWith('+') ? 'bg-sky-50 text-sky-600' : 'bg-rose-50 text-rose-600'} border-none font-black text-[10px]`}>
                  {stat.trend.startsWith('+') ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
                  {stat.trend}
                </Badge>
              </div>
              <p className="text-3xl font-black text-slate-900 dark:text-white leading-tight">{stat.$value || stat.value}</p>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1 block">{stat.label}</span>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Recent Activity / Users */}
        <Card className="lg:col-span-2 border-none shadow-2xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden">
          <CardHeader className="p-8">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-2xl font-black">Usuarios Recientes</CardTitle>
                <CardDescription className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">Últimos registros en la plataforma</CardDescription>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar..."
                  className="pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs font-bold border-none focus:ring-2 ring-sky-500 w-48"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8 pt-0">
            <div className="space-y-4">
              {[
                { name: 'Ana Garcia', email: 'ana@example.com', role: 'Estudiante', date: 'Hace 5 min' },
                { name: 'Carlos Ruiz', email: 'carlos@example.com', role: 'Estudiante', date: 'Hace 12 min' },
                { name: 'Elena Beltran', email: 'elena@example.com', role: 'Profesor', date: 'Hace 45 min' },
                { name: 'Juan Perez', email: 'juan@example.com', role: 'Estudiante', date: 'Hace 1 hora' },
              ].map((user, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 hover:bg-sky-50/50 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-sky-100 flex items-center justify-center font-black text-sky-600">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-black text-sm text-slate-900 dark:text-white">{user.name}</p>
                      <p className="text-xs font-medium text-slate-400">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <Badge variant="outline" className="font-black text-[10px] uppercase tracking-widest border-2">
                      {user.role}
                    </Badge>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">{user.date}</span>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                      <ArrowUpRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="ghost" className="w-full mt-6 font-black text-xs uppercase tracking-widest text-sky-600">
              Ver todos los usuarios
            </Button>
          </CardContent>
        </Card>

        {/* Shortcut Modules */}
        <div className="space-y-6">
          <Card className="border-none shadow-2xl shadow-slate-200/50 dark:shadow-none bg-slate-900 text-white rounded-[2.5rem] overflow-hidden">
            <CardHeader className="p-8 pb-4">
              <CardTitle className="text-xl font-black italic">Accesos Directos</CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-0 space-y-4">
               {[
                 { to: '/admin/categories', label: 'Categorías', icon: Tags, count: '12' },
                 { to: '/admin/products', label: 'Productos', icon: ShoppingBag, count: '48' },
                 { to: '/admin/orders', label: 'Pedidos', icon: Package, count: '156' },
                 { to: '/admin/users', label: 'Usuarios', icon: Users, count: '1.2k' },
               ].map((item, i) => (
                 <Link key={i} to={item.to} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-all group">
                   <div className="flex items-center gap-4">
                     <item.icon className="h-5 w-5 text-sky-400" />
                     <span className="font-black text-sm">{item.label}</span>
                   </div>
                   <div className="flex items-center gap-3">
                     <span className="text-[10px] font-black text-sky-300">{item.count}</span>
                     <ArrowRight className="h-4 w-4 text-white/20 group-hover:text-white group-hover:translate-x-1 transition-all" />
                   </div>
                 </Link>
               ))}
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl bg-gradient-to-br from-sky-600 to-blue-700 text-white rounded-[2.5rem] p-8">
            <h3 className="text-xl font-black mb-2">Estado del Servidor</h3>
            <p className="text-sky-100/70 text-sm font-medium mb-6">Todos los sistemas operativos y funcionando correctamente.</p>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-black uppercase tracking-widest">Online</span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
