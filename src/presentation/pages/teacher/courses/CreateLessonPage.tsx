import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  Save,
  Video,
  FileText,
  Upload
} from 'lucide-react'
import { Card, CardContent } from '@/presentation/components/ui/card'
import { Button } from '@/presentation/components/ui/button'
import { Input } from '@/presentation/components/ui/input'
import { Textarea } from '@/presentation/components/ui/textarea'

export default function CreateLessonPage() {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  
  return (
    <div className="space-y-8 animate-in fade-in duration-700 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild className="rounded-xl hover:bg-slate-100">
            <Link to="/teacher/courses"><ArrowLeft className="h-5 w-5" /></Link>
          </Button>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Nueva Lección</h1>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-1">Crea el contenido de tu clase</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="h-12 rounded-xl font-bold">Cancelar</Button>
          <Button className="h-12 rounded-xl font-black bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-500/20 px-6">
            <Save className="mr-2 h-5 w-5" /> Publicar Lección
          </Button>
        </div>
      </div>

      <div className="grid gap-8">
        <Card className="border-none shadow-2xl shadow-slate-200/50 bg-white rounded-[2.5rem] overflow-hidden">
          <CardContent className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-black text-slate-900">Módulo Asociado</label>
                <div className="h-14 rounded-xl border-2 border-slate-100 bg-slate-50 font-bold text-slate-500 flex items-center px-4">
                  Selecciona un módulo...
                </div>
              </div>
              <div className="space-y-2">
                 <label className="text-sm font-black text-slate-900">Orden de Lección</label>
                 <Input 
                   type="number"
                   placeholder="Ej. 1" 
                   className="h-14 rounded-xl border-slate-200 bg-slate-50 font-medium"
                 />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-black text-slate-900">Título de la Lección</label>
              <Input 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej. Saludos y despedidas" 
                className="h-14 rounded-xl border-slate-200 bg-slate-50 font-medium text-lg"
              />
            </div>

            <div className="space-y-2 pt-2">
              <label className="text-sm font-black text-slate-900">Video de la Lección (Opcional)</label>
              <div className="border-2 border-dashed border-slate-200 rounded-3xl p-8 text-center hover:bg-slate-50 transition-colors cursor-pointer group">
                <div className="h-16 w-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Video className="h-8 w-8" />
                </div>
                <h4 className="font-black text-slate-900 text-lg">Haz clic para subir un video o enlazar URL</h4>
                <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">MP4, WebM o enlace a YouTube/Vimeo</p>
                <Button variant="outline" size="sm" className="mt-4 rounded-xl font-bold">
                  <Upload className="mr-2 h-4 w-4" /> Seleccionar Video
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-black text-slate-900">Contenido en Texto</label>
              <div className="relative">
                <FileText className="absolute left-4 top-4 h-5 w-5 text-slate-400" />
                <Textarea 
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Escribe el contenido detallado de tu lección aquí..." 
                  className="min-h-[200px] rounded-2xl border-slate-200 bg-slate-50 font-medium p-4 pl-12 resize-none"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
