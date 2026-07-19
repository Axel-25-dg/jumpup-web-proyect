import { useEffect, useState } from 'react'
import { apiClient } from '@/infrastructure/http/axios-client'
import { Globe, Trophy, Medal, Award } from 'lucide-react'

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
        if (Array.isArray(langRes.data)) setLanguages(langRes.data)
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
        const url = selectedLanguage ? `/ranking/?language=${selectedLanguage}` : '/ranking/'
        const rankRes = await apiClient.get<RankingUser[]>(url)
        setRanking(Array.isArray(rankRes.data) ? rankRes.data : [])
      } catch (err) {
        console.error('Error fetching ranking:', err)
        setRanking([])
      } finally {
        setIsLoading(false)
      }
    }
    fetchRanking()
  }, [selectedLanguage])

  const podiumIcon = (index: number) => {
    if (index === 0) return <Trophy className="h-5 w-5 text-amber-500" />
    if (index === 1) return <Medal className="h-5 w-5 text-slate-400" />
    if (index === 2) return <Award className="h-5 w-5 text-amber-700" />
    return null
  }

  return (
    <div className="animate-in fade-in duration-500">
      {/* HERO */}
      <section className="border-b border-slate-900/10 dark:border-white/10 px-8 md:px-12 py-12 md:py-16">
        <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-8">
          <div className="space-y-4">
            <div className="chip">
              <Trophy className="h-3.5 w-3.5 text-sky-500" />
              Clasificación Global
            </div>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
              Tabla de <span className="text-sky-500">Clasificación</span>.
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-lg">
              Compite de forma amistosa con estudiantes de todo el mundo y sube en el ranking ganando XP.
            </p>
          </div>
          <div className="flex items-center gap-2 border border-slate-900/10 dark:border-white/10 px-4 py-2.5 bg-white dark:bg-white/[0.03] shrink-0">
            <Globe className="h-4 w-4 text-slate-400" />
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="bg-transparent text-sm font-medium text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              <option value="">Todos los idiomas</option>
              {languages.map((lang) => (
                <option key={lang.id} value={lang.code}>{lang.name}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* PODIUM TOP 3 */}
      {!isLoading && ranking.length >= 3 && (
        <section className="border-b border-slate-900/10 dark:border-white/10 px-8 md:px-12 py-10">
          <div className="grid grid-cols-3 max-w-lg mx-auto gap-px border border-slate-900/10 dark:border-white/10">
            {/* 2nd */}
            <div className="flex flex-col items-center gap-2 p-6 border-r border-slate-900/10 dark:border-white/10 self-end">
              <Medal className="h-6 w-6 text-slate-400" />
              <span className="label-micro text-slate-400">2º</span>
              <p className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-full text-center">{ranking[1].user__username}</p>
              <span className="text-xs font-black text-sky-500">{ranking[1].total_xp} XP</span>
              <div className="w-full bg-slate-100 dark:bg-white/5 h-16" />
            </div>
            {/* 1st */}
            <div className="flex flex-col items-center gap-2 p-6 border-r border-slate-900/10 dark:border-white/10">
              <Trophy className="h-7 w-7 text-amber-500" />
              <span className="label-micro text-amber-500">1º</span>
              <p className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-full text-center">{ranking[0].user__username}</p>
              <span className="text-xs font-black text-sky-500">{ranking[0].total_xp} XP</span>
              <div className="w-full bg-amber-50 dark:bg-amber-900/10 border border-amber-200/50 dark:border-amber-500/10 h-24" />
            </div>
            {/* 3rd */}
            <div className="flex flex-col items-center gap-2 p-6 self-end">
              <Award className="h-6 w-6 text-amber-700" />
              <span className="label-micro text-amber-700">3º</span>
              <p className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-full text-center">{ranking[2].user__username}</p>
              <span className="text-xs font-black text-sky-500">{ranking[2].total_xp} XP</span>
              <div className="w-full bg-slate-50 dark:bg-white/5 h-10" />
            </div>
          </div>
        </section>
      )}

      {/* FULL TABLE */}
      <div className="px-8 md:px-12 py-8">
        <div className="border border-slate-900/10 dark:border-white/10 overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-[3rem_1fr_6rem_8rem] border-b border-slate-900/10 dark:border-white/10 bg-white dark:bg-white/[0.03] px-4 py-3">
            <span className="label-micro text-slate-400 text-center">#</span>
            <span className="label-micro text-slate-400">Estudiante</span>
            <span className="label-micro text-slate-400 text-center">Nivel</span>
            <span className="label-micro text-slate-400 text-right">XP</span>
          </div>

          {isLoading ? (
            <div className="divide-y divide-slate-900/5 dark:divide-white/5">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-14 animate-pulse bg-slate-50 dark:bg-white/[0.01]" />
              ))}
            </div>
          ) : ranking.length > 0 ? (
            <div className="divide-y divide-slate-900/5 dark:divide-white/5">
              {ranking.map((u, index) => (
                <div
                  key={index}
                  className={`grid grid-cols-[3rem_1fr_6rem_8rem] items-center px-4 py-3.5 hover:bg-sky-500/[0.04] transition-colors ${
                    index < 3 ? 'bg-white dark:bg-white/[0.02]' : ''
                  }`}
                >
                  <div className="flex justify-center">
                    {podiumIcon(index) ?? (
                      <span className="label-micro text-slate-400 w-6 text-center">{index + 1}</span>
                    )}
                  </div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{u.user__username}</p>
                  <p className="label-micro text-slate-500 text-center">Nv. {u.level}</p>
                  <p className="text-sm font-black text-sky-500 text-right">{u.total_xp} XP</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 label-micro text-slate-400">
              Sin estudiantes en el ranking para este filtro.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
