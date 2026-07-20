import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { apiClient } from '@/infrastructure/http/axios-client'
import { localTokenStorage } from '@/infrastructure/storage/local-token-storage'
import { useAuthStore } from '@/presentation/store/auth.store'
import {
  Radio, VideoOff, Mic, MicOff, PhoneOff, Users, Loader2,
  MessageSquare, Settings, Hand, MonitorUp, Layout,
  Signal, Shield, Sparkles, ArrowRight
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
  const [sidebarTab, setSidebarTab] = useState<'chat' | 'participants'>('chat')
  const [messages, setMessages] = useState<{sender: string, text: string, time: string}[]>([])
  const [chatInput, setChatInput] = useState('')
  const [isScreenSharing, setIsScreenSharing] = useState(false)

  const socketRef = useRef<WebSocket | null>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)

  // WebRTC Refs
  const localStreamRef = useRef<MediaStream | null>(null)
  const screenStreamRef = useRef<MediaStream | null>(null)
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const peerConnections = useRef<Record<number, RTCPeerConnection>>({})
  const [remoteStreams, setRemoteStreams] = useState<Record<number, MediaStream>>({})
  const remoteVideoRefs = useRef<Record<number, HTMLVideoElement | null>>({})

  // ... (loadSession useEffect stays same)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, showChat])

  const handleSendMessage = () => {
    if (!chatInput.trim() || !socketRef.current) return
    const msg = {
      type: 'chat_message',
      message: chatInput,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
    socketRef.current.send(JSON.stringify(msg))
    setMessages(prev => [...prev, { sender: 'Tú', text: chatInput, time: msg.timestamp }])
    setChatInput('')
  }

  const toggleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true })
        screenStreamRef.current = stream
        const videoTrack = stream.getVideoTracks()[0]

        // Replace track in all peer connections
        Object.values(peerConnections.current).forEach(pc => {
          const sender = pc.getSenders().find(s => s.track?.kind === 'video')
          if (sender) sender.replaceTrack(videoTrack)
        })

        if (localVideoRef.current) localVideoRef.current.srcObject = stream

        videoTrack.onended = () => stopScreenShare()
        setIsScreenSharing(true)
      } else {
        stopScreenShare()
      }
    } catch (err) {
      console.error("Error sharing screen:", err)
    }
  }

  const stopScreenShare = () => {
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(t => t.stop())
    }
    const videoTrack = localStreamRef.current?.getVideoTracks()[0]
    if (videoTrack) {
      Object.values(peerConnections.current).forEach(pc => {
        const sender = pc.getSenders().find(s => s.track?.kind === 'video')
        if (sender) sender.replaceTrack(videoTrack)
      })
      if (localVideoRef.current) localVideoRef.current.srcObject = localStreamRef.current
    }
    setIsScreenSharing(false)
  }

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

    // Mejoramos la lógica de extracción del host para evitar problemas de resolución
    const wsHost = apiBaseUrl.replace(/^https?:\/\//, '').replace(/\/api$/, '')
    const wsProto = apiBaseUrl.startsWith('https') ? 'wss:' : 'ws:'

    // Aseguramos que la URL termine en / antes del query param para Django Channels
    const wsUrl = `${wsProto}//${wsHost}/ws/live-session/${id}/${token ? `?token=${token}` : ''}`

    let ws: WebSocket | null = null
    let reconnectTimeout: any

    const rtcConfig: RTCConfiguration = {
      iceServers: [
        {
          urls: [
            'stun:stun.l.google.com:19302',
            'stun:stun1.l.google.com:19302'
          ]
        },
        {
          urls: 'turn:178.105.61.61:3478',
          username: 'admin',
          credential: 'admin1234'
        }
      ],
      iceTransportPolicy: 'all'
    }

    const createPeerConnection = (targetUserId: number) => {
      if (peerConnections.current[targetUserId]) return peerConnections.current[targetUserId]

      const pc = new RTCPeerConnection(rtcConfig)
      peerConnections.current[targetUserId] = pc

      // Add tracks from local stream
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => {
          // If we are screen sharing, we should send the screen track instead of the camera track
          let trackToSend = track
          if (track.kind === 'video' && isScreenSharing && screenStreamRef.current) {
            const screenTrack = screenStreamRef.current.getVideoTracks()[0]
            if (screenTrack) trackToSend = screenTrack
          }
          pc.addTrack(trackToSend, localStreamRef.current!)
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

    const connect = () => {
      if (ws) {
        ws.close()
      }

      try {
        console.log('Intentando conectar a WebSocket:', wsUrl)
        ws = new WebSocket(wsUrl)
        socketRef.current = ws

        ws.onopen = () => {
          console.log('WebSocket conectado con éxito')
          setIsConnected(true)
        }

        ws.onmessage = async (event) => {
          try {
            const data = JSON.parse(event.data)
            if (data.type === 'participants') {
              setParticipants(data.users || [])
            } else if (data.type === 'user_joined') {
              setParticipants((prev) => {
                if (prev.some((p) => p.user_id === data.user_id)) return prev
                return [...prev, {
                  user_id: data.user_id,
                  username: data.username,
                  is_teacher: data.is_teacher
                }]
              })
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
            } else if (data.type === 'chat_message') {
              setMessages(prev => [...prev, {
                sender: data.username || 'Sistema',
                text: data.message,
                time: data.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              }])
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
            console.error('Error procesando mensaje:', e)
          }
        }

        ws.onclose = (e) => {
          setIsConnected(false)
          console.log('WebSocket cerrado. Reintentando en 3s...', e.reason)
          reconnectTimeout = setTimeout(connect, 3000)
        }

        ws.onerror = (err) => {
          console.error('Error de WebSocket:', err)
          ws?.close()
        }
      } catch (e) {
        console.error('Error al instanciar WebSocket:', e)
        reconnectTimeout = setTimeout(connect, 3000)
      }
    }

    connect()

    return () => {
      if (ws) ws.close()
      clearTimeout(reconnectTimeout)
      Object.values(peerConnections.current).forEach(pc => pc.close())
      peerConnections.current = {}
    }
  }, [session, id])

  // Bind remote streams to video elements whenever remoteStreams or participants change
  useEffect(() => {
    participants.forEach(p => {
      const stream = remoteStreams[p.user_id]
      const videoEl = remoteVideoRefs.current[p.user_id]
      if (videoEl && stream && videoEl.srcObject !== stream) {
        videoEl.srcObject = stream
      }
    })
  }, [remoteStreams, participants])

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
    <div className="h-screen flex flex-col overflow-hidden bg-[#f7f6f3] dark:bg-[#0a0a0b] safe-area-inset-top">
      {/* Top Header */}
      <header className="border-b border-slate-900/10 dark:border-white/10 flex flex-col md:flex-row items-stretch bg-white dark:bg-white/[0.02] z-20">
        <div className="p-3 md:p-4 md:px-8 border-r border-slate-900/10 dark:border-white/10 flex items-center justify-between md:justify-start gap-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className={`w-9 h-9 md:w-10 md:h-10 border flex items-center justify-center transition-colors ${isConnected ? 'border-emerald-200 text-emerald-600 bg-emerald-500/10' : 'border-amber-200 text-amber-600 bg-amber-500/10 animate-pulse'}`}>
                <Radio className="h-4 w-4 md:h-5 md:w-5" />
              </div>
              {isConnected && <div className="absolute -top-0.5 -right-0.5 w-2 h-2 md:w-2.5 md:h-2.5 bg-emerald-500 border border-white dark:border-[#0a0a0b]" />}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="chip px-1 py-0 text-[8px] md:text-[9px]">En vivo</span>
                <span className={`text-[9px] md:label-micro font-bold ${isConnected ? 'text-emerald-500' : 'text-amber-500 animate-pulse'}`}>
                  {isConnected ? 'Conectado' : 'Conectando'}
                </span>
              </div>
              <h1 className="text-xs md:text-sm font-black uppercase tracking-tight text-slate-900 dark:text-white line-clamp-1">
                {session.title}
              </h1>
            </div>
          </div>

          <div className="flex md:hidden gap-1">
            <button className="p-2 text-slate-400">
              <Settings size={16} />
            </button>
            <button onClick={handleLeaveSession} className="p-2 text-red-500">
              <PhoneOff size={16} />
            </button>
          </div>
        </div>

        <div className="hidden md:flex flex-1 items-center px-6 gap-8 overflow-x-auto no-scrollbar py-2 md:py-0 border-t md:border-t-0 border-slate-900/10 dark:border-white/10">
          <div className="flex flex-col">
            <span className="label-micro text-slate-400">Aula</span>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{session.course_title || 'General'}</span>
          </div>
          <div className="flex flex-col">
            <span className="label-micro text-slate-400">Red</span>
            <span className="text-xs font-bold text-emerald-500 flex items-center gap-1">
              <Signal size={10} /> WebRTC Estable
            </span>
          </div>
          <div className="flex flex-col">
            <span className="label-micro text-slate-400">Seguridad</span>
            <span className="text-xs font-bold text-sky-500 flex items-center gap-1">
              <Shield size={10} /> AES-256
            </span>
          </div>
        </div>

        <div className="hidden md:flex border-l border-slate-900/10 dark:border-white/10">
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
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {/* Central Stage */}
        <div className={`flex-1 flex flex-col overflow-hidden border-r border-slate-900/10 dark:border-white/10 relative transition-all duration-300 ${
          showChat ? 'h-[40vh] md:h-full' : 'h-full'
        }`}>
          <div className={`flex-1 grid gap-px bg-slate-900/10 dark:bg-white/10 min-h-0 overflow-y-auto ${
            participants.length <= 1 ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'
          }`}>
            
            {/* Primary Feed: Local User */}
            <div className={`relative group overflow-hidden bg-black ${participants.length === 1 ? 'h-full' : 'h-[40vh] md:h-full'}`}>
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
            {participants.filter(p => p.user_id !== user?.user_id).map((part) => (
              <div key={part.user_id} className="relative group overflow-hidden bg-black min-h-[200px] md:min-h-[300px]">
                <div className="absolute top-3 left-3 md:top-4 md:left-4 z-20 pointer-events-none">
                  <span className="chip text-[8px] md:text-[9px] px-1.5 py-0.5 bg-black/50 text-white backdrop-blur-md">
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
                      <div className="relative">
                         <div className="w-10 h-10 border border-white/10 rounded-full flex items-center justify-center">
                            <Loader2 className="w-5 h-5 text-sky-500 animate-spin" />
                         </div>
                      </div>
                      <p className="label-micro text-white/50 uppercase tracking-widest">Conectando...</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Action Control Bar */}
          <div className="p-3 md:p-4 border-t border-slate-900/10 dark:border-white/10 flex items-center justify-between bg-white dark:bg-white/[0.02] z-20">
            <div className="flex gap-1 md:gap-2">
              <button className="h-8 w-8 md:h-9 md:w-9 border border-slate-900/10 dark:border-white/10 flex items-center justify-center text-slate-400 hover:text-sky-500 transition-colors bg-white dark:bg-transparent">
                <Hand size={14} />
              </button>
              <button
                onClick={toggleScreenShare}
                className={`h-8 w-8 md:h-9 md:w-9 border flex items-center justify-center transition-colors bg-white dark:bg-transparent ${
                  isScreenSharing ? 'bg-sky-500 border-sky-500 text-white' : 'border-slate-900/10 dark:border-white/10 text-slate-400 hover:text-sky-500'
                }`}
              >
                <MonitorUp size={14} />
              </button>
            </div>

            <div className="flex items-center gap-1.5 md:gap-3">
              <button
                onClick={() => setMicEnabled(!micEnabled)}
                className={`h-9 md:h-11 px-3 md:px-4 border flex items-center gap-2 font-bold text-[10px] md:text-xs transition-colors ${
                  micEnabled
                    ? 'bg-white dark:bg-transparent border-slate-900/10 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:border-sky-500/30 hover:text-sky-500'
                    : 'bg-red-600 border-red-600 text-white'
                }`}
              >
                {micEnabled ? <Mic size={14} /> : <MicOff size={14} />}
                <span className="hidden xs:inline">{micEnabled ? 'MUTE' : 'UNMUTE'}</span>
              </button>

              <button
                onClick={() => setVideoEnabled(!videoEnabled)}
                className={`h-9 md:h-11 px-3 md:px-4 border flex items-center gap-2 font-bold text-[10px] md:text-xs transition-colors ${
                  videoEnabled
                    ? 'bg-white dark:bg-transparent border-slate-900/10 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:border-sky-500/30 hover:text-sky-500'
                    : 'bg-red-600 border-red-600 text-white'
                }`}
              >
                {videoEnabled ? <Radio size={14} /> : <VideoOff size={14} />}
                <span className="hidden xs:inline">{videoEnabled ? 'CAM OFF' : 'CAM ON'}</span>
              </button>
            </div>

            <div className="flex gap-1 md:gap-2">
              <button
                onClick={() => setShowChat(!showChat)}
                className={`h-8 w-8 md:h-9 md:w-9 border flex items-center justify-center transition-colors bg-white dark:bg-transparent ${
                  showChat
                    ? 'bg-sky-500 border-sky-500 text-white'
                    : 'border-slate-900/10 dark:border-white/10 text-slate-400 hover:text-sky-500'
                }`}
              >
                <div className="relative">
                  <MessageSquare size={14} />
                  {messages.length > 0 && !showChat && <div className="absolute -top-1 -right-1 w-2 h-2 bg-sky-500 rounded-full" />}
                </div>
              </button>
              <button className="hidden md:flex h-9 w-9 border border-slate-900/10 dark:border-white/10 items-center justify-center text-slate-400 hover:text-sky-500 transition-colors">
                <Layout size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar Overlay for Mobile - only backdrop if needed, but here we want to allow clicking stage to close */}
        {showChat && (
          <div
            className="fixed inset-0 bg-black/20 dark:bg-black/40 z-30 md:hidden"
            onClick={() => setShowChat(false)}
            style={{ height: '40vh' }}
          />
        )}

        {/* Sidebar */}
        <aside className={`
          fixed md:relative z-40 bg-white dark:bg-[#0a0a0b] border-l border-slate-900/10 dark:border-white/10 flex flex-col transition-all duration-300
          inset-x-0 bottom-0 h-[60vh] md:h-full md:inset-auto md:w-80 md:translate-y-0
          ${showChat ? 'translate-y-0' : 'translate-y-full md:hidden md:translate-x-full'}
        `}>
          {/* Sidebar Tabs */}
          <div className="flex border-b border-slate-900/10 dark:border-white/10 sticky top-0 bg-white dark:bg-[#0a0a0b] z-10">
            <button
              onClick={() => setSidebarTab('chat')}
              className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2 ${sidebarTab === 'chat' ? 'text-sky-500 border-b-2 border-sky-500' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
            >
              <MessageSquare size={14} /> Chat
            </button>
            <button
              onClick={() => setSidebarTab('participants')}
              className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2 ${sidebarTab === 'participants' ? 'text-sky-500 border-b-2 border-sky-500' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
            >
              <Users size={14} /> Miembros
            </button>
            <button
              onClick={() => setShowChat(false)}
              className="lg:hidden p-4 text-slate-400 hover:text-slate-600"
            >
              <ArrowRight size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-hidden flex flex-col">
            {sidebarTab === 'chat' ? (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((msg, idx) => (
                    <div key={idx} className={`flex flex-col ${msg.sender === 'Tú' ? 'items-end' : 'items-start'}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{msg.sender}</span>
                        <span className="text-[9px] text-slate-300">{msg.time}</span>
                      </div>
                      <div className={`px-3 py-2 text-xs font-medium max-w-[90%] ${msg.sender === 'Tú' ? 'bg-sky-500 text-white rounded-l-lg rounded-tr-lg' : 'bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 rounded-r-lg rounded-tl-lg'}`}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                  {messages.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
                      <div className="w-12 h-12 border border-slate-900/5 dark:border-white/5 flex items-center justify-center text-slate-200 dark:text-slate-800">
                        <MessageSquare size={24} />
                      </div>
                      <p className="label-micro text-slate-400 uppercase tracking-widest">No hay mensajes aún</p>
                    </div>
                  )}
                </div>

                <div className="p-4 border-t border-slate-900/10 dark:border-white/10 bg-slate-50 dark:bg-white/[0.01]">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Escribe un mensaje..."
                      className="flex-1 bg-white dark:bg-white/5 border border-slate-900/10 dark:border-white/10 px-3 py-2 text-xs outline-none focus:border-sky-500 transition-colors dark:text-white"
                    />
                    <button
                      onClick={handleSendMessage}
                      className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-3 py-2 hover:bg-sky-500 dark:hover:bg-sky-500 hover:text-white transition-colors"
                    >
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {/* Current user */}
                <div className="p-3 border border-slate-900/10 dark:border-white/10 flex items-center gap-3 bg-slate-50 dark:bg-white/5">
                  <div className="h-8 w-8 border border-slate-900/10 dark:border-white/10 flex items-center justify-center text-xs font-bold text-sky-500 bg-white dark:bg-transparent uppercase">
                    {user?.username?.slice(0, 2)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate uppercase">{user?.username}</p>
                    <p className="label-micro text-sky-500 mt-0.5 font-bold uppercase tracking-tighter">ANFITRIÓN (TÚ)</p>
                  </div>
                </div>

                {/* Other participants */}
                {participants.filter(p => p.user_id !== user?.user_id).map((part, idx) => (
                  <div key={idx} className="p-3 border border-slate-900/10 dark:border-white/10 flex items-center justify-between hover:border-sky-500/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 border border-slate-900/10 dark:border-white/10 flex items-center justify-center text-xs font-bold text-slate-400 uppercase">
                        {part.username.slice(0, 2)}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate uppercase">{part.username}</p>
                        <p className="label-micro text-slate-400 mt-0.5 uppercase">{part.is_teacher ? 'Profesor' : 'Estudiante'}</p>
                      </div>
                    </div>
                  </div>
                ))}

                {participants.length === 0 && (
                  <div className="p-6 text-center border border-dashed border-slate-900/10 dark:border-white/10 space-y-2">
                    <Sparkles size={16} className="text-sky-500 opacity-20 mx-auto" />
                    <p className="label-micro text-slate-400 uppercase tracking-widest">Esperando miembros...</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Technical Console panel */}
          <div className="p-4 border-t border-slate-900/10 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.01]">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Live Engine Status</span>
            </div>
            <div className="space-y-1 font-mono text-[9px] text-slate-400">
              <div className="flex justify-between"><span>Session ID</span> <span>#{id?.slice(-6) || 'N/A'}</span></div>
              <div className="flex justify-between"><span>Peers</span> <span>{Object.keys(remoteStreams).length} active</span></div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
