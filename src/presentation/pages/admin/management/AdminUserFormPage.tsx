import { useState, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Save,
  Loader2,
  Users,
  Shield,
  Fingerprint,
  Mail,
  User,
  Key
} from 'lucide-react'
import { Button } from '@/presentation/components/ui/button'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import {
  getAdminUserByIdUseCase,
  createAdminUserUseCase,
  updateAdminUserUseCase,
  getRolesUseCase,
} from '@/infrastructure/factories/admin.factory'
import type { Role } from '@/domain/entities/admin-user.entity'

const formSchema = z.object({
  username: z.string().min(3, 'Mínimo 3 caracteres').max(150, 'Máximo 150 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres').optional().or(z.literal('')),
  first_name: z.string().max(100, 'Máximo 100 caracteres').optional(),
  last_name: z.string().max(100, 'Máximo 100 caracteres').optional(),
  role_id: z.string().min(1, 'Selecciona un rol'),
  is_active: z.boolean().optional(),
})

type FormData = z.infer<typeof formSchema>

export default function AdminUserFormPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(isEdit)
  const [roles, setRoles] = useState<Role[]>([])

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      first_name: '',
      last_name: '',
      role_id: '',
      is_active: true,
    }
  })

  useEffect(() => {
    const loadData = async () => {
      try {
        const rolesData = await getRolesUseCase.execute()
        setRoles(rolesData)

        if (isEdit && id) {
          const user = await getAdminUserByIdUseCase.execute(Number(id))
          reset({
            username: user.username,
            email: user.email,
            password: '',
            first_name: user.first_name || '',
            last_name: user.last_name || '',
            role_id: String(user.role?.id || ''),
            is_active: user.is_active,
          })
        }
      } catch (error) {
        console.error('Error loading data:', error)
        toast.error('Error al cargar los datos')
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [id, isEdit, reset])

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true)
    try {
      if (isEdit && id) {
        const payload: any = {
          username: data.username,
          email: data.email,
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          role_id: Number(data.role_id),
          is_active: data.is_active,
        }
        if (data.password) {
          payload.password = data.password
        }
        await updateAdminUserUseCase.execute(Number(id), payload)
        toast.success('Usuario actualizado con éxito')
      } else {
        await createAdminUserUseCase.execute({
          username: data.username,
          email: data.email,
          password: data.password!,
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          role_id: Number(data.role_id),
          is_active: true,
        })
        toast.success('Usuario creado con éxito')
      }
      navigate('/admin/users')
    } catch (error: any) {
      console.error('Error saving user:', error)
      toast.error(error.message || 'Error al guardar el usuario')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
        <p className="label-caps text-slate-400">Sincronizando Expediente...</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="animate-in fade-in duration-500 pb-20">
      {/* HERO SECTION */}
      <section className="border-b border-slate-900/10 dark:border-white/10 px-8 md:px-12 py-14 md:py-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Button type="button" variant="ghost" size="icon" asChild className="-ml-2 rounded-none hover:bg-slate-100 dark:hover:bg-white/5">
                <Link to="/admin/users"><ArrowLeft className="h-4 w-4" /></Link>
              </Button>
              <div className="chip">
                <Users className="h-3.5 w-3.5 text-sky-500" />
                Expediente de Usuario
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white uppercase">
              {isEdit ? 'Editar' : 'Nuevo'} <span className="text-sky-500">Registro</span>.
            </h1>
            <p className="text-base text-slate-500 dark:text-slate-400 max-w-lg font-medium">
              Configuración de credenciales, privilegios de acceso y datos de identidad.
            </p>
          </div>
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/admin/users')}
              className="rounded-none border-slate-900/10 dark:border-white/10 font-bold uppercase text-[11px] tracking-[0.2em] px-8 py-6 h-auto hover:bg-slate-50 dark:hover:bg-white/5 transition-all"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="rounded-none bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold uppercase text-[11px] tracking-[0.2em] px-8 py-6 h-auto hover:bg-sky-500 dark:hover:bg-sky-500 hover:text-white transition-all shadow-none"
            >
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {isEdit ? 'Actualizar Registro' : 'Crear Usuario'}
            </Button>
          </div>
        </div>
      </section>

      {/* FORM BODY */}
      <div className="max-w-6xl mx-auto px-8 md:px-12 py-12">
        <div className="grid lg:grid-cols-[1fr_350px] gap-12">
          {/* Main Fields */}
          <div className="space-y-12">
            {/* Identity Group */}
            <div className="space-y-8">
              <div className="flex items-center gap-3 border-b border-slate-900/10 dark:border-white/10 pb-4">
                <Fingerprint className="h-5 w-5 text-sky-500" />
                <h2 className="label-caps text-slate-900 dark:text-white font-black">Información de Identidad</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="label-caps text-slate-400 text-[10px]">Nombre(s)</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                    <input
                      {...register('first_name')}
                      placeholder="JUAN CARLOS"
                      className={`w-full border ${errors.first_name ? 'border-rose-500' : 'border-slate-900/10 dark:border-white/10'} bg-transparent py-4 pl-12 pr-4 text-[12px] font-bold uppercase tracking-widest outline-none focus:border-sky-500 transition-colors`}
                    />
                  </div>
                  {errors.first_name && <p className="text-[10px] text-rose-500 font-mono mt-1">{errors.first_name.message}</p>}
                </div>
                <div className="space-y-2">
                  <label className="label-caps text-slate-400 text-[10px]">Apellidos</label>
                  <input
                    {...register('last_name')}
                    placeholder="PÉREZ RODRÍGUEZ"
                    className={`w-full border ${errors.last_name ? 'border-rose-500' : 'border-slate-900/10 dark:border-white/10'} bg-transparent py-4 px-4 text-[12px] font-bold uppercase tracking-widest outline-none focus:border-sky-500 transition-colors`}
                  />
                  {errors.last_name && <p className="text-[10px] text-rose-500 font-mono mt-1">{errors.last_name.message}</p>}
                </div>
              </div>
            </div>

            {/* Credentials Group */}
            <div className="space-y-8">
              <div className="flex items-center gap-3 border-b border-slate-900/10 dark:border-white/10 pb-4">
                <Shield className="h-5 w-5 text-sky-500" />
                <h2 className="label-caps text-slate-900 dark:text-white font-black">Credenciales de Acceso</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="label-caps text-slate-400 text-[10px]">Nombre de Usuario <span className="text-sky-500">*</span></label>
                  <input
                    {...register('username')}
                    placeholder="USERNAME_JUMPUP"
                    className={`w-full border ${errors.username ? 'border-rose-500' : 'border-slate-900/10 dark:border-white/10'} bg-transparent py-4 px-4 text-[12px] font-bold uppercase tracking-widest outline-none focus:border-sky-500 transition-colors font-mono`}
                  />
                  {errors.username && <p className="text-[10px] text-rose-500 font-mono mt-1">{errors.username.message}</p>}
                </div>
                <div className="space-y-2">
                  <label className="label-caps text-slate-400 text-[10px]">Correo Electrónico <span className="text-sky-500">*</span></label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                    <input
                      {...register('email')}
                      type="email"
                      placeholder="USUARIO@JUMPUP.COM"
                      className={`w-full border ${errors.email ? 'border-rose-500' : 'border-slate-900/10 dark:border-white/10'} bg-transparent py-4 pl-12 pr-4 text-[12px] font-bold uppercase tracking-widest outline-none focus:border-sky-500 transition-colors font-mono`}
                    />
                  </div>
                  {errors.email && <p className="text-[10px] text-rose-500 font-mono mt-1">{errors.email.message}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <label className="label-caps text-slate-400 text-[10px]">
                  Contraseña {isEdit ? '(OPCIONAL)' : '<span className="text-sky-500">*</span>'}
                </label>
                <div className="relative">
                  <Key className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                  <input
                    {...register('password')}
                    type="password"
                    placeholder={isEdit ? "DEJAR VACÍO PARA MANTENER ACTUAL" : "MÍNIMO 8 CARACTERES TÉCNICOS"}
                    className={`w-full border ${errors.password ? 'border-rose-500' : 'border-slate-900/10 dark:border-white/10'} bg-transparent py-4 pl-12 pr-4 text-[12px] font-bold tracking-widest outline-none focus:border-sky-500 transition-colors`}
                  />
                </div>
                {errors.password && <p className="text-[10px] text-rose-500 font-mono mt-1">{errors.password.message}</p>}
              </div>
            </div>
          </div>

          {/* Sidebar / Settings */}
          <div className="space-y-8">
            <div className="p-8 border border-slate-900/10 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02]">
              <h3 className="label-caps text-slate-900 dark:text-white font-black mb-6">Configuración de Rol</h3>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="label-caps text-slate-400 text-[10px]">Privilegios del Sistema</label>
                  <div className="relative">
                    <select
                      {...register('role_id')}
                      className={`w-full appearance-none border ${errors.role_id ? 'border-rose-500' : 'border-slate-900/10 dark:border-white/10'} bg-white dark:bg-[#0a0a0b] py-4 px-4 text-[11px] font-bold uppercase tracking-widest outline-none focus:border-sky-500 transition-colors`}
                    >
                      <option value="">SELECCIONAR ROL...</option>
                      {roles.map(r => (
                        <option key={r.id} value={r.id}>{r.name.toUpperCase()}</option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none border-l border-slate-900/10 pl-3">
                      <Shield className="h-4 w-4 text-slate-300" />
                    </div>
                  </div>
                  {errors.role_id && <p className="text-[10px] text-rose-500 font-mono mt-1">{errors.role_id.message}</p>}
                </div>

                {isEdit && (
                  <div className="pt-4 border-t border-slate-900/10 dark:border-white/10">
                    <label className="flex items-center justify-between cursor-pointer group">
                      <span className="label-caps text-slate-600 dark:text-slate-400 text-[10px] font-bold">Estado de Acceso</span>
                      <div className="relative inline-flex items-center">
                        <input
                          type="checkbox"
                          {...register('is_active')}
                          className="sr-only peer"
                        />
                        <div className="w-12 h-6 bg-slate-200 dark:bg-white/5 rounded-none border border-slate-900/10 dark:border-white/10 peer-checked:bg-sky-500 peer-checked:border-sky-500 transition-all after:content-[''] after:absolute after:top-1 after:left-1 after:bg-slate-400 dark:after:bg-slate-600 peer-checked:after:bg-white after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-6"></div>
                      </div>
                    </label>
                    <p className="label-micro text-slate-400 mt-3 font-mono">
                      EL BLOQUEO IMPIDE EL LOGIN PERO CONSERVA EL HISTORIAL.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="p-8 border border-slate-900/10 dark:border-white/10 border-dashed">
              <p className="label-micro text-slate-400 leading-relaxed font-mono">
                LOS CAMPOS MARCADOS CON <span className="text-sky-500">*</span> SON OBLIGATORIOS PARA LA INTEGRIDAD DEL SISTEMA.
                LAS CREDENCIALES SON SENSIBLES A MAYÚSCULAS/MINÚSCULAS.
              </p>
            </div>
          </div>
        </div>
      </div>
    </form>
  )
}
