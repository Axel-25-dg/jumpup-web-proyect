import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiClient } from '@/infrastructure/http/axios-client'
import { Key, AlertCircle, CheckCircle, Video, Loader2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/presentation/components/ui/card'
import { Button } from '@/presentation/components/ui/button'
import { Badge } from '@/presentation/components/ui/badge'

interface Classroom {
  id: number
  name: string
  access_code: string
  course_info?: {
    title: string
    difficulty_level: string
  }
  teacher_info?: {
    username: string
    email: string
  }
  total_students?: number
}

interface LiveSession {
  id: number
  title: string
  status: 'scheduled' | 'live' | 'ended' | 'cancelled'
  scheduled_time: string
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
        setLiveSessions(liveArray.filter((session: any) => session.status === 'live' || session.status === 'scheduled'))
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
      setSuccessMsg('¡Te has unido exitosamente al aula!')
      setAccessCode('')
      // Volver a cargar la lista de aulas
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
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Aulas Virtuales</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Participa en clases estructuradas por tus profesores y asiste a sesiones en vivo.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Join Classroom sidebar form */}
        <div className="md:col-span-1 space-y-4">
          <Card className="border-indigo-100 shadow-sm">
            <CardHeader className="p-4">
              <CardTitle className="text-base flex items-center gap-1.5">
                <Key className="h-4 w-4 text-indigo-600" />
                Unirse a un Aula
              </CardTitle>
              <CardDescription className="text-xs">
                Ingresa el código de 8 dígitos proporcionado por tu profesor.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-3">
              <input
                type="text"
                placeholder="Código (Ej: ABC123D4)"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                maxLength={8}
                className="w-full text-center tracking-widest font-mono text-sm uppercase rounded-lg border bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
              />
              
              {errorMsg && (
                <div className="flex items-start gap-1.5 text-xs text-rose-600 font-medium">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="flex items-start gap-1.5 text-xs text-emerald-600 font-medium">
                  <CheckCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                  <span>{successMsg}</span>
                </div>
              )}
            </CardContent>
            <CardFooter className="p-3 bg-muted/10 border-t">
              <Button
                className="w-full text-xs"
                onClick={handleJoinClassroom}
                disabled={isJoining || accessCode.trim().length !== 8}
              >
                {isJoining ? 'Uniéndose...' : 'Unirse al Aula'}
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Classroom List & Active Live Sessions */}
        <div className="md:col-span-2 space-y-6">
          {/* Active Live Sessions block */}
          {liveSessions.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-bold text-sm text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Video className="h-4 w-4 text-rose-500 animate-pulse" />
                Clases en Vivo Programadas / Activas
              </h3>
              <div className="space-y-3">
                {liveSessions.map((session) => (
                  <Card key={session.id} className="border-rose-100 hover:border-rose-300 transition-all shadow-sm">
                    <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
                      <div>
                        <CardTitle className="text-base flex items-center gap-2">
                          {session.title}
                          {session.status === 'live' && (
                            <Badge className="bg-rose-500 text-white animate-pulse">EN VIVO</Badge>
                          )}
                        </CardTitle>
                        <CardDescription className="text-xs">
                          Inicio programado: {new Date(session.scheduled_time).toLocaleString()}
                        </CardDescription>
                      </div>
                      
                      <Button size="sm" className="bg-rose-500 hover:bg-rose-600 text-white text-xs" asChild>
                        <Link to={`/live/${session.id}`}>
                          Entrar a Tutoría
                        </Link>
                      </Button>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Regular Classrooms list */}
          <div className="space-y-3">
            <h3 className="font-bold text-sm text-muted-foreground uppercase tracking-wider">Mis Aulas</h3>
            {classrooms.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {classrooms.map((cls) => (
                  <Card key={cls.id} className="hover:shadow-sm transition-shadow">
                    <CardHeader className="p-4 pb-2">
                      <div className="flex justify-between items-start gap-1">
                        <Badge variant="outline">{cls.course_info?.difficulty_level || 'A1'}</Badge>
                        <span className="text-[10px] font-mono bg-muted px-2 py-0.5 rounded text-muted-foreground">
                          {cls.access_code}
                        </span>
                      </div>
                      <CardTitle className="text-base mt-2">{cls.name}</CardTitle>
                      <CardDescription className="text-xs truncate">
                        Curso: {cls.course_info?.title || 'General'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="text-xs text-muted-foreground space-y-1 mt-2">
                        <p>Profesor: <span className="font-semibold text-foreground">{cls.teacher_info?.username || 'Asignado'}</span></p>
                        <p className="truncate">Email: {cls.teacher_info?.email || 'N/D'}</p>
                        <p>Total de estudiantes: <span className="font-semibold text-foreground">{cls.total_students || 1}</span></p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground text-sm border border-dashed rounded-xl">
                Aún no estás inscrito en ninguna aula virtual. Introduce un código arriba para unirte.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
