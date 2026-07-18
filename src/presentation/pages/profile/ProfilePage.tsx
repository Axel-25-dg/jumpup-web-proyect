import { useEffect, useState } from 'react'
import { useAuthStore } from '@/presentation/store/auth.store'
import { apiClient } from '@/infrastructure/http/axios-client'
import { LogOut, Edit2, CheckCircle2, User, Mail, Camera, Share2, Award, Bolt, Flame } from 'lucide-react'
import { Card, CardContent, CardFooter } from '@/presentation/components/ui/card'
import { Button } from '@/presentation/components/ui/button'
import { Avatar, AvatarFallback } from '@/presentation/components/ui/avatar'
import { Badge } from '@/presentation/components/ui/badge'

export default function ProfilePage() {
  const { user, logout } = useAuthStore()
  const [stats, setStats] = useState<any>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  // Cargar perfil completo al montar
  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await apiClient.get('/auth/me/')
        const data = res.data
        setFirstName(data.username || data.first_name || '')
        setLastName(data.last_name || '')
      } catch {
        // Fallback a datos del store
        setFirstName(user?.username || '')
      }

      // Cargar stats según el rol
      try {
        const role = user?.role?.toLowerCase() || ''
        let res
        if (role === 'student') {
          res = await apiClient.get('/dashboard/student/')
          setStats(res.data.data || res.data)
        } else if (role === 'admin' || role === 'administrador') {
          res = await apiClient.get('/dashboard/admin/')
          setStats(res.data)
        } else if (role === 'teacher' || role === 'profesor') {
          res = await apiClient.get('/dashboard/teacher/')
          setStats(res.data)
        }
      } catch {
        // stats no crítico
      }
    }
    loadProfile()
  }, [user])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await apiClient.patch('/auth/me/', {
        first_name: firstName,
        last_name: lastName,
      })
      // Refrescar store con datos actualizados
      const { data } = await apiClient.get('/auth/me/')
      useAuthStore.setState((state) => ({
        user: state.user ? { ...state.user, username: data.username } : null
      }))
      setIsEditing(false)
    } catch (err: any) {
      console.error('Error saving profile:', err)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
      {/* Header Banner */}
      <Card className="border-none shadow-2xl rounded-[3rem] overflow-hidden bg-white">
        <div className="h-48 bg-gradient-to-r from-sky-400 via-indigo-500 to-purple-600 relative">
           <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        </div>
        <CardContent className="pt-0 px-8 pb-8 relative">
          <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-6 -mt-20 mb-8">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="relative group">
                <Avatar className="h-36 w-36 border-4 border-white shadow-xl bg-white">
                  <AvatarFallback className="text-5xl font-black bg-gradient-to-tr from-sky-100 to-indigo-100 text-indigo-700">
                    {user?.username?.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <button className="absolute bottom-2 right-2 p-3 rounded-full bg-slate-900 text-white shadow-lg hover:scale-110 transition-transform opacity-0 group-hover:opacity-100">
                  <Camera className="h-4 w-4" />
                </button>
              </div>
              <div className="text-center sm:text-left mt-4 sm:mt-16">
                <h1 className="text-3xl font-black text-slate-900 leading-none">{user?.username}</h1>
                <p className="text-slate-500 font-bold mt-1">{user?.email}</p>
                <div className="flex items-center justify-center sm:justify-start gap-2 mt-3">
                  <Badge className="bg-sky-100 text-sky-700 border-none font-black text-[10px] uppercase tracking-widest px-3 py-1 rounded-full">
                    {user?.role === 'student' ? 'Estudiante' : user?.role === 'teacher' ? 'Profesor' : 'Administrador'}
                  </Badge>
                  {stats && (
                    <Badge className="bg-amber-100 text-amber-700 border-none font-black text-[10px] uppercase tracking-widest px-3 py-1 rounded-full">
                      Nivel {stats.level}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 w-full sm:w-auto">
              <Button variant="outline" size="icon" className="rounded-2xl h-12 w-12 text-slate-400 hover:text-slate-700">
                <Share2 className="h-5 w-5" />
              </Button>
              <Button 
                onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                disabled={isSaving}
                className="rounded-2xl h-12 px-6 font-black bg-slate-900 text-white hover:bg-slate-800 flex-1 sm:flex-none"
              >
                {isSaving ? 'Guardando...' : isEditing ? 'Guardar Cambios' : 'Editar Perfil'}
                {isEditing ? <CheckCircle2 className="ml-2 h-4 w-4" /> : <Edit2 className="ml-2 h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Información Personal */}
            <div className="space-y-6 bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100">
              <h3 className="font-black text-lg text-slate-900 flex items-center gap-2">
                <User className="h-5 w-5 text-indigo-500" /> Información Personal
              </h3>
              
              <div className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nombre</label>
                    <input 
                      disabled={!isEditing}
                      value={firstName}
                      onChange={e => setFirstName(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all disabled:opacity-70 disabled:bg-slate-100"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Apellido</label>
                    <input 
                      disabled={!isEditing}
                      value={lastName}
                      onChange={e => setLastName(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all disabled:opacity-70 disabled:bg-slate-100"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Correo Electrónico</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input 
                      disabled
                      value={user?.email}
                      className="w-full bg-slate-100 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm font-bold text-slate-500 outline-none opacity-70"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Estadísticas (Solo Estudiantes) */}
            {stats && user?.role === 'student' && (
              <div className="space-y-6 bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-[2rem] text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <Award className="h-32 w-32" />
                </div>
                <div className="relative z-10">
                  <h3 className="font-black text-lg text-white flex items-center gap-2 mb-6">
                    <Bolt className="h-5 w-5 text-amber-400" /> Rendimiento
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/10 rounded-2xl p-4 border border-white/10">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="bg-amber-400/20 p-1.5 rounded-lg">
                          <Flame className="h-4 w-4 text-amber-400" />
                        </div>
                        <span className="text-xs font-black uppercase tracking-wider text-slate-300">Racha</span>
                      </div>
                      <p className="text-2xl font-black">{stats.current_streak} Días</p>
                    </div>
                    <div className="bg-white/10 rounded-2xl p-4 border border-white/10">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="bg-sky-400/20 p-1.5 rounded-lg">
                          <Bolt className="h-4 w-4 text-sky-400" />
                        </div>
                        <span className="text-xs font-black uppercase tracking-wider text-slate-300">Total XP</span>
                      </div>
                      <p className="text-2xl font-black">{stats.total_xp}</p>
                    </div>
                  </div>

                  <div className="mt-6 space-y-2">
                    <div className="flex justify-between text-xs font-black uppercase tracking-wider text-slate-300">
                      <span>Progreso Nivel {stats.level}</span>
                      <span>{stats.xp_progress} / {stats.xp_for_next_level} XP</span>
                    </div>
                    <div className="h-3 w-full bg-black/40 rounded-full overflow-hidden p-0.5">
                      <div 
                        className="h-full bg-gradient-to-r from-sky-400 to-indigo-500 rounded-full"
                        style={{ width: `${Math.min(100, Math.round((stats.xp_progress / (stats.xp_for_next_level || 100)) * 100))}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="bg-rose-50 p-6 border-t border-rose-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="font-black text-rose-900">Cerrar Sesión</h4>
            <p className="text-sm font-medium text-rose-600">Finalizar tu sesión actual en este dispositivo.</p>
          </div>
          <Button 
            variant="destructive" 
            onClick={logout}
            className="w-full sm:w-auto rounded-xl font-black bg-rose-600 hover:bg-rose-700 shadow-lg shadow-rose-200"
          >
            <LogOut className="mr-2 h-4 w-4" /> Salir de JumpUp
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
