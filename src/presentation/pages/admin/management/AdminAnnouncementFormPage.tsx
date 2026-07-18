import { useState, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Save,
  Loader2,
  Bell,
} from 'lucide-react'
import { Card, CardContent } from '@/presentation/components/ui/card'
import { Button } from '@/presentation/components/ui/button'
import { Input } from '@/presentation/components/ui/input'
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
          // Format dates to YYYY-MM-DDTHH:mm for datetime-local input
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
      const errorMsg = error?.detail || error?.message || 'Error al guardar el anuncio'
      toast.error(errorMsg)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-sky-500 border-t-transparent" />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-6 max-w-3xl mx-auto w-full">
      <div className="flex items-center gap-4 mb-8">
        <Link
          to="/admin/announcements"
          className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">
            {isEdit ? 'Editar Anuncio' : 'Nuevo Anuncio'}
          </h1>
          <p className="text-slate-500 mt-1">
            {isEdit ? 'Modifica los datos del anuncio' : 'Crea un anuncio para todos los usuarios del sistema'}
          </p>
        </div>
      </div>

      <Card className="border-none shadow-2xl shadow-slate-200/50 bg-white rounded-[2.5rem] overflow-hidden">
        <CardContent className="p-8 space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <label className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Bell className="h-4 w-4 text-slate-400" /> Título del Anuncio
            </label>
            <Input
              {...register('title')}
              placeholder="Ej. Mantenimiento programado del sistema"
              className={`h-14 rounded-xl border-slate-200 bg-slate-50 font-medium text-lg ${errors.title ? 'border-red-500' : ''}`}
            />
            {errors.title && <span className="text-red-500 text-xs font-bold">{errors.title.message}</span>}
          </div>

          {/* Content */}
          <div className="space-y-2">
            <label className="text-sm font-black text-slate-900 flex items-center gap-2">
              Contenido
            </label>
            <textarea
              {...register('content')}
              rows={6}
              placeholder="Describe el anuncio en detalle..."
              className={`w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 transition-colors focus:border-sky-500 focus:outline-none focus:ring-4 focus:ring-sky-500/10 placeholder:text-slate-400 resize-none ${errors.content ? 'border-red-500' : ''}`}
            />
            {errors.content && <span className="text-red-500 text-xs font-bold">{errors.content.message}</span>}
          </div>

          {/* Start & End Date */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-black text-slate-900 flex items-center gap-2">
                Fecha de Inicio
              </label>
              <Input
                {...register('start_date')}
                type="datetime-local"
                className={`h-14 rounded-xl border-slate-200 bg-slate-50 font-medium ${errors.start_date ? 'border-red-500' : ''}`}
              />
              {errors.start_date && <span className="text-red-500 text-xs font-bold">{errors.start_date.message}</span>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-black text-slate-900 flex items-center gap-2">
                Fecha de Fin
              </label>
              <Input
                {...register('end_date')}
                type="datetime-local"
                className={`h-14 rounded-xl border-slate-200 bg-slate-50 font-medium ${errors.end_date ? 'border-red-500' : ''}`}
              />
              {errors.end_date && <span className="text-red-500 text-xs font-bold">{errors.end_date.message}</span>}
            </div>
          </div>

          {/* Active toggle */}
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                {...register('is_active')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-sky-500/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-500"></div>
            </label>
            <div>
              <span className="text-sm font-bold text-slate-900">Activo</span>
              <p className="text-xs text-slate-500 font-medium">Los usuarios podrán ver este anuncio</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action buttons */}
      <div className="mt-8 flex justify-end gap-3">
        <Link
          to="/admin/announcements"
          className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-100"
        >
          Cancelar
        </Link>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-sky-500/30 transition-all hover:-translate-y-0.5 hover:bg-sky-400 focus:outline-none focus:ring-4 focus:ring-sky-500/20 active:translate-y-0 disabled:opacity-70 disabled:pointer-events-none"
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {isSubmitting ? 'Guardando...' : (isEdit ? 'Actualizar Anuncio' : 'Publicar Anuncio')}
        </Button>
      </div>
    </form>
  )
}