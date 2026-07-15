import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { apiClient } from '@/infrastructure/http/axios-client'
import { localTokenStorage } from '@/infrastructure/storage/local-token-storage'
import { useAuthStore } from '@/presentation/store/auth.store'
import { Video, VideoOff, Mic, MicOff, PhoneOff, Users, Loader2, Sparkles } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/presentation/components/ui/card'
import { Button } from '@/presentation/components/ui/button'

interface Participant {
  user_id: number
  username: string
  is_teacher?: boolean
}

interface LiveSessionDetails {
  id: number
  title: string
  classroom_info?: {
    name: string
  }
}

export default function LiveSessionPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const [session, setSession] = useState<LiveSessionDetails | null>(null)
  const [participants, setParticipants] = useState<Participant[]>([])
  
  const [micEnabled, setMicEnabled] = useState(true)
  const [videoEnabled, setVideoEnabled] = useState(true)
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const socketRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    async function loadSession() {
      try {
        const res = await apiClient.get<LiveSessionDetails>(`/live-sessions/${id}/`)
        setSession(res.data)
        
        // Report entry to session
        await apiClient.post(`/live-sessions/${id}/join/`)
      } catch (err) {
        console.error('Error loading live session details:', err)
      } finally {
        setIsLoading(false)
      }
    }
    loadSession()
  }, [id])

  useEffect(() => {
    if (!session) return

    const token = localTokenStorage.getAccessToken()
    const wsProto = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const wsUrl = `${wsProto}//localhost:8000/ws/live-session/${id}/?token=${token}`

    const ws = new WebSocket(wsUrl)
    socketRef.current = ws

    ws.onopen = () => {
      setIsConnected(true)
    }

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data.type === 'participants') {
          setParticipants(data.users || [])
        } else if (data.type === 'user_joined') {
          setParticipants((prev) => {
            if (prev.some((p) => p.user_id === data.user_id)) return prev
            return [...prev, { user_id: data.user_id, username: data.username }]
          })
        } else if (data.type === 'user_left') {
          setParticipants((prev) => prev.filter((p) => p.user_id !== data.user_id))
        }
      } catch (e) {
        console.error('Error parsing live session message:', e)
      }
    }

    ws.onclose = () => {
      setIsConnected(false)
    }

    return () => {
      ws.close()
    }
  }, [session, id])

  const handleLeaveSession = () => {
    if (socketRef.current) {
      socketRef.current.close()
    }
    navigate('/classrooms')
  }

  if (isLoading) {
    return (
      <div className="flex h-96 flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="text-sm text-muted-foreground mt-2">Ingresando a la tutoría...</span>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="max-w-md mx-auto text-center py-12 space-y-4">
        <h2 className="text-xl font-bold">Sesión no encontrada</h2>
        <p className="text-muted-foreground">La sesión de tutoría ha finalizado o no es válida.</p>
        <Button asChild>
          <Link to="/classrooms">Volver a Aulas</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Session Title Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-4">
        <div>
          <h1 className="text-2xl font-extrabold flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
            Tutoría en Vivo: {session.title}
          </h1>
          <p className="text-muted-foreground text-xs mt-0.5">
            Aula: {session.classroom_info?.name || 'General'} · Estado: {isConnected ? 'Conectado a la señalización' : 'Conectando...'}
          </p>
        </div>
        <Button variant="destructive" size="sm" onClick={handleLeaveSession} className="flex items-center gap-1.5">
          <PhoneOff className="h-4 w-4" /> Salir de la Clase
        </Button>
      </div>

      {/* Video Call Grid Layout */}
      <div className="grid gap-6 md:grid-cols-4">
        
        {/* Videos Area */}
        <div className="md:col-span-3 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            
            {/* Local Video Frame */}
            <div className="relative aspect-video rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden flex items-center justify-center text-white group shadow-md">
              {videoEnabled ? (
                /* Virtual stream simulation */
                <div className="absolute inset-0 bg-gradient-to-tr from-violet-950 via-indigo-900 to-blue-950 flex flex-col items-center justify-center p-4">
                  <div className="h-16 w-16 rounded-full bg-white/10 flex items-center justify-center font-bold text-xl backdrop-blur-md animate-pulse border border-white/20">
                    {user?.username.slice(0,2).toUpperCase()}
                  </div>
                  <span className="text-xs text-indigo-200 mt-3 flex items-center gap-1">
                    <Sparkles className="h-3.5 w-3.5" />
                    Transmitiendo cámara local
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-slate-500">
                  <VideoOff className="h-10 w-10 mb-2" />
                  <span className="text-xs font-semibold">Cámara Apagada</span>
                </div>
              )}
              
              <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5">
                <span>{user?.username} (Tú)</span>
                {!micEnabled && <MicOff className="h-3 w-3 text-rose-500" />}
              </div>
            </div>

            {/* Simulated Remote Teacher Video Frame */}
            <div className="relative aspect-video rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden flex items-center justify-center text-white group shadow-md">
              <div className="absolute inset-0 bg-gradient-to-bl from-rose-950 via-slate-900 to-indigo-950 flex flex-col items-center justify-center p-4">
                <div className="h-16 w-16 rounded-full bg-white/10 flex items-center justify-center font-bold text-xl backdrop-blur-md border border-white/20">
                  👨‍🏫
                </div>
                <span className="text-xs text-rose-200 mt-3">Profesor Nativo (Transmitiendo)</span>
              </div>

              <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5">
                <span>Profesor JumpUp</span>
              </div>
            </div>

          </div>

          {/* Action Call Controls */}
          <div className="flex justify-center items-center gap-4 bg-muted/30 p-4 rounded-2xl border">
            <Button
              variant={micEnabled ? 'outline' : 'destructive'}
              size="icon"
              className="h-12 w-12 rounded-full"
              onClick={() => setMicEnabled(!micEnabled)}
            >
              {micEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
            </Button>

            <Button
              variant={videoEnabled ? 'outline' : 'destructive'}
              size="icon"
              className="h-12 w-12 rounded-full"
              onClick={() => setVideoEnabled(!videoEnabled)}
            >
              {videoEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Sidebar: Online Participants */}
        <div className="md:col-span-1 space-y-4">
          <Card className="h-full flex flex-col">
            <CardHeader className="p-4 border-b">
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                Asistentes ({participants.length + 1})
              </CardTitle>
              <CardDescription className="text-xs">Personas activas en la videollamada.</CardDescription>
            </CardHeader>
            <CardContent className="p-3 flex-1 overflow-y-auto space-y-2">
              {/* Local student */}
              <div className="flex items-center gap-2.5 p-2 rounded-lg bg-primary/5 border border-primary/10">
                <div className="h-7 w-7 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs">
                  {user?.username.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold truncate">{user?.username} (Yo)</p>
                  <p className="text-[9px] text-muted-foreground font-medium">Estudiante</p>
                </div>
              </div>

              {/* Simulated Teacher */}
              <div className="flex items-center gap-2.5 p-2 rounded-lg bg-rose-500/5 border border-rose-500/10">
                <div className="h-7 w-7 rounded-full bg-rose-500 text-white flex items-center justify-center font-bold text-xs">
                  P
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold truncate">Profesor Nativo</p>
                  <p className="text-[9px] text-rose-500 font-semibold">Tutor Principal</p>
                </div>
              </div>

              {/* Other connected participants via WS */}
              {participants.filter(p => p.username !== user?.username).map((part, idx) => (
                <div key={idx} className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-muted transition-colors">
                  <div className="h-7 w-7 rounded-full bg-muted text-muted-foreground flex items-center justify-center font-bold text-xs">
                    {part.username.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold truncate">{part.username}</p>
                    <p className="text-[9px] text-muted-foreground font-medium">Estudiante</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  )
}
