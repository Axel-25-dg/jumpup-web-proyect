import { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Save,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  Loader2
} from 'lucide-react'
import { Card, CardContent } from '@/presentation/components/ui/card'
import { Button } from '@/presentation/components/ui/button'
import { Input } from '@/presentation/components/ui/input'
import { Textarea } from '@/presentation/components/ui/textarea'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { courseRepo } from '@/infrastructure/factories/teacher.factory'

const formSchema = z.object({
  title: z.string().min(5, 'El título debe tener al menos 5 caracteres'),
  description: z.string().min(20, 'La descripción debe tener al menos 20 caracteres'),
})

type FormData = z.infer<typeof formSchema>

export default function CreateCoursePage() {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null)
  
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: ''
    }
  })

  const onSubmit = async (data: FormData, status: 'draft' | 'published' = 'published') => {
    setIsSubmitting(true)
    try {
      await courseRepo.createCourse({
        title: data.title,
        description: data.description,
        language: 1, // Defaulting to English (1) or Spanish
        language_name: 'Inglés',
        difficulty_level: 'B1', // default
        image_url: '',
        status,
        is_active: status === 'published'
      })
      toast.success(status === 'published' ? 'Curso publicado con éxito' : 'Borrador guardado')
      navigate('/teacher/courses')
    } catch (error: any) {
      console.error('Error creating course:', error)
      toast.error('Ocurrió un error al crear el curso')
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <form onSubmit={handleSubmit((data) => onSubmit(data, 'published'))} className="space-y-8 animate-in fade-in duration-700 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild className="rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">
            <Link to="/teacher/courses"><ArrowLeft className="h-5 w-5" /></Link>
          </Button>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Nuevo Curso</h1>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-1">Configura los detalles principales</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button 
            type="button"
            variant="outline" 
            className="h-12 rounded-xl font-bold"
            disabled={isSubmitting}
            onClick={handleSubmit((data) => onSubmit(data, 'draft'))}
          >
            Guardar Borrador
          </Button>
          <Button type="submit" disabled={isSubmitting} className="h-12 rounded-xl font-black bg-sky-600 hover:bg-sky-700 shadow-xl shadow-sky-500/20 px-6">
            {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
            Publicar Curso
          </Button>
        </div>
      </div>

      <div className="grid gap-8">
        <Card className="border-none shadow-2xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden">
          <CardContent className="p-8 space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-black text-slate-900 dark:text-white">Título del Curso</label>
              <Input 
                {...register('title')}
                placeholder="Ej. Inglés Nivel B2 - Avanzado" 
                className={`h-14 rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 font-medium text-lg ${errors.title ? 'border-red-500' : ''}`}
              />
              {errors.title && <span className="text-red-500 text-xs font-bold">{errors.title.message}</span>}
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-black text-slate-900 dark:text-white">Descripción General</label>
              <Textarea 
                {...register('description')}
                placeholder="Describe qué aprenderán los estudiantes en este curso..." 
                className={`min-h-[120px] rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 font-medium resize-none p-4 ${errors.description ? 'border-red-500' : ''}`}
              />
              {errors.description && <span className="text-red-500 text-xs font-bold">{errors.description.message}</span>}
            </div>
            
            <div className="space-y-2 pt-2">
              <label className="text-sm font-black text-slate-900 dark:text-white">Imagen de Portada (Opcional)</label>
              
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/png, image/jpeg" 
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setSelectedFileName(e.target.files[0].name)
                  }
                }} 
              />
              
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl p-8 text-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group"
              >
                <div className="h-16 w-16 rounded-2xl bg-sky-50 dark:bg-sky-900/20 text-sky-600 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <ImageIcon className="h-8 w-8" />
                </div>
                <h4 className="font-black text-slate-900 dark:text-white text-lg">
                  {selectedFileName ? selectedFileName : 'Haz clic para subir una imagen'}
                </h4>
                <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">PNG, JPG hasta 5MB (Recomendado 1200x800px)</p>
                <Button type="button" variant="outline" size="sm" className="mt-4 rounded-xl font-bold dark:border-slate-700 pointer-events-none">
                  <Upload className="mr-2 h-4 w-4" /> {selectedFileName ? 'Cambiar Imagen' : 'Seleccionar Archivo'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-2xl shadow-slate-200/50 dark:shadow-none bg-indigo-50/50 dark:bg-indigo-900/10 rounded-[2.5rem] overflow-hidden border border-indigo-100 dark:border-indigo-900/30">
          <CardContent className="p-8">
            <div className="flex gap-4">
              <div className="h-12 w-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 flex items-center justify-center shrink-0">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-indigo-900 dark:text-indigo-400">Siguiente Paso: Crear Módulos</h3>
                <p className="text-indigo-700/70 dark:text-indigo-300/70 font-medium text-sm mt-1 leading-relaxed">
                  Una vez guardes la información básica del curso, podrás comenzar a añadir Módulos, Lecciones y Ejercicios estructurados.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </form>
  )
}
