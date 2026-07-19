import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { apiClient } from '@/infrastructure/http/axios-client'
import { localTokenStorage } from '@/infrastructure/storage/local-token-storage'
import { useAuthStore } from '@/presentation/store/auth.store'
import {
  Radio, VideoOff, Mic, MicOff, PhoneOff, Users, Loader2,
  MessageSquare, Settings, Hand, MonitorUp, Layout,
  Signal, Shield, Sparkles
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
  
  // WebRTC Refs
  const localStreamRef = useRef<MediaStream | null>(null)
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const peerConnections = useRef<Record<number, RTCPeerConnection>>({})
  const [remoteStreams, setRemoteStreams] = useState<Record<number, MediaStream>>({})
  const remoteVideoRefs = useRef<Record<number, HTMLVideoElement | null>>({})

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

  // Get User Media ON MOUNT
  useEffect(() => {
    async function initMedia() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        localStreamRef.current = stream
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream
        }
      } catch (err) {
        console.error('Error accessing media devices.', err)
      }
    }
    initMedia()

    return () => {
      localStreamRef.current?.getTracks().forEach(track => track.stop())
    }
  }, [])

  useEffect(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach(track => track.enabled = micEnabled)
    }
  }, [micEnabled])

  useEffect(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach(track => track.enabled = videoEnabled)
    }
  }, [videoEnabled])

  useEffect(() => {
    if (!session) return

    const token = localTokenStorage.getAccessToken()
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'
    const wsHost = apiBaseUrl.replace(/^https?:\/\//, '').replace(/\/api$/, '')
    const wsProto = apiBaseUrl.startsWith('https') ? 'wss:' : 'ws:'
    const wsUrl = `${wsProto}//${wsHost}/ws/live-session/${id}/?token=${token}`

    let ws: WebSocket | null = null

    const rtcConfig = {
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    }

    const createPeerConnection = (targetUserId: number) => {
      if (peerConnections.current[targetUserId]) return peerConnections.current[targetUserId]

      const pc = new RTCPeerConnection(rtcConfig)
      peerConnections.current[targetUserId] = pc

      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => {
          pc.addTrack(track, localStreamRef.current!)
        })
      }

      pc.onicecandidate = (event) => {
        if (event.candidate && ws && ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({
            type: 'webrtc_signal',
            target_user_id: targetUserId,
            signal: { type: 'ice_candidate', candidate: event.candidate }
          }))
        }
      }

      pc.ontrack = (event) => {
        const stream = event.streams[0]
        setRemoteStreams(prev => {
          const next = { ...prev, [targetUserId]: stream }
          return next
        })
      }

      return pc
    }

    try {
      ws = new WebSocket(wsUrl)
      socketRef.current = ws

      ws.onopen = () => {
        setIsConnected(true)
      }
      ws.onmessage = async (event) => {
        try {
          const data = JSON.parse(event.data)
          if (data.type === 'participants') {
            setParticipants(data.users || [])
            // Optionally: Initiate connection with already present participants
            // but usually we rely on user_joined or existing participants sending offers
          } else if (data.type === 'user_joined') {
            setParticipants((prev) => {
              if (prev.some((p) => p.user_id === data.user_id)) return prev
              return [...prev, { user_id: data.user_id, username: data.username }]
            })
            // We initiate the offer to the newly joined user
            const pc = createPeerConnection(data.user_id)
            const offer = await pc.createOffer()
            await pc.setLocalDescription(offer)
            if (ws && ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({
                type: 'webrtc_signal',
                target_user_id: data.user_id,
                signal: offer
              }))
            }
          } else if (data.type === 'user_left') {
            setParticipants((prev) => prev.filter((p) => p.user_id !== data.user_id))
            const pc = peerConnections.current[data.user_id]
            if (pc) pc.close()
            delete peerConnections.current[data.user_id]
            setRemoteStreams(prev => {
              const next = { ...prev }
              delete next[data.user_id]
              return next
            })
          } else if (data.type === 'webrtc_signal') {
            const senderId = data.sender_id
            const signal = data.signal
            if (!senderId || !signal) return

            let pc = peerConnections.current[senderId]
            if (!pc) {
              pc = createPeerConnection(senderId)
            }

            if (signal.type === 'offer') {
              await pc.setRemoteDescription(new RTCSessionDescription(signal))
              const answer = await pc.createAnswer()
              await pc.setLocalDescription(answer)
              if (ws && ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({
                  type: 'webrtc_signal',
                  target_user_id: senderId,
                  signal: answer
                }))
              }
            } else if (signal.type === 'answer') {
              await pc.setRemoteDescription(new RTCSessionDescription(signal))
            } else if (signal.type === 'ice_candidate') {
              await pc.addIceCandidate(new RTCIceCandidate(signal.candidate))
            }
          }
        } catch (e) {
          console.error('Error processing live session message:', e)
        }
      }
      ws.onclose = () => {
        setIsConnected(false)
      }
      ws.onerror = (err) => {
        console.error('WebSocket connection error:', err)
        setIsConnected(false)
      }
    } catch (e) {
      console.error('Failed to establish WebSocket:', e)
      setIsConnected(false)
    }

    return () => {
      if (ws) ws.close()
      Object.values(peerConnections.current).forEach(pc => pc.close())
      peerConnections.current = {}
    }
  }, [session, id])

  // Bind remote streams to video elements whenever remoteStreams state changes
  useEffect(() => {
    Object.entries(remoteStreams).forEach(([userId, stream]) => {
      const videoEl = remoteVideoRefs.current[Number(userId)]
      if (videoEl && videoEl.srcObject !== stream) {
        videoEl.srcObject = stream
      }
    })
  }, [remoteStreams])

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
                {isConnected ? 'Conectado' : 'Conectando'}
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
              <Signal size={10} /> {isConnected ? 'WebRTC Estable' : 'Inestable'}
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
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-px bg-slate-900/10 dark:bg-white/10 min-h-0 overflow-y-auto">
            
            {/* Primary Feed: Local User */}
            <div className="relative group overflow-hidden bg-black min-h-[300px]">
              <div className="absolute top-4 left-4 z-20 pointer-events-none">
                <span className="chip text-[9px] px-1.5 py-0.5 border border-sky-500/20 text-sky-500 bg-sky-500/20">
                  Tú ({user?.username})
                </span>
              </div>
              
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted // local video MUST be muted to prevent feedback loop
                className={`w-full h-full object-cover transition-opacity ${videoEnabled ? 'opacity-100' : 'opacity-0'}`}
              />

              {!videoEnabled && (
                 <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 border border-white/10 rounded-full flex items-center justify-center text-white bg-white/5">
                        <VideoOff size={24} />
                      </div>
                      <p className="label-micro text-white">Cámara inactiva</p>
                    </div>
                 </div>
              )}

              {!micEnabled && (
                <div className="absolute top-4 right-4 bg-red-600 text-white p-2 rounded-full">
                  <MicOff size={16} />
                </div>
              )}
            </div>

            {/* Remote Feeds */}
            {participants.filter(p => p.user_id !== user?.user_id && p.user_id !== (user as any)?.id).map((part) => (
              <div key={part.user_id} className="relative group overflow-hidden bg-black min-h-[300px]">
                <div className="absolute top-4 left-4 z-20 pointer-events-none">
                  <span className="chip text-[9px] px-1.5 py-0.5 bg-black/50 text-white backdrop-blur-md">
                    {part.username} {part.is_teacher && '(Profesor)'}
                  </span>
                </div>

                <video
                  ref={(el) => { remoteVideoRefs.current[part.user_id] = el }}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />

                {!remoteStreams[part.user_id] && (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="w-8 h-8 text-sky-500 animate-spin" />
                      <p className="label-micro text-white">Conectando video...</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
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
            {/* Current user */}
            <div className="p-3 border border-slate-900/10 dark:border-white/10 flex items-center gap-3 bg-slate-50 dark:bg-white/5">
              <div className="h-8 w-8 border border-slate-900/10 dark:border-white/10 flex items-center justify-center text-xs font-bold text-sky-500 bg-white dark:bg-transparent">
                TÚ
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{user?.username}</p>
                <p className="label-micro text-slate-400 mt-0.5">Tú</p>
              </div>
            </div>

            {/* Other participants */}
            {participants.filter(p => p.user_id !== user?.user_id && p.user_id !== (user as any)?.id).map((part, idx) => (
              <div key={idx} className="p-3 border border-slate-900/10 dark:border-white/10 flex items-center justify-between hover:border-sky-500/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 border border-slate-900/10 dark:border-white/10 flex items-center justify-center text-xs font-bold text-sky-500">
                    {part.username.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{part.username}</p>
                    <p className="label-micro text-slate-400 mt-0.5">{part.is_teacher ? 'Profesor' : 'Estudiante'}</p>
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
              <span className="label-micro text-slate-650">Consola WebRTC</span>
            </div>
            <div className="space-y-1 font-mono text-[9px] text-slate-500">
              <div className="flex justify-between"><span>[Local]</span> <span className="text-emerald-500">Activo</span></div>
              <div className="flex justify-between"><span>[Peers]</span> <span>{Object.keys(remoteStreams).length} conectados</span></div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
