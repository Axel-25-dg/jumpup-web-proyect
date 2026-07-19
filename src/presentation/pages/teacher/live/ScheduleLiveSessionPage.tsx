import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Save,
  Loader2,
  Calendar,
  Clock,
  Users,
  Link2,
  Info
} from 'lucide-react'
import { Button } from '@/presentation/components/ui/button'
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
  classroom_id: z.coerce.number().nullable().optional(),
  join_url: z.string().url('Debe ser una URL válida').optional().or(z.literal('')),
})

type ScheduleFormData = z.infer<typeof formSchema>

export default function ScheduleLiveSessionPage() {
  const navigate = useNavigate()
  const user = useAuthStore(s => s.user)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [classrooms, setClassrooms] = useState<Classroom[]>([])

  const { register, handleSubmit, formState: { errors } } = useForm<ScheduleFormData>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      title: '',
      scheduled_date: '',
      scheduled_time: '',
      duration_minutes: 60,
      join_url: '',
      classroom_id: null as any
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
        classroom_id: data.classroom_id ?? undefined,
        join_url: data.join_url ?? undefined,
        status: 'upcoming',
      })
      toast.success('Sesión en vivo programada con éxito')
      navigate('/teacher/live')
    } catch (error) {
      console.error('Error creating live session:', error)
      toast.error(error instanceof Error ? error.message : 'Ocurrió un error al programar la sesión')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="animate-in fade-in duration-500">
      {/* Header Editorial */}
      <section className="border-b border-slate-900/10 dark:border-white/10 px-8 md:px-12 py-14 md:py-20">
        <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-10">
          <div className="space-y-6 max-w-2xl">
            <Link to="/teacher/live" className="inline-flex items-center gap-2 label-caps text-slate-400 hover:text-sky-500 transition-colors">
              <ArrowLeft className="h-3.5 w-3.5" /> Volver a sesiones
            </Link>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.05] text-slate-900 dark:text-white">
              Nueva <br />
              <span className="text-sky-500">Sesión.</span>
            </h1>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="rounded-none border-2 border-slate-900 dark:border-white label-caps"
              onClick={() => navigate('/teacher/live')}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              form="schedule-form"
              type="submit"
              size="lg"
              disabled={isSubmitting}
              className="gap-2 group"
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Programar
            </Button>
          </div>
        </div>
      </section>

      {/* Form Editorial */}
      <section className="border-b border-slate-900/10 dark:border-white/10">
        <form id="schedule-form" onSubmit={handleSubmit((data) => onSubmit(data))} className="grid grid-cols-1 lg:grid-cols-2 bg-slate-900/10 dark:bg-white/10 gap-px">

          {/* Main Info */}
          <div className="bg-white dark:bg-slate-950 p-8 md:p-12 space-y-12">
            <div className="space-y-8">
              <h2 className="label-caps text-slate-400">Información General</h2>

              <div className="space-y-3">
                <label className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">Título de la Sesión</label>
                <input
                  {...register('title')}
                  placeholder="Ej. Conversación Avanzada: Arte y Cultura"
                  className={`w-full bg-transparent border-b-2 border-slate-900/10 dark:border-white/10 focus:border-sky-500 outline-none py-3 text-2xl font-black tracking-tight transition-colors placeholder:text-slate-200 dark:placeholder:text-slate-800 ${errors.title ? 'border-red-500 focus:border-red-500' : ''}`}
                />
                {errors.title && <p className="text-[10px] font-black text-red-500 uppercase">{String(errors.title.message)}</p>}
              </div>

              <div className="grid grid-cols-2 gap-8 pt-4">
                <div className="space-y-3">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5 text-sky-500" /> Fecha
                  </label>
                  <input
                    {...register('scheduled_date')}
                    type="date"
                    className="w-full bg-transparent border-b-2 border-slate-900/10 dark:border-white/10 focus:border-sky-500 outline-none py-2 font-bold transition-colors"
                  />
                  {errors.scheduled_date && <p className="text-[10px] font-black text-red-500 uppercase">{String(errors.scheduled_date.message)}</p>}
                </div>
                <div className="space-y-3">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 text-sky-500" /> Hora
                  </label>
                  <input
                    {...register('scheduled_time')}
                    type="time"
                    className="w-full bg-transparent border-b-2 border-slate-900/10 dark:border-white/10 focus:border-sky-500 outline-none py-2 font-bold transition-colors"
                  />
                  {errors.scheduled_time && <p className="text-[10px] font-black text-red-500 uppercase">{String(errors.scheduled_time.message)}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* Configuration */}
          <div className="bg-white dark:bg-slate-950 p-8 md:p-12 space-y-12">
            <div className="space-y-8">
              <h2 className="label-caps text-slate-400">Detalles de Conexión</h2>

              <div className="space-y-3">
                <label className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5 text-sky-500" /> Duración (Minutos)
                </label>
                <input
                  {...register('duration_minutes')}
                  type="number"
                  placeholder="60"
                  className="w-full bg-transparent border-b-2 border-slate-900/10 dark:border-white/10 focus:border-sky-500 outline-none py-2 font-bold transition-colors"
                />
                {errors.duration_minutes && <p className="text-[10px] font-black text-red-500 uppercase">{String(errors.duration_minutes.message)}</p>}
              </div>

              <div className="space-y-3">
                <label className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white flex items-center gap-2">
                  <Users className="h-3.5 w-3.5 text-sky-500" /> Aula Asignada
                </label>
                <select
                  {...register('classroom_id')}
                  className="w-full bg-transparent border-b-2 border-slate-900/10 dark:border-white/10 focus:border-sky-500 outline-none py-2 font-bold transition-colors appearance-none cursor-pointer"
                >
                  <option value="">Selecciona un aula (opcional)</option>
                  {classrooms.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white flex items-center gap-2">
                  <Link2 className="h-3.5 w-3.5 text-sky-500" /> Enlace de Videollamada
                </label>
                <input
                  {...register('join_url')}
                  type="url"
                  placeholder="https://meet.google.com/..."
                  className="w-full bg-transparent border-b-2 border-slate-900/10 dark:border-white/10 focus:border-sky-500 outline-none py-2 font-bold transition-colors"
                />
                {errors.join_url && <p className="text-[10px] font-black text-red-500 uppercase">{String(errors.join_url.message)}</p>}
              </div>
            </div>

            <div className="flex gap-4 p-6 border-2 border-slate-900 dark:border-white">
              <Info className="h-5 w-5 text-sky-500 shrink-0" />
              <p className="text-xs font-bold leading-relaxed text-slate-600 dark:text-slate-400">
                Al programar esta sesión, los estudiantes del aula seleccionada recibirán una notificación inmediata en su panel y por correo electrónico.
              </p>
            </div>
          </div>
        </form>
      </section>
    </div>
  )
}

