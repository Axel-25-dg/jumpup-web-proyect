import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  Save,
  Upload,
  Image as ImageIcon,
  CheckCircle2
} from 'lucide-react'
import { Card, CardContent } from '@/presentation/components/ui/card'
import { Button } from '@/presentation/components/ui/button'
import { Input } from '@/presentation/components/ui/input'
import { Textarea } from '@/presentation/components/ui/textarea'

export default function CreateCoursePage() {
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
            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Nuevo Curso</h1>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-1">Configura los detalles principales</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="h-12 rounded-xl font-bold">Guardar Borrador</Button>
          <Button className="h-12 rounded-xl font-black bg-sky-600 hover:bg-sky-700 shadow-xl shadow-sky-500/20 px-6">
            <Save className="mr-2 h-5 w-5" /> Publicar Curso
          </Button>
        </div>
      </div>

      <div className="grid gap-8">
        <Card className="border-none shadow-2xl shadow-slate-200/50 bg-white rounded-[2.5rem] overflow-hidden">
          <CardContent className="p-8 space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-black text-slate-900">Título del Curso</label>
              <Input 
                value={title}
                onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setTitle(e.target.value)}
                placeholder="Ej. Inglés Nivel B2 - Avanzado" 
                className="h-14 rounded-xl border-slate-200 bg-slate-50 font-medium text-lg"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-black text-slate-900">Descripción General</label>
              <Textarea 
                value={description}
                onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setDescription(e.target.value)}
                placeholder="Describe qué aprenderán los estudiantes en este curso..." 
                className="min-h-[120px] rounded-xl border-slate-200 bg-slate-50 font-medium resize-none p-4"
              />
            </div>
            
            <div className="space-y-2 pt-2">
              <label className="text-sm font-black text-slate-900">Imagen de Portada</label>
              <div className="border-2 border-dashed border-slate-200 rounded-3xl p-8 text-center hover:bg-slate-50 transition-colors cursor-pointer group">
                <div className="h-16 w-16 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <ImageIcon className="h-8 w-8" />
                </div>
                <h4 className="font-black text-slate-900 text-lg">Haz clic para subir una imagen</h4>
                <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">PNG, JPG hasta 5MB (Recomendado 1200x800px)</p>
                <Button variant="outline" size="sm" className="mt-4 rounded-xl font-bold">
                  <Upload className="mr-2 h-4 w-4" /> Seleccionar Archivo
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-2xl shadow-slate-200/50 bg-indigo-50/50 rounded-[2.5rem] overflow-hidden border border-indigo-100">
          <CardContent className="p-8">
            <div className="flex gap-4">
              <div className="h-12 w-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-indigo-900">Siguiente Paso: Crear Módulos</h3>
                <p className="text-indigo-700/70 font-medium text-sm mt-1 leading-relaxed">
                  Una vez guardes la información básica del curso, podrás comenzar a añadir Módulos, Lecciones y Ejercicios estructurados.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
