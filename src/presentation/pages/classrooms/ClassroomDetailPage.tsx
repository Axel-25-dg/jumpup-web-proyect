import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { apiClient } from '@/infrastructure/http/axios-client'
import {
  BookOpen, Video, Users, ArrowLeft, Loader2, PlayCircle, CheckCircle2, Sparkles, AlertCircle, Download, FileText
} from 'lucide-react'
import { Button } from '@/presentation/components/ui/button'

interface ClassroomDetail {
  id: number
  name: string
  description?: string
  course?: number
  course_info?: { title: string; difficulty_level: string }
  teacher_info?: { username: string; email: string }
  total_students?: number
}

interface LiveSession {
  id: number
  title: string
  status: string
  scheduled_at: string
  duration_min?: number
  meeting_url?: string
}

interface Module {
  id: number
  title: string
  description: string
  position: number
  lessons?: Lesson[]
  resources?: any[]
}

interface Lesson {
  id: number
  title: string
  content_type: string
  xp_reward: number
  is_completed?: boolean
}

export default function ClassroomDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  
  const [classroom, setClassroom] = useState<ClassroomDetail | null>(null)
  const [liveSessions, setLiveSessions] = useState<LiveSession[]>([])
  const [modules, setModules] = useState<Module[]>([])
  const [completedLessonIds, setCompletedLessonIds] = useState<number[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      if (!id) return
      try {
        let classroomData = null;
        try {
          const classRes = await apiClient.get<ClassroomDetail>(`/classrooms/${id}/`)
          classroomData = classRes.data;
        } catch (err: any) {
          if (err.response?.status === 404 || err.response?.status === 403) {
            const mineRes = await apiClient.get<any>('/classrooms/mine/')
            const classArray = Array.isArray(mineRes.data) ? mineRes.data : (mineRes.data?.results || mineRes.data?.data || [])
            const found = classArray.find((c: any) => c.id === Number(id))
            if (found) {
              classroomData = found;
            } else {
              throw err;
            }
          } else {
            throw err;
          }
        }
        setClassroom(classroomData)

        // Fetch live sessions
        const liveRes = await apiClient.get<any>('/live-sessions/')
        const liveArray = Array.isArray(liveRes.data) ? liveRes.data : (liveRes.data?.results || [])
        const classroomSessions = liveArray.filter((s: any) => 
          (
            String(s.classroom) === String(id) || 
            String(s.classroom_id) === String(id) || 
            String(s.classroom?.id) === String(id) ||
            (classroomData?.course && (
              String(s.course) === String(classroomData.course) ||
              String(s.course_id) === String(classroomData.course) ||
              String(s.course?.id) === String(classroomData.course)
            ))
          ) && 
          (s.status === 'live' || s.status === 'scheduled' || s.status === 'upcoming')
        )
        setLiveSessions(classroomSessions)

        // Fetch progress
        const progressRes = await apiClient.get<any>('/progress/summary/').catch(() => ({ data: {} }))
        if (progressRes.data && Array.isArray(progressRes.data.completed_lesson_ids)) {
          setCompletedLessonIds(progressRes.data.completed_lesson_ids)
        }

        // Fetch course modules if assigned
        if (classroomData?.course) {
          const modulesRes = await apiClient.get<any>(`/modules/?course=${classroomData.course}`)
          const modulesData = Array.isArray(modulesRes.data) ? modulesRes.data : (modulesRes.data?.results || [])
          
          const modulesWithLessons = await Promise.all(
            modulesData.map(async (mod: any) => {
              const lessonsRes = await apiClient.get<any>(`/lessons/?module=${mod.id}`)
              const lessonsData = Array.isArray(lessonsRes.data) ? lessonsRes.data : (lessonsRes.data?.results || [])
              
              // Fetch resources for this module
              let resourcesData = []
              try {
                const resRes = await apiClient.get<any>(`/resources/?module=${mod.id}`)
                resourcesData = Array.isArray(resRes.data) ? resRes.data : (resRes.data?.results || [])
              } catch (e) {
                console.error("Error fetching resources", e)
              }

              return { ...mod, lessons: lessonsData, resources: resourcesData }
            })
          )
          setModules(modulesWithLessons.sort((a, b) => a.position - b.position))
        }

      } catch (err) {
        console.error('Error fetching classroom details:', err)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [id])

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
      </div>
    )
  }

  if (!classroom) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center space-y-4">
        <AlertCircle className="h-12 w-12 text-slate-400" />
        <h2 className="text-xl font-black uppercase text-slate-900 dark:text-white">Aula no encontrada</h2>
        <Button variant="outline" onClick={() => navigate('/classrooms')}>Volver a mis aulas</Button>
      </div>
    )
  }

  return (
    <div className="animate-in fade-in duration-500 min-h-screen bg-white dark:bg-[#0a0a0b]">
      {/* HERO SECTION */}
      <section className="border-b border-slate-900/10 dark:border-white/10 px-8 md:px-12 py-10 md:py-16 bg-slate-50 dark:bg-white/[0.02]">
        <div className="max-w-5xl mx-auto space-y-6">
          <Link to="/classrooms" className="inline-flex items-center gap-2 label-caps text-slate-400 hover:text-sky-500 transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" /> Volver a Aulas
          </Link>
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="chip">
                <Users className="h-3.5 w-3.5 text-sky-500" />
                Aula Virtual
              </div>
              {classroom.course_info && (
                <div className="chip border-sky-500/20 text-sky-600 bg-sky-500/5">
                  <BookOpen className="h-3.5 w-3.5" />
                  {classroom.course_info.title}
                </div>
              )}
            </div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white uppercase mb-4">
              {classroom.name}
            </h1>
            {classroom.description && (
              <p className="text-slate-500 dark:text-slate-400 font-medium max-w-2xl leading-relaxed">
                {classroom.description}
              </p>
            )}
          </div>
          
          <div className="flex flex-wrap gap-6 pt-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 border border-slate-900/10 dark:border-white/10 flex items-center justify-center bg-white dark:bg-white/5">
                <Users className="h-4 w-4 text-slate-400" />
              </div>
              <div>
                <p className="label-micro text-slate-400">ESTUDIANTES</p>
                <p className="font-bold text-slate-900 dark:text-white">{classroom.total_students || 1}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 border border-slate-900/10 dark:border-white/10 flex items-center justify-center bg-white dark:bg-white/5">
                <span className="font-black text-sky-500 text-lg">@</span>
              </div>
              <div>
                <p className="label-micro text-slate-400">INSTRUCTOR</p>
                <p className="font-bold text-slate-900 dark:text-white uppercase">{classroom.teacher_info?.username || 'ASIGNADO'}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-8 md:px-12 py-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* MAIN CONTENT (LESSONS) */}
        <div className="lg:col-span-2 space-y-10">
          <div>
            <h2 className="label-caps text-slate-400 tracking-[0.2em] font-black mb-6">Módulos y Lecciones</h2>
            {!classroom.course ? (
              <div className="text-center py-16 border border-dashed border-slate-900/20 dark:border-white/20">
                <BookOpen className="h-8 w-8 text-slate-300 mx-auto mb-4" />
                <h3 className="label-caps text-slate-900 dark:text-white">Aún no hay curso asignado</h3>
                <p className="text-xs text-slate-500 mt-2 max-w-xs mx-auto">
                  El profesor aún no ha vinculado el contenido a esta aula.
                </p>
              </div>
            ) : modules.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-slate-900/20 dark:border-white/20">
                <BookOpen className="h-8 w-8 text-slate-300 mx-auto mb-4" />
                <h3 className="label-caps text-slate-900 dark:text-white">Contenido en preparación</h3>
              </div>
            ) : (
              <div className="space-y-8">
                {modules.map((mod) => (
                  <div key={mod.id} className="space-y-4">
                    <div className="flex items-center gap-4">
                       <div className="flex h-8 w-8 shrink-0 items-center justify-center border border-slate-900 dark:border-white bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-xs">
                          {mod.position}
                       </div>
                       <div>
                          <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">{mod.title}</h3>
                       </div>
                    </div>

                    <div className="grid gap-px bg-slate-900/10 dark:border-white/10 border border-slate-900/10 dark:border-white/10">
                      {mod.lessons?.map((lesson) => {
                         const isCompleted = lesson.is_completed || completedLessonIds.includes(lesson.id)
                         return (
                          <div key={lesson.id} className="group flex items-center justify-between p-5 bg-white dark:bg-[#0a0a0b] card-hover">
                            <div className="flex items-center gap-4 min-w-0">
                              <div className={`flex h-8 w-8 shrink-0 items-center justify-center border ${
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
                                <div className="flex items-center gap-3 mt-0.5">
                                   <span className="label-micro text-slate-400">{lesson.content_type}</span>
                                   <span className="label-micro text-amber-500 flex items-center gap-1 font-bold">
                                      <Sparkles className="h-3 w-3" /> {lesson.xp_reward} XP
                                   </span>
                                </div>
                              </div>
                            </div>
                            <Button size="sm" variant="outline" asChild className={`rounded-none px-4 font-bold uppercase text-[10px] tracking-widest ${isCompleted ? 'border-emerald-500/30 text-emerald-600' : 'border-slate-900/10'}`}>
                              <Link to={`/courses/${classroom.course}/lessons/${lesson.id}`}>
                                {isCompleted ? 'Repasar' : 'Iniciar'}
                              </Link>
                            </Button>
                          </div>
                         )
                      })}

                      {mod.resources && mod.resources.length > 0 && (
                        <div className="bg-slate-50 dark:bg-white/[0.02] p-5 border-t border-slate-900/10 dark:border-white/10">
                          <h4 className="label-caps text-slate-400 mb-4">Recursos del Módulo</h4>
                          <div className="grid gap-2">
                            {mod.resources.map((res: any) => (
                              <a
                                key={res.id}
                                href={res.file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group flex items-center justify-between p-3 border border-slate-900/10 dark:border-white/10 bg-white dark:bg-[#0a0a0b] hover:border-sky-500/30 transition-colors"
                              >
                                <div className="flex items-center gap-3 min-w-0">
                                  <div className="flex h-8 w-8 shrink-0 items-center justify-center border border-slate-900/10 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-sky-500">
                                    <FileText className="h-4 w-4" />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="font-bold text-xs text-slate-900 dark:text-white truncate uppercase">{res.title}</p>
                                    <p className="label-micro text-slate-400 mt-0.5">{res.file_type || 'DOCUMENTO'}</p>
                                  </div>
                                </div>
                                <div className="h-8 w-8 flex items-center justify-center border border-slate-900/10 dark:border-white/10 text-slate-400 group-hover:bg-sky-500 group-hover:text-white group-hover:border-sky-500 transition-all shrink-0">
                                  <Download className="h-3 w-3" />
                                </div>
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* SIDEBAR (LIVE SESSIONS) */}
        <div className="space-y-10">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <span className="relative flex h-2.5 w-2.5 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-rose-500" />
              </span>
              <h2 className="label-caps text-slate-900 dark:text-white font-black tracking-widest">Sesiones en Vivo</h2>
            </div>
            
            {liveSessions.length === 0 ? (
              <div className="border border-slate-900/10 dark:border-white/10 p-6 bg-slate-50 dark:bg-white/[0.02]">
                <p className="label-micro text-slate-400 text-center">No hay reuniones programadas para esta aula.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {liveSessions.map((session) => (
                  <div key={session.id} className="border border-slate-900/10 dark:border-white/10 bg-white dark:bg-[#0a0a0b] p-6 hover:border-sky-500 transition-colors group">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex h-10 w-10 items-center justify-center border border-rose-500/20 bg-rose-500/5 text-rose-500 shrink-0 group-hover:bg-rose-500 group-hover:text-white transition-colors">
                        <Video className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{session.title}</h4>
                        <p className="label-micro text-slate-400 mt-1 font-mono">
                          {new Date(session.scheduled_at).toLocaleString('es-ES', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' }).toUpperCase()}
                        </p>
                      </div>
                    </div>
                    <Button className="w-full rounded-none bg-rose-500 hover:bg-rose-600 font-bold uppercase text-[10px] tracking-widest" asChild>
                      {session.meeting_url ? (
                        <a href={session.meeting_url} target="_blank" rel="noopener noreferrer">UNIRSE A LA REUNIÓN</a>
                      ) : (
                        <Link to={`/live/${session.id}`}>UNIRSE A LA REUNIÓN</Link>
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
