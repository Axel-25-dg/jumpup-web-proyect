import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Video,
  Save,
  Loader2,
  Calendar,
  Clock,
  Users,
  Link2
} from 'lucide-react'
import { Card, CardContent } from '@/presentation/components/ui/card'
import { Button } from '@/presentation/components/ui/button'
import { Input } from '@/presentation/components/ui/input'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { createLiveSessionUseCase, getTeacherClassroomsUseCase } from '@/infrastructure/factories/teacher.factory'
import { useAuthStore } from '@/presentation/store/auth.store'
import type { Classroom } from '@/domain/entities/classroom.entity'

const formSchema = z.object({
  title: z.string().min(3, 'El título debe tener al menos 3 caracteres'),
  scheduled_date: z.string().min(1, 'La fecha es obligatoria'),
  scheduled_time: z.string().min(1, 'La hora es obligatoria'),
  duration_minutes: z.coerce.number().min(15, 'Mínimo 15 minutos').max(480, 'Máximo 8 horas'),
  classroom_id: z.coerce.number().optional(),
  join_url: z.string().url('Debe ser una URL válida').optional().or(z.literal('')),
})

type ScheduleFormData = z.infer<typeof formSchema>

export default function ScheduleLiveSessionPage() {
  const navigate = useNavigate()
  const user = useAuthStore(s => s.user)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [classrooms, setClassrooms] = useState<Classroom[]>([])

  const { register, handleSubmit, formState: { errors } } = useForm<any>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      scheduled_date: '',
      scheduled_time: '',
      duration_minutes: 60,
      join_url: '',
    }
  })

  useEffect(() => {
    const loadClassrooms = async () => {
      if (!user?.user_id) return
      try {
        const result = await getTeacherClassroomsUseCase.execute(user.user_id)
        setClassrooms(result.results || [])
      } catch {
        // Non-critical error, classrooms are optional
      }
    }
    loadClassrooms()
  }, [user?.user_id])

  const onSubmit = async (data: ScheduleFormData) => {
    if (!user?.user_id) return
    setIsSubmitting(true)
    try {
      const scheduledDatetime = `${data.scheduled_date}T${data.scheduled_time}:00`
      await createLiveSessionUseCase.execute({
        title: data.title,
        scheduled_date: scheduledDatetime,
        duration_minutes: data.duration_minutes,
        teacher_id: user.user_id,
        classroom_id: data.classroom_id || undefined,
        join_url: data.join_url || undefined,
        status: 'upcoming',
      })
      toast.success('Sesión en vivo programada con éxito')
      navigate('/teacher/live')
    } catch (error: any) {
      console.error('Error creating live session:', error)
      toast.error(error?.detail || 'Ocurrió un error al programar la sesión')
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
            <Link to="/teacher/live"><ArrowLeft className="h-5 w-5" /></Link>
          </Button>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Programar Sesión en Vivo</h1>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-1">Agenda una clase virtual para tus alumnos</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            className="h-12 rounded-xl font-bold dark:border-slate-700"
            onClick={() => navigate('/teacher/live')}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-12 rounded-xl font-black bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-500/20 px-6"
          >
            {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
            Programar Sesión
          </Button>
        </div>
      </div>

      <div className="grid gap-8">
        {/* Main Form */}
        <Card className="border-none shadow-2xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden">
          <CardContent className="p-8 space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <label className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Video className="h-4 w-4 text-slate-400" /> Título de la Sesión
              </label>
              <Input
                {...register('title')}
                placeholder="Ej. Clase de conversación — Nivel B2"
                className={`h-14 rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 font-medium text-lg ${errors.title ? 'border-red-500' : ''}`}
              />
              {errors.title && <span className="text-red-500 text-xs font-bold">{errors.title.message as string}</span>}
            </div>

            {/* Date & Time */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-slate-400" /> Fecha
                </label>
                <Input
                  {...register('scheduled_date')}
                  type="date"
                  className={`h-14 rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 font-medium ${errors.scheduled_date ? 'border-red-500' : ''}`}
                />
                {errors.scheduled_date && <span className="text-red-500 text-xs font-bold">{errors.scheduled_date.message as string}</span>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Clock className="h-4 w-4 text-slate-400" /> Hora de Inicio
                </label>
                <Input
                  {...register('scheduled_time')}
                  type="time"
                  className={`h-14 rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 font-medium ${errors.scheduled_time ? 'border-red-500' : ''}`}
                />
                {errors.scheduled_time && <span className="text-red-500 text-xs font-bold">{errors.scheduled_time.message as string}</span>}
              </div>
            </div>

            {/* Duration & Classroom */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Clock className="h-4 w-4 text-slate-400" /> Duración (minutos)
                </label>
                <Input
                  {...register('duration_minutes')}
                  type="number"
                  min={15}
                  max={480}
                  className={`h-14 rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 font-medium ${errors.duration_minutes ? 'border-red-500' : ''}`}
                />
                {errors.duration_minutes && <span className="text-red-500 text-xs font-bold">{errors.duration_minutes.message as string}</span>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Users className="h-4 w-4 text-slate-400" /> Aula Asignada (Opcional)
                </label>
                <select
                  {...register('classroom_id')}
                  className="w-full h-14 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 px-4 font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Sin aula específica</option>
                  {classrooms.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Join URL */}
            <div className="space-y-2">
              <label className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Link2 className="h-4 w-4 text-slate-400" /> Enlace de Videoconferencia (Opcional)
              </label>
              <Input
                {...register('join_url')}
                type="url"
                placeholder="Ej. https://meet.google.com/abc-xyz"
                className={`h-14 rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 font-medium ${errors.join_url ? 'border-red-500' : ''}`}
              />
              {errors.join_url && <span className="text-red-500 text-xs font-bold">{errors.join_url.message as string}</span>}
              <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">Zoom, Google Meet, Teams u otra plataforma.</p>
            </div>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="border-none bg-indigo-50/50 dark:bg-indigo-900/10 rounded-[2.5rem] overflow-hidden border border-indigo-100 dark:border-indigo-900/30">
          <CardContent className="p-8">
            <div className="flex gap-4">
              <div className="h-12 w-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 flex items-center justify-center shrink-0">
                <Video className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-indigo-900 dark:text-indigo-400">Notificación automática</h3>
                <p className="text-indigo-700/70 dark:text-indigo-300/70 font-medium text-sm mt-1 leading-relaxed">
                  Al programar la sesión, los alumnos del aula asignada recibirán una notificación automática con los detalles y el enlace de acceso.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </form>
  )
}

