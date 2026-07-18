import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  Save,
  Users
} from 'lucide-react'
import { Card, CardContent } from '@/presentation/components/ui/card'
import { Button } from '@/presentation/components/ui/button'
import { Input } from '@/presentation/components/ui/input'
import { Textarea } from '@/presentation/components/ui/textarea'

export default function CreateClassroomPage() {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  
  return (
    <div className="space-y-8 animate-in fade-in duration-700 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild className="rounded-xl hover:bg-slate-100">
            <Link to="/classrooms"><ArrowLeft className="h-5 w-5" /></Link>
          </Button>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Nueva Aula</h1>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-1">Crea un espacio de estudio para tus alumnos</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="h-12 rounded-xl font-bold">Cancelar</Button>
          <Button className="h-12 rounded-xl font-black bg-rose-600 hover:bg-rose-700 shadow-xl shadow-rose-500/20 px-6">
            <Save className="mr-2 h-5 w-5" /> Crear Aula
          </Button>
        </div>
      </div>

      <div className="grid gap-8">
        <Card className="border-none shadow-2xl shadow-slate-200/50 bg-white rounded-[2.5rem] overflow-hidden">
          <CardContent className="p-8 space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-black text-slate-900">Nombre del Aula</label>
              <Input 
                value={name}
                onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setName(e.target.value)}
                placeholder="Ej. Nivel B2 - Grupo Mañana" 
                className="h-14 rounded-xl border-slate-200 bg-slate-50 font-medium text-lg"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-black text-slate-900">Descripción (Opcional)</label>
              <Textarea 
                value={description}
                onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setDescription(e.target.value)}
                placeholder="Describe el propósito o el enfoque de este grupo..." 
                className="min-h-[120px] rounded-xl border-slate-200 bg-slate-50 font-medium resize-none p-4"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-black text-slate-900">Código de Acceso Privado (Opcional)</label>
              <Input 
                type="text"
                placeholder="Ej. PASS123" 
                className="h-14 rounded-xl border-slate-200 bg-slate-50 font-medium sm:max-w-xs"
              />
              <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">Si lo dejas en blanco, el aula será pública (sujeta a tu aprobación).</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-2xl shadow-slate-200/50 bg-amber-50/50 rounded-[2.5rem] overflow-hidden border border-amber-100">
          <CardContent className="p-8">
            <div className="flex gap-4">
              <div className="h-12 w-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-amber-900">Siguiente Paso: Invitar Alumnos</h3>
                <p className="text-amber-700/70 font-medium text-sm mt-1 leading-relaxed">
                  Una vez que el aula sea creada, recibirás un enlace de invitación que podrás compartir directamente con tus alumnos para que se unan a este espacio privado.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
