import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  Save,
  BookOpen
} from 'lucide-react'
import { Card, CardContent } from '@/presentation/components/ui/card'
import { Button } from '@/presentation/components/ui/button'
import { Input } from '@/presentation/components/ui/input'
import { Textarea } from '@/presentation/components/ui/textarea'

export default function CreateModulePage() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  
  return (
    <div className="space-y-8 animate-in fade-in duration-700 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild className="rounded-xl hover:bg-slate-100">
            <Link to="/teacher/courses"><ArrowLeft className="h-5 w-5" /></Link>
          </Button>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Nuevo Módulo</h1>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-1">Estructura temática de tu curso</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="h-12 rounded-xl font-bold">Cancelar</Button>
          <Button className="h-12 rounded-xl font-black bg-sky-600 hover:bg-sky-700 shadow-xl shadow-sky-500/20 px-6">
            <Save className="mr-2 h-5 w-5" /> Guardar Módulo
          </Button>
        </div>
      </div>

      <div className="grid gap-8">
        <Card className="border-none shadow-2xl shadow-slate-200/50 bg-white rounded-[2.5rem] overflow-hidden">
          <CardContent className="p-8 space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-black text-slate-900">Curso Asociado</label>
              <div className="h-14 rounded-xl border-2 border-slate-100 bg-slate-50 font-bold text-slate-500 flex items-center px-4">
                <BookOpen className="h-5 w-5 mr-3 text-slate-400" />
                Selecciona un curso...
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-black text-slate-900">Título del Módulo</label>
              <Input 
                value={title}
                onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setTitle(e.target.value)}
                placeholder="Ej. Unidad 1: Fundamentos del idioma" 
                className="h-14 rounded-xl border-slate-200 bg-slate-50 font-medium text-lg"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-black text-slate-900">Descripción del Módulo</label>
              <Textarea 
                value={description}
                onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setDescription(e.target.value)}
                placeholder="Describe los objetivos específicos de este módulo..." 
                className="min-h-[120px] rounded-xl border-slate-200 bg-slate-50 font-medium resize-none p-4"
              />
            </div>
            
            <div className="space-y-2">
               <label className="text-sm font-black text-slate-900">Orden del Módulo</label>
               <Input 
                 type="number"
                 placeholder="Ej. 1" 
                 className="h-14 rounded-xl border-slate-200 bg-slate-50 font-medium w-full sm:max-w-[150px]"
               />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
