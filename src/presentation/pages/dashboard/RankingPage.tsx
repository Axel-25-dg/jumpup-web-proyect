import { useEffect, useState } from 'react'
import { apiClient } from '@/infrastructure/http/axios-client'
import { Globe } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/presentation/components/ui/card'
import { Skeleton } from '@/presentation/components/ui/skeleton'

interface RankingUser {
  user__username: string
  total_xp: number
  level: number
}

interface Language {
  id: number
  name: string
  code: string
}

export default function RankingPage() {
  const [ranking, setRanking] = useState<RankingUser[]>([])
  const [languages, setLanguages] = useState<Language[]>([])
  const [selectedLanguage, setSelectedLanguage] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchLanguages() {
      try {
        const langRes = await apiClient.get<Language[]>('/languages/')
        setLanguages(langRes.data)
      } catch (err) {
        console.error('Error fetching languages:', err)
      }
    }
    fetchLanguages()
  }, [])

  useEffect(() => {
    async function fetchRanking() {
      setIsLoading(true)
      try {
        const url = selectedLanguage 
          ? `/ranking/?language=${selectedLanguage}`
          : '/ranking/'
        const rankRes = await apiClient.get<RankingUser[]>(url)
        setRanking(rankRes.data)
      } catch (err) {
        console.error('Error fetching ranking:', err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchRanking()
  }, [selectedLanguage])

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Title block */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tabla de Clasificación</h1>
          <p className="text-muted-foreground">Compite de forma amistosa con estudiantes de todo el mundo.</p>
        </div>

        {/* Language Filter */}
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-muted-foreground" />
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="rounded-md border border-input bg-background px-3 py-1.5 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            <option value="">Todos los idiomas</option>
            {languages.map((lang) => (
              <option key={lang.id} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Podium Top 3 */}
        <div className="md:col-span-3 grid gap-4 grid-cols-3 items-end pt-8 pb-4 max-w-2xl mx-auto w-full text-center">
          {/* Second Place */}
          {ranking[1] && (
            <div className="flex flex-col items-center space-y-2">
              <div className="relative">
                <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center font-bold text-lg border-2 border-slate-300">
                  🥈
                </div>
                <div className="absolute -top-3 -right-1 bg-slate-400 text-white rounded-full text-xs h-5 w-5 flex items-center justify-center font-bold">
                  2
                </div>
              </div>
              <p className="font-semibold text-sm truncate max-w-[100px]">{ranking[1].user__username}</p>
              <div className="bg-slate-100 dark:bg-slate-800 rounded-t-lg p-3 w-full h-24 flex flex-col justify-center">
                <span className="text-xs text-muted-foreground">Nivel {ranking[1].level}</span>
                <span className="font-bold text-sm text-slate-700 dark:text-slate-300">{ranking[1].total_xp} XP</span>
              </div>
            </div>
          )}

          {/* First Place */}
          {ranking[0] && (
            <div className="flex flex-col items-center space-y-2 transform -translate-y-4">
              <div className="relative">
                <div className="h-20 w-20 rounded-full bg-amber-100 flex items-center justify-center font-bold text-2xl border-4 border-amber-400 animate-bounce">
                  👑
                </div>
                <div className="absolute -top-3 right-1/2 translate-x-1/2 bg-amber-500 text-white rounded-full text-xs h-6 w-6 flex items-center justify-center font-bold shadow">
                  1
                </div>
              </div>
              <p className="font-extrabold text-sm truncate max-w-[120px]">{ranking[0].user__username}</p>
              <div className="bg-amber-100/50 dark:bg-amber-950/20 border border-amber-200 rounded-t-xl p-4 w-full h-32 flex flex-col justify-center">
                <span className="text-xs text-amber-700 dark:text-amber-400 font-semibold">Nivel {ranking[0].level}</span>
                <span className="font-extrabold text-base text-amber-800 dark:text-amber-300">{ranking[0].total_xp} XP</span>
              </div>
            </div>
          )}

          {/* Third Place */}
          {ranking[2] && (
            <div className="flex flex-col items-center space-y-2">
              <div className="relative">
                <div className="h-16 w-16 rounded-full bg-amber-50 flex items-center justify-center font-bold text-lg border-2 border-amber-600/30">
                  🥉
                </div>
                <div className="absolute -top-3 -left-1 bg-amber-600/80 text-white rounded-full text-xs h-5 w-5 flex items-center justify-center font-bold">
                  3
                </div>
              </div>
              <p className="font-semibold text-sm truncate max-w-[100px]">{ranking[2].user__username}</p>
              <div className="bg-amber-50/30 dark:bg-amber-950/10 rounded-t-lg p-3 w-full h-20 flex flex-col justify-center">
                <span className="text-xs text-muted-foreground">Nivel {ranking[2].level}</span>
                <span className="font-bold text-sm text-amber-700">{ranking[2].total_xp} XP</span>
              </div>
            </div>
          )}
        </div>

        {/* Complete Table List */}
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle className="text-lg">Clasificación General</CardTitle>
            <CardDescription>Lista de estudiantes activos ordenados por XP de mayor a menor.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : ranking.length > 0 ? (
              <div className="overflow-hidden rounded-lg border">
                <table className="w-full text-sm">
                  <thead className="bg-muted text-muted-foreground font-semibold text-left">
                    <tr>
                      <th className="p-3 text-center w-16">Puesto</th>
                      <th className="p-3">Estudiante</th>
                      <th className="p-3 text-center">Nivel</th>
                      <th className="p-3 text-right">Puntos de Experiencia (XP)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {ranking.map((user, index) => (
                      <tr key={index} className="hover:bg-muted/50 transition-colors">
                        <td className="p-3 text-center font-bold">
                          {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                        </td>
                        <td className="p-3 font-semibold text-card-foreground">
                          {user.user__username}
                        </td>
                        <td className="p-3 text-center text-muted-foreground">
                          {user.level}
                        </td>
                        <td className="p-3 text-right font-extrabold text-primary">
                          {user.total_xp} XP
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                No hay estudiantes en el ranking para este filtro.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
