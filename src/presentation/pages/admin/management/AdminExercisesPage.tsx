import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  Plus, Search, Trash2, ArrowLeft,
  AlertCircle, CheckCircle2, HelpCircle,
  Headphones, MessageSquareText,
  PencilLine, GitCompareArrows, ListChecks, Edit2
} from 'lucide-react'
import { Button } from '@/presentation/components/ui/button'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/presentation/components/ui/alert-dialog'
import { toast } from 'sonner'
import { courseRepo } from '@/infrastructure/factories/teacher.factory'
import type { Course, Module, Lesson } from '@/domain/entities/course.entity'

const EXERCISE_TYPE_LABELS: Record<string, string> = {
  multiple_choice: 'Opcion multiple',
  translate: 'Traducir',
  listen: 'Escuchar',
  fill_blank: 'Completar espacio',
  match: 'Emparejar',
}

const EXERCISE_TYPE_ICONS: Record<string, any> = {
  multiple_choice: ListChecks,
  translate: MessageSquareText,
  listen: Headphones,
  fill_blank: PencilLine,
  match: GitCompareArrows,
}

export default function AdminExercisesPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [allExercises, setAllExercises] = useState<any[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [modules, setModules] = useState<Module[]>([])
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null)
  const [selectedModuleId, setSelectedModuleId] = useState<number | null>(null)
  const [selectedLessonId, setSelectedLessonId] = useState<number | null>(
    searchParams.get('lesson') ? Number(searchParams.get('lesson')) : null
  )
  const [searchTerm, setSearchTerm] = useState('')

  const [isLoading, setIsLoading] = useState(true)

  // Delete state
  const [exerciseToDelete, setExerciseToDelete] = useState<any>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const loadAll = async () => {
      try {
        setIsLoading(true)
        setAllExercises([])
        const courseResult = await courseRepo.getAll()
        const coursesList = courseResult.results || []
        setCourses(coursesList)

        // Cargar todos los modulos de todos los cursos en paralelo
        const modulesResults = await Promise.all(
          coursesList.map(c => courseRepo.getModulesByCourse(c.id))
        )
        const allMods = modulesResults.flat()
        setModules(allMods)

        // Cargar todas las lecciones de todos los modulos en paralelo
        const lessonsResults = await Promise.all(
          allMods.map(m => courseRepo.getLessonsByModule(m.id))
        )
        const allLessons = lessonsResults.flat()
        setLessons(allLessons)

        // Cargar todos los ejercicios de todas las lecciones en paralelo
        const exercisesResults = await Promise.all(
          allLessons.map(l => courseRepo.getExercisesByLesson(l.id))
        )

        // Construir mapas para busqueda rapida
        const lessonMap = new Map(allLessons.map(l => [l.id, l]))
        const moduleMap = new Map(allMods.map(m => [m.id, m]))
        const courseMap = new Map(coursesList.map(c => [c.id, c]))

        const allExercisesData: any[] = []
        exercisesResults.forEach((exs, idx) => {
          const lesson = lessonMap.get(allLessons[idx].id)
          const mod = lesson ? moduleMap.get(lesson.module) : undefined
          const course = mod ? courseMap.get(mod.course) : undefined
          exs.forEach((e: any) => {
            allExercisesData.push({
              ...e,
              lessonTitle: lesson?.title,
              moduleTitle: mod?.title,
              courseTitle: course?.title,
            })
          })
        })

        setAllExercises(allExercisesData)
      } catch {
        toast.error('Error al cargar datos')
      } finally {
        setIsLoading(false)
      }
    }
    void loadAll()
  }, [])

  const handleDeleteExercise = async () => {
    if (!exerciseToDelete) return
    setIsDeleting(true)
    try {
      await courseRepo.deleteExercise(exerciseToDelete.id)
      setAllExercises(allExercises.filter((e: any) => e.id !== exerciseToDelete.id))
      toast.success('Ejercicio eliminado con exito')
    } catch {
      toast.error('Error al eliminar el ejercicio')
    } finally {
      setIsDeleting(false)
      setExerciseToDelete(null)
    }
  }

  const filteredExercises = allExercises.filter((e: any) => {
    const matchesSearch = e.question_text?.toLowerCase().includes(searchTerm.toLowerCase())
    if (!matchesSearch) return false
    if (selectedLessonId) return e.lesson === selectedLessonId
    if (selectedModuleId) {
      const lessonIds = lessons.filter(l => l.module === selectedModuleId).map(l => l.id)
      return lessonIds.includes(e.lesson)
    }
    if (selectedCourseId) {
      const modIds = modules.filter(m => m.course === selectedCourseId).map(m => m.id)
      const lessonIds = lessons.filter(l => modIds.includes(l.module)).map(l => l.id)
      return lessonIds.includes(e.lesson)
    }
    return true
  })

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
                <CheckCircle2 className="h-3.5 w-3.5 text-sky-500" />
                Evaluacion
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white uppercase">
              Gestion de <span className="text-sky-500">Ejercicios</span>.
            </h1>
            <p className="text-base text-slate-500 dark:text-slate-400 max-w-lg font-medium">
              Diseno de reactivos, validacion de respuestas y configuracion de motores de evaluacion.
            </p>
          </div>
          <Button
            onClick={() => {
              const lessonParam = selectedLessonId ? `?lesson=${selectedLessonId}` : ''
              navigate(`/admin/management/exercises/new${lessonParam}`)
            }}
            className="rounded-none bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold uppercase text-[11px] tracking-[0.2em] px-8 py-6 h-auto hover:bg-sky-500 dark:hover:bg-sky-500 hover:text-white transition-all"
          >
            <Plus className="h-4 w-4 mr-2" /> Nuevo Ejercicio
          </Button>
        </div>
      </section>

      {/* SELECTORS & FILTERS */}
      <div className="border-b border-slate-900/10 dark:border-white/10 p-6 md:p-8 grid grid-cols-1 lg:grid-cols-4 gap-6 items-end bg-white dark:bg-transparent">
        <div className="space-y-2">
          <label className="label-caps text-slate-400">Curso</label>
          <select
            value={selectedCourseId ?? ''}
            onChange={(e) => { setSelectedCourseId(e.target.value ? Number(e.target.value) : null); setSelectedModuleId(null); setSelectedLessonId(null) }}
            className="w-full border border-slate-900/10 dark:border-white/10 bg-transparent py-3 px-4 text-[11px] font-bold uppercase tracking-widest outline-none focus:border-sky-500 transition-colors appearance-none"
          >
            <option value="" className="bg-white dark:bg-[#0a0a0b]">TODOS LOS CURSOS</option>
            {courses.map(c => (
              <option key={c.id} value={c.id} className="bg-white dark:bg-[#0a0a0b]">{c.title.toUpperCase()}</option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="label-caps text-slate-400">Modulo</label>
          <select
            value={selectedModuleId ?? ''}
            onChange={(e) => { setSelectedModuleId(e.target.value ? Number(e.target.value) : null); setSelectedLessonId(null) }}
            className="w-full border border-slate-900/10 dark:border-white/10 bg-transparent py-3 px-4 text-[11px] font-bold uppercase tracking-widest outline-none focus:border-sky-500 transition-colors appearance-none"
          >
            <option value="" className="bg-white dark:bg-[#0a0a0b]">TODOS LOS MODULOS</option>
            {modules
              .filter(m => !selectedCourseId || m.course === selectedCourseId)
              .map(m => (
                <option key={m.id} value={m.id} className="bg-white dark:bg-[#0a0a0b]">{m.title.toUpperCase()}</option>
              ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="label-caps text-slate-400">Leccion</label>
          <select
            value={selectedLessonId ?? ''}
            onChange={(e) => setSelectedLessonId(e.target.value ? Number(e.target.value) : null)}
            className="w-full border border-slate-900/10 dark:border-white/10 bg-transparent py-3 px-4 text-[11px] font-bold uppercase tracking-widest outline-none focus:border-sky-500 transition-colors appearance-none"
          >
            <option value="" className="bg-white dark:bg-[#0a0a0b]">TODAS LAS LECCIONES</option>
            {lessons
              .filter(l => !selectedModuleId || l.module === selectedModuleId)
              .map(l => (
                <option key={l.id} value={l.id} className="bg-white dark:bg-[#0a0a0b]">{l.title.toUpperCase()}</option>
              ))}
          </select>
        </div>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            placeholder="BUSCAR REACTIVO..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border border-slate-900/10 dark:border-white/10 bg-transparent py-3 pl-12 pr-4 text-[11px] font-bold uppercase tracking-widest outline-none focus:border-sky-500 transition-colors"
          />
        </div>
      </div>

      {/* DATA TABLE */}
      <div className="overflow-x-auto">
        {isLoading ? (
          <div className="py-24 text-center border-b border-slate-900/10 dark:border-white/10">
            <div className="flex flex-col items-center justify-center gap-4">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-sky-500 border-t-transparent" />
              <p className="label-caps text-slate-400">Cargando reactivos...</p>
            </div>
          </div>
        ) : (
        <table className="w-full min-w-[1000px] text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-900/10 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02]">
              <th className="px-8 py-5 label-caps text-slate-400">Tipo / Reactivo</th>
              <th className="px-8 py-5 label-caps text-slate-400">Leccion / Curso</th>
              <th className="px-8 py-5 label-caps text-slate-400">Configuracion</th>
              <th className="px-8 py-5 label-caps text-slate-400 text-right">Acciones de Gestion</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-900/5 dark:divide-white/5">
            {filteredExercises.length > 0 ? (
              filteredExercises.map((exercise: any) => {
                const Icon = EXERCISE_TYPE_ICONS[exercise.exercise_type] || HelpCircle
                return (
                  <tr key={exercise.id} className="card-hover group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-5">
                        <div className="h-10 w-10 shrink-0 flex items-center justify-center border border-slate-900/10 dark:border-white/10 bg-slate-50 dark:bg-white/5">
                          <Icon className="h-4 w-4 text-sky-500" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight group-hover:text-sky-500 transition-colors line-clamp-1">
                            {exercise.question_text}
                          </p>
                          <span className="label-micro text-slate-400 font-mono mt-0.5">
                            {EXERCISE_TYPE_LABELS[exercise.exercise_type]?.toUpperCase() || exercise.exercise_type.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="space-y-1">
                        <span className="label-micro text-slate-400 block">{exercise.lessonTitle || '---'}</span>
                        <span className="label-micro px-2 py-0.5 border border-sky-500/20 text-sky-600 bg-sky-500/5 uppercase inline-block">
                          {exercise.courseTitle || '---'}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="label-micro text-emerald-600 font-mono">
                        VAL: {exercise.correct_answer?.substring(0, 30)}...
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-none border-slate-900/10 hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-slate-900 transition-all font-bold text-[10px] uppercase tracking-widest h-9"
                          onClick={() => navigate(`/admin/management/exercises/${exercise.id}/edit?lesson=${exercise.lesson}`)}
                        >
                          <Edit2 className="h-3.5 w-3.5 mr-2" /> Editar
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="rounded-none border-slate-900/10 h-9 w-9 text-rose-500 hover:bg-rose-500 hover:text-white"
                          onClick={() => setExerciseToDelete(exercise)}
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
                    <HelpCircle className="h-6 w-6 text-slate-300" />
                  </div>
                  <p className="label-caps text-slate-400 mb-6">No hay reactivos registrados</p>
                  <Button
                    size="sm"
                    onClick={() => navigate('/admin/management/exercises/new')}
                    className="rounded-none bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold uppercase text-[10px] tracking-widest px-6"
                  >
                    Crear Primer Reactivo
                  </Button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
        )}
      </div>

      {/* DELETE DIALOG */}
      <AlertDialog open={!!exerciseToDelete} onOpenChange={(open) => !open && !isDeleting && setExerciseToDelete(null)}>
        <AlertDialogContent className="rounded-none border-slate-900/10">
          <AlertDialogHeader>
            <div className="flex h-16 w-16 items-center justify-center border border-rose-500/20 bg-rose-500/5 mx-auto mb-6">
              <AlertCircle className="h-8 w-8 text-rose-500" />
            </div>
            <AlertDialogTitle className="text-center text-2xl font-black uppercase tracking-tight">Eliminar Reactivo</AlertDialogTitle>
            <AlertDialogDescription className="text-center text-sm font-medium py-4">
              Confirmas la eliminacion permanente de este ejercicio? Esta accion afectara las metricas de evaluacion de la leccion actual.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center gap-3 pt-4">
            <AlertDialogCancel className="rounded-none font-bold uppercase text-[10px] tracking-[0.2em]">Cancelar</AlertDialogCancel>
            <AlertDialogAction disabled={isDeleting} onClick={handleDeleteExercise} className="rounded-none bg-rose-600 hover:bg-rose-700 font-bold uppercase text-[10px] tracking-[0.2em]">
              {isDeleting ? 'Eliminando...' : 'Confirmar Eliminacion'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}