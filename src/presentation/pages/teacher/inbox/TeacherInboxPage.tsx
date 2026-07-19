import { useState, useEffect } from 'react'
import {
  Search,
  MessageSquare,
  Send,
  MoreVertical,
  Paperclip,
  Image as ImageIcon,
  Loader2
} from 'lucide-react'
import { Button } from '@/presentation/components/ui/button'
import { getContactsUseCase, getMessagesUseCase, sendMessageUseCase } from '@/infrastructure/factories/teacher.factory'
import { useAuthStore } from '@/presentation/store/auth.store'
import type { Contact, Message } from '@/domain/entities/message.entity'
import { toast } from 'sonner'

export default function TeacherInboxPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [contacts, setContacts] = useState<Contact[]>([])
  const [activeContact, setActiveContact] = useState<Contact | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [message, setMessage] = useState('')
  const [isLoadingContacts, setIsLoadingContacts] = useState(true)
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const user = useAuthStore(s => s.user)

  useEffect(() => {
    const fetchContacts = async () => {
      if (!user?.user_id) return
      try {
        const result = await getContactsUseCase.execute(user.user_id)
        setContacts(result || [])
        if (result && result.length > 0) {
          setActiveContact(result[0])
        }
      } catch (error) {
        console.error('Error fetching contacts:', error)
        toast.error('Ocurrió un error al cargar tus contactos')
      } finally {
        setIsLoadingContacts(false)
      }
    }
    fetchContacts()
  }, [user?.user_id])

  useEffect(() => {
    const fetchMessages = async () => {
      if (!user?.user_id || !activeContact) return
      setIsLoadingMessages(true)
      try {
        const result = await getMessagesUseCase.execute(user.user_id, activeContact.id)
        setMessages(result || [])
      } catch (error) {
        console.error('Error fetching messages:', error)
        toast.error('No se pudieron cargar los mensajes')
      } finally {
        setIsLoadingMessages(false)
      }
    }
    fetchMessages()
  }, [user?.user_id, activeContact?.id])

  const filteredContacts = contacts.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!message.trim() || !user?.user_id || !activeContact) return

    const newMessageText = message.trim()
    setMessage('')
    setIsSending(true)

    const optimisticMessage: Message = {
      id: Date.now(),
      sender_id: user.user_id,
      receiver_id: activeContact.id,
      content: newMessageText,
      sent_at: new Date().toISOString()
    }
    setMessages(prev => [...prev, optimisticMessage])

    try {
      const sent = await sendMessageUseCase.execute({
        sender_id: user.user_id,
        receiver_id: activeContact.id,
        content: newMessageText,
      })
      setMessages(prev => prev.map(m => m.id === optimisticMessage.id ? sent : m))
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('Error al enviar el mensaje')
      setMessages(prev => prev.filter(m => m.id !== optimisticMessage.id))
      setMessage(newMessageText)
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="animate-in fade-in duration-500 h-[calc(100vh-64px)] overflow-hidden">
      {/* Editorial Layout: Sidebar + Main */}
      <div className="grid grid-cols-1 lg:grid-cols-4 h-full bg-slate-900/10 dark:bg-white/10 gap-px">

        {/* SIDEBAR: Contacts */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-950 flex flex-col h-full overflow-hidden">
          <div className="p-8 border-b border-slate-900/10 dark:border-white/10">
            <h1 className="text-3xl font-black tracking-tighter uppercase mb-6">Mensajes.</h1>
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-sky-500 transition-colors" />
              <input
                type="text"
                placeholder="BUSCAR CONTACTO..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-12 pl-10 pr-4 bg-transparent border-b-2 border-slate-900/10 dark:border-white/10 focus:border-sky-500 outline-none label-caps transition-colors"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-900/5 dark:divide-white/5">
            {isLoadingContacts ? (
              [...Array(6)].map((_, i) => (
                <div key={i} className="p-8 animate-pulse flex items-center gap-4">
                  <div className="h-10 w-10 bg-slate-100 dark:bg-slate-800" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-2/3 bg-slate-100 dark:bg-slate-800" />
                    <div className="h-3 w-1/2 bg-slate-100 dark:bg-slate-800" />
                  </div>
                </div>
              ))
            ) : filteredContacts.length > 0 ? (
              filteredContacts.map(contact => (
                <button
                  key={contact.id}
                  onClick={() => setActiveContact(contact)}
                  className={`w-full p-8 text-left transition-all hover:bg-slate-50 dark:hover:bg-white/5 ${activeContact?.id === contact.id ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950' : ''}`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-black tracking-tight uppercase text-sm">{contact.name}</h4>
                    <span className={`label-micro ${activeContact?.id === contact.id ? 'text-slate-400' : 'text-slate-500'}`}>
                      {new Date(contact.last_activity).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className={`label-micro truncate ${activeContact?.id === contact.id ? 'text-slate-300' : 'text-slate-400'}`}>
                    {contact.role}
                  </p>
                  {contact.unread_count > 0 && activeContact?.id !== contact.id && (
                    <div className="mt-3 h-1.5 w-1.5 bg-sky-500 rounded-full" />
                  )}
                </button>
              ))
            ) : (
              <div className="p-12 text-center">
                <p className="label-caps text-slate-400">Sin contactos</p>
              </div>
            )}
          </div>
        </div>

        {/* MAIN: Chat Content */}
        <div className="lg:col-span-3 bg-white dark:bg-slate-950 flex flex-col h-full overflow-hidden">
          {activeContact ? (
            <>
              {/* Header */}
              <div className="px-8 h-20 border-b border-slate-900/10 dark:border-white/10 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 border border-slate-900/10 dark:border-white/10 flex items-center justify-center font-black text-xs uppercase">
                    {activeContact.name.substring(0, 2)}
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 dark:text-white tracking-tight uppercase">{activeContact.name}</h3>
                    <div className="flex items-center gap-2">
                      <span className={`h-1.5 w-1.5 rounded-full ${activeContact.is_online ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                      <span className="label-micro text-slate-400 uppercase">{activeContact.is_online ? 'En línea' : 'Desconectado'}</span>
                    </div>
                  </div>
                </div>
                <button className="h-10 w-10 flex items-center justify-center border border-transparent hover:border-slate-900/10 dark:hover:border-white/10 transition-colors">
                  <MoreVertical className="h-4 w-4 text-slate-400" />
                </button>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-slate-50/30 dark:bg-white/2">
                {isLoadingMessages ? (
                  <div className="flex justify-center py-20"><p className="label-caps text-slate-400 animate-pulse">Cargando conversación...</p></div>
                ) : messages.length > 0 ? (
                  messages.map((msg) => {
                    const isMine = msg.sender_id === user?.user_id
                    return (
                      <div key={msg.id} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                        <div className={`max-w-[80%] md:max-w-[60%] p-6 border-2 ${isMine ? 'bg-slate-900 border-slate-900 text-white dark:bg-white dark:border-white dark:text-slate-950' : 'bg-white border-slate-900/10 dark:bg-slate-900 dark:border-white/10 text-slate-900 dark:text-white'}`}>
                          <p className="text-sm font-medium leading-relaxed">{msg.content}</p>
                        </div>
                        <span className="label-micro text-slate-400 mt-2 uppercase">
                          {new Date(msg.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    )
                  })
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center opacity-30 grayscale">
                    <MessageSquare className="h-12 w-12 mb-4" />
                    <p className="label-caps">Comienza la conversación</p>
                  </div>
                )}
              </div>

              {/* Input Area */}
              <div className="p-8 border-t border-slate-900/10 dark:border-white/10 shrink-0">
                <form onSubmit={handleSendMessage} className="flex items-end gap-6">
                  <div className="flex items-center gap-2 mb-2">
                    <button type="button" className="h-10 w-10 flex items-center justify-center text-slate-400 hover:text-sky-500 transition-colors">
                      <Paperclip className="h-4 w-4" />
                    </button>
                    <button type="button" className="h-10 w-10 flex items-center justify-center text-slate-400 hover:text-sky-500 transition-colors hidden sm:flex">
                      <ImageIcon className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex-1">
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="ESCRIBE UN MENSAJE..."
                      rows={1}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          handleSendMessage()
                        }
                      }}
                      className="w-full bg-transparent border-b-2 border-slate-900/10 dark:border-white/10 focus:border-sky-500 outline-none py-3 font-bold transition-colors resize-none overflow-hidden"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={isSending || !message.trim()}
                    size="lg"
                    className="h-14 w-14 p-0 shrink-0 flex items-center justify-center"
                  >
                    {isSending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-20 opacity-20 grayscale">
              <div className="flex h-24 w-24 items-center justify-center border-4 border-slate-900 dark:border-white mb-8">
                <MessageSquare className="h-10 w-10" />
              </div>
              <h2 className="text-2xl font-black uppercase tracking-tighter">Selecciona un contacto.</h2>
              <p className="label-caps mt-2">Para iniciar una conversación</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
