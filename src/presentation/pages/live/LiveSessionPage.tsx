import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { apiClient } from '@/infrastructure/http/axios-client'
import { localTokenStorage } from '@/infrastructure/storage/local-token-storage'
import { useAuthStore } from '@/presentation/store/auth.store'
import { API_CONFIG } from '@/infrastructure/config/api.config'
import {
  Radio, VideoOff, Mic, MicOff, PhoneOff, Users, Loader2,
  MessageSquare, MonitorUp, Signal, Shield, Sparkles, Maximize2, Minimize2
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
  scheduled_at?: string
  duration_min?: number
  duration_minutes?: number
  classroom?: number
  classroom_id?: number
  course?: number
  course_id?: number
  teacher?: number
  teacher_id?: number
  status?: string
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
  const [mediaReady, setMediaReady] = useState(false)

  // Status & Access State
  const [isEnded, setIsEnded] = useState(false)
  const [accessDenied, setAccessDenied] = useState(false)
  const [endNotice, setEndNotice] = useState<string | null>(null)
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number | null>(null)

  // Screen Sharing Permissions & Stage View State
  const [activePresenter, setActivePresenter] = useState<{ user_id: number; username: string } | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Spotlight and view modes
  const [pinnedUserId] = useState<number | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'speaker'>('grid')
  const [networkQualities, setNetworkQualities] = useState<Record<number, 'excellent' | 'good' | 'poor'>>({})
  const spotlightContainerRef = useRef<HTMLDivElement>(null)

  const isTeacherOrHost =
    user?.role === 'teacher' ||
    user?.role === 'admin' ||
    (user as any)?.is_teacher ||
    session?.teacher === user?.user_id ||
    session?.teacher_id === user?.user_id

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => {
      setToastMessage(prev => (prev === msg ? null : prev))
    }, 4000)
  }

  const socketRef = useRef<WebSocket | null>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const mainContainerRef = useRef<HTMLDivElement>(null)
  const [isFullScreen, setIsFullScreen] = useState(false)

  // WebRTC Refs
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const localStreamRef = useRef<MediaStream | null>(null)
  const screenStreamRef = useRef<MediaStream | null>(null)
  const peerConnections = useRef<Record<number, RTCPeerConnection>>({})
  const iceCandidatesBuffer = useRef<Record<number, RTCIceCandidateInit[]>>({})
  const [remoteStreams, setRemoteStreams] = useState<Record<number, MediaStream>>({})
  const remoteVideoRefs = useRef<Record<number, HTMLVideoElement | null>>({})

  useEffect(() => {
    const handleFSChange = () => {
      setIsFullScreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', handleFSChange)
    return () => document.removeEventListener('fullscreenchange', handleFSChange)
  }, [])

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      if (mainContainerRef.current?.requestFullscreen) {
        mainContainerRef.current.requestFullscreen().catch(err => {
          console.error("Error al activar pantalla completa:", err)
        })
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(err => console.error("Error al salir de pantalla completa:", err))
      }
    }
  }

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, showChat])

  // Attach remote streams to video elements without triggering re-render flickering
  useEffect(() => {
    Object.entries(remoteStreams).forEach(([userIdStr, stream]) => {
      const userId = Number(userIdStr)
      const videoEl = remoteVideoRefs.current[userId]
      if (videoEl && stream && videoEl.srcObject !== stream) {
        videoEl.srcObject = stream
        videoEl.play().catch(e => console.debug('Play remote stream:', e))
      }
    })
  }, [remoteStreams, participants])

  // Cargar detalles de la sesión
  useEffect(() => {
    if (!id) return
    const fetchSession = async () => {
      try {
        setIsLoading(true)
        const res = await apiClient.get(`/live-sessions/${id}/`)
        const data: LiveSessionDetails = res.data
        setSession(data)

        if (data.status === 'ended' || data.status === 'finalized') {
          setIsEnded(true)
          setEndNotice('Esta clase en vivo ha concluido y ya no está activa.')
          setIsLoading(false)
          return
        }

        if (data.scheduled_at && (data.duration_min || data.duration_minutes)) {
          const duration = data.duration_min || data.duration_minutes || 60
          const startTime = new Date(data.scheduled_at).getTime()
          const endTime = startTime + duration * 60 * 1000
          const now = Date.now()
          const diffSec = Math.floor((endTime - now) / 1000)

          if (diffSec <= 0) {
            setIsEnded(true)
            setEndNotice('El tiempo programado para esta clase ha finalizado.')
            setIsLoading(false)
            return
          } else {
            setTimeLeftSeconds(diffSec)
          }
        }
      } catch (err: any) {
        console.error('Error al cargar sesión en vivo:', err)
        if (err.response?.status === 403) {
          setAccessDenied(true)
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchSession()
  }, [id])

  // Temporizador de sesión
  useEffect(() => {
    if (timeLeftSeconds === null || isEnded || accessDenied) return

    const interval = setInterval(() => {
      setTimeLeftSeconds(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(interval)
          handleFinalizeSession('time_expired')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [timeLeftSeconds, isEnded, accessDenied])

  // Capturar stream de webcam local
  useEffect(() => {
    let isMounted = true

    const getMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: true
        })
        if (isMounted) {
          setLocalStream(stream)
          localStreamRef.current = stream
          setMediaReady(true)
        }
      } catch (err) {
        console.warn('No se pudo acceder a cámara/micrófono completos, intentando solo audio:', err)
        try {
          const audioOnlyStream = await navigator.mediaDevices.getUserMedia({ audio: true })
          if (isMounted) {
            setLocalStream(audioOnlyStream)
            localStreamRef.current = audioOnlyStream
            setVideoEnabled(false)
            setMediaReady(true)
          }
        } catch (audioErr) {
          console.error('Tampoco se pudo acceder al micrófono:', audioErr)
          if (isMounted) {
            setMediaReady(true)
          }
        }
      }
    }

    getMedia()

    return () => {
      isMounted = false
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(t => t.stop())
      }
    }
  }, [])

  // Actualizar remitentes WebRTC cuando cambia la transmisión local
  useEffect(() => {
    if (!localStream) return
    Object.values(peerConnections.current).forEach(pc => {
      const senders = pc.getSenders()
      localStream.getTracks().forEach(track => {
        const sender = senders.find(s => s.track?.kind === track.kind)
        if (!sender) {
          pc.addTrack(track, localStream)
        } else if (!sender.track || sender.track.id !== track.id) {
          sender.replaceTrack(track)
        }
      })
    })
  }, [localStream])

  // Calidad de red WebRTC
  useEffect(() => {
    if (isEnded || accessDenied) return

    const interval = setInterval(async () => {
      const qualities: Record<number, 'excellent' | 'good' | 'poor'> = {}

      for (const [userIdStr, pc] of Object.entries(peerConnections.current)) {
        const userId = Number(userIdStr)
        if (!pc || pc.connectionState === 'closed') continue

        try {
          const stats = await pc.getStats()
          let packetsLost = 0
          let packetsReceived = 0
          let rtt = 0

          stats.forEach(report => {
            if (report.type === 'inbound-rtp' && report.kind === 'video') {
              packetsLost = report.packetsLost || 0
              packetsReceived = report.packetsReceived || 0
            }
            if (report.type === 'candidate-pair' && report.state === 'succeeded') {
              rtt = report.currentRoundTripTime || 0
            }
          })

          const totalPackets = packetsReceived + packetsLost
          const lossRate = totalPackets > 0 ? (packetsLost / totalPackets) * 100 : 0

          if (lossRate > 5 || rtt > 0.4) {
            qualities[userId] = 'poor'
          } else if (lossRate > 1 || rtt > 0.15) {
            qualities[userId] = 'good'
          } else {
            qualities[userId] = 'excellent'
          }
        } catch {
          // Ignorar si falla la estadística
        }
      }

      setNetworkQualities(qualities)
    }, 5000)

    return () => clearInterval(interval)
  }, [isEnded, accessDenied])

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

  const handleFinalizeSession = async (reason = 'teacher_ended') => {
    if (!id) return
    try {
      await apiClient.post(`/live-sessions/${id}/end/`).catch(() => {})
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify({ type: 'end_session', reason }))
      }
    } catch (e) {
      console.error('Error cerrando sesión:', e)
    }
    setEndNotice(reason === 'time_expired' ? 'El tiempo de la clase ha finalizado.' : 'Has finalizado la sesión para todos.')
    setIsEnded(true)
    setTimeout(() => {
      handleLeaveSession()
    }, 2000)
  }

  // WebSocket y WebRTC Signaling
  useEffect(() => {
    if (!session || isEnded || accessDenied || !mediaReady) return

    const token = localTokenStorage.getAccessToken() || ''

    let wsOrigin = import.meta.env.VITE_WS_URL || API_CONFIG.WS_URL || ''
    if (!wsOrigin) {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'
      const wsProto = apiBaseUrl.startsWith('https') ? 'wss:' : 'ws:'
      const wsHost = apiBaseUrl.replace(/^https?:\/\//, '').replace(/\/api\/?$/, '')
      wsOrigin = `${wsProto}//${wsHost}`
    }

    const baseWs = wsOrigin.replace(/\/$/, '')
    const wsEndpoint = baseWs.endsWith('/ws') ? baseWs : `${baseWs}/ws`
    
    // Lista de variantes de URL de WebSocket para fallback
    const wsUrlVariants = [
      `${wsEndpoint}/live-session/${id}/?token=${encodeURIComponent(token)}`,
      `${wsEndpoint}/live_session/${id}/?token=${encodeURIComponent(token)}`,
      `${wsEndpoint}/live/${id}/?token=${encodeURIComponent(token)}`,
      `${wsEndpoint}/live-session/${id}/`,
      `${wsEndpoint}/live_session/${id}/`
    ]
    let wsUrlIndex = 0
    let isClosedIntentionally = false

    let ws: WebSocket | null = null
    let reconnectTimeout: any

    const rtcConfig: RTCConfiguration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
        { urls: 'stun:stun3.l.google.com:19302' },
        { urls: 'stun:stun4.l.google.com:19302' },
        { urls: 'stun:stun.services.mozilla.com' },
        {
          urls: 'turn:openrelay.metered.ca:80',
          username: 'openrelayproject',
          credential: 'openrelayproject'
        },
        {
          urls: 'turn:openrelay.metered.ca:443',
          username: 'openrelayproject',
          credential: 'openrelayproject'
        }
      ],
      iceTransportPolicy: 'all'
    }

    const processBufferedCandidates = async (targetId: number, pc: RTCPeerConnection) => {
      const buffer = iceCandidatesBuffer.current[targetId] || []
      for (const candidate of buffer) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate))
        } catch (e) {
          console.error('Error añadiendo candidato buffered:', e)
        }
      }
      iceCandidatesBuffer.current[targetId] = []
    }

    const createPeerConnection = (targetUserId: number) => {
      if (peerConnections.current[targetUserId]) return peerConnections.current[targetUserId]

      const pc = new RTCPeerConnection(rtcConfig)
      peerConnections.current[targetUserId] = pc

      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => {
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
            type: 'ice_candidate',
            target: targetUserId,
            candidate: event.candidate
          }))
        }
      }

      pc.ontrack = (event) => {
        console.log(`[WebRTC] Track recibido de ${targetUserId}:`, event.track.kind)
        const stream = event.streams[0] || new MediaStream([event.track])
        setRemoteStreams(prev => ({ ...prev, [targetUserId]: stream }))
      }

      return pc
    }

    const connect = () => {
      if (isClosedIntentionally) return
      if (ws) ws.close()

      const wsUrl = wsUrlVariants[wsUrlIndex]
      console.log('[LiveSession] Conectando a WebSocket:', wsUrl)

      try {
        ws = new WebSocket(wsUrl)
        socketRef.current = ws

        ws.onopen = () => {
          if (isClosedIntentionally) {
            ws?.close()
            return
          }
          setIsConnected(true)
        }

        ws.onmessage = async (event) => {
          if (isClosedIntentionally) return
          try {
            const data = JSON.parse(event.data)
            if (data.type === 'participants') {
              const allUsers: { user_id: number; username: string; is_teacher?: boolean }[] =
                (data.participants || data.users || data.data || []).map((u: any) => ({
                  user_id: u.user_id ?? u.id,
                  username: u.username ?? u.name ?? u.display_name ?? `Usuario ${u.user_id ?? u.id}`,
                  is_teacher: u.is_teacher ?? u.is_host ?? false
                }))
              const users = allUsers.filter(u => u.user_id !== user?.user_id)
              setParticipants(users)

              for (const remoteUser of users) {
                if (peerConnections.current[remoteUser.user_id]) continue
                if ((user?.user_id ?? 0) > remoteUser.user_id) {
                  const pc = createPeerConnection(remoteUser.user_id)
                  const offer = await pc.createOffer()
                  await pc.setLocalDescription(offer)
                  if (ws && ws.readyState === WebSocket.OPEN) {
                    ws.send(JSON.stringify({
                      type: 'offer',
                      target: remoteUser.user_id,
                      sdp: offer
                    }))
                  }
                } else {
                  createPeerConnection(remoteUser.user_id)
                }
              }
            } else if (data.type === 'end_session' || data.type === 'session_ended') {
              const msg = data.reason === 'time_expired' ? 'El tiempo de la clase ha finalizado.' : 'La clase ha sido finalizada por el profesor.'
              setEndNotice(msg)
              setIsEnded(true)
              setTimeout(() => {
                handleLeaveSession()
              }, 2500)
            } else if (data.type === 'screen_share_status') {
              if (data.is_sharing) {
                setActivePresenter({ user_id: data.user_id, username: data.username })
                showToast(`${data.username} está compartiendo pantalla.`)
              } else {
                setActivePresenter(prev => (prev?.user_id === data.user_id ? null : prev))
              }
            } else if (data.type === 'user_joined') {
              if (data.user_id === user?.user_id) return
              const joinedUser = {
                user_id: data.user_id ?? data.id,
                username: data.username ?? data.name ?? data.display_name ?? `Usuario ${data.user_id ?? data.id}`,
                is_teacher: data.is_teacher ?? data.is_host ?? false
              }
              setParticipants((prev) => {
                if (prev.some((p) => p.user_id === joinedUser.user_id)) return prev
                return [...prev, joinedUser]
              })
              const pc = createPeerConnection(joinedUser.user_id)
              if ((user?.user_id ?? 0) > joinedUser.user_id) {
                const offer = await pc.createOffer()
                await pc.setLocalDescription(offer)
                if (ws && ws.readyState === WebSocket.OPEN) {
                  ws.send(JSON.stringify({
                    type: 'offer',
                    target: joinedUser.user_id,
                    sdp: offer
                  }))
                }
              }
            } else if (data.type === 'user_left') {
              setParticipants((prev) => prev.filter((p) => p.user_id !== data.user_id))
              const pc = peerConnections.current[data.user_id]
              if (pc) pc.close()
              delete peerConnections.current[data.user_id]
              delete iceCandidatesBuffer.current[data.user_id]
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
            } else if (data.type === 'offer' || data.type === 'answer' || data.type === 'ice_candidate') {
              const senderId = data.from
              if (!senderId) return

              let pc = peerConnections.current[senderId]
              if (!pc) {
                pc = createPeerConnection(senderId)
              }

              if (data.type === 'offer') {
                await pc.setRemoteDescription(new RTCSessionDescription(data.sdp))
                await processBufferedCandidates(senderId, pc)
                const answer = await pc.createAnswer()
                await pc.setLocalDescription(answer)
                if (ws && ws.readyState === WebSocket.OPEN) {
                  ws.send(JSON.stringify({
                    type: 'answer',
                    target: senderId,
                    sdp: answer
                  }))
                }
              } else if (data.type === 'answer') {
                await pc.setRemoteDescription(new RTCSessionDescription(data.sdp))
                await processBufferedCandidates(senderId, pc)
              } else if (data.type === 'ice_candidate') {
                if (pc.remoteDescription && pc.remoteDescription.type) {
                  await pc.addIceCandidate(new RTCIceCandidate(data.candidate)).catch(e => console.error(e))
                } else {
                  if (!iceCandidatesBuffer.current[senderId]) iceCandidatesBuffer.current[senderId] = []
                  iceCandidatesBuffer.current[senderId].push(data.candidate)
                }
              }
            }
          } catch (e) {
            console.error('Error procesando mensaje:', e)
          }
        }

        ws.onclose = () => {
          setIsConnected(false)
          if (isClosedIntentionally) return
          if (!isEnded && !accessDenied) {
            wsUrlIndex = (wsUrlIndex + 1) % wsUrlVariants.length
            console.log('[LiveSession] Reintentando conexión con variante:', wsUrlIndex)
            reconnectTimeout = setTimeout(connect, 2000)
          }
        }

        ws.onerror = (err) => {
          if (isClosedIntentionally) return
          console.error('Error de WebSocket:', err)
          ws?.close()
        }
      } catch (e) {
        console.error('Error al instanciar WebSocket:', e)
        if (isClosedIntentionally) return
        if (!isEnded && !accessDenied) {
          wsUrlIndex = (wsUrlIndex + 1) % wsUrlVariants.length
          reconnectTimeout = setTimeout(connect, 3000)
        }
      }
    }

    connect()

    return () => {
      isClosedIntentionally = true
      if (ws) ws.close()
      clearTimeout(reconnectTimeout)
      Object.values(peerConnections.current).forEach(pc => pc.close())
      peerConnections.current = {}
    }
  }, [session, id, isEnded, accessDenied, mediaReady])

  const renderNetworkIndicator = (userId: number) => {
    const quality = networkQualities[userId] || 'excellent'
    let color = 'text-emerald-500'
    let text = 'Excelente'
    if (quality === 'good') {
      color = 'text-amber-500'
      text = 'Aceptable'
    } else if (quality === 'poor') {
      color = 'text-red-500'
      text = 'Inestable'
    }

    return (
      <span className={`inline-flex items-center ${color}`} title={`Conexión: ${text}`}>
        <Signal size={10} />
      </span>
    )
  }

  const isPresentingLocalScreen = isScreenSharing

  const getSpotlightUser = () => {
    if (pinnedUserId !== null) {
      if (pinnedUserId === user?.user_id) {
        return { user_id: user.user_id, username: 'Tú', isLocal: true, isScreen: false }
      }
      const p = participants.find(part => part.user_id === pinnedUserId)
      if (p) {
        return { user_id: p.user_id, username: p.username, isLocal: false, isScreen: false }
      }
    }

    if (isPresentingLocalScreen) {
      return { user_id: user!.user_id, username: 'Tú (Tu Pantalla)', isLocal: true, isScreen: true }
    }
    if (activePresenter) {
      return { user_id: activePresenter.user_id, username: activePresenter.username, isLocal: false, isScreen: true }
    }

    if (viewMode === 'speaker') {
      const teacher = participants.find(p => p.is_teacher)
      if (teacher) {
        return { user_id: teacher.user_id, username: teacher.username, isLocal: false, isScreen: false }
      }
      const firstPart = participants[0]
      if (firstPart) {
        return { user_id: firstPart.user_id, username: firstPart.username, isLocal: false, isScreen: false }
      }
      return { user_id: user!.user_id, username: 'Tú', isLocal: true, isScreen: false }
    }

    return null
  }

  const spotlightTarget = getSpotlightUser()

  const handleLeaveSession = () => {
    if (socketRef.current) socketRef.current.close()
    navigate('/classrooms')
  }

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatInput.trim() || !socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) return

    const msg = chatInput.trim()
    socketRef.current.send(JSON.stringify({
      type: 'chat_message',
      message: msg
    }))

    setMessages(prev => [...prev, {
      sender: user?.username || 'Tú',
      text: msg,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }])

    setChatInput('')
  }

  const handleToggleScreenShare = async () => {
    if (isScreenSharing) {
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach(t => t.stop())
        screenStreamRef.current = null
      }
      setIsScreenSharing(false)
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify({
          type: 'screen_share_status',
          is_sharing: false
        }))
      }
    } else {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true })
        screenStreamRef.current = stream
        setIsScreenSharing(true)

        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
          socketRef.current.send(JSON.stringify({
            type: 'screen_share_status',
            is_sharing: true
          }))
        }

        stream.getVideoTracks()[0].onended = () => {
          setIsScreenSharing(false)
          screenStreamRef.current = null
          if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify({
              type: 'screen_share_status',
              is_sharing: false
            }))
          }
        }
      } catch (err) {
        console.error('Error al compartir pantalla:', err)
      }
    }
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center z-50 bg-[#0a0e14] text-white">
        <div className="border border-white/10 p-8 flex flex-col items-center gap-6 max-w-sm w-full bg-white/[0.03] backdrop-blur-xl rounded-2xl">
          <Loader2 className="h-10 w-10 animate-spin text-sky-500" />
          <div className="text-center space-y-2">
            <h2 className="text-sm font-black uppercase tracking-widest text-white">Conectando...</h2>
            <p className="text-xs text-slate-400">Estableciendo conexión segura con la sala virtual.</p>
          </div>
        </div>
      </div>
    )
  }

  if (accessDenied) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#0a0e14] text-white">
        <div className="max-w-md w-full border border-white/10 p-8 text-center space-y-6 bg-white/[0.03] backdrop-blur-xl rounded-2xl">
          <div className="inline-flex p-4 border border-red-500/20 text-red-500 bg-red-500/10 rounded-full">
            <Shield size={32} />
          </div>
          <div className="space-y-2">
            <h2 className="text-lg font-black uppercase tracking-tight text-white">Acceso Denegado</h2>
            <p className="text-xs text-slate-400">Esta sesión en vivo es privada y solo está disponible para estudiantes inscritos en el curso correspondiente.</p>
          </div>
          <button
            onClick={() => navigate('/classrooms')}
            className="w-full py-3 bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors"
          >
            Volver a Aulas
          </button>
        </div>
      </div>
    )
  }

  if (isEnded) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#0a0e14] text-white">
        <div className="max-w-md w-full border border-white/10 p-8 text-center space-y-6 bg-white/[0.03] backdrop-blur-xl rounded-2xl">
          <div className="inline-flex p-4 border border-amber-500/20 text-amber-500 bg-amber-500/10 rounded-full">
            <Radio size={32} />
          </div>
          <div className="space-y-2">
            <h2 className="text-lg font-black uppercase tracking-tight text-white">Sesión Finalizada</h2>
            <p className="text-xs text-slate-400">{endNotice || 'Esta clase en vivo ha concluido y ya no está activa.'}</p>
          </div>
          <button
            onClick={() => navigate('/classrooms')}
            className="w-full py-3 bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors"
          >
            Volver a Aulas
          </button>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#0a0e14] text-white">
        <div className="max-w-md w-full border border-white/10 p-8 text-center space-y-6 bg-white/[0.03] backdrop-blur-xl rounded-2xl">
          <div className="inline-flex p-4 border border-white/10 text-sky-500 bg-white/5 rounded-full">
            <PhoneOff size={32} />
          </div>
          <div className="space-y-2">
            <h2 className="text-lg font-black uppercase tracking-tight text-white">Sesión no encontrada</h2>
            <p className="text-xs text-slate-400">El enlace de la sesión ha expirado o es inválido.</p>
          </div>
          <button
            onClick={() => navigate('/classrooms')}
            className="w-full py-3 bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors"
          >
            Volver a aulas
          </button>
        </div>
      </div>
    )
  }

  return (
    <div ref={mainContainerRef} className="h-screen flex flex-col overflow-hidden bg-[#07090e] text-white safe-area-inset-top">
      {/* Top Header */}
      <header className="border-b border-white/10 flex items-center justify-between px-6 py-3 bg-neutral-950/80 backdrop-blur-md z-20">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className={`w-10 h-10 border rounded-xl flex items-center justify-center transition-colors ${isConnected ? 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10' : 'border-amber-500/40 text-amber-400 bg-amber-500/10 animate-pulse'}`}>
              <Radio className="h-5 w-5" />
            </div>
            {isConnected && <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border border-black rounded-full" />}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-400 border border-sky-500/30 text-[9px] font-bold uppercase tracking-wider">
                En vivo
              </span>
              <span className={`text-[10px] font-bold ${isConnected ? 'text-emerald-400' : 'text-amber-400 animate-pulse'}`}>
                {isConnected ? 'Conectado' : 'Conectando'}
              </span>
            </div>
            <h1 className="text-sm font-black uppercase tracking-tight text-white line-clamp-1">
              {session.title}
            </h1>
          </div>
        </div>

        {/* Informative Stats & End button */}
        <div className="flex items-center gap-6">
          {timeLeftSeconds !== null && (
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">Tiempo Restante</span>
              <span className={`text-xs font-bold font-mono ${timeLeftSeconds < 300 ? 'text-red-400 animate-pulse' : 'text-slate-200'}`}>
                ⏱️ {String(Math.floor(timeLeftSeconds / 60)).padStart(2, '0')}:{String(timeLeftSeconds % 60).padStart(2, '0')}
              </span>
            </div>
          )}

          {isTeacherOrHost ? (
            <button
              onClick={() => {
                if (window.confirm('¿Seguro que deseas finalizar la clase para todos los participantes?')) {
                  handleFinalizeSession('teacher_ended')
                }
              }}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg flex items-center gap-2"
            >
              <PhoneOff size={14} /> Finalizar Clase
            </button>
          ) : (
            <button
              onClick={handleLeaveSession}
              className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all border border-white/10 flex items-center gap-2"
            >
              <PhoneOff size={14} /> Salir
            </button>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {/* Central Stage */}
        <div className={`flex-1 flex flex-col overflow-hidden relative transition-all duration-300 ${
          showChat ? 'h-[50vh] md:h-full' : 'h-full'
        }`}>
          {/* Toast Notification Banner */}
          {toastMessage && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-neutral-900/90 text-white border border-sky-500/40 px-4 py-2 rounded-full text-xs font-bold shadow-2xl backdrop-blur-md flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
              <Sparkles className="w-4 h-4 text-sky-400" />
              <span>{toastMessage}</span>
            </div>
          )}

          {/* Spotlight View */}
          {spotlightTarget ? (
            <div key="stage" ref={spotlightContainerRef} className="flex-1 flex flex-col lg:flex-row min-h-0 bg-black relative">
              <div className="flex-1 relative overflow-hidden bg-neutral-950 flex items-center justify-center p-2">
                <div className="absolute top-4 left-4 z-20 pointer-events-none flex items-center gap-2">
                  <span className="px-3 py-1 bg-black/75 backdrop-blur-md rounded-full text-xs font-semibold text-sky-400 border border-sky-500/30 flex items-center gap-1.5">
                    {spotlightTarget.isScreen ? <MonitorUp size={14} /> : <Users size={14} />}
                    {spotlightTarget.isScreen ? 'Presentando: ' : 'Enfoque: '} {spotlightTarget.username}
                  </span>
                </div>

                {/* Video Stage element */}
                {spotlightTarget.isLocal ? (
                  spotlightTarget.isScreen ? (
                    <video
                      ref={(node) => {
                        if (node && screenStreamRef.current && node.srcObject !== screenStreamRef.current) {
                          node.srcObject = screenStreamRef.current
                        }
                      }}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-contain rounded-2xl"
                    />
                  ) : (
                    <video
                      ref={(node) => {
                        if (node && localStreamRef.current && node.srcObject !== localStreamRef.current) {
                          node.srcObject = localStreamRef.current
                        }
                      }}
                      autoPlay
                      playsInline
                      muted
                      className={`w-full h-full object-contain rounded-2xl ${videoEnabled ? 'opacity-100' : 'opacity-0'}`}
                    />
                  )
                ) : (
                  <video
                    ref={(el) => {
                      if (el) {
                        remoteVideoRefs.current[spotlightTarget.user_id] = el
                        const stream = remoteStreams[spotlightTarget.user_id]
                        if (stream && el.srcObject !== stream) {
                          el.srcObject = stream
                        }
                      }
                    }}
                    autoPlay
                    playsInline
                    className="w-full h-full object-contain rounded-2xl"
                  />
                )}
              </div>

              {/* Thumbnails Sidebar */}
              <div className="h-28 md:h-36 lg:h-full lg:w-64 bg-neutral-950 border-t lg:border-t-0 lg:border-l border-white/10 flex lg:flex-col items-center p-3 gap-3 overflow-x-auto lg:overflow-y-auto">
                {/* Local Camera Thumbnail */}
                {spotlightTarget.user_id !== user?.user_id && (
                  <div className="relative w-44 lg:w-full h-full lg:h-36 bg-neutral-900 rounded-xl overflow-hidden flex-shrink-0 border border-white/10 group">
                    <span className="absolute top-2 left-2 z-10 px-2 py-0.5 bg-black/75 text-white text-[10px] font-semibold rounded-md backdrop-blur-md">Tú</span>
                    <video
                      ref={(node) => {
                        if (node && localStreamRef.current && node.srcObject !== localStreamRef.current) {
                          node.srcObject = localStreamRef.current
                        }
                      }}
                      autoPlay
                      playsInline
                      muted
                      className={`w-full h-full object-cover ${videoEnabled ? 'opacity-100' : 'opacity-0'}`}
                    />
                  </div>
                )}

                {/* Remote Thumbnails */}
                {participants.filter(p => p.user_id !== spotlightTarget.user_id).map((part) => (
                  <div key={part.user_id} className="relative w-44 lg:w-full h-full lg:h-36 bg-neutral-900 rounded-xl overflow-hidden flex-shrink-0 border border-white/10 group">
                    <span className="absolute top-2 left-2 z-10 px-2 py-0.5 bg-black/75 text-white text-[10px] font-semibold rounded-md backdrop-blur-md truncate max-w-[80%]">{part.username}</span>
                    <video
                      ref={(el) => {
                        if (el) {
                          remoteVideoRefs.current[part.user_id] = el
                          const stream = remoteStreams[part.user_id]
                          if (stream && el.srcObject !== stream) {
                            el.srcObject = stream
                          }
                        }
                      }}
                      autoPlay
                      playsInline
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Adaptative Responsive Camera Grid Layout (Uno al lado del otro, se acomodan hacia abajo) */
            <div key="grid" className="flex-1 p-4 md:p-6 overflow-y-auto bg-[#07090e] min-h-0">
              <div className="w-full h-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 auto-rows-fr items-center justify-center overflow-y-auto">
                {/* Local User Camera Card */}
                <div
                  className={`relative group overflow-hidden bg-neutral-950 rounded-2xl border transition-all duration-300 shadow-2xl flex items-center justify-center w-full h-full min-h-[220px] aspect-video ${
                    micEnabled ? 'border-white/10' : 'border-red-500/40'
                  }`}
                >
                  {/* Name Tag */}
                  <div className="absolute bottom-3 left-3 z-20 pointer-events-none">
                    <span className="px-3 py-1 bg-black/75 backdrop-blur-md rounded-full text-xs font-semibold text-white flex items-center gap-2 border border-white/10">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      Tú ({user?.username})
                    </span>
                  </div>

                  {/* Mic Muted Badge */}
                  {!micEnabled && (
                    <div className="absolute top-3 left-3 z-20 bg-red-600 text-white p-1.5 rounded-full shadow-lg">
                      <MicOff size={14} />
                    </div>
                  )}

                  {/* Local Video Stream */}
                  <video
                    ref={(node) => {
                      if (node && localStreamRef.current && node.srcObject !== localStreamRef.current) {
                        node.srcObject = localStreamRef.current
                      }
                    }}
                    autoPlay
                    playsInline
                    muted
                    className={`w-full h-full object-cover rounded-2xl transition-opacity duration-300 ${
                      videoEnabled ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    }`}
                  />

                  {/* Camera Off Avatar Fallback */}
                  {!videoEnabled && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-neutral-900 to-neutral-950 rounded-2xl p-4">
                      <div className="w-20 h-20 rounded-full bg-sky-500/20 border-2 border-sky-500/40 flex items-center justify-center text-sky-400 font-bold text-2xl shadow-xl mb-2">
                        {user?.username?.slice(0, 2).toUpperCase() || 'TU'}
                      </div>
                      <span className="text-xs font-semibold text-neutral-400">Cámara desactivada</span>
                    </div>
                  )}
                </div>

                {/* Remote Participant Camera Cards */}
                {participants.filter(p => p.user_id !== user?.user_id).map((part) => (
                  <div
                    key={part.user_id}
                    className="relative group overflow-hidden bg-neutral-950 rounded-2xl border border-white/10 transition-all duration-300 shadow-2xl flex items-center justify-center w-full h-full min-h-[220px] aspect-video"
                  >
                    {/* Name Tag */}
                    <div className="absolute bottom-3 left-3 z-20 pointer-events-none">
                      <span className="px-3 py-1 bg-black/75 backdrop-blur-md rounded-full text-xs font-semibold text-white flex items-center gap-2 border border-white/10">
                        {part.username} {part.is_teacher && <span className="text-sky-400 text-[10px] uppercase font-bold">(Profesor)</span>}
                        {renderNetworkIndicator(part.user_id)}
                      </span>
                    </div>

                    {/* Remote Video Stream */}
                    <video
                      ref={(el) => {
                        if (el) {
                          remoteVideoRefs.current[part.user_id] = el
                          const stream = remoteStreams[part.user_id]
                          if (stream && el.srcObject !== stream) {
                            el.srcObject = stream
                            el.play().catch(e => console.debug('Play remote:', e))
                          }
                        }
                      }}
                      autoPlay
                      playsInline
                      className="w-full h-full object-cover rounded-2xl"
                    />

                    {/* Stream Loading Fallback */}
                    {!remoteStreams[part.user_id] && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-neutral-900 to-neutral-950 rounded-2xl p-4">
                        <div className="w-16 h-16 rounded-full bg-neutral-800 border border-white/10 flex items-center justify-center text-neutral-300 font-bold text-xl mb-3 shadow-lg">
                          {part.username.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-sky-400 font-medium">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Conectando cámara...</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Control Bar Floating / Fixed at Bottom */}
          <div className="p-4 border-t border-white/10 flex items-center justify-between bg-neutral-950/90 backdrop-blur-xl z-20">
            <div className="flex items-center gap-2">
              <button
                onClick={handleToggleScreenShare}
                className={`p-3 rounded-xl border flex items-center gap-2 text-xs font-bold transition-all ${
                  isScreenSharing
                    ? 'bg-sky-500 border-sky-500 text-white shadow-lg shadow-sky-500/20'
                    : 'border-white/10 bg-neutral-900 text-slate-300 hover:text-white hover:border-sky-500/50'
                }`}
                title="Compartir pantalla"
              >
                <MonitorUp size={18} />
                <span className="hidden sm:inline">{isScreenSharing ? 'Compartiendo' : 'Compartir Pantalla'}</span>
              </button>
            </div>

            {/* Mic and Camera Controls */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMicEnabled(!micEnabled)}
                className={`p-3.5 rounded-full border flex items-center justify-center transition-all shadow-xl ${
                  micEnabled
                    ? 'bg-neutral-800 border-white/10 text-white hover:bg-neutral-700'
                    : 'bg-red-600 border-red-600 text-white shadow-red-600/30'
                }`}
                title={micEnabled ? 'Silenciar micrófono' : 'Activar micrófono'}
              >
                {micEnabled ? <Mic size={20} /> : <MicOff size={20} />}
              </button>

              <button
                onClick={() => setVideoEnabled(!videoEnabled)}
                className={`p-3.5 rounded-full border flex items-center justify-center transition-all shadow-xl ${
                  videoEnabled
                    ? 'bg-neutral-800 border-white/10 text-white hover:bg-neutral-700'
                    : 'bg-red-600 border-red-600 text-white shadow-red-600/30'
                }`}
                title={videoEnabled ? 'Desactivar cámara' : 'Activar cámara'}
              >
                {videoEnabled ? <Radio size={20} /> : <VideoOff size={20} />}
              </button>
            </div>

            {/* View & Chat Options */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode(viewMode === 'grid' ? 'speaker' : 'grid')}
                className={`p-3 rounded-xl border transition-all ${
                  viewMode === 'speaker'
                    ? 'bg-sky-500 border-sky-500 text-white'
                    : 'border-white/10 bg-neutral-900 text-slate-300 hover:text-white'
                }`}
                title={viewMode === 'speaker' ? 'Vista Mosaico' : 'Vista Enfoque'}
              >
                <Users size={18} />
              </button>

              <button
                onClick={() => setShowChat(!showChat)}
                className={`p-3 rounded-xl border transition-all ${
                  showChat
                    ? 'bg-sky-500 border-sky-500 text-white'
                    : 'border-white/10 bg-neutral-900 text-slate-300 hover:text-white'
                }`}
              >
                <MessageSquare size={18} />
              </button>

              <button
                onClick={toggleFullScreen}
                className="p-3 rounded-xl border border-white/10 bg-neutral-900 text-slate-300 hover:text-white transition-all"
                title="Pantalla Completa"
              >
                {isFullScreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
              </button>
            </div>
          </div>
        </div>

        {/* Chat / Sidebar Drawer */}
        {showChat && (
          <div className="w-full md:w-80 h-[50vh] md:h-full bg-neutral-950 border-t md:border-t-0 md:border-l border-white/10 flex flex-col z-30">
            <div className="flex items-center border-b border-white/10">
              <button
                onClick={() => setSidebarTab('chat')}
                className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${
                  sidebarTab === 'chat' ? 'text-sky-400 border-b-2 border-sky-400' : 'text-neutral-400 hover:text-white'
                }`}
              >
                Chat de Clase
              </button>
              <button
                onClick={() => setSidebarTab('participants')}
                className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${
                  sidebarTab === 'participants' ? 'text-sky-400 border-b-2 border-sky-400' : 'text-neutral-400 hover:text-white'
                }`}
              >
                Participantes ({participants.length + 1})
              </button>
            </div>

            {sidebarTab === 'chat' ? (
              <>
                <div className="flex-1 p-4 overflow-y-auto space-y-4">
                  {messages.length === 0 ? (
                    <div className="text-center py-12 text-neutral-500 text-xs">
                      No hay mensajes en esta clase. ¡Sé el primero en saludar!
                    </div>
                  ) : (
                    messages.map((m, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="font-bold text-sky-400">{m.sender}</span>
                          <span className="text-neutral-500">{m.time}</span>
                        </div>
                        <p className="text-xs text-neutral-200 bg-neutral-900 p-2.5 rounded-xl border border-white/5 break-words">
                          {m.text}
                        </p>
                      </div>
                    ))
                  )}
                  <div ref={chatEndRef} />
                </div>

                <form onSubmit={handleSendMessage} className="p-3 border-t border-white/10 flex gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Escribe un mensaje..."
                    className="flex-1 bg-neutral-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-sky-500 transition-colors"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs rounded-xl transition-colors"
                  >
                    Enviar
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 p-4 overflow-y-auto space-y-2">
                <div className="flex items-center justify-between p-2.5 bg-sky-500/10 border border-sky-500/20 rounded-xl text-xs">
                  <span className="font-bold text-sky-400">Tú ({user?.username})</span>
                  <span className="text-[10px] text-sky-500 font-bold uppercase">En vivo</span>
                </div>
                {participants.map((p) => (
                  <div key={p.user_id} className="flex items-center justify-between p-2.5 bg-neutral-900 border border-white/5 rounded-xl text-xs">
                    <span className="font-medium text-neutral-200">{p.username}</span>
                    {p.is_teacher && <span className="text-[10px] text-sky-400 font-bold uppercase">Profesor</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
