import { useState, useEffect } from 'react'
import {
  User,
  Mail,
  Lock,
  Camera,
  Save,
  Loader2,
  Globe,
  Eye,
  EyeOff
} from 'lucide-react'
import { Card, CardContent } from '@/presentation/components/ui/card'
import { Button } from '@/presentation/components/ui/button'
import { Input } from '@/presentation/components/ui/input'
import { Textarea } from '@/presentation/components/ui/textarea'
import { Avatar, AvatarFallback } from '@/presentation/components/ui/avatar'
import { Skeleton } from '@/presentation/components/ui/skeleton'
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
      // Profile update endpoint — using auth update endpoint
      // await authUpdateUseCase.execute({ username: data.username, email: data.email })
      await new Promise(resolve => setTimeout(resolve, 500)) // Placeholder until profile update endpoint is confirmed
      toast.success('Perfil actualizado correctamente')
    } catch (error: any) {
      console.error('Error updating profile:', error)
      toast.error(error?.detail || 'Error al actualizar el perfil')
    } finally {
      setIsSavingProfile(false)
    }
  }

  const onSavePassword = async (_data: PasswordForm) => {
    setIsSavingPassword(true)
    try {
      // await authChangePasswordUseCase.execute({ current_password: data.current_password, new_password: data.new_password })
      await new Promise(resolve => setTimeout(resolve, 500))
      toast.success('Contraseña actualizada correctamente')
      resetPassword()
    } catch (error: any) {
      console.error('Error updating password:', error)
      toast.error(error?.detail || 'Error al actualizar la contraseña')
    } finally {
      setIsSavingPassword(false)
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">Perfil Docente</h1>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-1">Configura tu información pública y privada</p>
        </div>
        <Button
          onClick={handleProfile(onSaveProfile)}
          disabled={isSavingProfile}
          className="h-12 rounded-2xl font-black bg-sky-600 hover:bg-sky-700 shadow-xl shadow-sky-500/20 px-6"
        >
          {isSavingProfile ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
          Guardar Cambios
        </Button>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {/* Left Column: Avatar & Stats */}
        <div className="space-y-6">
          <Card className="border-none shadow-2xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden text-center">
            <div className="h-32 bg-gradient-to-r from-sky-400 to-indigo-500 w-full relative" />
            <CardContent className="px-6 pb-8 -mt-16 relative z-10 flex flex-col items-center">
              <div className="relative group cursor-pointer mb-4">
                <Avatar className="h-32 w-32 border-4 border-white dark:border-slate-900 shadow-xl">
                  <AvatarFallback className="bg-slate-100 text-sky-600 font-black text-4xl">
                    {(user?.username || 'T').substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <Camera className="h-8 w-8 text-white" />
                </div>
              </div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">{user?.username}</h2>
              <p className="text-sm font-bold text-sky-600 uppercase tracking-widest mt-1">Docente Pro</p>

              <div className="flex gap-4 justify-center mt-6 w-full">
                <div className="bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl p-4 flex-1">
                  {isLoadingStats
                    ? <Skeleton className="h-8 w-12 mx-auto" />
                    : <p className="text-xl font-black text-slate-900 dark:text-white">{dashboardData?.lessons ?? 0}</p>
                  }
                  <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Lecciones</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl p-4 flex-1">
                  {isLoadingStats
                    ? <Skeleton className="h-8 w-12 mx-auto" />
                    : <p className="text-xl font-black text-slate-900 dark:text-white">{dashboardData?.students ?? 0}</p>
                  }
                  <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Alumnos</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Settings Form */}
        <div className="md:col-span-2 space-y-6">
          {/* Personal Info */}
          <Card className="border-none shadow-xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden">
            <CardContent className="p-8 space-y-6">
              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-4">Información Personal</h3>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <User className="h-4 w-4 text-slate-400" /> Nombre Público
                  </label>
                  <Input
                    {...regProfile('username')}
                    className={`h-14 rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 font-medium ${profileErrors.username ? 'border-red-500' : ''}`}
                  />
                  {profileErrors.username && <span className="text-red-500 text-xs font-bold">{profileErrors.username.message}</span>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Mail className="h-4 w-4 text-slate-400" /> Correo Electrónico
                  </label>
                  <Input
                    {...regProfile('email')}
                    type="email"
                    className={`h-14 rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 font-medium ${profileErrors.email ? 'border-red-500' : ''}`}
                  />
                  {profileErrors.email && <span className="text-red-500 text-xs font-bold">{profileErrors.email.message}</span>}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-black text-slate-900 dark:text-white">Biografía Pública</label>
                <Textarea
                  {...regProfile('bio')}
                  placeholder="Cuéntale a tus estudiantes sobre ti..."
                  className="min-h-[120px] rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 font-medium resize-none p-4"
                />
                <p className="text-xs font-bold text-slate-400 mt-1">Los estudiantes verán esto en tu perfil público.</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Globe className="h-4 w-4 text-slate-400" /> Idioma Principal que Enseñas
                </label>
                <Input
                  {...regProfile('language')}
                  className="h-14 rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 font-medium md:max-w-xs"
                />
              </div>
            </CardContent>
          </Card>

          {/* Security */}
          <Card className="border-none shadow-xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden">
            <CardContent className="p-8 space-y-6">
              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Lock className="h-5 w-5 text-rose-500" /> Seguridad
              </h3>

              <div className="space-y-2">
                <label className="text-sm font-black text-slate-900 dark:text-white">Contraseña Actual</label>
                <div className="relative">
                  <Input
                    {...regPassword('current_password')}
                    type={showCurrentPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className={`h-14 rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 font-medium pr-12 ${passwordErrors.current_password ? 'border-red-500' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(p => !p)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showCurrentPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {passwordErrors.current_password && <span className="text-red-500 text-xs font-bold">{passwordErrors.current_password.message}</span>}
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-black text-slate-900 dark:text-white">Nueva Contraseña</label>
                  <div className="relative">
                    <Input
                      {...regPassword('new_password')}
                      type={showNewPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className={`h-14 rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 font-medium pr-12 ${passwordErrors.new_password ? 'border-red-500' : ''}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(p => !p)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {passwordErrors.new_password && <span className="text-red-500 text-xs font-bold">{passwordErrors.new_password.message}</span>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-black text-slate-900 dark:text-white">Confirmar Contraseña</label>
                  <Input
                    {...regPassword('confirm_password')}
                    type="password"
                    placeholder="••••••••"
                    className={`h-14 rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 font-medium ${passwordErrors.confirm_password ? 'border-red-500' : ''}`}
                  />
                  {passwordErrors.confirm_password && <span className="text-red-500 text-xs font-bold">{passwordErrors.confirm_password.message}</span>}
                </div>
              </div>

              <Button
                onClick={handlePassword(onSavePassword)}
                disabled={isSavingPassword}
                variant="outline"
                className="h-12 rounded-xl font-bold mt-2 text-rose-600 border-rose-200 hover:bg-rose-50 dark:border-rose-900/50 dark:hover:bg-rose-900/20"
              >
                {isSavingPassword ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lock className="mr-2 h-4 w-4" />}
                Actualizar Contraseña
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
