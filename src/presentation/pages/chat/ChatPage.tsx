import { useEffect, useRef, useState } from 'react'
import { apiClient } from '@/infrastructure/http/axios-client'
import { localTokenStorage } from '@/infrastructure/storage/local-token-storage'
import { useAuthStore } from '@/presentation/store/auth.store'
import { MessageSquare, Send, Sparkles, Loader2, Users, Plus } from 'lucide-react'
import { Button } from '@/presentation/components/ui/button'

interface Thread {
  id: number
  subject: string
  created_at: string
}

interface Message {
  id?: number
  sender: string
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

    ws.onclose = () => console.log('WS connection closed')
    return () => ws.close()
  }, [selectedThread, user?.username])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const handleSendMessage = () => {
    if (!inputText.trim() || !socketRef.current) return
    socketRef.current.send(JSON.stringify({ type: 'chat_message', body: inputText }))
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
      const res = await apiClient.post<Thread>('/threads/', { subject: 'Tutor IA', participant_ids: [] })
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
      socketRef.current.send(JSON.stringify({ type: 'typing', is_typing: text.length > 0 }))
    }
  }

  return (
    <div className="flex h-[calc(100vh-6rem)] animate-in fade-in duration-500 border border-slate-900/10 dark:border-white/10">
      {/* THREAD SIDEBAR */}
      <aside className="w-72 shrink-0 flex flex-col border-r border-slate-900/10 dark:border-white/10 bg-white dark:bg-[#0a0a0b]">
        <div className="px-5 py-4 border-b border-slate-900/10 dark:border-white/10 flex items-center justify-between">
          <div>
            <p className="label-micro text-slate-400 dark:text-slate-500">Chat</p>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Mensajes</h2>
          </div>
          <Button
            size="icon"
            variant="ghost"
            disabled={isCreatingTutor}
            onClick={handleCreateTutorThread}
            className="h-8 w-8 text-sky-500 hover:bg-sky-50 dark:hover:bg-sky-900/20"
          >
            {isCreatingTutor ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-900/5 dark:divide-white/5">
          {isLoadingThreads ? (
            <div className="flex h-32 items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-sky-500" />
            </div>
          ) : threads.length > 0 ? (
            threads.map((thread) => (
              <button
                key={thread.id}
                onClick={() => setSelectedThread(thread)}
                className={`w-full flex items-center gap-3 px-5 py-3.5 text-left transition-colors ${
                  selectedThread?.id === thread.id
                    ? 'bg-sky-50 dark:bg-sky-900/10 border-l-2 border-sky-500'
                    : 'hover:bg-slate-50 dark:hover:bg-white/[0.03] border-l-2 border-transparent'
                }`}
              >
                <div className={`h-8 w-8 shrink-0 flex items-center justify-center border ${
                  selectedThread?.id === thread.id
                    ? 'border-sky-500/30 text-sky-500'
                    : 'border-slate-900/10 dark:border-white/10 text-slate-400'
                }`}>
                  {thread.subject.includes('IA') ? <Sparkles className="h-4 w-4" /> : <MessageSquare className="h-4 w-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-bold truncate ${selectedThread?.id === thread.id ? 'text-sky-600' : 'text-slate-900 dark:text-white'}`}>
                    {thread.subject}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {new Date(thread.created_at).toLocaleDateString()}
                  </p>
                </div>
              </button>
            ))
          ) : (
            <div className="text-center py-10 px-5">
              <MessageSquare className="h-8 w-8 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
              <p className="label-micro text-slate-400 mb-3">Sin conversaciones</p>
              <Button size="sm" onClick={handleCreateTutorThread} className="bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs gap-1.5">
                <Sparkles className="h-3.5 w-3.5" /> Iniciar con Tutor IA
              </Button>
            </div>
          )}
        </div>
      </aside>

      {/* MESSAGE PANEL */}
      <div className="flex-1 flex flex-col bg-[#f7f6f3] dark:bg-[#0a0a0b]">
        {selectedThread ? (
          <>
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-900/10 dark:border-white/10 flex items-center justify-between bg-white dark:bg-[#0a0a0b]">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 border border-slate-900/10 dark:border-white/10 flex items-center justify-center text-sky-500">
                  {selectedThread.subject.includes('IA') ? <Sparkles className="h-4 w-4" /> : <MessageSquare className="h-4 w-4" />}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{selectedThread.subject}</p>
                  <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    <span className="label-micro text-emerald-600">En línea</span>
                    <span className="label-micro text-slate-400 ml-1">
                      {selectedThread.subject.includes('IA') ? 'Tutor IA' : 'Mensajería'}
                    </span>
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600">
                <Users className="h-4 w-4" />
              </Button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
              {isLoadingMessages ? (
                <div className="flex h-full items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-sky-500" />
                </div>
              ) : (
                <>
                  {messages.map((msg, index) => {
                    const isMe = msg.sender === user?.email || msg.sender === user?.username || msg.sender === 'Yo'
                    const isIA = msg.sender === 'ia@jumpup.com' || msg.sender === 'Tutor IA'
                    return (
                      <div key={index} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[70%] space-y-1 ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                          <div className={`px-4 py-2.5 text-sm font-medium leading-relaxed border ${
                            isMe
                              ? 'bg-sky-500 text-white border-sky-500'
                              : isIA
                              ? 'bg-white dark:bg-white/[0.03] border-slate-900/10 dark:border-white/10 text-slate-700 dark:text-slate-300'
                              : 'bg-white dark:bg-white/[0.03] border-slate-900/10 dark:border-white/10 text-slate-700 dark:text-slate-300'
                          }`}>
                            {msg.body}
                          </div>
                          <span className="label-micro text-slate-400 px-1">
                            {isMe ? 'Tú' : isIA ? 'Tutor IA' : msg.sender} · {msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '...'}
                          </span>
                        </div>
                      </div>
                    )
                  })}

                  {isTyping && (
                    <div className="flex justify-start animate-in fade-in slide-in-from-bottom-2">
                      <div className="bg-white dark:bg-white/[0.03] border border-slate-900/10 dark:border-white/10 px-4 py-2.5 flex items-center gap-2">
                        <div className="flex gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-sky-500 animate-bounce [animation-delay:-0.3s]" />
                          <span className="h-1.5 w-1.5 rounded-full bg-sky-500 animate-bounce [animation-delay:-0.15s]" />
                          <span className="h-1.5 w-1.5 rounded-full bg-sky-500 animate-bounce" />
                        </div>
                        <span className="label-micro text-sky-500">Tutor IA escribiendo...</span>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Input */}
            <div className="px-6 py-4 border-t border-slate-900/10 dark:border-white/10 bg-white dark:bg-[#0a0a0b]">
              <div className="flex items-end gap-3 border border-slate-900/10 dark:border-white/10 bg-[#f7f6f3] dark:bg-white/[0.03] p-2">
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
                  placeholder="Escribe tu mensaje... (Enter para enviar)"
                  className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-medium p-2 resize-none max-h-32 text-slate-700 dark:text-slate-300 placeholder:text-slate-400 outline-none"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputText.trim()}
                  size="icon"
                  className="h-9 w-9 bg-sky-500 hover:bg-sky-600 text-white shrink-0 transition-all active:scale-90"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-center p-12">
            <div className="border border-slate-900/10 dark:border-white/10 p-10 max-w-sm w-full">
              <div className="flex h-12 w-12 items-center justify-center border border-slate-900/10 dark:border-white/10 text-sky-500 mx-auto mb-6">
                <MessageSquare className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2">Bandeja de Entrada</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                Selecciona una conversación o inicia una sesión con el <span className="text-sky-500 font-bold">Tutor IA</span>.
              </p>
              <Button
                onClick={handleCreateTutorThread}
                className="w-full bg-sky-500 hover:bg-sky-600 text-white font-bold gap-2"
              >
                <Sparkles className="h-4 w-4" />
                Hablar con Tutor IA
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
