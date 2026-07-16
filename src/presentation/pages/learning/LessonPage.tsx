import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { apiClient } from '@/infrastructure/http/axios-client'
import { ArrowLeft, CheckCircle2, Sparkles, Volume2, HelpCircle, Loader2, ChevronRight } from 'lucide-react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/presentation/components/ui/card'
import { Button } from '@/presentation/components/ui/button'
import { Badge } from '@/presentation/components/ui/badge'

interface Exercise {
  id: number
  title: string
  prompt: string
  exercise_type: 'multiple_choice' | 'translate' | 'listen' | 'fill_blank' | 'match'
  options: string[] | Record<string, string> | any // puede ser array o JSON object
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
  const { lessonId } = useParams<{ lessonId: string }>()

  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [currentIdx, setCurrentIdx] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string>('')
  const [hasChecked, setHasChecked] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0)
  const [isFinished, setIsFinished] = useState(false)
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
        setLesson(lessonRes.data)
        setExercises(exercisesRes.data)
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
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="text-sm text-muted-foreground mt-2">Cargando lección interactiva...</span>
      </div>
    )
  }

  if (!lesson || exercises.length === 0) {
    return (
      <div className="max-w-md mx-auto text-center py-12 space-y-4">
        <HelpCircle className="h-16 w-16 mx-auto text-muted-foreground opacity-50" />
        <h2 className="text-xl font-bold">Lección no disponible</h2>
        <p className="text-muted-foreground">Esta lección no contiene ejercicios interactivos actualmente o no pudo cargarse.</p>
        <Button asChild>
          <Link to="/courses">Volver a los Cursos</Link>
        </Button>
      </div>
    )
  }

  const currentExercise = exercises[currentIdx]
  const progressPercent = Math.round(((currentIdx) / exercises.length) * 100)

  // Parseo seguro de opciones para el ejercicio actual
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
      // Si es un objeto (por ejemplo para relacionar columnas), convertimos sus llaves o valores
      parsedOptions = Object.keys(currentExercise.options)
    }
  }

  const handleSelectOption = (option: string) => {
    if (hasChecked) return
    setSelectedAnswer(option)
  }

  const handleCheckAnswer = () => {
    if (hasChecked) return

    let userCorrect = false
    if (currentExercise.exercise_type === 'match') {
      // Lógica simplificada de match
      userCorrect = true
    } else {
      userCorrect = selectedAnswer.trim().toLowerCase() === currentExercise.correct_answer.trim().toLowerCase()
    }

    setIsCorrect(userCorrect)
    if (userCorrect) {
      setCorrectAnswersCount(prev => prev + 1)
    }
    setHasChecked(true)
  }

  const handleNext = async () => {
    if (currentIdx + 1 < exercises.length) {
      setCurrentIdx(prev => prev + 1)
      setSelectedAnswer('')
      setHasChecked(false)
      setIsCorrect(false)
    } else {
      // Finalizar lección y guardar progreso
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
        // Aún así marcar como finalizado para UX
        setIsFinished(true)
      } finally {
        setIsSaving(false)
      }
    }
  }

  if (isFinished) {
    const finalScore = Math.round((correctAnswersCount / exercises.length) * 100)
    return (
      <div className="max-w-md mx-auto space-y-6 text-center py-12">
        <Card className="border-primary/20 shadow-xl overflow-hidden bg-gradient-to-b from-sky-50/50 to-white">
          <CardHeader className="pt-8 pb-4">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-amber-100 text-amber-600 font-extrabold text-4xl animate-bounce">
              🎉
            </div>
            <CardTitle className="text-2xl mt-4">¡Lección Completada!</CardTitle>
            <CardDescription className="text-primary font-semibold flex items-center justify-center gap-1">
              <Sparkles className="h-4 w-4" />
              Has ganado +{lesson.xp_reward} XP
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 px-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-card p-4 rounded-xl border">
                <span className="text-3xl font-extrabold text-primary">{correctAnswersCount}/{exercises.length}</span>
                <span className="text-xs text-muted-foreground block mt-1">Correctas</span>
              </div>
              <div className="bg-card p-4 rounded-xl border">
                <span className="text-3xl font-extrabold text-amber-500">{finalScore}%</span>
                <span className="text-xs text-muted-foreground block mt-1">Calificación</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground font-normal">
              Excelente trabajo. ¡Sigue practicando todos los días para mantener activa tu racha diaria!
            </p>
          </CardContent>
          <CardFooter className="bg-muted/30 px-6 py-4 flex flex-col gap-2">
            <Button className="w-full" size="lg" asChild>
              <Link to="/courses">Continuar aprendizaje</Link>
            </Button>
            <Button variant="ghost" className="w-full text-xs" asChild>
              <Link to="/dashboard">Ver mi Dashboard</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 py-4 animate-in fade-in slide-in-from-bottom-8 duration-700">
      {/* Top Header - Modern Progress */}
      <div className="flex items-center gap-6">
        <Button variant="ghost" size="icon" asChild className="rounded-2xl h-12 w-12 hover:bg-slate-100 transition-colors">
          <Link to="/courses">
            <ArrowLeft className="h-6 w-6 text-slate-600" />
          </Link>
        </Button>
        <div className="flex-1 space-y-3">
          <div className="flex justify-between items-end">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Progreso de Lección</span>
              <p className="text-sm font-black text-slate-900">Ejercicio {currentIdx + 1} <span className="text-slate-400 font-bold">/ {exercises.length}</span></p>
            </div>
            <span className="text-xs font-black text-primary bg-sky-50 px-2 py-1 rounded-lg">{progressPercent}%</span>
          </div>
          <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden p-0.5 border border-slate-200/50">
            <div
              className="h-full rounded-full bg-primary transition-all duration-700 ease-out shadow-[0_0_10px_rgba(18,146,224,0.3)]"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Exercise Card - Gamified UI */}
      <Card className="shadow-2xl shadow-slate-200/50 border-none bg-white rounded-[2.5rem] overflow-hidden">
        <CardHeader className="p-8 pb-4 relative overflow-hidden">
          {/* Decorative background */}
          <div className="absolute top-0 right-0 -mr-8 -mt-8 h-32 w-32 bg-sky-50 rounded-full blur-2xl"></div>

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <Badge className="bg-slate-900 text-white px-4 py-1.5 font-black text-[10px] uppercase tracking-widest rounded-xl border-none">
                {currentExercise.exercise_type.replace('_', ' ')}
              </Badge>
              <div className="flex items-center gap-1.5 bg-amber-50 text-amber-600 px-3 py-1 rounded-xl">
                 <Sparkles className="h-3.5 w-3.5" />
                 <span className="text-xs font-black">+{Math.round(lesson.xp_reward / exercises.length)} XP</span>
              </div>
            </div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">{currentExercise.title}</h2>
            <p className="text-lg font-bold text-slate-500 leading-relaxed italic">
              "{currentExercise.prompt}"
            </p>
          </div>
        </CardHeader>

        <CardContent className="p-8 space-y-8">
          {/* Audio player if listen type */}
          {currentExercise.exercise_type === 'listen' && currentExercise.audio_url && (
            <div className="flex justify-center py-6">
              <button
                className="group relative h-24 w-24 rounded-[2rem] bg-primary flex items-center justify-center text-white shadow-xl shadow-sky-200 transform active:scale-95 transition-all"
                onClick={() => {
                  const audio = new Audio(currentExercise.audio_url)
                  audio.play().catch(e => console.error('Audio play error:', e))
                }}
              >
                <div className="absolute inset-0 bg-sky-400 rounded-[2rem] animate-ping opacity-20 group-hover:opacity-40"></div>
                <Volume2 className="h-10 w-10 relative z-10" />
              </button>
            </div>
          )}

          {/* Multiple choice or Translation cards options */}
          {(currentExercise.exercise_type === 'multiple_choice' || currentExercise.exercise_type === 'translate') && (
            <div className="grid gap-4 sm:grid-cols-2">
              {parsedOptions.map((opt, i) => {
                const isSelected = selectedAnswer === opt
                const isCorrectOption = hasChecked && opt === currentExercise.correct_answer
                const isWrongSelection = hasChecked && isSelected && !isCorrect

                return (
                  <button
                    key={i}
                    disabled={hasChecked}
                    onClick={() => handleSelectOption(opt)}
                    className={`group relative flex items-center text-left p-6 rounded-[1.5rem] border-2 transition-all duration-300 transform ${
                      isSelected
                        ? isCorrectOption || (hasChecked && isCorrect)
                          ? 'border-emerald-500 bg-emerald-50'
                          : isWrongSelection
                            ? 'border-rose-500 bg-rose-50'
                            : 'border-primary bg-sky-50/50'
                        : isCorrectOption
                          ? 'border-emerald-500 bg-emerald-50'
                          : 'border-slate-100 hover:border-sky-200 hover:bg-slate-50 hover:scale-[1.02]'
                    } ${hasChecked ? 'cursor-default' : 'cursor-pointer active:scale-95'}`}
                  >
                    <span className={`h-8 w-8 shrink-0 rounded-xl border flex items-center justify-center mr-4 text-xs font-black transition-colors ${
                      isSelected ? 'bg-primary text-white border-transparent' : 'bg-slate-100 text-slate-400 border-slate-200'
                    }`}>
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span className={`flex-1 font-black text-sm ${
                      isSelected ? 'text-sky-900' : 'text-slate-700'
                    }`}>{opt}</span>

                    {isCorrectOption && (
                      <CheckCircle2 className="h-6 w-6 text-emerald-500 absolute -top-3 -right-3 bg-white rounded-full" />
                    )}
                  </button>
                )
              })}
            </div>
          )}

          {/* Fill in the blank text input */}
          {currentExercise.exercise_type === 'fill_blank' && (
            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tu Respuesta:</label>
              <div className="relative">
                <input
                  type="text"
                  disabled={hasChecked}
                  value={selectedAnswer}
                  onChange={(e) => setSelectedAnswer(e.target.value)}
                  placeholder="Escribe lo que escuchas o traduces..."
                  className={`w-full text-xl font-black p-6 rounded-[1.5rem] border-4 transition-all focus:outline-none bg-slate-50 ${
                    hasChecked
                      ? isCorrect ? 'border-emerald-500 text-emerald-600' : 'border-rose-500 text-rose-600'
                      : 'border-transparent focus:border-primary focus:bg-white'
                  }`}
                />
                {!hasChecked && <Sparkles className="absolute right-6 top-1/2 -translate-y-1/2 h-6 w-6 text-sky-300" />}
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="p-8 pt-0 flex flex-col gap-6">
          {/* Result Alert box - Modernized */}
          {hasChecked && (
            <div className={`w-full flex items-center gap-6 p-6 rounded-[2rem] animate-in slide-in-from-bottom-4 duration-500 ${
              isCorrect ? 'bg-emerald-500 text-white shadow-xl shadow-emerald-200' : 'bg-rose-500 text-white shadow-xl shadow-rose-200'
            }`}>
              <div className="h-16 w-16 shrink-0 flex items-center justify-center rounded-2xl bg-white/20 text-3xl">
                 {isCorrect ? '✨' : '🧐'}
              </div>
              <div className="flex-1">
                <h5 className="font-black text-lg leading-none mb-1">{isCorrect ? '¡Fabuloso!' : '¡Casi lo logras!'}</h5>
                <p className="text-sm font-bold opacity-90">
                  {isCorrect ? 'Respuesta perfecta, sumas puntos a tu racha.' : `La respuesta correcta era: ${currentExercise.correct_answer}`}
                </p>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="w-full">
            {!hasChecked ? (
              <Button
                disabled={!selectedAnswer.trim()}
                onClick={handleCheckAnswer}
                className="w-full h-16 rounded-[1.5rem] font-black text-lg bg-slate-900 hover:bg-black shadow-xl shadow-slate-200 transition-all active:scale-95 group"
              >
                Comprobar
                <ChevronRight className="ml-2 h-6 w-6 group-hover:translate-x-1 transition-transform" />
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                disabled={isSaving}
                className={`w-full h-16 rounded-[1.5rem] font-black text-lg shadow-xl transition-all active:scale-95 group ${
                  isCorrect
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-100'
                    : 'bg-primary hover:bg-sky-600 text-white shadow-sky-100'
                }`}
              >
                {isSaving ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <>
                    {currentIdx + 1 < exercises.length ? 'Siguiente Ejercicio' : 'Finalizar y Guardar'}
                    <ChevronRight className="ml-2 h-6 w-6 group-hover:translate-x-2 transition-transform" />
                  </>
                )}
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
