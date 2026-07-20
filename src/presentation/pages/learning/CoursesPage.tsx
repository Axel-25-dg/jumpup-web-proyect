import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiClient } from '@/infrastructure/http/axios-client'
import { BookOpen, CheckCircle2, ChevronRight, PlayCircle, Loader2, Trophy, Sparkles } from 'lucide-react'
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  useEffect(() => {
    // Auto-close sidebar on small screens
    const handleResize = () => {
      if (window.innerWidth < 1024) setIsSidebarOpen(false)
      else setIsSidebarOpen(true)
    }
    window.addEventListener('resize', handleResize)
    handleResize()
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    async function fetchInitialData() {
      try {
        const [coursesRes, progressRes, classRes] = await Promise.all([
          apiClient.get<Course[]>('/courses/'),
          apiClient.get<{ completed_lessons?: number[] } | any>('/progress/summary/').catch(() => ({ data: {} })),
          apiClient.get<any>('/classrooms/mine/')
        ])
        
        const classData = classRes.data as any
        const classArray = Array.isArray(classData) ? classData : (classData?.data || classData?.results || [])
        const allowedCourseIds = new Set(classArray.map((c: any) => c.course).filter(Boolean))

        const coursesData = coursesRes.data as any
        const coursesArray = Array.isArray(coursesData) ? coursesData : (coursesData?.data || coursesData?.results || [])
        const filteredCourses = coursesArray.filter((c: Course) => allowedCourseIds.has(c.id))
        
        setCourses(filteredCourses)
        
        const progressData = progressRes.data
        if (progressData && Array.isArray(progressData.completed_lesson_ids)) {
          setCompletedLessonIds(progressData.completed_lesson_ids)
        } else {
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
      const rawModulesData = modulesRes.data as any
      const modulesData: Module[] = Array.isArray(rawModulesData) ? rawModulesData : (rawModulesData?.data || rawModulesData?.results || [])

      const modulesWithLessons = await Promise.all(
        modulesData.map(async (mod) => {
          const lessonsRes = await apiClient.get<Lesson[]>(`/lessons/?module=${mod.id}`)
          const rawLessonsData = lessonsRes.data as any
          const lessonsData: Lesson[] = Array.isArray(rawLessonsData) ? rawLessonsData : (rawLessonsData?.data || rawLessonsData?.results || [])
          return {
            ...mod,
            lessons: lessonsData.map(l => ({
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
        <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
      </div>
    )
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-64px)] border border-slate-900/10 dark:border-white/10 bg-white dark:bg-white/[0.02] animate-in fade-in duration-500 relative">
      {/* Mobile Sidebar Toggle */}
      <Button
        variant="outline"
        size="sm"
        className="lg:hidden absolute top-4 left-4 z-20 gap-2"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        <BookOpen className="h-4 w-4" />
        {isSidebarOpen ? 'Cerrar Menú' : 'Ver Cursos'}
      </Button>

      {/* Sidebar de Cursos */}
      <aside className={`
        ${isSidebarOpen ? 'flex' : 'hidden'}
        lg:flex flex-col lg:w-80 border-r border-slate-900/10 dark:border-white/10
        absolute lg:relative z-10 bg-white dark:bg-[#0a0a0b] w-full h-full lg:h-auto
      `}>
        <div className="p-6 sm:p-8 border-b border-slate-900/10 dark:border-white/10 pt-16 lg:pt-8">
          <div className="chip mb-4">
            <BookOpen className="h-3.5 w-3.5 text-sky-500" />
            Academia
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Mis Cursos
          </h2>
          <p className="label-micro text-slate-400 dark:text-slate-500 mt-1">Tu progreso educativo</p>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-900/10 dark:divide-white/10">
          {courses.length === 0 ? (
            <div className="p-8 text-center">
              <p className="label-caps text-slate-400">Sin inscripciones</p>
              <Button asChild variant="outline" className="mt-4 w-full">
                <Link to="/classrooms">Ir a Aulas</Link>
              </Button>
            </div>
          ) : (
            courses.map((course) => (
              <button
                key={course.id}
                onClick={() => {
                  handleSelectCourse(course)
                  if (window.innerWidth < 1024) setIsSidebarOpen(false)
                }}
                className={`w-full text-left p-6 transition-all duration-200 group relative ${
                  selectedCourse?.id === course.id
                    ? 'bg-sky-500/[0.06] border-r-2 border-sky-500'
                    : 'hover:bg-sky-500/[0.04]'
                }`}
              >
                <div className="space-y-2">
                  <span className={`label-micro ${
                    selectedCourse?.id === course.id ? 'text-sky-500' : 'text-slate-400'
                  }`}>
                    {course.difficulty_level}
                  </span>
                  <h3 className={`font-bold text-sm leading-tight transition-colors ${
                    selectedCourse?.id === course.id ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'
                  }`}>
                    {course.title}
                  </h3>
                </div>
                {selectedCourse?.id === course.id && (
                  <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-sky-500" />
                )}
              </button>
            ))
          )}
        </div>

        {/* Gamification Widget - Editorial Style */}
        <div className="p-6 sm:p-8 border-t border-slate-900/10 dark:border-white/10 bg-slate-50 dark:bg-white/[0.01]">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center border border-slate-900/10 dark:border-white/10 bg-white dark:bg-white/5">
               <Trophy className="h-4 w-4 text-amber-500" />
            </div>
            <div>
              <p className="label-micro text-slate-400">Rango Actual</p>
              <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">Platino IV</h4>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between label-micro">
              <span className="text-slate-500">Nivel de Progreso</span>
              <span className="text-sky-500">75%</span>
            </div>
            <div className="h-1.5 w-full bg-slate-200 dark:bg-white/10 rounded-none">
              <div className="h-full bg-sky-500 w-[75%]"></div>
            </div>
          </div>
        </div>
      </aside>

      {/* Contenido Principal */}
      <main className="flex-1 min-w-0 pt-16 lg:pt-0">
        {selectedCourse ? (
          <div className="animate-in fade-in duration-500">
            <div className="p-6 sm:p-8 md:p-12 border-b border-slate-900/10 dark:border-white/10">
              <div className="flex flex-wrap items-center gap-2 mb-6">
                {selectedCourse.language_info && (
                  <span className="chip border-sky-500/20 text-sky-600 bg-sky-500/[0.05]">
                    {selectedCourse.language_info.name}
                  </span>
                )}
                <span className="chip">
                  {selectedCourse.difficulty_level}
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter leading-none mb-6 uppercase">
                {selectedCourse.title}
              </h1>
              <p className="text-base sm:text-lg text-slate-500 dark:text-slate-400 font-medium max-w-3xl leading-relaxed">
                {selectedCourse.description}
              </p>
            </div>

            <div className="p-4 sm:p-8 md:p-12">
              {isLoadingModules ? (
                <div className="flex flex-col h-64 items-center justify-center gap-4">
                  <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
                  <span className="label-caps text-slate-400">Cargando currículo...</span>
                </div>
              ) : modules.length > 0 ? (
                <div className="space-y-12">
                  {modules.map((mod) => (
                    <div key={mod.id} className="space-y-6">
                      <div className="flex items-center gap-4">
                         <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-slate-900 dark:border-white bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-sm">
                            {mod.position}
                         </div>
                         <div>
                            <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">{mod.title}</h2>
                            <p className="label-micro text-slate-400 mt-0.5">{mod.description}</p>
                         </div>
                      </div>

                      <div className="grid gap-px bg-slate-900/10 dark:bg-white/10 border border-slate-900/10 dark:border-white/10">
                        {mod.lessons?.map((lesson) => {
                           const isCompleted = lesson.is_completed || completedLessonIds.includes(lesson.id)
                           return (
                            <div
                              key={lesson.id}
                              className="group flex flex-col sm:flex-row sm:items-center justify-between p-6 bg-white dark:bg-[#0a0a0b] card-hover gap-4"
                            >
                              <div className="flex items-center gap-5 min-w-0">
                                <div className={`flex h-10 w-10 shrink-0 items-center justify-center border ${
                                  isCompleted
                                    ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-500'
                                    : 'border-slate-900/10 dark:border-white/10 text-slate-400'
                                }`}>
                                  {isCompleted ? <CheckCircle2 className="h-4 w-4" /> : <PlayCircle className="h-4 w-4" />}
                                </div>
                                <div className="min-w-0">
                                  <h4 className="font-bold text-slate-900 dark:text-white text-sm truncate uppercase tracking-tight">
                                    {lesson.title}
                                  </h4>
                                  <div className="flex items-center gap-4 mt-1">
                                     <span className="label-micro text-slate-400">
                                        {lesson.content_type}
                                     </span>
                                     <span className="label-micro text-amber-500 flex items-center gap-1 font-bold">
                                        <Sparkles className="h-3 w-3" />
                                        {lesson.xp_reward} XP
                                     </span>
                                  </div>
                                </div>
                              </div>

                              <Button
                                size="sm"
                                variant="outline"
                                asChild
                                className={`w-full sm:w-auto rounded-none px-6 font-bold uppercase text-[10px] tracking-widest transition-all ${
                                  isCompleted
                                    ? 'border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/5'
                                    : 'border-slate-900 dark:border-white hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-black'
                                }`}
                              >
                                <Link to={`/courses/${selectedCourse.id}/lessons/${lesson.id}`}>
                                  {isCompleted ? 'Repasar' : 'Comenzar'}
                                  <ChevronRight className="ml-1 h-3 w-3" />
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
                <div className="text-center py-20 px-6 border border-dashed border-slate-900/10 dark:border-white/10">
                  <BookOpen className="h-8 w-8 text-slate-300 mx-auto mb-4" />
                  <h3 className="label-caps text-slate-900 dark:text-white">Contenido en preparación</h3>
                  <p className="text-xs text-slate-500 mt-2 max-w-xs mx-auto">
                    Vuelve pronto para comenzar tu aprendizaje en este curso.
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex h-full min-h-[400px] flex-col items-center justify-center text-center p-8 sm:p-12 bg-slate-50 dark:bg-transparent">
            <div className="mb-8">
              <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center border-2 border-slate-900 dark:border-white">
                <BookOpen className="h-8 w-8 sm:h-10 sm:w-10 text-sky-500" />
              </div>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase mb-4">Selecciona un Curso</h3>
            <p className="label-caps text-slate-400 max-w-xs leading-relaxed">
              Explora tus clases activas desde el panel lateral para comenzar.
            </p>
          </div>
        )}
      </main>
    </div>
  )
}

