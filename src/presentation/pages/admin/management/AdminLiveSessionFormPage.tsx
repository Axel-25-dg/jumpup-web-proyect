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
  Layers
} from 'lucide-react'
import { Button } from '@/presentation/components/ui/button'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { adminLiveSessionRepo } from '@/infrastructure/factories/admin-live-session.factory'
import { getCoursesUseCase } from '@/infrastructure/factories/course.factory'
import type { CreateAdminLiveSessionDto } from '@/application/dtos/admin-live-session.dto'
import type { Course } from '@/domain/entities/course.entity'

const formSchema = z.object({
  title: z.string().min(3, 'Mínimo 3 caracteres').max(200, 'Máximo 200 caracteres'),
  description: z.string().optional().or(z.literal('')),
  course: z.coerce.number().optional().or(z.literal(0)),
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
          const session = await adminLiveSessionRepo.getById(Number(id))
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
        } catch {
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
      if (data.course && data.course !== 0) payload.course = Number(data.course)

      if (isEdit && id) {
        await adminLiveSessionRepo.update(Number(id), payload)
        toast.success('Sesión actualizada con éxito')
      } else {
        await adminLiveSessionRepo.create(payload)
        toast.success('Sesión creada con éxito')
      }
      navigate('/admin/live-sessions')
    } catch (error: any) {
      console.error('Error saving live session:', error)
      toast.error(error?.message || 'Error al guardar la sesión')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
        <p className="label-caps text-slate-400">Sincronizando Bitácora en Vivo...</p>
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
                <Link to="/admin/live-sessions"><ArrowLeft className="h-4 w-4" /></Link>
              </Button>
              <div className="chip">
                <Video className="h-3.5 w-3.5 text-sky-500" />
                Control de Sesiones
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white uppercase">
              {isEdit ? 'Editar' : 'Nueva'} <span className="text-sky-500">Sesión</span>.
            </h1>
            <p className="text-base text-slate-500 dark:text-slate-400 max-w-lg font-medium">
              Programación de tutorías en tiempo real, control de aforo y despliegue de infraestructura.
            </p>
          </div>
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/admin/live-sessions')}
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
              {isEdit ? 'Actualizar Registro' : 'Programar Sesión'}
            </Button>
          </div>
        </div>
      </section>

      {/* FORM BODY */}
      <div className="max-w-6xl mx-auto px-8 md:px-12 py-12">
        <div className="grid lg:grid-cols-[1fr_350px] gap-12">
          {/* Main Fields */}
          <div className="space-y-12">
            {/* General Info Group */}
            <div className="space-y-8">
              <div className="flex items-center gap-3 border-b border-slate-900/10 dark:border-white/10 pb-4">
                <Layers className="h-5 w-5 text-sky-500" />
                <h2 className="label-caps text-slate-900 dark:text-white font-black">Definición de Sesión</h2>
              </div>

              <div className="space-y-2">
                <label className="label-caps text-slate-400 text-[10px]">Título del Evento <span className="text-sky-500">*</span></label>
                <input
                  {...register('title')}
                  placeholder="EJ. TALLER DE PRONUNCIACIÓN AVANZADA"
                  className={`w-full border ${errors.title ? 'border-rose-500' : 'border-slate-900/10 dark:border-white/10'} bg-transparent py-4 px-4 text-[12px] font-bold uppercase tracking-widest outline-none focus:border-sky-500 transition-colors`}
                />
                {errors.title && <p className="text-[10px] text-rose-500 font-mono mt-1">{String(errors.title.message)}</p>}
              </div>

              <div className="space-y-2">
                <label className="label-caps text-slate-400 text-[10px]">Agenda / Descripción</label>
                <textarea
                  {...register('description')}
                  placeholder="TEMAS A TRATAR Y PREPARACIÓN REQUERIDA..."
                  className={`w-full min-h-32 border ${errors.description ? 'border-rose-500' : 'border-slate-900/10 dark:border-white/10'} bg-transparent py-4 px-4 text-[12px] font-medium uppercase tracking-wider outline-none focus:border-sky-500 transition-colors resize-none`}
                />
              </div>
            </div>

            {/* Logistics Group */}
            <div className="space-y-8">
              <div className="flex items-center gap-3 border-b border-slate-900/10 dark:border-white/10 pb-4">
                <Calendar className="h-5 w-5 text-sky-500" />
                <h2 className="label-caps text-slate-900 dark:text-white font-black">Logística y Despliegue</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="label-caps text-slate-400 text-[10px]">Fecha de Ejecución <span className="text-sky-500">*</span></label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                    <input
                      {...register('scheduled_date')}
                      type="date"
                      className={`w-full border ${errors.scheduled_date ? 'border-rose-500' : 'border-slate-900/10 dark:border-white/10'} bg-transparent py-4 pl-12 pr-4 text-[12px] font-mono outline-none focus:border-sky-500 transition-colors`}
                    />
                  </div>
                  {errors.scheduled_date && <p className="text-[10px] text-rose-500 font-mono mt-1">{String(errors.scheduled_date.message)}</p>}
                </div>
                <div className="space-y-2">
                  <label className="label-caps text-slate-400 text-[10px]">Hora de Inicio (UTC) <span className="text-sky-500">*</span></label>
                  <div className="relative">
                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                    <input
                      {...register('scheduled_time')}
                      type="time"
                      className={`w-full border ${errors.scheduled_time ? 'border-rose-500' : 'border-slate-900/10 dark:border-white/10'} bg-transparent py-4 pl-12 pr-4 text-[12px] font-mono outline-none focus:border-sky-500 transition-colors`}
                    />
                  </div>
                  {errors.scheduled_time && <p className="text-[10px] text-rose-500 font-mono mt-1">{String(errors.scheduled_time.message)}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <label className="label-caps text-slate-400 text-[10px]">Vínculo de Infraestructura (ZOOM / MEET / TEAMS)</label>
                <div className="relative">
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                  <input
                    {...register('meeting_url')}
                    type="url"
                    placeholder="HTTPS://MEET.GOOGLE.COM/..."
                    className="w-full border border-slate-900/10 dark:border-white/10 bg-transparent py-4 pl-12 pr-4 text-[12px] font-mono outline-none focus:border-sky-500 transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar / Settings */}
          <div className="space-y-8">
            <div className="p-8 border border-slate-900/10 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02]">
              <h3 className="label-caps text-slate-900 dark:text-white font-black mb-6">Parámetros de Red</h3>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="label-caps text-slate-400 text-[10px]">Curso Vinculado</label>
                  <div className="relative">
                    <select
                      {...register('course')}
                      className="w-full appearance-none border border-slate-900/10 dark:border-white/10 bg-white dark:bg-[#0a0a0b] py-4 px-4 text-[11px] font-bold uppercase tracking-widest outline-none focus:border-sky-500 transition-colors"
                    >
                      <option value="0">SESIÓN GLOBAL / ABIERTA</option>
                      {courses.map(c => <option key={c.id} value={c.id}>{c.title.toUpperCase()}</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="label-caps text-slate-400 text-[10px]">Duración Estimada (MIN)</label>
                  <div className="relative">
                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                    <input
                      {...register('duration_min')}
                      type="number"
                      className="w-full border border-slate-900/10 dark:border-white/10 bg-transparent py-4 pl-12 pr-4 text-[12px] font-mono outline-none focus:border-sky-500 transition-colors"
                    />
                  </div>
                  {errors.duration_min && <p className="text-[10px] text-rose-500 font-mono mt-1">{String(errors.duration_min.message)}</p>}
                </div>

                <div className="space-y-2">
                  <label className="label-caps text-slate-400 text-[10px]">Capacidad Máxima (NODOS)</label>
                  <div className="relative">
                    <Users className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                    <input
                      {...register('max_students')}
                      type="number"
                      className="w-full border border-slate-900/10 dark:border-white/10 bg-transparent py-4 pl-12 pr-4 text-[12px] font-mono outline-none focus:border-sky-500 transition-colors"
                    />
                  </div>
                  {errors.max_students && <p className="text-[10px] text-rose-500 font-mono mt-1">{String(errors.max_students.message)}</p>}
                </div>
              </div>
            </div>

            <div className="p-8 border border-slate-900/10 dark:border-white/10 border-dashed">
              <p className="label-micro text-slate-400 leading-relaxed font-mono uppercase">
                LA PROGRAMACIÓN DEBE REALIZARSE CON AL MENOS 24H DE ANTELACIÓN PARA NOTIFICAR A LOS ESTUDIANTES VÍA EMAIL TÉCNICO.
              </p>
            </div>
          </div>
        </div>
      </div>
    </form>
  )
}
