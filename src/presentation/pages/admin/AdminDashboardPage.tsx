import { useState, useEffect } from 'react'
import {
  Users,
  BookOpen,
  Sparkles,
  Award,
  MessageSquare,
  Radio,
  ShoppingBag,
  Receipt,
  Bell,
  ArrowRight,
  Lightbulb,
  FolderOpen,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '@/presentation/store/auth.store'
import { getAdminDashboardUseCase } from '@/infrastructure/factories/dashboard.factory'
import type { AdminDashboardData } from '@/domain/ports/dashboard.repository'

export default function AdminDashboardPage() {
  const [data, setData] = useState<AdminDashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const user = useAuthStore(s => s.user)

  useEffect(() => {
    getAdminDashboardUseCase.execute()
      .then(setData)
      .catch(err => console.error('Error loading admin dashboard:', err))
      .finally(() => setIsLoading(false))
  }, [])

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

  const adminStats = [
    { label: 'Usuarios', value: data?.users ?? 0, sub: 'Registrados en plataforma', icon: Users, link: '/admin/users' },
    { label: 'Cursos', value: data?.courses ?? 0, sub: 'Programas activos', icon: BookOpen, link: '/admin/management/courses' },
    { label: 'Certificados', value: data?.certificates ?? 0, sub: 'Emitidos', icon: Award, link: '/admin/certificates' },
    { label: 'Ventas', value: data?.ventas_directas ?? 0, sub: 'Transacciones directas', icon: Receipt, link: '/admin/ordenes-compra' },
  ]

  const quickLinks = [
    { to: '/admin/management/courses', title: 'Cursos', desc: 'Gestión académica', icon: BookOpen },
    { to: '/admin/users', title: 'Usuarios', desc: 'Control de acceso', icon: Users },
    { to: '/admin/certificates', title: 'Certificados', desc: 'Emisión MCER', icon: Award },
    { to: '/admin/forum', title: 'Foro', desc: 'Moderación comunitaria', icon: MessageSquare },
    { to: '/admin/live-sessions', title: 'Sesiones', desc: 'Clases en vivo', icon: Radio },
    { to: '/admin/announcements', title: 'Anuncios', desc: 'Comunicados', icon: Bell },
    { to: '/admin/catalogo', title: 'Catálogo', desc: 'Productos y ventas', icon: ShoppingBag },
    { to: '/admin/ordenes-compra', title: 'Órdenes', desc: 'Historial de compras', icon: Receipt },
  ]

  return (
    <div className="animate-in fade-in duration-500">
      {/* HERO */}
      <section className="border-b border-slate-900/10 dark:border-white/10 px-8 md:px-12 py-14 md:py-20">
        <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-10">
          <div className="space-y-6 max-w-2xl">
            <div className="chip">
              <Sparkles className="h-3.5 w-3.5 text-sky-500" />
              Panel de Administración
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.05] text-slate-900 dark:text-white">
              Hola, <span className="text-sky-500">{user?.username ?? 'Admin'}</span>.
            </h1>
            <p className="text-base sm:text-lg leading-relaxed text-slate-600 dark:text-slate-300 max-w-lg">
              Gestiona la plataforma, usuarios, cursos, certificaciones y más desde un solo lugar.
            </p>
          </div>
        </div>
      </section>

      {/* STATS GRID */}
      <section className="border-b border-slate-900/10 dark:border-white/10">
        <div className="grid grid-cols-2 lg:grid-cols-4 border-l border-slate-900/10 dark:border-white/10">
          {adminStats.map((stat, i) => (
            <Link key={i} to={stat.link} className="p-8 md:p-10 border-b border-r border-slate-900/10 dark:border-white/10 card-hover group">
              <div className="flex h-12 w-12 items-center justify-center border border-slate-900/10 dark:border-white/10 mb-6 group-hover:border-sky-500/30 transition-colors">
                <stat.icon className="h-5 w-5 text-sky-500" />
              </div>
              <p className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white">{stat.value}</p>
              <p className="mt-2 label-caps text-slate-500 dark:text-slate-400">{stat.label}</p>
              <p className="mt-1 text-sm text-slate-400 dark:text-slate-500">{stat.sub}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* MAIN CONTENT */}
      <div className="grid gap-px lg:grid-cols-3 border-b border-slate-900/10 dark:border-white/10">
        {/* QUICK ACCESS */}
        <div className="lg:col-span-2 border-r border-slate-900/10 dark:border-white/10">
          <div className="flex items-center justify-between px-8 md:px-10 py-6 border-b border-slate-900/10 dark:border-white/10">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Acceso Rápido</h2>
              <p className="label-caps text-slate-400 dark:text-slate-500 mt-1">Módulos de gestión</p>
            </div>
          </div>

          <div className="grid grid-cols-2 border-l border-slate-900/10 dark:border-white/10">
            {quickLinks.map((link, i) => (
              <Link key={i} to={link.to} className="group p-8 border-b border-r border-slate-900/10 dark:border-white/10 card-hover flex items-center gap-5">
                <div className="flex h-12 w-12 items-center justify-center border border-slate-900/10 dark:border-white/10 group-hover:border-sky-500/30 transition-colors">
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
          {/* System Status */}
          <div className="px-8 py-6 border-b border-slate-900/10 dark:border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Sistema</h2>
                <p className="label-caps text-slate-400 dark:text-slate-500 mt-1">Estado operativo</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center border border-slate-900/10 dark:border-white/10">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 bg-emerald-500" />
                </span>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b border-slate-900/5 dark:border-white/5">
                <span className="label-micro text-slate-500">API</span>
                <span className="label-micro text-emerald-500 font-bold">Online</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-900/5 dark:border-white/5">
                <span className="label-micro text-slate-500">Base de Datos</span>
                <span className="label-micro text-emerald-500 font-bold">Conectada</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="label-micro text-slate-500">Almacenamiento</span>
                <span className="label-micro text-emerald-500 font-bold">Disponible</span>
              </div>
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
                <p className="label-micro text-slate-400 dark:text-slate-500">Gestión eficiente</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              Revisa periódicamente los <span className="font-bold text-slate-900 dark:text-white">reportes del foro</span> para mantener un ambiente saludable en la comunidad educativa.
            </p>
          </div>

          {/* Recursos */}
          <div className="px-8 py-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center border border-slate-900/10 dark:border-white/10">
                <FolderOpen className="h-4 w-4 text-sky-500" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Recursos</h3>
                <p className="label-micro text-slate-400 dark:text-slate-500">Material disponible</p>
              </div>
            </div>
            <div className="space-y-2">
              <Link to="/admin/resources" className="flex items-center justify-between py-2 px-3 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors group">
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300 group-hover:text-sky-500">Biblioteca</span>
                <ArrowRight className="h-3 w-3 text-slate-400 group-hover:text-sky-500" />
              </Link>
              <Link to="/admin/live-sessions" className="flex items-center justify-between py-2 px-3 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors group">
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300 group-hover:text-sky-500">Sesiones en Vivo</span>
                <ArrowRight className="h-3 w-3 text-slate-400 group-hover:text-sky-500" />
              </Link>
              <Link to="/admin/announcements" className="flex items-center justify-between py-2 px-3 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors group">
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300 group-hover:text-sky-500">Anuncios</span>
                <ArrowRight className="h-3 w-3 text-slate-400 group-hover:text-sky-500" />
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}