import { useState, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Save,
  Loader2,
  FileText,
  Globe,
  Layers,
  Link as LinkIcon
} from 'lucide-react'
import { Button } from '@/presentation/components/ui/button'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { adminResourceUseCase } from '@/infrastructure/factories/admin-resource.factory'
import { getCoursesUseCase } from '@/infrastructure/factories/course.factory'
import { courseRepo } from '@/infrastructure/factories/teacher.factory'
import type { CreateAdminResourceDto } from '@/application/dtos/admin-resource.dto'
import type { Course, Module, Lesson } from '@/domain/entities/course.entity'

const formSchema = z.object({
  title: z.string().min(3, 'Mínimo 3 caracteres').max(200, 'Máximo 200 caracteres'),
  description: z.string().optional().or(z.literal('')),
  course: z.coerce.number().min(1, 'El curso es obligatorio'),
  lesson: z.coerce.number().optional().or(z.literal(0)),
  resource_type: z.enum(['pdf', 'audio', 'video', 'word', 'image', 'link', 'other']),
  content_type: z.enum(['file', 'url', 'video']),
  file_url: z.string().optional().or(z.literal('')),
  external_url: z.string().optional().or(z.literal('')),
  is_public: z.boolean().optional(),
})

type FormData = z.infer<typeof formSchema>

const RESOURCE_TYPE_OPTIONS = [
  { value: 'pdf', label: 'PDF / DOCUMENTO' },
  { value: 'audio', label: 'AUDIO / MP3' },
  { value: 'video', label: 'VIDEO / MP4' },
  { value: 'word', label: 'DOC / EDITABLE' },
  { value: 'image', label: 'IMAGEN / GRÁFICO' },
  { value: 'link', label: 'VÍNCULO / URL' },
  { value: 'other', label: 'OTROS / VARIOS' },
]

const CONTENT_TYPE_OPTIONS = [
  { value: 'file', label: 'ARCHIVO LOCAL' },
  { value: 'url', label: 'URL EXTERNA' },
  { value: 'video', label: 'STREAMING / EMBED' },
]

export default function AdminResourceFormPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(isEdit)
  const [courses, setCourses] = useState<Course[]>([])
  const [modules, setModules] = useState<Module[]>([])
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const { register, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm<any>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      course: '',
      lesson: '',
      resource_type: 'pdf',
      content_type: 'file',
      file_url: '',
      external_url: '',
      is_public: true,
    }
  })

  const contentType = watch('content_type')
  const selectedCourse = watch('course')

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const result = await getCoursesUseCase.execute()
        setCourses(result.results || [])
      } catch { /* non-critical */ }
    }
    loadCourses()
  }, [])

  useEffect(() => {
    if (selectedCourse) {
      courseRepo.getModulesByCourse(Number(selectedCourse))
        .then(mods => {
          setModules(mods || [])
          setLessons([])
          // No reset lesson here if we are loading initial data
        })
        .catch(() => setModules([]))
    }
  }, [selectedCourse])

  useEffect(() => {
    if (isEdit && id) {
      (async () => {
        try {
          const resource = await adminResourceUseCase.getById(Number(id))
          reset({
            title: resource.title,
            description: resource.description || '',
            course: resource.course || '',
            lesson: resource.lesson || '',
            resource_type: resource.resource_type,
            content_type: resource.content_type,
            file_url: resource.file_url || '',
            external_url: resource.external_url || '',
            is_public: resource.is_public,
          })
          if (resource.lesson) {
             const mods = await courseRepo.getModulesByCourse(Number(resource.course))
             setModules(mods || [])
             for (const mod of (mods || [])) {
                const less = await courseRepo.getLessonsByModule(mod.id)
                if (less.some(l => l.id === resource.lesson)) {
                  setLessons(less)
                  break
                }
             }
          }
        } catch {
          toast.error('Error al cargar el recurso')
        } finally {
          setIsLoading(false)
        }
      })()
    }
  }, [id, isEdit, reset])

  const handleModuleChange = async (moduleId: string) => {
    setValue('lesson', '')
    if (moduleId) {
      try {
        const less = await courseRepo.getLessonsByModule(Number(moduleId))
        setLessons(less)
      } catch {
        setLessons([])
      }
    } else {
      setLessons([])
    }
  }

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true)
    try {
      const hasFile = selectedFile instanceof File

      if (hasFile) {
        const fd = new FormData()
        fd.append('title', data.title)
        fd.append('description', data.description || '')
        fd.append('course', String(data.course))
        fd.append('resource_type', data.resource_type)
        fd.append('content_type', data.content_type)
        fd.append('is_public', data.is_public ? 'true' : 'false')
        if (data.lesson) fd.append('lesson', String(data.lesson))
        if (data.file_url) fd.append('file_url', data.file_url)
        if (data.external_url) fd.append('external_url', data.external_url)
        fd.append('file', selectedFile)

        if (isEdit && id) {
          await adminResourceUseCase.updateWithFormData(Number(id), fd)
        } else {
          await adminResourceUseCase.createWithFormData(fd)
        }
      } else {
        const payload: CreateAdminResourceDto = {
          title: data.title,
          description: data.description || '',
          course: Number(data.course),
          resource_type: data.resource_type,
          content_type: data.content_type,
          file_url: data.file_url || null,
          external_url: data.external_url || null,
          is_public: data.is_public,
        }
        if (data.lesson && data.lesson !== 0) payload.lesson = Number(data.lesson)

        if (isEdit && id) {
          await adminResourceUseCase.update(Number(id), payload)
        } else {
          await adminResourceUseCase.create(payload)
        }
      }

      toast.success(isEdit ? 'Recurso actualizado con éxito' : 'Recurso creado con éxito')
      navigate('/admin/resources')
    } catch (error: any) {
      console.error('Error saving resource:', error)
      toast.error(error?.message || 'Error al guardar el recurso')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
        <p className="label-caps text-slate-400">Sincronizando Activo Digital...</p>
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
                <Link to="/admin/resources"><ArrowLeft className="h-4 w-4" /></Link>
              </Button>
              <div className="chip">
                <FileText className="h-3.5 w-3.5 text-sky-500" />
                Biblioteca Técnica
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white uppercase">
              {isEdit ? 'Editar' : 'Nuevo'} <span className="text-sky-500">Recurso</span>.
            </h1>
            <p className="text-base text-slate-500 dark:text-slate-400 max-w-lg font-medium">
              Administración de activos digitales, materiales de apoyo y enlaces de referencia.
            </p>
          </div>
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/admin/resources')}
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
              {isEdit ? 'Actualizar Registro' : 'Crear Recurso'}
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
                <h2 className="label-caps text-slate-900 dark:text-white font-black">Información del Recurso</h2>
              </div>

              <div className="space-y-2">
                <label className="label-caps text-slate-400 text-[10px]">Título del Recurso <span className="text-sky-500">*</span></label>
                <input
                  {...register('title')}
                  placeholder="EJ. GUÍA DE GRAMÁTICA BÁSICA"
                  className={`w-full border ${errors.title ? 'border-rose-500' : 'border-slate-900/10 dark:border-white/10'} bg-transparent py-4 px-4 text-[12px] font-bold uppercase tracking-widest outline-none focus:border-sky-500 transition-colors`}
                />
                {errors.title && <p className="text-[10px] text-rose-500 font-mono mt-1">{String(errors.title.message)}</p>}
              </div>

              <div className="space-y-2">
                <label className="label-caps text-slate-400 text-[10px]">Descripción / Metadatos</label>
                <textarea
                  {...register('description')}
                  placeholder="BREVE RESUMEN DEL CONTENIDO DEL RECURSO..."
                  className={`w-full min-h-32 border ${errors.description ? 'border-rose-500' : 'border-slate-900/10 dark:border-white/10'} bg-transparent py-4 px-4 text-[12px] font-medium uppercase tracking-wider outline-none focus:border-sky-500 transition-colors resize-none`}
                />
              </div>
            </div>

            {/* Asset Configuration */}
            <div className="space-y-8">
              <div className="flex items-center gap-3 border-b border-slate-900/10 dark:border-white/10 pb-4">
                <LinkIcon className="h-5 w-5 text-sky-500" />
                <h2 className="label-caps text-slate-900 dark:text-white font-black">Configuración de Archivo</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="label-caps text-slate-400 text-[10px]">Tipo de Activo</label>
                  <select
                    {...register('resource_type')}
                    className="w-full appearance-none border border-slate-900/10 dark:border-white/10 bg-white dark:bg-[#0a0a0b] py-4 px-4 text-[11px] font-bold uppercase tracking-widest outline-none focus:border-sky-500 transition-colors"
                  >
                    {RESOURCE_TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="label-caps text-slate-400 text-[10px]">Modo de Entrega</label>
                  <select
                    {...register('content_type')}
                    className="w-full appearance-none border border-slate-900/10 dark:border-white/10 bg-white dark:bg-[#0a0a0b] py-4 px-4 text-[11px] font-bold uppercase tracking-widest outline-none focus:border-sky-500 transition-colors"
                  >
                    {CONTENT_TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-6">
                 {/* File Upload */}
                <div className="space-y-2">
                  <label className="label-caps text-slate-400 text-[10px]">Cargar Archivo Local</label>
                  <div className="relative group">
                    <input
                      type="file"
                      onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="border border-dashed border-slate-900/20 dark:border-white/10 py-10 px-4 text-center group-hover:border-sky-500 transition-colors">
                      <p className="label-caps text-slate-400 text-[10px]">
                        {selectedFile ? selectedFile.name.toUpperCase() : 'SELECCIONAR ARCHIVO O ARRASTRAR AQUÍ'}
                      </p>
                      <p className="label-micro text-slate-300 mt-2 font-mono">EL ARCHIVO REEMPLAZARÁ AL ACTUAL SI EXISTE</p>
                    </div>
                  </div>
                </div>

                {/* URL inputs */}
                {(contentType === 'file' || contentType === 'video') && (
                  <div className="space-y-2">
                    <label className="label-caps text-slate-400 text-[10px]">URL de Almacenamiento (CDN/S3)</label>
                    <div className="relative">
                      <Globe className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                      <input
                        {...register('file_url')}
                        placeholder="HTTPS://STORAGE.JUMPUP.COM/..."
                        className="w-full border border-slate-900/10 dark:border-white/10 bg-transparent py-4 pl-12 pr-4 text-[12px] font-mono outline-none focus:border-sky-500 transition-colors"
                      />
                    </div>
                  </div>
                )}

                {contentType === 'url' && (
                  <div className="space-y-2">
                    <label className="label-caps text-slate-400 text-[10px]">URL de Referencia Externa</label>
                    <div className="relative">
                      <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                      <input
                        {...register('external_url')}
                        placeholder="HTTPS://EJEMPLO.COM/RECURSO"
                        className="w-full border border-slate-900/10 dark:border-white/10 bg-transparent py-4 pl-12 pr-4 text-[12px] font-mono outline-none focus:border-sky-500 transition-colors"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar / Settings */}
          <div className="space-y-8">
            <div className="p-8 border border-slate-900/10 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02]">
              <h3 className="label-caps text-slate-900 dark:text-white font-black mb-6">Ubicación Curricular</h3>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="label-caps text-slate-400 text-[10px]">Curso Principal <span className="text-sky-500">*</span></label>
                  <select
                    {...register('course')}
                    className={`w-full appearance-none border ${errors.course ? 'border-rose-500' : 'border-slate-900/10 dark:border-white/10'} bg-white dark:bg-[#0a0a0b] py-4 px-4 text-[11px] font-bold uppercase tracking-widest outline-none focus:border-sky-500 transition-colors`}
                  >
                    <option value="">SELECCIONAR CURSO...</option>
                    {courses.map(c => <option key={c.id} value={c.id}>{c.title.toUpperCase()}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="label-caps text-slate-400 text-[10px]">Módulo de Referencia</label>
                  <select
                    onChange={(e) => handleModuleChange(e.target.value)}
                    className="w-full appearance-none border border-slate-900/10 dark:border-white/10 bg-white dark:bg-[#0a0a0b] py-4 px-4 text-[11px] font-bold uppercase tracking-widest outline-none focus:border-sky-500 transition-colors"
                  >
                    <option value="">MÓDULO GLOBAL / SIN ASIGNAR</option>
                    {modules.map(m => <option key={m.id} value={m.id}>{m.title.toUpperCase()}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="label-caps text-slate-400 text-[10px]">Lección Específica</label>
                  <select
                    {...register('lesson')}
                    className="w-full appearance-none border border-slate-900/10 dark:border-white/10 bg-white dark:bg-[#0a0a0b] py-4 px-4 text-[11px] font-bold uppercase tracking-widest outline-none focus:border-sky-500 transition-colors"
                  >
                    <option value="0">TODA EL ÁREA / GENERAL</option>
                    {lessons.map(l => <option key={l.id} value={l.id}>{l.title.toUpperCase()}</option>)}
                  </select>
                </div>

                <div className="pt-4 border-t border-slate-900/10 dark:border-white/10">
                  <label className="flex items-center justify-between cursor-pointer group">
                    <span className="label-caps text-slate-600 dark:text-slate-400 text-[10px] font-bold">Visibilidad Pública</span>
                    <div className="relative inline-flex items-center">
                      <input
                        type="checkbox"
                        {...register('is_public')}
                        className="sr-only peer"
                      />
                      <div className="w-12 h-6 bg-slate-200 dark:bg-white/5 rounded-none border border-slate-900/10 dark:border-white/10 peer-checked:bg-sky-500 peer-checked:border-sky-500 transition-all after:content-[''] after:absolute after:top-1 after:left-1 after:bg-slate-400 dark:after:bg-slate-600 peer-checked:after:bg-white after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-6"></div>
                    </div>
                  </label>
                  <p className="label-micro text-slate-400 mt-3 font-mono">
                    SI ES PÚBLICO, CUALQUIER ESTUDIANTE DEL CURSO PODRÁ DESCARGARLO.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-8 border border-slate-900/10 dark:border-white/10 border-dashed">
              <p className="label-micro text-slate-400 leading-relaxed font-mono uppercase">
                Asegúrese de que el archivo no supere los 50MB. Los enlaces externos deben comenzar con HTTPS:// para integridad de seguridad.
              </p>
            </div>
          </div>
        </div>
      </div>
    </form>
  )
}
