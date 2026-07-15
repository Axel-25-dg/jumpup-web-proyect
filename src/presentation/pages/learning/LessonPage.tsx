import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { apiClient } from '@/infrastructure/http/axios-client'
import { ArrowLeft, CheckCircle2, AlertCircle, Sparkles, Volume2, HelpCircle, Loader2 } from 'lucide-react'
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
        <Card className="border-primary/20 shadow-xl overflow-hidden bg-gradient-to-b from-indigo-50/50 to-white dark:from-indigo-950/20">
          <CardHeader className="pt-8 pb-4">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-amber-100 text-amber-600 font-extrabold text-4xl animate-bounce">
              🎉
            </div>
            <CardTitle className="text-2xl mt-4">¡Lección Completada!</CardTitle>
            <CardDescription className="text-indigo-600 font-semibold flex items-center justify-center gap-1">
              <Sparkles className="h-4 w-4" />
              Has ganado +{lesson.xp_reward} XP
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 px-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-card p-4 rounded-xl border">
                <span className="text-3xl font-extrabold text-indigo-600">{correctAnswersCount}/{exercises.length}</span>
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
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/courses">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1 space-y-1">
          <div className="flex justify-between items-center text-xs text-muted-foreground">
            <span>Ejercicio {currentIdx + 1} de {exercises.length}</span>
            <span>{progressPercent}% Completado</span>
          </div>
          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Exercise Card */}
      <Card className="shadow-lg border-primary/10">
        <CardHeader className="bg-gradient-to-r from-primary/5 via-indigo-50/10 to-transparent">
          <div className="flex items-center justify-between">
            <Badge className="bg-indigo-600 hover:bg-indigo-700 capitalize">
              {currentExercise.exercise_type.replace('_', ' ')}
            </Badge>
            <span className="text-xs text-indigo-600 font-semibold">+{Math.round(lesson.xp_reward / exercises.length)} XP</span>
          </div>
          <CardTitle className="text-xl mt-3">{currentExercise.title}</CardTitle>
          <CardDescription className="text-sm text-card-foreground/90 font-medium mt-1">
            {currentExercise.prompt}
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6 space-y-4">
          {/* Audio player if listen type */}
          {currentExercise.exercise_type === 'listen' && currentExercise.audio_url && (
            <div className="flex justify-center p-4">
              <Button
                variant="outline"
                size="lg"
                className="h-16 w-16 rounded-full flex items-center justify-center bg-indigo-50 border-indigo-200 text-indigo-600 hover:bg-indigo-100"
                onClick={() => {
                  const audio = new Audio(currentExercise.audio_url)
                  audio.play().catch(e => console.error('Audio play error:', e))
                }}
              >
                <Volume2 className="h-8 w-8" />
              </Button>
            </div>
          )}

          {/* Multiple choice or Translation cards options */}
          {(currentExercise.exercise_type === 'multiple_choice' || currentExercise.exercise_type === 'translate') && (
            <div className="grid gap-3 sm:grid-cols-2">
              {parsedOptions.map((opt, i) => (
                <button
                  key={i}
                  disabled={hasChecked}
                  onClick={() => handleSelectOption(opt)}
                  className={`flex items-center text-left p-4 rounded-xl border-2 transition-all font-medium text-sm ${
                    selectedAnswer === opt
                      ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-700'
                      : 'border-muted hover:border-indigo-200 bg-card hover:bg-muted/10'
                  } ${hasChecked ? 'cursor-not-allowed opacity-80' : ''}`}
                >
                  <span className="h-6 w-6 shrink-0 rounded-full border flex items-center justify-center mr-3 text-xs bg-muted text-muted-foreground font-semibold">
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className="flex-1">{opt}</span>
                </button>
              ))}
            </div>
          )}

          {/* Fill in the blank text input */}
          {currentExercise.exercise_type === 'fill_blank' && (
            <div className="space-y-3">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Escribe tu respuesta:</label>
              <input
                type="text"
                disabled={hasChecked}
                value={selectedAnswer}
                onChange={(e) => setSelectedAnswer(e.target.value)}
                placeholder="Escribe aquí..."
                className="w-full text-lg p-3 rounded-xl border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary disabled:cursor-not-allowed"
              />
            </div>
          )}

          {/* Fallback mock/simplified UI for other types */}
          {currentExercise.exercise_type === 'match' && (
            <div className="text-center py-6 space-y-4">
              <p className="text-sm text-muted-foreground">Empareja los términos correctos.</p>
              <div className="flex flex-col gap-2">
                <Button
                  variant={selectedAnswer ? 'default' : 'outline'}
                  onClick={() => setSelectedAnswer(currentExercise.correct_answer)}
                >
                  Confirmar emparejamiento automático de prueba
                </Button>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="border-t p-6 flex flex-col gap-4">
          {/* Result Alert box */}
          {hasChecked && (
            <div className={`w-full flex items-start gap-3 p-4 rounded-xl ${
              isCorrect ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}>
              {isCorrect ? (
                <>
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-sm">¡Excelente trabajo! Respuesta correcta</h5>
                    <p className="text-xs opacity-90 mt-0.5">Sigue así y avanza a la siguiente pregunta.</p>
                  </div>
                </>
              ) : (
                <>
                  <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-sm">Respuesta Incorrecta</h5>
                    <p className="text-xs opacity-90 mt-0.5">La respuesta correcta era: <span className="font-bold">{currentExercise.correct_answer}</span></p>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Action buttons */}
          <div className="w-full flex justify-end gap-2">
            {!hasChecked ? (
              <Button
                disabled={!selectedAnswer.trim()}
                onClick={handleCheckAnswer}
                className="px-8 py-5 rounded-xl font-bold text-sm"
              >
                Comprobar
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                disabled={isSaving}
                className="px-8 py-5 rounded-xl font-bold text-sm bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                {isSaving ? 'Guardando...' : currentIdx + 1 < exercises.length ? 'Siguiente' : 'Finalizar Lección'}
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
