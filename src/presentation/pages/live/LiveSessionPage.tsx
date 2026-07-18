import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { apiClient } from '@/infrastructure/http/axios-client'
import { localTokenStorage } from '@/infrastructure/storage/local-token-storage'
import { useAuthStore } from '@/presentation/store/auth.store'
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  Users,
  Loader2,
  Sparkles,
  MessageSquare,
  Settings,
  Hand,
  MonitorUp,
  Layout,
  Maximize2,
  Signal,
  Wifi,
  MoreVertical
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/presentation/components/ui/card'
import { Button } from '@/presentation/components/ui/button'
import { Avatar, AvatarFallback } from '@/presentation/components/ui/avatar'
import { Badge } from '@/presentation/components/ui/badge'
import { cn } from '@/presentation/utils/cn'

interface Participant {
  user_id: number
  username: string
  is_teacher?: boolean
}

interface LiveSessionDetails {
  id: number
  title: string
  course_title?: string
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
  const [showChat, setShowChat] = useState(false)

  const socketRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    async function loadSession() {
      try {
        const res = await apiClient.get<LiveSessionDetails>(`/live-sessions/${id}/`)
        setSession(res.data)
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
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'
    const wsHost = apiBaseUrl.replace(/^https?:\/\//, '').replace(/\/api$/, '')
    const wsProto = apiBaseUrl.startsWith('https') ? 'wss:' : 'ws:'
    const wsUrl = `${wsProto}//${wsHost}/ws/live-session/${id}/?token=${token}`

    const ws = new WebSocket(wsUrl)
    socketRef.current = ws

    ws.onopen = () => setIsConnected(true)
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
    ws.onclose = () => setIsConnected(false)

    return () => ws.close()
  }, [session, id])

  const handleLeaveSession = () => {
    if (socketRef.current) socketRef.current.close()
    navigate('/classrooms')
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-background flex flex-col items-center justify-center z-50">
        <div className="relative mb-8">
           <div className="absolute -inset-4 bg-primary/20 blur-2xl rounded-full animate-pulse" />
           <Loader2 className="h-12 w-12 animate-spin text-primary relative" />
        </div>
        <h2 className="text-2xl font-black text-foreground tracking-tight">Preparando tu asiento...</h2>
        <p className="text-muted-foreground font-medium mt-2 animate-pulse uppercase tracking-widest text-[10px]">Conectando a los servidores de video</p>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="max-w-md mx-auto text-center py-20 space-y-6 animate-in zoom-in-95 duration-500">
        <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto text-rose-500">
           <PhoneOff size={40} />
        </div>
        <div>
          <h2 className="text-3xl font-black text-foreground tracking-tight">Sesión no encontrada</h2>
          <p className="text-muted-foreground font-medium mt-2">La sesión de tutoría ha finalizado o el enlace ya no es válido.</p>
        </div>
        <Button asChild className="rounded-2xl px-8 font-black shadow-lg">
          <Link to="/classrooms">Volver a Aulas</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col gap-6 animate-in fade-in duration-500 overflow-hidden">
      {/* Session Title Bar */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-2">
        <div className="flex items-center gap-4">
          <div className="relative">
             <div className="absolute -inset-1 bg-rose-500/20 blur-md rounded-full animate-pulse" />
             <div className="h-3 w-3 rounded-full bg-rose-600 relative ring-4 ring-rose-500/10" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-foreground flex items-center gap-2">
              Tutoría en Vivo: <span className="text-primary">{session.title}</span>
            </h1>
            <div className="flex items-center gap-3 mt-0.5">
                 <Badge variant="outline" className="text-[9px] font-black uppercase tracking-wider py-0 px-2 h-4 border-primary/30 text-primary">
                   Aula: {session.course_title || 'General'}
                 </Badge>
               <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">
                  {isConnected ? <Wifi className="h-3 w-3 text-emerald-500" /> : <Signal className="h-3 w-3 text-amber-500 animate-pulse" />}
                  {isConnected ? 'Señal Estable' : 'Reconectando...'}
               </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
           <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 text-muted-foreground hover:bg-muted/50">
              <Settings className="h-5 w-5" />
           </Button>
           <Button
             variant="destructive"
             onClick={handleLeaveSession}
             className="rounded-2xl px-6 font-black shadow-lg shadow-rose-500/20 flex items-center gap-2 h-10"
           >
             <PhoneOff className="h-4 w-4" /> Finalizar
           </Button>
        </div>
      </header>

      {/* Main Content Area: Video Grid + Sidebar */}
      <div className="flex-1 min-h-0 flex gap-6 overflow-hidden">
        
        {/* Videos Area */}
        <div className="flex-1 flex flex-col gap-4 min-w-0">
          <div className="flex-1 grid gap-4 grid-cols-1 md:grid-cols-2 min-h-0 overflow-y-auto pr-2 custom-scrollbar">
            
            {/* Primary Remote Teacher Video Frame */}
            <div className="relative rounded-[2.5rem] bg-slate-950 border-4 border-slate-900 overflow-hidden group shadow-2xl flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-bl from-rose-950/40 via-slate-950 to-indigo-950/40" />

              {/* Simulated Teacher Content */}
              <div className="relative z-10 text-center space-y-4">
                 <div className="h-24 w-24 rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-xl flex items-center justify-center text-4xl shadow-2xl animate-bounce duration-3000">
                   👨‍🏫
                 </div>
                 <div>
                    <p className="text-lg font-black text-white tracking-tight">Profesor JumpUp</p>
                    <Badge className="bg-rose-500/80 text-white border-none text-[9px] font-black uppercase tracking-widest px-2">Presentando</Badge>
                 </div>
              </div>

              {/* Overlays */}
              <div className="absolute top-6 right-6">
                 <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-black/20 backdrop-blur-md text-white border border-white/10 hover:bg-black/40">
                    <Maximize2 size={14} />
                 </Button>
              </div>
              <div className="absolute bottom-6 left-6 flex items-center gap-3 bg-black/40 backdrop-blur-xl px-4 py-2 rounded-2xl border border-white/10 shadow-lg">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-black text-white uppercase tracking-wider">Audio HD • Tutor Principal</span>
              </div>
            </div>

            {/* Local Video Frame */}
            <div className="relative rounded-[2.5rem] bg-slate-950 border-4 border-slate-900 overflow-hidden flex items-center justify-center group shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-950/40 via-slate-950 to-blue-950/40" />

              {videoEnabled ? (
                <div className="relative z-10 flex flex-col items-center justify-center gap-4">
                  <Avatar className="h-20 w-20 border-2 border-white/20 shadow-2xl scale-110">
                    <AvatarFallback className="bg-primary/20 text-primary text-2xl font-black backdrop-blur-md">
                      {user?.username.slice(0,2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-center">
                    <p className="text-sm font-black text-white tracking-tight">Tú ({user?.username})</p>
                    <span className="text-[10px] text-indigo-200/60 font-bold uppercase tracking-widest flex items-center justify-center gap-1.5 mt-1">
                      <Sparkles className="h-3 w-3" /> Transmisión En Vivo
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-slate-700 space-y-3">
                  <div className="h-16 w-16 rounded-full bg-slate-900 flex items-center justify-center border border-slate-800">
                    <VideoOff className="h-8 w-8" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">Cámara Inactiva</span>
                </div>
              )}
              
              <div className="absolute bottom-6 left-6 flex items-center gap-3 bg-black/40 backdrop-blur-xl px-4 py-2 rounded-2xl border border-white/10 shadow-lg">
                <span className="text-xs font-black text-white uppercase tracking-wider">{user?.username} (Yo)</span>
                {!micEnabled && (
                   <div className="bg-rose-500/20 p-1 rounded-lg">
                      <MicOff className="h-3.5 w-3.5 text-rose-500" />
                   </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Call Controls Bar */}
          <div className="flex justify-center items-center gap-6 bg-card/50 backdrop-blur-xl p-4 rounded-[2rem] border border-border shadow-2xl shadow-black/5">
            <div className="flex items-center gap-3 pr-6 border-r border-border/50">
               <Button variant="ghost" size="icon" className="h-11 w-11 rounded-full text-muted-foreground hover:bg-muted">
                  <Hand size={20} />
               </Button>
               <Button variant="ghost" size="icon" className="h-11 w-11 rounded-full text-muted-foreground hover:bg-muted">
                  <MonitorUp size={20} />
               </Button>
            </div>

            <div className="flex items-center gap-4">
              <Button
                variant={micEnabled ? 'secondary' : 'destructive'}
                size="icon"
                className={cn("h-14 w-14 rounded-full shadow-lg transition-all active:scale-95", micEnabled ? "bg-muted text-foreground" : "shadow-rose-500/20")}
                onClick={() => setMicEnabled(!micEnabled)}
              >
                {micEnabled ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
              </Button>

              <Button
                variant={videoEnabled ? 'secondary' : 'destructive'}
                size="icon"
                className={cn("h-14 w-14 rounded-full shadow-lg transition-all active:scale-95", videoEnabled ? "bg-muted text-foreground" : "shadow-rose-500/20")}
                onClick={() => setVideoEnabled(!videoEnabled)}
              >
                {videoEnabled ? <Video className="h-6 w-6" /> : <VideoOff className="h-6 w-6" />}
              </Button>
            </div>

            <div className="flex items-center gap-3 pl-6 border-l border-border/50">
               <Button
                 variant="ghost"
                 size="icon"
                 className={cn("h-11 w-11 rounded-full transition-colors", showChat ? "bg-primary/10 text-primary" : "text-muted-foreground")}
                 onClick={() => setShowChat(!showChat)}
               >
                  <MessageSquare size={20} />
               </Button>
               <Button variant="ghost" size="icon" className="h-11 w-11 rounded-full text-muted-foreground hover:bg-muted">
                  <Layout size={20} />
               </Button>
            </div>
          </div>
        </div>

        {/* Sidebar: Online Participants & Chat (Responsive) */}
        <div className={cn(
          "w-80 flex flex-col gap-6 transition-all duration-300 shrink-0",
          !showChat && "hidden md:flex"
        )}>
          <Card className="flex-1 flex flex-col border-none shadow-xl shadow-black/5 rounded-[2.5rem] overflow-hidden bg-card/70 backdrop-blur-md">
            <CardHeader className="p-6 pb-4 border-b border-border/50 bg-muted/20">
              <div className="flex items-center justify-between">
                 <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    Asistentes ({participants.length + 1})
                 </CardTitle>
                 <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                    <MoreVertical size={14} />
                 </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4 flex-1 overflow-y-auto space-y-3 custom-scrollbar">
              {/* Local student */}
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-primary/5 border border-primary/10 shadow-sm">
                <div className="relative">
                  <Avatar className="h-9 w-9 border-2 border-background shadow-sm">
                    <AvatarFallback className="bg-primary text-white text-[10px] font-black">
                      {user?.username.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-background" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-black text-foreground truncate">{user?.username} (Tú)</p>
                  <p className="text-[9px] font-bold text-primary uppercase tracking-tighter">Estudiante Activo</p>
                </div>
              </div>

              {/* Simulated Teacher */}
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-rose-500/5 border border-rose-500/10 shadow-sm">
                <div className="relative">
                  <Avatar className="h-9 w-9 border-2 border-background shadow-sm">
                    <AvatarFallback className="bg-rose-500 text-white text-[10px] font-black">P</AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-background" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-black text-foreground truncate">Profesor Nativo</p>
                  <p className="text-[9px] font-bold text-rose-500 uppercase tracking-tighter">Tutor Principal</p>
                </div>
              </div>

              <div className="py-2 flex items-center gap-2">
                 <div className="h-px flex-1 bg-border/50" />
                 <span className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.2em]">Compañeros</span>
                 <div className="h-px flex-1 bg-border/50" />
              </div>

              {/* Other connected participants via WS */}
              {participants.filter(p => p.username !== user?.username).map((part, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 rounded-2xl hover:bg-muted/50 transition-colors group">
                  <Avatar className="h-9 w-9 border border-border/50 grayscale group-hover:grayscale-0 transition-all">
                    <AvatarFallback className="text-[10px] font-black uppercase bg-muted">
                      {part.username.slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-black text-foreground/80 truncate">{part.username}</p>
                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-tighter">Estudiante</p>
                  </div>
                  <div className="h-2 w-2 rounded-full bg-emerald-500/50" />
                </div>
              ))}

              {participants.length === 0 && (
                <div className="text-center py-6">
                   <p className="text-[10px] font-bold text-muted-foreground italic uppercase">Nadie más está conectado</p>
                </div>
              )}
            </CardContent>

            <CardFooter className="p-6 pt-2 border-t border-border/50 bg-muted/10">
               <Button className="w-full rounded-xl text-[10px] font-black uppercase tracking-widest h-9 bg-card text-foreground border border-border shadow-sm hover:bg-muted">
                  Invitar Amigos
               </Button>
            </CardFooter>
          </Card>
        </div>

      </div>
    </div>
  )
}
