import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiClient } from '@/infrastructure/http/axios-client'
import { BookOpen, CheckCircle2, ChevronRight, PlayCircle, Loader2 } from 'lucide-react'
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
    <div className="grid gap-6 md:grid-cols-3">
      {/* Cursos List */}
      <div className="space-y-4 md:col-span-1">
        <h2 className="text-2xl font-bold tracking-tight">Cursos Disponibles</h2>
        <p className="text-sm text-muted-foreground mb-4">Elige un curso para ver su contenido.</p>
        
        <div className="space-y-3">
          {courses.map((course) => (
            <Card
              key={course.id}
              onClick={() => handleSelectCourse(course)}
              className={`cursor-pointer transition-all hover:border-primary/50 hover:shadow-sm ${
                selectedCourse?.id === course.id ? 'border-primary ring-2 ring-primary/10' : ''
              }`}
            >
              <CardHeader className="p-4">
                <div className="flex justify-between items-start gap-2">
                  <Badge variant="secondary">{course.difficulty_level}</Badge>
                  {course.language_info && (
                    <Badge variant="outline" className="bg-primary/5 text-primary-foreground border-primary/20">
                      {course.language_info.name}
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-base mt-2">{course.title}</CardTitle>
                <CardDescription className="line-clamp-2 text-xs font-normal mt-1">
                  {course.description}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>

      {/* Curso Detalle / Modulos */}
      <div className="md:col-span-2 space-y-4">
        {selectedCourse ? (
          <>
            <div className="border-b pb-4">
              <span className="text-xs uppercase font-semibold text-primary tracking-wider">Detalles de Curso</span>
              <h1 className="text-3xl font-extrabold text-card-foreground mt-1">{selectedCourse.title}</h1>
              <p className="text-muted-foreground mt-2 text-sm">{selectedCourse.description}</p>
            </div>

            {isLoadingModules ? (
              <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : modules.length > 0 ? (
              <div className="space-y-6">
                {modules.map((mod) => (
                  <Card key={mod.id}>
                    <CardHeader className="bg-muted/30 p-4 border-b">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
                          {mod.position}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{mod.title}</CardTitle>
                          <CardDescription className="text-xs font-normal">{mod.description}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="divide-y">
                        {mod.lessons && mod.lessons.length > 0 ? (
                          mod.lessons.map((lesson) => (
                            <div
                              key={lesson.id}
                              className="flex items-center justify-between p-4 hover:bg-muted/20 transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                {lesson.is_completed || completedLessonIds.includes(lesson.id) ? (
                                  <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                                ) : (
                                  <PlayCircle className="h-5 w-5 text-indigo-500 shrink-0" />
                                ) }
                                <div>
                                  <h4 className="font-semibold text-sm">{lesson.title}</h4>
                                  <p className="text-xs text-muted-foreground mt-0.5 capitalize">
                                    Tipo: {lesson.content_type} · Recompensa: {lesson.xp_reward} XP
                                  </p>
                                </div>
                              </div>
                              
                              <Button size="sm" variant={lesson.is_completed ? 'secondary' : 'default'} asChild>
                                <Link to={`/courses/${selectedCourse.id}/lessons/${lesson.id}`}>
                                  {lesson.is_completed ? 'Repasar' : 'Comenzar'}
                                  <ChevronRight className="ml-1 h-4 w-4" />
                                </Link>
                              </Button>
                            </div>
                          ))
                        ) : (
                          <div className="p-4 text-center text-sm text-muted-foreground">
                            No hay lecciones en este módulo aún.
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                No hay módulos disponibles para este curso todavía.
              </div>
            )}
          </>
        ) : (
          <div className="flex h-96 flex-col items-center justify-center border-2 border-dashed rounded-xl p-8 text-center text-muted-foreground">
            <BookOpen className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
            <h3 className="font-bold text-lg">Ningún curso seleccionado</h3>
            <p className="text-sm max-w-xs mt-1">
              Haz clic en alguno de los cursos en la barra lateral para ver su plan de estudios, módulos y lecciones.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
