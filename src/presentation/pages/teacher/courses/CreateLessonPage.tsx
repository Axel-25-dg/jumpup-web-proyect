import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  ArrowLeft,
  Save,
  Video,
  FileText,
  Loader2
} from 'lucide-react'
import { Card, CardContent } from '@/presentation/components/ui/card'
import { Button } from '@/presentation/components/ui/button'
import { Input } from '@/presentation/components/ui/input'
import { Textarea } from '@/presentation/components/ui/textarea'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { courseRepo } from '@/infrastructure/factories/teacher.factory'
import type { Module } from '@/domain/entities/course.entity'

const formSchema = z.object({
  module: z.coerce.number().min(1, 'Selecciona un módulo'),
  title: z.string().min(3, 'El título debe tener al menos 3 caracteres'),
  content_type: z.enum(['video', 'text', 'interactive', 'audio']),
  content: z.string().optional(),
  video_url: z.string().url('URL inválida').optional().or(z.literal('')),
  order: z.coerce.number().min(1, 'El orden debe ser al menos 1').optional(),
  xp_reward: z.coerce.number().min(0, 'Mínimo 0 XP').optional(),
})

type LessonFormData = z.infer<typeof formSchema>

export default function CreateLessonPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const preselectedModule = searchParams.get('module')

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [modules, setModules] = useState<Module[]>([])
  const [isLoadingModules, setIsLoadingModules] = useState(true)

  const { register, handleSubmit, watch, formState: { errors } } = useForm<any>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      module: preselectedModule ? Number(preselectedModule) : undefined,
      title: '',
      content_type: 'text',
      content: '',
      video_url: '',
      order: 1,
      xp_reward: 10,
    }
  })

  const contentType = watch('content_type')

  useEffect(() => {
    const loadModules = async () => {
      try {
        // Get all courses first, then get modules — or fetch all modules
        // Use a broad query to get all modules available to the teacher
        const result = await courseRepo.getAll()
        const allModules: Module[] = []
        for (const course of (result.results || [])) {
          try {
            const mods = await courseRepo.getModulesByCourse(course.id)
            allModules.push(...mods)
          } catch { /* skip */ }
        }
        setModules(allModules)
      } catch {
        toast.error('No se pudieron cargar los módulos')
      } finally {
        setIsLoadingModules(false)
      }
    }
    loadModules()
  }, [])

  const onSubmit = async (data: LessonFormData) => {
    setIsSubmitting(true)
    try {
      await courseRepo.createLesson({
        module: data.module,
        title: data.title,
        content_type: data.content_type,
        content: data.content || undefined,
        video_url: data.video_url || undefined,
        order: data.order || 1,
        xp_reward: data.xp_reward || 10,
      })
      toast.success(`Lección "${data.title}" creada con éxito`)
      navigate('/teacher/courses')
    } catch (error: any) {
      console.error('Error creating lesson:', error)
      toast.error(error?.detail || 'Error al crear la lección')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 animate-in fade-in duration-700 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild className="rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">
            <Link to="/teacher/courses"><ArrowLeft className="h-5 w-5" /></Link>
          </Button>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Nueva Lección</h1>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-1">Crea el contenido de tu clase</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            className="h-12 rounded-xl font-bold dark:border-slate-700"
            onClick={() => navigate('/teacher/courses')}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || isLoadingModules}
            className="h-12 rounded-xl font-black bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-500/20 px-6"
          >
            {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
            Publicar Lección
          </Button>
        </div>
      </div>

      <div className="grid gap-8">
        <Card className="border-none shadow-2xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden">
          <CardContent className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-black text-slate-900 dark:text-white">
                  Módulo Asociado <span className="text-red-500">*</span>
                </label>
                {isLoadingModules ? (
                  <div className="h-14 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 animate-pulse" />
                ) : (
                  <select
                    {...register('module')}
                    className={`w-full h-14 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 px-4 font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errors.module ? 'border-red-500' : ''}`}
                  >
                    <option value="">Selecciona un módulo...</option>
                    {modules.map(m => (
                      <option key={m.id} value={m.id}>{m.course_title} — {m.title}</option>
                    ))}
                  </select>
                )}
                {errors.module && <span className="text-red-500 text-xs font-bold">{errors.module.message as string}</span>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-black text-slate-900 dark:text-white">Tipo de Contenido</label>
                <select
                  {...register('content_type')}
                  className="w-full h-14 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 px-4 font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="text">Texto</option>
                  <option value="video">Video</option>
                  <option value="interactive">Interactivo</option>
                  <option value="audio">Audio</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-black text-slate-900 dark:text-white">
                  Título de la Lección <span className="text-red-500">*</span>
                </label>
                <Input
                  {...register('title')}
                  placeholder="Ej. Saludos y despedidas"
                  className={`h-14 rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 font-medium text-lg ${errors.title ? 'border-red-500' : ''}`}
                />
                {errors.title && <span className="text-red-500 text-xs font-bold">{errors.title.message as string}</span>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-black text-slate-900 dark:text-white">Orden de Lección</label>
                <Input
                  {...register('order')}
                  type="number"
                  min={1}
                  placeholder="Ej. 1"
                  className="h-14 rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 font-medium"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-black text-slate-900 dark:text-white">Recompensa XP</label>
                <Input
                  {...register('xp_reward')}
                  type="number"
                  min={0}
                  placeholder="Ej. 10"
                  className="h-14 rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 font-medium"
                />
              </div>
            </div>

            {(contentType === 'video' || contentType === 'audio') && (
              <div className="space-y-2 pt-2">
                <label className="text-sm font-black text-slate-900 dark:text-white">
                  {contentType === 'video' ? 'URL del Video' : 'URL del Audio'} (Opcional)
                </label>
                <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl p-8 text-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group">
                  <div className="h-16 w-16 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <Video className="h-8 w-8" />
                  </div>
                  <Input
                    {...register('video_url')}
                    type="url"
                    placeholder="https://youtube.com/watch?v=..."
                    className="max-w-md mx-auto h-12 rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 font-medium"
                  />
                  {errors.video_url && <span className="text-red-500 text-xs font-bold block mt-2">{errors.video_url.message as string}</span>}
                  <p className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-wider">MP4, WebM o enlace a YouTube/Vimeo</p>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-black text-slate-900 dark:text-white">Contenido en Texto</label>
              <div className="relative">
                <FileText className="absolute left-4 top-4 h-5 w-5 text-slate-400" />
                <Textarea
                  {...register('content')}
                  placeholder="Escribe el contenido detallado de tu lección aquí..."
                  className="min-h-[200px] rounded-2xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 font-medium p-4 pl-12 resize-none"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </form>
  )
}


