import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Save,
  Users,
  Loader2,
  Lock
} from 'lucide-react'
import { Button } from '@/presentation/components/ui/button'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { createClassroomUseCase, courseRepo } from '@/infrastructure/factories/teacher.factory'
import { useAuthStore } from '@/presentation/store/auth.store'
import type { Course } from '@/domain/entities/course.entity'

const formSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres').max(100, 'El nombre es demasiado largo'),
  course: z.string().min(1, 'Selecciona un curso al cual asociar el aula'),
  description: z.string().max(500, 'Máximo 500 caracteres').optional(),
  access_code: z.string().max(20, 'Máximo 20 caracteres').optional(),
})

type FormData = z.infer<typeof formSchema>

export default function CreateClassroomPage() {
  const navigate = useNavigate()
  const user = useAuthStore(s => s.user)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [courses, setCourses] = useState<Course[]>([])
  const [isLoadingCourses, setIsLoadingCourses] = useState(true)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: '', course: '', description: '', access_code: '' }
  })

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const result = await courseRepo.getAll()
        setCourses(result.results || [])
      } catch (err) {
        toast.error('No se pudieron cargar los cursos')
      } finally {
        setIsLoadingCourses(false)
      }
    }
    loadCourses()
  }, [])

  const onSubmit = async (data: FormData) => {
    const teacherId = user?.user_id || (user as any)?.id
    if (!teacherId) return
    setIsSubmitting(true)
    try {
      await createClassroomUseCase.execute({
        name: data.name,
        course: Number(data.course),
        description: data.description || undefined,
        teacher: teacherId,
        access_code: data.access_code || undefined,
      })
      toast.success(`Aula "${data.name}" creada con éxito`)
      navigate('/teacher/classrooms')
    } catch (error: any) {
      console.error('Error creating classroom:', error)
      toast.error(error?.detail || 'Ocurrió un error al crear el aula')
    } finally {
      setIsSubmitting(false)
    }
  }

  const onError = (errors: any) => {
    console.error('Form errors:', errors)
    toast.error('Por favor, revisa los campos en rojo')
  }

  return (
    <form onSubmit={handleSubmit(onSubmit, onError)} className="animate-in fade-in duration-700">
      {/* Header */}
      <section className="border-b border-slate-900/10 dark:border-white/10 px-8 md:px-12 py-14">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-4">
             <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild className="h-10 w-10 rounded-none border border-slate-900/10 dark:border-white/10">
                  <Link to="/teacher/classrooms"><ArrowLeft className="h-4 w-4" /></Link>
                </Button>
                <div className="chip">
                  <Users className="h-3.5 w-3.5 text-sky-500" />
                  Nueva Aula
                </div>
             </div>
             <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white uppercase">
               Crear <span className="text-sky-500">Espacio</span>
             </h1>
          </div>
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              className="rounded-none font-bold uppercase text-[11px] tracking-widest px-8 h-12"
              onClick={() => navigate('/teacher/classrooms')}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="rounded-none bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black uppercase text-[11px] tracking-widest px-8 h-12 hover:bg-sky-500 dark:hover:bg-sky-500 hover:text-white transition-all"
            >
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Guardar Aula
            </Button>
          </div>
        </div>
      </section>

      <div className="px-8 md:px-12 py-12 max-w-5xl">
        <div className="grid gap-px bg-slate-900/10 dark:bg-white/10 border border-slate-900/10 dark:border-white/10">
          <div className="bg-white dark:bg-[#0a0a0b] p-8 md:p-12 space-y-10">
            <div className="space-y-4">
              <label className="label-caps text-slate-900 dark:text-white">
                Nombre del Aula <span className="text-rose-500">*</span>
              </label>
              <input
                {...register('name')}
                placeholder="EJ. NIVEL B2 - GRUPO MAÑANA"
                className={`w-full border-b-2 bg-transparent py-4 text-2xl font-black uppercase tracking-tight outline-none transition-colors ${
                  errors.name ? 'border-rose-500 text-rose-500' : 'border-slate-900/10 dark:border-white/10 focus:border-sky-500'
                }`}
              />
              {errors.name && <p className="label-micro text-rose-500 font-bold">{String(errors.name.message)}</p>}
            </div>

            <div className="grid md:grid-cols-2 gap-10">
              <div className="space-y-4">
                <label className="label-caps text-slate-900 dark:text-white">
                  Curso Asociado <span className="text-rose-500">*</span>
                </label>
                {isLoadingCourses ? (
                  <div className="h-14 border border-slate-900/10 dark:border-white/10 animate-pulse bg-slate-50 dark:bg-white/5" />
                ) : (
                  <select
                    {...register('course')}
                    className={`w-full h-14 border rounded-none bg-transparent px-4 text-[11px] font-bold uppercase tracking-widest focus:outline-none focus:border-sky-500 transition-colors ${
                      errors.course ? 'border-rose-500 text-rose-500' : 'border-slate-900/10 dark:border-white/10'
                    }`}
                  >
                    <option value="" className="bg-white dark:bg-slate-900">SELECCIONAR CURSO...</option>
                    {courses.map(c => (
                      <option key={c.id} value={c.id} className="bg-white dark:bg-slate-900">{c.title.toUpperCase()}</option>
                    ))}
                  </select>
                )}
                {errors.course && <p className="label-micro text-rose-500 font-bold">{String(errors.course.message)}</p>}
              </div>

              <div className="space-y-4">
                <label className="label-caps text-slate-900 dark:text-white flex items-center gap-2">
                   Código de Acceso <Lock className="h-3.5 w-3.5 text-slate-400" />
                </label>
                <input
                  {...register('access_code')}
                  type="text"
                  placeholder="EJ. JUMP2024"
                  className={`w-full h-14 border rounded-none bg-transparent px-4 text-[11px] font-bold uppercase tracking-widest focus:outline-none focus:border-sky-500 transition-colors ${
                    errors.access_code ? 'border-rose-500 text-rose-500' : 'border-slate-900/10 dark:border-white/10'
                  }`}
                />
                <p className="label-micro text-slate-400">SI SE DEJA VACÍO, SERÁ DE ACCESO ABIERTO.</p>
                {errors.access_code && <p className="label-micro text-rose-500 font-bold">{String(errors.access_code.message)}</p>}
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <label className="label-caps text-slate-900 dark:text-white">Descripción del Grupo</label>
              <textarea
                {...register('description')}
                rows={4}
                placeholder="DESCRIBE EL PROPÓSITO O EL ENFOQUE DE ESTE GRUPO DE ESTUDIO..."
                className={`w-full border rounded-none bg-transparent p-6 text-[11px] font-bold uppercase tracking-widest outline-none transition-colors resize-none ${
                  errors.description ? 'border-rose-500' : 'border-slate-900/10 dark:border-white/10 focus:border-sky-500'
                }`}
              />
              {errors.description && <p className="label-micro text-rose-500 font-bold">{String(errors.description.message)}</p>}
            </div>
          </div>
        </div>

        <div className="mt-12 p-8 border border-amber-500/20 bg-amber-500/[0.02] flex gap-6 items-start">
           <div className="h-12 w-12 border border-amber-500/30 flex items-center justify-center text-amber-500 shrink-0">
              <Users className="h-6 w-6" />
           </div>
           <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight mb-1">Siguiente Paso: Gestión de Alumnos</h3>
              <p className="label-micro text-slate-500 dark:text-slate-400 leading-relaxed max-w-2xl">
                AL FINALIZAR LA CREACIÓN, SERÁS REDIRIGIDO AL PANEL DE GESTIÓN DONDE PODRÁS APROBAR SOLICITUDES, ASIGNAR MATERIALES Y MONITOREAR EL DESEMPEÑO DE TUS ESTUDIANTES.
              </p>
           </div>
        </div>
      </div>
    </form>
  )
}
