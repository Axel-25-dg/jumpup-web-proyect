import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  BookOpen, Plus, Search, MoreVertical, Edit2, Trash2,
  Users, Eye, BarChart, AlertCircle, ArrowRight
} from 'lucide-react'
import { Button } from '@/presentation/components/ui/button'
import {
  DropdownMenu, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuTrigger,
} from '@/presentation/components/ui/dropdown-menu'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/presentation/components/ui/alert-dialog'
import { toast } from 'sonner'
import { courseRepo } from '@/infrastructure/factories/teacher.factory'
import type { Course } from '@/domain/entities/course.entity'

export default function TeacherCoursesPage() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'draft'>('all')
  const [courses, setCourses] = useState<Course[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const result = await courseRepo.getAll()
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
      toast.error('Ocurrió un error al intentar eliminar el curso')
    } finally {
      setIsDeleting(false)
      setCourseToDelete(null)
    }
  }

  const filteredCourses = courses.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase())
    if (!matchesSearch) return false
    if (statusFilter === 'active') return c.is_active === true && c.status !== 'draft'
    if (statusFilter === 'draft') return c.is_active === false || c.status === 'draft'
    return true
  })

  return (
    <div className="animate-in fade-in duration-500">
      {/* HERO */}
      <section className="border-b border-slate-900/10 dark:border-white/10 px-8 md:px-12 py-10 md:py-14">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
          <div className="space-y-3">
            <div className="chip">
              <BookOpen className="h-3.5 w-3.5 text-sky-500" />
              Profesor
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
              Mis <span className="text-sky-500">Cursos</span>
            </h1>
            <p className="label-micro text-slate-400">Gestiona el contenido que impartes en la plataforma</p>
          </div>
          <Button asChild className="bg-sky-500 hover:bg-sky-600 text-white font-bold gap-2 shrink-0">
            <Link to="/teacher/courses/new">
              <Plus className="h-4 w-4" /> Crear Nuevo Curso
            </Link>
          </Button>
        </div>
      </section>

      {/* QUICK ACCESS */}
      <div className="border-b border-slate-900/10 dark:border-white/10 grid grid-cols-3 divide-x divide-slate-900/10 dark:divide-white/10">
        {[
          { to: '/teacher/modules/new', icon: BookOpen, label: 'Módulos', sub: 'Crear Nuevo' },
          { to: '/teacher/lessons/new', icon: Eye, label: 'Lecciones', sub: 'Crear Nueva' },
          { to: '/teacher/exercises/new', icon: BarChart, label: 'Ejercicios', sub: 'Crear Nuevo' },
        ].map(({ to, icon: Icon, label, sub }) => (
          <Link key={to} to={to} className="flex items-center gap-3 px-6 py-4 hover:bg-sky-500/[0.04] transition-colors group">
            <div className="h-8 w-8 border border-slate-900/10 dark:border-white/10 flex items-center justify-center text-sky-500 group-hover:border-sky-500/30 transition-colors">
              <Icon className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">{label}</p>
              <p className="label-micro text-slate-400">{sub}</p>
            </div>
            <ArrowRight className="h-3.5 w-3.5 text-slate-300 ml-auto opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1" />
          </Link>
        ))}
      </div>

      {/* COURSES LIST */}
      <div className="px-8 md:px-12 py-8">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-6 justify-between items-center mb-8">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              placeholder="BUSCAR CURSO POR TÍTULO..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-slate-900/10 dark:border-white/10 bg-transparent py-3.5 pl-12 pr-4 text-[11px] font-bold uppercase tracking-widest outline-none focus:border-sky-500 transition-colors"
            />
          </div>
          <div className="flex border border-slate-900/10 dark:border-white/10 overflow-hidden shrink-0">
            {(['all', 'active', 'draft'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={`px-5 py-2.5 label-micro font-black tracking-widest transition-colors border-r last:border-0 border-slate-900/10 dark:border-white/10 ${
                  statusFilter === f
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white bg-slate-50/50 dark:bg-white/5'
                }`}
              >
                {f === 'all' ? 'TODOS' : f === 'active' ? 'ACTIVOS' : 'BORRADORES'}
              </button>
            ))}
          </div>
        </div>

        <div className="border border-slate-900/10 dark:border-white/10 overflow-hidden">
          {isLoading ? (
            <div className="divide-y divide-slate-900/5 dark:divide-white/5">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-20 animate-pulse bg-slate-50 dark:bg-white/[0.01]" />
              ))}
            </div>
          ) : filteredCourses.length > 0 ? (
            <div className="divide-y divide-slate-900/5 dark:divide-white/5">
              {filteredCourses.map((course) => (
                <div key={course.id} className="flex flex-col md:flex-row items-start md:items-center gap-4 px-5 py-4 hover:bg-sky-500/[0.04] transition-colors group">
                  {/* Thumbnail */}
                  <div className="h-14 w-20 shrink-0 border border-slate-900/10 dark:border-white/10 overflow-hidden bg-slate-50 dark:bg-white/[0.02] flex items-center justify-center relative">
                    {course.image_url ? (
                      <img src={course.image_url} alt={course.title} className="w-full h-full object-cover" />
                    ) : (
                      <BookOpen className="h-5 w-5 text-slate-300 dark:text-slate-600" />
                    )}
                    {course.status === 'draft' && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <span className="label-micro text-white">Borrador</span>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`label-micro px-1.5 py-0.5 border ${course.is_active ? 'border-emerald-200 text-emerald-600 dark:border-emerald-800/30' : 'border-amber-200 text-amber-600 dark:border-amber-800/30'}`}>
                        {course.is_active ? 'Publicado' : 'Inactivo'}
                      </span>
                      <span className="label-micro text-slate-400 flex items-center gap-1">
                        <Users className="h-3 w-3" /> {course.students || 0}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">{course.title}</h3>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-3 text-slate-500 hover:text-sky-500 font-bold text-xs gap-1.5"
                      onClick={() => navigate(`/teacher/courses/${course.id}/edit`)}
                    >
                      <Edit2 className="h-3.5 w-3.5" /> Editar
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-44 border border-slate-900/10 dark:border-white/10 bg-white dark:bg-[#0a0a0b] shadow-xl p-1">
                        <DropdownMenuItem
                          onSelect={() => navigate(`/teacher/courses/${course.id}/edit`)}
                          className="text-sm font-bold cursor-pointer hover:bg-sky-500/[0.06] gap-2"
                        >
                          <Edit2 className="h-4 w-4" /> Editar / Detalles
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onSelect={() => window.open(`/courses/${course.id}`, '_blank')}
                          className="text-sm font-bold cursor-pointer hover:bg-sky-500/[0.06] gap-2"
                        >
                          <Eye className="h-4 w-4" /> Previsualizar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onSelect={() => setCourseToDelete(course)}
                          className="text-sm font-bold cursor-pointer text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 gap-2"
                        >
                          <Trash2 className="h-4 w-4" /> Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center">
              <BookOpen className="h-10 w-10 text-slate-200 dark:text-slate-700 mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-900 dark:text-white mb-1">Sin cursos</p>
              <p className="label-micro text-slate-400 mb-4">No tienes cursos que coincidan con tu búsqueda.</p>
              <Button asChild size="sm" className="bg-sky-500 hover:bg-sky-600 text-white font-bold gap-1.5">
                <Link to="/teacher/courses/new">
                  <Plus className="h-3.5 w-3.5" /> Crear Primer Curso
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* DELETE CONFIRM */}
      <AlertDialog open={!!courseToDelete} onOpenChange={(open) => !open && !isDeleting && setCourseToDelete(null)}>
        <AlertDialogContent className="bg-white dark:bg-[#0a0a0b] border border-slate-900/10 dark:border-white/10">
          <AlertDialogHeader>
            <div className="mx-auto border border-red-200 dark:border-red-800/30 p-3 w-fit mb-4">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <AlertDialogTitle className="text-center font-black">¿Eliminar curso?</AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              Esta acción no se puede deshacer. Se eliminará permanentemente{' '}
              <span className="font-bold text-slate-900 dark:text-white">"{courseToDelete?.title}"</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center gap-2 mt-4">
            <AlertDialogCancel disabled={isDeleting} className="border-slate-900/10 dark:border-white/10">Cancelar</AlertDialogCancel>
            <AlertDialogAction disabled={isDeleting} onClick={handleDeleteCourse} className="bg-red-600 hover:bg-red-700 text-white font-bold">
              {isDeleting ? 'Eliminando...' : 'Sí, eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
