import { useState, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Save,
  Loader2,
  Video,
  Calendar,
  Clock,
  Users,
  Globe,
} from 'lucide-react'
import { Card, CardContent } from '@/presentation/components/ui/card'
import { Button } from '@/presentation/components/ui/button'
import { Input } from '@/presentation/components/ui/input'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { adminLiveSessionUseCase } from '@/infrastructure/factories/admin-live-session.factory'
import { getCoursesUseCase } from '@/infrastructure/factories/course.factory'
import type { CreateAdminLiveSessionDto } from '@/application/dtos/admin-live-session.dto'
import type { Course } from '@/domain/entities/course.entity'

const formSchema = z.object({
  title: z.string().min(3, 'Mínimo 3 caracteres').max(200, 'Máximo 200 caracteres'),
  description: z.string().optional(),
  course: z.coerce.number().optional(),
  scheduled_date: z.string().min(1, 'La fecha es obligatoria'),
  scheduled_time: z.string().min(1, 'La hora es obligatoria'),
  duration_min: z.coerce.number().min(15, 'Mínimo 15 minutos').max(480, 'Máximo 8 horas'),
  meeting_url: z.string().optional().or(z.literal('')),
  max_students: z.coerce.number().min(1, 'Mínimo 1').max(500, 'Máximo 500'),
})

type FormData = z.infer<typeof formSchema>

export default function AdminLiveSessionFormPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(isEdit)
  const [courses, setCourses] = useState<Course[]>([])

  const { register, handleSubmit, formState: { errors }, reset } = useForm<any>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      course: '',
      scheduled_date: '',
      scheduled_time: '',
      duration_min: 60,
      meeting_url: '',
      max_students: 30,
    }
  })

  useEffect(() => {
    const loadData = async () => {
      try {
        const courseResult = await getCoursesUseCase.execute()
        setCourses(courseResult.results || [])
      } catch { /* non-critical */ }

      if (isEdit && id) {
        try {
          const session = await adminLiveSessionUseCase.getById(Number(id))
          const scheduledDate = session.scheduled_at.slice(0, 16)
          reset({
            title: session.title,
            description: session.description || '',
            course: session.course || '',
            scheduled_date: scheduledDate.slice(0, 10),
            scheduled_time: scheduledDate.slice(11, 16),
            duration_min: session.duration_min,
            meeting_url: session.meeting_url || '',
            max_students: session.max_students,
          })
        } catch (error) {
          toast.error('Error al cargar la sesión')
        } finally {
          setIsLoading(false)
        }
      }
    }
    loadData()
  }, [id, isEdit, reset])

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true)
    try {
      const scheduledAt = `${data.scheduled_date}T${data.scheduled_time}:00`

      const payload: CreateAdminLiveSessionDto = {
        title: data.title,
        description: data.description || '',
        scheduled_at: scheduledAt,
        duration_min: data.duration_min,
        meeting_url: data.meeting_url || '',
        max_students: data.max_students,
        status: 'scheduled',
      }
      if (data.course) payload.course = Number(data.course)

      if (isEdit && id) {
        await adminLiveSessionUseCase.update(Number(id), payload)
        toast.success('Sesión actualizada con éxito')
      } else {
        await adminLiveSessionUseCase.create(payload)
        toast.success('Sesión creada con éxito')
      }
      navigate('/admin/live-sessions')
    } catch (error: any) {
      console.error('Error saving live session:', error)
      const errorMsg = error?.detail || error?.message || 'Error al guardar la sesión'
      toast.error(errorMsg)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-rose-500 border-t-transparent" />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-6 max-w-3xl mx-auto w-full">
      <div className="flex items-center gap-4 mb-8">
        <Link
          to="/admin/live-sessions"
          className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">
            {isEdit ? 'Editar Sesión' : 'Nueva Sesión en Vivo'}
          </h1>
          <p className="text-slate-500 mt-1">
            {isEdit ? 'Modifica los datos de la sesión' : 'Programa una nueva sesión de videotutoría'}
          </p>
        </div>
      </div>

      <Card className="border-none shadow-2xl shadow-slate-200/50 bg-white rounded-[2.5rem] overflow-hidden">
        <CardContent className="p-8 space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <label className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Video className="h-4 w-4 text-slate-400" /> Título de la Sesión
            </label>
            <Input
              {...register('title')}
              placeholder="Ej. Clase de conversación — Nivel B2"
              className={`h-14 rounded-xl border-slate-200 bg-slate-50 font-medium text-lg ${errors.title ? 'border-red-500' : ''}`}
            />
            {errors.title && <span className="text-red-500 text-xs font-bold">{errors.title.message as string}</span>}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-black text-slate-900">Descripción</label>
            <textarea
              {...register('description')}
              rows={4}
              placeholder="Describe el contenido de la sesión..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 transition-colors focus:border-rose-500 focus:outline-none focus:ring-4 focus:ring-rose-500/10 placeholder:text-slate-400 resize-none"
            />
          </div>

          {/* Course */}
          <div className="space-y-2">
            <label className="text-sm font-black text-slate-900">Curso (opcional)</label>
            <select
              {...register('course')}
              className="w-full h-14 rounded-xl border border-slate-200 bg-slate-50 px-4 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
            >
              <option value="">Sin curso específico</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </div>

          {/* Date & Time */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-slate-400" /> Fecha
              </label>
              <Input
                {...register('scheduled_date')}
                type="date"
                className={`h-14 rounded-xl border-slate-200 bg-slate-50 font-medium ${errors.scheduled_date ? 'border-red-500' : ''}`}
              />
              {errors.scheduled_date && <span className="text-red-500 text-xs font-bold">{errors.scheduled_date.message as string}</span>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Clock className="h-4 w-4 text-slate-400" /> Hora de Inicio
              </label>
              <Input
                {...register('scheduled_time')}
                type="time"
                className={`h-14 rounded-xl border-slate-200 bg-slate-50 font-medium ${errors.scheduled_time ? 'border-red-500' : ''}`}
              />
              {errors.scheduled_time && <span className="text-red-500 text-xs font-bold">{errors.scheduled_time.message as string}</span>}
            </div>
          </div>

          {/* Duration & Max Students */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Clock className="h-4 w-4 text-slate-400" /> Duración (minutos)
              </label>
              <Input
                {...register('duration_min')}
                type="number"
                min={15}
                max={480}
                className={`h-14 rounded-xl border-slate-200 bg-slate-50 font-medium ${errors.duration_min ? 'border-red-500' : ''}`}
              />
              {errors.duration_min && <span className="text-red-500 text-xs font-bold">{errors.duration_min.message as string}</span>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Users className="h-4 w-4 text-slate-400" /> Máximo de Estudiantes
              </label>
              <Input
                {...register('max_students')}
                type="number"
                min={1}
                max={500}
                className={`h-14 rounded-xl border-slate-200 bg-slate-50 font-medium ${errors.max_students ? 'border-red-500' : ''}`}
              />
              {errors.max_students && <span className="text-red-500 text-xs font-bold">{errors.max_students.message as string}</span>}
            </div>
          </div>

          {/* Meeting URL */}
          <div className="space-y-2">
            <label className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Globe className="h-4 w-4 text-slate-400" /> Enlace de Videoconferencia (opcional)
            </label>
            <Input
              {...register('meeting_url')}
              type="url"
              placeholder="https://meet.google.com/abc-xyz"
              className="h-14 rounded-xl border-slate-200 bg-slate-50 font-medium"
            />
            <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">Zoom, Google Meet, Teams u otra plataforma.</p>
          </div>
        </CardContent>
      </Card>

      {/* Action buttons */}
      <div className="mt-8 flex justify-end gap-3">
        <Link
          to="/admin/live-sessions"
          className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-50"
        >
          Cancelar
        </Link>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-rose-500/30 transition-all hover:-translate-y-0.5 hover:bg-rose-400 disabled:opacity-70 disabled:pointer-events-none"
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {isSubmitting ? 'Guardando...' : (isEdit ? 'Actualizar Sesión' : 'Programar Sesión')}
        </Button>
      </div>
    </form>
  )
}