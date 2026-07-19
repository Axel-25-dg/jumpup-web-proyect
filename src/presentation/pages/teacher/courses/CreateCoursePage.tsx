import { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Save,
  Loader2,
  Image as ImageIcon,
  BookOpen
} from 'lucide-react'
import { Button } from '@/presentation/components/ui/button'
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
    <form onSubmit={handleSubmit((data) => onSubmit(data, 'published'))} className="animate-in fade-in duration-700">
      {/* Header */}
      <section className="border-b border-slate-900/10 dark:border-white/10 px-8 md:px-12 py-14">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-4">
             <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild className="h-10 w-10 rounded-none border border-slate-900/10 dark:border-white/10">
                  <Link to="/teacher/courses"><ArrowLeft className="h-4 w-4" /></Link>
                </Button>
                <div className="chip">
                  <BookOpen className="h-3.5 w-3.5 text-sky-500" />
                  Nuevo Curso
                </div>
             </div>
             <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white uppercase">
               Diseñar <span className="text-sky-500">Programa</span>
             </h1>
          </div>
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              className="rounded-none font-bold uppercase text-[11px] tracking-widest px-8 h-12"
              onClick={handleSubmit((data) => onSubmit(data, 'draft'))}
              disabled={isSubmitting}
            >
              Guardar Borrador
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="rounded-none bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black uppercase text-[11px] tracking-widest px-8 h-12 hover:bg-sky-500 dark:hover:bg-sky-500 hover:text-white transition-all"
            >
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Publicar Curso
            </Button>
          </div>
        </div>
      </section>

      <div className="px-8 md:px-12 py-12 max-w-5xl">
        <div className="grid gap-px bg-slate-900/10 dark:bg-white/10 border border-slate-900/10 dark:border-white/10">
          <div className="bg-white dark:bg-[#0a0a0b] p-8 md:p-12 space-y-12">
            <div className="space-y-4">
              <label className="label-caps text-slate-900 dark:text-white">
                Título del Curso <span className="text-rose-500">*</span>
              </label>
              <input
                {...register('title')}
                placeholder="EJ. INGLÉS NIVEL B2 - AVANZADO"
                className={`w-full border-b-2 bg-transparent py-4 text-3xl font-black uppercase tracking-tight outline-none transition-colors ${
                  errors.title ? 'border-rose-500 text-rose-500' : 'border-slate-900/10 dark:border-white/10 focus:border-sky-500'
                }`}
              />
              {errors.title && <p className="label-micro text-rose-500 font-bold">{String(errors.title.message)}</p>}
            </div>

            <div className="space-y-4">
              <label className="label-caps text-slate-900 dark:text-white">
                Descripción del Programa <span className="text-rose-500">*</span>
              </label>
              <textarea
                {...register('description')}
                rows={4}
                placeholder="DESCRIBE QUÉ APRENDERÁN LOS ESTUDIANTES EN ESTE CURSO..."
                className={`w-full border rounded-none bg-transparent p-6 text-[11px] font-bold uppercase tracking-widest outline-none transition-colors resize-none ${
                  errors.description ? 'border-rose-500' : 'border-slate-900/10 dark:border-white/10 focus:border-sky-500'
                }`}
              />
              {errors.description && <p className="label-micro text-rose-500 font-bold">{String(errors.description.message)}</p>}
            </div>

            <div className="space-y-6 pt-4">
              <label className="label-caps text-slate-900 dark:text-white flex items-center gap-2">
                 Imagen de Portada <span className="text-slate-400 font-medium lowercase">(opcional)</span>
              </label>

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
                className="border-2 border-dashed border-slate-900/10 dark:border-white/10 p-12 text-center hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors cursor-pointer group"
              >
                <div className="h-16 w-16 border border-slate-900/10 dark:border-white/10 flex items-center justify-center mx-auto mb-6 group-hover:bg-sky-500 group-hover:text-white transition-all">
                  <ImageIcon className="h-6 w-6" />
                </div>
                <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">
                  {selectedFileName ? selectedFileName : 'Haz clic para subir una imagen'}
                </h4>
                <p className="label-micro text-slate-400 mt-2">PNG, JPG HASTA 5MB — RECOMENDADO 1200X800PX</p>
                <div className="mt-8">
                   <span className="label-caps px-6 py-2 border border-slate-900 dark:border-white text-slate-900 dark:text-white text-[10px] group-hover:bg-slate-900 group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-all">
                     {selectedFileName ? 'CAMBIAR ARCHIVO' : 'SELECCIONAR PORTADA'}
                   </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 p-8 border border-sky-500/20 bg-sky-500/[0.02] flex gap-6 items-start">
           <div className="h-12 w-12 border border-sky-500/30 flex items-center justify-center text-sky-500 shrink-0">
              <BookOpen className="h-6 w-6" />
           </div>
           <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight mb-1">Siguiente Paso: Estructura del Curso</h3>
              <p className="label-micro text-slate-500 dark:text-slate-400 leading-relaxed max-w-2xl">
                AL GUARDAR LA INFORMACIÓN BÁSICA, PODRÁS COMENZAR A AÑADIR MÓDULOS, LECCIONES Y EJERCICIOS PARA COMPLETAR EL CURRÍCULO EDUCATIVO.
              </p>
           </div>
        </div>
      </div>
    </form>
  )
}
