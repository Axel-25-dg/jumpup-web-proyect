import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Save,
  Users,
  Loader2,
  Lock
} from 'lucide-react'
import { Card, CardContent } from '@/presentation/components/ui/card'
import { Button } from '@/presentation/components/ui/button'
import { Input } from '@/presentation/components/ui/input'
import { Textarea } from '@/presentation/components/ui/textarea'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { createClassroomUseCase, courseRepo } from '@/infrastructure/factories/teacher.factory'
import { useAuthStore } from '@/presentation/store/auth.store'
import type { Course } from '@/domain/entities/course.entity'

const formSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres').max(100, 'El nombre es demasiado largo'),
  course: z.string().min(1, 'Selecciona un curso al cual asociar el aula'),
  description: z.string().max(500, 'Máximo 500 caracteres').optional(),
  access_code: z.string().max(20, 'Máximo 20 caracteres').optional(),
})

type FormData = z.infer<typeof formSchema>

export default function CreateClassroomPage() {
  const navigate = useNavigate()
  const user = useAuthStore(s => s.user)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [courses, setCourses] = useState<Course[]>([])
  const [isLoadingCourses, setIsLoadingCourses] = useState(true)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: '', course: '', description: '', access_code: '' }
  })

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const result = await courseRepo.getAll()
        setCourses(result.results || [])
      } catch (err) {
        toast.error('No se pudieron cargar los cursos')
      } finally {
        setIsLoadingCourses(false)
      }
    }
    loadCourses()
  }, [])

  const onSubmit = async (data: FormData) => {
    if (!user?.user_id) return
    setIsSubmitting(true)
    try {
      await createClassroomUseCase.execute({
        name: data.name,
        course: Number(data.course),
        description: data.description || undefined,
        teacher: user.user_id,
        access_code: data.access_code || undefined,
      })
      toast.success(`Aula "${data.name}" creada con éxito`)
      navigate('/teacher/classrooms')
    } catch (error: any) {
      console.error('Error creating classroom:', error)
      toast.error(error?.detail || 'Ocurrió un error al crear el aula')
    } finally {
      setIsSubmitting(false)
    }
  }

  const onError = (errors: any) => {
    console.error('Form errors:', errors)
    toast.error('Por favor, revisa los campos en rojo')
  }

  return (
    <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-8 animate-in fade-in duration-700 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild className="rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">
            <Link to="/teacher/classrooms"><ArrowLeft className="h-5 w-5" /></Link>
          </Button>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Nueva Aula</h1>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-1">Crea un espacio de estudio para tus alumnos</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            className="h-12 rounded-xl font-bold dark:border-slate-700"
            onClick={() => navigate('/teacher/classrooms')}
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
            Crear Aula
          </Button>
        </div>
      </div>

      <div className="grid gap-8">
        <Card className="border-none shadow-2xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden">
          <CardContent className="p-8 space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-black text-slate-900 dark:text-white">
                Nombre del Aula <span className="text-red-500">*</span>
              </label>
              <Input
                {...register('name')}
                placeholder="Ej. Nivel B2 - Grupo Mañana"
                className={`h-14 rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 font-medium text-lg ${errors.name ? 'border-red-500' : ''}`}
              />
              {errors.name && <span className="text-red-500 text-xs font-bold">{errors.name.message}</span>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-black text-slate-900 dark:text-white">
                Curso Asociado <span className="text-red-500">*</span>
              </label>
              {isLoadingCourses ? (
                <div className="h-14 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 animate-pulse" />
              ) : (
                <select
                  {...register('course')}
                  className={`w-full h-14 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 px-4 font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500 ${errors.course ? 'border-red-500' : ''}`}
                >
                  <option value="">Selecciona un curso...</option>
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              )}
              {errors.course && <span className="text-red-500 text-xs font-bold">{errors.course.message}</span>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-black text-slate-900 dark:text-white">Descripción (Opcional)</label>
              <Textarea
                {...register('description')}
                placeholder="Describe el propósito o el enfoque de este grupo..."
                className={`min-h-[120px] rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 font-medium resize-none p-4 ${errors.description ? 'border-red-500' : ''}`}
              />
              {errors.description && <span className="text-red-500 text-xs font-bold">{errors.description.message}</span>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Lock className="h-4 w-4 text-slate-400" /> Código de Acceso Privado (Opcional)
              </label>
              <Input
                {...register('access_code')}
                type="text"
                placeholder="Ej. PASS123"
                className={`h-14 rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 font-medium sm:max-w-xs ${errors.access_code ? 'border-red-500' : ''}`}
              />
              {errors.access_code && <span className="text-red-500 text-xs font-bold">{errors.access_code.message}</span>}
              <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">
                Si lo dejas en blanco, el aula será pública (sujeta a tu aprobación).
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-2xl shadow-slate-200/50 dark:shadow-none bg-amber-50/50 dark:bg-amber-900/10 rounded-[2.5rem] overflow-hidden border border-amber-100 dark:border-amber-900/30">
          <CardContent className="p-8">
            <div className="flex gap-4">
              <div className="h-12 w-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 text-amber-600 flex items-center justify-center shrink-0">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-amber-900 dark:text-amber-400">Siguiente Paso: Invitar Alumnos</h3>
                <p className="text-amber-700/70 dark:text-amber-300/70 font-medium text-sm mt-1 leading-relaxed">
                  Una vez que el aula sea creada, podrás gestionar los alumnos desde la pantalla de gestión del aula e invitarlos directamente.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </form>
  )
}
