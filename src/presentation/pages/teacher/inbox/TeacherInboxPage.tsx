import { useState, useEffect } from 'react'
import {
  Search,
  MessageSquare,
  Send,
  MoreVertical,
  Paperclip,
  Image as ImageIcon
} from 'lucide-react'
import { Card, } from '@/presentation/components/ui/card'
import { Button } from '@/presentation/components/ui/button'
import { Input } from '@/presentation/components/ui/input'
import { Avatar, AvatarFallback } from '@/presentation/components/ui/avatar'
import { Skeleton } from '@/presentation/components/ui/skeleton'
import { getContactsUseCase, getMessagesUseCase } from '@/infrastructure/factories/teacher.factory'
import { useAuthStore } from '@/presentation/store/auth.store'
import type { Contact, Message } from '@/domain/entities/message.entity'

export default function TeacherInboxPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [contacts, setContacts] = useState<Contact[]>([])
  const [activeContact, setActiveContact] = useState<Contact | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [message, setMessage] = useState('')
  const [isLoadingContacts, setIsLoadingContacts] = useState(true)
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
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
      } finally {
        setIsLoadingMessages(false)
      }
    }
    fetchMessages()
  }, [user?.user_id, activeContact?.id])

  const filteredContacts = contacts.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6 animate-in fade-in duration-700 h-[calc(100vh-120px)] flex flex-col">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Bandeja de Entrada</h1>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-1">Comunícate con tus estudiantes</p>
        </div>
      </div>

      <Card className="border-none shadow-2xl shadow-slate-200/50 bg-white rounded-[2.5rem] overflow-hidden flex-1 flex flex-col md:flex-row h-full">
        {/* Sidebar Contacts */}
        <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-slate-100 flex flex-col h-full bg-slate-50/50">
          <div className="p-6">
             <div className="relative">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
               <Input 
                 placeholder="Buscar contacto..." 
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 className="h-12 pl-12 rounded-xl border-slate-200 bg-white font-medium"
               />
             </div>
          </div>
          
          <div className="flex-1 overflow-y-auto no-scrollbar pb-6">
            <div className="px-4 space-y-2">
              {isLoadingContacts ? (
                <div className="space-y-3">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="flex items-center gap-4 p-4">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredContacts.length > 0 ? (
                filteredContacts.map(contact => (
                  <button
                    key={contact.id}
                    onClick={() => setActiveContact(contact)}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all text-left ${activeContact?.id === contact.id ? 'bg-sky-50 shadow-sm border border-sky-100' : 'hover:bg-slate-100/50 border border-transparent'}`}
                  >
                    <div className="relative">
                      <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                        <AvatarFallback className="bg-gradient-to-br from-indigo-400 to-sky-500 text-white font-black">
                          {contact.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {contact.is_online && (
                        <span className="absolute bottom-0 right-0 h-3.5 w-3.5 bg-emerald-500 border-2 border-white rounded-full"></span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className={`text-sm font-black truncate ${activeContact?.id === contact.id ? 'text-sky-900' : 'text-slate-900'}`}>{contact.name}</h4>
                        <span className="text-[10px] font-bold text-slate-400">{new Date(contact.last_activity).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                      <p className={`text-xs font-bold truncate mt-0.5 ${activeContact?.id === contact.id ? 'text-sky-600' : 'text-slate-500'}`}>{contact.role}</p>
                    </div>
                    {contact.unread_count > 0 && (
                      <div className="h-5 w-5 rounded-full bg-rose-500 flex items-center justify-center text-[10px] font-black text-white shrink-0">
                        {contact.unread_count}
                      </div>
                    )}
                  </button>
                ))
              ) : (
                <div className="text-center py-10">
                  <p className="text-slate-400 font-medium text-sm">No hay contactos</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col h-full bg-white relative">
           {activeContact ? (
             <>
               {/* Chat Header */}
               <div className="h-20 border-b border-slate-100 flex items-center justify-between px-8 bg-white z-10 shrink-0">
                 <div className="flex items-center gap-4">
                    <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                      <AvatarFallback className="bg-gradient-to-br from-indigo-400 to-sky-500 text-white font-black text-xs">
                        {activeContact.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-black text-slate-900">{activeContact.name}</h3>
                      <p className="text-xs font-bold text-emerald-500">{activeContact.is_online ? 'En línea ahora' : 'Desconectado'}</p>
                    </div>
                 </div>
                 <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-slate-100">
                   <MoreVertical className="h-5 w-5 text-slate-500" />
                 </Button>
               </div>

               {/* Chat Messages */}
               <div className="flex-1 overflow-y-auto p-8 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-slate-50/50">
                  <div className="flex flex-col gap-6">
                    {isLoadingMessages ? (
                      <div className="flex justify-center"><p className="text-slate-400 text-sm">Cargando mensajes...</p></div>
                    ) : messages.length > 0 ? (
                      messages.map((msg) => {
                        const isMine = msg.sender_id === user?.user_id
                        return (
                          <div key={msg.id} className={`flex items-end gap-3 max-w-[80%] ${isMine ? 'self-end flex-row-reverse' : ''}`}>
                             {!isMine && (
                               <Avatar className="h-8 w-8 shrink-0">
                                 <AvatarFallback className="bg-gradient-to-br from-indigo-400 to-sky-500 text-white font-black text-[10px]">
                                   {activeContact.name.substring(0, 2).toUpperCase()}
                                 </AvatarFallback>
                               </Avatar>
                             )}
                             <div className={`${isMine ? 'bg-sky-600 shadow-md shadow-sky-500/20 text-white rounded-3xl rounded-br-sm' : 'bg-white border border-slate-100 shadow-sm rounded-3xl rounded-bl-sm'} p-4`}>
                                <p className={`text-sm font-medium ${isMine ? 'text-white' : 'text-slate-700'}`}>{msg.content}</p>
                                <span className={`text-[10px] font-bold mt-2 block ${isMine ? 'text-sky-200 text-right' : 'text-slate-400'}`}>
                                  {new Date(msg.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                             </div>
                          </div>
                        )
                      })
                    ) : (
                      <div className="text-center py-20 text-slate-400 text-sm font-medium">
                        No hay mensajes en esta conversación.
                      </div>
                    )}
                  </div>
               </div>

               {/* Chat Input */}
               <div className="p-4 md:p-6 bg-white border-t border-slate-100 shrink-0">
                  <div className="flex items-center gap-3">
                     <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl hover:bg-slate-100 shrink-0 text-slate-400">
                       <Paperclip className="h-5 w-5" />
                     </Button>
                     <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl hover:bg-slate-100 shrink-0 text-slate-400 hidden sm:flex">
                       <ImageIcon className="h-5 w-5" />
                     </Button>
                     <Input 
                       value={message}
                       onChange={(e) => setMessage(e.target.value)}
                       placeholder="Escribe un mensaje..."
                       className="h-14 rounded-2xl border-slate-200 bg-slate-50 font-medium"
                     />
                     <Button className="h-14 w-14 rounded-2xl bg-sky-600 hover:bg-sky-700 shadow-lg shadow-sky-500/20 shrink-0 p-0 flex items-center justify-center">
                       <Send className="h-5 w-5 ml-1" />
                     </Button>
                  </div>
               </div>
             </>
           ) : (
             <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
               <MessageSquare className="h-16 w-16 mb-4 opacity-20" />
               <p className="font-medium">Selecciona un contacto para iniciar</p>
             </div>
           )}
        </div>
      </Card>
    </div>
  )
}
