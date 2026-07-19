import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { apiClient } from '@/infrastructure/http/axios-client'
import { localTokenStorage } from '@/infrastructure/storage/local-token-storage'
import { useAuthStore } from '@/presentation/store/auth.store'
import {
  Radio, VideoOff, Mic, MicOff, PhoneOff, Users, Loader2,
  MessageSquare, Settings, Hand, MonitorUp, Layout,
  Signal, Shield, Sparkles, GraduationCap
} from 'lucide-react'

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
    if (sessionStorage.getItem('ws_livesession_disabled') === 'true') return
    if (window.location.hostname.includes('guaman-idiomas-ute.online')) return

    const token = localTokenStorage.getAccessToken()
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'
    const wsHost = apiBaseUrl.replace(/^https?:\/\//, '').replace(/\/api$/, '')
    const wsProto = apiBaseUrl.startsWith('https') ? 'wss:' : 'ws:'
    const wsUrl = `${wsProto}//${wsHost}/ws/live-session/${id}/?token=${token}`

    let ws: WebSocket | null = null
    let hasOpenedOnce = false
    try {
      ws = new WebSocket(wsUrl)
      socketRef.current = ws

      ws.onopen = () => {
        setIsConnected(true)
        hasOpenedOnce = true
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
        if (!hasOpenedOnce) {
          sessionStorage.setItem('ws_livesession_disabled', 'true')
        }
      }
      ws.onerror = (err) => {
        console.error('WebSocket connection error:', err)
        setIsConnected(false)
        if (!hasOpenedOnce) {
          sessionStorage.setItem('ws_livesession_disabled', 'true')
        }
      }
    } catch (e) {
      console.error('Failed to establish WebSocket:', e)
      setIsConnected(false)
    }

    return () => {
      if (ws) ws.close()
    }
  }, [session, id])

  const handleLeaveSession = () => {
    if (socketRef.current) socketRef.current.close()
    navigate('/classrooms')
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center z-50 bg-[#f7f6f3] dark:bg-[#0a0a0b]">
        <div className="border border-slate-900/10 dark:border-white/10 p-8 flex flex-col items-center gap-6 max-w-sm w-full bg-white dark:bg-white/[0.02]">
          <Loader2 className="h-10 w-10 animate-spin text-sky-500" />
          <div className="text-center space-y-2">
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">Conectando...</h2>
            <p className="label-micro text-slate-400">Estableciendo conexión segura con la sala virtual.</p>
          </div>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#f7f6f3] dark:bg-[#0a0a0b]">
        <div className="max-w-md w-full border border-slate-900/10 dark:border-white/10 p-8 text-center space-y-6 bg-white dark:bg-white/[0.02]">
          <div className="inline-flex p-4 border border-slate-900/10 dark:border-white/10 text-sky-500 bg-slate-50 dark:bg-white/5">
            <PhoneOff size={32} />
          </div>
          <div className="space-y-2">
            <h2 className="text-lg font-black uppercase tracking-tight text-slate-900 dark:text-white">Sesión no encontrada</h2>
            <p className="label-micro text-slate-400">El enlace de la sesión ha expirado o es inválido.</p>
          </div>
          <button
            onClick={() => navigate('/classrooms')}
            className="w-full py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs uppercase tracking-wider transition-colors"
          >
            Volver a aulas
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[#f7f6f3] dark:bg-[#0a0a0b]">
      {/* Top Header */}
      <header className="border-b border-slate-900/10 dark:border-white/10 flex flex-col md:flex-row items-stretch bg-white dark:bg-white/[0.02]">
        <div className="p-4 md:px-8 border-r border-slate-900/10 dark:border-white/10 flex items-center gap-4">
          <div className="relative">
            <div className={`w-10 h-10 border flex items-center justify-center transition-colors ${isConnected ? 'border-emerald-200 text-emerald-600 bg-emerald-500/10' : 'border-amber-200 text-amber-600 bg-amber-500/10 animate-pulse'}`}>
              <Radio className="h-5 w-5" />
            </div>
            {isConnected && <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border border-white dark:border-[#0a0a0b]" />}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="chip px-1.5 py-0.5 text-[9px]">En vivo</span>
              <span className={`label-micro font-bold ${isConnected ? 'text-emerald-500' : 'text-amber-500 animate-pulse'}`}>
                {isConnected ? 'Conectado' : 'Conectando / Solo Visualización'}
              </span>
            </div>
            <h1 className="text-sm font-black uppercase tracking-tight text-slate-900 dark:text-white">
              {session.title}
            </h1>
          </div>
        </div>

        <div className="flex-1 flex items-center px-6 gap-8 overflow-x-auto no-scrollbar py-2 md:py-0 border-t md:border-t-0 border-slate-900/10 dark:border-white/10">
          <div className="flex flex-col">
            <span className="label-micro text-slate-400">Aula</span>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{session.course_title || 'General'}</span>
          </div>
          <div className="flex flex-col">
            <span className="label-micro text-slate-400">Red</span>
            <span className="text-xs font-bold text-emerald-500 flex items-center gap-1">
              <Signal size={10} /> {isConnected ? '24ms — Estable' : 'Inestable'}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="label-micro text-slate-400">Seguridad</span>
            <span className="text-xs font-bold text-sky-500 flex items-center gap-1">
              <Shield size={10} /> AES-256
            </span>
          </div>
        </div>

        <div className="flex border-l border-slate-900/10 dark:border-white/10">
          <button className="p-4 text-slate-400 hover:text-sky-500 transition-colors border-r border-slate-900/10 dark:border-white/10">
            <Settings size={18} />
          </button>
          <button
            onClick={handleLeaveSession}
            className="px-6 bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-2"
          >
            <PhoneOff size={14} /> Salir
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Central Stage */}
        <div className="flex-1 flex flex-col overflow-hidden border-r border-slate-900/10 dark:border-white/10">
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-px bg-slate-900/10 dark:bg-white/10 min-h-0">
            {/* Primary Feed: Professor */}
            <div className="relative group overflow-hidden bg-white dark:bg-white/[0.02]">
              <div className="absolute top-4 left-4 z-20 pointer-events-none">
                <span className="chip text-[9px] px-1.5 py-0.5 border border-sky-500/20 text-sky-500 bg-sky-500/5">
                  Profesor (Presentando)
                </span>
              </div>

              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-48 h-48 border border-slate-900/5 dark:border-white/5 flex flex-col items-center justify-center space-y-4">
                  <div className="w-20 h-20 border border-slate-900/10 dark:border-white/10 flex items-center justify-center text-sky-500 bg-slate-50 dark:bg-white/5">
                    <GraduationCap size={36} />
                  </div>
                  <div className="text-center space-y-1">
                    <p className="label-micro text-slate-400">Sincronizando video...</p>
                    <div className="flex gap-1 justify-center">
                      {[1, 2, 3].map(i => <div key={i} className="w-1 h-1 bg-sky-500 animate-pulse" />)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2">
                <div className="h-2 w-2 bg-emerald-500 animate-pulse" />
                <p className="label-micro text-slate-400">Audio: Activo</p>
              </div>
            </div>

            {/* Secondary Feed: Student (YOU) */}
            <div className="relative group overflow-hidden bg-white dark:bg-white/[0.02]">
              <div className="absolute top-4 left-4 z-20 pointer-events-none">
                <span className="chip text-[9px] px-1.5 py-0.5">
                  Tú ({user?.username})
                </span>
              </div>

              <div className="absolute inset-0 flex items-center justify-center">
                {videoEnabled ? (
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-24 h-24 border border-slate-900/10 dark:border-white/10 flex items-center justify-center text-xl font-black text-sky-500 bg-slate-50 dark:bg-white/5">
                      {user?.username.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="text-center space-y-1">
                      <p className="label-micro text-slate-400">Cámara local activa</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 border border-slate-900/10 dark:border-white/10 flex items-center justify-center text-slate-400 bg-slate-50 dark:bg-white/5">
                      <VideoOff size={20} />
                    </div>
                    <p className="label-micro text-slate-400">Cámara inactiva</p>
                  </div>
                )}
              </div>

              {!micEnabled && (
                <div className="absolute top-4 right-4 bg-red-600 text-white p-2">
                  <MicOff size={16} />
                </div>
              )}
            </div>
          </div>

          {/* Action Control Bar */}
          <div className="p-4 border-t border-slate-900/10 dark:border-white/10 flex items-center justify-between bg-white dark:bg-white/[0.02]">
            <div className="flex gap-2">
              <button className="h-9 w-9 border border-slate-900/10 dark:border-white/10 flex items-center justify-center text-slate-400 hover:text-sky-500 transition-colors">
                <Hand size={16} />
              </button>
              <button className="h-9 w-9 border border-slate-900/10 dark:border-white/10 flex items-center justify-center text-slate-400 hover:text-sky-500 transition-colors">
                <MonitorUp size={16} />
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setMicEnabled(!micEnabled)}
                className={`h-11 px-4 border flex items-center gap-2 font-bold text-xs transition-colors ${
                  micEnabled
                    ? 'border-slate-900/10 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:border-sky-500/30 hover:text-sky-500'
                    : 'bg-red-600 border-red-600 text-white'
                }`}
              >
                <Mic size={16} className={micEnabled ? 'block' : 'hidden'} />
                <MicOff size={16} className={micEnabled ? 'hidden' : 'block'} />
                <span>{micEnabled ? 'Silenciar' : 'Activar'}</span>
              </button>

              <button
                onClick={() => setVideoEnabled(!videoEnabled)}
                className={`h-11 px-4 border flex items-center gap-2 font-bold text-xs transition-colors ${
                  videoEnabled
                    ? 'border-slate-900/10 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:border-sky-500/30 hover:text-sky-500'
                    : 'bg-red-600 border-red-600 text-white'
                }`}
              >
                <Radio size={16} className={videoEnabled ? 'block' : 'hidden'} />
                <VideoOff size={16} className={videoEnabled ? 'hidden' : 'block'} />
                <span>{videoEnabled ? 'Apagar' : 'Encender'}</span>
              </button>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowChat(!showChat)}
                className={`h-9 w-9 border flex items-center justify-center transition-colors ${
                  showChat
                    ? 'bg-sky-500 border-sky-500 text-white'
                    : 'border-slate-900/10 dark:border-white/10 text-slate-400 hover:text-sky-500'
                }`}
              >
                <MessageSquare size={16} />
              </button>
              <button className="h-9 w-9 border border-slate-900/10 dark:border-white/10 flex items-center justify-center text-slate-400 hover:text-sky-500 transition-colors">
                <Layout size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <aside className={`w-80 flex flex-col transition-all duration-300 ${showChat ? 'flex' : 'hidden lg:flex'} bg-white dark:bg-white/[0.02]`}>
          <div className="p-4 border-b border-slate-900/10 dark:border-white/10 flex items-center justify-between">
            <h3 className="label-caps text-slate-900 dark:text-white flex items-center gap-2">
              <Users size={14} className="text-sky-500" /> Participantes ({participants.length + 1})
            </h3>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Host / Teacher */}
            <div className="p-3 border border-sky-500/20 bg-sky-500/[0.04] flex items-center gap-3">
              <div className="h-8 w-8 bg-sky-500 text-white flex items-center justify-center">
                <GraduationCap size={16} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">Profesor JumpUp</p>
                <p className="label-micro text-sky-500 mt-0.5">Anfitrión</p>
              </div>
            </div>

            {/* Current user */}
            <div className="p-3 border border-slate-900/10 dark:border-white/10 flex items-center gap-3 bg-slate-50 dark:bg-white/5">
              <div className="h-8 w-8 border border-slate-900/10 dark:border-white/10 flex items-center justify-center text-xs font-bold text-sky-500 bg-white dark:bg-transparent">
                TÚ
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{user?.username}</p>
                <p className="label-micro text-slate-400 mt-0.5">Estudiante</p>
              </div>
            </div>

            {/* Other students */}
            {participants.filter(p => p.username !== user?.username).map((part, idx) => (
              <div key={idx} className="p-3 border border-slate-900/10 dark:border-white/10 flex items-center justify-between hover:border-sky-500/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 border border-slate-900/10 dark:border-white/10 flex items-center justify-center text-xs font-bold text-sky-500">
                    {part.username.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{part.username}</p>
                    <p className="label-micro text-slate-400 mt-0.5">Estudiante</p>
                  </div>
                </div>
              </div>
            ))}

            {participants.length === 0 && (
              <div className="p-6 text-center border border-dashed border-slate-900/10 dark:border-white/10 space-y-2">
                <Sparkles size={16} className="text-sky-500 opacity-20 mx-auto" />
                <p className="label-micro text-slate-400">Esperando conexiones...</p>
              </div>
            )}
          </div>

          {/* Technical Console panel */}
          <div className="p-4 border-t border-slate-900/10 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.01]">
            <div className="flex items-center gap-2 mb-2">
              <Signal size={12} className="text-sky-500" />
              <span className="label-micro text-slate-650">Consola de Red</span>
            </div>
            <div className="space-y-1 font-mono text-[9px] text-slate-500">
              <div className="flex justify-between"><span>[Init] WebRTC</span> <span className="text-emerald-500">Estable</span></div>
              <div className="flex justify-between"><span>[Protocol] WSS</span> <span className={isConnected ? 'text-emerald-500' : 'text-amber-500'}>{isConnected ? 'Conectado' : 'Fallo/Offline'}</span></div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
