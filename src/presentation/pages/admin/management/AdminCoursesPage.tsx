import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  BookOpen,
  Plus,
  Search,
  MoreVertical,
  Edit2,
  Trash2,
  Users,
  Eye,
  AlertCircle,
  ArrowLeft
} from 'lucide-react'
import { Button } from '@/presentation/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/presentation/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/presentation/components/ui/alert-dialog'
import { toast } from 'sonner'
import { courseRepo } from '@/infrastructure/factories/teacher.factory'
import type { Course } from '@/domain/entities/course.entity'

export default function AdminCoursesPage() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'draft'>('all')
  const [courses, setCourses] = useState<Course[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // El backend Django no expone is_active en el serializer, pero el modelo
  // crea cursos con is_active=True por defecto. Tratamos undefined como activo.
  const isActive = (course: Course): boolean => course.is_active !== false

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const result = await courseRepo.getAll({ page_size: 100 })
        setCourses(result.results || [])
      } catch (error) {
        console.error('Error fetching courses:', error)
        toast.error('No se pudieron cargar los cursos')
      } finally {
        setIsLoading(false)
      }
    }
    fetchCourses()
  }, [])

  const handleDeleteCourse = async () => {
    if (!courseToDelete) return
    setIsDeleting(true)
    try {
      await courseRepo.deleteCourse(courseToDelete.id)
      setCourses(courses.filter(c => c.id !== courseToDelete.id))
      toast.success(`Curso "${courseToDelete.title}" eliminado con éxito`)
    } catch (error) {
      console.error('Error deleting course:', error)
      toast.error('Ocurrió un error al intentar eliminar el curso')
    } finally {
      setIsDeleting(false)
      setCourseToDelete(null)
    }
  }

  const handleToggleActive = async (course: Course) => {
    const newActive = !isActive(course)
    try {
      await courseRepo.updateCourse(course.id, { is_active: newActive })
      setCourses(courses.map(c => c.id === course.id ? { ...c, is_active: newActive } : c))
      toast.success(`Curso ${newActive ? 'activado' : 'desactivado'} con éxito`)
    } catch (error) {
      console.error('Error toggling course status:', error)
      toast.error('Error al cambiar el estado del curso')
    }
  }

  const filteredCourses = courses.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase())
    if (!matchesSearch) return false
    if (statusFilter === 'active') return isActive(c)
    if (statusFilter === 'draft') return !isActive(c)
    return true
  })
  return (
    <div className="animate-in fade-in duration-500">
      {/* HERO */}
      <section className="border-b border-slate-900/10 dark:border-white/10 px-8 md:px-12 py-14 md:py-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" asChild className="-ml-2 rounded-none hover:bg-slate-100 dark:hover:bg-white/5">
                <Link to="/admin"><ArrowLeft className="h-4 w-4" /></Link>
              </Button>
              <div className="chip">
                <BookOpen className="h-3.5 w-3.5 text-sky-500" />
                Académico
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white uppercase">
              Catálogo de <span className="text-sky-500">Cursos</span>.
            </h1>
            <p className="text-base text-slate-500 dark:text-slate-400 max-w-lg font-medium">
              Gestión centralizada de la oferta académica, niveles de dificultad y estados de publicación.
            </p>
          </div>
          <Button
            onClick={() => navigate('/admin/management/courses/new')}
            className="rounded-none bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold uppercase text-[11px] tracking-[0.2em] px-8 py-6 h-auto hover:bg-sky-500 dark:hover:bg-sky-500 hover:text-white transition-all"
          >
            <Plus className="h-4 w-4 mr-2" /> Crear Curso
          </Button>
        </div>
      </section>

      {/* FILTERS & SEARCH */}
      <div className="border-b border-slate-900/10 dark:border-white/10 p-6 md:p-8 flex flex-col lg:flex-row gap-6 justify-between items-center bg-white dark:bg-transparent">
        <div className="relative w-full lg:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            placeholder="BUSCAR POR TÍTULO DEL CURSO..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border border-slate-900/10 dark:border-white/10 bg-transparent py-3.5 pl-12 pr-4 text-[11px] font-bold uppercase tracking-widest outline-none focus:border-sky-500 transition-colors"
          />
        </div>
        <div className="flex gap-px bg-slate-900/10 dark:bg-white/10 border border-slate-900/10 dark:border-white/10 overflow-hidden">
          {(['all', 'active', 'draft'] as const).map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-6 py-3 label-caps transition-all ${
                statusFilter === status
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'bg-white dark:bg-[#0a0a0b] text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5'
              }`}
            >
              {status === 'all' ? 'Todos' : status === 'active' ? 'Publicados' : 'Borradores'}
            </button>
          ))}
        </div>
      </div>

      {/* DATA TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1000px] text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-900/10 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02]">
              <th className="px-8 py-5 label-caps text-slate-400">Curso / Especialidad</th>
              <th className="px-8 py-5 label-caps text-slate-400">Nivel / Idioma</th>
              <th className="px-8 py-5 label-caps text-slate-400">Estado</th>
              <th className="px-8 py-5 label-caps text-slate-400 text-right">Acciones de Gestión</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-900/5 dark:divide-white/5">
            {isLoading ? (
              [1, 2, 3, 4].map(i => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={4} className="px-8 py-8"><div className="h-4 bg-slate-100 dark:bg-white/5 w-full" /></td>
                </tr>
              ))
            ) : filteredCourses.length > 0 ? (
              filteredCourses.map((course) => (
                <tr key={course.id} className="card-hover group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-5">
                      <div className="h-12 w-20 shrink-0 border border-slate-900/10 dark:border-white/10 overflow-hidden bg-slate-100 dark:bg-white/5">
                        {course.image_url ? (
                          <img src={course.image_url} alt={course.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <BookOpen className="h-5 w-5 text-slate-300" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight group-hover:text-sky-500 transition-colors">
                          {course.title}
                        </p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="label-micro flex items-center gap-1.5 text-slate-400">
                            <Users className="h-3 w-3" /> {course.students || 0} ESTUDIANTES
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="space-y-1">
                      <span className="label-micro px-2 py-0.5 border border-sky-500/20 text-sky-600 bg-sky-500/5 uppercase">
                        {course.difficulty_level}
                      </span>
                      <p className="label-micro text-slate-400 font-mono">{course.language_name}</p>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`label-micro flex items-center gap-2 ${isActive(course) ? 'text-emerald-600' : 'text-amber-500'}`}>
                      <span className={`h-1.5 w-1.5 ${isActive(course) ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                      {isActive(course) ? 'PUBLICADO' : 'INACTIVO'}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-none border-slate-900/10 hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-slate-900 transition-all font-bold text-[10px] uppercase tracking-widest h-9"
                        onClick={() => navigate(`/admin/management/courses/${course.id}/edit`)}
                      >
                        <Edit2 className="h-3.5 w-3.5 mr-2" /> Editar
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="icon" className="rounded-none border-slate-900/10 h-9 w-9">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-none border-slate-900/10 dark:border-white/10">
                          <DropdownMenuItem onSelect={() => navigate(`/admin/management/courses/${course.id}/edit`)} className="label-micro py-3">
                            <Edit2 className="h-4 w-4 mr-2" /> Editar Curso
                          </DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => handleToggleActive(course)} className="label-micro py-3">
                            <Eye className="h-4 w-4 mr-2" /> {isActive(course) ? 'Ocultar Catálogo' : 'Mostrar Catálogo'}
                          </DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => setCourseToDelete(course)} className="label-micro py-3 text-rose-500 focus:text-rose-500">
                            <Trash2 className="h-4 w-4 mr-2" /> Eliminar Permanente
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="py-24 text-center">
                  <div className="flex h-16 w-16 items-center justify-center border border-slate-900/10 dark:border-white/10 mx-auto mb-6">
                    <BookOpen className="h-6 w-6 text-slate-300" />
                  </div>
                  <p className="label-caps text-slate-400">No se encontraron registros de cursos</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Dialog - Editorial */}
      <AlertDialog open={!!courseToDelete} onOpenChange={(open) => !open && !isDeleting && setCourseToDelete(null)}>
        <AlertDialogContent className="rounded-none border-slate-900/10">
          <AlertDialogHeader>
            <div className="flex h-16 w-16 items-center justify-center border border-rose-500/20 bg-rose-500/5 mx-auto mb-6">
              <AlertCircle className="h-8 w-8 text-rose-500" />
            </div>
            <AlertDialogTitle className="text-center text-2xl font-black uppercase tracking-tight">Eliminar Curso</AlertDialogTitle>
            <AlertDialogDescription className="text-center text-sm font-medium py-4">
              ¿Estás seguro de eliminar <span className="text-slate-900 dark:text-white font-bold">"{courseToDelete?.title}"</span>? Esta acción eliminará permanentemente todos los módulos, lecciones y progreso de alumnos asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center gap-3 pt-4">
            <AlertDialogCancel className="rounded-none font-bold uppercase text-[10px] tracking-[0.2em]">Cancelar</AlertDialogCancel>
            <AlertDialogAction disabled={isDeleting} onClick={handleDeleteCourse} className="rounded-none bg-rose-600 hover:bg-rose-700 font-bold uppercase text-[10px] tracking-[0.2em]">
              {isDeleting ? 'Eliminando...' : 'Confirmar Eliminación'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>

  )
}