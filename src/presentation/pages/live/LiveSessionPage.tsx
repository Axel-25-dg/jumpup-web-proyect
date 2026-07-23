import { useCallback, useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { apiClient } from '@/infrastructure/http/axios-client'
import { localTokenStorage } from '@/infrastructure/storage/local-token-storage'
import { useAuthStore } from '@/presentation/store/auth.store'
import { API_CONFIG } from '@/infrastructure/config/api.config'
import {
  Radio, VideoOff, Mic, MicOff, PhoneOff, Users, Loader2,
  MessageSquare, Settings, Hand, MonitorUp,
  Signal, Shield, Sparkles, ArrowRight, Maximize2, Minimize2
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
  const [allowedToShareScreen, setAllowedToShareScreen] = useState(false)
  const [permittedUsers, setPermittedUsers] = useState<Record<number, boolean>>({})
  const [activePresenter, setActivePresenter] = useState<{ user_id: number; username: string } | null>(null)
  const [permissionRequests, setPermissionRequests] = useState<{ user_id: number; username: string }[]>([])
  const [toastMessage, setToastMessage] = useState<string | null>(null)

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
  const localVideoRef = useRef<HTMLVideoElement | null>(null)
  const setLocalVideoRef = useCallback((el: HTMLVideoElement | null) => {
    localVideoRef.current = el
    if (el) {
      const stream = localStreamRef.current
      if (stream && el.srcObject !== stream) {
        el.srcObject = stream
      }
    }
  }, [])
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

  const handleToggleScreenShare = () => {
    const canShare = isTeacherOrHost || allowedToShareScreen
    if (!canShare) {
      if (!isScreenSharing) {
        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
          socketRef.current.send(JSON.stringify({
            type: 'request_screen_share',
            user_id: user?.user_id,
            username: user?.username
          }))
        }
        showToast('Permiso requerido. Se ha enviado la solicitud al profesor.')
        return
      }
    }
    toggleScreenShare()
  }

  const toggleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        const stream = await navigator.mediaDevices.getDisplayMedia({ 
          video: { width: { max: 1280 }, height: { max: 720 }, frameRate: { max: 15 } } 
        })
        screenStreamRef.current = stream
        const videoTrack = stream.getVideoTracks()[0]

        // Replace track in all peer connections
        Object.values(peerConnections.current).forEach(pc => {
          const sender = pc.getSenders().find(s => s.track?.kind === 'video')
          if (sender) sender.replaceTrack(videoTrack)
        })

        videoTrack.onended = () => stopScreenShare()
        setIsScreenSharing(true)
        setActivePresenter({ user_id: user!.user_id, username: 'Tú' })

        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
          socketRef.current.send(JSON.stringify({
            type: 'screen_share_status',
            is_sharing: true,
            user_id: user?.user_id,
            username: user?.username
          }))
        }
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
    screenStreamRef.current = null
    const videoTrack = localStreamRef.current?.getVideoTracks()[0]
    if (videoTrack) {
      Object.values(peerConnections.current).forEach(pc => {
        const sender = pc.getSenders().find(s => s.track?.kind === 'video')
        if (sender) sender.replaceTrack(videoTrack)
      })
    }
    setIsScreenSharing(false)
    setActivePresenter(null)

    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        type: 'screen_share_status',
        is_sharing: false,
        user_id: user?.user_id,
        username: user?.username
      }))
    }
  }

  const handleGrantScreenShare = (targetUserId: number, targetUsername: string, allow: boolean) => {
    setPermittedUsers(prev => ({ ...prev, [targetUserId]: allow }))
    setPermissionRequests(prev => prev.filter(r => r.user_id !== targetUserId))

    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        type: 'grant_screen_share',
        target_user_id: targetUserId,
        allowed: allow
      }))
    }
    showToast(allow ? `Permiso de pantalla otorgado a ${targetUsername}` : `Permiso revocado a ${targetUsername}`)
  }

  // Load Session details & check authorization
  useEffect(() => {
    async function loadSession() {
      if (!id || !user) return
      try {
        setIsLoading(true)
        const res = await apiClient.get<any>(`/live-sessions/${id}/`)
        const sessData = res.data
        setSession(sessData)

        // Check if ended
        if (sessData.status === 'ended' || sessData.status === 'cancelled') {
          setIsEnded(true)
          setIsLoading(false)
          return
        }

        // Enrollment Check for Students ("Sin Infiltrados")
        const isTeacherOrAdmin =
          user.role === 'teacher' ||
          user.role === 'admin' ||
          (user as any).is_teacher ||
          sessData.teacher === user.user_id ||
          sessData.teacher_id === user.user_id

        if (!isTeacherOrAdmin) {
          try {
            const classRes = await apiClient.get<any[]>('/classrooms/mine/')
            const classList = Array.isArray(classRes.data)
              ? classRes.data
              : (classRes.data as any)?.results || []

            const sessionClassId = sessData.classroom || sessData.classroom_id
            const sessionCourseId = sessData.course || sessData.course_id

            const isEnrolled = classList.some((c: any) => {
              const cClassId = c.id
              const cCourseId = c.course || c.course_info?.id
              return (
                (sessionClassId && String(cClassId) === String(sessionClassId)) ||
                (sessionCourseId && String(cCourseId) === String(sessionCourseId))
              )
            })

            if (!isEnrolled && classList.length > 0) {
              setAccessDenied(true)
              setIsLoading(false)
              return
            }
          } catch (e) {
            console.error('Error comprobando aulas del estudiante:', e)
          }
        }

        await apiClient.post(`/live-sessions/${id}/join/`).catch(() => {})
      } catch (err) {
        console.error('Error loading live session details:', err)
      } finally {
        setIsLoading(false)
      }
    }
    loadSession()
  }, [id, user])

  // Session Timer Countdown
  useEffect(() => {
    if (!session || isEnded || accessDenied) return

    const durationMin = session.duration_min || session.duration_minutes || 60
    const scheduledTime = session.scheduled_at ? new Date(session.scheduled_at).getTime() : Date.now()
    const endTime = scheduledTime + durationMin * 60 * 1000

    const updateTimer = () => {
      const remainingMs = endTime - Date.now()
      const secondsLeft = Math.max(0, Math.floor(remainingMs / 1000))
      setTimeLeftSeconds(secondsLeft)

      if (secondsLeft <= 0) {
        const isHost =
          user?.role === 'teacher' ||
          user?.role === 'admin' ||
          session.teacher === user?.user_id ||
          session.teacher_id === user?.user_id

        if (isHost && !isEnded) {
          handleFinalizeSession('time_expired')
        }
      }
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    return () => clearInterval(interval)
  }, [session, isEnded, accessDenied, user])

  // Media initialization on mount
  useEffect(() => {
    if (isEnded || accessDenied) return
    let activeStream: MediaStream | null = null

    async function initMedia() {
      try {
        activeStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        localStreamRef.current = activeStream
        setLocalStream(activeStream)
      } catch (err) {
        console.error('Error accessing media devices.', err)
      } finally {
        setMediaReady(true)
      }
    }
    initMedia()

    return () => {
      activeStream?.getTracks().forEach(track => track.stop())
      localStreamRef.current?.getTracks().forEach(track => track.stop())
    }
  }, [isEnded, accessDenied])

  // Bind local video element whenever localStream changes (callback ref handles mount, this handles stream-ready-after-mount)
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream
    }
  }, [localStream, isLoading])

  // Attach local tracks to existing peer connections when localStream becomes ready
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
    // Try both naming conventions: live_session (Django) and live-session (REST-style)
    const wsUrlVariants = [
      `${wsEndpoint}/live_session/${id}/?token=${encodeURIComponent(token)}`,
      `${wsEndpoint}/live-session/${id}/?token=${encodeURIComponent(token)}`,
    ]
    let wsUrlIndex = 0

    let ws: WebSocket | null = null
    let reconnectTimeout: any
    let hasEverConnected = false

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
          const sender = pc.addTrack(trackToSend, localStreamRef.current!)
          
          // Priorizar audio en la red
          if (trackToSend.kind === 'audio' && sender.setParameters) {
            const params = sender.getParameters()
            if (!params.encodings) params.encodings = [{}]
            if (params.encodings.length > 0) {
              (params.encodings[0] as any).networkPriority = 'high'
              sender.setParameters(params).catch(e => console.warn('No se pudo priorizar audio', e))
            }
          }
        })

        // Preferir codecs ligeros (VP8/H.264) en lugar de los pesados AV1/VP9
        if (typeof RTCRtpReceiver !== 'undefined' && 'getCapabilities' in RTCRtpReceiver) {
          pc.getTransceivers().forEach(transceiver => {
            if (transceiver.receiver && transceiver.receiver.track.kind === 'video') {
              try {
                const capabilities = RTCRtpReceiver.getCapabilities('video')
                if (capabilities && capabilities.codecs) {
                  const codecs = capabilities.codecs
                  const preferredCodecs = codecs.filter(c => c.mimeType.includes('video/VP8') || c.mimeType.includes('video/H264'))
                  if (preferredCodecs.length > 0 && typeof transceiver.setCodecPreferences === 'function') {
                    // Ponemos los preferidos primero, seguidos de los demás
                    transceiver.setCodecPreferences([...preferredCodecs, ...codecs.filter(c => !preferredCodecs.includes(c))])
                  }
                }
              } catch (e) {
                console.warn('No se pudo preferir codecs', e)
              }
            }
          })
        }
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
        const stream = event.streams[0]
        setRemoteStreams(prev => ({ ...prev, [targetUserId]: stream }))
      }

      pc.oniceconnectionstatechange = () => {
        console.log(`[WebRTC] ICE State ${targetUserId}:`, pc.iceConnectionState)
      }

      pc.onconnectionstatechange = () => {
        console.log(`[WebRTC] Connection State ${targetUserId}:`, pc.connectionState)
      }

      return pc
    }

    const connect = () => {

      if (ws) ws.close()

      const wsUrl = wsUrlVariants[wsUrlIndex]
      console.log('[LiveSession] Conectando a WebSocket:', wsUrl)

      try {
        ws = new WebSocket(wsUrl)
        socketRef.current = ws

        ws.onopen = () => {
          setIsConnected(true)
          hasEverConnected = true
        }

        ws.onmessage = async (event) => {
          try {
            const data = JSON.parse(event.data)
            console.log('[WS] Mensaje recibido:', data.type, data)
            if (data.type === 'participants') {
              const allUsers: { user_id: number; username: string; is_teacher?: boolean }[] =
                (data.participants || data.users || data.data || []).map((u: any) => ({
                  user_id: u.user_id ?? u.id,
                  username: u.username ?? u.name ?? u.display_name ?? `Usuario ${u.user_id ?? u.id}`,
                  is_teacher: u.is_teacher ?? u.is_host ?? false
                }))
              // Filter out self from participants list
              const users = allUsers.filter(u => u.user_id !== user?.user_id)
              setParticipants(users)
              // Connect to all existing participants in the room when we join
              for (const remoteUser of users) {
                if (peerConnections.current[remoteUser.user_id]) continue // already connected
                // Only the user with the HIGHER user_id sends the offer to avoid double-offer race
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
                  // Lower ID user just creates the PC and waits for the offer
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
            } else if (data.type === 'request_screen_share') {
              if (isTeacherOrHost) {
                setPermissionRequests(prev => {
                  if (prev.some(r => r.user_id === data.user_id)) return prev
                  return [...prev, { user_id: data.user_id, username: data.username }]
                })
                showToast(`El estudiante ${data.username} solicita permiso para compartir pantalla.`)
              }
            } else if (data.type === 'grant_screen_share') {
              if (data.target_user_id === user?.user_id) {
                setAllowedToShareScreen(data.allowed)
                showToast(data.allowed ? 'El profesor te ha concedido permiso para compartir pantalla.' : 'El profesor ha revocado tu permiso para compartir pantalla.')
              }
            } else if (data.type === 'screen_share_status') {
              if (data.is_sharing) {
                setActivePresenter({ user_id: data.user_id, username: data.username })
                showToast(`${data.username} está compartiendo pantalla.`)
              } else {
                setActivePresenter(prev => (prev?.user_id === data.user_id ? null : prev))
              }
            } else if (data.type === 'user_joined') {
              // Skip if this is the current user joining themselves
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
          if (!isEnded && !accessDenied) {
            // If never connected and there's a fallback URL, try it
            if (!hasEverConnected && wsUrlIndex < wsUrlVariants.length - 1) {
              wsUrlIndex++
              console.log('[LiveSession] Intentando URL alternativa...')
              reconnectTimeout = setTimeout(connect, 500)
            } else {
              reconnectTimeout = setTimeout(connect, 3000)
            }
          }
        }

        ws.onerror = (err) => {
          console.error('Error de WebSocket:', err)
          ws?.close()
        }
      } catch (e) {
        console.error('Error al instanciar WebSocket:', e)
        if (!isEnded && !accessDenied) {
          reconnectTimeout = setTimeout(connect, 3000)
        }
      }
    }


    connect()

    return () => {
      if (ws) ws.close()
      clearTimeout(reconnectTimeout)
      Object.values(peerConnections.current).forEach(pc => pc.close())
      peerConnections.current = {}
    }
  }, [session, id, isEnded, accessDenied, mediaReady])

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

  if (accessDenied) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#f7f6f3] dark:bg-[#0a0a0b]">
        <div className="max-w-md w-full border border-slate-900/10 dark:border-white/10 p-8 text-center space-y-6 bg-white dark:bg-white/[0.02]">
          <div className="inline-flex p-4 border border-red-500/20 text-red-500 bg-red-500/10">
            <Shield size={32} />
          </div>
          <div className="space-y-2">
            <h2 className="text-lg font-black uppercase tracking-tight text-slate-900 dark:text-white">Acceso Denegado</h2>
            <p className="label-micro text-slate-400">Esta sesión en vivo es privada y solo está disponible para estudiantes inscritos en el curso correspondiente.</p>
          </div>
          <button
            onClick={() => navigate('/classrooms')}
            className="w-full py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs uppercase tracking-wider transition-colors"
          >
            Volver a Aulas
          </button>
        </div>
      </div>
    )
  }

  if (isEnded) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#f7f6f3] dark:bg-[#0a0a0b]">
        <div className="max-w-md w-full border border-slate-900/10 dark:border-white/10 p-8 text-center space-y-6 bg-white dark:bg-white/[0.02]">
          <div className="inline-flex p-4 border border-amber-500/20 text-amber-500 bg-amber-500/10">
            <Radio size={32} />
          </div>
          <div className="space-y-2">
            <h2 className="text-lg font-black uppercase tracking-tight text-slate-900 dark:text-white">Sesión Finalizada</h2>
            <p className="label-micro text-slate-400">{endNotice || 'Esta clase en vivo ha concluido y ya no está activa.'}</p>
          </div>
          <button
            onClick={() => navigate('/classrooms')}
            className="w-full py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs uppercase tracking-wider transition-colors"
          >
            Volver a Aulas
          </button>
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
    <div ref={mainContainerRef} className="h-screen flex flex-col overflow-hidden bg-[#f7f6f3] dark:bg-[#0a0a0b] safe-area-inset-top">
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
          {timeLeftSeconds !== null && (
            <div className="flex flex-col">
              <span className="label-micro text-slate-400">Tiempo Restante</span>
              <span className={`text-xs font-bold font-mono flex items-center gap-1 ${timeLeftSeconds < 300 ? 'text-red-500 animate-pulse' : 'text-slate-700 dark:text-slate-300'}`}>
                ⏱️ {String(Math.floor(timeLeftSeconds / 60)).padStart(2, '0')}:{String(timeLeftSeconds % 60).padStart(2, '0')}
              </span>
            </div>
          )}
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

          {(user?.role === 'teacher' || user?.role === 'admin' || (user as any)?.is_teacher || session.teacher === user?.user_id || session.teacher_id === user?.user_id) ? (
            <button
              onClick={() => {
                if (window.confirm('¿Seguro que deseas finalizar la clase para todos los participantes?')) {
                  handleFinalizeSession('teacher_ended')
                }
              }}
              className="px-6 bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-2"
            >
              <PhoneOff size={14} /> Finalizar Clase
            </button>
          ) : (
            <button
              onClick={handleLeaveSession}
              className="px-6 bg-slate-700 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-2"
            >
              <PhoneOff size={14} /> Salir
            </button>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {/* Central Stage */}
        <div className={`flex-1 flex flex-col overflow-hidden border-r border-slate-900/10 dark:border-white/10 relative transition-all duration-300 ${
          showChat ? 'h-[40vh] md:h-full' : 'h-full'
        }`}>
          {/* Toast Notification Banner */}
          {toastMessage && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-slate-900/90 text-white border border-sky-500/40 px-4 py-2 text-xs font-bold shadow-xl backdrop-blur-md flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
              <Sparkles className="w-4 h-4 text-sky-400" />
              <span>{toastMessage}</span>
            </div>
          )}

          {/* Stage View: If someone is sharing screen */}
          {activePresenter || isScreenSharing ? (
            <div key="stage" className="flex-1 flex flex-col min-h-0 bg-black">
              {/* Primary Stage Presenter */}
              <div className="flex-1 relative overflow-hidden bg-slate-950 flex items-center justify-center">
                <div className="absolute top-4 left-4 z-20 pointer-events-none">
                  <span className="chip text-[9px] px-2 py-0.5 border border-sky-500/30 text-sky-400 bg-sky-500/20 flex items-center gap-1.5 backdrop-blur-md">
                    <MonitorUp size={12} />
                    Presentando: {isScreenSharing ? 'Tú (Tu Pantalla)' : activePresenter?.username}
                  </span>
                </div>

                {isScreenSharing ? (
                  <video
                    ref={(node) => {
                      if (node && screenStreamRef.current) {
                        node.srcObject = screenStreamRef.current
                      }
                    }}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-contain"
                  />
                ) : (
                  activePresenter && (
                    <video
                      ref={(el) => { remoteVideoRefs.current[activePresenter.user_id] = el }}
                      autoPlay
                      playsInline
                      className="w-full h-full object-contain"
                    />
                  )
                )}
              </div>

              {/* Bottom Thumbnail Strip */}
              <div className="h-28 md:h-36 bg-slate-900 border-t border-slate-800 flex items-center p-2 gap-2 overflow-x-auto no-scrollbar">
                {/* Local Camera Thumbnail */}
                <div className="relative w-36 md:w-48 h-full bg-black rounded overflow-hidden flex-shrink-0 border border-slate-800">
                  <div className="absolute top-2 left-2 z-10">
                    <span className="text-[8px] px-1 bg-black/60 text-white rounded">Tú</span>
                  </div>
                  <video
                    ref={(node) => {
                      if (node && localStreamRef.current) {
                        node.srcObject = localStreamRef.current
                      }
                    }}
                    autoPlay
                    playsInline
                    muted
                    className={`w-full h-full object-cover ${videoEnabled ? 'opacity-100' : 'opacity-0'}`}
                  />
                  {!videoEnabled && (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
                      <VideoOff size={16} className="text-white/40" />
                    </div>
                  )}
                </div>

                {/* Remote Camera Thumbnails */}
                {participants.filter(p => p.user_id !== user?.user_id && p.user_id !== activePresenter?.user_id).map((part) => (
                  <div key={part.user_id} className="relative w-36 md:w-48 h-full bg-black rounded overflow-hidden flex-shrink-0 border border-slate-800">
                    <div className="absolute top-2 left-2 z-10 truncate max-w-[90%]">
                      <span className="text-[8px] px-1 bg-black/60 text-white rounded truncate">{part.username}</span>
                    </div>
                    <video
                      ref={(el) => { remoteVideoRefs.current[part.user_id] = el }}
                      autoPlay
                      playsInline
                      className="w-full h-full object-cover"
                    />
                    {!remoteStreams[part.user_id] && (
                      <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
                        <Loader2 className="w-4 h-4 text-sky-500 animate-spin" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Normal Grid View */
            <div key="grid" className={`flex-1 grid gap-px bg-slate-900/10 dark:bg-white/10 min-h-0 overflow-y-auto ${
              participants.length <= 1 
                ? 'grid-cols-1' 
                : participants.length === 2 
                  ? 'grid-cols-1 grid-rows-2 md:grid-cols-2 md:grid-rows-1' 
                  : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 auto-rows-fr'
            }`}>
              {/* Primary Feed: Local User */}
              <div className="relative group overflow-hidden bg-black h-full min-h-[250px] md:min-h-[300px]">
                <div className="absolute top-4 left-4 z-20 pointer-events-none">
                  <span className="chip text-[9px] px-1.5 py-0.5 border border-sky-500/20 text-sky-500 bg-sky-500/20">
                    Tú ({user?.username})
                  </span>
                </div>
                
                <video
                  ref={setLocalVideoRef}
                  autoPlay
                  playsInline
                  muted
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
                <div key={part.user_id} className="relative group overflow-hidden bg-black h-full min-h-[250px] md:min-h-[300px]">
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
          )}

          {/* Action Control Bar */}
          <div className="p-3 md:p-4 border-t border-slate-900/10 dark:border-white/10 flex items-center justify-between bg-white dark:bg-white/[0.02] z-20">
            <div className="flex gap-1 md:gap-2">
              <button className="h-8 w-8 md:h-9 md:w-9 border border-slate-900/10 dark:border-white/10 flex items-center justify-center text-slate-400 hover:text-sky-500 transition-colors bg-white dark:bg-transparent">
                <Hand size={14} />
              </button>
              <button
                onClick={handleToggleScreenShare}
                className={`h-8 w-8 md:h-9 md:w-9 border flex items-center justify-center transition-colors relative ${
                  isScreenSharing
                    ? 'bg-sky-500 border-sky-500 text-white'
                    : (isTeacherOrHost || allowedToShareScreen)
                      ? 'border-slate-900/10 dark:border-white/10 text-slate-400 hover:text-sky-500 bg-white dark:bg-transparent'
                      : 'border-amber-500/30 text-amber-500/70 bg-amber-500/5 hover:border-amber-500'
                }`}
                title={
                  isTeacherOrHost || allowedToShareScreen
                    ? (isScreenSharing ? 'Detener compartir pantalla' : 'Compartir pantalla')
                    : 'Solicitar permiso para compartir pantalla'
                }
              >
                <MonitorUp size={14} />
                {!isTeacherOrHost && !allowedToShareScreen && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-amber-500 rounded-full" />
                )}
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
              <button
                onClick={toggleFullScreen}
                className={`h-8 w-8 md:h-9 md:w-9 border flex items-center justify-center transition-colors bg-white dark:bg-transparent ${
                  isFullScreen
                    ? 'bg-sky-500 border-sky-500 text-white'
                    : 'border-slate-900/10 dark:border-white/10 text-slate-400 hover:text-sky-500'
                }`}
                title={isFullScreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
              >
                {isFullScreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
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
              {permissionRequests.length > 0 && (
                <span className="w-2 h-2 bg-amber-500 rounded-full animate-ping" />
              )}
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
                <div className="p-3 border border-slate-900/10 dark:border-white/10 flex items-center justify-between bg-slate-50 dark:bg-white/5">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 border border-slate-900/10 dark:border-white/10 flex items-center justify-center text-xs font-bold text-sky-500 bg-white dark:bg-transparent uppercase">
                      {user?.username?.slice(0, 2)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate uppercase">{user?.username}</p>
                      <p className="label-micro mt-0.5 font-bold uppercase tracking-tighter text-sky-500">
                        {isTeacherOrHost ? 'ANFITRIÓN (TÚ)' : 'PARTICIPANTE (TÚ)'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Other participants */}
                {participants.filter(p => p.user_id !== user?.user_id).map((part, idx) => {
                  const isPending = permissionRequests.some(r => r.user_id === part.user_id)
                  const isPermitted = permittedUsers[part.user_id]

                  return (
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

                      {isTeacherOrHost && !part.is_teacher && (
                        <div>
                          {isPending ? (
                            <button
                              onClick={() => handleGrantScreenShare(part.user_id, part.username, true)}
                              className="px-2 py-1 bg-amber-500 hover:bg-amber-600 text-white font-bold text-[9px] uppercase tracking-wider animate-pulse flex items-center gap-1"
                            >
                              <MonitorUp size={10} /> Aprobar
                            </button>
                          ) : isPermitted ? (
                            <button
                              onClick={() => handleGrantScreenShare(part.user_id, part.username, false)}
                              className="px-2 py-1 bg-emerald-600 hover:bg-red-600 text-white font-bold text-[9px] uppercase tracking-wider flex items-center gap-1 transition-colors"
                              title="Haz clic para revocar permiso"
                            >
                              <MonitorUp size={10} /> Concedido
                            </button>
                          ) : (
                            <button
                              onClick={() => handleGrantScreenShare(part.user_id, part.username, true)}
                              className="px-2 py-1 border border-slate-900/10 dark:border-white/10 hover:border-sky-500 text-slate-400 hover:text-sky-500 font-bold text-[9px] uppercase tracking-wider flex items-center gap-1 transition-colors"
                            >
                              <MonitorUp size={10} /> Permitir
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}

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
