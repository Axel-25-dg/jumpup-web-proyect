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
  RefreshCw,
  Zap,
  Star
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
      <div className="space-y-8 animate-pulse">
        <Skeleton className="h-[300px] w-full rounded-[2.5rem]" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-[2rem]" />
          ))}
        </div>
        <div className="grid gap-8 lg:grid-cols-3">
          <Skeleton className="h-[400px] lg:col-span-2 rounded-[2.5rem]" />
          <Skeleton className="h-[400px] rounded-[2.5rem]" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-10 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-200 shadow-sm">
        <div className="bg-rose-50 p-6 rounded-full mb-6">
          <RefreshCw className="h-12 w-12 text-rose-500" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-2">¡Algo no saltó bien!</h2>
        <p className="text-slate-500 font-medium mb-8 max-w-md">{error}</p>
        <Button onClick={loadData} className="rounded-2xl h-12 px-8 bg-sky-600 hover:bg-sky-700 font-black gap-2 shadow-lg shadow-sky-100 transition-all">
          <RefreshCw className="h-4 w-4" /> Intentar de nuevo
        </Button>
      </div>
    )
  }

  const progressPercent = data ? Math.min(100, Math.round((data.xp_progress / (data.xp_for_next_level || 100)) * 100)) : 0

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      {/* --- HERO BANNER --- */}
      <section className="relative overflow-hidden rounded-[3rem] bg-gradient-to-br from-sky-500 via-sky-600 to-blue-700 p-8 md:p-14 text-white shadow-2xl shadow-sky-200">
        {/* Abstract Background Shapes */}
        <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-white/10 blur-[100px] pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 h-80 w-80 rounded-full bg-sky-400/20 blur-[80px] pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
          <div className="space-y-8 w-full lg:max-w-2xl text-center lg:text-left">
            <div className="flex flex-wrap justify-center lg:justify-start items-center gap-3">
              <Badge className="bg-white/20 hover:bg-white/30 text-white border-white/10 backdrop-blur-xl px-5 py-2 font-black text-xs uppercase tracking-[0.1em] rounded-full">
                <Star className="h-3.5 w-3.5 mr-2 fill-white text-white" />
                Nivel {data?.level ?? 1}
              </Badge>
              <Badge className="bg-sky-400/30 text-sky-50 border-sky-300/20 backdrop-blur-xl px-5 py-2 font-black text-xs uppercase tracking-[0.1em] rounded-full">
                <Zap className="h-3.5 w-3.5 mr-2 fill-sky-200 text-sky-200" />
                {data?.total_xp ?? 0} XP Acumulados
              </Badge>
            </div>

            <div className="space-y-4">
              <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[1] drop-shadow-sm">
                ¡Hola, <span className="text-sky-200">JumpUper</span>!
              </h1>
              <p className="text-sky-100 text-lg md:text-xl font-medium max-w-xl mx-auto lg:mx-0">
                Mantienes una racha de <span className="text-white font-black underline decoration-sky-300 underline-offset-4">{data?.current_streak ?? 0} días</span>. ¡No te detengas ahora!
              </p>
            </div>

            {/* XP Progress Bar */}
            <div className="space-y-4 max-w-md mx-auto lg:mx-0">
              <div className="flex justify-between items-end">
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-sky-200/80">Siguiente Nivel</span>
                  <p className="text-sm font-black">{data?.xp_progress ?? 0} / {data?.xp_for_next_level ?? 100} XP</p>
                </div>
                <span className="text-3xl font-black italic text-white/40">{(data?.level ?? 1) + 1}</span>
              </div>
              <div className="h-5 w-full rounded-full bg-white/10 overflow-hidden p-1 border border-white/20 shadow-inner">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-white via-sky-200 to-white transition-all duration-1000 ease-out shadow-[0_0_20px_rgba(255,255,255,0.6)]"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-6 w-full sm:w-auto shrink-0">
             <div className="bg-white/10 border border-white/20 backdrop-blur-2xl rounded-[2.5rem] p-8 flex flex-col items-center justify-center text-center group hover:bg-white/20 transition-all duration-500 cursor-default shadow-xl">
                <div className="relative mb-4">
                  <div className="absolute inset-0 bg-sky-300 blur-2xl opacity-40 group-hover:opacity-70 transition-opacity animate-pulse"></div>
                  <Flame className="h-16 w-16 text-sky-300 relative drop-shadow-md" />
                </div>
                <p className="text-5xl font-black mb-1">{data?.current_streak ?? 0}</p>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-sky-300">Días Imbatible</p>
             </div>

             <Button asChild className="h-20 px-10 rounded-[2rem] bg-white text-slate-900 hover:bg-sky-50 hover:scale-105 active:scale-95 font-black text-xl shadow-2xl shadow-sky-900/20 border-none group transition-all">
                <Link to="/courses">
                  Saltar a Clase
                  <ArrowRight className="ml-3 h-7 w-7 group-hover:translate-x-2 transition-transform" />
                </Link>
             </Button>
          </div>
        </div>
      </section>

      {/* --- QUICK STATS GRID --- */}
      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Progreso', value: `${data?.progress_percentage ?? 0}%`, sub: `${data?.completed_lessons ?? 0} lecciones ok`, icon: BookOpen, color: 'text-sky-600', bg: 'bg-sky-50' },
          { label: 'Insignias', value: data?.achievements_count ?? 0, sub: 'Logros desbloqueados', icon: Trophy, color: 'text-amber-500', bg: 'bg-amber-50' },
          { label: 'Títulos', value: data?.certificates_count ?? 0, sub: 'Certificados MCER', icon: Award, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Aulas', value: data?.active_classrooms ?? 0, sub: 'Clases en vivo hoy', icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
        ].map((stat, i) => (
          <Card key={i} className="border-none shadow-xl shadow-slate-200/40 bg-white rounded-[2.5rem] overflow-hidden group hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
            <CardContent className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div className={`${stat.bg} ${stat.color} p-4 rounded-3xl transition-transform group-hover:rotate-12`}>
                  <stat.icon className="h-7 w-7" />
                </div>
                <div className="bg-emerald-50 px-3 py-1.5 rounded-2xl flex items-center gap-1.5">
                  <TrendingUp className="h-4 w-4 text-emerald-600" />
                  <span className="text-[10px] font-black text-emerald-700">TOP</span>
                </div>
              </div>
              <p className="text-4xl font-black text-slate-900 mb-2">{stat.value}</p>
              <div className="space-y-1">
                <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">{stat.label}</span>
                <p className="text-xs font-bold text-slate-500">{stat.sub}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* --- MAIN DASHBOARD CONTENT --- */}
      <div className="grid gap-10 lg:grid-cols-3">
        {/* Achievements & Quick Links */}
        <div className="lg:col-span-2 space-y-10">
          <Card className="border-none shadow-2xl shadow-slate-200/40 bg-white rounded-[3rem] overflow-hidden">
            <CardHeader className="p-10 pb-6 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-3xl font-black text-slate-900">Tus Logros</CardTitle>
                <CardDescription className="font-bold text-slate-400 uppercase tracking-widest text-xs mt-2">Lo que has conquistado</CardDescription>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center">
                 <Trophy className="h-6 w-6 text-slate-300" />
              </div>
            </CardHeader>
            <CardContent className="p-10 pt-0 space-y-5">
              {achievements.length > 0 ? (
                achievements.map((ach) => (
                  <div key={ach.id} className="flex items-center gap-6 p-6 rounded-[2rem] bg-slate-50/50 border border-transparent hover:border-sky-100 hover:bg-white hover:shadow-xl transition-all duration-300 group">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white text-4xl shadow-md group-hover:scale-110 transition-transform">
                      {ach.achievement?.icon || '🏅'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-black text-slate-900 text-lg">{ach.achievement?.title}</h4>
                      <p className="text-sm font-medium text-slate-500 line-clamp-1">{ach.achievement?.description}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge className="bg-sky-100 text-sky-700 border-none font-black text-xs px-3 py-1 rounded-full">
                        +{ach.achievement?.xp_reward} XP
                      </Badge>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                        {ach.unlocked_at ? new Date(ach.unlocked_at).toLocaleDateString() : 'Reciente'}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-16 border-4 border-dashed rounded-[3rem] border-slate-50">
                  <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Sparkles className="h-10 w-10 text-slate-200" />
                  </div>
                  <p className="text-lg font-black text-slate-300 uppercase tracking-[0.2em]">Cargando Medallas...</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Access Grid */}
          <div className="grid gap-6 sm:grid-cols-2">
            {[
              { to: '/courses', title: 'Explorar', desc: 'Mis niveles activos', icon: Compass, color: 'text-sky-500', bg: 'bg-sky-50' },
              { to: '/chat', title: 'IA Tutor', desc: 'Soporte 24/7 Pro', icon: Sparkles, color: 'text-blue-500', bg: 'bg-blue-50' },
              { to: '/forum', title: 'Comunidad', desc: 'Foros de estudio', icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
              { to: '/catalog', title: 'Tienda XP', desc: 'Canjea tus logros', icon: ShoppingBag, color: 'text-sky-400', bg: 'bg-sky-50' },
            ].map((link, i) => (
              <Link key={i} to={link.to} className="group block">
                <div className="h-full p-6 rounded-[2.5rem] bg-white border border-slate-100 shadow-xl shadow-slate-200/30 hover:shadow-sky-200/30 hover:border-sky-200 transition-all duration-300 flex items-center gap-6">
                   <div className={`${link.bg} ${link.color} p-5 rounded-[1.5rem] group-hover:scale-110 transition-transform duration-500 shadow-sm`}>
                      <link.icon className="h-7 w-7" />
                   </div>
                   <div>
                      <h4 className="font-black text-slate-900 text-xl leading-none">{link.title}</h4>
                      <p className="text-xs font-bold text-slate-400 mt-2">{link.desc}</p>
                   </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* --- LEADERBOARD SIDEBAR --- */}
        <aside className="space-y-8">
          <Card className="border-none shadow-2xl shadow-sky-900/10 bg-sky-600 text-white rounded-[3rem] overflow-hidden flex flex-col h-full">
            <CardHeader className="p-10 pb-6">
              <div className="flex justify-between items-center mb-2">
                 <CardTitle className="text-2xl font-black">Ranking</CardTitle>
                 <div className="bg-white/20 p-2 rounded-xl">
                   <TrendingUp className="h-5 w-5 text-white" />
                 </div>
              </div>
              <Badge className="bg-white/10 hover:bg-white/20 text-sky-100 border-none font-black text-[10px] uppercase tracking-[0.2em] px-4 py-1">
                Liga de Diamante
              </Badge>
            </CardHeader>
            <CardContent className="p-10 pt-0 space-y-5 flex-1">
              <div className="space-y-4">
                {topUsers.length > 0 ? (
                  topUsers.slice(0, 6).map((user, idx) => (
                    <div key={idx} className={`flex items-center gap-5 p-4 rounded-3xl transition-all duration-300 ${
                       idx === 0 ? 'bg-white/20 border border-white/30 scale-105 shadow-xl' : 'bg-white/10 border border-transparent'
                    }`}>
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-sm font-black shadow-lg ${
                        idx === 0 ? 'bg-white text-sky-600' :
                        idx === 1 ? 'bg-sky-200 text-sky-800' :
                        idx === 2 ? 'bg-sky-800 text-white' :
                        'bg-white/10 text-sky-100 shadow-none'
                      }`}>
                        {idx + 1}
                      </div>
                      <div className="flex-1 truncate">
                        <p className="text-base font-black truncate">{user.user__username}</p>
                        <p className="text-[10px] font-black text-sky-200 uppercase tracking-widest">Nivel {user.level}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-base font-black text-white">{user.total_xp.toLocaleString()}</p>
                        <p className="text-[9px] font-black uppercase text-sky-200/60 tracking-tighter">XP</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-20 opacity-50">
                    <Users className="h-12 w-12 mx-auto mb-4" />
                    <p className="text-xs font-black uppercase tracking-widest">Calculando Posiciones...</p>
                  </div>
                )}
              </div>
              
              <Button variant="ghost" className="w-full mt-10 h-14 rounded-2xl text-white hover:bg-white/10 font-black text-xs uppercase tracking-[0.2em] transition-all border border-white/20 group" asChild>
                <Link to="/ranking" className="flex items-center justify-center gap-2">
                  <span>Ver Todos</span>
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
