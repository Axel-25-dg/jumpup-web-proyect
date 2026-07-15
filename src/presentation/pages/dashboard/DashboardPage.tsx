import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiClient } from '@/infrastructure/http/axios-client'
import {
  Trophy,
  Flame,
  BookOpen,
  Award,
  Users,
  Compass,
  ArrowRight,
  TrendingUp,
  Sparkles
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/presentation/components/ui/card'
import { Button } from '@/presentation/components/ui/button'
import { Skeleton } from '@/presentation/components/ui/skeleton'

interface StudentDashboardData {
  total_xp: number
  level: number
  xp_progress: number
  xp_for_next_level: number
  current_streak: number
  longest_streak: number
  progress_percentage: number
  completed_lessons: number
  total_lessons: number
  achievements_count: number
  certificates_count: number
  active_classrooms: number
}

interface Achievement {
  id: number
  achievement: {
    title: string
    description: string
    icon: string
    xp_reward: number
  }
  unlocked_at: string
}

interface RankingUser {
  user__username: string
  total_xp: number
  level: number
}

export default function DashboardPage() {
  const [data, setData] = useState<StudentDashboardData | null>(null)
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [topUsers, setTopUsers] = useState<RankingUser[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const [dashRes, achRes, rankRes] = await Promise.all([
          apiClient.get<StudentDashboardData>('/dashboard/student/'),
          apiClient.get<Achievement[]>('/my-achievements/'),
          apiClient.get<RankingUser[]>('/ranking/')
        ])
        setData(dashRes.data)
        setAchievements(achRes.data.slice(0, 3))
        setTopUsers(rankRes.data.slice(0, 5))
      } catch (err) {
        console.error('Error fetching dashboard data:', err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchDashboardData()
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

  const progressPercent = data ? Math.min(100, Math.round((data.xp_progress / 100) * 100)) : 0

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 p-8 text-white shadow-lg">
        <div className="absolute right-0 top-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute bottom-0 left-1/3 -mb-16 h-48 w-48 rounded-full bg-white/5 blur-xl" />
        
        <div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Nivel {data?.level ?? 1}</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">¡Hola de nuevo!</h1>
            <p className="text-indigo-100 max-w-xl text-sm md:text-base">
              Continúa tu viaje de aprendizaje de idiomas. Cada ejercicio cuenta para tu racha diaria y acumulación de XP.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-white/10 rounded-xl p-4 backdrop-blur-md">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-500 text-white shadow-md">
              <Flame className="h-7 w-7 animate-pulse" />
            </div>
            <div>
              <p className="text-2xl font-bold">{data?.current_streak ?? 0} días</p>
              <p className="text-xs text-indigo-200">Racha actual (Máx: {data?.longest_streak ?? 0}d)</p>
            </div>
          </div>
        </div>

        {/* XP Progress Bar */}
        <div className="mt-8 space-y-2">
          <div className="flex justify-between text-xs font-medium">
            <span>{data?.xp_progress ?? 0} XP acumulados en este nivel</span>
            <span>{100 - (data?.xp_progress ?? 0)} XP para el Nivel {(data?.level ?? 1) + 1}</span>
          </div>
          <div className="h-3 w-full rounded-full bg-white/20">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-400 to-yellow-300 transition-all duration-500 shadow-md"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Progreso de Cursos</CardTitle>
            <BookOpen className="h-4 w-4 text-violet-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.progress_percentage ?? 0}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              {data?.completed_lessons ?? 0} de {data?.total_lessons ?? 0} lecciones completadas
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Logros Desbloqueados</CardTitle>
            <Trophy className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.achievements_count ?? 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Colección de medallas ganadas</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Certificados MCER</CardTitle>
            <Award className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.certificates_count ?? 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Niveles oficiales certificados</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Aulas Virtuales</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.active_classrooms ?? 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Aulas activas con profesores</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid Content */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Side: Recent Achievements & Fast Links */}
        <div className="space-y-6 md:col-span-2">
          {/* Achievements Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Tus Logros Recientes</CardTitle>
                <CardDescription>Sigue practicando para desbloquear más insignias.</CardDescription>
              </div>
              <Trophy className="h-5 w-5 text-amber-500" />
            </CardHeader>
            <CardContent className="space-y-4">
              {achievements.length > 0 ? (
                achievements.map((ach) => (
                  <div key={ach.id} className="flex items-center gap-4 border-b pb-4 last:border-b-0 last:pb-0">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-600 font-bold text-xl">
                      {ach.achievement.icon || '🏅'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm truncate">{ach.achievement.title}</h4>
                      <p className="text-xs text-muted-foreground">{ach.achievement.description}</p>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">
                        +{ach.achievement.xp_reward} XP
                      </span>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {new Date(ach.unlocked_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-muted-foreground text-sm">
                  Aún no has desbloqueado logros. ¡Completa lecciones para empezar!
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Access Card */}
          <Card>
            <CardHeader>
              <CardTitle>Accesos Rápidos</CardTitle>
              <CardDescription>Navega a los diferentes módulos de aprendizaje y comunidad.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <Button variant="outline" className="h-auto flex items-start gap-4 p-4 text-left justify-start" asChild>
                <Link to="/courses">
                  <Compass className="h-6 w-6 text-violet-500 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-bold block text-sm">Cursos de Idiomas</span>
                    <span className="text-xs text-muted-foreground block font-normal">Aprende inglés, francés, alemán y más.</span>
                  </div>
                </Link>
              </Button>

              <Button variant="outline" className="h-auto flex items-start gap-4 p-4 text-left justify-start" asChild>
                <Link to="/chat">
                  <Sparkles className="h-6 w-6 text-indigo-500 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-bold block text-sm">Tutor IA (GPT-4o)</span>
                    <span className="text-xs text-muted-foreground block font-normal">Conversa y aclara dudas gramaticales en vivo.</span>
                  </div>
                </Link>
              </Button>

              <Button variant="outline" className="h-auto flex items-start gap-4 p-4 text-left justify-start" asChild>
                <Link to="/forum">
                  <Users className="h-6 w-6 text-blue-500 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-bold block text-sm">Foro Comunitario</span>
                    <span className="text-xs text-muted-foreground block font-normal">Debates, consejos de estudio y posts.</span>
                  </div>
                </Link>
              </Button>

              <Button variant="outline" className="h-auto flex items-start gap-4 p-4 text-left justify-start" asChild>
                <Link to="/classrooms">
                  <Users className="h-6 w-6 text-emerald-500 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-bold block text-sm">Aulas Virtuales</span>
                    <span className="text-xs text-muted-foreground block font-normal">Accede con el código de tu profesor.</span>
                  </div>
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Side: Leaderboard Preview */}
        <div className="space-y-6">
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>Top Estudiantes</CardTitle>
                <CardDescription>Clasificación global por XP acumulada.</CardDescription>
              </div>
              <TrendingUp className="h-5 w-5 text-violet-500" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {topUsers.length > 0 ? (
                  topUsers.map((user, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                        idx === 0 ? 'bg-amber-100 text-amber-800' :
                        idx === 1 ? 'bg-slate-100 text-slate-800' :
                        idx === 2 ? 'bg-amber-50 text-amber-700' :
                        'text-muted-foreground'
                      }`}>
                        {idx + 1}
                      </div>
                      <div className="flex-1 truncate text-sm font-medium">
                        {user.user__username}
                      </div>
                      <div className="text-right text-xs font-semibold">
                        {user.total_xp} XP
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-muted-foreground text-sm">
                    No hay registros de clasificación.
                  </div>
                )}
              </div>
              
              <Button variant="ghost" className="w-full mt-2 text-xs flex justify-between items-center group" asChild>
                <Link to="/ranking">
                  <span>Ver tabla completa</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
