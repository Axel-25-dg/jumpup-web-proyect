import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Save,
  Loader2,
  BookOpen,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Plus,
  Trash2,
  Eye,
  BarChart,
  Upload,
  Image as ImageIcon
} from 'lucide-react'
import { Card, CardContent } from '@/presentation/components/ui/card'
import { Button } from '@/presentation/components/ui/button'
import { Input } from '@/presentation/components/ui/input'
import { Textarea } from '@/presentation/components/ui/textarea'
import { Badge } from '@/presentation/components/ui/badge'
import { Skeleton } from '@/presentation/components/ui/skeleton'
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
  const [expandedModules, setExpandedModules] = useState<Set<number>>(new Set())
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
      formData.append('is_active', String(data.is_active))
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
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-96 rounded-[2.5rem]" />
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
    <div className="space-y-8 animate-in fade-in duration-700 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild className="rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">
            <Link to="/teacher/courses"><ArrowLeft className="h-5 w-5" /></Link>
          </Button>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white truncate max-w-[300px]">{course.title}</h1>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-1">Editar curso</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Badge className={course.is_active ? 'bg-emerald-100 text-emerald-700 font-bold' : 'bg-amber-100 text-amber-700 font-bold'}>
            {course.is_active ? 'Publicado' : 'Borrador'}
          </Badge>
          <Button
            onClick={handleSubmit(onSubmit)}
            disabled={isSaving}
            className="h-12 rounded-xl font-black bg-sky-600 hover:bg-sky-700 shadow-xl shadow-sky-500/20 px-6"
          >
            {isSaving ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
            Guardar Cambios
          </Button>
        </div>
      </div>

      {/* Course Form */}
      <Card className="border-none shadow-2xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden">
        <CardContent className="p-8 space-y-6">
          <h2 className="text-xl font-black text-slate-900 dark:text-white">Información del Curso</h2>

          <div className="space-y-2">
            <label className="text-sm font-black text-slate-900 dark:text-white">Título del Curso</label>
            <Input
              {...register('title')}
              className={`h-14 rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 font-medium text-lg ${errors.title ? 'border-red-500' : ''}`}
            />
            {errors.title && <span className="text-red-500 text-xs font-bold">{errors.title.message}</span>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-black text-slate-900 dark:text-white">Descripción</label>
            <Textarea
              {...register('description')}
              className={`min-h-[120px] rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 font-medium resize-none p-4 ${errors.description ? 'border-red-500' : ''}`}
            />
            {errors.description && <span className="text-red-500 text-xs font-bold">{errors.description.message}</span>}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-black text-slate-900 dark:text-white">Nivel de Dificultad</label>
              <select
                {...register('difficulty_level')}
                className="w-full h-14 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 px-4 font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                {DIFFICULTY_LEVELS.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-black text-slate-900 dark:text-white">Estado de Publicación</label>
              <select
                {...register('is_active', { setValueAs: (v) => v === 'true' })}
                className="w-full h-14 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 px-4 font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="true">Publicado</option>
                <option value="false">Borrador</option>
              </select>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <label className="text-sm font-black text-slate-900 dark:text-white">Imagen de Portada (Opcional)</label>
            
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
              className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl p-8 text-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group"
            >
              {course.image_url && !selectedFileName ? (
                <div className="flex items-center justify-center gap-4">
                  <img src={course.image_url} alt={course.title} className="h-20 w-32 object-cover rounded-xl" />
                  <div className="text-left">
                    <p className="font-black text-slate-900 dark:text-white">Imagen actual</p>
                    <Button type="button" variant="outline" size="sm" className="mt-2 rounded-xl font-bold dark:border-slate-700 pointer-events-none">
                      <Upload className="mr-2 h-4 w-4" /> Cambiar imagen
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="h-16 w-16 rounded-2xl bg-sky-50 dark:bg-sky-900/20 text-sky-600 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <ImageIcon className="h-8 w-8" />
                  </div>
                  <h4 className="font-black text-slate-900 dark:text-white">
                    {selectedFileName ? selectedFileName : 'Haz clic para subir una imagen'}
                  </h4>
                  <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">PNG, JPG hasta 5MB</p>
                  <Button type="button" variant="outline" size="sm" className="mt-4 rounded-xl font-bold dark:border-slate-700 pointer-events-none">
                    <Upload className="mr-2 h-4 w-4" /> {selectedFileName ? 'Cambiar Imagen' : 'Seleccionar Archivo'}
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modules Section */}
      <Card className="border-none shadow-2xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden">
        <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">Módulos del Curso</h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">{modules.length} módulo{modules.length !== 1 ? 's' : ''}</p>
          </div>
          <Button
            asChild
            size="sm"
            className="h-10 rounded-xl font-bold bg-sky-600 hover:bg-sky-700"
          >
            <Link to={`/teacher/modules/new?course=${courseId}`}>
              <Plus className="mr-2 h-4 w-4" /> Nuevo Módulo
            </Link>
          </Button>
        </div>

        <CardContent className="p-0">
          {modules.length === 0 ? (
            <div className="py-16 text-center">
              <BookOpen className="h-12 w-12 text-slate-200 dark:text-slate-700 mx-auto mb-4" />
              <h3 className="text-lg font-black text-slate-900 dark:text-white">Sin módulos aún</h3>
              <p className="text-slate-500 font-medium mt-1">Crea el primer módulo para estructurar tu curso.</p>
              <Button asChild className="mt-4 bg-sky-600 hover:bg-sky-700 rounded-xl font-black">
                <Link to={`/teacher/modules/new?course=${courseId}`}>
                  <Plus className="mr-2 h-4 w-4" /> Crear Módulo
                </Link>
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {modules.map((module) => (
                <div key={module.id}>
                  <div className="p-6 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <button
                      onClick={() => toggleModule(module.id)}
                      className="flex items-center gap-3 flex-1 text-left"
                    >
                      {expandedModules.has(module.id)
                        ? <ChevronDown className="h-5 w-5 text-slate-400 shrink-0" />
                        : <ChevronRight className="h-5 w-5 text-slate-400 shrink-0" />
                      }
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-10 w-10 rounded-xl bg-sky-50 dark:bg-sky-900/20 text-sky-600 flex items-center justify-center shrink-0">
                          <BookOpen className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-black text-slate-900 dark:text-white truncate">{module.title}</h4>
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Módulo {module.order}</p>
                        </div>
                      </div>
                    </button>
                    <div className="flex gap-2 shrink-0">
                      <Button asChild variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">
                        <Link to={`/teacher/lessons/new?module=${module.id}`}>
                          <Eye className="h-4 w-4 text-slate-500" />
                        </Link>
                      </Button>
                      <Button asChild variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800" title="Ver Ejercicios">
                        <Link to={`/teacher/modules/${module.id}/exercises`}>
                          <BarChart className="h-4 w-4 text-slate-500" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
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
        </CardContent>
      </Card>

      {/* Delete Module Dialog */}
      <AlertDialog open={!!moduleToDelete} onOpenChange={(open) => !open && !isDeletingModule && setModuleToDelete(null)}>
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader>
            <div className="mx-auto bg-red-100 dark:bg-red-900/30 p-3 rounded-full w-fit mb-4">
              <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <AlertDialogTitle className="text-center text-2xl font-black">¿Eliminar módulo?</AlertDialogTitle>
            <AlertDialogDescription className="text-center font-medium">
              Esta acción eliminará permanentemente el módulo{' '}
              <span className="font-bold text-slate-900 dark:text-white">"{moduleToDelete?.title}"</span> y todas sus lecciones.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center gap-3 mt-6">
            <AlertDialogCancel disabled={isDeletingModule} className="rounded-xl h-12 px-6 font-bold">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              disabled={isDeletingModule}
              onClick={handleDeleteModule}
              className="bg-red-600 hover:bg-red-700 text-white rounded-xl h-12 px-6 font-bold"
            >
              {isDeletingModule ? 'Eliminando...' : 'Sí, eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
