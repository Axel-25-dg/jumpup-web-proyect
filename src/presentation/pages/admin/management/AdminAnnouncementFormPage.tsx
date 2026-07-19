import { useState, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Save,
  Loader2,
  Bell,
  Calendar,
  Layers,
  FileText
} from 'lucide-react'
import { Button } from '@/presentation/components/ui/button'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { announcementUseCase } from '@/infrastructure/factories/announcement.factory'
import type { CreateAnnouncementDto } from '@/application/dtos/announcement.dto'

const formSchema = z.object({
  title: z.string().min(3, 'El título debe tener al menos 3 caracteres').max(200, 'Máximo 200 caracteres'),
  content: z.string().min(10, 'El contenido debe tener al menos 10 caracteres'),
  start_date: z.string().min(1, 'La fecha de inicio es obligatoria'),
  end_date: z.string().min(1, 'La fecha de fin es obligatoria'),
  is_active: z.boolean().optional(),
}).refine((data) => {
  if (data.start_date && data.end_date) {
    return new Date(data.end_date) > new Date(data.start_date)
  }
  return true
}, {
  message: 'La fecha de fin debe ser posterior a la fecha de inicio',
  path: ['end_date'],
})

type FormData = z.infer<typeof formSchema>

export default function AdminAnnouncementFormPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(isEdit)

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      content: '',
      start_date: '',
      end_date: '',
      is_active: true,
    }
  })

  useEffect(() => {
    const loadData = async () => {
      if (isEdit && id) {
        try {
          const announcement = await announcementUseCase.getById(Number(id))
          const startDate = announcement.start_date.slice(0, 16)
          const endDate = announcement.end_date.slice(0, 16)
          reset({
            title: announcement.title,
            content: announcement.content,
            start_date: startDate,
            end_date: endDate,
            is_active: announcement.is_active,
          })
        } catch (error) {
          console.error('Error loading announcement:', error)
          toast.error('Error al cargar el anuncio')
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
      const payload: CreateAnnouncementDto = {
        title: data.title,
        content: data.content,
        start_date: new Date(data.start_date).toISOString(),
        end_date: new Date(data.end_date).toISOString(),
        is_active: data.is_active,
      }

      if (isEdit && id) {
        await announcementUseCase.update(Number(id), payload)
        toast.success('Anuncio actualizado con éxito')
      } else {
        await announcementUseCase.create(payload)
        toast.success('Anuncio creado con éxito')
      }
      navigate('/admin/announcements')
    } catch (error: any) {
      console.error('Error saving announcement:', error)
      toast.error(error?.message || 'Error al guardar el anuncio')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
        <p className="label-caps text-slate-400">Sincronizando Comunicado Institucional...</p>
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
                <Link to="/admin/announcements"><ArrowLeft className="h-4 w-4" /></Link>
              </Button>
              <div className="chip">
                <Bell className="h-3.5 w-3.5 text-sky-500" />
                Difusión Institucional
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white uppercase">
              {isEdit ? 'Editar' : 'Nuevo'} <span className="text-sky-500">Comunicado</span>.
            </h1>
            <p className="text-base text-slate-500 dark:text-slate-400 max-w-lg font-medium">
              Gestión de avisos, alertas de sistema y notificaciones globales para la comunidad académica.
            </p>
          </div>
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/admin/announcements')}
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
              {isEdit ? 'Actualizar Registro' : 'Publicar Anuncio'}
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
                <Layers className="h-5 w-5 text-sky-500" />
                <h2 className="label-caps text-slate-900 dark:text-white font-black">Encabezado y Cuerpo</h2>
              </div>

              <div className="space-y-2">
                <label className="label-caps text-slate-400 text-[10px]">Título del Comunicado <span className="text-sky-500">*</span></label>
                <input
                  {...register('title')}
                  placeholder="EJ. ACTUALIZACIÓN DE POLÍTICAS DE PRIVACIDAD"
                  className={`w-full border ${errors.title ? 'border-rose-500' : 'border-slate-900/10 dark:border-white/10'} bg-transparent py-4 px-4 text-[12px] font-bold uppercase tracking-widest outline-none focus:border-sky-500 transition-colors`}
                />
                {errors.title && <p className="text-[10px] text-rose-500 font-mono mt-1">{errors.title.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="label-caps text-slate-400 text-[10px]">Contenido Detallado <span className="text-sky-500">*</span></label>
                <div className="relative">
                   <FileText className="absolute left-4 top-4 h-4 w-4 text-slate-300" />
                   <textarea
                    {...register('content')}
                    placeholder="REDACCIÓN FORMAL DEL ANUNCIO..."
                    className={`w-full min-h-64 border ${errors.content ? 'border-rose-500' : 'border-slate-900/10 dark:border-white/10'} bg-transparent py-4 pl-12 pr-4 text-[12px] font-medium uppercase tracking-wider outline-none focus:border-sky-500 transition-colors resize-none`}
                  />
                </div>
                {errors.content && <p className="text-[10px] text-rose-500 font-mono mt-1">{errors.content.message}</p>}
              </div>
            </div>
          </div>

          {/* Sidebar / Settings */}
          <div className="space-y-8">
            <div className="p-8 border border-slate-900/10 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02]">
              <h3 className="label-caps text-slate-900 dark:text-white font-black mb-6">Ventana de Exposición</h3>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="label-caps text-slate-400 text-[10px]">Fecha de Activación</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                    <input
                      {...register('start_date')}
                      type="datetime-local"
                      className={`w-full border ${errors.start_date ? 'border-rose-500' : 'border-slate-900/10 dark:border-white/10'} bg-transparent py-4 pl-12 pr-4 text-[12px] font-mono outline-none focus:border-sky-500 transition-colors`}
                    />
                  </div>
                  {errors.start_date && <p className="text-[10px] text-rose-500 font-mono mt-1">{errors.start_date.message}</p>}
                </div>

                <div className="space-y-2">
                  <label className="label-caps text-slate-400 text-[10px]">Fecha de Caducidad</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                    <input
                      {...register('end_date')}
                      type="datetime-local"
                      className={`w-full border ${errors.end_date ? 'border-rose-500' : 'border-slate-900/10 dark:border-white/10'} bg-transparent py-4 pl-12 pr-4 text-[12px] font-mono outline-none focus:border-sky-500 transition-colors`}
                    />
                  </div>
                  {errors.end_date && <p className="text-[10px] text-rose-500 font-mono mt-1">{errors.end_date.message}</p>}
                </div>

                <div className="pt-4 border-t border-slate-900/10 dark:border-white/10">
                  <label className="flex items-center justify-between cursor-pointer group">
                    <span className="label-caps text-slate-600 dark:text-slate-400 text-[10px] font-bold">Estado de Difusión</span>
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
                    LOS COMUNICADOS INACTIVOS NO SE DESPLEGARÁN EN EL DASHBOARD.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-8 border border-slate-900/10 dark:border-white/10 border-dashed">
              <p className="label-micro text-slate-400 leading-relaxed font-mono uppercase">
                LOS ANUNCIOS TIENEN UN ALCANCE GLOBAL. ASEGÚRESE DE QUE EL CONTENIDO HA SIDO REVISADO POR EL DEPARTAMENTO DE COMUNICACIONES.
              </p>
            </div>
          </div>
        </div>
      </div>
    </form>
  )
}
