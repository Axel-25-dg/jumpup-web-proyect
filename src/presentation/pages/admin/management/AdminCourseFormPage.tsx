import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Save,
  Loader2,
  BookOpen,
  Layers,
  Globe,
  FileText,
  ImageIcon
} from 'lucide-react'
import { Button } from '@/presentation/components/ui/button'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { manageCoursesUseCase } from '@/infrastructure/factories/course.factory'
import type { DifficultyLevel, Language } from '@/domain/entities/course.entity'

const difficultyLevels: DifficultyLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']

const formSchema = z.object({
  title: z.string().min(3, 'Mínimo 3 caracteres').max(200, 'Máximo 200 caracteres'),
  description: z.string().optional(),
  language: z.coerce.number().min(1, 'Selecciona un idioma'),
  difficulty_level: z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']),
  image: z.any().optional(),
})

type FormData = z.infer<typeof formSchema>

export default function AdminCourseFormPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEditing = Boolean(id)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [languages, setLanguages] = useState<Language[]>([])

  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<FormData>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      title: '',
      description: '',
      language: 0 as any,
      difficulty_level: 'A1',
    }
  })

  const selectedDifficulty = watch('difficulty_level')
  const selectedImage = watch('image')

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const loadedLanguages = await manageCoursesUseCase.getLanguages()
        setLanguages(loadedLanguages)

        if (id) {
          const course = await manageCoursesUseCase.getById(Number(id))
          reset({
            title: course.title,
            description: course.description || '',
            language: course.language,
            difficulty_level: course.difficulty_level,
          })
        }
      } catch (err) {
        console.error(err)
        toast.error('Error al cargar datos del curso')
      } finally {
        setLoading(false)
      }
    }
    void loadData()
  }, [id, reset])

  const onSubmit = async (data: FormData) => {
    try {
      setSaving(true)
      const payload = {
        ...data,
        description: data.description || '',
        image: data.image instanceof FileList ? data.image[0] : data.image
      } as any

      if (id) {
        await manageCoursesUseCase.update(Number(id), payload)
        toast.success('Curso actualizado con éxito')
      } else {
        await manageCoursesUseCase.create(payload)
        toast.success('Curso creado con éxito')
      }
      navigate('/admin/management/courses')
    } catch (err) {
      console.error(err)
      toast.error('Error al guardar el curso')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
        <p className="label-caps text-slate-400">Sincronizando Malla Curricular...</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit as any)} className="animate-in fade-in duration-500 pb-20">
      {/* HERO SECTION */}
      <section className="border-b border-slate-900/10 dark:border-white/10 px-8 md:px-12 py-14 md:py-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Button type="button" variant="ghost" size="icon" asChild className="-ml-2 rounded-none hover:bg-slate-100 dark:hover:bg-white/5">
                <Link to="/admin/management/courses"><ArrowLeft className="h-4 w-4" /></Link>
              </Button>
              <div className="chip">
                <BookOpen className="h-3.5 w-3.5 text-sky-500" />
                Catálogo Académico
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white uppercase">
              {isEditing ? 'Editar' : 'Nuevo'} <span className="text-sky-500">Curso</span>.
            </h1>
            <p className="text-base text-slate-500 dark:text-slate-400 max-w-lg font-medium">
              Configuración de la información académica, niveles MCER y recursos del programa.
            </p>
          </div>
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/admin/management/courses')}
              className="rounded-none border-slate-900/10 dark:border-white/10 font-bold uppercase text-[11px] tracking-[0.2em] px-8 py-6 h-auto hover:bg-slate-50 dark:hover:bg-white/5 transition-all"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="rounded-none bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold uppercase text-[11px] tracking-[0.2em] px-8 py-6 h-auto hover:bg-sky-500 dark:hover:bg-sky-500 hover:text-white transition-all shadow-none"
            >
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {isEditing ? 'Actualizar Programa' : 'Crear Curso'}
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
                <h2 className="label-caps text-slate-900 dark:text-white font-black">Estructura del Curso</h2>
              </div>

              <div className="space-y-2">
                <label className="label-caps text-slate-400 text-[10px]">Título del Programa <span className="text-sky-500">*</span></label>
                <input
                  {...register('title')}
                  placeholder="EJ. INGLÉS TÉCNICO PARA INGENIERÍA"
                  className={`w-full border ${errors.title ? 'border-rose-500' : 'border-slate-900/10 dark:border-white/10'} bg-transparent py-4 px-4 text-[12px] font-bold uppercase tracking-widest outline-none focus:border-sky-500 transition-colors`}
                />
                {errors.title && <p className="text-[10px] text-rose-500 font-mono mt-1">{errors.title.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="label-caps text-slate-400 text-[10px]">Descripción Detallada</label>
                <div className="relative">
                   <FileText className="absolute left-4 top-4 h-4 w-4 text-slate-300" />
                   <textarea
                    {...register('description')}
                    placeholder="DESCRIBE LOS OBJETIVOS Y COMPETENCIAS A DESARROLLAR..."
                    className={`w-full min-h-32 border ${errors.description ? 'border-rose-500' : 'border-slate-900/10 dark:border-white/10'} bg-transparent py-4 pl-12 pr-4 text-[12px] font-medium uppercase tracking-wider outline-none focus:border-sky-500 transition-colors resize-none`}
                  />
                </div>
                {errors.description && <p className="text-[10px] text-rose-500 font-mono mt-1">{errors.description.message}</p>}
              </div>
            </div>

            {/* Assets Group */}
            <div className="space-y-8">
              <div className="flex items-center gap-3 border-b border-slate-900/10 dark:border-white/10 pb-4">
                <ImageIcon className="h-5 w-5 text-sky-500" />
                <h2 className="label-caps text-slate-900 dark:text-white font-black">Recursos Visuales</h2>
              </div>
              <div className="space-y-2">
                <label className="label-caps text-slate-400 text-[10px]">Imagen de Portada (JPEG, PNG, WEBP)</label>
                <div className="relative group">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) => setValue('image', e.target.files)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="border border-dashed border-slate-900/20 dark:border-white/10 py-10 px-4 text-center group-hover:border-sky-500 transition-colors">
                    <p className="label-caps text-slate-400 text-[10px]">
                      {selectedImage && selectedImage.length > 0 ? selectedImage[0].name.toUpperCase() : 'SELECCIONAR ARCHIVO O ARRASTRAR AQUÍ'}
                    </p>
                    <p className="label-micro text-slate-300 mt-2 font-mono">MÁXIMO 2.0 MB POR ARCHIVO</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar / Settings */}
          <div className="space-y-8">
            <div className="p-8 border border-slate-900/10 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02]">
              <h3 className="label-caps text-slate-900 dark:text-white font-black mb-6">Parámetros Técnicos</h3>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="label-caps text-slate-400 text-[10px]">Idioma de Instrucción</label>
                  <div className="relative">
                    <select
                      {...register('language')}
                      className={`w-full appearance-none border ${errors.language ? 'border-rose-500' : 'border-slate-900/10 dark:border-white/10'} bg-white dark:bg-[#0a0a0b] py-4 px-4 text-[11px] font-bold uppercase tracking-widest outline-none focus:border-sky-500 transition-colors`}
                    >
                      <option value="0" disabled>SELECCIONAR IDIOMA...</option>
                      {languages.map(l => (
                        <option key={l.id} value={l.id}>{l.name.toUpperCase()} ({l.code.toUpperCase()})</option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none border-l border-slate-900/10 dark:border-white/10 pl-3">
                      <Globe className="h-4 w-4 text-slate-300" />
                    </div>
                  </div>
                  {errors.language && <p className="text-[10px] text-rose-500 font-mono mt-1">{errors.language.message}</p>}
                </div>

                <div className="space-y-2">
                  <label className="label-caps text-slate-400 text-[10px]">Nivel de Dificultad (MCER)</label>
                  <div className="grid grid-cols-3 gap-px bg-slate-900/10 dark:bg-white/10 border border-slate-900/10 dark:border-white/10">
                    {difficultyLevels.map((level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setValue('difficulty_level', level)}
                        className={`py-3 text-[11px] font-mono transition-colors ${
                          selectedDifficulty === level
                            ? 'bg-sky-500 text-white'
                            : 'bg-white dark:bg-[#0a0a0b] text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5'
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                  <input type="hidden" {...register('difficulty_level')} />
                  {errors.difficulty_level && <p className="text-[10px] text-rose-500 font-mono mt-1">{errors.difficulty_level.message}</p>}
                </div>
              </div>
            </div>

            <div className="p-8 border border-slate-900/10 dark:border-white/10 border-dashed">
              <p className="label-micro text-slate-400 leading-relaxed font-mono">
                LOS CAMBIOS EN LA MALLA CURRICULAR AFECTAN A TODAS LAS AULAS VINCULADAS.
                ASEGÚRESE DE QUE EL CONTENIDO CUMPLE CON LOS ESTÁNDARES MCER.
              </p>
            </div>
          </div>
        </div>
      </div>
    </form>
  )
}
