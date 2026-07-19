import { useEffect, useState } from 'react'
import { apiClient } from '@/infrastructure/http/axios-client'
import { Trophy, Award, Lock, Sparkles, ArrowLeft } from 'lucide-react'
import { Button } from '@/presentation/components/ui/button'
import { Link } from 'react-router-dom'

interface AchievementData {
  id: number
  name: string
  description: string
  iconUrl?: string
  requiredXp: number
}

interface UserAchievement {
  id: number
  unlocked_at: string
  achievement: AchievementData
}

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState<UserAchievement[]>([])
  const [allAchievements, setAllAchievements] = useState<AchievementData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadAchievements() {
      setIsLoading(true)
      try {
        const [userAch, allAch] = await Promise.allSettled([
          apiClient.get<UserAchievement[]>('/my-achievements/'),
          apiClient.get<AchievementData[]>('/achievements/')
        ])
        if (userAch.status === 'fulfilled') {
          const d = userAch.value.data as any
          setAchievements(Array.isArray(d) ? d : (d?.results || []))
        }
        if (allAch.status === 'fulfilled') {
          const d = allAch.value.data as any
          setAllAchievements(Array.isArray(d) ? d : (d?.results || []))
        }
      } catch (err) {
        console.error('Error fetching achievements:', err)
      } finally {
        setIsLoading(false)
      }
    }
    loadAchievements()
  }, [])

  const unlockedIds = new Set(achievements.map(a => a.achievement?.id).filter(Boolean))
  
  return (
    <div className="animate-in fade-in duration-500">
      {/* HERO */}
      <section className="border-b border-slate-900/10 dark:border-white/10 px-8 md:px-12 py-14 md:py-16">
        <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" asChild className="-ml-2 rounded-none hover:bg-slate-100 dark:hover:bg-white/5">
                <Link to="/dashboard"><ArrowLeft className="h-4 w-4" /></Link>
              </Button>
              <div className="chip">
                <Trophy className="h-3.5 w-3.5 text-sky-500" />
                Gamificación
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white uppercase">
              Tus <span className="text-sky-500">Logros</span>.
            </h1>
            <p className="text-base text-slate-500 dark:text-slate-400 max-w-lg font-medium leading-relaxed">
              Consigue objetivos de aprendizaje y acumula XP para desbloquear estas credenciales de excelencia técnica.
            </p>
          </div>
          <div className="label-caps border border-slate-900/10 dark:border-white/10 px-8 py-6 flex items-center gap-6 bg-white dark:bg-transparent shrink-0">
            <div className="h-12 w-12 border border-slate-900/10 dark:border-white/10 flex items-center justify-center bg-slate-50 dark:bg-white/5">
              <Award className="h-6 w-6 text-sky-500" />
            </div>
            <div>
              <p className="label-micro text-slate-400 mb-1 tracking-widest">PROGRESO TOTAL</p>
              <p className="text-3xl font-black text-slate-900 dark:text-white leading-none">
                {achievements.length} <span className="text-sm text-slate-400 font-mono">/ {allAchievements.length || '00'}</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* GRID */}
      <div className="px-8 md:px-12 py-12 bg-[#f7f6f3] dark:bg-[#0a0a0b]">
        {isLoading ? (
          <div className="grid gap-px sm:grid-cols-2 lg:grid-cols-4 bg-slate-900/10 dark:bg-white/10 border border-slate-900/10 dark:border-white/10">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-64 bg-white dark:bg-[#0a0a0b] animate-pulse" />
            ))}
          </div>
        ) : allAchievements.length === 0 ? (
          <div className="border border-slate-900/10 dark:border-white/10 py-32 text-center bg-white dark:bg-[#0a0a0b]">
            <div className="h-20 w-20 border border-slate-900/10 dark:border-white/10 mx-auto mb-6 flex items-center justify-center">
              <Trophy className="h-8 w-8 text-slate-200 dark:text-slate-700" />
            </div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Sin Logros en Sistema</h3>
            <p className="label-micro text-slate-400 max-w-xs mx-auto mt-2 leading-relaxed">
              El sistema de gamificación está siendo configurado por el equipo técnico.
            </p>
          </div>
        ) : (
          <div className="grid gap-px sm:grid-cols-2 lg:grid-cols-4 bg-slate-900/10 dark:bg-white/10 border border-slate-900/10 dark:border-white/10">
            {allAchievements.map((ach) => {
              const isUnlocked = unlockedIds.has(ach.id)
              const unlockedData = achievements.find(a => a.achievement?.id === ach.id)

              return (
                <div 
                  key={ach.id} 
                  className={`p-8 bg-white dark:bg-[#0a0a0b] hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors group flex flex-col justify-between h-full ${
                    !isUnlocked ? 'opacity-50 grayscale' : ''
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-8">
                      <div className={`flex h-12 w-12 items-center justify-center border transition-all ${
                        isUnlocked
                        ? 'border-sky-500/20 bg-sky-500/5 text-sky-500 group-hover:bg-sky-500 group-hover:text-white'
                        : 'border-slate-900/10 dark:border-white/10 text-slate-300 dark:text-slate-600'
                      }`}>
                        {/* Always render both icons, toggle visibility with CSS to avoid React DOM reconciliation errors */}
                        <Trophy className={`h-5 w-5 transition-all duration-200 ${isUnlocked ? 'block' : 'hidden'}`} />
                        <Lock className={`h-5 w-5 transition-all duration-200 ${isUnlocked ? 'hidden' : 'block'}`} />
                      </div>
                      <span className={`label-micro font-black text-sky-500 tracking-[0.2em] transition-all duration-200 ${
                        isUnlocked ? 'opacity-100' : 'opacity-0 pointer-events-none'
                      }`}>UNLOCKED</span>
                    </div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white tracking-tight uppercase leading-tight mb-2 group-hover:text-sky-500 transition-colors">
                      {ach.name}
                    </h3>
                    <p className="label-micro text-slate-400 dark:text-slate-500 leading-relaxed">
                      {ach.description}
                    </p>
                  </div>

                  <div className="mt-10 pt-6 border-t border-slate-900/5 dark:border-white/5">
                    {isUnlocked && unlockedData ? (
                      <div className="flex flex-col gap-1">
                        <span className="label-micro text-slate-400">FECHA OBTENCIÓN</span>
                        <div className="label-micro font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                          <Sparkles className="h-3 w-3" />
                          {new Date(unlockedData.unlocked_at).toLocaleDateString('es-ES').toUpperCase()}
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-1">
                        <span className="label-micro text-slate-400 tracking-widest">REQUISITO</span>
                        <div className="label-micro font-black text-slate-500 flex items-center gap-2">
                          <div className="h-1.5 w-1.5 bg-slate-300 dark:bg-slate-700" />
                          {ach.requiredXp} XP REQUERIDO
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
