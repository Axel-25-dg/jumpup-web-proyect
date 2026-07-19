import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Save,
  Loader2,
  BookOpen,
  AlertCircle,
  Plus,
  Trash2,
  BarChart,
  Image as ImageIcon
} from 'lucide-react'
import { Button } from '@/presentation/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/presentation/components/ui/alert-dialog'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { courseRepo } from '@/infrastructure/factories/teacher.factory'
import type { Course, Module } from '@/domain/entities/course.entity'

const courseSchema = z.object({
  title: z.string().min(5, 'El título debe tener al menos 5 caracteres'),
  description: z.string().min(20, 'La descripción debe tener al menos 20 caracteres'),
  difficulty_level: z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']),
  is_active: z.boolean(),
})

type CourseFormData = z.infer<typeof courseSchema>

export default function EditCoursePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const courseId = Number(id)

  const [course, setCourse] = useState<Course | null>(null)
  const [modules, setModules] = useState<Module[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [, setExpandedModules] = useState<Set<number>>(new Set())
  const [moduleToDelete, setModuleToDelete] = useState<Module | null>(null)
  const [isDeletingModule, setIsDeletingModule] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CourseFormData>({
    resolver: zodResolver(courseSchema),
  })

  useEffect(() => {
    const loadData = async () => {
      if (!courseId) return
      try {
        const [courseData, moduleData] = await Promise.all([
          courseRepo.getById(courseId),
          courseRepo.getModulesByCourse(courseId),
        ])
        setCourse(courseData)
        setModules(moduleData)
        reset({
          title: courseData.title,
          description: courseData.description,
          difficulty_level: courseData.difficulty_level,
          is_active: courseData.is_active ?? false,
        })
      } catch (err: any) {
        console.error('Error loading course:', err)
        setError(err?.message || 'No se pudo cargar el curso.')
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [courseId, reset])

  const onSubmit = async (data: CourseFormData) => {
    setIsSaving(true)
    try {
      const formData = new FormData()
      formData.append('title', data.title)
      formData.append('description', data.description)
      formData.append('difficulty_level', data.difficulty_level)
      formData.append('is_active', data.is_active ? 'True' : 'False')
      formData.append('status', data.is_active ? 'published' : 'draft')
      
      if (fileInputRef.current?.files?.[0]) {
        formData.append('image', fileInputRef.current.files[0])
      }

      const updated = await courseRepo.updateCourse(courseId, formData)
      setCourse(updated)
      toast.success('Curso actualizado correctamente')
    } catch (err: any) {
      console.error('Error updating course:', err)
      toast.error(err?.detail || 'Error al actualizar el curso')
    } finally {
      setIsSaving(false)
    }
  }

  const toggleModule = (moduleId: number) => {
    setExpandedModules(prev => {
      const next = new Set(prev)
      if (next.has(moduleId)) next.delete(moduleId)
      else next.add(moduleId)
      return next
    })
  }

  const handleDeleteModule = async () => {
    if (!moduleToDelete) return
    setIsDeletingModule(true)
    try {
      await courseRepo.deleteModule(moduleToDelete.id)
      setModules(prev => prev.filter(m => m.id !== moduleToDelete.id))
      toast.success(`Módulo "${moduleToDelete.title}" eliminado`)
    } catch (err: any) {
      toast.error('Error al eliminar el módulo')
    } finally {
      setIsDeletingModule(false)
      setModuleToDelete(null)
    }
  }

  const DIFFICULTY_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const

  if (isLoading) {
    return (
      <div className="space-y-8 animate-in fade-in duration-700 max-w-4xl mx-auto">
        <div className="h-12 w-64 bg-slate-200 dark:bg-white/10 animate-pulse" />
        <div className="h-96 bg-slate-200 dark:bg-white/10 animate-pulse" />
      </div>
    )
  }

  if (error || !course) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
          <p className="text-red-500 font-bold">{error || 'Curso no encontrado'}</p>
          <Button onClick={() => navigate('/teacher/courses')}>Volver a Mis Cursos</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="animate-in fade-in duration-700">
      {/* Header */}
      <section className="border-b border-slate-900/10 dark:border-white/10 px-8 md:px-12 py-14">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-4">
             <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild className="h-10 w-10 rounded-none border border-slate-900/10 dark:border-white/10">
                  <Link to="/teacher/courses"><ArrowLeft className="h-4 w-4" /></Link>
                </Button>
                <div className="chip">
                   <BookOpen className="h-3.5 w-3.5 text-sky-500" />
                   Editor de Programa
                </div>
             </div>
             <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white uppercase truncate max-w-2xl">
               {course.title}
             </h1>
          </div>
          <div className="flex items-center gap-4">
            <span className={`label-caps px-4 py-2 border font-black tracking-widest ${
               course.is_active
               ? 'border-emerald-500/20 text-emerald-600 bg-emerald-500/5'
               : 'border-amber-500/20 text-amber-600 bg-amber-500/5'
            }`}>
               {course.is_active ? 'PUBLICADO' : 'BORRADOR'}
            </span>
            <Button
              onClick={handleSubmit(onSubmit)}
              disabled={isSaving}
              className="rounded-none bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black uppercase text-[11px] tracking-widest px-8 h-12 hover:bg-sky-500 dark:hover:bg-sky-500 hover:text-white transition-all"
            >
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Guardar Cambios
            </Button>
          </div>
        </div>
      </section>

      <div className="px-8 md:px-12 py-12 max-w-6xl">
        <div className="grid gap-px bg-slate-900/10 dark:bg-white/10 border border-slate-900/10 dark:border-white/10">
          <div className="bg-white dark:bg-[#0a0a0b] p-8 md:p-12 space-y-12">
            <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight border-b-2 border-slate-900 dark:border-white pb-4 w-fit">Información Base</h2>

            <div className="space-y-4">
              <label className="label-caps text-slate-900 dark:text-white">Título del Programa</label>
              <input
                {...register('title')}
                className={`w-full border-b bg-transparent py-4 text-2xl font-black uppercase tracking-tight outline-none transition-colors ${
                  errors.title ? 'border-rose-500 text-rose-500' : 'border-slate-900/10 dark:border-white/10 focus:border-sky-500'
                }`}
              />
              {errors.title && <p className="label-micro text-rose-500 font-bold">{String(errors.title.message)}</p>}
            </div>

            <div className="space-y-4">
              <label className="label-caps text-slate-900 dark:text-white">Descripción Técnica</label>
              <textarea
                {...register('description')}
                rows={4}
                className={`w-full border rounded-none bg-transparent p-6 text-[11px] font-bold uppercase tracking-widest outline-none transition-colors resize-none ${
                  errors.description ? 'border-rose-500' : 'border-slate-900/10 dark:border-white/10 focus:border-sky-500'
                }`}
              />
              {errors.description && <p className="label-micro text-rose-500 font-bold">{String(errors.description.message)}</p>}
            </div>

            <div className="grid md:grid-cols-2 gap-10">
              <div className="space-y-4">
                <label className="label-caps text-slate-900 dark:text-white">Nivel Académico (MCER)</label>
                <select
                  {...register('difficulty_level')}
                  className="w-full h-14 border rounded-none bg-transparent px-4 text-[11px] font-bold uppercase tracking-widest focus:outline-none focus:border-sky-500 transition-colors border-slate-900/10 dark:border-white/10"
                >
                  {DIFFICULTY_LEVELS.map(level => (
                    <option key={level} value={level} className="bg-white dark:bg-slate-900">{level}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-4">
                <label className="label-caps text-slate-900 dark:text-white">Estado de Acceso</label>
                <select
                  {...register('is_active', { setValueAs: (v) => v === 'true' })}
                  className="w-full h-14 border rounded-none bg-transparent px-4 text-[11px] font-bold uppercase tracking-widest focus:outline-none focus:border-sky-500 transition-colors border-slate-900/10 dark:border-white/10"
                >
                  <option value="true" className="bg-white dark:bg-slate-900">PUBLICADO / ACTIVO</option>
                  <option value="false" className="bg-white dark:bg-slate-900">BORRADOR / INACTIVO</option>
                </select>
              </div>
            </div>

            <div className="space-y-6 pt-4">
              <label className="label-caps text-slate-900 dark:text-white">Gestión de Portada</label>

              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/png, image/jpeg"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setSelectedFileName(e.target.files[0].name)
                  }
                }}
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-900/10 dark:border-white/10 p-12 text-center hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors cursor-pointer group"
              >
                {course.image_url && !selectedFileName ? (
                  <div className="flex flex-col md:flex-row items-center justify-center gap-10">
                    <img src={course.image_url} alt={course.title} className="h-40 w-64 object-cover border border-slate-900/10 dark:border-white/10" />
                    <div className="text-center md:text-left">
                      <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">PORTADA ACTUAL</p>
                      <p className="label-micro text-slate-400 mt-1 mb-6">REEMPLAZAR IMAGEN PARA ACTUALIZAR LA ESTÉTICA DEL CURSO.</p>
                      <span className="label-caps px-6 py-2 border border-slate-900 dark:border-white text-[10px] group-hover:bg-slate-900 group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-all">
                        CAMBIAR IMAGEN
                      </span>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="h-16 w-16 border border-slate-900/10 dark:border-white/10 flex items-center justify-center mx-auto mb-6 group-hover:bg-sky-500 group-hover:text-white transition-all">
                      <ImageIcon className="h-6 w-6" />
                    </div>
                    <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">
                      {selectedFileName ? selectedFileName : 'Sincronizar nueva portada'}
                    </h4>
                    <p className="label-micro text-slate-400 mt-2">PNG, JPG HASTA 5MB</p>
                    <div className="mt-8">
                       <span className="label-caps px-6 py-2 border border-slate-900 dark:border-white text-[10px]">
                         {selectedFileName ? 'ACTUALIZAR SELECCIÓN' : 'ELEGIR ARCHIVO'}
                       </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modules Section */}
        <div className="mt-12 bg-white dark:bg-[#0a0a0b] border border-slate-900/10 dark:border-white/10">
          <div className="p-8 md:p-10 border-b border-slate-900/10 dark:border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Estructura Curricular</h2>
              <p className="label-caps text-slate-400 mt-1 tracking-widest">{modules.length} MÓDULOS REGISTRADOS</p>
            </div>
            <Button
              asChild
              className="rounded-none bg-sky-500 hover:bg-sky-600 text-white font-black uppercase text-[10px] tracking-widest px-8 h-11"
            >
              <Link to={`/teacher/modules/new?course=${courseId}`}>
                <Plus className="mr-2 h-4 w-4" /> Añadir Módulo
              </Link>
            </Button>
          </div>

          <div>
            {modules.length === 0 ? (
              <div className="py-24 text-center border-b border-slate-900/5 dark:border-white/5">
                <BookOpen className="h-10 w-10 text-slate-100 mx-auto mb-6" />
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Sin Contenido Estructurado</h3>
                <p className="label-micro text-slate-400 mt-2 mb-8 uppercase">COMIENZA AÑADIENDO EL PRIMER MÓDULO PARA ORGANIZAR LAS LECCIONES.</p>
                <Button asChild variant="outline" className="rounded-none border-slate-900 dark:border-white font-black uppercase text-[10px] tracking-widest px-10 h-12">
                   <Link to={`/teacher/modules/new?course=${courseId}`}>CREAR MÓDULO</Link>
                </Button>
              </div>
            ) : (
              <div className="grid gap-px bg-slate-900/10 dark:bg-white/10">
                {modules.map((module) => (
                  <div key={module.id} className="bg-white dark:bg-[#0a0a0b] group">
                    <div className="p-6 md:p-8 flex items-center justify-between gap-6">
                      <button
                        onClick={() => toggleModule(module.id)}
                        className="flex items-center gap-6 flex-1 text-left min-w-0"
                      >
                        <div className="h-12 w-12 shrink-0 border border-slate-900/10 dark:border-white/10 flex items-center justify-center bg-slate-50 dark:bg-white/5 font-black text-xs text-slate-400 group-hover:bg-slate-900 group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-all">
                           {module.order.toString().padStart(2, '0')}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight group-hover:text-sky-500 transition-colors truncate">{module.title}</h4>
                          <p className="label-micro text-slate-400 mt-1 uppercase tracking-widest">Módulo Académico</p>
                        </div>
                      </button>

                      <div className="flex items-center gap-2">
                        <Button asChild variant="ghost" className="h-10 px-4 rounded-none label-micro font-black uppercase tracking-widest text-slate-400 hover:text-sky-500 transition-all">
                           <Link to={`/teacher/lessons/new?module=${module.id}`}>
                             <Plus className="mr-2 h-3.5 w-3.5" /> Lección
                           </Link>
                        </Button>
                        <Button asChild variant="ghost" className="h-10 px-4 rounded-none label-micro font-black uppercase tracking-widest text-slate-400 hover:text-sky-500 transition-all">
                           <Link to={`/teacher/modules/${module.id}/exercises`}>
                             <BarChart className="mr-2 h-3.5 w-3.5" /> Ejercicios
                           </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-10 w-10 rounded-none text-rose-500 hover:bg-rose-500 hover:text-white transition-all border border-transparent hover:border-rose-500"
                          onClick={() => setModuleToDelete(module)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <AlertDialog open={!!moduleToDelete} onOpenChange={() => setModuleToDelete(null)}>
        <AlertDialogContent className="rounded-none border-2 border-slate-900 dark:border-white bg-white dark:bg-[#0a0a0b]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-black uppercase tracking-tighter">Eliminar Módulo</AlertDialogTitle>
            <AlertDialogDescription className="label-micro uppercase tracking-widest text-slate-500">
              ¿ESTÁS SEGURO DE QUE DESEAS ELIMINAR EL MÓDULO "{moduleToDelete?.title}"? ESTA ACCIÓN ELIMINARÁ TODAS LAS LECCIONES Y CONTENIDO ASOCIADO Y NO SE PUEDE DESHACER.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-none border-slate-900/10 font-bold uppercase text-[10px] tracking-widest px-6 h-10">CANCELAR</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteModule}
              className="rounded-none bg-rose-500 hover:bg-rose-600 text-white font-black uppercase text-[10px] tracking-widest px-6 h-10"
              disabled={isDeletingModule}
            >
              {isDeletingModule ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" /> : <Trash2 className="h-3.5 w-3.5 mr-2" />}
              ELIMINAR DEFINITIVAMENTE
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
