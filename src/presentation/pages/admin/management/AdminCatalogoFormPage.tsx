import { useState, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Save,
  Loader2,
  DollarSign,
  Globe,
  ShoppingBag,
  Layers,
} from 'lucide-react'
import { Button } from '@/presentation/components/ui/button'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { catalogoUseCase } from '@/infrastructure/factories/catalogo.factory'
import { getCoursesUseCase } from '@/infrastructure/factories/course.factory'
import type { CreateCatalogoDto } from '@/application/dtos/catalogo.dto'
import type { Course } from '@/domain/entities/course.entity'

const formSchema = z.object({
  titulo: z.string().min(3, 'Mínimo 3 caracteres').max(200, 'Máximo 200 caracteres'),
  tipo: z.enum(['curso', 'libro']),
  precio: z.coerce.number().min(0.01, 'El precio debe ser mayor a 0'),
  contenido_url: z.string().optional().or(z.literal('')),
  curso: z.string().optional().or(z.literal('')),
})

type FormData = z.infer<typeof formSchema>

export default function AdminCatalogoFormPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(isEdit)
  const [courses, setCourses] = useState<Course[]>([])

  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm<any>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      titulo: '',
      tipo: 'curso',
      precio: '' as unknown as number,
      contenido_url: '',
      curso: '',
    }
  })

  const selectedTipo = watch('tipo')

  useEffect(() => {
    const loadData = async () => {
      try {
        const courseResult = await getCoursesUseCase.execute()
        setCourses(courseResult.results || [])
      } catch { /* non-critical */ }

      if (isEdit && id) {
        try {
          const item = await catalogoUseCase.getById(Number(id))
          reset({
            titulo: item.titulo,
            tipo: item.tipo,
            precio: Number(item.precio),
            contenido_url: item.contenido_url || '',
            curso: item.curso ? String(item.curso) : '',
          })
        } catch (error) {
          toast.error('Error al cargar el producto')
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
      const payload: CreateCatalogoDto = {
        titulo: data.titulo,
        tipo: data.tipo,
        precio: data.precio,
        contenido_url: data.contenido_url || undefined,
      }
      if (data.curso) payload.curso = Number(data.curso)

      if (isEdit && id) {
        await catalogoUseCase.update(Number(id), payload)
        toast.success('Producto actualizado con éxito')
      } else {
        await catalogoUseCase.create(payload)
        toast.success('Producto creado con éxito')
      }
      navigate('/admin/catalogo')
    } catch (error: any) {
      console.error('Error saving catalogo item:', error)
      const errorMsg = error?.detail || error?.message || 'Error al guardar el producto'
      toast.error(errorMsg)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
        <p className="label-caps text-slate-400">Sincronizando Producto...</p>
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
                <Link to="/admin/catalogo"><ArrowLeft className="h-4 w-4" /></Link>
              </Button>
              <div className="chip">
                <ShoppingBag className="h-3.5 w-3.5 text-sky-500" />
                E-Commerce
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white uppercase">
              {isEdit ? 'Editar' : 'Nuevo'} <span className="text-sky-500">Producto</span>.
            </h1>
            <p className="text-base text-slate-500 dark:text-slate-400 max-w-lg font-medium">
              Gestión de productos del catálogo comercial de la plataforma JumpUp.
            </p>
          </div>
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/admin/catalogo')}
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
              {isEdit ? 'Actualizar Registro' : 'Crear Producto'}
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
                <h2 className="label-caps text-slate-900 dark:text-white font-black">Identidad del Producto</h2>
              </div>

              <div className="space-y-2">
                <label className="label-caps text-slate-400 text-[10px]">Título del Producto <span className="text-sky-500">*</span></label>
                <input
                  {...register('titulo')}
                  placeholder="EJ. CURSO DE INGLÉS B1 COMPLETO"
                  className={`w-full border ${errors.titulo ? 'border-rose-500' : 'border-slate-900/10 dark:border-white/10'} bg-transparent py-4 px-4 text-[12px] font-bold uppercase tracking-widest outline-none focus:border-sky-500 transition-colors`}
                />
                {errors.titulo && <p className="text-[10px] text-rose-500 font-mono mt-1">{String(errors.titulo.message)}</p>}
              </div>
            </div>

            {/* Pricing Group */}
            <div className="space-y-8">
              <div className="flex items-center gap-3 border-b border-slate-900/10 dark:border-white/10 pb-4">
                <DollarSign className="h-5 w-5 text-sky-500" />
                <h2 className="label-caps text-slate-900 dark:text-white font-black">Configuración Comercial</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="label-caps text-slate-400 text-[10px]">Tipo de Producto <span className="text-sky-500">*</span></label>
                  <select
                    {...register('tipo')}
                    className="w-full appearance-none border border-slate-900/10 dark:border-white/10 bg-white dark:bg-[#0a0a0b] py-4 px-4 text-[11px] font-bold uppercase tracking-widest outline-none focus:border-sky-500 transition-colors"
                  >
                    <option value="curso">CURSO</option>
                    <option value="libro">LIBRO</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="label-caps text-slate-400 text-[10px]">Precio <span className="text-sky-500">*</span></label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                    <input
                      {...register('precio')}
                      type="number"
                      step="0.01"
                      min={0.01}
                      placeholder="49.99"
                      className={`w-full border ${errors.precio ? 'border-rose-500' : 'border-slate-900/10 dark:border-white/10'} bg-transparent py-4 pl-12 pr-4 text-[12px] font-mono outline-none focus:border-sky-500 transition-colors`}
                    />
                  </div>
                  {errors.precio && <p className="text-[10px] text-rose-500 font-mono mt-1">{String(errors.precio.message)}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <label className="label-caps text-slate-400 text-[10px]">URL de Contenido Digital</label>
                <div className="relative">
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                  <input
                    {...register('contenido_url')}
                    placeholder="HTTPS://EJEMPLO.COM/CONTENIDO"
                    className="w-full border border-slate-900/10 dark:border-white/10 bg-transparent py-4 pl-12 pr-4 text-[12px] font-mono outline-none focus:border-sky-500 transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar / Settings */}
          <div className="space-y-8">
            <div className="p-8 border border-slate-900/10 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02]">
              <h3 className="label-caps text-slate-900 dark:text-white font-black mb-6">Vinculación Curricular</h3>

              <div className="space-y-6">
                {selectedTipo === 'curso' && (
                  <div className="space-y-2">
                    <label className="label-caps text-slate-400 text-[10px]">Curso Asociado</label>
                    <select
                      {...register('curso')}
                      className="w-full appearance-none border border-slate-900/10 dark:border-white/10 bg-white dark:bg-[#0a0a0b] py-4 px-4 text-[11px] font-bold uppercase tracking-widest outline-none focus:border-sky-500 transition-colors"
                    >
                      <option value="">SIN CURSO ASOCIADO</option>
                      {courses.map(c => (
                        <option key={c.id} value={c.id}>{c.title.toUpperCase()} - {c.language_name?.toUpperCase()} ({c.difficulty_level?.toUpperCase()})</option>
                      ))}
                    </select>
                  </div>
                )}

                {selectedTipo !== 'curso' && (
                  <div className="p-6 border border-slate-900/10 dark:border-white/10 bg-slate-50/30 dark:bg-white/[0.01]">
                    <p className="label-micro text-slate-400 font-mono uppercase text-center">
                      LOS LIBROS NO REQUIEREN ASOCIACIÓN A UN CURSO.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="p-8 border border-slate-900/10 dark:border-white/10 border-dashed">
              <p className="label-micro text-slate-400 leading-relaxed font-mono uppercase">
                EL PRODUCTO SE PUBLICARÁ AUTOMÁTICAMENTE EN EL CATÁLOGO COMERCIAL AL CREARSE. LOS CAMBIOS DE PRECIO AFECTAN A NUEVAS TRANSACCIONES.
              </p>
            </div>
          </div>
        </div>
      </div>
    </form>
  )
}