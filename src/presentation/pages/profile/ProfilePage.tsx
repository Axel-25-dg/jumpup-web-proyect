import { useEffect, useState } from 'react'
import { useAuthStore } from '@/presentation/store/auth.store'
import { apiClient } from '@/infrastructure/http/axios-client'
import {
  LogOut, Edit2, CheckCircle2, User, Mail, Award, Zap, Flame, Share2
} from 'lucide-react'
import { Button } from '@/presentation/components/ui/button'

export default function ProfilePage() {
  const { user, logout } = useAuthStore()
  const [stats, setStats] = useState<any>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [firstName, setFirstName] = useState(user?.username || '')
  const [lastName, setLastName] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    async function fetchStats() {
      if (user?.role === 'student') {
        try {
          const res = await apiClient.get('/dashboard/student/')
          setStats(res.data.data)
        } catch (err) {
          console.error('Error fetching student stats:', err)
        }
      }
    }
    fetchStats()
  }, [user])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      setIsEditing(false)
    } catch (err) {
      console.error('Error saving profile:', err)
    } finally {
      setIsSaving(false)
    }
  }

  const xpPercent = stats
    ? Math.min(100, Math.round((stats.xp_progress / (stats.xp_for_next_level || 100)) * 100))
    : 0

  return (
    <div className="animate-in fade-in duration-500">
      {/* HERO HEADER */}
      <section className="border-b border-slate-900/10 dark:border-white/10 px-8 md:px-12 py-14 md:py-16 bg-white dark:bg-transparent">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <div className="h-20 w-20 border border-slate-900/10 dark:border-white/10 flex items-center justify-center bg-slate-50 dark:bg-white/5">
              <span className="text-2xl font-black text-sky-500 uppercase">
                {user?.username?.substring(0, 2)}
              </span>
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white uppercase">
                {user?.username}
              </h1>
              <p className="label-micro text-slate-400 mt-1">{user?.email}</p>
              <div className="flex items-center gap-3 mt-4">
                <span className="chip">
                  <User className="h-3 w-3 text-sky-500" />
                  {user?.role === 'student' ? 'Estudiante' : user?.role === 'teacher' ? 'Profesor' : 'Admin'}
                </span>
                {stats && (
                  <span className="chip border-sky-500/20 bg-sky-500/[0.05] text-sky-600">
                    <Award className="h-3 w-3" />
                    Nivel {stats.level}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon" className="rounded-none border-slate-900/10">
              <Share2 className="h-4 w-4" />
            </Button>
            <Button
              onClick={() => isEditing ? handleSave() : setIsEditing(true)}
              disabled={isSaving}
              className="rounded-none gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold uppercase text-[11px] tracking-widest px-8"
            >
              {isSaving ? 'Guardando...' : isEditing ? 'Confirmar Cambios' : 'Editar Perfil'}
              {isEditing ? <CheckCircle2 className="h-4 w-4" /> : <Edit2 className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </section>

      {/* CONTENT GRID */}
      <div className="grid gap-px lg:grid-cols-2 border-b border-slate-900/10 dark:border-white/10 bg-slate-900/10 dark:bg-white/10">

        {/* PERSONAL INFO */}
        <div className="bg-white dark:bg-[#0a0a0b]">
          <div className="flex items-center gap-3 px-8 md:px-10 py-6 border-b border-slate-900/10 dark:border-white/10">
            <div className="flex h-10 w-10 items-center justify-center border border-slate-900/10 dark:border-white/10">
              <User className="h-4 w-4 text-sky-500" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-tight">Información Personal</h2>
              <p className="label-micro text-slate-400 mt-0.5">Gestión de identidad</p>
            </div>
          </div>

          <div className="px-8 md:px-10 py-8 space-y-8">
            <div className="grid sm:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="label-caps text-slate-400">Nombre</label>
                <input
                  disabled={!isEditing}
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  className="w-full border-b border-slate-900/10 dark:border-white/10 bg-transparent py-2.5 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-sky-500 disabled:opacity-60 transition-colors uppercase tracking-tight"
                />
              </div>
              <div className="space-y-2">
                <label className="label-caps text-slate-400">Apellido</label>
                <input
                  disabled={!isEditing}
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  className="w-full border-b border-slate-900/10 dark:border-white/10 bg-transparent py-2.5 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-sky-500 disabled:opacity-60 transition-colors uppercase tracking-tight"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="label-caps text-slate-400">Dirección de Correo</label>
              <div className="flex items-center gap-3 py-2.5 border-b border-slate-900/5 dark:border-white/5 opacity-50">
                <Mail className="h-4 w-4 text-slate-400" />
                <span className="text-sm font-medium text-slate-500">{user?.email}</span>
              </div>
            </div>
          </div>
        </div>

        {/* RENDIMIENTO */}
        <div className="bg-white dark:bg-[#0a0a0b]">
          <div className="flex items-center gap-3 px-8 md:px-10 py-6 border-b border-slate-900/10 dark:border-white/10">
            <div className="flex h-10 w-10 items-center justify-center border border-slate-900/10 dark:border-white/10">
              <Zap className="h-4 w-4 text-sky-500" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-tight">Rendimiento Técnico</h2>
              <p className="label-micro text-slate-400 mt-0.5">Métricas de aprendizaje</p>
            </div>
          </div>

          {stats ? (
            <div className="px-8 md:px-10 py-8 space-y-8">
              <div className="grid grid-cols-2 gap-px bg-slate-900/10 dark:bg-white/10 border border-slate-900/10 dark:border-white/10">
                {[
                  { label: 'Racha Actual', value: `${stats.current_streak} DÍAS`, icon: Flame },
                  { label: 'Experiencia', value: stats.total_xp?.toLocaleString() ?? 0, icon: Zap },
                  { label: 'Rango MCER', value: stats.level ?? 1, icon: Award },
                  { label: 'Eficiencia', value: `${xpPercent}%`, icon: CheckCircle2 },
                ].map((s, i) => (
                  <div key={i} className="p-6 bg-white dark:bg-[#0a0a0b] card-hover">
                    <p className="text-2xl font-black tracking-tighter text-slate-900 dark:text-white">{s.value}</p>
                    <p className="label-caps text-slate-400 mt-1">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* XP Bar Editorial */}
              <div className="space-y-3">
                <div className="flex justify-between items-end">
                  <span className="label-caps text-slate-400">Progreso de Nivel</span>
                  <span className="text-sm font-black text-slate-900 dark:text-white">
                    {stats.xp_progress} <span className="text-slate-400 font-medium">/ {stats.xp_for_next_level} XP</span>
                  </span>
                </div>
                <div className="h-1 w-full bg-slate-100 dark:bg-white/5">
                  <div
                    className="h-full bg-sky-500 transition-all duration-1000"
                    style={{ width: `${xpPercent}%` }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="px-8 md:px-10 py-20 text-center flex flex-col items-center">
              <div className="h-12 w-12 border border-slate-900/10 dark:border-white/10 flex items-center justify-center mb-4">
                <Zap className="h-5 w-5 text-slate-300" />
              </div>
              <p className="label-caps text-slate-400">
                {user?.role === 'student' ? 'Sincronizando datos...' : 'Métricas privadas'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* CERRAR SESIÓN / ZONA PELIGROSA */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 px-8 md:px-12 py-10 border-b border-slate-900/10 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.01]">
        <div className="text-center sm:text-left">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-tight">Sesión de Usuario</h3>
          <p className="label-micro text-slate-400 mt-1">Finalizar acceso en este terminal</p>
        </div>
        <Button variant="outline" onClick={logout} className="rounded-none border-rose-500/20 text-rose-500 hover:bg-rose-500 hover:text-white px-10 font-bold uppercase text-[11px] tracking-widest transition-all">
          <LogOut className="h-4 w-4 mr-2" />
          Terminar Sesión
        </Button>
      </div>
    </div>
  )
}
