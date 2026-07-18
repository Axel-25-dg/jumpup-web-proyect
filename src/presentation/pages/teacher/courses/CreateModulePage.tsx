import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  ArrowLeft,
  Save,
  BookOpen,
  Loader2
} from 'lucide-react'
import { Card, CardContent } from '@/presentation/components/ui/card'
import { Button } from '@/presentation/components/ui/button'
import { Input } from '@/presentation/components/ui/input'
import { Textarea } from '@/presentation/components/ui/textarea'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { courseRepo } from '@/infrastructure/factories/teacher.factory'
import type { Course } from '@/domain/entities/course.entity'

const formSchema = z.object({
  course: z.coerce.number().min(1, 'Selecciona un curso'),
  title: z.string().min(3, 'El título debe tener al menos 3 caracteres'),
  description: z.string().max(500, 'Máximo 500 caracteres').optional(),
  order: z.coerce.number().min(1, 'El orden debe ser al menos 1').optional(),
})

type FormData = z.infer<typeof formSchema>

export default function CreateModulePage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const preselectedCourse = searchParams.get('course')

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [courses, setCourses] = useState<Course[]>([])
  const [isLoadingCourses, setIsLoadingCourses] = useState(true)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      course: preselectedCourse ? Number(preselectedCourse) : undefined,
      title: '',
      description: '',
      order: 1,
    }
  })

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const result = await courseRepo.getAll()
        setCourses(result.results || [])
      } catch {
        toast.error('No se pudieron cargar los cursos')
      } finally {
        setIsLoadingCourses(false)
      }
    }
    loadCourses()
  }, [])

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true)
    try {
      await courseRepo.createModule({
        course: data.course,
        title: data.title,
        description: data.description || undefined,
        order: data.order || 1,
      })
      toast.success(`Módulo "${data.title}" creado con éxito`)
      navigate(preselectedCourse
        ? `/teacher/courses/${data.course}/edit`
        : '/teacher/courses'
      )
    } catch (error: any) {
      console.error('Error creating module:', error)
      toast.error(error?.detail || 'Error al crear el módulo')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 animate-in fade-in duration-700 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild className="rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">
            <Link to={preselectedCourse ? `/teacher/courses/${preselectedCourse}/edit` : '/teacher/courses'}>
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Nuevo Módulo</h1>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-1">Estructura temática de tu curso</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            className="h-12 rounded-xl font-bold dark:border-slate-700"
            onClick={() => navigate(preselectedCourse ? `/teacher/courses/${preselectedCourse}/edit` : '/teacher/courses')}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || isLoadingCourses}
            className="h-12 rounded-xl font-black bg-sky-600 hover:bg-sky-700 shadow-xl shadow-sky-500/20 px-6"
          >
            {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
            Guardar Módulo
          </Button>
        </div>
      </div>

      <div className="grid gap-8">
        <Card className="border-none shadow-2xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden">
          <CardContent className="p-8 space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-slate-400" /> Curso Asociado <span className="text-red-500">*</span>
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
              <label className="text-sm font-black text-slate-900 dark:text-white">
                Título del Módulo <span className="text-red-500">*</span>
              </label>
              <Input
                {...register('title')}
                placeholder="Ej. Unidad 1: Fundamentos del idioma"
                className={`h-14 rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 font-medium text-lg ${errors.title ? 'border-red-500' : ''}`}
              />
              {errors.title && <span className="text-red-500 text-xs font-bold">{errors.title.message}</span>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-black text-slate-900 dark:text-white">Descripción del Módulo</label>
              <Textarea
                {...register('description')}
                placeholder="Describe los objetivos específicos de este módulo..."
                className="min-h-[120px] rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 font-medium resize-none p-4"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-black text-slate-900 dark:text-white">Orden del Módulo</label>
              <Input
                {...register('order')}
                type="number"
                min={1}
                placeholder="Ej. 1"
                className="h-14 rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 font-medium w-full sm:max-w-[150px]"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </form>
  )
}
