import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getStudentDashboardUseCase } from '@/infrastructure/factories/dashboard.factory'
import type { StudentDashboardData, RankingUser } from '@/domain/ports/dashboard.repository'
import type { Achievement } from '@/domain/entities/stats.entity'
import {
  Trophy,
  Flame,
  BookOpen,
  Award,
  Users,
  Compass,
  ArrowRight,
  TrendingUp,
  Sparkles,
  ShoppingBag,
  RefreshCw
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/presentation/components/ui/card'
import { Button } from '@/presentation/components/ui/button'
import { Skeleton } from '@/presentation/components/ui/skeleton'
import { Badge } from '@/presentation/components/ui/badge'

export default function DashboardPage() {
  const [data, setData] = useState<StudentDashboardData | null>(null)
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [topUsers, setTopUsers] = useState<RankingUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await getStudentDashboardUseCase.execute()
      setData(result.data)
      setAchievements(result.achievements)
      setTopUsers(result.ranking)
    } catch (err: any) {
      console.error('Error fetching dashboard data:', err)
      setError(err.message || 'No se pudo cargar la información del tablero.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <Skeleton className="h-96 md:col-span-2" />
          <Skeleton className="h-96" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200">
        <div className="bg-destructive/10 p-4 rounded-full mb-4">
          <TrendingUp className="h-12 w-12 text-destructive rotate-180" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-2">¡Ups! Algo salió mal</h2>
        <p className="text-slate-500 font-medium mb-6 max-w-md">{error}</p>
        <Button onClick={loadData} className="rounded-xl font-black gap-2">
          <RefreshCw className="h-4 w-4" /> Reintentar
        </Button>
      </div>
    )
  }

  const progressPercent = data ? Math.min(100, Math.round((data.xp_progress / (data.xp_for_next_level || 100)) * 100)) : 0

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
      {/* Header Banner - High Impact */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-sky-500 p-8 sm:p-12 text-white shadow-2xl">
        {/* Background Gradients */}
        <div className="absolute right-0 top-0 -mr-20 -mt-20 h-96 w-96 rounded-full bg-white/20 blur-[100px] animate-pulse" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-80 w-80 rounded-full bg-blue-400/20 blur-[80px]" />
        
        <div className="relative z-10 flex flex-col lg:flex-row justify-between gap-10">
          <div className="space-y-6 max-w-2xl">
            <div className="flex flex-wrap items-center gap-3">
              <Badge className="bg-white/20 hover:bg-white/30 text-white border-white/20 backdrop-blur-xl px-4 py-1.5 font-black text-xs uppercase tracking-widest rounded-full">
                <Sparkles className="h-3.5 w-3.5 mr-2 text-white" />
                Nivel {data?.level ?? 1}
              </Badge>
              <Badge className="bg-sky-400/40 text-sky-100 border-sky-300/30 backdrop-blur-xl px-4 py-1.5 font-black text-xs uppercase tracking-widest rounded-full">
                {data?.total_xp ?? 0} XP Totales
              </Badge>
            </div>

            <h1 className="text-5xl sm:text-6xl font-black tracking-tight leading-[1.1]">
              ¡Hola de nuevo, <span className="text-white opacity-90">JumpUper</span>!
            </h1>

            <p className="text-sky-50 text-lg font-medium leading-relaxed">
              Tu racha de <span className="text-white font-bold">{data?.current_streak ?? 0} días</span> te acerca a tu meta. ¡Hoy es un gran día para aprender algo nuevo!
            </p>

            {/* XP Progress - Modern Style */}
            <div className="space-y-4 pt-4">
              <div className="flex justify-between items-end">
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-sky-300">Progreso de Nivel</span>
                  <p className="text-sm font-bold">{data?.xp_progress ?? 0} <span className="text-sky-300/60">/ 100 XP</span></p>
                </div>
                <span className="text-2xl font-black italic opacity-50">{(data?.level ?? 1) + 1}</span>
              </div>
              <div className="h-4 w-full rounded-full bg-white/5 overflow-hidden p-1 border border-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-500 transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(14,165,233,0.5)]"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 shrink-0">
             <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl p-6 flex flex-col items-center justify-center text-center group hover:bg-white/10 transition-all cursor-default">
                <div className="relative mb-2">
                  <div className="absolute inset-0 bg-sky-400 blur-xl opacity-40 group-hover:opacity-60 transition-opacity"></div>
                  <Flame className="h-14 w-14 text-sky-400 relative animate-bounce" />
                </div>
                <p className="text-4xl font-black">{data?.current_streak ?? 0}</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-sky-400">Días de Racha</p>
             </div>

             <Button asChild className="h-16 rounded-2xl bg-white text-slate-900 hover:bg-sky-50 font-black text-lg shadow-xl shadow-sky-500/20 border-none group">
                <Link to="/courses">
                  Continuar Aprendiendo
                  <ArrowRight className="ml-2 h-6 w-6 group-hover:translate-x-2 transition-transform" />
                </Link>
             </Button>
          </div>
        </div>
      </div>

      {/* Modern Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Completado', value: `${data?.progress_percentage ?? 0}%`, sub: `${data?.completed_lessons ?? 0} lecciones`, icon: BookOpen, color: 'text-sky-600', bg: 'bg-sky-50' },
          { label: 'Logros', value: data?.achievements_count ?? 0, sub: 'Insignias ganadas', icon: Trophy, color: 'text-sky-500', bg: 'bg-sky-50' },
          { label: 'Certificados', value: data?.certificates_count ?? 0, sub: 'Niveles MCER', icon: Award, color: 'text-blue-500', bg: 'bg-blue-50' },
          { label: 'Aulas', value: data?.active_classrooms ?? 0, sub: 'Grupos activos', icon: Users, color: 'text-sky-600', bg: 'bg-sky-50' },
        ].map((stat, i) => (
          <Card key={i} className="border-none shadow-xl shadow-slate-200/50 bg-white rounded-[2rem] overflow-hidden group hover:-translate-y-1 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className={`${stat.bg} ${stat.color} p-3 rounded-2xl`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <div className="bg-slate-50 px-2 py-1 rounded-lg">
                  <TrendingUp className="h-3 w-3 text-emerald-500" />
                </div>
              </div>
              <p className="text-3xl font-black text-slate-900 leading-tight">{stat.value}</p>
              <div className="flex flex-col mt-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{stat.label}</span>
                <span className="text-xs font-bold text-slate-500 mt-1">{stat.sub}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Sections */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Achievements & Quick Links */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="border-none shadow-2xl shadow-slate-200/50 bg-white rounded-[2.5rem] overflow-hidden">
            <CardHeader className="p-8 pb-4">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-2xl font-black text-slate-900">Logros Recientes</CardTitle>
                  <CardDescription className="font-bold text-slate-400 uppercase tracking-widest text-[10px] mt-1">Tus hitos más importantes</CardDescription>
                </div>
                <Trophy className="h-8 w-8 text-amber-500/20" />
              </div>
            </CardHeader>
            <CardContent className="p-8 pt-0 space-y-4">
              {achievements.length > 0 ? (
                achievements.map((ach) => (
                  <div key={ach.id} className="flex items-center gap-5 p-4 rounded-2xl bg-slate-50 border border-transparent hover:border-sky-100 transition-all group">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white text-3xl shadow-sm group-hover:scale-110 transition-transform">
                      {ach.achievement?.icon || '🏅'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-black text-slate-900 text-sm">{ach.achievement?.title}</h4>
                      <p className="text-xs font-medium text-slate-500 line-clamp-1">{ach.achievement?.description}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge className="bg-sky-100 text-sky-700 border-none font-black text-[10px]">
                        +{ach.achievement?.xp_reward} XP
                      </Badge>
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">
                        {ach.unlocked_at ? new Date(ach.unlocked_at).toLocaleDateString() : ''}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 border-2 border-dashed rounded-3xl border-slate-100">
                  <Sparkles className="h-10 w-10 text-slate-200 mx-auto mb-3" />
                  <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Aún no hay medallas</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Access - Visual Overhaul */}
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { to: '/courses', title: 'Plan de Estudios', desc: 'Explora niveles MCER', icon: Compass, color: 'text-sky-500', bg: 'bg-sky-50' },
              { to: '/chat', title: 'Tutor IA Pro', desc: 'GPT-4o Feedback real', icon: Sparkles, color: 'text-blue-500', bg: 'bg-blue-50' },
              { to: '/forum', title: 'Comunidad', desc: 'Debates y consejos', icon: Users, color: 'text-sky-600', bg: 'bg-sky-50' },
              { to: '/catalog', title: 'Mercado XP', desc: 'Canjea tus puntos', icon: ShoppingBag, color: 'text-sky-400', bg: 'bg-sky-50' },
            ].map((link, i) => (
              <Link key={i} to={link.to} className="group block h-full">
                <div className="h-full p-5 rounded-[2rem] bg-white border border-slate-100 shadow-xl shadow-slate-200/30 hover:shadow-sky-100 transition-all flex items-center gap-5">
                   <div className={`${link.bg} ${link.color} p-4 rounded-2xl group-hover:scale-110 transition-transform`}>
                      <link.icon className="h-6 w-6" />
                   </div>
                   <div>
                      <h4 className="font-black text-slate-900 text-base leading-none">{link.title}</h4>
                      <p className="text-xs font-bold text-slate-400 mt-1">{link.desc}</p>
                   </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Leaderboard Section - High Visibility */}
        <aside className="space-y-6">
          <Card className="border-none shadow-2xl shadow-slate-200/50 bg-sky-600 text-white rounded-[2.5rem] overflow-hidden h-full">
            <CardHeader className="p-8 pb-4">
              <div className="flex justify-between items-center">
                 <CardTitle className="text-xl font-black">Ranking Global</CardTitle>
                 <TrendingUp className="h-5 w-5 text-sky-200" />
              </div>
              <CardDescription className="text-sky-100 font-bold uppercase tracking-widest text-[10px]">Liga de Diamante</CardDescription>
            </CardHeader>
            <CardContent className="p-8 pt-0 space-y-6">
              <div className="space-y-4">
                {topUsers.length > 0 ? (
                  topUsers.map((user, idx) => (
                    <div key={idx} className={`flex items-center gap-4 p-3 rounded-2xl transition-all ${
                       idx === 0 ? 'bg-white/20 border border-white/30' : 'bg-white/10 border border-transparent'
                    }`}>
                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-black ${
                        idx === 0 ? 'bg-white text-sky-600 shadow-[0_0_15px_rgba(255,255,255,0.4)]' :
                        idx === 1 ? 'bg-sky-200 text-sky-800' :
                        idx === 2 ? 'bg-sky-800 text-white' :
                        'bg-white/10 text-sky-100'
                      }`}>
                        {idx + 1}
                      </div>
                      <div className="flex-1 truncate">
                        <p className="text-sm font-black truncate">{user.user__username}</p>
                        <p className="text-[10px] font-black text-sky-200 uppercase">Nivel {user.level}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-white">{user.total_xp}</p>
                        <p className="text-[9px] font-black uppercase text-sky-200/60 tracking-tighter">Puntos</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <p className="text-sm font-bold text-sky-100/40">Sin datos de clasificación</p>
                  </div>
                )}
              </div>
              
              <Button variant="ghost" className="w-full mt-4 h-12 rounded-xl text-white hover:bg-white/10 font-black text-xs uppercase tracking-widest transition-all border border-white/20 group" asChild>
                <Link to="/ranking" className="flex items-center justify-center gap-2">
                  <span>Ver Todos los Usuarios</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  )
}
