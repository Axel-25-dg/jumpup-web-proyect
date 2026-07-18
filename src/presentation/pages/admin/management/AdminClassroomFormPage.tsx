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
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { apiClient } from '@/infrastructure/http/axios-client'
import type { PaginatedResult } from '@/domain/entities/paginated-result.entity'
import type { AdminUser } from '@/domain/entities/admin-user.entity'
import {
  getAdminClassroomByIdUseCase,
  createAdminClassroomUseCase,
  updateAdminClassroomUseCase,
} from '@/infrastructure/factories/admin.factory'
import { courseRepo } from '@/infrastructure/factories/teacher.factory'
import type { Course } from '@/domain/entities/course.entity'

const formSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres').max(200, 'El nombre es demasiado largo'),
  course: z.string().min(1, 'Selecciona un curso'),
  teacher: z.string().min(1, 'Selecciona un profesor'),
  description: z.string().max(500, 'Máximo 500 caracteres').optional(),
})

type FormData = z.infer<typeof formSchema>

export default function AdminClassroomFormPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(isEdit)
  const [courses, setCourses] = useState<Course[]>([])
  const [teachers, setTeachers] = useState<AdminUser[]>([])
  const [isLoadingTeachers, setIsLoadingTeachers] = useState(true)

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: '', course: '', teacher: '', description: '' }
  })

  useEffect(() => {
    const loadData = async () => {
      try {
        const [coursesData, teachersData] = await Promise.all([
          courseRepo.getAll(),
          apiClient.get<PaginatedResult<AdminUser>>('/users/', { params: { page_size: 100 } }),
        ])
        setCourses(coursesData.results || [])
        // Filtrar solo teachers (role name = 'teacher')
        const allStaff = teachersData.data.results || []
        setTeachers(allStaff.filter(u => u.role?.name === 'teacher'))
        setIsLoadingTeachers(false)
        
        if (isEdit && id) {
          const classroom = await getAdminClassroomByIdUseCase.execute(Number(id))
          reset({
            name: classroom.name,
            course: String(classroom.course || ''),
            teacher: String(classroom.teacher || classroom.teacher_id || ''),
            description: classroom.description || '',
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
      const payload = {
        name: data.name,
        course: Number(data.course),
        teacher: Number(data.teacher),
        description: data.description || undefined,
      }
      
      if (isEdit && id) {
        await updateAdminClassroomUseCase.execute(Number(id), payload)
        toast.success('Aula actualizada con éxito')
      } else {
        await createAdminClassroomUseCase.execute(payload)
        toast.success('Aula creada con éxito')
      }
      navigate('/admin/classrooms')
    } catch (error: any) {
      console.error('Error saving classroom:', error)
      toast.error(error.message || 'Error al guardar el aula')
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild className="rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">
            <Link to="/admin/classrooms"><ArrowLeft className="h-5 w-5" /></Link>
          </Button>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              {isEdit ? 'Editar Aula' : 'Nueva Aula'}
            </h1>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-1">
              {isEdit ? 'Actualiza los datos del aula' : 'Crea un nuevo espacio educativo'}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            className="h-12 rounded-xl font-bold dark:border-slate-700"
            onClick={() => navigate('/admin/classrooms')}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting} className="h-12 rounded-xl font-black bg-sky-600 hover:bg-sky-700 shadow-xl shadow-sky-500/20 px-6">
            {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
            {isEdit ? 'Actualizar' : 'Crear Aula'}
          </Button>
        </div>
      </div>

      <Card className="border-none shadow-2xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden">
        <CardContent className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-black text-slate-900 dark:text-white">
              Nombre del Aula <span className="text-red-500">*</span>
            </label>
            <Input
              {...register('name')}
              placeholder="Ej. Inglés B2 - Grupo Mañana"
              className={`h-14 rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 font-medium text-lg ${errors.name ? 'border-red-500' : ''}`}
            />
            {errors.name && <span className="text-red-500 text-xs font-bold">{errors.name.message}</span>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-black text-slate-900 dark:text-white">
              Curso Asociado <span className="text-red-500">*</span>
            </label>
            <select
              {...register('course')}
              className={`w-full h-14 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 px-4 font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500 ${errors.course ? 'border-red-500' : ''}`}
            >
              <option value="">Selecciona un curso...</option>
              {courses.map(c => (
                <option key={c.id} value={c.id}>{c.title} - {c.difficulty_level}</option>
              ))}
            </select>
            {errors.course && <span className="text-red-500 text-xs font-bold">{errors.course.message}</span>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-black text-slate-900 dark:text-white">
              Profesor <span className="text-red-500">*</span>
            </label>
            {isLoadingTeachers ? (
              <div className="h-14 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 animate-pulse" />
            ) : (
              <select
                {...register('teacher')}
                className={`w-full h-14 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 px-4 font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500 ${errors.teacher ? 'border-red-500' : ''}`}
              >
                <option value="">Selecciona un profesor...</option>
                {teachers.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.first_name || t.last_name ? `${t.first_name} ${t.last_name}`.trim() : t.username} — {t.email}
                  </option>
                ))}
              </select>
            )}
            {errors.teacher && <span className="text-red-500 text-xs font-bold">{errors.teacher.message}</span>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-black text-slate-900 dark:text-white">Descripción (Opcional)</label>
            <Textarea
              {...register('description')}
              placeholder="Describe el propósito del aula..."
              className={`min-h-[120px] rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 font-medium resize-none p-4 ${errors.description ? 'border-red-500' : ''}`}
            />
            {errors.description && <span className="text-red-500 text-xs font-bold">{errors.description.message}</span>}
          </div>
        </CardContent>
      </Card>
    </form>
  )
}