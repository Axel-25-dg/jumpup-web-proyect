import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  CheckCircle2,
  Loader2
} from 'lucide-react'
import { Card, CardContent } from '@/presentation/components/ui/card'
import { Button } from '@/presentation/components/ui/button'
import { Input } from '@/presentation/components/ui/input'
import { Badge } from '@/presentation/components/ui/badge'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { courseRepo } from '@/infrastructure/factories/teacher.factory'
import type { Lesson, Module } from '@/domain/entities/course.entity'

const formSchema = z.object({
  lesson: z.coerce.number().min(1, 'Selecciona una lección'),
  title: z.string().min(3, 'El título debe tener al menos 3 caracteres'),
  max_score: z.coerce.number().min(1, 'Mínimo 1 punto').max(1000),
})

type FormData = z.infer<typeof formSchema>

interface Question {
  id: number
  text: string
  options: string[]
  correctOption: number
}

export default function CreateExercisePage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const preselectedModule = searchParams.get('module')

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [modules, setModules] = useState<Module[]>([])
  const [isLoadingLessons, setIsLoadingLessons] = useState(true)
  const [questions, setQuestions] = useState<Question[]>([
    { id: 1, text: '', options: ['', '', '', ''], correctOption: 0 }
  ])

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      max_score: 100,
    }
  })

  useEffect(() => {
    const loadLessons = async () => {
      try {
        const courseResult = await courseRepo.getAll()
        const allLessons: Lesson[] = []
        const allModules: Module[] = []

        for (const course of (courseResult.results || [])) {
          try {
            const mods = await courseRepo.getModulesByCourse(course.id)
            allModules.push(...mods)
            for (const mod of mods) {
              // If preselectedModule is set, only load lessons for that module
              if (preselectedModule && String(mod.id) !== preselectedModule) continue
              try {
                const lesns = await courseRepo.getLessonsByModule(mod.id)
                allLessons.push(...lesns)
              } catch { /* skip */ }
            }
          } catch { /* skip */ }
        }

        setModules(allModules)
        setLessons(allLessons)
      } catch {
        toast.error('No se pudieron cargar las lecciones')
      } finally {
        setIsLoadingLessons(false)
      }
    }
    loadLessons()
  }, [preselectedModule])

  const addQuestion = () => {
    setQuestions(prev => [
      ...prev,
      { id: Date.now(), text: '', options: ['', '', '', ''], correctOption: 0 }
    ])
  }

  const removeQuestion = (id: number) => {
    if (questions.length > 1) {
      setQuestions(prev => prev.filter(q => q.id !== id))
    }
  }

  const updateQuestion = (id: number, text: string) => {
    setQuestions(prev => prev.map(q => q.id === id ? { ...q, text } : q))
  }

  const updateOption = (qId: number, optIndex: number, value: string) => {
    setQuestions(prev => prev.map(q =>
      q.id === qId ? { ...q, options: q.options.map((o, i) => i === optIndex ? value : o) } : q
    ))
  }

  const setCorrectOption = (qId: number, optIndex: number) => {
    setQuestions(prev => prev.map(q => q.id === qId ? { ...q, correctOption: optIndex } : q))
  }

  const onSubmit = async (data: FormData) => {
    // Validate questions
    const hasEmptyQuestion = questions.some(q => !q.text.trim())
    if (hasEmptyQuestion) {
      toast.error('Todas las preguntas deben tener un enunciado')
      return
    }

    setIsSubmitting(true)
    try {
      await Promise.all(
        questions.map(q => 
          courseRepo.createExercise({
            lesson: data.lesson,
            title: data.title,
            max_score: data.max_score,
            exercise_type: 'multiple_choice',
            question_text: q.text,
            options: q.options,
            correct_answer: q.options[q.correctOption],
          })
        )
      )
      toast.success(`Ejercicio "${data.title}" creado con éxito`)
      navigate('/teacher/courses')
    } catch (error: any) {
      console.error('Error creating exercise:', error)
      const errorMsg = error?.detail || error?.message || (typeof error === 'object' ? JSON.stringify(error) : 'Error desconocido')
      toast.error(`Error al crear el ejercicio: ${errorMsg}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 animate-in fade-in duration-700 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild className="rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">
            <Link to="/teacher/courses"><ArrowLeft className="h-5 w-5" /></Link>
          </Button>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Nuevo Ejercicio</h1>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-1">Evalúa a tus estudiantes</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            className="h-12 rounded-xl font-bold dark:border-slate-700"
            onClick={() => navigate('/teacher/courses')}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || isLoadingLessons}
            className="h-12 rounded-xl font-black bg-emerald-600 hover:bg-emerald-700 shadow-xl shadow-emerald-500/20 px-6"
          >
            {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
            Guardar Ejercicio
          </Button>
        </div>
      </div>

      <div className="grid gap-8">
        <Card className="border-none shadow-2xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden">
          <CardContent className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-black text-slate-900 dark:text-white">
                  Lección Asociada <span className="text-red-500">*</span>
                </label>
                {isLoadingLessons ? (
                  <div className="h-14 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 animate-pulse" />
                ) : (
                  <select
                    {...register('lesson')}
                    className={`w-full h-14 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 px-4 font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 ${errors.lesson ? 'border-red-500' : ''}`}
                  >
                    <option value="">Selecciona una lección...</option>
                    {lessons.map(l => (
                      <option key={l.id} value={l.id}>{l.module_title} — {l.title}</option>
                    ))}
                  </select>
                )}
                {errors.lesson && <span className="text-red-500 text-xs font-bold">{errors.lesson.message}</span>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-black text-slate-900 dark:text-white">Puntaje Máximo</label>
                <Input
                  {...register('max_score')}
                  type="number"
                  min={1}
                  className={`h-14 rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 font-medium text-lg ${errors.max_score ? 'border-red-500' : ''}`}
                />
                {errors.max_score && <span className="text-red-500 text-xs font-bold">{errors.max_score.message}</span>}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-black text-slate-900 dark:text-white">
                Título del Ejercicio <span className="text-red-500">*</span>
              </label>
              <Input
                {...register('title')}
                placeholder="Ej. Quiz de Verbos Irregulares"
                className={`h-14 rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 font-medium text-lg ${errors.title ? 'border-red-500' : ''}`}
              />
              {errors.title && <span className="text-red-500 text-xs font-bold">{errors.title.message}</span>}
            </div>
          </CardContent>
        </Card>

        {/* Questions Builder */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-slate-900 dark:text-white">Preguntas</h2>
            <Badge variant="outline" className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500 px-3 py-1 font-bold">
              {questions.length} Total
            </Badge>
          </div>

          {questions.map((q, qIndex) => (
            <Card key={q.id} className="border-none shadow-lg shadow-slate-200/40 dark:shadow-none bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden relative group">
              <CardContent className="p-6 md:p-8 space-y-6">
                <div className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl"
                    onClick={() => removeQuestion(q.id)}
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-black">
                      {qIndex + 1}
                    </span>
                    Enunciado de la Pregunta
                  </label>
                  <Input
                    value={q.text}
                    onChange={(e) => updateQuestion(q.id, e.target.value)}
                    placeholder="Ej. ¿Cuál es el pasado simple del verbo 'Go'?"
                    className="h-14 rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 font-medium"
                  />
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Opciones de Respuesta</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {q.options.map((opt, optIndex) => (
                      <div
                        key={optIndex}
                        className={`flex items-center gap-3 p-3 rounded-2xl border-2 transition-colors ${q.correctOption === optIndex ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/20' : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900'}`}
                      >
                        <button
                          type="button"
                          className={`h-6 w-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${q.correctOption === optIndex ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-300 dark:border-slate-600'}`}
                          onClick={() => setCorrectOption(q.id, optIndex)}
                        >
                          {q.correctOption === optIndex && <CheckCircle2 className="h-4 w-4" />}
                        </button>
                        <Input
                          value={opt}
                          onChange={(e) => updateOption(q.id, optIndex, e.target.value)}
                          placeholder={`Opción ${optIndex + 1}`}
                          className="h-10 border-none bg-transparent font-medium shadow-none focus-visible:ring-0 px-0 text-slate-900 dark:text-white"
                        />
                      </div>
                    ))}
                  </div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Haz clic en el círculo para marcar la respuesta correcta.
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}

          <Button
            type="button"
            variant="outline"
            className="w-full h-16 rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-slate-700 text-slate-500 font-bold hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:border-emerald-300 dark:hover:border-emerald-700 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all"
            onClick={addQuestion}
          >
            <Plus className="mr-2 h-5 w-5" /> Agregar Nueva Pregunta
          </Button>
        </div>
      </div>
    </form>
  )
}
