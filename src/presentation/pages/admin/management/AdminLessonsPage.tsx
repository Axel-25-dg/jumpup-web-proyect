import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  BookOpen,
  Plus,
  Search,
  Edit2,
  Trash2,
  ArrowLeft,
  Video,
  FileText,
  Headphones,
  Layers,
  AlertCircle,
  Loader2,
  Smartphone
} from 'lucide-react'
import { Card, CardContent } from '@/presentation/components/ui/card'
import { Button } from '@/presentation/components/ui/button'
import { Input } from '@/presentation/components/ui/input'
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/presentation/components/ui/dialog'
import { toast } from 'sonner'
import { courseRepo } from '@/infrastructure/factories/teacher.factory'
import type { Course, Module, Lesson } from '@/domain/entities/course.entity'

const contentTypeIcons: Record<string, any> = {
  video: Video,
  text: FileText,
  interactive: Smartphone,
  audio: Headphones,
}

const contentTypeColors: Record<string, string> = {
  video: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20',
  text: 'text-sky-600 bg-sky-50 dark:bg-sky-900/20',
  interactive: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20',
  audio: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20',
}

export default function AdminLessonsPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const preselectedModule = searchParams.get('module')

  const [lessons, setLessons] = useState<Lesson[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [modules, setModules] = useState<Module[]>([])
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null)
  const [selectedModuleId, setSelectedModuleId] = useState<number | null>(
    preselectedModule ? Number(preselectedModule) : null
  )
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  // Create/Edit modal
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null)
  const [lessonTitle, setLessonTitle] = useState('')
  const [lessonContentType, setLessonContentType] = useState<string>('text')
  const [lessonOrder, setLessonOrder] = useState(1)
  const [lessonXp, setLessonXp] = useState(10)
  const [isSaving, setIsSaving] = useState(false)

  // Delete state
  const [lessonToDelete, setLessonToDelete] = useState<Lesson | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const result = await courseRepo.getAll()
        setCourses(result.results || [])
      } catch {
        toast.error('Error al cargar cursos')
      }
    }
    loadCourses()
  }, [])

  useEffect(() => {
    if (!selectedCourseId) {
      setModules([])
      setSelectedModuleId(null)
      return
    }
    const loadModules = async () => {
      try {
        const mods = await courseRepo.getModulesByCourse(selectedCourseId)
        setModules(mods)
      } catch {
        toast.error('Error al cargar módulos')
      }
    }
    loadModules()
  }, [selectedCourseId])

  useEffect(() => {
    if (!selectedModuleId) {
      setLessons([])
      return
    }
    const loadLessons = async () => {
      setIsLoading(true)
      try {
        const lesns = await courseRepo.getLessonsByModule(selectedModuleId)
        setLessons(lesns)
      } catch {
        toast.error('Error al cargar lecciones')
      } finally {
        setIsLoading(false)
      }
    }
    loadLessons()
  }, [selectedModuleId])

  const openCreateModal = () => {
    setEditingLesson(null)
    setLessonTitle('')
    setLessonContentType('text')
    setLessonOrder(1)
    setLessonXp(10)
    setIsModalOpen(true)
  }

  const openEditModal = (lesson: Lesson) => {
    setEditingLesson(lesson)
    setLessonTitle(lesson.title)
    setLessonContentType(lesson.content_type)
    setLessonOrder(lesson.order)
    setLessonXp(lesson.xp_reward)
    setIsModalOpen(true)
  }

  const handleSaveLesson = async () => {
    if (!lessonTitle.trim() || !selectedModuleId) {
      toast.error('Completa todos los campos requeridos')
      return
    }
    setIsSaving(true)
    try {
      if (editingLesson) {
        // Use updateLesson - but we only have create/delete in the repo
        // We'll delete and recreate or use direct API. Since updateLesson doesn't exist,
        // we show a toast that this feature requires direct API
        toast.error('La edición de lecciones requiere integración API directa')
      } else {
        await courseRepo.createLesson({
          module: selectedModuleId,
          title: lessonTitle,
          content_type: lessonContentType,
          order: lessonOrder,
          xp_reward: lessonXp,
        })
        toast.success('Lección creada con éxito')
      }
      const lesns = await courseRepo.getLessonsByModule(selectedModuleId)
      setLessons(lesns)
      setIsModalOpen(false)
    } catch (error: any) {
      console.error('Error saving lesson:', error)
      toast.error(error?.detail || 'Error al guardar la lección')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteLesson = async () => {
    if (!lessonToDelete) return
    setIsDeleting(true)
    try {
      await courseRepo.deleteLesson(lessonToDelete.id)
      setLessons(lessons.filter(l => l.id !== lessonToDelete.id))
      toast.success('Lección eliminada con éxito')
    } catch (error) {
      console.error('Error deleting lesson:', error)
      toast.error('Error al eliminar la lección')
    } finally {
      setIsDeleting(false)
      setLessonToDelete(null)
    }
  }

  const filteredLessons = lessons.filter(l =>
    l.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild className="rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">
            <Link to="/admin"><ArrowLeft className="h-5 w-5" /></Link>
          </Button>
          <div>
            <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">Gestión de Lecciones</h1>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-1">Administra el contenido educativo (video, texto, interactivo)</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button
            className="h-12 rounded-2xl font-black bg-sky-600 hover:bg-sky-700 shadow-xl shadow-sky-500/20 px-6 group"
            onClick={openCreateModal}
            disabled={!selectedModuleId}
          >
            <Plus className="mr-2 h-5 w-5" /> Nueva Lección
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="border-none shadow-xl shadow-slate-200/50 bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-sky-600" /> Curso
              </label>
              <select
                value={selectedCourseId ?? ''}
                onChange={(e) => setSelectedCourseId(e.target.value ? Number(e.target.value) : null)}
                className="w-full h-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="">Selecciona un curso...</option>
                {courses.map(c => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="h-4 w-4 text-sky-600" /> Módulo
              </label>
              <select
                value={selectedModuleId ?? ''}
                onChange={(e) => setSelectedModuleId(e.target.value ? Number(e.target.value) : null)}
                className="w-full h-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                disabled={!selectedCourseId}
              >
                <option value="">Selecciona un módulo...</option>
                {modules.map(m => (
                  <option key={m.id} value={m.id}>{m.title}</option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lessons List */}
      {selectedModuleId ? (
        <Card className="border-none shadow-2xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50/50 dark:bg-slate-800/20">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input
                placeholder="Buscar lección..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-12 pl-12 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
              />
            </div>
            <Badge className="bg-sky-100 text-sky-700 font-bold px-3 py-1">
              {lessons.length} lecciones
            </Badge>
          </div>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 space-y-4">
                {[1,2,3].map(i => (
                  <Skeleton key={i} className="h-20 w-full rounded-2xl" />
                ))}
              </div>
            ) : filteredLessons.length > 0 ? (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredLessons.map((lesson, index) => {
                  const Icon = contentTypeIcons[lesson.content_type] || FileText
                  const colorClass = contentTypeColors[lesson.content_type] || 'text-slate-600 bg-slate-50'
                  return (
                    <div key={lesson.id} className="p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                      <div className="flex items-center gap-4">
                        <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${colorClass}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-black text-slate-900 dark:text-white">{lesson.title}</h3>
                            <Badge className="bg-slate-100 text-slate-600 text-[10px] uppercase font-black">
                              {lesson.content_type}
                            </Badge>
                          </div>
                          <p className="text-xs font-bold text-slate-400">
                            Orden: {lesson.order} · XP: {lesson.xp_reward}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-10 w-10 rounded-xl p-0"
                          onClick={() => openEditModal(lesson)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-10 w-10 rounded-xl p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => setLessonToDelete(lesson)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="py-20 text-center">
                <BookOpen className="h-12 w-12 text-slate-200 dark:text-slate-700 mx-auto mb-4" />
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Sin lecciones</h3>
                <p className="text-slate-500 font-medium">Este módulo aún no tiene lecciones.</p>
                <Button className="mt-4 rounded-xl font-bold" onClick={openCreateModal}>
                  <Plus className="mr-2 h-4 w-4" /> Crear Primera Lección
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="border-none shadow-2xl shadow-slate-200/50 bg-white dark:bg-slate-900 rounded-[2.5rem]">
          <CardContent className="py-20 text-center">
            <BookOpen className="h-16 w-16 text-slate-200 dark:text-slate-700 mx-auto mb-4" />
            <h3 className="text-xl font-black text-slate-900 dark:text-white">Selecciona un curso y módulo</h3>
            <p className="text-slate-500 font-medium mt-2">Elige las opciones arriba para ver las lecciones.</p>
          </CardContent>
        </Card>
      )}

      {/* Create Lesson Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-lg rounded-3xl bg-white dark:bg-slate-900">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-slate-900 dark:text-white">
              {editingLesson ? 'Editar Lección' : 'Nueva Lección'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-black text-slate-900 dark:text-white">Título de la Lección</label>
              <Input
                value={lessonTitle}
                onChange={(e) => setLessonTitle(e.target.value)}
                placeholder="Ej. Saludos y presentaciones"
                className="h-14 rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-black text-slate-900 dark:text-white">Tipo de Contenido</label>
              <select
                value={lessonContentType}
                onChange={(e) => setLessonContentType(e.target.value)}
                className="w-full h-14 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="text">Texto</option>
                <option value="video">Video</option>
                <option value="interactive">Interactivo</option>
                <option value="audio">Audio</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-black text-slate-900 dark:text-white">Orden</label>
                <Input
                  type="number"
                  min={1}
                  value={lessonOrder}
                  onChange={(e) => setLessonOrder(Number(e.target.value))}
                  className="h-14 rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-black text-slate-900 dark:text-white">XP de Recompensa</label>
                <Input
                  type="number"
                  min={0}
                  value={lessonXp}
                  onChange={(e) => setLessonXp(Number(e.target.value))}
                  className="h-14 rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium"
                />
              </div>
            </div>
          </div>
          <DialogFooter className="gap-3">
            <Button variant="outline" onClick={() => setIsModalOpen(false)} className="rounded-xl h-12 px-6 font-bold">
              Cancelar
            </Button>
            <Button
              onClick={handleSaveLesson}
              disabled={isSaving}
              className="rounded-xl h-12 px-6 font-bold bg-sky-600 hover:bg-sky-700"
            >
              {isSaving ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
              {editingLesson ? 'Actualizar' : 'Crear Lección'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!lessonToDelete} onOpenChange={(open) => !open && !isDeleting && setLessonToDelete(null)}>
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader>
            <div className="mx-auto bg-red-100 dark:bg-red-900/30 p-3 rounded-full w-fit mb-4">
              <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <AlertDialogTitle className="text-center text-2xl font-black">¿Eliminar lección?</AlertDialogTitle>
            <AlertDialogDescription className="text-center font-medium">
              Esto eliminará permanentemente la lección <br/>
              <span className="font-bold text-slate-900 dark:text-white">"{lessonToDelete?.title}"</span> y sus ejercicios asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center gap-3 mt-6">
            <AlertDialogCancel disabled={isDeleting} className="rounded-xl h-12 px-6 font-bold">Cancelar</AlertDialogCancel>
            <AlertDialogAction disabled={isDeleting} onClick={handleDeleteLesson} className="bg-red-600 hover:bg-red-700 text-white rounded-xl h-12 px-6 font-bold">
              {isDeleting ? 'Eliminando...' : 'Sí, eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}