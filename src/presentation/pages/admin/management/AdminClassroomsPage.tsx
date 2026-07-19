import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Users,
  Plus,
  Search,
  MoreVertical,
  Edit2,
  Trash2,
  BookOpen,
  AlertCircle,
  School,
  ArrowLeft,
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
import {
  getAdminClassroomsUseCase,
  deleteAdminClassroomUseCase,
} from '@/infrastructure/factories/admin.factory'
import type { Classroom } from '@/domain/entities/classroom.entity'

// El backend hace soft-delete (is_active=false). undefined se trata como activo.
const isActive = (c: Classroom): boolean => c.is_active !== false

export default function AdminClassroomsPage() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [classrooms, setClassrooms] = useState<Classroom[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [classroomToDelete, setClassroomToDelete] = useState<Classroom | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const activeClassrooms = classrooms.filter(isActive)
  const filteredClassrooms = activeClassrooms.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  useEffect(() => {
    const fetchClassrooms = async () => {
      try {
        const result = await getAdminClassroomsUseCase.execute()
        setClassrooms(result.results || [])
      } catch (error) {
        console.error('Error fetching classrooms:', error)
        toast.error('No se pudieron cargar las aulas')
      } finally {
        setIsLoading(false)
      }
    }
    fetchClassrooms()
  }, [])

  const handleDelete = async () => {
    if (!classroomToDelete) return
    setIsDeleting(true)
    try {
      await deleteAdminClassroomUseCase.execute(classroomToDelete.id)
      toast.success(`Aula "${classroomToDelete.name}" desactivada correctamente`)
      setClassrooms(prev => prev.filter(c => c.id !== classroomToDelete.id))
    } catch (error) {
      console.error('Error deleting classroom:', error)
      toast.error('Ocurrio un error al desactivar el aula')
    } finally {
      setIsDeleting(false)
      setClassroomToDelete(null)
    }
  }

  return (
    <div className="animate-in fade-in duration-500">
      {/* HERO */}
      <section className="border-b border-slate-900/10 dark:border-white/10 px-8 md:px-12 py-14 md:py-16">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" asChild className="-ml-2 rounded-none hover:bg-slate-100 dark:hover:bg-white/5">
                <Link to="/admin"><ArrowLeft className="h-4 w-4" /></Link>
              </Button>
              <div className="chip">
                <School className="h-3.5 w-3.5 text-sky-500" />
                Gestion
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white uppercase">
              Control de <span className="text-sky-500">Aulas</span>.
            </h1>
            <p className="text-base text-slate-500 dark:text-slate-400 max-w-xl font-medium">
              Administracion de espacios virtuales, asignacion de instructores y monitoreo de participacion estudiantil.
            </p>
          </div>
          <Button
            onClick={() => navigate('/admin/classrooms/new')}
            className="rounded-none bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black uppercase text-[11px] tracking-[0.2em] px-8 py-6 h-auto hover:bg-sky-500 dark:hover:bg-sky-500 hover:text-white transition-all group"
          >
            <Plus className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform" /> Crear Nueva Aula
          </Button>
        </div>
      </section>

      {/* TOOLBAR */}
      <div className="flex flex-col md:flex-row gap-6 justify-between items-center px-8 md:px-10 py-6 border-b border-slate-900/10 dark:border-white/10 bg-white dark:bg-transparent">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            placeholder="BUSCAR POR NOMBRE DE AULA..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border border-slate-900/10 dark:border-white/10 bg-transparent py-3.5 pl-12 pr-4 text-[11px] font-bold uppercase tracking-widest outline-none focus:border-sky-500 transition-colors"
          />
        </div>
        <div className="label-caps px-6 py-3 border border-slate-900/10 dark:border-white/10 text-slate-500 font-black tracking-widest bg-slate-50 dark:bg-white/5">
          {activeClassrooms.length} REGISTROS ACTIVOS
        </div>
      </div>

      {/* CLASSROOMS TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1000px] text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-900/10 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02]">
              <th className="px-8 py-5 label-caps text-slate-400">Aula / Descripcion</th>
              <th className="px-8 py-5 label-caps text-slate-400">Curso Vinculado</th>
              <th className="px-8 py-5 label-caps text-slate-400">Instructor / Estudiantes</th>
              <th className="px-8 py-5 label-caps text-slate-400 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-900/5 dark:divide-white/5">
            {isLoading ? (
              [1, 2, 3].map(i => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={4} className="px-8 py-10"><div className="h-4 bg-slate-100 dark:bg-white/5 w-full" /></td>
                </tr>
              ))
            ) : filteredClassrooms.length > 0 ? (
              filteredClassrooms.map((classroom) => (
                <tr key={classroom.id} className="card-hover group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-5">
                      <div className="h-12 w-12 shrink-0 flex items-center justify-center border border-slate-900/10 dark:border-white/10 text-sky-500 bg-slate-50 dark:bg-white/5 transition-colors group-hover:bg-sky-500 group-hover:text-white">
                        <School className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight group-hover:text-sky-500 transition-colors">
                          {classroom.name}
                        </p>
                        {classroom.description && (
                          <p className="label-micro text-slate-400 mt-0.5 truncate max-w-[300px]">{classroom.description.toUpperCase()}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="label-micro border border-slate-900/10 dark:border-white/10 px-3 py-1 bg-slate-50 dark:bg-white/5 font-bold">
                      <BookOpen className="h-3 w-3 inline mr-2 text-sky-500" />
                      {(classroom as any).course_title?.toUpperCase() || 'SIN CURSO ASIGNADO'}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="space-y-1.5">
                      <p className="label-micro text-slate-500 flex items-center gap-2">
                        <span className="h-1 w-1 bg-sky-500" />
                        {(classroom as any).teacher_email?.toLowerCase() || 'no_instructor@system'}
                      </p>
                      <p className="label-micro font-black text-slate-700 dark:text-slate-300">
                        {(classroom as any).total_students || 0} ESTUDIANTES INSCRITOS
                      </p>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-none border-slate-900/10 hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-slate-900 transition-all font-bold text-[10px] uppercase tracking-widest h-9 px-4"
                        onClick={() => navigate(`/admin/classrooms/${classroom.id}/manage`)}
                      >
                        <Users className="h-3.5 w-3.5 mr-2" /> Inscripciones
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="icon" className="rounded-none border-slate-900/10 h-9 w-9">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-none border-slate-900/10 dark:border-white/10">
                          <DropdownMenuItem
                            onSelect={() => navigate(`/admin/classrooms/${classroom.id}/edit`)}
                            className="label-micro py-3"
                          >
                            <Edit2 className="h-4 w-4 mr-2" /> Editar Aula
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onSelect={() => navigate(`/admin/classrooms/${classroom.id}/manage`)}
                            className="label-micro py-3"
                          >
                            <Users className="h-4 w-4 mr-2" /> Ver Listado
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onSelect={() => setClassroomToDelete(classroom)}
                            className="label-micro py-3 text-rose-600 focus:text-rose-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" /> Desactivar Aula
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
                    <School className="h-6 w-6 text-slate-200" />
                  </div>
                  <p className="label-caps text-slate-400">No se encontraron aulas activas</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Dialog */}
      <AlertDialog open={!!classroomToDelete} onOpenChange={(open) => !open && !isDeleting && setClassroomToDelete(null)}>
        <AlertDialogContent className="rounded-none border-slate-900/10">
          <AlertDialogHeader>
            <div className="flex h-16 w-16 items-center justify-center border border-rose-500/20 bg-rose-500/5 mx-auto mb-6">
              <AlertCircle className="h-8 w-8 text-rose-500" />
            </div>
            <AlertDialogTitle className="text-center text-2xl font-black uppercase tracking-tight">Desactivar Aula</AlertDialogTitle>
            <AlertDialogDescription className="text-center text-sm font-medium py-4">
              Se desactivara el aula <span className="text-slate-900 dark:text-white font-bold">"{classroomToDelete?.name?.toUpperCase()}"</span>. Los estudiantes ya no podran acceder. Puedes activarla nuevamente desde el menu de acciones.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center gap-3 pt-4">
            <AlertDialogCancel className="rounded-none font-bold uppercase text-[10px] tracking-[0.2em]" disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              disabled={isDeleting}
              onClick={handleDelete}
              className="rounded-none bg-rose-600 hover:bg-rose-700 font-bold uppercase text-[10px] tracking-[0.2em]"
            >
              {isDeleting ? 'DESACTIVANDO...' : 'CONFIRMAR DESACTIVACION'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}