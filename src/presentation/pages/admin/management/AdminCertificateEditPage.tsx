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
import { Textarea } from '@/presentation/components/ui/textarea'
import { Skeleton } from '@/presentation/components/ui/skeleton'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import {
  getCertificateByIdUseCase,
  updateCertificateUseCase,
} from '@/infrastructure/factories/admin-certificate.factory'
import { getAdminUsersUseCase } from '@/infrastructure/factories/admin.factory'
import type { AdminUser } from '@/domain/entities/admin-user.entity'

const formSchema = z.object({
  student: z.string().min(1, 'Selecciona un estudiante'),
  level: z.string().min(1, 'Selecciona un nivel'),
  title: z.string().min(3, 'El título debe tener al menos 3 caracteres'),
  description: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']

export default function AdminCertificateEditPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [students, setStudents] = useState<AdminUser[]>([])
  const [isLoadingStudents, setIsLoadingStudents] = useState(true)

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  })

  // Cargar certificado y estudiantes
  useEffect(() => {
    const loadData = async () => {
      if (!id) return
      try {
        const [certData, usersResult] = await Promise.all([
          getCertificateByIdUseCase.execute(Number(id)),
          getAdminUsersUseCase.execute(),
        ])

        // Cargar estudiantes
        const allUsers = usersResult.results || []
        const filteredStudents = allUsers.filter(u => {
          const roleName = u.role?.name?.toLowerCase() || ''
          return roleName === '' || roleName === 'student'
        })
        setStudents(filteredStudents)

        // Poblar formulario
        reset({
          student: String(certData.student),
          level: certData.level,
          title: certData.title,
          description: certData.description,
        })
      } catch (error) {
        console.error('Error loading certificate:', error)
        toast.error('No se pudo cargar el certificado')
        navigate('/admin/certificates')
      } finally {
        setIsLoadingData(false)
        setIsLoadingStudents(false)
      }
    }
    loadData()
  }, [id])

  const onSubmit = async (data: FormData) => {
    if (!id) return
    setIsSubmitting(true)
    try {
      await updateCertificateUseCase.execute(Number(id), {
        student: Number(data.student),
        level: data.level,
        title: data.title,
        description: data.description || '',
      })
      toast.success('Certificado actualizado con éxito')
      navigate(`/admin/certificates/${id}`)
    } catch (error: any) {
      console.error('Error updating certificate:', error)
      toast.error(error.message || 'Error al actualizar el certificado')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoadingData) {
    return (
      <div className="animate-in fade-in duration-500 max-w-4xl mx-auto p-8 space-y-8">
        <Skeleton className="h-12 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 animate-in fade-in duration-700 max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild className="rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">
            <Link to={`/admin/certificates/${id}`}><ArrowLeft className="h-5 w-5" /></Link>
          </Button>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Editar Certificado</h1>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-1">Modifica los datos del certificado</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button type="button" variant="outline" className="h-12 rounded-xl font-bold" onClick={() => navigate(`/admin/certificates/${id}`)} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting || isLoadingStudents} className="h-12 rounded-xl font-black bg-sky-600 hover:bg-sky-700 shadow-xl shadow-sky-500/20 px-6">
            {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
            Guardar Cambios
          </Button>
        </div>
      </div>

      <Card className="border-none shadow-2xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden">
        <CardContent className="p-8 space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-black text-slate-900 dark:text-white">
                Estudiante <span className="text-red-500">*</span>
              </label>
              {isLoadingStudents ? (
                <div className="flex items-center gap-3 h-14 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 px-4">
                  <Loader2 className="h-4 w-4 animate-spin text-sky-500" />
                  <span className="text-sm text-slate-400">Cargando estudiantes...</span>
                </div>
              ) : (
                <select
                  {...register('student')}
                  className={`w-full h-14 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 px-4 font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500 ${errors.student ? 'border-red-500' : ''}`}
                >
                  <option value="">Selecciona un estudiante...</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.first_name || s.last_name
                        ? `${s.first_name || ''} ${s.last_name || ''}`.trim() + ` (${s.email})`
                        : `${s.username} (${s.email})`
                      }
                    </option>
                  ))}
                </select>
              )}
              {errors.student && <span className="text-red-500 text-xs font-bold">{errors.student.message}</span>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-black text-slate-900 dark:text-white">
                Nivel MCER <span className="text-red-500">*</span>
              </label>
              <select
                {...register('level')}
                className={`w-full h-14 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 px-4 font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500 ${errors.level ? 'border-red-500' : ''}`}
              >
                <option value="">Selecciona nivel...</option>
                {LEVELS.map(l => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
              {errors.level && <span className="text-red-500 text-xs font-bold">{errors.level.message}</span>}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-black text-slate-900 dark:text-white">
              Título del Certificado <span className="text-red-500">*</span>
            </label>
            <Input
              {...register('title')}
              placeholder='Ej. Certificado de Inglés A1 — JumpUp UTE'
              className={`h-14 rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 font-medium ${errors.title ? 'border-red-500' : ''}`}
            />
            {errors.title && <span className="text-red-500 text-xs font-bold">{errors.title.message}</span>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-black text-slate-900 dark:text-white">Descripción (Opcional)</label>
            <Textarea
              {...register('description')}
              placeholder="Descripción adicional del certificado..."
              className={`min-h-[120px] rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 font-medium resize-none p-4 ${errors.description ? 'border-red-500' : ''}`}
            />
            {errors.description && <span className="text-red-500 text-xs font-bold">{errors.description.message}</span>}
          </div>
        </CardContent>
      </Card>
    </form>
  )
}