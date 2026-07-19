import { useState, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Save,
  Loader2,
  Layout,
  BookOpen,
  User,
  FileText,
  Settings
} from 'lucide-react'
import { Button } from '@/presentation/components/ui/button'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { apiClient } from '@/infrastructure/http/axios-client'
import type { PaginatedResult } from '@/domain/entities/paginated-result.entity'
import type { AdminUser } from '@/domain/entities/admin-user.entity'
import {
  getAdminClassroomByIdUseCase,
  createAdminClassroomUseCase,
  updateAdminClassroomUseCase,
} from '@/infrastructure/factories/admin.factory'
import { courseRepo } from '@/infrastructure/factories/teacher.factory'
import type { Course } from '@/domain/entities/course.entity'

const formSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres').max(200, 'El nombre es demasiado largo'),
  course: z.string().min(1, 'Selecciona un curso'),
  teacher: z.string().min(1, 'Selecciona un profesor'),
  description: z.string().max(500, 'Máximo 500 caracteres').optional().or(z.literal('')),
})

type FormData = z.infer<typeof formSchema>

export default function AdminClassroomFormPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(isEdit)
  const [courses, setCourses] = useState<Course[]>([])
  const [teachers, setTeachers] = useState<AdminUser[]>([])
  const [isLoadingTeachers, setIsLoadingTeachers] = useState(true)

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: '', course: '', teacher: '', description: '' }
  })

  useEffect(() => {
    const loadData = async () => {
      try {
        const [coursesData, teachersData] = await Promise.all([
          courseRepo.getAll(),
          apiClient.get<PaginatedResult<AdminUser>>('/users/', { params: { page_size: 100 } }),
        ])
        setCourses(coursesData.results || [])
        const allStaff = teachersData.data.results || []
        setTeachers(allStaff.filter(u => u.role?.name === 'teacher'))
        setIsLoadingTeachers(false)
        
        if (isEdit && id) {
          const classroom = await getAdminClassroomByIdUseCase.execute(Number(id))
          reset({
            name: classroom.name,
            course: String(classroom.course || ''),
            teacher: String(classroom.teacher || classroom.teacher_id || ''),
            description: classroom.description || '',
          })
        }
      } catch (error) {
        console.error('Error loading data:', error)
        toast.error('Error al cargar los datos')
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [id, isEdit, reset])

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true)
    try {
      const payload = {
        name: data.name,
        course: Number(data.course),
        teacher: Number(data.teacher),
        description: data.description || undefined,
      }
      
      if (isEdit && id) {
        await updateAdminClassroomUseCase.execute(Number(id), payload)
        toast.success('Aula actualizada con éxito')
      } else {
        await createAdminClassroomUseCase.execute(payload)
        toast.success('Aula creada con éxito')
      }
      navigate('/admin/classrooms')
    } catch (error: any) {
      console.error('Error saving classroom:', error)
      toast.error(error.message || 'Error al guardar el aula')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
        <p className="label-caps text-slate-400">Sincronizando Unidad Operativa...</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="animate-in fade-in duration-500 pb-20">
      {/* HERO SECTION */}
      <section className="border-b border-slate-900/10 dark:border-white/10 px-8 md:px-12 py-14 md:py-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Button type="button" variant="ghost" size="icon" asChild className="-ml-2 rounded-none hover:bg-slate-100 dark:hover:bg-white/5">
                <Link to="/admin/classrooms"><ArrowLeft className="h-4 w-4" /></Link>
              </Button>
              <div className="chip">
                <Layout className="h-3.5 w-3.5 text-sky-500" />
                Unidades Operativas
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white uppercase">
              {isEdit ? 'Editar' : 'Nueva'} <span className="text-sky-500">Aula</span>.
            </h1>
            <p className="text-base text-slate-500 dark:text-slate-400 max-w-lg font-medium">
              Gestión de espacios educativos, asignación de docentes y vinculación curricular.
            </p>
          </div>
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/admin/classrooms')}
              className="rounded-none border-slate-900/10 dark:border-white/10 font-bold uppercase text-[11px] tracking-[0.2em] px-8 py-6 h-auto hover:bg-slate-50 dark:hover:bg-white/5 transition-all"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="rounded-none bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold uppercase text-[11px] tracking-[0.2em] px-8 py-6 h-auto hover:bg-sky-500 dark:hover:bg-sky-500 hover:text-white transition-all shadow-none"
            >
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {isEdit ? 'Actualizar Registro' : 'Crear Aula'}
            </Button>
          </div>
        </div>
      </section>

      {/* FORM BODY */}
      <div className="max-w-6xl mx-auto px-8 md:px-12 py-12">
        <div className="grid lg:grid-cols-[1fr_350px] gap-12">
          {/* Main Fields */}
          <div className="space-y-12">
            {/* Config Group */}
            <div className="space-y-8">
              <div className="flex items-center gap-3 border-b border-slate-900/10 dark:border-white/10 pb-4">
                <Settings className="h-5 w-5 text-sky-500" />
                <h2 className="label-caps text-slate-900 dark:text-white font-black">Identificación y Metadatos</h2>
              </div>

              <div className="space-y-2">
                <label className="label-caps text-slate-400 text-[10px]">Nombre del Aula <span className="text-sky-500">*</span></label>
                <input
                  {...register('name')}
                  placeholder="EJ. INGLÉS B2 - GRUPO MAÑANA"
                  className={`w-full border ${errors.name ? 'border-rose-500' : 'border-slate-900/10 dark:border-white/10'} bg-transparent py-4 px-4 text-[12px] font-bold uppercase tracking-widest outline-none focus:border-sky-500 transition-colors`}
                />
                {errors.name && <p className="text-[10px] text-rose-500 font-mono mt-1">{errors.name.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="label-caps text-slate-400 text-[10px]">Descripción Operativa</label>
                <div className="relative">
                   <FileText className="absolute left-4 top-4 h-4 w-4 text-slate-300" />
                   <textarea
                    {...register('description')}
                    placeholder="DETALLES SOBRE EL HORARIO, MODALIDAD O REQUERIMIENTOS..."
                    className={`w-full min-h-32 border ${errors.description ? 'border-rose-500' : 'border-slate-900/10 dark:border-white/10'} bg-transparent py-4 pl-12 pr-4 text-[12px] font-medium uppercase tracking-wider outline-none focus:border-sky-500 transition-colors resize-none`}
                  />
                </div>
                {errors.description && <p className="text-[10px] text-rose-500 font-mono mt-1">{errors.description.message}</p>}
              </div>
            </div>
          </div>

          {/* Sidebar / Settings */}
          <div className="space-y-8">
            <div className="p-8 border border-slate-900/10 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02]">
              <h3 className="label-caps text-slate-900 dark:text-white font-black mb-6">Vinculación Técnica</h3>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="label-caps text-slate-400 text-[10px]">Curso Base</label>
                  <div className="relative">
                    <select
                      {...register('course')}
                      className={`w-full appearance-none border ${errors.course ? 'border-rose-500' : 'border-slate-900/10 dark:border-white/10'} bg-white dark:bg-[#0a0a0b] py-4 px-4 text-[11px] font-bold uppercase tracking-widest outline-none focus:border-sky-500 transition-colors`}
                    >
                      <option value="">SELECCIONAR CURSO...</option>
                      {courses.map(c => (
                        <option key={c.id} value={c.id}>{c.title.toUpperCase()} — {c.difficulty_level}</option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none border-l border-slate-900/10 dark:border-white/10 pl-3">
                      <BookOpen className="h-4 w-4 text-slate-300" />
                    </div>
                  </div>
                  {errors.course && <p className="text-[10px] text-rose-500 font-mono mt-1">{errors.course.message}</p>}
                </div>

                <div className="space-y-2">
                  <label className="label-caps text-slate-400 text-[10px]">Docente Responsable</label>
                  <div className="relative">
                    <select
                      {...register('teacher')}
                      disabled={isLoadingTeachers}
                      className={`w-full appearance-none border ${errors.teacher ? 'border-rose-500' : 'border-slate-900/10 dark:border-white/10'} bg-white dark:bg-[#0a0a0b] py-4 px-4 text-[11px] font-bold uppercase tracking-widest outline-none focus:border-sky-500 transition-colors disabled:opacity-50`}
                    >
                      <option value="">SELECCIONAR DOCENTE...</option>
                      {teachers.map(t => (
                        <option key={t.id} value={t.id}>
                          {t.first_name || t.last_name ? `${t.first_name} ${t.last_name}`.toUpperCase() : t.username.toUpperCase()}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none border-l border-slate-900/10 dark:border-white/10 pl-3">
                      {isLoadingTeachers ? <Loader2 className="h-4 w-4 text-slate-300 animate-spin" /> : <User className="h-4 w-4 text-slate-300" />}
                    </div>
                  </div>
                  {errors.teacher && <p className="text-[10px] text-rose-500 font-mono mt-1">{errors.teacher.message}</p>}
                </div>
              </div>
            </div>

            <div className="p-8 border border-slate-900/10 dark:border-white/10 border-dashed">
              <p className="label-micro text-slate-400 leading-relaxed font-mono">
                LA ASIGNACIÓN DE UN DOCENTE HABILITA EL ACCESO A LA BITÁCORA DE SESIONES Y CALIFICACIONES DE ESTA UNIDAD.
              </p>
            </div>
          </div>
        </div>
      </div>
    </form>
  )
}
