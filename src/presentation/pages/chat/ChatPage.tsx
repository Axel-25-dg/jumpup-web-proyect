import { useEffect, useRef, useState } from 'react'
import { apiClient } from '@/infrastructure/http/axios-client'
import { localTokenStorage } from '@/infrastructure/storage/local-token-storage'
import { useAuthStore } from '@/presentation/store/auth.store'
import { MessageSquare, Send, Sparkles, Loader2, Users } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/presentation/components/ui/card'
import { Button } from '@/presentation/components/ui/button'
import { Avatar, AvatarFallback } from '@/presentation/components/ui/avatar'

interface Thread {
  id: number
  subject: string
  created_at: string
}

interface Message {
  id?: number
  sender: string // email o username
  body: string
  created_at?: string
  is_read?: boolean
}

export default function ChatPage() {
  const { user } = useAuthStore()
  const [threads, setThreads] = useState<Thread[]>([])
  const [selectedThread, setSelectedThread] = useState<Thread | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputText, setInputText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isLoadingThreads, setIsLoadingThreads] = useState(true)
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const [isCreatingTutor, setIsCreatingTutor] = useState(false)

  const socketRef = useRef<WebSocket | null>(null)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    async function fetchThreads() {
      try {
        const res = await apiClient.get<Thread[]>('/threads/')
        setThreads(res.data)
      } catch (err) {
        console.error('Error fetching chat threads:', err)
      } finally {
        setIsLoadingThreads(false)
      }
    }
    fetchThreads()
  }, [])

  useEffect(() => {
    if (!selectedThread) return
    const threadId = selectedThread.id

    async function loadMessages() {
      setIsLoadingMessages(true)
      try {
        const res = await apiClient.get<Message[]>(`/threads/${threadId}/messages/`)
        setMessages(res.data)
      } catch (err) {
        console.error('Error fetching messages:', err)
      } finally {
        setIsLoadingMessages(false)
      }
    }
    loadMessages()

    // Conectar WebSocket
    const token = localTokenStorage.getAccessToken()
    const baseUrl = new URL(import.meta.env.VITE_API_BASE_URL)
    const wsProto = baseUrl.protocol === 'https:' ? 'wss:' : 'ws:'
    const wsUrl = `${wsProto}//${baseUrl.host}/ws/chat/${threadId}/?token=${token}`

    const ws = new WebSocket(wsUrl)
    socketRef.current = ws

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data.type === 'chat_message') {
          // Agregar mensaje recibido si no está ya
          setMessages((prev) => {
            const exists = prev.some((m) => m.id === data.message.id)
            if (exists) return prev
            return [...prev, data.message]
          })
          setIsTyping(false)
        } else if (data.type === 'typing') {
          if (data.username !== user?.username) {
            setIsTyping(data.is_typing)
          }
        }
      } catch (e) {
        console.error('Error parsing WS message:', e)
      }
    }

    ws.onclose = () => {
      console.log('WS connection closed')
    }

    return () => {
      ws.close()
    }
  }, [selectedThread, user?.username])

  // Desplazar chat hacia abajo al recibir mensajes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const handleSendMessage = () => {
    if (!inputText.trim() || !socketRef.current) return

    // Enviar por WebSocket
    socketRef.current.send(
      JSON.stringify({
        type: 'chat_message',
        body: inputText
      })
    )

    // Agregar localmente mientras se procesa
    const localMsg: Message = {
      sender: user?.email || user?.username || 'Yo',
      body: inputText,
      created_at: new Date().toISOString()
    }
    setMessages((prev) => [...prev, localMsg])
    setInputText('')
  }

  const handleCreateTutorThread = async () => {
    setIsCreatingTutor(true)
    try {
      const res = await apiClient.post<Thread>('/threads/', {
        subject: 'Tutor IA',
        participant_ids: []
      })
      setThreads((prev) => [res.data, ...prev])
      setSelectedThread(res.data)
    } catch (err) {
      console.error('Error creating Tutor IA chat:', err)
    } finally {
      setIsCreatingTutor(false)
    }
  }

  const handleTyping = (text: string) => {
    setInputText(text)
    if (socketRef.current) {
      socketRef.current.send(
        JSON.stringify({
          type: 'typing',
          is_typing: text.length > 0
        })
      )
    }
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-10rem)] animate-in fade-in duration-500">
      {/* Sidebar de Chats */}
      <Card className="lg:w-80 flex flex-col h-full border-none shadow-xl bg-white rounded-2xl overflow-hidden shrink-0">
        <CardHeader className="p-5 border-b bg-slate-50/50">
          <div className="flex items-center justify-between mb-2">
            <CardTitle className="text-xl font-black text-slate-900">Mensajes</CardTitle>
            <Button
              size="icon"
              variant="ghost"
              disabled={isCreatingTutor}
              onClick={handleCreateTutorThread}
              className="h-8 w-8 rounded-full bg-sky-50 text-primary hover:bg-sky-100"
            >
              {isCreatingTutor ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            </Button>
          </div>
          <CardDescription className="text-xs font-medium text-slate-500">Chatea con la comunidad o tu tutor IA.</CardDescription>
        </CardHeader>
        <CardContent className="p-2 flex-1 overflow-y-auto space-y-1">
          {isLoadingThreads ? (
            <div className="flex h-32 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : threads.length > 0 ? (
            threads.map((thread) => (
              <button
                key={thread.id}
                onClick={() => setSelectedThread(thread)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all duration-200 group ${selectedThread?.id === thread.id
                    ? 'bg-primary text-white shadow-lg shadow-sky-200'
                    : 'hover:bg-slate-50 text-slate-700'
                  }`}
              >
                <div className={`h-10 w-10 shrink-0 flex items-center justify-center rounded-full transition-colors ${selectedThread?.id === thread.id
                    ? 'bg-white/20 text-white'
                    : thread.subject.includes('IA')
                      ? 'bg-sky-100 text-primary'
                      : 'bg-slate-100 text-slate-500'
                  }`}>
                  {thread.subject.includes('IA') ? <Sparkles className="h-5 w-5" /> : <MessageSquare className="h-5 w-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate">{thread.subject}</p>
                  <p className={`text-[10px] font-medium ${selectedThread?.id === thread.id ? 'text-sky-100' : 'text-slate-400'}`}>
                    {new Date(thread.created_at).toLocaleDateString()}
                  </p>
                </div>
              </button>
            ))
          ) : (
            <div className="text-center py-12 px-4">
              <div className="bg-slate-50 p-6 rounded-2xl border-2 border-dashed border-slate-200">
                <MessageSquare className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-500">No hay chats aún</p>
                <Button variant="link" size="sm" onClick={handleCreateTutorThread} className="text-[10px] text-primary font-bold p-0 h-auto mt-1">Iniciar con IA</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ventana de Mensajes */}
      <Card className="flex-1 flex flex-col h-full border-none shadow-xl bg-white rounded-2xl overflow-hidden">
        {selectedThread ? (
          <>
            <CardHeader className="p-4 border-b bg-white/50 backdrop-blur-sm flex flex-row items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar className="h-11 w-11 border-2 border-white shadow-sm">
                    <AvatarFallback className={selectedThread.subject.includes('IA') ? 'bg-gradient-to-tr from-sky-600 to-primary text-white font-black' : 'bg-slate-100 text-slate-600 font-bold'}>
                      {selectedThread.subject.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-500"></span>
                </div>
                <div>
                  <CardTitle className="text-lg font-black text-slate-900">{selectedThread.subject}</CardTitle>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">En línea</span>
                    <span className="h-1 w-1 rounded-full bg-slate-300"></span>
                    <CardDescription className="text-[10px] font-medium uppercase tracking-wider">
                      {selectedThread.subject.includes('IA') ? 'Tutor IA GPT-4o' : 'Mensajería Directa'}
                    </CardDescription>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" className="rounded-full h-9 w-9 text-slate-400 hover:text-slate-600 hover:bg-slate-100"><Users className="h-4 w-4" /></Button>
              </div>
            </CardHeader>

            <CardContent className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30">
              {isLoadingMessages ? (
                <div className="flex h-full items-center justify-center">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Cargando mensajes...</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {messages.map((msg, index) => {
                    const isMe = msg.sender === user?.email || msg.sender === user?.username || msg.sender === 'Yo'
                    const isIA = msg.sender === 'ia@jumpup.com' || msg.sender === 'Tutor IA'

                    return (
                      <div key={index} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} space-y-1`}>
                        <div className={`flex items-end gap-2 max-w-[85%] sm:max-w-[70%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                          <Avatar className="h-6 w-6 shrink-0 border border-white shadow-sm">
                            <AvatarFallback className={`text-[8px] font-black ${isMe ? 'bg-primary text-white' : isIA ? 'bg-gradient-to-tr from-sky-500 to-indigo-500 text-white' : 'bg-slate-200 text-slate-600'}`}>
                              {isMe ? 'YO' : isIA ? 'IA' : msg.sender.slice(0, 1).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className={`relative px-4 py-3 rounded-2xl text-sm shadow-sm transition-all hover:shadow-md ${isMe
                              ? 'bg-primary text-white rounded-tr-none'
                              : 'bg-white text-slate-700 rounded-tl-none border border-slate-100'
                            }`}>
                            <p className="leading-relaxed font-medium">{msg.body}</p>
                          </div>
                        </div>
                        <span className={`text-[9px] font-bold text-slate-400 px-8 ${isMe ? 'text-right' : 'text-left'}`}>
                          {msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Enviando...'}
                        </span>
                      </div>
                    )
                  })}

                  {isTyping && (
                    <div className="flex items-start gap-2 animate-in fade-in slide-in-from-bottom-2">
                      <Avatar className="h-6 w-6 shrink-0 bg-gradient-to-tr from-sky-500 to-indigo-500">
                        <AvatarFallback className="text-[8px] font-black text-white">IA</AvatarFallback>
                      </Avatar>
                      <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-2 shadow-sm">
                        <div className="flex gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]"></span>
                          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]"></span>
                          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce"></span>
                        </div>
                        <span className="text-[10px] font-black text-primary uppercase tracking-widest">Tutor IA pensando...</span>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </CardContent>

            <CardFooter className="p-4 bg-white border-t">
              <div className="flex w-full items-end gap-3 bg-slate-50 rounded-2xl p-2 transition-all focus-within:ring-2 focus-within:ring-primary/20 focus-within:bg-white border border-transparent focus-within:border-primary/30">
                <textarea
                  rows={1}
                  value={inputText}
                  onChange={(e) => {
                    handleTyping(e.target.value)
                    e.target.style.height = 'inherit'
                    e.target.style.height = `${e.target.scrollHeight}px`
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSendMessage()
                    }
                  }}
                  placeholder="Escribe tu mensaje aquí..."
                  className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-medium p-2.5 resize-none max-h-32 text-slate-700"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputText.trim()}
                  size="icon"
                  className="h-10 w-10 shrink-0 rounded-xl bg-primary hover:bg-sky-600 text-white shadow-lg shadow-sky-200 transition-all active:scale-90"
                >
                  <Send className="h-5 w-5" />
                </Button>
              </div>
            </CardFooter>
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-center p-12 bg-slate-50/30">
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 max-w-sm transform hover:scale-105 transition-transform duration-500">
              <div className="bg-gradient-to-tr from-sky-100 to-indigo-100 p-6 rounded-2xl inline-block mb-6">
                <MessageSquare className="h-12 w-12 text-primary" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">Bandeja de Entrada</h3>
              <p className="text-sm font-medium text-slate-500 mb-8 leading-relaxed">
                Selecciona una conversación o inicia una sesión con el <span className="text-primary font-bold">Tutor IA</span> para resolver tus dudas en tiempo real.
              </p>
              <Button
                onClick={handleCreateTutorThread}
                className="w-full h-12 rounded-xl bg-gradient-to-r from-sky-600 to-primary hover:from-sky-700 hover:to-sky-600 font-bold shadow-lg shadow-sky-200 transition-all active:scale-95 gap-2"
              >
                <Sparkles className="h-5 w-5" />
                Hablar con Tutor IA
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
