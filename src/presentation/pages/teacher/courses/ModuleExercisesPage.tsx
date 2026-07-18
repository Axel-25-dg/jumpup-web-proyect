import { useState, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  BookOpen,
  Loader2,
  Trash2,
  Plus,
  HelpCircle,
  BarChart,
  CheckCircle2
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/components/ui/card'
import { Button } from '@/presentation/components/ui/button'
import { Badge } from '@/presentation/components/ui/badge'
import { toast } from 'sonner'
import { courseRepo } from '@/infrastructure/factories/teacher.factory'
import { apiClient } from '@/infrastructure/http/axios-client'
import type { Lesson, Module } from '@/domain/entities/course.entity'

interface Exercise {
  id: number
  title: string
  prompt: string
  exercise_type: string
  options: any
  correct_answer: string
  lesson: number
}

export default function ModuleExercisesPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const moduleId = Number(id)

  const [isLoading, setIsLoading] = useState(true)
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [exercises, setExercises] = useState<Record<number, Exercise[]>>({})
  const [moduleData, setModuleData] = useState<Module | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        const fetchedLessons = await courseRepo.getLessonsByModule(moduleId)
        setLessons(fetchedLessons)

        if (fetchedLessons.length > 0) {
          setModuleData({
            id: moduleId,
            title: fetchedLessons[0].module_title,
            course: 0,
            course_title: '',
            order: 0,
          })
        }

        const exercisesMap: Record<number, Exercise[]> = {}
        await Promise.all(
          fetchedLessons.map(async (lesson) => {
            try {
              const { data } = await apiClient.get(`/exercises/?lesson=${lesson.id}`)
              exercisesMap[lesson.id] = data.results || data
            } catch {
              exercisesMap[lesson.id] = []
            }
          })
        )
        setExercises(exercisesMap)

      } catch (err) {
        console.error('Error loading exercises:', err)
        toast.error('Error al cargar los ejercicios del módulo')
      } finally {
        setIsLoading(false)
      }
    }
    if (moduleId) {
      loadData()
    }
  }, [moduleId])

  const handleDeleteExercise = async (lessonId: number, exerciseId: number) => {
    try {
      await courseRepo.deleteExercise(exerciseId)
      setExercises(prev => ({
        ...prev,
        [lessonId]: prev[lessonId].filter(e => e.id !== exerciseId)
      }))
      toast.success('Ejercicio eliminado con éxito')
    } catch (err) {
      console.error(err)
      toast.error('Error al eliminar el ejercicio')
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-96 flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
        <span className="text-sm text-slate-500 font-bold mt-2">Cargando ejercicios...</span>
      </div>
    )
  }

  const totalExercises = Object.values(exercises).reduce((acc, curr) => acc + curr.length, 0)

  return (
    <div className="space-y-8 animate-in fade-in duration-700 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              Ejercicios del Módulo
            </h1>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-1">
              {moduleData?.title || `Módulo #${moduleId}`} • {totalExercises} Ejercicio{totalExercises !== 1 && 's'}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => navigate(`/teacher/exercises/new?module=${moduleId}`)}
            className="h-12 rounded-xl font-black bg-emerald-600 hover:bg-emerald-700 shadow-xl shadow-emerald-500/20 px-6"
          >
            <Plus className="mr-2 h-5 w-5" /> Nuevo Ejercicio
          </Button>
        </div>
      </div>

      {lessons.length === 0 ? (
        <Card className="border-none shadow-2xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden text-center py-16">
          <HelpCircle className="h-16 w-16 mx-auto text-slate-300 dark:text-slate-700 mb-4" />
          <h2 className="text-xl font-black text-slate-900 dark:text-white">Sin lecciones</h2>
          <p className="text-slate-500 font-medium mt-2">Crea primero una lección para poder asignarle ejercicios.</p>
        </Card>
      ) : (
        <div className="space-y-8">
          {lessons.map(lesson => {
            const lessonExercises = exercises[lesson.id] || []
            
            return (
              <Card key={lesson.id} className="border-none shadow-xl shadow-slate-200/40 dark:shadow-none bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden">
                <CardHeader className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 p-6 flex flex-row items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-sky-100 dark:bg-sky-900/30 text-sky-600 flex items-center justify-center">
                      <BookOpen className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-black text-slate-900 dark:text-white">
                        {lesson.title}
                      </CardTitle>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">
                        {lessonExercises.length} Ejercicios
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" asChild className="rounded-xl font-bold dark:border-slate-700">
                    <Link to={`/teacher/exercises/new?module=${moduleId}`}>
                       Añadir a esta lección
                    </Link>
                  </Button>
                </CardHeader>
                <CardContent className="p-0">
                  {lessonExercises.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 font-medium">
                      No hay ejercicios creados para esta lección aún.
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                      {lessonExercises.map(exercise => (
                        <div key={exercise.id} className="p-6 flex items-start gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                          <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 flex items-center justify-center shrink-0 mt-1">
                            <BarChart className="h-5 w-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-black text-slate-900 dark:text-white text-lg truncate">
                                {exercise.title}
                              </h4>
                              <Badge variant="outline" className="text-[10px] uppercase font-black bg-slate-100 dark:bg-slate-800 border-none">
                                {exercise.exercise_type.replace('_', ' ')}
                              </Badge>
                            </div>
                            <p className="text-slate-600 dark:text-slate-400 font-medium italic mb-3">
                              "{exercise.prompt || exercise.title}"
                            </p>
                            
                            {(exercise.exercise_type === 'multiple_choice' || exercise.exercise_type === 'translate') && exercise.options && (
                              <div className="grid grid-cols-2 gap-2 mt-2">
                                {(Array.isArray(exercise.options) ? exercise.options : []).map((opt: string, i: number) => (
                                  <div key={i} className={`text-xs font-bold p-2 rounded-lg border ${opt === exercise.correct_answer ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 text-slate-500'}`}>
                                    {opt === exercise.correct_answer && <CheckCircle2 className="inline-block h-3 w-3 mr-1 mb-0.5 text-emerald-500" />}
                                    {opt}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleDeleteExercise(lesson.id, exercise.id)}
                          >
                            <Trash2 className="h-5 w-5" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
