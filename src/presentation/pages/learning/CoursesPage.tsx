import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiClient } from '@/infrastructure/http/axios-client'
import { BookOpen, CheckCircle2, ChevronRight, PlayCircle, Loader2, Trophy, Sparkles } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/presentation/components/ui/card'
import { Badge } from '@/presentation/components/ui/badge'
import { Button } from '@/presentation/components/ui/button'

interface Course {
  id: number
  title: string
  description: string
  difficulty_level: string
  language_info?: {
    name: string
    code: string
  }
}

interface Module {
  id: number
  title: string
  description: string
  position: number
  lessons?: Lesson[]
}

interface Lesson {
  id: number
  title: string
  content_type: string
  xp_reward: number
  is_completed?: boolean
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [modules, setModules] = useState<Module[]>([])
  const [completedLessonIds, setCompletedLessonIds] = useState<number[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingModules, setIsLoadingModules] = useState(false)

  useEffect(() => {
    async function fetchInitialData() {
      try {
        const [coursesRes, progressRes] = await Promise.all([
          apiClient.get<Course[]>('/courses/'),
          apiClient.get<{ completed_lessons?: number[] } | any>('/progress/summary/').catch(() => ({ data: {} }))
        ])
        setCourses(coursesRes.data)
        
        // Extraer IDs de lecciones completadas si vienen en el resumen o progreso
        const progressData = progressRes.data
        if (progressData && Array.isArray(progressData.completed_lesson_ids)) {
          setCompletedLessonIds(progressData.completed_lesson_ids)
        } else {
          // Intentar otra fuente o dejar vacío
          setCompletedLessonIds([])
        }
      } catch (err) {
        console.error('Error fetching initial learning data:', err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchInitialData()
  }, [])

  const handleSelectCourse = async (course: Course) => {
    setSelectedCourse(course)
    setIsLoadingModules(true)
    try {
      const modulesRes = await apiClient.get<Module[]>(`/modules/?course=${course.id}`)
      const modulesData = modulesRes.data

      // Cargar lecciones por cada módulo
      const modulesWithLessons = await Promise.all(
        modulesData.map(async (mod) => {
          const lessonsRes = await apiClient.get<Lesson[]>(`/lessons/?module=${mod.id}`)
          return {
            ...mod,
            lessons: lessonsRes.data.map(l => ({
              ...l,
              is_completed: completedLessonIds.includes(l.id)
            }))
          }
        })
      )
      
      setModules(modulesWithLessons.sort((a, b) => a.position - b.position))
    } catch (err) {
      console.error('Error fetching modules and lessons:', err)
    } finally {
      setIsLoadingModules(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <Card className="hidden">
        <CardHeader>
          <CardTitle>Dummy</CardTitle>
          <CardDescription>Dummy</CardDescription>
        </CardHeader>
        <CardContent>Dummy</CardContent>
      </Card>
      {/* Cursos List */}
      <aside className="lg:w-80 space-y-6">
        <div className="bg-white rounded-2xl p-6 shadow-xl shadow-slate-200/50 border border-slate-100">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-indigo-600" />
            Cursos
          </h2>
          <p className="text-sm font-medium text-slate-500 mt-1 mb-6">Continúa tu camino al dominio.</p>

          <div className="space-y-3">
            {courses.map((course) => (
              <button
                key={course.id}
                onClick={() => handleSelectCourse(course)}
                className={`w-full text-left p-4 rounded-xl transition-all duration-300 group relative overflow-hidden ${
                  selectedCourse?.id === course.id
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-[1.02]'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-transparent hover:border-indigo-100'
                }`}
              >
                <div className="flex flex-col gap-2 relative z-10">
                  <div className="flex justify-between items-center">
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                       selectedCourse?.id === course.id ? 'bg-white/20 text-white' : 'bg-indigo-50 text-indigo-600'
                    }`}>
                      {course.difficulty_level}
                    </span>
                  </div>
                  <h3 className="font-black text-sm leading-tight">{course.title}</h3>
                </div>
                {selectedCourse?.id === course.id && (
                  <div className="absolute top-0 right-0 p-2 opacity-20">
                    <ChevronRight className="h-12 w-12 -mr-4 -mt-2" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Gamification Widget */}
        <div className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl p-6 text-white shadow-xl shadow-orange-200/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-white/20 p-2 rounded-lg">
               <Trophy className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-widest opacity-80">Tu Rango</p>
              <h4 className="text-lg font-black">Platino IV</h4>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-[10px] font-black uppercase">
              <span>Progreso de Nivel</span>
              <span>75%</span>
            </div>
            <div className="h-2 w-full bg-black/10 rounded-full overflow-hidden">
              <div className="h-full bg-white rounded-full w-[75%] shadow-sm"></div>
            </div>
          </div>
        </div>
      </aside>

      {/* Curso Detalle / Modulos */}
      <main className="flex-1 min-w-0 space-y-8">
        {selectedCourse ? (
          <div className="animate-in fade-in zoom-in-95 duration-500">
            <div className="relative overflow-hidden rounded-3xl bg-white p-8 shadow-xl border border-slate-100 mb-8">
              <div className="relative z-10">
                <div className="flex flex-wrap items-center gap-3 mb-4">
                   {selectedCourse.language_info && (
                    <Badge className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 font-black text-[10px] uppercase tracking-wider border-none">
                      {selectedCourse.language_info.name}
                    </Badge>
                   )}
                   <Badge variant="outline" className="border-indigo-200 text-indigo-600 font-black text-[10px] uppercase tracking-wider px-3 py-1">
                      {selectedCourse.difficulty_level}
                   </Badge>
                </div>
                <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-4">
                  {selectedCourse.title}
                </h1>
                <p className="text-lg text-slate-500 font-medium max-w-2xl leading-relaxed">
                  {selectedCourse.description}
                </p>
              </div>

              {/* Decorative element */}
              <div className="absolute -right-20 -top-20 h-64 w-64 bg-indigo-50 rounded-full blur-3xl opacity-60"></div>
            </div>

            {isLoadingModules ? (
              <div className="flex flex-col h-64 items-center justify-center gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
                <span className="text-sm font-black text-slate-400 uppercase tracking-widest">Organizando lecciones...</span>
              </div>
            ) : modules.length > 0 ? (
              <div className="space-y-8">
                {modules.map((mod) => (
                  <div key={mod.id} className="space-y-4">
                    <div className="flex items-center gap-4 ml-2">
                       <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-white font-black text-lg shadow-lg">
                          {mod.position}
                       </div>
                       <div>
                          <h2 className="text-xl font-black text-slate-900 leading-none">{mod.title}</h2>
                          <p className="text-sm font-bold text-slate-400 mt-1">{mod.description}</p>
                       </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                      {mod.lessons?.map((lesson) => {
                         const isCompleted = lesson.is_completed || completedLessonIds.includes(lesson.id)
                         return (
                          <div
                            key={lesson.id}
                            className={`group flex items-center justify-between p-5 rounded-2xl bg-white border transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/50 ${
                              isCompleted ? 'border-emerald-100' : 'border-slate-100 hover:border-indigo-200'
                            }`}
                          >
                            <div className="flex items-center gap-4 min-w-0">
                              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-all duration-300 ${
                                isCompleted
                                  ? 'bg-emerald-50 text-emerald-600'
                                  : 'bg-indigo-50 text-indigo-600 group-hover:scale-110'
                              }`}>
                                {isCompleted ? <CheckCircle2 className="h-6 w-6" /> : <PlayCircle className="h-6 w-6" />}
                              </div>
                              <div className="min-w-0">
                                <h4 className="font-black text-slate-900 text-sm truncate group-hover:text-indigo-600 transition-colors">
                                  {lesson.title}
                                </h4>
                                <div className="flex items-center gap-2 mt-1">
                                   <span className="text-[10px] font-black uppercase tracking-tighter text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                                      {lesson.content_type}
                                   </span>
                                   <span className="text-[10px] font-black text-amber-600 flex items-center gap-0.5">
                                      <Sparkles className="h-3 w-3" />
                                      {lesson.xp_reward} XP
                                   </span>
                                </div>
                              </div>
                            </div>

                            <Button
                              size="sm"
                              variant={isCompleted ? 'outline' : 'default'}
                              asChild
                              className={`rounded-xl px-5 font-black transition-all ${
                                isCompleted
                                  ? 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-100'
                              }`}
                            >
                              <Link to={`/courses/${selectedCourse.id}/lessons/${lesson.id}`}>
                                {isCompleted ? 'Repasar' : 'Comenzar'}
                                <ChevronRight className="ml-1 h-4 w-4" />
                              </Link>
                            </Button>
                          </div>
                         )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                <BookOpen className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-black text-slate-900 dark:text-white">Próximamente...</h3>
                <p className="text-sm font-medium text-slate-500 max-w-xs mx-auto mt-2">
                  Estamos preparando el contenido de este curso. ¡Vuelve pronto para comenzar a aprender!
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex h-[600px] flex-col items-center justify-center text-center p-12 bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-slate-50 dark:border-slate-800 transform-gpu transition-all">
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-indigo-500 blur-3xl opacity-20 animate-pulse"></div>
              <div className="relative bg-gradient-to-tr from-indigo-600 to-purple-600 p-10 rounded-[2rem] shadow-2xl shadow-indigo-200 dark:shadow-none rotate-3 hover:rotate-0 transition-transform duration-500">
                <BookOpen className="h-16 w-16 text-white" />
              </div>
            </div>
            <h3 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-4">Elige tu destino</h3>
            <p className="text-lg font-medium text-slate-500 dark:text-slate-400 max-w-md leading-relaxed mb-10">
              Selecciona uno de nuestros cursos especializados en la barra lateral para desbloquear lecciones interactivas, tutoría IA y certificados oficiales.
            </p>
            <div className="flex gap-4">
               {courses.slice(0, 2).map((c, i) => (
                 <Badge key={i} variant="outline" className="px-4 py-2 border-slate-200 dark:border-slate-800 text-slate-400 font-black uppercase tracking-widest text-[10px]">
                    {c.title.split(' ')[0]}
                 </Badge>
               ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
