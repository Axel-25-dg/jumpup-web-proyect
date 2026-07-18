import { useState } from 'react'
import {
  User,
  Mail,
  Lock,
  Camera,
  Save,
  Award,
  Globe
} from 'lucide-react'
import { Card, CardContent } from '@/presentation/components/ui/card'
import { Button } from '@/presentation/components/ui/button'
import { Input } from '@/presentation/components/ui/input'
import { Textarea } from '@/presentation/components/ui/textarea'
import { Avatar, AvatarFallback } from '@/presentation/components/ui/avatar'
import { useAuthStore } from '@/presentation/store/auth.store'

export default function TeacherProfilePage() {
  const user = useAuthStore((s) => s.user)
  const [name, setName] = useState(user?.username || '')
  const [email, setEmail] = useState(user?.email || '')
  const [bio, setBio] = useState('Educador apasionado por la enseñanza de idiomas.')
  const [language, setLanguage] = useState('Español')
  
  return (
    <div className="space-y-8 animate-in fade-in duration-700 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">Perfil Docente</h1>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-1">Configura tu información pública y privada</p>
        </div>
        <div className="flex gap-3">
          <Button className="h-12 rounded-2xl font-black bg-sky-600 hover:bg-sky-700 shadow-xl shadow-sky-500/20 px-6">
            <Save className="mr-2 h-5 w-5" /> Guardar Cambios
          </Button>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {/* Left Column: Avatar & Quick Info */}
        <div className="space-y-6">
          <Card className="border-none shadow-2xl shadow-slate-200/50 bg-white rounded-[2.5rem] overflow-hidden text-center">
            <div className="h-32 bg-gradient-to-r from-sky-400 to-indigo-500 w-full relative" />
            <CardContent className="px-6 pb-8 -mt-16 relative z-10 flex flex-col items-center">
              <div className="relative group cursor-pointer mb-4">
                <Avatar className="h-32 w-32 border-4 border-white shadow-xl">
                  <AvatarFallback className="bg-slate-100 text-sky-600 font-black text-4xl">
                    {name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                   <Camera className="h-8 w-8 text-white" />
                </div>
              </div>
              <h2 className="text-2xl font-black text-slate-900">{name}</h2>
              <p className="text-sm font-bold text-sky-600 uppercase tracking-widest mt-1">Docente Pro</p>
              
              <div className="flex gap-4 justify-center mt-6 w-full">
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex-1">
                   <Award className="h-6 w-6 text-amber-500 mx-auto mb-2" />
                   <p className="text-xl font-black text-slate-900">12</p>
                   <p className="text-[10px] font-bold text-slate-400 uppercase">Cursos</p>
                </div>
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex-1">
                   <User className="h-6 w-6 text-emerald-500 mx-auto mb-2" />
                   <p className="text-xl font-black text-slate-900">+500</p>
                   <p className="text-[10px] font-bold text-slate-400 uppercase">Alumnos</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Settings Form */}
        <div className="md:col-span-2 space-y-6">
          <Card className="border-none shadow-xl shadow-slate-200/50 bg-white rounded-[2.5rem] overflow-hidden">
            <CardContent className="p-8 space-y-6">
              <h3 className="text-xl font-black text-slate-900 mb-4">Información Personal</h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <User className="h-4 w-4 text-slate-400" /> Nombre Público
                  </label>
                  <Input 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-14 rounded-xl border-slate-200 bg-slate-50 font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <Mail className="h-4 w-4 text-slate-400" /> Correo Electrónico
                  </label>
                  <Input 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-14 rounded-xl border-slate-200 bg-slate-50 font-medium"
                  />
                </div>
              </div>

              <div className="space-y-2">
                 <label className="text-sm font-black text-slate-900">Biografía Pública</label>
                 <Textarea 
                   value={bio}
                   onChange={(e) => setBio(e.target.value)}
                   className="min-h-[120px] rounded-xl border-slate-200 bg-slate-50 font-medium resize-none p-4"
                 />
                 <p className="text-xs font-bold text-slate-400 mt-1">Los estudiantes verán esto en tu perfil.</p>
              </div>
              
              <div className="space-y-2">
                  <label className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <Globe className="h-4 w-4 text-slate-400" /> Idioma Principal
                  </label>
                  <Input 
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="h-14 rounded-xl border-slate-200 bg-slate-50 font-medium md:max-w-xs"
                  />
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl shadow-slate-200/50 bg-white rounded-[2.5rem] overflow-hidden">
            <CardContent className="p-8 space-y-6">
              <h3 className="text-xl font-black text-slate-900 mb-4 flex items-center gap-2">
                <Lock className="h-5 w-5 text-rose-500" /> Seguridad
              </h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-black text-slate-900">Nueva Contraseña</label>
                  <Input 
                    type="password"
                    placeholder="••••••••"
                    className="h-14 rounded-xl border-slate-200 bg-slate-50 font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-black text-slate-900">Confirmar Contraseña</label>
                  <Input 
                    type="password"
                    placeholder="••••••••"
                    className="h-14 rounded-xl border-slate-200 bg-slate-50 font-medium"
                  />
                </div>
              </div>
              <Button variant="outline" className="h-12 rounded-xl font-bold mt-4 text-rose-600 border-rose-200 hover:bg-rose-50">
                 Actualizar Contraseña
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
