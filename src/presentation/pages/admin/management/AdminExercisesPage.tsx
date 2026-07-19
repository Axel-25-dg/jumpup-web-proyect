import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  BookOpen,
  Plus,
  Search,
  Trash2,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  Headphones,
  MessageSquareText,
  PencilLine,
  GitCompareArrows,
  ListChecks,
  Loader2
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
import {
  Dialog,
  DialogContent,
} from '@/presentation/components/ui/dialog'
import { toast } from 'sonner'
import { courseRepo } from '@/infrastructure/factories/teacher.factory'
import type { Course, Module, Lesson } from '@/domain/entities/course.entity'
import type { ExercisePayload } from '@/domain/ports/course.repository'

const EXERCISE_TYPE_LABELS: Record<string, string> = {
  multiple_choice: 'Opción múltiple',
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
  const [courses, setCourses] = useState<Course[]>([])
  const [modules, setModules] = useState<Module[]>([])
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null)
  const [selectedModuleId, setSelectedModuleId] = useState<number | null>(null)
  const [selectedLessonId, setSelectedLessonId] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  const [exercises, setExercises] = useState<any[]>([])

  // Create modal
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [questionText, setQuestionText] = useState('')
  const [exerciseType, setExerciseType] = useState<string>('multiple_choice')
  const [correctAnswer, setCorrectAnswer] = useState('')
  const [optionsText, setOptionsText] = useState('')
  const [audioUrl, setAudioUrl] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  // Delete state
  const [exerciseToDelete, setExerciseToDelete] = useState<any>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const result = await courseRepo.getAll()
        setCourses(result.results || [])
      } catch { toast.error('Error al cargar cursos') }
    }
    loadCourses()
  }, [])

  useEffect(() => {
    if (!selectedCourseId) { setModules([]); setSelectedModuleId(null); return }
    const load = async () => {
      try {
        const mods = await courseRepo.getModulesByCourse(selectedCourseId)
        setModules(mods)
      } catch { toast.error('Error al cargar módulos') }
    }
    load()
  }, [selectedCourseId])

  useEffect(() => {
    if (!selectedModuleId) { setLessons([]); setSelectedLessonId(null); return }
    const load = async () => {
      try {
        const lesns = await courseRepo.getLessonsByModule(selectedModuleId)
        setLessons(lesns)
      } catch { toast.error('Error al cargar lecciones') }
    }
    load()
  }, [selectedModuleId])

  useEffect(() => {
    if (!selectedLessonId) { setExercises([]); return }
    const loadExercises = async () => {
      try {
        const result = await courseRepo.getExercisesByLesson(selectedLessonId)
        setExercises(result || [])
      } catch {
        toast.error('Error al cargar ejercicios')
        setExercises([])
      }
    }
    loadExercises()
  }, [selectedLessonId])

  const resetForm = () => {
    setQuestionText('')
    setExerciseType('multiple_choice')
    setCorrectAnswer('')
    setOptionsText('')
    setAudioUrl('')
  }

  const handleCreateExercise = async () => {
    if (!questionText.trim() || !correctAnswer.trim() || !selectedLessonId) {
      toast.error('Completa los campos requeridos: pregunta, respuesta correcta')
      return
    }

    const payload: ExercisePayload = {
      lesson: selectedLessonId,
      question_text: questionText,
      exercise_type: exerciseType as ExercisePayload['exercise_type'],
      correct_answer: correctAnswer,
    }

    // Solo enviar options si es multiple_choice
    if (exerciseType === 'multiple_choice' && optionsText.trim()) {
      payload.options = optionsText.split('\n').map(s => s.trim()).filter(s => s)
    }

    // Solo enviar audio_url si es listen
    if (exerciseType === 'listen' && audioUrl.trim()) {
      payload.audio_url = audioUrl.trim()
    }

    setIsSaving(true)
    try {
      await courseRepo.createExercise(payload)
      toast.success('Ejercicio creado con éxito')
      setIsModalOpen(false)
      resetForm()
      // Recargar la lista de ejercicios
      const result = await courseRepo.getExercisesByLesson(selectedLessonId)
      setExercises(result || [])
    } catch (error: any) {
      console.error('Error creating exercise:', error)
      toast.error(error?.detail || 'Error al crear el ejercicio')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteExercise = async () => {
    if (!exerciseToDelete) return
    setIsDeleting(true)
    try {
      await courseRepo.deleteExercise(exerciseToDelete.id)
      setExercises(exercises.filter((e: any) => e.id !== exerciseToDelete.id))
      toast.success('Ejercicio eliminado con éxito')
    } catch (error) {
      console.error('Error deleting exercise:', error)
      toast.error('Error al eliminar el ejercicio')
    } finally {
      setIsDeleting(false)
      setExerciseToDelete(null)
    }
  }

  const filteredExercises = exercises.filter((e: any) =>
    e.question_text?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const showOptionsField = exerciseType === 'multiple_choice'
  const showAudioField = exerciseType === 'listen'

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
                Evaluación
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white uppercase">
              Gestión de <span className="text-sky-500">Ejercicios</span>.
            </h1>
            <p className="text-base text-slate-500 dark:text-slate-400 max-w-lg font-medium">
              Diseño de reactivos, validación de respuestas y configuración de motores de evaluación.
            </p>
          </div>
          <Button
            onClick={() => {
              if (!selectedLessonId) { toast.error('Selecciona una lección primero'); return }
              resetForm()
              setIsModalOpen(true)
            }}
            disabled={!selectedLessonId}
            className="rounded-none bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold uppercase text-[11px] tracking-[0.2em] px-8 py-6 h-auto hover:bg-sky-500 dark:hover:bg-sky-500 hover:text-white transition-all disabled:opacity-50"
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
          <label className="label-caps text-slate-400">Módulo</label>
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
        <div className="space-y-2">
          <label className="label-caps text-slate-400">Lección</label>
          <select
            value={selectedLessonId ?? ''}
            onChange={(e) => setSelectedLessonId(e.target.value ? Number(e.target.value) : null)}
            className="w-full border border-slate-900/10 dark:border-white/10 bg-transparent py-3 px-4 text-[11px] font-bold uppercase tracking-widest outline-none focus:border-sky-500 transition-colors appearance-none disabled:opacity-40"
            disabled={!selectedModuleId}
          >
            <option value="" className="bg-white dark:bg-[#0a0a0b]">SELECCIONAR LECCIÓN...</option>
            {lessons.map(l => (
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
        {selectedLessonId ? (
          <table className="w-full min-w-[1000px] text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-900/10 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02]">
                <th className="px-8 py-5 label-caps text-slate-400">Tipo / Reactivo</th>
                <th className="px-8 py-5 label-caps text-slate-400">Configuración</th>
                <th className="px-8 py-5 label-caps text-slate-400 text-right">Acciones de Gestión</th>
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
                        <div className="flex items-center gap-3">
                          {exercise.options && (
                            <span className="label-micro px-2 py-0.5 border border-slate-900/10 dark:border-white/10 text-slate-500">
                              {exercise.options.length} OPCIONES
                            </span>
                          )}
                          <span className="label-micro text-emerald-600 font-mono">
                            VAL: {exercise.correct_answer.substring(0, 20)}...
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <Button
                          variant="outline"
                          size="icon"
                          className="rounded-none border-slate-900/10 h-9 w-9 text-rose-500 hover:bg-rose-500 hover:text-white transition-colors"
                          onClick={() => setExerciseToDelete(exercise)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={3} className="py-24 text-center">
                    <div className="flex h-16 w-16 items-center justify-center border border-slate-900/10 dark:border-white/10 mx-auto mb-6">
                      <HelpCircle className="h-6 w-6 text-slate-300" />
                    </div>
                    <p className="label-caps text-slate-400 mb-6">No hay reactivos registrados en esta lección</p>
                    <Button
                      size="sm"
                      onClick={() => { resetForm(); setIsModalOpen(true) }}
                      className="rounded-none bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold uppercase text-[10px] tracking-widest px-6"
                    >
                      Crear Primer Reactivo
                    </Button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        ) : (
          <div className="py-32 text-center border-b border-slate-900/10 dark:border-white/10">
            <BookOpen className="h-12 w-12 text-slate-200 dark:text-slate-800 mx-auto mb-6" />
            <p className="label-caps text-slate-400">Selecciona la jerarquía académica para gestionar ejercicios</p>
          </div>
        )}
      </div>

      {/* CREATE MODAL - Editorial */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="rounded-none border-slate-900/10 dark:border-white/10 p-0 overflow-hidden max-w-2xl">
          <div className="bg-slate-900 dark:bg-white p-6">
            <h2 className="text-xl font-black text-white dark:text-slate-900 uppercase tracking-tight">
              Nuevo Reactivo de Evaluación
            </h2>
          </div>
          <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
            <div className="space-y-2">
              <label className="label-caps text-slate-400">Tipo de Reactivo</label>
              <select
                value={exerciseType}
                onChange={(e) => setExerciseType(e.target.value)}
                className="w-full border border-slate-900/10 dark:border-white/10 bg-transparent py-3 px-4 text-[11px] font-bold uppercase tracking-widest outline-none focus:border-sky-500 transition-colors appearance-none"
              >
                <option value="multiple_choice" className="bg-white dark:bg-[#0a0a0b]">OPCIÓN MÚLTIPLE</option>
                <option value="translate" className="bg-white dark:bg-[#0a0a0b]">TRADUCCIÓN TÉCNICA</option>
                <option value="listen" className="bg-white dark:bg-[#0a0a0b]">COMPRENSIÓN AUDITIVA</option>
                <option value="fill_blank" className="bg-white dark:bg-[#0a0a0b]">COMPLETAR ESPACIOS</option>
                <option value="match" className="bg-white dark:bg-[#0a0a0b]">EMPAREJAMIENTO</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="label-caps text-slate-400">Enunciado / Pregunta</label>
              <textarea
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                placeholder="EJ. ¿CUÁL ES EL PASADO SIMPLE DEL VERBO 'GO'?"
                className="w-full border border-slate-900/10 dark:border-white/10 bg-transparent py-3 px-4 text-[11px] font-bold uppercase tracking-widest outline-none focus:border-sky-500 transition-colors min-h-[100px] resize-none"
              />
            </div>

            {showOptionsField && (
              <div className="space-y-2">
                <label className="label-caps text-slate-400">Opciones de Respuesta (Una por línea)</label>
                <textarea
                  value={optionsText}
                  onChange={(e) => setOptionsText(e.target.value)}
                  placeholder="OPCIÓN A&#10;OPCIÓN B&#10;OPCIÓN C"
                  className="w-full border border-slate-900/10 dark:border-white/10 bg-transparent py-3 px-4 text-[11px] font-bold uppercase tracking-widest outline-none focus:border-sky-500 transition-colors min-h-[120px] resize-none"
                />
              </div>
            )}

            {showAudioField && (
              <div className="space-y-2">
                <label className="label-caps text-slate-400">Recurso de Audio (URL)</label>
                <input
                  value={audioUrl}
                  onChange={(e) => setAudioUrl(e.target.value)}
                  placeholder="HTTPS://CDN.PLATAFORMA.COM/AUDIO/001.MP3"
                  className="w-full border border-slate-900/10 dark:border-white/10 bg-transparent py-3 px-4 text-[11px] font-bold uppercase tracking-widest outline-none focus:border-sky-500 transition-colors"
                />
              </div>
            )}

            <div className="space-y-2">
              <label className="label-caps text-slate-400 text-emerald-600">Respuesta Correcta (Validación)</label>
              <input
                value={correctAnswer}
                onChange={(e) => setCorrectAnswer(e.target.value)}
                placeholder="VALOR EXACTO PARA VALIDACIÓN"
                className="w-full border border-emerald-500/30 dark:border-emerald-500/20 bg-emerald-500/5 py-3 px-4 text-[11px] font-bold uppercase tracking-widest outline-none focus:border-emerald-500 transition-colors"
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
              onClick={handleCreateExercise}
              disabled={isSaving}
              className="rounded-none bg-sky-500 hover:bg-sky-600 text-white font-bold uppercase text-[10px] tracking-widest"
            >
              {isSaving ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : null}
              Confirmar Reactivo
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* DELETE DIALOG - Editorial */}
      <AlertDialog open={!!exerciseToDelete} onOpenChange={(open) => !open && !isDeleting && setExerciseToDelete(null)}>
        <AlertDialogContent className="rounded-none border-slate-900/10">
          <AlertDialogHeader>
            <div className="flex h-16 w-16 items-center justify-center border border-rose-500/20 bg-rose-500/5 mx-auto mb-6">
              <AlertCircle className="h-8 w-8 text-rose-500" />
            </div>
            <AlertDialogTitle className="text-center text-2xl font-black uppercase tracking-tight">Eliminar Reactivo</AlertDialogTitle>
            <AlertDialogDescription className="text-center text-sm font-medium py-4">
              ¿Confirmas la eliminación permanente de este ejercicio? Esta acción afectará las métricas de evaluación de la lección actual.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center gap-3 pt-4">
            <AlertDialogCancel className="rounded-none font-bold uppercase text-[10px] tracking-[0.2em]">Cancelar</AlertDialogCancel>
            <AlertDialogAction disabled={isDeleting} onClick={handleDeleteExercise} className="rounded-none bg-rose-600 hover:bg-rose-700 font-bold uppercase text-[10px] tracking-[0.2em]">
              {isDeleting ? 'Eliminando...' : 'Confirmar Eliminación'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>

  )
}