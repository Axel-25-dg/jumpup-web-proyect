import { useEffect, useState } from 'react'
import { apiClient } from '@/infrastructure/http/axios-client'
import { Trophy, Award, Lock, Sparkles, Star } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/components/ui/card'


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
        const [userAch, allAch] = await Promise.all([
          apiClient.get<UserAchievement[]>('/achievements/mine/'),
          apiClient.get<AchievementData[]>('/achievements/all/')
        ])
        setAchievements(Array.isArray(userAch.data) ? userAch.data : [])
        setAllAchievements(Array.isArray(allAch.data) ? allAch.data : [])
      } catch (err) {
        console.error('Error fetching achievements:', err)
      } finally {
        setIsLoading(false)
      }
    }
    loadAchievements()
  }, [])

  // Combinar logros obtenidos y no obtenidos
  const unlockedIds = new Set(achievements.map(a => a.achievement.id))
  
  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-r from-amber-500 to-orange-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-orange-200">
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-2 flex items-center gap-3">
            <Trophy className="h-10 w-10 text-amber-200" /> Mis Logros
          </h1>
          <p className="text-amber-100 text-lg font-medium">Completa lecciones y gana XP para desbloquear estas medallas exclusivas.</p>
        </div>
        <div className="bg-white/20 backdrop-blur-md px-6 py-4 rounded-3xl flex items-center gap-4 border border-white/20">
          <Award className="h-12 w-12 text-amber-300" />
          <div>
            <p className="text-sm font-black uppercase tracking-widest text-amber-200">Desbloqueados</p>
            <p className="text-3xl font-black">{achievements.length} <span className="text-lg text-amber-200 font-bold">/ {allAchievements.length || '?'}</span></p>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {[...Array(6)].map((_, i) => (
             <div key={i} className="h-48 rounded-[2rem] bg-slate-100 animate-pulse" />
           ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allAchievements.map((ach) => {
            const isUnlocked = unlockedIds.has(ach.id)
            const unlockedData = achievements.find(a => a.achievement.id === ach.id)

            return (
              <Card 
                key={ach.id} 
                className={`overflow-hidden rounded-[2rem] border-2 transition-all duration-300 hover:-translate-y-2 ${
                  isUnlocked 
                    ? 'border-amber-200 bg-gradient-to-b from-amber-50 to-white shadow-xl shadow-amber-100/50' 
                    : 'border-slate-100 bg-slate-50 opacity-80'
                }`}
              >
                <CardHeader className="text-center pb-2 pt-8 relative">
                  {isUnlocked && (
                    <div className="absolute top-4 right-4 flex items-center gap-1 bg-amber-100 text-amber-700 px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                       <Sparkles className="h-3 w-3" /> Obtenido
                    </div>
                  )}
                  <div className={`mx-auto h-24 w-24 rounded-full flex items-center justify-center text-4xl mb-4 shadow-inner ${
                    isUnlocked ? 'bg-amber-100 shadow-amber-200' : 'bg-slate-200 grayscale'
                  }`}>
                    {ach.iconUrl || (isUnlocked ? '🏅' : <Lock className="h-10 w-10 text-slate-400" />)}
                  </div>
                  <CardTitle className={`text-xl font-black ${isUnlocked ? 'text-amber-900' : 'text-slate-500'}`}>
                    {ach.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center pb-8">
                  <p className="text-sm font-medium text-slate-500 mb-4">{ach.description}</p>
                  
                  {isUnlocked ? (
                    <div className="inline-flex items-center gap-1.5 text-xs font-black text-amber-600 bg-amber-100 px-3 py-1.5 rounded-full">
                       <Star className="h-3.5 w-3.5 fill-amber-500" />
                       Desbloqueado el {new Date(unlockedData!.unlocked_at).toLocaleDateString()}
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-1.5 text-xs font-black text-slate-400 bg-slate-200 px-3 py-1.5 rounded-full">
                       <Lock className="h-3 w-3" />
                       Requiere {ach.requiredXp} XP
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
          
          {allAchievements.length === 0 && (
             <div className="col-span-full text-center py-20 text-slate-500 font-medium">
                No hay logros disponibles en este momento.
             </div>
          )}
        </div>
      )}
    </div>
  )
}
