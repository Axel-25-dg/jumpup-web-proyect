import { useState, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Save,
  Loader2,
  FileText,
  Globe,
  Upload,
} from 'lucide-react'
import { Card, CardContent } from '@/presentation/components/ui/card'
import { Button } from '@/presentation/components/ui/button'
import { Input } from '@/presentation/components/ui/input'
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
  description: z.string().optional(),
  course: z.coerce.number().min(1, 'El curso es obligatorio'),
  lesson: z.coerce.number().optional(),
  resource_type: z.enum(['pdf', 'audio', 'video', 'word', 'image', 'link', 'other']),
  content_type: z.enum(['file', 'url', 'video']),
  file_url: z.string().optional().or(z.literal('')),
  external_url: z.string().optional().or(z.literal('')),
  is_public: z.boolean().optional(),
})

type FormData = z.infer<typeof formSchema>

const RESOURCE_TYPE_OPTIONS = [
  { value: 'pdf', label: 'PDF' },
  { value: 'audio', label: 'Audio' },
  { value: 'video', label: 'Video' },
  { value: 'word', label: 'Documento Word' },
  { value: 'image', label: 'Imagen' },
  { value: 'link', label: 'Enlace externo' },
  { value: 'other', label: 'Otro' },
]

const CONTENT_TYPE_OPTIONS = [
  { value: 'file', label: 'Archivo' },
  { value: 'url', label: 'URL externa' },
  { value: 'video', label: 'Video embebido' },
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

  // Load courses on mount
  useEffect(() => {
    const loadCourses = async () => {
      try {
        const result = await getCoursesUseCase.execute()
        setCourses(result.results || [])
      } catch { /* non-critical */ }
    }
    loadCourses()
  }, [])

  // Load modules when course changes
  useEffect(() => {
    if (selectedCourse) {
      courseRepo.getModulesByCourse(Number(selectedCourse))
        .then(mods => {
          setModules(mods || [])
          setLessons([])
          setValue('lesson', '')
        })
        .catch(() => setModules([]))
    } else {
      setModules([])
      setLessons([])
    }
  }, [selectedCourse, setValue])

  // Load existing resource if editing
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
            // Load lessons for the selected course
            try {
              const mods = await courseRepo.getModulesByCourse(Number(resource.course))
              setModules(mods || [])
              // Find lesson's module and load its lessons
              for (const mod of (mods || [])) {
                const less = await courseRepo.getLessonsByModule(mod.id)
                if (less.some(l => l.id === resource.lesson)) {
                  setLessons(less)
                  break
                }
              }
            } catch { /* */ }
          }
        } catch (error) {
          toast.error('Error al cargar el recurso')
        } finally {
          setIsLoading(false)
        }
      })()
    }
  }, [id, isEdit, reset])

  const handleCourseChange = async (courseId: string) => {
    setValue('course', courseId)
    setValue('lesson', '')
    if (courseId) {
      try {
        const mods = await courseRepo.getModulesByCourse(Number(courseId))
        setModules(mods || [])
      } catch {
        setModules([])
      }
    }
  }

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
        if (data.lesson) payload.lesson = Number(data.lesson)

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
      const errorMsg = error?.detail || error?.message || 'Error al guardar el recurso'
      toast.error(errorMsg)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-6 max-w-3xl mx-auto w-full">
      <div className="flex items-center gap-4 mb-8">
        <Link
          to="/admin/resources"
          className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">
            {isEdit ? 'Editar Recurso' : 'Nuevo Recurso'}
          </h1>
          <p className="text-slate-500 mt-1">
            {isEdit ? 'Modifica los datos del recurso' : 'Crea un nuevo recurso educativo'}
          </p>
        </div>
      </div>

      <Card className="border-none shadow-2xl shadow-slate-200/50 bg-white rounded-[2.5rem] overflow-hidden">
        <CardContent className="p-8 space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <label className="text-sm font-black text-slate-900 flex items-center gap-2">
              <FileText className="h-4 w-4 text-slate-400" /> Título del Recurso
            </label>
            <Input
              {...register('title')}
              placeholder="Ej. Guía de gramática básica"
              className={`h-14 rounded-xl border-slate-200 bg-slate-50 font-medium text-lg ${errors.title ? 'border-red-500' : ''}`}
            />
            {errors.title && <span className="text-red-500 text-xs font-bold">{errors.title.message as string}</span>}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-black text-slate-900">Descripción</label>
            <textarea
              {...register('description')}
              rows={4}
              placeholder="Describe el recurso..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 transition-colors focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 placeholder:text-slate-400 resize-none"
            />
          </div>

          {/* Course */}
          <div className="space-y-2">
            <label className="text-sm font-black text-slate-900">Curso (obligatorio)</label>
            <select
              value={selectedCourse || ''}
              onChange={(e) => handleCourseChange(e.target.value)}
              className={`w-full h-14 rounded-xl border border-slate-200 bg-slate-50 px-4 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${errors.course ? 'border-red-500' : ''}`}
            >
              <option value="">Selecciona un curso...</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
            {errors.course && <span className="text-red-500 text-xs font-bold">{errors.course.message as string}</span>}
          </div>

          {/* Module & Lesson (conditional) */}
          {selectedCourse && modules.length > 0 && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-black text-slate-900">Módulo</label>
                <select
                  onChange={(e) => handleModuleChange(e.target.value)}
                  className="w-full h-14 rounded-xl border border-slate-200 bg-slate-50 px-4 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Sin módulo específico</option>
                  {modules.map((m) => (
                    <option key={m.id} value={m.id}>{m.title}</option>
                  ))}
                </select>
              </div>

              {lessons.length > 0 && (
                <div className="space-y-2">
                  <label className="text-sm font-black text-slate-900">Lección (opcional)</label>
                  <select
                    {...register('lesson')}
                    className="w-full h-14 rounded-xl border border-slate-200 bg-slate-50 px-4 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">Sin lección específica</option>
                    {lessons.map((l) => (
                      <option key={l.id} value={l.id}>{l.title}</option>
                    ))}
                  </select>
                </div>
              )}
            </>
          )}

          {/* Resource Type & Content Type */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-black text-slate-900">Tipo de Recurso</label>
              <select
                {...register('resource_type')}
                className="w-full h-14 rounded-xl border border-slate-200 bg-slate-50 px-4 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {RESOURCE_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-black text-slate-900">Tipo de Contenido</label>
              <select
                {...register('content_type')}
                className="w-full h-14 rounded-xl border border-slate-200 bg-slate-50 px-4 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {CONTENT_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* File upload */}
          <div className="space-y-2">
            <label className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Upload className="h-4 w-4 text-slate-400" /> Archivo (opcional)
            </label>
            <input
              type="file"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              className="w-full h-14 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
            />
          </div>

          {/* URL fields based on content type */}
          {(contentType === 'file' || contentType === 'video') && (
            <div className="space-y-2">
              <label className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Globe className="h-4 w-4 text-slate-400" /> URL del Archivo
              </label>
              <Input
                {...register('file_url')}
                placeholder="https://ejemplo.com/archivo.pdf"
                className="h-14 rounded-xl border-slate-200 bg-slate-50 font-medium"
              />
            </div>
          )}

          {contentType === 'url' && (
            <div className="space-y-2">
              <label className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Globe className="h-4 w-4 text-slate-400" /> URL Externa
              </label>
              <Input
                {...register('external_url')}
                placeholder="https://ejemplo.com/recurso"
                className="h-14 rounded-xl border-slate-200 bg-slate-50 font-medium"
              />
            </div>
          )}

          {/* Toggle */}
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                {...register('is_public')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
            <div>
              <span className="text-sm font-bold text-slate-900">Público</span>
              <p className="text-xs text-slate-500 font-medium">Visible para todos los estudiantes</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action buttons */}
      <div className="mt-8 flex justify-end gap-3">
        <Link
          to="/admin/resources"
          className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-50"
        >
          Cancelar
        </Link>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/30 transition-all hover:-translate-y-0.5 hover:bg-emerald-400 disabled:opacity-70 disabled:pointer-events-none"
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {isSubmitting ? 'Guardando...' : (isEdit ? 'Actualizar Recurso' : 'Crear Recurso')}
        </Button>
      </div>
    </form>
  )
}