import { useState, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Save,
  Loader2,
  MessageSquare,
  Layers,
  FileText,
  Hash
} from 'lucide-react'
import { Button } from '@/presentation/components/ui/button'
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
      toast.error(error?.message || 'Error al guardar la categoría')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
        <p className="label-caps text-slate-400">Sincronizando Nodo Social...</p>
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
                <Link to="/admin/forum-categories"><ArrowLeft className="h-4 w-4" /></Link>
              </Button>
              <div className="chip">
                <MessageSquare className="h-3.5 w-3.5 text-sky-500" />
                Arquitectura Social
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white uppercase">
              {isEdit ? 'Editar' : 'Nueva'} <span className="text-sky-500">Categoría</span>.
            </h1>
            <p className="text-base text-slate-500 dark:text-slate-400 max-w-lg font-medium">
              Estructuración de espacios de debate, clasificación temática y jerarquía del conocimiento compartido.
            </p>
          </div>
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/admin/forum-categories')}
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
              {isEdit ? 'Actualizar Registro' : 'Crear Categoría'}
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
                <h2 className="label-caps text-slate-900 dark:text-white font-black">Definición Temática</h2>
              </div>

              <div className="space-y-2">
                <label className="label-caps text-slate-400 text-[10px]">Nombre de la Categoría <span className="text-sky-500">*</span></label>
                <input
                  {...register('name')}
                  placeholder="EJ. DUDAS TÉCNICAS Y SOPORTE"
                  className={`w-full border ${errors.name ? 'border-rose-500' : 'border-slate-900/10 dark:border-white/10'} bg-transparent py-4 px-4 text-[12px] font-bold uppercase tracking-widest outline-none focus:border-sky-500 transition-colors`}
                />
                {errors.name && <p className="text-[10px] text-rose-500 font-mono mt-1">{String(errors.name.message)}</p>}
              </div>

              <div className="space-y-2">
                <label className="label-caps text-slate-400 text-[10px]">Descripción del Espacio <span className="text-sky-500">*</span></label>
                <div className="relative">
                   <FileText className="absolute left-4 top-4 h-4 w-4 text-slate-300" />
                   <textarea
                    {...register('description')}
                    placeholder="PROPÓSITO Y REGLAS DE PARTICIPACIÓN..."
                    className={`w-full min-h-32 border ${errors.description ? 'border-rose-500' : 'border-slate-900/10 dark:border-white/10'} bg-transparent py-4 pl-12 pr-4 text-[12px] font-medium uppercase tracking-wider outline-none focus:border-sky-500 transition-colors resize-none`}
                  />
                </div>
                {errors.description && <p className="text-[10px] text-rose-500 font-mono mt-1">{String(errors.description.message)}</p>}
              </div>
            </div>

            {/* Visual Identity */}
            <div className="space-y-8">
              <div className="flex items-center gap-3 border-b border-slate-900/10 dark:border-white/10 pb-4">
                <Hash className="h-5 w-5 text-sky-500" />
                <h2 className="label-caps text-slate-900 dark:text-white font-black">Identidad Visual</h2>
              </div>
              <div className="space-y-4">
                <label className="label-caps text-slate-400 text-[10px]">Iconografía del Sistema</label>
                <div className="grid grid-cols-5 md:grid-cols-10 gap-px bg-slate-900/10 dark:bg-white/10 border border-slate-900/10 dark:border-white/10">
                  {PRESET_ICONS.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setValue('icon', icon, { shouldValidate: true })}
                      className={`h-12 flex items-center justify-center text-lg transition-colors ${
                        selectedIcon === icon
                          ? 'bg-sky-500 text-white'
                          : 'bg-white dark:bg-[#0a0a0b] text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5'
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
                <input type="hidden" {...register('icon')} />
                {errors.icon && <p className="text-[10px] text-rose-500 font-mono mt-1">{String(errors.icon.message)}</p>}
              </div>
            </div>
          </div>

          {/* Sidebar / Settings */}
          <div className="space-y-8">
            <div className="p-8 border border-slate-900/10 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02]">
              <h3 className="label-caps text-slate-900 dark:text-white font-black mb-6">Parámetros de Red</h3>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="label-caps text-slate-400 text-[10px]">Orden de Prioridad</label>
                  <div className="relative">
                    <Hash className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                    <input
                      {...register('order', { valueAsNumber: true })}
                      type="number"
                      min={1}
                      className={`w-full border ${errors.order ? 'border-rose-500' : 'border-slate-900/10 dark:border-white/10'} bg-transparent py-4 pl-12 pr-4 text-[12px] font-mono outline-none focus:border-sky-500 transition-colors`}
                    />
                  </div>
                  {errors.order && <p className="text-[10px] text-rose-500 font-mono mt-1">{String(errors.order.message)}</p>}
                </div>

                <div className="pt-4 border-t border-slate-900/10 dark:border-white/10">
                  <label className="flex items-center justify-between cursor-pointer group">
                    <span className="label-caps text-slate-600 dark:text-slate-400 text-[10px] font-bold">Estado del Nodo</span>
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
                    LAS CATEGORÍAS INACTIVAS OCULTAN TODOS LOS HILOS ASOCIADOS.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-8 border border-slate-900/10 dark:border-white/10 border-dashed">
              <p className="label-micro text-slate-400 leading-relaxed font-mono uppercase">
                LA REORGANIZACIÓN DE CATEGORÍAS AFECTA LA NAVEGACIÓN GLOBAL DEL FORO ESTUDIANTIL.
              </p>
            </div>
          </div>
        </div>
      </div>
    </form>
  )
}
