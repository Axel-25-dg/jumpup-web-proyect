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
  RefreshCw,
  Zap,
  Star
} from 'lucide-react'
import { Button } from '@/presentation/components/ui/button'
import { Skeleton } from '@/presentation/components/ui/skeleton'

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
        <Skeleton className="h-[280px] w-full" />
        <div className="grid gap-px md:grid-cols-2 lg:grid-cols-4 border border-slate-900/10 dark:border-white/10">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-36 w-full" />
          ))}
        </div>
        <div className="grid gap-8 lg:grid-cols-3">
          <Skeleton className="h-[400px] lg:col-span-2" />
          <Skeleton className="h-[400px]" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-10 border border-slate-900/10 dark:border-white/10 border-dashed">
        <div className="border border-rose-200 dark:border-rose-900/30 p-6 mb-6">
          <RefreshCw className="h-10 w-10 text-rose-500" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">Algo salió mal</h2>
        <p className="text-slate-500 dark:text-slate-400 font-medium mb-8 max-w-md text-sm leading-relaxed">{error}</p>
        <Button onClick={loadData} className="gap-2">
          <RefreshCw className="h-4 w-4" /> Intentar de nuevo
        </Button>
      </div>
    )
  }

  const progressPercent = data ? Math.min(100, Math.round((data.xp_progress / (data.xp_for_next_level || 100)) * 100)) : 0

  return (
    <div className="space-y-0 animate-in fade-in duration-700">
      {/* --- HERO BANNER — Editorial Style --- */}
      <section className="border-b border-slate-900/10 dark:border-white/10 py-14 md:py-20">
        <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-10">
          <div className="space-y-6 max-w-2xl">
            {/* Chips row */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="chip">
                <Star className="h-3.5 w-3.5 text-sky-500" />
                Nivel {data?.level ?? 1}
              </div>
              <div className="chip">
                <Zap className="h-3.5 w-3.5 text-sky-500" />
                {(data?.total_xp ?? 0).toLocaleString()} XP Acumulados
              </div>
              <div className="chip">
                <Flame className="h-3.5 w-3.5 text-sky-500" />
                Racha de {data?.current_streak ?? 0} días
              </div>
            </div>

            {/* Heading */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.05] text-slate-900 dark:text-white">
              Hola, <span className="text-sky-500">JumpUper</span>.
            </h1>
            <p className="text-base sm:text-lg leading-relaxed text-slate-600 dark:text-slate-300 max-w-lg">
              Mantienes una racha de <span className="font-bold text-slate-900 dark:text-white">{data?.current_streak ?? 0} días</span>. Sigue avanzando hacia el nivel {(data?.level ?? 1) + 1}.
            </p>

            {/* XP Progress Bar — editorial */}
            <div className="space-y-2 max-w-sm">
              <div className="flex justify-between">
                <span className="label-caps text-slate-500 dark:text-slate-400">Próximo nivel</span>
                <span className="label-caps text-slate-900 dark:text-white">{data?.xp_progress ?? 0} / {data?.xp_for_next_level ?? 100} XP</span>
              </div>
              <div className="h-1.5 w-full bg-slate-900/10 dark:bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-sky-500 transition-all duration-1000 ease-out"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* CTA */}
          <Button asChild size="lg" className="shrink-0 gap-3 group">
            <Link to="/courses">
              Continuar Aprendiendo
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
      </section>

      {/* --- QUICK STATS GRID — Editorial, matches public features grid --- */}
      <section className="border-b border-slate-900/10 dark:border-white/10">
        <div className="grid grid-cols-2 lg:grid-cols-4 border-l border-slate-900/10 dark:border-white/10">
          {[
            { label: 'Progreso', value: `${data?.progress_percentage ?? 0}%`, sub: `${data?.completed_lessons ?? 0} lecciones`, icon: BookOpen },
            { label: 'Insignias', value: data?.achievements_count ?? 0, sub: 'Logros desbloqueados', icon: Trophy },
            { label: 'Títulos', value: data?.certificates_count ?? 0, sub: 'Certificados MCER', icon: Award },
            { label: 'Aulas', value: data?.active_classrooms ?? 0, sub: 'Clases activas', icon: Users },
          ].map((stat, i) => (
            <div key={i} className="p-8 md:p-10 border-b border-r border-slate-900/10 dark:border-white/10 group card-hover">
              <div className="flex h-12 w-12 items-center justify-center border border-slate-900/10 dark:border-white/10 mb-6">
                <stat.icon className="h-5 w-5 text-sky-500" />
              </div>
              <p className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
                {stat.value}
              </p>
              <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">{stat.label}</p>
              <p className="mt-1 text-sm text-slate-400 dark:text-slate-500">{stat.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* --- MAIN DASHBOARD CONTENT --- */}
      <div className="grid gap-px lg:grid-cols-3 border-t border-slate-900/10 dark:border-white/10 mt-0">
        {/* Achievements & Quick Links */}
        <div className="lg:col-span-2 border-r border-slate-900/10 dark:border-white/10">

          {/* Section header */}
          <div className="flex items-center justify-between px-8 md:px-10 py-6 border-b border-slate-900/10 dark:border-white/10">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Tus Logros</h2>
              <p className="label-caps text-slate-400 dark:text-slate-500 mt-1">Lo que has conquistado</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center border border-slate-900/10 dark:border-white/10">
              <Trophy className="h-4 w-4 text-sky-500" />
            </div>
          </div>

          {/* Achievements list */}
          <div className="divide-y divide-slate-900/5 dark:divide-white/5">
            {achievements.length > 0 ? (
              achievements.map((ach) => (
                <div key={ach.id} className="flex items-center gap-6 px-8 md:px-10 py-6 group card-hover transition-colors">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center border border-slate-900/10 dark:border-white/10">
                    {ach.achievement?.icon ? (
                      <span className="text-2xl">{ach.achievement.icon}</span>
                    ) : (
                      <Award className="h-5 w-5 text-sky-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-900 dark:text-white text-base tracking-tight">{ach.achievement?.title}</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">{ach.achievement?.description}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="label-caps text-sky-500">+{ach.achievement?.xp_reward || 0} XP</span>
                    <span className="label-micro text-slate-400 dark:text-slate-500">
                      {ach.unlocked_at ? new Date(ach.unlocked_at).toLocaleDateString() : 'Reciente'}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-20 px-10">
                <div className="flex h-16 w-16 items-center justify-center border border-slate-900/10 dark:border-white/10 mx-auto mb-6">
                  <Sparkles className="h-6 w-6 text-sky-500" />
                </div>
                <p className="label-caps text-slate-400 dark:text-slate-500">Completa lecciones para desbloquear logros</p>
              </div>
            )}
          </div>

          {/* Quick Access Grid */}
          <div className="border-t border-slate-900/10 dark:border-white/10 grid grid-cols-2 border-l border-slate-900/10 dark:border-white/10">
            {[
              { to: '/courses', title: 'Explorar', desc: 'Mis niveles activos', icon: Compass },
              { to: '/social', title: 'Social', desc: 'Conecta con otros', icon: Users },
              { to: '/achievements', title: 'Logros', desc: 'Tus medallas', icon: Trophy },
            ].map((link, i) => (
              <Link key={i} to={link.to} className="group p-8 border-b border-r border-slate-900/10 dark:border-white/10 card-hover transition-colors flex items-center gap-5">
                <div className="flex h-12 w-12 items-center justify-center border border-slate-900/10 dark:border-white/10">
                  <link.icon className="h-5 w-5 text-sky-500" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-base tracking-tight">{link.title}</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{link.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* --- LEADERBOARD SIDEBAR --- Editorial */}
        <aside>
          {/* Header */}
          <div className="flex items-center justify-between px-8 py-6 border-b border-slate-900/10 dark:border-white/10">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Ranking</h2>
              <p className="label-caps text-slate-400 dark:text-slate-500 mt-1">Liga de Diamante</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center border border-slate-900/10 dark:border-white/10">
              <TrendingUp className="h-4 w-4 text-sky-500" />
            </div>
          </div>

          {/* Ranking list */}
          <div className="divide-y divide-slate-900/5 dark:divide-white/5">
            {topUsers.length > 0 ? (
              topUsers.slice(0, 6).map((user, idx) => (
                <div key={idx} className={`flex items-center gap-4 px-8 py-5 transition-colors ${idx === 0 ? 'bg-sky-500/[0.04] dark:bg-sky-500/[0.06]' : 'card-hover'}`}>
                  <span className={`text-sm font-bold w-5 shrink-0 text-right ${idx === 0 ? 'text-sky-500' : 'text-slate-400 dark:text-slate-500'}`}>
                    {idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{user.user__username}</p>
                    <p className="label-micro text-slate-400 dark:text-slate-500 mt-0.5">Nivel {user.level}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{user.total_xp.toLocaleString()}</p>
                    <p className="label-micro text-slate-400 dark:text-slate-500">XP</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-20 opacity-50">
                <Users className="h-10 w-10 mx-auto mb-4 text-slate-400" />
                <p className="label-caps text-slate-400">Calculando posiciones...</p>
              </div>
            )}
          </div>

          <div className="border-t border-slate-900/10 dark:border-white/10 p-6">
            <Button variant="outline" className="w-full gap-2 group" asChild>
              <Link to="/ranking">
                <span>Ver todos</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
        </aside>
      </div>
    </div>
  )
}
