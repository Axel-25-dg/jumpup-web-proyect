import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  BookOpen, Plus, Search, Edit2, Trash2, ArrowLeft,
  Video, FileText, Headphones, Layers, AlertCircle, Loader2, Smartphone
} from 'lucide-react'
import { Button } from '@/presentation/components/ui/button'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/presentation/components/ui/alert-dialog'
import {
  Dialog, DialogContent,
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

const contentTypeLabels: Record<string, string> = {
  video: 'Video',
  text: 'Texto',
  interactive: 'Interactivo',
  audio: 'Audio',
}

export default function AdminLessonsPage() {
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

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null)
  const [lessonTitle, setLessonTitle] = useState('')
  const [lessonContentType, setLessonContentType] = useState<string>('text')
  const [lessonOrder, setLessonOrder] = useState(1)
  const [lessonXp, setLessonXp] = useState(10)
  const [isSaving, setIsSaving] = useState(false)

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
    } catch {
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
    <div className="animate-in fade-in duration-500">
      {/* HERO */}
      <section className="border-b border-slate-900/10 dark:border-white/10 px-8 md:px-12 py-14 md:py-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" asChild className="-ml-2 rounded-none hover:bg-slate-100 dark:hover:bg-white/5">
                <Link to="/admin"><ArrowLeft className="h-4 w-4" /></Link>
              </Button>
              <div className="chip">
                <BookOpen className="h-3.5 w-3.5 text-sky-500" />
                Contenidos
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white uppercase">
              Gestión de <span className="text-sky-500">Lecciones</span>.
            </h1>
            <p className="text-base text-slate-500 dark:text-slate-400 max-w-lg font-medium">
              Configuración de unidades didácticas, tipos de contenido multimedia y gamificación.
            </p>
          </div>
          <Button
            onClick={openCreateModal}
            disabled={!selectedModuleId}
            className="rounded-none bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold uppercase text-[11px] tracking-[0.2em] px-8 py-6 h-auto hover:bg-sky-500 dark:hover:bg-sky-500 hover:text-white transition-all disabled:opacity-50"
          >
            <Plus className="h-4 w-4 mr-2" /> Nueva Lección
          </Button>
        </div>
      </section>

      {/* SELECTORS & FILTERS */}
      <div className="border-b border-slate-900/10 dark:border-white/10 p-6 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-6 items-end bg-white dark:bg-transparent">
        <div className="space-y-2">
          <label className="label-caps text-slate-400">Curso Académico</label>
          <select
            value={selectedCourseId ?? ''}
            onChange={(e) => setSelectedCourseId(e.target.value ? Number(e.target.value) : null)}
            className="w-full border border-slate-900/10 dark:border-white/10 bg-transparent py-3 px-4 text-[11px] font-bold uppercase tracking-widest outline-none focus:border-sky-500 transition-colors appearance-none"
          >
            <option value="" className="bg-white dark:bg-[#0a0a0b]">SELECCIONAR CURSO...</option>
            {courses.map(c => (
              <option key={c.id} value={c.id} className="bg-white dark:bg-[#0a0a0b]">{c.title.toUpperCase()}</option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="label-caps text-slate-400">Módulo Estructural</label>
          <select
            value={selectedModuleId ?? ''}
            onChange={(e) => setSelectedModuleId(e.target.value ? Number(e.target.value) : null)}
            className="w-full border border-slate-900/10 dark:border-white/10 bg-transparent py-3 px-4 text-[11px] font-bold uppercase tracking-widest outline-none focus:border-sky-500 transition-colors appearance-none disabled:opacity-40"
            disabled={!selectedCourseId}
          >
            <option value="" className="bg-white dark:bg-[#0a0a0b]">SELECCIONAR MÓDULO...</option>
            {modules.map(m => (
              <option key={m.id} value={m.id} className="bg-white dark:bg-[#0a0a0b]">{m.title.toUpperCase()}</option>
            ))}
          </select>
        </div>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            placeholder="FILTRAR LECCIÓN POR TÍTULO..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border border-slate-900/10 dark:border-white/10 bg-transparent py-3 pl-12 pr-4 text-[11px] font-bold uppercase tracking-widest outline-none focus:border-sky-500 transition-colors"
          />
        </div>
      </div>

      {/* DATA TABLE */}
      <div className="overflow-x-auto">
        {selectedModuleId ? (
          <table className="w-full min-w-[1000px] text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-900/10 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02]">
                <th className="px-8 py-5 label-caps text-slate-400 w-24">Seq</th>
                <th className="px-8 py-5 label-caps text-slate-400">Título de Lección / Formato</th>
                <th className="px-8 py-5 label-caps text-slate-400">Gamificación</th>
                <th className="px-8 py-5 label-caps text-slate-400 text-right">Acciones de Gestión</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900/5 dark:divide-white/5">
              {isLoading ? (
                [1, 2, 3].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={4} className="px-8 py-8"><div className="h-4 bg-slate-100 dark:bg-white/5 w-full" /></td>
                  </tr>
                ))
              ) : filteredLessons.length > 0 ? (
                filteredLessons.map((lesson) => {
                  const Icon = contentTypeIcons[lesson.content_type] || FileText
                  return (
                    <tr key={lesson.id} className="card-hover group">
                      <td className="px-8 py-6">
                        <div className="h-10 w-10 flex items-center justify-center border border-slate-900/10 dark:border-white/10 font-black text-sm text-sky-500 bg-slate-50 dark:bg-white/5">
                          {lesson.order.toString().padStart(2, '0')}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-5">
                          <div className="h-10 w-10 shrink-0 flex items-center justify-center border border-slate-900/10 dark:border-white/10 bg-white dark:bg-white/5">
                            <Icon className="h-4 w-4 text-slate-400 group-hover:text-sky-500 transition-colors" />
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight group-hover:text-sky-500 transition-colors">
                              {lesson.title}
                            </p>
                            <span className="label-micro text-sky-500 font-mono mt-0.5">
                              {contentTypeLabels[lesson.content_type]?.toUpperCase() || lesson.content_type.toUpperCase()}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          <span className="label-micro text-slate-500 dark:text-slate-400">RECOMPENSA: <span className="text-slate-900 dark:text-white font-bold">{lesson.xp_reward} XP</span></span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-none border-slate-900/10 hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-slate-900 transition-all font-bold text-[10px] uppercase tracking-widest h-9"
                            onClick={() => openEditModal(lesson)}
                          >
                            <Edit2 className="h-3.5 w-3.5 mr-2" /> Editar
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="rounded-none border-slate-900/10 h-9 w-9 text-rose-500 hover:bg-rose-500 hover:text-white"
                            onClick={() => setLessonToDelete(lesson)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={4} className="py-24 text-center">
                    <div className="flex h-16 w-16 items-center justify-center border border-slate-900/10 dark:border-white/10 mx-auto mb-6">
                      <BookOpen className="h-6 w-6 text-slate-300" />
                    </div>
                    <p className="label-caps text-slate-400 mb-6">No hay lecciones registradas en este módulo</p>
                    <Button
                      size="sm"
                      onClick={openCreateModal}
                      className="rounded-none bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold uppercase text-[10px] tracking-widest px-6"
                    >
                      Crear Primera Lección
                    </Button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        ) : (
          <div className="py-32 text-center border-b border-slate-900/10 dark:border-white/10">
            <Layers className="h-12 w-12 text-slate-200 dark:text-slate-800 mx-auto mb-6" />
            <p className="label-caps text-slate-400">Selecciona curso y módulo para gestionar lecciones</p>
          </div>
        )}
      </div>

      {/* CREATE/EDIT MODAL - Editorial */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="rounded-none border-slate-900/10 dark:border-white/10 p-0 overflow-hidden max-w-lg">
          <div className="bg-slate-900 dark:bg-white p-6">
            <h2 className="text-xl font-black text-white dark:text-slate-900 uppercase tracking-tight">
              {editingLesson ? 'Configurar Lección' : 'Nueva Unidad Técnica'}
            </h2>
          </div>
          <div className="p-8 space-y-6">
            <div className="space-y-2">
              <label className="label-caps text-slate-400">Título de la Lección</label>
              <input
                value={lessonTitle}
                onChange={(e) => setLessonTitle(e.target.value)}
                placeholder="EJ. INTRODUCCIÓN A LAS ESTRUCTURAS"
                className="w-full border border-slate-900/10 dark:border-white/10 bg-transparent py-3 px-4 text-[11px] font-bold uppercase tracking-widest outline-none focus:border-sky-500 transition-colors"
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="label-caps text-slate-400">Formato de Contenido</label>
                <select
                  value={lessonContentType}
                  onChange={(e) => setLessonContentType(e.target.value)}
                  className="w-full border border-slate-900/10 dark:border-white/10 bg-transparent py-3 px-4 text-[11px] font-bold uppercase tracking-widest outline-none focus:border-sky-500 transition-colors appearance-none"
                >
                  <option value="text" className="bg-white dark:bg-[#0a0a0b]">TEXTO / ARTÍCULO</option>
                  <option value="video" className="bg-white dark:bg-[#0a0a0b]">VIDEO TUTORIAL</option>
                  <option value="interactive" className="bg-white dark:bg-[#0a0a0b]">PRACTICA INTERACTIVA</option>
                  <option value="audio" className="bg-white dark:bg-[#0a0a0b]">AUDIO / PODCAST</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="label-caps text-slate-400">Secuencia (Orden)</label>
                <input
                  type="number"
                  min={1}
                  value={lessonOrder}
                  onChange={(e) => setLessonOrder(Number(e.target.value))}
                  className="w-full border border-slate-900/10 dark:border-white/10 bg-transparent py-3 px-4 text-[11px] font-bold uppercase tracking-widest outline-none focus:border-sky-500 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="label-caps text-slate-400">Valor de Recompensa (XP)</label>
              <input
                type="number"
                min={0}
                value={lessonXp}
                onChange={(e) => setLessonXp(Number(e.target.value))}
                className="w-full border border-slate-900/10 dark:border-white/10 bg-transparent py-3 px-4 text-[11px] font-bold uppercase tracking-widest outline-none focus:border-sky-500 transition-colors max-w-[150px]"
              />
            </div>
          </div>
          <div className="p-6 bg-slate-50 dark:bg-white/5 border-t border-slate-900/10 dark:border-white/10 flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              className="rounded-none font-bold uppercase text-[10px] tracking-widest"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSaveLesson}
              disabled={isSaving}
              className="rounded-none bg-sky-500 hover:bg-sky-600 text-white font-bold uppercase text-[10px] tracking-widest"
            >
              {isSaving ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : null}
              {editingLesson ? 'Guardar Cambios' : 'Confirmar Creación'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* DELETE DIALOG - Editorial */}
      <AlertDialog open={!!lessonToDelete} onOpenChange={(open) => !open && !isDeleting && setLessonToDelete(null)}>
        <AlertDialogContent className="rounded-none border-slate-900/10">
          <AlertDialogHeader>
            <div className="flex h-16 w-16 items-center justify-center border border-rose-500/20 bg-rose-500/5 mx-auto mb-6">
              <AlertCircle className="h-8 w-8 text-rose-500" />
            </div>
            <AlertDialogTitle className="text-center text-2xl font-black uppercase tracking-tight">Eliminar Lección</AlertDialogTitle>
            <AlertDialogDescription className="text-center text-sm font-medium py-4">
              ¿Confirmas la eliminación de <span className="text-slate-900 dark:text-white font-bold">"{lessonToDelete?.title}"</span>? Esta acción es irreversible y eliminará todos los ejercicios vinculados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center gap-3 pt-4">
            <AlertDialogCancel className="rounded-none font-bold uppercase text-[10px] tracking-[0.2em]">Cancelar</AlertDialogCancel>
            <AlertDialogAction disabled={isDeleting} onClick={handleDeleteLesson} className="rounded-none bg-rose-600 hover:bg-rose-700 font-bold uppercase text-[10px] tracking-[0.2em]">
              {isDeleting ? 'Eliminando...' : 'Confirmar Eliminación'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>

  )
}