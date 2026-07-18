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
  const [isLoading, setIsLoading] = useState(true)
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
      setIsLoading(true)
      try {
        const result = await courseRepo.getExercisesByLesson(selectedLessonId)
        setExercises(result || [])
      } catch {
        toast.error('Error al cargar ejercicios')
        setExercises([])
      } finally {
        setIsLoading(false)
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
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild className="rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">
            <Link to="/admin"><ArrowLeft className="h-5 w-5" /></Link>
          </Button>
          <div>
            <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">Gestión de Ejercicios</h1>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-1">Crea preguntas con opciones, traducción, listening y más</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button
            className="h-12 rounded-2xl font-black bg-emerald-600 hover:bg-emerald-700 shadow-xl shadow-emerald-500/20 px-6 group"
            onClick={() => {
              if (!selectedLessonId) { toast.error('Selecciona una lección primero'); return }
              resetForm()
              setIsModalOpen(true)
            }}
            disabled={!selectedLessonId}
          >
            <Plus className="mr-2 h-5 w-5" /> Nuevo Ejercicio
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="border-none shadow-xl shadow-slate-200/50 bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-black text-slate-900 dark:text-white">Curso</label>
              <select value={selectedCourseId ?? ''} onChange={(e) => setSelectedCourseId(e.target.value ? Number(e.target.value) : null)}
                className="w-full h-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
                <option value="">Selecciona...</option>
                {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-black text-slate-900 dark:text-white">Módulo</label>
              <select value={selectedModuleId ?? ''} onChange={(e) => setSelectedModuleId(e.target.value ? Number(e.target.value) : null)}
                className="w-full h-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                disabled={!selectedCourseId}>
                <option value="">Selecciona...</option>
                {modules.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-black text-slate-900 dark:text-white">Lección</label>
              <select value={selectedLessonId ?? ''} onChange={(e) => setSelectedLessonId(e.target.value ? Number(e.target.value) : null)}
                className="w-full h-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                disabled={!selectedModuleId}>
                <option value="">Selecciona...</option>
                {lessons.map(l => <option key={l.id} value={l.id}>{l.title}</option>)}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Exercises List */}
      {selectedLessonId ? (
        <Card className="border-none shadow-2xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50/50 dark:bg-slate-800/20">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input placeholder="Buscar ejercicio..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                className="h-12 pl-12 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium" />
            </div>
            <Badge className="bg-emerald-100 text-emerald-700 font-bold px-3 py-1">{exercises.length} ejercicios</Badge>
          </div>
          <CardContent className="p-0">
            {exercises.length > 0 ? (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredExercises.map((exercise: any) => {
                  const Icon = EXERCISE_TYPE_ICONS[exercise.exercise_type] || HelpCircle
                  return (
                    <div key={exercise.id} className="p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="h-12 w-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 flex items-center justify-center shrink-0">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-black text-slate-900 dark:text-white truncate">{exercise.question_text}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className="bg-emerald-100 text-emerald-700 text-[10px] uppercase font-black">
                              {EXERCISE_TYPE_LABELS[exercise.exercise_type] || exercise.exercise_type}
                            </Badge>
                            {exercise.options && Array.isArray(exercise.options) && (
                              <span className="text-xs font-bold text-slate-400">{exercise.options.length} opciones</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="h-10 w-10 rounded-xl p-0 text-red-500 hover:text-red-600 hover:bg-red-50 shrink-0 ml-4"
                        onClick={() => setExerciseToDelete(exercise)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="py-20 text-center">
                <CheckCircle2 className="h-12 w-12 text-slate-200 dark:text-slate-700 mx-auto mb-4" />
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Sin ejercicios</h3>
                <p className="text-slate-500 font-medium">Esta lección aún no tiene ejercicios.</p>
                <Button className="mt-4 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700" onClick={() => { resetForm(); setIsModalOpen(true) }}>
                  <Plus className="mr-2 h-4 w-4" /> Crear Primer Ejercicio
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="border-none shadow-2xl shadow-slate-200/50 bg-white dark:bg-slate-900 rounded-[2.5rem]">
          <CardContent className="py-20 text-center">
            <BookOpen className="h-16 w-16 text-slate-200 dark:text-slate-700 mx-auto mb-4" />
            <h3 className="text-xl font-black text-slate-900 dark:text-white">Selecciona curso, módulo y lección</h3>
            <p className="text-slate-500 font-medium mt-2">Elige las opciones arriba para ver los ejercicios.</p>
          </CardContent>
        </Card>
      )}

      {/* Create Exercise Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-2xl rounded-3xl bg-white dark:bg-slate-900 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-slate-900 dark:text-white">Nuevo Ejercicio</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 py-4">
            {/* Tipo de ejercicio */}
            <div className="space-y-2">
              <label className="text-sm font-black text-slate-900 dark:text-white">Tipo de Ejercicio</label>
              <select value={exerciseType} onChange={(e) => setExerciseType(e.target.value)}
                className="w-full h-14 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
                <option value="multiple_choice">Opción múltiple</option>
                <option value="translate">Traducir</option>
                <option value="listen">Escuchar</option>
                <option value="fill_blank">Completar espacio</option>
                <option value="match">Emparejar</option>
              </select>
            </div>

            {/* Pregunta */}
            <div className="space-y-2">
              <label className="text-sm font-black text-slate-900 dark:text-white">Texto de la Pregunta <span className="text-red-500">*</span></label>
              <Textarea value={questionText} onChange={(e) => setQuestionText(e.target.value)}
                placeholder="Ej. ¿Cuál es el pasado simple del verbo 'Go'?"
                className="min-h-[80px] rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium resize-none p-4" />
            </div>

            {/* Opciones (solo para multiple_choice) */}
            {showOptionsField && (
              <div className="space-y-2">
                <label className="text-sm font-black text-slate-900 dark:text-white">Opciones (una por línea)</label>
                <Textarea value={optionsText} onChange={(e) => setOptionsText(e.target.value)}
                  placeholder="Opción 1&#10;Opción 2&#10;Opción 3&#10;Opción 4"
                  className="min-h-[120px] rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium resize-none p-4" />
                <p className="text-xs font-bold text-slate-400">La respuesta correcta debe coincidir exactamente con una de estas opciones</p>
              </div>
            )}

            {/* URL de audio (solo para listen) */}
            {showAudioField && (
              <div className="space-y-2">
                <label className="text-sm font-black text-slate-900 dark:text-white">URL del Audio</label>
                <Input value={audioUrl} onChange={(e) => setAudioUrl(e.target.value)}
                  placeholder="https://ejemplo.com/audio.mp3"
                  className="h-14 rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium" />
              </div>
            )}

            {/* Respuesta correcta */}
            <div className="space-y-2">
              <label className="text-sm font-black text-slate-900 dark:text-white">Respuesta Correcta <span className="text-red-500">*</span></label>
              <Input value={correctAnswer} onChange={(e) => setCorrectAnswer(e.target.value)}
                placeholder="Ej. Went"
                className="h-14 rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium" />
              <p className="text-xs font-bold text-slate-400">Para opción múltiple, debe coincidir exactamente con una opción de arriba</p>
            </div>
          </div>
          <DialogFooter className="gap-3">
            <Button variant="outline" onClick={() => setIsModalOpen(false)} className="rounded-xl h-12 px-6 font-bold">Cancelar</Button>
            <Button onClick={handleCreateExercise} disabled={isSaving}
              className="rounded-xl h-12 px-6 font-bold bg-emerald-600 hover:bg-emerald-700">
              {isSaving ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
              Crear Ejercicio
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!exerciseToDelete} onOpenChange={(open) => !open && !isDeleting && setExerciseToDelete(null)}>
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader>
            <div className="mx-auto bg-red-100 dark:bg-red-900/30 p-3 rounded-full w-fit mb-4"><AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" /></div>
            <AlertDialogTitle className="text-center text-2xl font-black">¿Eliminar ejercicio?</AlertDialogTitle>
            <AlertDialogDescription className="text-center font-medium">
              Esto eliminará permanentemente el ejercicio y sus datos asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center gap-3 mt-6">
            <AlertDialogCancel disabled={isDeleting} className="rounded-xl h-12 px-6 font-bold">Cancelar</AlertDialogCancel>
            <AlertDialogAction disabled={isDeleting} onClick={handleDeleteExercise} className="bg-red-600 hover:bg-red-700 text-white rounded-xl h-12 px-6 font-bold">
              {isDeleting ? 'Eliminando...' : 'Sí, eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}