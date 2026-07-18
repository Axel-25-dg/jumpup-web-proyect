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
  BarChart,
  ArrowRight,
  AlertCircle
} from 'lucide-react'
import { Card, CardContent } from '@/presentation/components/ui/card'
import { Button } from '@/presentation/components/ui/button'
import { Input } from '@/presentation/components/ui/input'
import { Badge } from '@/presentation/components/ui/badge'
import { Skeleton } from '@/presentation/components/ui/skeleton'
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

export default function TeacherCoursesPage() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
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
      console.error('Error deleting course:', error)
      toast.error('Ocurrió un error al intentar eliminar el curso')
    } finally {
      setIsDeleting(false)
      setCourseToDelete(null)
    }
  }

  const filteredCourses = courses.filter(c => c.title.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">Mis Cursos</h1>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-1">Gestiona el contenido que impartes</p>
        </div>
        <div className="flex gap-3">
          <Button asChild className="h-12 rounded-2xl font-black bg-sky-600 hover:bg-sky-700 shadow-xl shadow-sky-500/20 px-6 group">
            <Link to="/teacher/courses/new">
              <Plus className="mr-2 h-5 w-5" /> Crear Nuevo Curso
              <ArrowRight className="ml-2 h-4 w-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Quick Access Grid */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Link to="/teacher/modules/new" className="group">
          <div className="p-5 rounded-[2rem] bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/30 hover:border-sky-500/50 transition-all flex items-center gap-4">
            <div className="bg-sky-50 dark:bg-sky-900/20 text-sky-600 p-3 rounded-2xl group-hover:scale-110 transition-transform">
              <BookOpen className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-black text-slate-900 dark:text-white leading-none">Módulos</h4>
              <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">Crear Nuevo</p>
            </div>
          </div>
        </Link>
        <Link to="/teacher/lessons/new" className="group">
          <div className="p-5 rounded-[2rem] bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/30 hover:border-indigo-500/50 transition-all flex items-center gap-4">
            <div className="bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 p-3 rounded-2xl group-hover:scale-110 transition-transform">
              <Eye className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-black text-slate-900 dark:text-white leading-none">Lecciones</h4>
              <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">Crear Nueva</p>
            </div>
          </div>
        </Link>
        <Link to="/teacher/exercises/new" className="group">
          <div className="p-5 rounded-[2rem] bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/30 hover:border-emerald-500/50 transition-all flex items-center gap-4">
            <div className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 p-3 rounded-2xl group-hover:scale-110 transition-transform">
              <BarChart className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-black text-slate-900 dark:text-white leading-none">Ejercicios</h4>
              <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">Crear Nuevo</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Course List Section */}
      <Card className="border-none shadow-2xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50/50 dark:bg-slate-800/20">
           <div className="relative w-full sm:max-w-md">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 dark:text-slate-500" />
             <Input 
               placeholder="Buscar curso por título..." 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="h-12 pl-12 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium placeholder:text-slate-400 dark:placeholder:text-slate-500"
             />
           </div>
           <div className="flex gap-2">
             <Button variant="outline" className="h-12 rounded-xl font-bold bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700">Activos</Button>
             <Button variant="outline" className="h-12 rounded-xl font-bold bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700">Borradores</Button>
           </div>
        </div>
        <CardContent className="p-0">
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {isLoading ? (
              <div className="p-6 space-y-4">
                {[1,2,3].map(i => (
                  <div key={i} className="flex gap-6 items-center">
                    <Skeleton className="h-24 w-40 rounded-2xl" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-6 w-64" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredCourses.length > 0 ? (
              filteredCourses.map((course) => (
                <div key={course.id} className="p-6 flex flex-col md:flex-row items-center gap-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                  <div className="h-24 w-40 rounded-2xl overflow-hidden shrink-0 relative bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    {course.image_url ? (
                      <img src={course.image_url} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <BookOpen className="h-8 w-8 text-slate-300 dark:text-slate-600" />
                    )}
                    {course.status === 'draft' && (
                       <div className="absolute inset-0 bg-white/60 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center">
                         <Badge className="bg-slate-900 text-white font-black uppercase text-[10px]">Borrador</Badge>
                       </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 text-center md:text-left">
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-2">
                      <Badge className={course.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}>
                        {course.is_active ? 'Publicado' : 'Inactivo'}
                      </Badge>
                      <span className="flex items-center text-xs font-bold text-slate-500">
                        <Users className="h-3.5 w-3.5 mr-1" /> {course.students || 0} estudiantes
                      </span>
                    </div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white truncate">{course.title}</h3>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-10 rounded-xl font-bold bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
                      onClick={() => navigate(`/teacher/courses/${course.id}/edit`)}
                    >
                      Ver Detalles
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800">
                          <MoreVertical className="h-5 w-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-48 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 p-2">
                        <DropdownMenuItem 
                          onSelect={() => navigate(`/teacher/courses/${course.id}/edit`)}
                          className="font-bold py-3 cursor-pointer text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl"
                        >
                          <Edit2 className="mr-2 h-4 w-4" /> Editar Curso
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onSelect={() => navigate(`/courses/${course.id}`)}
                          className="font-bold py-3 cursor-pointer text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl"
                        >
                          <Eye className="mr-2 h-4 w-4" /> Previsualizar
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onSelect={() => setCourseToDelete(course)}
                          className="font-bold py-3 text-red-600 dark:text-red-400 cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl"
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-20 text-center">
                <BookOpen className="h-12 w-12 text-slate-200 dark:text-slate-700 mx-auto mb-4" />
                <h3 className="text-lg font-black text-slate-900 dark:text-white">No se encontraron cursos</h3>
                <p className="text-slate-500 font-medium">No tienes cursos que coincidan con tu búsqueda.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={!!courseToDelete} onOpenChange={(open) => !open && !isDeleting && setCourseToDelete(null)}>
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader>
            <div className="mx-auto bg-red-100 dark:bg-red-900/30 p-3 rounded-full w-fit mb-4">
              <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <AlertDialogTitle className="text-center text-2xl font-black">¿Eliminar curso?</AlertDialogTitle>
            <AlertDialogDescription className="text-center font-medium">
              Esta acción no se puede deshacer. Esto eliminará permanentemente el curso <br/>
              <span className="font-bold text-slate-900 dark:text-white">"{courseToDelete?.title}"</span> y todos sus datos asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center gap-3 mt-6">
            <AlertDialogCancel disabled={isDeleting} className="rounded-xl h-12 px-6 font-bold">Cancelar</AlertDialogCancel>
            <AlertDialogAction disabled={isDeleting} onClick={handleDeleteCourse} className="bg-red-600 hover:bg-red-700 text-white rounded-xl h-12 px-6 font-bold shadow-lg shadow-red-500/20">
              {isDeleting ? 'Eliminando...' : 'Sí, eliminar curso'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
