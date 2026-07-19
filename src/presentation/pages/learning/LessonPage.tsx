import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { apiClient } from '@/infrastructure/http/axios-client'
import {
  ArrowLeft, CheckCircle2, Sparkles, Volume2, HelpCircle, Loader2,
  Trophy, ChevronRight, BookOpen, AlertCircle
} from 'lucide-react'
import { Button } from '@/presentation/components/ui/button'
import { toast } from 'sonner'

interface Exercise {
  id: number
  title: string
  question_text: string
  exercise_type: 'multiple_choice' | 'translate' | 'listen' | 'fill_blank' | 'match'
  options: string[] | Record<string, string> | any
  correct_answer: string
  audio_url?: string
}

interface Lesson {
  id: number
  title: string
  content_type: string
  xp_reward: number
  description?: string
}

export default function LessonPage() {
  const { courseId, lessonId } = useParams<{ courseId: string, lessonId: string }>()

  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [currentIdx, setCurrentIdx] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string>('')
  const [hasChecked, setHasChecked] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0)
  const [isFinished, setIsFinished] = useState(false)
  const [checkingAnswer, setCheckingAnswer] = useState(false)
  const [correctAnswerFeedback, setCorrectAnswerFeedback] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    async function fetchLessonData() {
      setIsLoading(true)
      try {
        const [lessonRes, exercisesRes] = await Promise.all([
          apiClient.get<Lesson>(`/lessons/${lessonId}/`),
          apiClient.get<Exercise[]>(`/exercises/?lesson=${lessonId}`)
        ])
        const rawExercisesData = exercisesRes.data as any
        const exercisesData: Exercise[] = Array.isArray(rawExercisesData)
          ? rawExercisesData
          : (rawExercisesData?.data || rawExercisesData?.results || [])

        setLesson(lessonRes.data)
        setExercises(exercisesData)
      } catch (err) {
        console.error('Error loading lesson details:', err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchLessonData()
  }, [lessonId])

  if (isLoading) {
    return (
      <div className="flex h-96 flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
        <span className="label-micro text-slate-400 mt-2">Cargando lección interactiva...</span>
      </div>
    )
  }

  if (!lesson || exercises.length === 0) {
    return (
      <div className="max-w-md mx-auto text-center py-16 space-y-6">
        <HelpCircle className="h-12 w-12 mx-auto text-slate-300 dark:text-slate-700" />
        <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Lección no disponible</h2>
        <p className="label-micro text-slate-400 leading-normal">Esta lección no contiene ejercicios interactivos actualmente.</p>
        <Button asChild className="bg-sky-500 hover:bg-sky-600 text-white font-bold">
          <Link to="/courses">Volver a los Cursos</Link>
        </Button>
      </div>
    )
  }

  const currentExercise = exercises[currentIdx]
  const progressPercent = Math.round((currentIdx / exercises.length) * 100)

  if (!currentExercise) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <BookOpen className="h-10 w-10 text-slate-200 dark:text-slate-700 mx-auto mb-3" />
        <p className="text-sm font-bold text-slate-900 dark:text-white mb-1">No hay ejercicios aún</p>
        <p className="label-micro text-slate-400 mb-4">El profesor no ha agregado ejercicios a esta lección todavía.</p>
        <Button variant="outline" className="font-bold border-slate-900/10 dark:border-white/10" asChild>
          <Link to="/courses">Volver a cursos</Link>
        </Button>
      </div>
    )
  }

  let parsedOptions: string[] = []
  if (currentExercise.options) {
    if (Array.isArray(currentExercise.options)) {
      parsedOptions = currentExercise.options
    } else if (typeof currentExercise.options === 'string') {
      try {
        parsedOptions = JSON.parse(currentExercise.options)
      } catch {
        parsedOptions = []
      }
    } else if (typeof currentExercise.options === 'object') {
      parsedOptions = Object.keys(currentExercise.options)
    }
  }

  const handleSelectOption = (option: string) => {
    if (hasChecked) return
    setSelectedAnswer(option)
  }

  const handleCheckAnswer = async () => {
    if (hasChecked || checkingAnswer) return
    setCheckingAnswer(true)

    try {
      const res = await apiClient.post(`/exercises/${currentExercise.id}/validar/`, {
        respuesta_usuario: selectedAnswer
      })
      const userCorrect = res.data.es_correcto === true
      setIsCorrect(userCorrect)
      if (userCorrect) {
        setCorrectAnswersCount(prev => prev + 1)
      } else if (res.data.retroalimentacion) {
        setCorrectAnswerFeedback(res.data.retroalimentacion)
      } else {
        setCorrectAnswerFeedback('La respuesta fue incorrecta.')
      }
      setHasChecked(true)
    } catch (error) {
      console.error('Error validating answer:', error)
      setIsCorrect(false)
      setCorrectAnswerFeedback('Error de validación. Intenta nuevamente.')
      setHasChecked(true)
    } finally {
      setCheckingAnswer(false)
    }
  }

  const handleNext = async () => {
    if (currentIdx + 1 < exercises.length) {
      setCurrentIdx(prev => prev + 1)
      setSelectedAnswer('')
      setHasChecked(false)
      setIsCorrect(false)
      setCorrectAnswerFeedback('')
    } else {
      setIsSaving(true)
      try {
        const finalScore = Math.round((correctAnswersCount / exercises.length) * 100)
        await apiClient.post('/progress/', {
          lesson: lesson.id,
          status: 'completed',
          score: finalScore
        })
        setIsFinished(true)
      } catch (err) {
        console.error('Error saving progress:', err)
        toast.warning('Progreso completado localmente. Error del servidor al sincronizar.')
        setIsFinished(true)
      } finally {
        setIsSaving(false)
      }
    }
  }

  if (isFinished) {
    const finalScore = Math.round((correctAnswersCount / exercises.length) * 100)
    return (
      <div className="max-w-md mx-auto space-y-6 py-12 px-4 animate-in fade-in zoom-in-95">
        <div className="border border-slate-900/10 dark:border-white/10 bg-white dark:bg-white/[0.02] overflow-hidden">
          <div className="pt-8 pb-4 text-center border-b border-slate-900/10 dark:border-white/10">
            <div className="mx-auto flex h-14 w-14 items-center justify-center border border-amber-200 dark:border-amber-800/30 text-amber-500 bg-amber-500/10">
              <Trophy className="h-6 w-6" />
            </div>
            <h2 className="text-lg font-black uppercase tracking-tight text-slate-900 dark:text-white mt-4">¡Lección Completada!</h2>
            <p className="label-micro text-sky-500 font-bold flex items-center justify-center gap-1 mt-1">
              <Sparkles className="h-3 w-3" />
              Has ganado +{lesson.xp_reward} XP
            </p>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="border border-slate-900/10 dark:border-white/10 p-4 text-center bg-slate-50/50 dark:bg-white/[0.01]">
                <span className="text-2xl font-black text-sky-500">{correctAnswersCount}/{exercises.length}</span>
                <span className="label-micro text-slate-400 block mt-1">Correctas</span>
              </div>
              <div className="border border-slate-900/10 dark:border-white/10 p-4 text-center bg-slate-50/50 dark:bg-white/[0.01]">
                <span className="text-2xl font-black text-amber-500">{finalScore}%</span>
                <span className="label-micro text-slate-400 block mt-1">Calificación</span>
              </div>
            </div>
            <p className="label-micro text-slate-400 text-center leading-normal">
              Excelente trabajo. ¡Sigue practicando todos los días para mantener activa tu racha diaria!
            </p>
          </div>

          <div className="p-6 pt-0 border-t border-slate-900/10 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.01] flex flex-col gap-2.5">
            <Button className="w-full h-10 bg-sky-500 hover:bg-sky-600 text-white font-bold" asChild>
              <Link to={courseId ? `/courses/${courseId}` : '/courses'}>Volver a la Clase</Link>
            </Button>
            <Button variant="outline" className="w-full h-10 border-slate-900/10 dark:border-white/10 font-bold" asChild>
              <Link to="/dashboard">Ver mi Dashboard</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 py-4 animate-in fade-in slide-in-from-bottom-8 duration-500">
      {/* Top Header - Modern Progress */}
      <div className="flex items-center gap-6">
        <Button variant="ghost" size="icon" asChild className="-ml-2 h-10 w-10 text-slate-500 hover:text-slate-800 hover:bg-transparent">
          <Link to="/courses">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1 space-y-2">
          <div className="flex justify-between items-end">
            <div className="space-y-0.5">
              <span className="label-micro text-slate-400">Progreso de Lección</span>
              <p className="text-xs font-bold text-slate-900 dark:text-white">
                Ejercicio {currentIdx + 1} <span className="text-slate-400 font-medium">/ {exercises.length}</span>
              </p>
            </div>
            <span className="label-micro px-1.5 py-0.5 border border-sky-500/30 text-sky-500 bg-sky-500/5">{progressPercent}%</span>
          </div>
          <div className="h-1.5 w-full bg-slate-900/10 dark:bg-white/10">
            <div
              className="h-full bg-sky-500 transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Exercise Card */}
      <div className="border border-slate-900/10 dark:border-white/10 bg-white dark:bg-white/[0.02] overflow-hidden">
        <div className="p-6 border-b border-slate-900/10 dark:border-white/10">
          <div className="flex items-center justify-between mb-4">
            <span className="chip text-[9px] px-1.5 py-0.5">
              {currentExercise.exercise_type.replace('_', ' ')}
            </span>
            <div className="flex items-center gap-1.5 label-micro text-amber-500">
              <Sparkles className="h-3.5 w-3.5" />
              <span>+{Math.round(lesson.xp_reward / exercises.length)} XP</span>
            </div>
          </div>
          <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight mb-2">{currentExercise.title}</h2>
          <p className="text-sm font-bold text-slate-500 italic leading-relaxed">
            "{currentExercise.question_text}"
          </p>
        </div>

        <div className="p-6 space-y-6">
          {/* Audio player if listen type */}
          {currentExercise.exercise_type === 'listen' && currentExercise.audio_url && (
            <div className="flex justify-center py-6">
              <button
                className="group relative h-16 w-16 border border-sky-500/20 bg-sky-500/10 flex items-center justify-center text-sky-500 hover:bg-sky-500 hover:text-white transition-colors"
                onClick={() => {
                  const audio = new Audio(currentExercise.audio_url)
                  audio.play().catch(e => console.error('Audio play error:', e))
                }}
              >
                <Volume2 className="h-6 w-6 relative z-10" />
              </button>
            </div>
          )}

          {/* Multiple choice or Translation options */}
          {(currentExercise.exercise_type === 'multiple_choice' || currentExercise.exercise_type === 'translate') && (
            <div className="grid gap-3 sm:grid-cols-2">
              {parsedOptions.map((opt, i) => {
                const isSelected = selectedAnswer === opt
                const isCorrectOption = hasChecked && opt === currentExercise.correct_answer
                const isWrongSelection = hasChecked && isSelected && !isCorrect

                return (
                  <button
                    key={i}
                    disabled={hasChecked}
                    onClick={() => handleSelectOption(opt)}
                    className={`group relative flex items-center text-left p-4 border transition-all duration-200 ${
                      isSelected
                        ? isCorrectOption || (hasChecked && isCorrect)
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/10'
                          : isWrongSelection
                            ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/10'
                            : 'border-sky-500 bg-sky-50 dark:bg-sky-950/10'
                        : isCorrectOption
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/10'
                          : 'border-slate-900/10 dark:border-white/10 hover:border-sky-500/40 hover:bg-sky-500/[0.02]'
                    } ${hasChecked ? 'cursor-default' : 'cursor-pointer'}`}
                  >
                    <span className={`h-6 w-6 shrink-0 border flex items-center justify-center mr-3 text-[10px] font-black transition-colors ${
                      isSelected ? 'bg-sky-500 text-white border-transparent' : 'bg-slate-50 dark:bg-white/5 text-slate-400 border-slate-900/10 dark:border-white/10'
                    }`}>
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span className={`flex-1 font-bold text-xs ${isSelected ? 'text-sky-900 dark:text-sky-400' : 'text-slate-700 dark:text-slate-300'}`}>{opt}</span>

                    <CheckCircle2 className={`h-4 w-4 text-emerald-500 absolute -top-2 -right-2 bg-white dark:bg-[#0a0a0b] rounded-full transition-all duration-200 ${
                      isCorrectOption ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'
                    }`} />
                  </button>
                )
              })}
            </div>
          )}

          {/* Fill in the blank text input */}
          {currentExercise.exercise_type === 'fill_blank' && (
            <div className="space-y-2">
              <label className="label-micro text-slate-400">Tu Respuesta:</label>
              <div className="relative">
                <input
                  type="text"
                  disabled={hasChecked}
                  value={selectedAnswer}
                  onChange={(e) => setSelectedAnswer(e.target.value)}
                  placeholder="Escribe lo que escuchas o traduces..."
                  className={`w-full text-base font-bold p-4 border transition-all focus:outline-none bg-transparent ${
                    hasChecked
                      ? isCorrect ? 'border-emerald-500 text-emerald-600' : 'border-rose-500 text-rose-600'
                      : 'border-slate-900/10 dark:border-white/10 focus:border-sky-500'
                  }`}
                />
                <Sparkles className={`absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-sky-400 transition-all duration-200 ${
                  !hasChecked ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'
                }`} />
              </div>
            </div>
          )}
        </div>

        <div className="p-6 pt-0 border-t border-slate-900/10 dark:border-white/10 flex flex-col gap-4 bg-slate-50/50 dark:bg-white/[0.01]">
          {/* Result Alert box - Refined Editorial Style */}
          <div className={`w-full flex items-center gap-4 p-4 border transition-all duration-200 ${
            hasChecked
              ? isCorrect
                ? 'scale-100 opacity-100 border-emerald-250 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                : 'scale-100 opacity-100 border-rose-250 bg-rose-500/10 text-rose-600 dark:text-rose-400'
              : 'scale-0 opacity-0 h-0 p-0 border-0 pointer-events-none overflow-hidden'
          }`}>
            <div className="h-10 w-10 shrink-0 flex items-center justify-center border border-current bg-white dark:bg-transparent">
              {hasChecked && (isCorrect ? <Sparkles className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />)}
            </div>
            <div className="flex-1">
              <h5 className="font-black text-xs uppercase tracking-wider mb-0.5">{isCorrect ? '¡Fabuloso!' : '¡Casi lo logras!'}</h5>
              <p className="label-micro text-current opacity-85 leading-normal">
                {isCorrect ? 'Respuesta perfecta, sumas puntos a tu racha.' : (correctAnswerFeedback || '¡Sigue intentándolo!')}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="w-full pt-4">
            <Button
              disabled={(!hasChecked && !selectedAnswer.trim()) || checkingAnswer || isSaving}
              onClick={!hasChecked ? handleCheckAnswer : handleNext}
              className={`w-full h-12 text-sm font-bold text-white flex items-center justify-center gap-2 ${
                !hasChecked
                  ? 'bg-slate-900 hover:bg-slate-800 dark:bg-sky-500 dark:hover:bg-sky-600'
                  : isCorrect
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-sky-500 hover:bg-sky-600'
              }`}
            >
              {checkingAnswer || isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  {!hasChecked ? 'Comprobar' : (currentIdx + 1 < exercises.length ? 'Siguiente Ejercicio' : 'Finalizar y Guardar')}
                  <ChevronRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
