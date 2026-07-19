import { useEffect, useState } from 'react'
import { useAuthStore } from '@/presentation/store/auth.store'
import { apiClient } from '@/infrastructure/http/axios-client'
import { Button } from '@/presentation/components/ui/button'

export default function ProfilePage() {
  const { user, logout, loadSession } = useAuthStore()
  const [stats, setStats] = useState<any>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [firstName, setFirstName] = useState(user?.firstName || '')
  const [lastName, setLastName] = useState(user?.lastName || '')

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
    if (user) {
      fetchStats()
    }
  }, [user])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await apiClient.patch('/auth/me/', {
        first_name: firstName,
        last_name: lastName
      })
      await loadSession() // Reload user data in the store
      setIsEditing(false)
    } catch (err: any) {
      console.error('Error saving profile:', err)
      // fallback to users/me if /auth/me/ is just a view and not updatable
      try {
        await apiClient.patch('/auth/users/me/', {
          first_name: firstName,
          last_name: lastName
        })
        await loadSession()
        setIsEditing(false)
      } catch (fallbackErr) {
        console.error('Error on fallback profile save:', fallbackErr)
      }
    } finally {
      setIsSaving(false)
    }
  }

  const xpPercent = stats?.xp_for_next_level
    ? Math.min(100, Math.round((stats.xp_progress / stats.xp_for_next_level) * 100))
    : 0

  return (
    <div className="animate-in fade-in duration-500">
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
            </div>
          </div>
          <Button disabled={isSaving} onClick={() => isEditing ? handleSave() : setIsEditing(true)} className="rounded-none gap-2">
            {isEditing ? (isSaving ? 'Guardando...' : 'Confirmar') : 'Editar'}
          </Button>
        </div>
      </section>

      <div className="grid gap-px lg:grid-cols-2 border-b border-slate-900/10 dark:border-white/10 bg-slate-900/10">
        <div className="bg-white dark:bg-[#0a0a0b] p-8">
          <h2 className="text-sm font-bold uppercase mb-4">Información Personal</h2>
          <input disabled={!isEditing} value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full border-b py-2 mb-4 bg-transparent outline-none text-slate-900 dark:text-white disabled:opacity-50" placeholder="Nombre" />
          <input disabled={!isEditing} value={lastName} onChange={e => setLastName(e.target.value)} className="w-full border-b py-2 bg-transparent outline-none text-slate-900 dark:text-white disabled:opacity-50" placeholder="Apellido" />
        </div>

        <div className="bg-white dark:bg-[#0a0a0b] p-8">
          {stats && user?.role === 'student' ? (
            <div className="space-y-4">
              <h3 className="font-bold">Rendimiento</h3>
              <p>Total XP: {stats.total_xp}</p>
              <div className="w-full bg-gray-200 h-2"><div style={{ width: `${xpPercent}%` }} className="h-full bg-sky-500" /></div>
            </div>
          ) : (
            <p>Métricas no disponibles</p>
          )}
        </div>
      </div>

      <div className="px-12 py-10">
        <Button variant="outline" onClick={logout}>Terminar Sesión</Button>
      </div>
    </div>
  )
}