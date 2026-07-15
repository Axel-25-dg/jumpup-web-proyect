import { useEffect, useRef, useState } from 'react'
import { apiClient } from '@/infrastructure/http/axios-client'
import { localTokenStorage } from '@/infrastructure/storage/local-token-storage'
import { useAuthStore } from '@/presentation/store/auth.store'
import { MessageSquare, Send, Sparkles, Loader2 } from 'lucide-react'
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
    // Determinar protocolo ws:// o wss://
    const wsProto = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    // En local se usa localhost:8000
    const wsUrl = `${wsProto}//localhost:8000/ws/chat/${threadId}/?token=${token}`

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
    <div className="grid gap-6 md:grid-cols-4 h-[calc(100vh-12rem)]">
      {/* Sidebar de Chats */}
      <Card className="md:col-span-1 flex flex-col h-full overflow-hidden">
        <CardHeader className="p-4 border-b">
          <CardTitle className="text-base flex items-center justify-between">
            <span>Conversaciones</span>
            <Button
              size="sm"
              variant="outline"
              disabled={isCreatingTutor}
              onClick={handleCreateTutorThread}
              className="text-xs flex items-center gap-1 border-indigo-200 text-indigo-700 bg-indigo-50 hover:bg-indigo-100"
            >
              {isCreatingTutor ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Sparkles className="h-3 w-3" />
              )}
              Tutor IA
            </Button>
          </CardTitle>
          <CardDescription className="text-xs">Chatea con la comunidad o tu tutor personal.</CardDescription>
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
                className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all ${
                  selectedThread?.id === thread.id
                    ? 'bg-primary text-primary-foreground font-semibold'
                    : 'hover:bg-muted text-card-foreground'
                }`}
              >
                <div className={`p-2 rounded-full ${
                  thread.subject.includes('IA') 
                    ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200' 
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {thread.subject.includes('IA') ? <Sparkles className="h-4 w-4" /> : <MessageSquare className="h-4 w-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">{thread.subject}</p>
                  <p className={`text-[10px] ${selectedThread?.id === thread.id ? 'text-primary-foreground/75' : 'text-muted-foreground'}`}>
                    {new Date(thread.created_at).toLocaleDateString()}
                  </p>
                </div>
              </button>
            ))
          ) : (
            <div className="text-center py-8 text-xs text-muted-foreground">
              No tienes chats activos.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ventana de Mensajes */}
      <Card className="md:col-span-3 flex flex-col h-full overflow-hidden">
        {selectedThread ? (
          <>
            <CardHeader className="p-4 border-b flex flex-row items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className={selectedThread.subject.includes('IA') ? 'bg-indigo-600 text-white' : 'bg-primary text-white'}>
                    {selectedThread.subject.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-base">{selectedThread.subject}</CardTitle>
                  <CardDescription className="text-xs">
                    {selectedThread.subject.includes('IA') ? 'Tutor de Idiomas Inteligente GPT-4o' : 'Sala de mensajería'}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/10">
              {isLoadingMessages ? (
                <div className="flex h-full items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                messages.map((msg, index) => {
                  const isMe = msg.sender === user?.email || msg.sender === user?.username || msg.sender === 'Yo'
                  return (
                    <div key={index} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                        isMe 
                          ? 'bg-primary text-primary-foreground rounded-tr-none' 
                          : 'bg-card text-card-foreground border rounded-tl-none'
                      }`}>
                        {!isMe && (
                          <span className="block text-[10px] font-bold text-indigo-600 dark:text-indigo-400 mb-1">
                            {msg.sender === 'ia@jumpup.com' ? 'Tutor IA (GPT-4o)' : msg.sender}
                          </span>
                        )}
                        <p className="whitespace-pre-line leading-relaxed">{msg.body}</p>
                        {msg.created_at && (
                          <span className={`block text-[9px] mt-1 text-right ${isMe ? 'text-primary-foreground/75' : 'text-muted-foreground'}`}>
                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })
              )}

              {/* Indicador de Escritura del Tutor IA */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-card text-card-foreground border rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-1 shadow-sm">
                    <span className="text-xs text-indigo-600 font-semibold flex items-center gap-1.5">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Tutor IA está escribiendo...
                    </span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </CardContent>

            <CardFooter className="p-3 border-t bg-card">
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleSendMessage()
                }}
                className="flex w-full items-center gap-2"
              >
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => handleTyping(e.target.value)}
                  placeholder="Escribe tu mensaje o pregunta aquí..."
                  className="flex-1 rounded-xl border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                />
                <Button type="submit" size="icon" disabled={!inputText.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </CardFooter>
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-center text-muted-foreground p-8">
            <MessageSquare className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
            <h3 className="font-bold text-lg">Ninguna conversación seleccionada</h3>
            <p className="text-sm max-w-xs mt-1">
              Selecciona un chat del listado o crea una nueva sesión interactiva con el Tutor IA para comenzar.
            </p>
          </div>
        )}
      </Card>
    </div>
  )
}
