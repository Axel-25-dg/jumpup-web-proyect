import { useState } from 'react'
import {
  Search,
  MessageSquare,
  Send,
  MoreVertical,
  Paperclip,
  Image as ImageIcon
} from 'lucide-react'
import { Card, CardContent } from '@/presentation/components/ui/card'
import { Button } from '@/presentation/components/ui/button'
import { Input } from '@/presentation/components/ui/input'
import { Avatar, AvatarFallback } from '@/presentation/components/ui/avatar'

const MOCK_CONTACTS = [
  { id: '1', name: 'Ana Silva', role: 'Estudiante B2', unread: 2, online: true, time: '10:42' },
  { id: '2', name: 'Carlos Ruiz', role: 'Estudiante A1', unread: 0, online: false, time: 'Ayer' },
  { id: '3', name: 'Maria Jose', role: 'Estudiante B2', unread: 0, online: true, time: 'Lun' },
  { id: '4', name: 'Soporte Técnico', role: 'Administración', unread: 1, online: true, time: '12:00' },
]

export default function TeacherInboxPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [activeContact, setActiveContact] = useState(MOCK_CONTACTS[0])
  const [message, setMessage] = useState('')

  const filteredContacts = MOCK_CONTACTS.filter(c => 
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
              {filteredContacts.map(contact => (
                <button
                  key={contact.id}
                  onClick={() => setActiveContact(contact)}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all text-left ${activeContact.id === contact.id ? 'bg-sky-50 shadow-sm border border-sky-100' : 'hover:bg-slate-100/50 border border-transparent'}`}
                >
                  <div className="relative">
                    <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                      <AvatarFallback className="bg-gradient-to-br from-indigo-400 to-sky-500 text-white font-black">
                        {contact.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {contact.online && (
                      <span className="absolute bottom-0 right-0 h-3.5 w-3.5 bg-emerald-500 border-2 border-white rounded-full"></span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className={`text-sm font-black truncate ${activeContact.id === contact.id ? 'text-sky-900' : 'text-slate-900'}`}>{contact.name}</h4>
                      <span className="text-[10px] font-bold text-slate-400">{contact.time}</span>
                    </div>
                    <p className={`text-xs font-bold truncate mt-0.5 ${activeContact.id === contact.id ? 'text-sky-600' : 'text-slate-500'}`}>{contact.role}</p>
                  </div>
                  {contact.unread > 0 && (
                    <div className="h-5 w-5 rounded-full bg-rose-500 flex items-center justify-center text-[10px] font-black text-white shrink-0">
                      {contact.unread}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col h-full bg-white relative">
           {/* Chat Header */}
           <div className="h-20 border-b border-slate-100 flex items-center justify-between px-8 bg-white z-10">
             <div className="flex items-center gap-4">
                <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                  <AvatarFallback className="bg-gradient-to-br from-indigo-400 to-sky-500 text-white font-black text-xs">
                    {activeContact.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-black text-slate-900">{activeContact.name}</h3>
                  <p className="text-xs font-bold text-emerald-500">{activeContact.online ? 'En línea ahora' : 'Desconectado'}</p>
                </div>
             </div>
             <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-slate-100">
               <MoreVertical className="h-5 w-5 text-slate-500" />
             </Button>
           </div>

           {/* Chat Messages */}
           <div className="flex-1 overflow-y-auto p-8 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-slate-50/50">
              <div className="flex flex-col gap-6">
                 {/* Mensaje de otro */}
                 <div className="flex items-end gap-3 max-w-[80%]">
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarFallback className="bg-gradient-to-br from-indigo-400 to-sky-500 text-white font-black text-[10px]">
                        {activeContact.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-white border border-slate-100 shadow-sm p-4 rounded-3xl rounded-bl-sm">
                       <p className="text-sm font-medium text-slate-700">Hola profe, tengo una duda sobre la lección de ayer. ¿Cuándo usamos "did" y cuándo "was"?</p>
                       <span className="text-[10px] font-bold text-slate-400 mt-2 block">10:40 AM</span>
                    </div>
                 </div>

                 {/* Mensaje propio */}
                 <div className="flex items-end gap-3 max-w-[80%] self-end flex-row-reverse">
                    <div className="bg-sky-600 shadow-md shadow-sky-500/20 p-4 rounded-3xl rounded-br-sm text-white">
                       <p className="text-sm font-medium">¡Hola Ana! Es muy sencillo: usamos "did" para verbos de acción en pasado (ej: I did my homework), y "was/were" para el verbo ser/estar (ej: I was happy).</p>
                       <span className="text-[10px] font-bold text-sky-200 mt-2 block text-right">10:45 AM</span>
                    </div>
                 </div>
              </div>
           </div>

           {/* Chat Input */}
           <div className="p-4 md:p-6 bg-white border-t border-slate-100">
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
        </div>
      </Card>
    </div>
  )
}
