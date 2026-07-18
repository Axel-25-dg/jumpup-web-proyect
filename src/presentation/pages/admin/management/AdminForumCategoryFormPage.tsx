import { useState, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Save,
  Loader2,
  MessageSquare,
} from 'lucide-react'
import { Card, CardContent } from '@/presentation/components/ui/card'
import { Button } from '@/presentation/components/ui/button'
import { Input } from '@/presentation/components/ui/input'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { forumCategoryUseCase } from '@/infrastructure/factories/forum-category.factory'
import type { CreateForumCategoryDto } from '@/application/dtos/forum-category.dto'

const formSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres').max(100, 'Máximo 100 caracteres'),
  description: z.string().min(3, 'Mínimo 3 caracteres'),
  icon: z.string().min(1, 'Selecciona un icono'),
  order: z.coerce.number().int().min(1, 'Mínimo 1'),
  is_active: z.boolean().optional(),
})

type FormData = z.infer<typeof formSchema>

const PRESET_ICONS = ['💬', '📚', '🎯', '🎓', '💡', '❓', '📝', '🗣️', '🌍', '📢', '🎮', '💻', '📸', '🎵', '🏆', '🔬', '📊', '🤝', '🚀', '⭐']

export default function AdminForumCategoryFormPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(isEdit)

  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<any>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      icon: '💬',
      order: 1,
      is_active: true,
    }
  })

  const selectedIcon = watch('icon')

  useEffect(() => {
    const loadData = async () => {
      if (isEdit && id) {
        try {
          const category = await forumCategoryUseCase.getById(Number(id))
          reset({
            name: category.name,
            description: category.description,
            icon: category.icon || '💬',
            order: category.order,
            is_active: category.is_active,
          })
        } catch (error) {
          console.error('Error loading forum category:', error)
          toast.error('Error al cargar la categoría')
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
      const payload: CreateForumCategoryDto = {
        name: data.name,
        description: data.description,
        icon: data.icon,
        order: data.order,
        is_active: data.is_active,
      }

      if (isEdit && id) {
        await forumCategoryUseCase.update(Number(id), payload)
        toast.success('Categoría actualizada con éxito')
      } else {
        await forumCategoryUseCase.create(payload)
        toast.success('Categoría creada con éxito')
      }
      navigate('/admin/forum-categories')
    } catch (error: any) {
      console.error('Error saving forum category:', error)
      const errorMsg = error?.detail || error?.message || 'Error al guardar la categoría'
      toast.error(errorMsg)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-6 max-w-3xl mx-auto w-full">
      <div className="flex items-center gap-4 mb-8">
        <Link
          to="/admin/forum-categories"
          className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">
            {isEdit ? 'Editar Categoría del Foro' : 'Nueva Categoría del Foro'}
          </h1>
          <p className="text-slate-500 mt-1">
            {isEdit ? 'Modifica los datos de la categoría' : 'Crea una nueva categoría para el foro de la comunidad'}
          </p>
        </div>
      </div>

      <Card className="border-none shadow-2xl shadow-slate-200/50 bg-white rounded-[2.5rem] overflow-hidden">
        <CardContent className="p-8 space-y-6">
          {/* Name */}
          <div className="space-y-2">
            <label className="text-sm font-black text-slate-900 flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-slate-400" /> Nombre de la Categoría
            </label>
            <Input
              {...register('name')}
              placeholder="Ej. Dudas Técnicas, Conversación..."
              className={`h-14 rounded-xl border-slate-200 bg-slate-50 font-medium text-lg ${errors.name ? 'border-red-500' : ''}`}
            />
            {errors.name && <span className="text-red-500 text-xs font-bold">{errors.name.message as string}</span>}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-black text-slate-900">Descripción</label>
            <textarea
              {...register('description')}
              rows={4}
              placeholder="Describe el propósito de esta categoría..."
              className={`w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 transition-colors focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 placeholder:text-slate-400 resize-none ${errors.description ? 'border-red-500' : ''}`}
            />
            {errors.description && <span className="text-red-500 text-xs font-bold">{errors.description.message as string}</span>}
          </div>

          {/* Icon selector */}
          <div className="space-y-2">
            <label className="text-sm font-black text-slate-900">Icono</label>
            <div className="grid grid-cols-10 gap-2">
              {PRESET_ICONS.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setValue('icon', icon, { shouldValidate: true })}
                  className={`h-10 w-10 flex items-center justify-center rounded-xl text-lg transition-all ${
                    selectedIcon === icon
                      ? 'bg-indigo-100 ring-2 ring-indigo-500 scale-110 shadow-md'
                      : 'bg-slate-50 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
            <input type="hidden" {...register('icon')} />
            {errors.icon && <span className="text-red-500 text-xs font-bold">{errors.icon.message as string}</span>}
          </div>

          {/* Order & Active */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-black text-slate-900">Orden</label>
              <Input
                {...register('order', { valueAsNumber: true })}
                type="number"
                min={1}
                className={`h-14 rounded-xl border-slate-200 bg-slate-50 font-medium ${errors.order ? 'border-red-500' : ''}`}
              />
              {errors.order && <span className="text-red-500 text-xs font-bold">{errors.order.message as string}</span>}
            </div>

            <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200 self-end">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  {...register('is_active')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-500/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
              </label>
              <div>
                <span className="text-sm font-bold text-slate-900">Activo</span>
                <p className="text-xs text-slate-500 font-medium">Categoría visible en el foro</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action buttons */}
      <div className="mt-8 flex justify-end gap-3">
        <Link
          to="/admin/forum-categories"
          className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-100"
        >
          Cancelar
        </Link>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/30 transition-all hover:-translate-y-0.5 hover:bg-indigo-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 active:translate-y-0 disabled:opacity-70 disabled:pointer-events-none"
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {isSubmitting ? 'Guardando...' : (isEdit ? 'Actualizar Categoría' : 'Crear Categoría')}
        </Button>
      </div>
    </form>
  )
}