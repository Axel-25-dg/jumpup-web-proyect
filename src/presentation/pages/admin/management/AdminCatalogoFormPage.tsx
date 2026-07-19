import { useState, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Save,
  Loader2,
  Package,
  Tag,
  DollarSign,
  Globe,
  BookOpen,
} from 'lucide-react'
import { Card, CardContent } from '@/presentation/components/ui/card'
import { Button } from '@/presentation/components/ui/button'
import { Input } from '@/presentation/components/ui/input'
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
  contenido_url: z.string().optional(),
  curso: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

export default function AdminCatalogoFormPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(isEdit)
  const [courses, setCourses] = useState<Course[]>([])

  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm<FormData>({
    resolver: zodResolver(formSchema as any),
    defaultValues: {
      titulo: '',
      tipo: 'curso',
      precio: undefined as unknown as number,
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
      <div className="flex h-64 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-sky-500 border-t-transparent" />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit as any)} className="p-6 max-w-3xl mx-auto w-full">
      <div className="flex items-center gap-4 mb-8">
        <Link
          to="/admin/catalogo"
          className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">
            {isEdit ? 'Editar Producto' : 'Nuevo Producto'}
          </h1>
          <p className="text-slate-500 mt-1">
            {isEdit ? 'Modifica los datos del producto' : 'Agrega un nuevo producto al catálogo'}
          </p>
        </div>
      </div>

      <Card className="border-none shadow-2xl shadow-slate-200/50 bg-white rounded-[2.5rem] overflow-hidden">
        <CardContent className="p-8 space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <label className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Tag className="h-4 w-4 text-slate-400" /> Título del Producto
            </label>
            <Input
              {...register('titulo')}
              placeholder="Ej. Curso de Inglés Básico"
              className={`h-14 rounded-xl border-slate-200 bg-slate-50 font-medium text-lg ${errors.titulo ? 'border-red-500' : ''}`}
            />
            {errors.titulo && <span className="text-red-500 text-xs font-bold">{errors.titulo.message as string}</span>}
          </div>

          {/* Tipo */}
          <div className="space-y-2">
            <label className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Package className="h-4 w-4 text-slate-400" /> Tipo de Producto
            </label>
            <select
              {...register('tipo')}
              className="w-full h-14 rounded-xl border border-slate-200 bg-slate-50 px-4 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="curso">Curso</option>
              <option value="libro">Libro</option>
            </select>
          </div>

          {/* Price */}
          <div className="space-y-2">
            <label className="text-sm font-black text-slate-900 flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-slate-400" /> Precio
            </label>
            <Input
              {...register('precio')}
              type="number"
              step="0.01"
              min={0.01}
              placeholder="49.99"
              className={`h-14 rounded-xl border-slate-200 bg-slate-50 font-medium ${errors.precio ? 'border-red-500' : ''}`}
            />
            {errors.precio && <span className="text-red-500 text-xs font-bold">{errors.precio.message as string}</span>}
          </div>

          {/* Course (solo si tipo === curso) */}
          {selectedTipo === 'curso' && (
            <div className="space-y-2">
              <label className="text-sm font-black text-slate-900 flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-slate-400" /> Curso Asociado (opcional)
              </label>
              <select
                {...register('curso')}
                className="w-full h-14 rounded-xl border border-slate-200 bg-slate-50 px-4 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="">Sin curso asociado</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>{c.title} - {c.language_name} ({c.difficulty_level})</option>
                ))}
              </select>
              <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">Selecciona el curso al que pertenece este producto.</p>
            </div>
          )}

          {/* Content URL */}
          <div className="space-y-2">
            <label className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Globe className="h-4 w-4 text-slate-400" /> URL de Contenido (opcional)
            </label>
            <Input
              {...register('contenido_url')}
              type="url"
              placeholder="https://ejemplo.com/contenido"
              className="h-14 rounded-xl border-slate-200 bg-slate-50 font-medium"
            />
            <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">Enlace al contenido digital si aplica.</p>
          </div>
        </CardContent>
      </Card>

      {/* Action buttons */}
      <div className="mt-8 flex justify-end gap-3">
        <Link
          to="/admin/catalogo"
          className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-50"
        >
          Cancelar
        </Link>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-sky-500/30 transition-all hover:-translate-y-0.5 hover:bg-sky-400 disabled:opacity-70 disabled:pointer-events-none"
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {isSubmitting ? 'Guardando...' : (isEdit ? 'Actualizar Producto' : 'Crear Producto')}
        </Button>
      </div>
    </form>
  )
}