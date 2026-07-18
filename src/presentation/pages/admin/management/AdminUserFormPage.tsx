import { useState, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Save,
  Loader2,
} from 'lucide-react'
import { Card, CardContent } from '@/presentation/components/ui/card'
import { Button } from '@/presentation/components/ui/button'
import { Input } from '@/presentation/components/ui/input'
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
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-sky-600" />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 animate-in fade-in duration-700 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild className="rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">
            <Link to="/admin/users"><ArrowLeft className="h-5 w-5" /></Link>
          </Button>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              {isEdit ? 'Editar Usuario' : 'Nuevo Usuario'}
            </h1>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-1">
              {isEdit ? 'Actualiza los datos del usuario' : 'Crea un nuevo usuario en la plataforma'}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            className="h-12 rounded-xl font-bold dark:border-slate-700"
            onClick={() => navigate('/admin/users')}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-12 rounded-xl font-black bg-sky-600 hover:bg-sky-700 shadow-xl shadow-sky-500/20 px-6"
          >
            {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
            {isEdit ? 'Actualizar' : 'Crear Usuario'}
          </Button>
        </div>
      </div>

      <Card className="border-none shadow-2xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden">
        <CardContent className="p-8 space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-black text-slate-900 dark:text-white">
                Nombre de Usuario <span className="text-red-500">*</span>
              </label>
              <Input
                {...register('username')}
                placeholder="ej: juan.perez"
                className={`h-14 rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 font-medium ${errors.username ? 'border-red-500' : ''}`}
              />
              {errors.username && <span className="text-red-500 text-xs font-bold">{errors.username.message}</span>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-black text-slate-900 dark:text-white">
                Email <span className="text-red-500">*</span>
              </label>
              <Input
                {...register('email')}
                placeholder="ej: juan@ejemplo.com"
                className={`h-14 rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 font-medium ${errors.email ? 'border-red-500' : ''}`}
              />
              {errors.email && <span className="text-red-500 text-xs font-bold">{errors.email.message}</span>}
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-black text-slate-900 dark:text-white">
                Contraseña {!isEdit && <span className="text-red-500">*</span>}
              </label>
              <Input
                {...register('password')}
                type="password"
                placeholder={isEdit ? 'Dejar vacío para no cambiar' : 'Mínimo 8 caracteres'}
                className={`h-14 rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 font-medium ${errors.password ? 'border-red-500' : ''}`}
              />
              {errors.password && <span className="text-red-500 text-xs font-bold">{errors.password.message}</span>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-black text-slate-900 dark:text-white">
                Rol <span className="text-red-500">*</span>
              </label>
              <select
                {...register('role_id')}
                className={`w-full h-14 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 px-4 font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500 ${errors.role_id ? 'border-red-500' : ''}`}
              >
                <option value="">Selecciona un rol...</option>
                {roles.map(r => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
              {errors.role_id && <span className="text-red-500 text-xs font-bold">{errors.role_id.message}</span>}
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-black text-slate-900 dark:text-white">Nombres</label>
              <Input
                {...register('first_name')}
                placeholder="ej: Juan"
                className={`h-14 rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 font-medium ${errors.first_name ? 'border-red-500' : ''}`}
              />
              {errors.first_name && <span className="text-red-500 text-xs font-bold">{errors.first_name.message}</span>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-black text-slate-900 dark:text-white">Apellidos</label>
              <Input
                {...register('last_name')}
                placeholder="ej: Pérez"
                className={`h-14 rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 font-medium ${errors.last_name ? 'border-red-500' : ''}`}
              />
              {errors.last_name && <span className="text-red-500 text-xs font-bold">{errors.last_name.message}</span>}
            </div>
          </div>

          {isEdit && (
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  {...register('is_active')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-sky-300 dark:peer-focus:ring-sky-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-sky-600"></div>
              </label>
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                Usuario activo
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </form>
  )
}