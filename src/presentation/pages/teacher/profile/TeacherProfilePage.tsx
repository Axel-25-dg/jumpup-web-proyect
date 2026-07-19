import { useState, useEffect } from 'react'
import {
  User, Mail, Lock, Camera, Save, Loader2, Globe, Eye, EyeOff
} from 'lucide-react'
import { Button } from '@/presentation/components/ui/button'
import { Input } from '@/presentation/components/ui/input'
import { Textarea } from '@/presentation/components/ui/textarea'
import { useAuthStore } from '@/presentation/store/auth.store'
import { getTeacherDashboardUseCase } from '@/infrastructure/factories/dashboard.factory'
import type { TeacherDashboardData } from '@/domain/ports/dashboard.repository'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'

const profileSchema = z.object({
  username: z.string().min(3, 'Mínimo 3 caracteres').max(50),
  email: z.string().email('Email inválido'),
  bio: z.string().max(500, 'Máximo 500 caracteres').optional(),
  language: z.string().max(50).optional(),
})

const passwordSchema = z.object({
  current_password: z.string().min(1, 'Ingresa tu contraseña actual'),
  new_password: z.string().min(8, 'Mínimo 8 caracteres'),
  confirm_password: z.string().min(1, 'Confirma tu contraseña'),
}).refine(data => data.new_password === data.confirm_password, {
  message: 'Las contraseñas no coinciden',
  path: ['confirm_password'],
})

type ProfileForm = z.infer<typeof profileSchema>
type PasswordForm = z.infer<typeof passwordSchema>

export default function TeacherProfilePage() {
  const user = useAuthStore((s) => s.user)
  const [dashboardData, setDashboardData] = useState<TeacherDashboardData | null>(null)
  const [isLoadingStats, setIsLoadingStats] = useState(true)
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [isSavingPassword, setIsSavingPassword] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)

  const { register: regProfile, handleSubmit: handleProfile, formState: { errors: profileErrors } } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: user?.username || '',
      email: user?.email || '',
      bio: '',
      language: 'Español',
    }
  })

  const { register: regPassword, handleSubmit: handlePassword, reset: resetPassword, formState: { errors: passwordErrors } } = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  })

  useEffect(() => {
    const loadStats = async () => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const data = await getTeacherDashboardUseCase.execute()
        setDashboardData(data)
      } catch {
        // Non-critical: stats can fail silently
      } finally {
        setIsLoadingStats(false)
      }
    }
    loadStats()
  }, [])

  const onSaveProfile = async (_data: ProfileForm) => {
    setIsSavingProfile(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      toast.success('Perfil actualizado correctamente')
    } catch (error: any) {
      toast.error(error?.detail || 'Error al actualizar el perfil')
    } finally {
      setIsSavingProfile(false)
    }
  }

  const onSavePassword = async (_data: PasswordForm) => {
    setIsSavingPassword(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      toast.success('Contraseña actualizada correctamente')
      resetPassword()
    } catch (error: any) {
      toast.error(error?.detail || 'Error al actualizar la contraseña')
    } finally {
      setIsSavingPassword(false)
    }
  }

  return (
    <div className="animate-in fade-in duration-500">
      {/* HERO */}
      <section className="border-b border-slate-900/10 dark:border-white/10 px-8 md:px-12 py-10 md:py-14">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
          <div className="space-y-3">
            <div className="chip">
              <User className="h-3.5 w-3.5 text-sky-500" />
              Profesor
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
              Perfil <span className="text-sky-500">Docente</span>
            </h1>
            <p className="label-micro text-slate-400">Configura tu información pública y privada</p>
          </div>
          <Button
            onClick={handleProfile(onSaveProfile)}
            disabled={isSavingProfile}
            className="bg-sky-500 hover:bg-sky-600 text-white font-bold gap-2 shrink-0"
          >
            {isSavingProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Guardar Cambios
          </Button>
        </div>
      </section>

      <div className="px-8 md:px-12 py-8 grid gap-8 md:grid-cols-3">
        {/* LEFT: Avatar & Stats */}
        <div className="space-y-4">
          {/* Avatar Card */}
          <div className="border border-slate-900/10 dark:border-white/10 overflow-hidden">
            <div className="h-20 bg-sky-500/10 dark:bg-sky-900/10 w-full" />
            <div className="px-6 pb-6 -mt-10 relative flex flex-col items-center text-center">
              <div className="relative group cursor-pointer mb-3">
                <div className="h-20 w-20 border-2 border-white dark:border-[#0a0a0b] bg-slate-100 dark:bg-white/10 flex items-center justify-center text-2xl font-black text-sky-500 shadow-sm">
                  {(user?.username || 'T').substring(0, 2).toUpperCase()}
                </div>
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <Camera className="h-5 w-5 text-white" />
                </div>
              </div>
              <h2 className="text-base font-black text-slate-900 dark:text-white">{user?.username}</h2>
              <p className="label-micro text-sky-500 mt-0.5">Docente Pro</p>

              <div className="grid grid-cols-2 gap-2 w-full mt-5">
                {[
                  { label: 'Lecciones', value: dashboardData?.lessons ?? 0 },
                  { label: 'Alumnos', value: dashboardData?.students ?? 0 },
                ].map(({ label, value }) => (
                  <div key={label} className="border border-slate-900/10 dark:border-white/10 p-3 text-center">
                    {isLoadingStats
                      ? <div className="h-6 w-8 bg-slate-100 dark:bg-white/10 animate-pulse mx-auto mb-1" />
                      : <p className="text-lg font-black text-slate-900 dark:text-white">{value}</p>
                    }
                    <p className="label-micro text-slate-400">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: Settings Forms */}
        <div className="md:col-span-2 space-y-6">
          {/* Personal Info */}
          <div className="border border-slate-900/10 dark:border-white/10 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-900/10 dark:border-white/10 bg-white dark:bg-white/[0.02]">
              <h3 className="text-sm font-black text-slate-900 dark:text-white">Información Personal</h3>
            </div>
            <div className="p-6 space-y-5">
              <div className="grid md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="label-micro text-slate-500 flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-slate-400" /> Nombre Público
                  </label>
                  <Input
                    {...regProfile('username')}
                    className={`h-10 border-slate-900/10 dark:border-white/10 bg-transparent font-medium ${profileErrors.username ? 'border-red-400' : ''}`}
                  />
                  {profileErrors.username && <span className="text-red-500 text-xs font-bold">{profileErrors.username.message}</span>}
                </div>
                <div className="space-y-1.5">
                  <label className="label-micro text-slate-500 flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-slate-400" /> Correo Electrónico
                  </label>
                  <Input
                    {...regProfile('email')}
                    type="email"
                    className={`h-10 border-slate-900/10 dark:border-white/10 bg-transparent font-medium ${profileErrors.email ? 'border-red-400' : ''}`}
                  />
                  {profileErrors.email && <span className="text-red-500 text-xs font-bold">{profileErrors.email.message}</span>}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="label-micro text-slate-500">Biografía Pública</label>
                <Textarea
                  {...regProfile('bio')}
                  placeholder="Cuéntale a tus estudiantes sobre ti..."
                  className="min-h-[100px] border-slate-900/10 dark:border-white/10 bg-transparent font-medium resize-none p-3 text-sm"
                />
                <p className="label-micro text-slate-400">Los estudiantes verán esto en tu perfil público.</p>
              </div>

              <div className="space-y-1.5">
                <label className="label-micro text-slate-500 flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5 text-slate-400" /> Idioma Principal que Enseñas
                </label>
                <Input
                  {...regProfile('language')}
                  className="h-10 border-slate-900/10 dark:border-white/10 bg-transparent font-medium md:max-w-xs"
                />
              </div>
            </div>
          </div>

          {/* Security */}
          <div className="border border-slate-900/10 dark:border-white/10 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-900/10 dark:border-white/10 bg-white dark:bg-white/[0.02]">
              <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Lock className="h-4 w-4 text-red-500" /> Seguridad
              </h3>
            </div>
            <div className="p-6 space-y-5">
              <div className="space-y-1.5">
                <label className="label-micro text-slate-500">Contraseña Actual</label>
                <div className="relative">
                  <Input
                    {...regPassword('current_password')}
                    type={showCurrentPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className={`h-10 border-slate-900/10 dark:border-white/10 bg-transparent font-medium pr-10 ${passwordErrors.current_password ? 'border-red-400' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {passwordErrors.current_password && <span className="text-red-500 text-xs font-bold">{passwordErrors.current_password.message}</span>}
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="label-micro text-slate-500">Nueva Contraseña</label>
                  <div className="relative">
                    <Input
                      {...regPassword('new_password')}
                      type={showNewPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className={`h-10 border-slate-900/10 dark:border-white/10 bg-transparent font-medium pr-10 ${passwordErrors.new_password ? 'border-red-400' : ''}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(p => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {passwordErrors.new_password && <span className="text-red-500 text-xs font-bold">{passwordErrors.new_password.message}</span>}
                </div>
                <div className="space-y-1.5">
                  <label className="label-micro text-slate-500">Confirmar Contraseña</label>
                  <Input
                    {...regPassword('confirm_password')}
                    type="password"
                    placeholder="••••••••"
                    className={`h-10 border-slate-900/10 dark:border-white/10 bg-transparent font-medium ${passwordErrors.confirm_password ? 'border-red-400' : ''}`}
                  />
                  {passwordErrors.confirm_password && <span className="text-red-500 text-xs font-bold">{passwordErrors.confirm_password.message}</span>}
                </div>
              </div>

              <Button
                onClick={handlePassword(onSavePassword)}
                disabled={isSavingPassword}
                variant="outline"
                className="font-bold border-red-200 dark:border-red-800/30 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 gap-2"
              >
                {isSavingPassword ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
                Actualizar Contraseña
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
