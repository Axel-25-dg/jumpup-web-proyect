import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiClient } from '@/infrastructure/http/axios-client'
import {
  Key, AlertCircle, CheckCircle, Video, Loader2, Users, BookOpen, ArrowRight
} from 'lucide-react'
import { Button } from '@/presentation/components/ui/button'

interface Classroom {
  id: number
  name: string
  access_code: string
  course_info?: { title: string; difficulty_level: string }
  teacher_info?: { username: string; email: string }
  total_students?: number
}

interface LiveSession {
  id: number
  title: string
  status: 'scheduled' | 'live' | 'ended' | 'cancelled'
  scheduled_at: string
  meeting_url?: string
}

export default function ClassroomsPage() {
  const [classrooms, setClassrooms] = useState<Classroom[]>([])
  const [liveSessions, setLiveSessions] = useState<LiveSession[]>([])
  const [accessCode, setAccessCode] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isJoining, setIsJoining] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  useEffect(() => {
    async function loadClassrooms() {
      try {
        const [classRes, liveRes] = await Promise.all([
          apiClient.get<Classroom[]>('/classrooms/mine/'),
          apiClient.get<LiveSession[]>('/live-sessions/')
        ])
        const classData = classRes.data as any
        const liveData = liveRes.data as any
        const classArray = Array.isArray(classData) ? classData : (classData?.data || classData?.results || [])
        const liveArray = Array.isArray(liveData) ? liveData : (liveData?.data || liveData?.results || [])
        
        setClassrooms(classArray)
        
        const enrolledClassroomIds = new Set(classArray.map((c: any) => String(c.id)))
        const enrolledCourseIds = new Set(classArray.map((c: any) => String(c.course || c.course_info?.id)).filter(Boolean))

        const filteredLive = liveArray.filter((session: any) => {
          const isStatusActive = session.status === 'live' || session.status === 'scheduled' || session.status === 'upcoming'
          if (!isStatusActive) return false

          const sessClassId = session.classroom || session.classroom_id
          const sessCourseId = session.course || session.course_id

          const isMatchingClass = sessClassId && enrolledClassroomIds.has(String(sessClassId))
          const isMatchingCourse = sessCourseId && enrolledCourseIds.has(String(sessCourseId))

          if (classArray.length > 0) {
            return isMatchingClass || isMatchingCourse
          }
          return true
        })

        setLiveSessions(filteredLive)
      } catch (err) {
        console.error('Error fetching classrooms data:', err)
      } finally {
        setIsLoading(false)
      }
    }
    loadClassrooms()
  }, [])

  const handleJoinClassroom = async () => {
    if (!accessCode.trim() || accessCode.length !== 8) {
      setErrorMsg('El código de acceso debe tener exactamente 8 caracteres.')
      return
    }
    setIsJoining(true)
    setErrorMsg('')
    setSuccessMsg('')
    try {
      await apiClient.post<{ message?: string; classroom?: Classroom }>('/classrooms/join/', {
        access_code: accessCode
      })
      setSuccessMsg('Te has unido exitosamente al aula.')
      setAccessCode('')
      const classRes = await apiClient.get<Classroom[]>('/classrooms/mine/')
      const classData = classRes.data as any
      const classArray = Array.isArray(classData) ? classData : (classData?.data || classData?.results || [])
      setClassrooms(classArray)
    } catch (err: any) {
      const detail = err.response?.data?.detail || err.response?.data?.error || 'No se pudo unir al aula. Verifica el código.'
      setErrorMsg(detail)
    } finally {
      setIsJoining(false)
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
    <div className="animate-in fade-in duration-500">
      {/* HERO */}
      <section className="border-b border-slate-900/10 dark:border-white/10 px-4 sm:px-8 md:px-12 py-10 md:py-16">
        <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-8">
          <div className="space-y-4">
            <div className="chip">
              <Users className="h-3.5 w-3.5 text-sky-500" />
              Estudiante
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white uppercase">
              Aulas <span className="text-sky-500">Virtuales</span>.
            </h1>
            <p className="text-sm sm:text-base leading-relaxed text-slate-600 dark:text-slate-300 max-w-lg font-medium">
              Participa en clases estructuradas por tus profesores y asiste a sesiones en vivo con tecnología de vanguardia.
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-px lg:grid-cols-3 bg-slate-900/10 dark:bg-white/10 border-b border-slate-900/10 dark:border-white/10">
        {/* JOIN FORM */}
        <div className="bg-white dark:bg-[#0a0a0b]">
          <div className="flex items-center gap-4 px-4 sm:px-8 py-8 border-b border-slate-900/10 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02]">
            <div className="flex h-12 w-12 items-center justify-center border border-slate-900/10 dark:border-white/10 bg-white dark:bg-transparent">
              <Key className="h-5 w-5 text-sky-500" />
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Acceso a Aula</h2>
              <p className="label-micro text-slate-400 dark:text-slate-500 font-mono">CÓDIGO DE 8 DÍGITOS REQUERIDO</p>
            </div>
          </div>

          <div className="px-4 sm:px-8 py-10 space-y-6">
            <div className="space-y-3">
              <label className="label-caps text-slate-400 dark:text-slate-500 block">Código de Inscripción</label>
              <input
                type="text"
                placeholder="ABC123D4"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                maxLength={8}
                className="w-full text-center tracking-[0.2em] sm:tracking-[0.4em] font-mono text-lg sm:text-xl border border-slate-900/10 dark:border-white/10 bg-transparent px-4 py-5 focus:outline-none focus:border-sky-500 dark:focus:border-sky-500 text-slate-900 dark:text-white placeholder:text-slate-200 dark:placeholder:text-slate-800 uppercase transition-all"
              />
            </div>

            {errorMsg && (
              <div className="flex items-start gap-3 p-4 border border-rose-500/20 bg-rose-500/5">
                <AlertCircle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                <p className="text-[11px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 leading-tight">{errorMsg}</p>
              </div>
            )}

            {successMsg && (
              <div className="flex items-start gap-3 p-4 border border-emerald-500/20 bg-emerald-500/5">
                <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 leading-tight">{successMsg}</p>
              </div>
            )}

            <Button
              className="w-full h-14 rounded-none bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black uppercase text-[11px] tracking-[0.2em] hover:bg-sky-500 dark:hover:bg-sky-500 hover:text-white transition-all gap-3"
              onClick={handleJoinClassroom}
              disabled={isJoining || accessCode.trim().length !== 8}
            >
              {isJoining ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> PROCESANDO...</>
              ) : (
                <>UNIRSE AL AULA <ArrowRight className="h-4 w-4" /></>
              )}
            </Button>
          </div>
        </div>

        {/* CLASSROOMS & LIVE SESSIONS */}
        <div className="lg:col-span-2 bg-[#f7f6f3] dark:bg-[#0a0a0b]">
          {/* Active Live Sessions */}
          <div className="border-b border-slate-900/10 dark:border-white/10 bg-white dark:bg-transparent">
            <div className="flex items-center gap-4 px-4 sm:px-8 md:px-10 py-6 border-b border-slate-900/10 dark:border-white/10">
              <span className="relative flex h-2.5 w-2.5 shrink-0">
                {liveSessions.length > 0 && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />}
                <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${liveSessions.length > 0 ? 'bg-rose-500' : 'bg-slate-300 dark:bg-slate-700'}`} />
              </span>
              <h2 className="label-caps text-slate-900 dark:text-white font-black tracking-widest text-xs sm:text-sm">Sesiones en Vivo</h2>
            </div>
            
            {liveSessions.length > 0 ? (
              <div className="divide-y divide-slate-900/10 dark:divide-white/10">
                {liveSessions.map((session) => (
                  <div key={session.id} className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 px-4 sm:px-8 md:px-10 py-6 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors group">
                    <div className="flex h-12 w-12 items-center justify-center border border-rose-500/20 bg-rose-500/5 shrink-0 group-hover:bg-rose-500 group-hover:text-white transition-colors">
                      <Video className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight truncate">{session.title}</h4>
                      <p className="label-micro text-slate-400 dark:text-slate-500 mt-1 font-mono">
                        {new Date(session.scheduled_at).toLocaleString('es-ES', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' }).toUpperCase()}
                      </p>
                    </div>
                    <Button size="sm" className="w-full sm:w-auto rounded-none bg-rose-500 hover:bg-rose-600 font-bold uppercase text-[10px] tracking-widest px-6" asChild>
                      {session.meeting_url ? (
                        <a href={session.meeting_url} target="_blank" rel="noopener noreferrer">ACCEDER</a>
                      ) : (
                        <Link to={`/live/${session.id}`}>ACCEDER</Link>
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-4 sm:px-8 md:px-10 py-8">
                <p className="label-micro text-slate-400 uppercase tracking-wider">No hay sesiones activas en este momento.</p>
              </div>
            )}
          </div>

          {/* My Classrooms */}
          <div className="px-4 sm:px-8 md:px-10 py-10">
            <h2 className="label-caps text-slate-400 dark:text-slate-500 mb-8 tracking-[0.2em] font-black text-xs sm:text-sm">Mis Aulas Inscritas</h2>
            {classrooms.length > 0 ? (
              <div className="grid gap-px sm:grid-cols-2 bg-slate-900/10 dark:bg-white/10 border border-slate-900/10 dark:border-white/10">
                {classrooms.map((cls) => (
                  <div key={cls.id} className="p-6 sm:p-8 bg-white dark:bg-[#0a0a0b] hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors group">
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex h-12 w-12 items-center justify-center border border-slate-900/10 dark:border-white/10 text-sky-500 group-hover:bg-sky-500 group-hover:text-white transition-all">
                        <BookOpen className="h-5 w-5" />
                      </div>
                      <span className="label-micro text-slate-400 dark:text-slate-500 font-mono tracking-widest border border-slate-900/10 dark:border-white/10 px-2 py-1 bg-slate-50 dark:bg-transparent">
                        ID: {cls.access_code}
                      </span>
                    </div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white tracking-tight uppercase leading-tight mb-1">{cls.name}</h3>
                    <p className="label-micro text-sky-500 font-bold tracking-widest uppercase mb-6">
                      {cls.course_info?.title || 'CURSO GENERAL'}
                    </p>

                    <div className="pt-6 border-t border-slate-900/5 dark:border-white/5 space-y-2">
                      <div className="flex justify-between items-center gap-2">
                        <span className="label-micro text-slate-400 shrink-0">INSTRUCTOR</span>
                        <span className="label-micro font-bold text-slate-700 dark:text-slate-300 truncate text-right">{cls.teacher_info?.username?.toUpperCase() || 'ASIGNADO'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="label-micro text-slate-400">COMUNIDAD</span>
                        <span className="label-micro font-bold text-slate-700 dark:text-slate-300">{cls.total_students || 1} ESTUDIANTES</span>
                      </div>
                    </div>

                    <Button variant="outline" className="w-full mt-8 rounded-none border-slate-900/10 font-black uppercase text-[10px] tracking-widest hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-slate-900 transition-all" asChild>
                      <Link to={`/classrooms/${cls.id}`}>ENTRAR AL AULA</Link>
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 border border-dashed border-slate-900/20 dark:border-white/20 bg-slate-50/30 dark:bg-transparent">
                <div className="flex h-20 w-20 items-center justify-center border border-slate-900/10 dark:border-white/10 mx-auto mb-8 bg-white dark:bg-transparent shadow-sm">
                  <BookOpen className="h-8 w-8 text-sky-500" />
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2">Sin Aulas Activas</h3>
                <p className="label-micro text-slate-400 dark:text-slate-500 max-w-xs mx-auto leading-relaxed">
                  AÚN NO ESTÁS INSCRITO EN NINGUNA AULA VIRTUAL. INTRODUCE UN CÓDIGO DE ACCESO PARA COMENZAR.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
