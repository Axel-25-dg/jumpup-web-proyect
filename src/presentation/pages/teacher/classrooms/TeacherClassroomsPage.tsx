import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Users, Plus, Search, MoreVertical, Edit2,
  Trash2, AlertCircle, BookOpen
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
import { getTeacherClassroomsUseCase, deleteClassroomUseCase } from '@/infrastructure/factories/teacher.factory'
import { useAuthStore } from '@/presentation/store/auth.store'
import type { Classroom } from '@/domain/entities/classroom.entity'

export default function TeacherClassroomsPage() {
  const navigate = useNavigate()
  const user = useAuthStore(s => s.user)
  const [searchTerm, setSearchTerm] = useState('')
  const [classrooms, setClassrooms] = useState<Classroom[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [classroomToDelete, setClassroomToDelete] = useState<Classroom | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const fetchClassrooms = async () => {
      if (!user?.user_id) return
      try {
        const result = await getTeacherClassroomsUseCase.execute(user.user_id)
        setClassrooms(result.results || [])
      } catch (error) {
        console.error('Error fetching classrooms:', error)
        toast.error('No se pudieron cargar las aulas')
      } finally {
        setIsLoading(false)
      }
    }
    fetchClassrooms()
  }, [user?.user_id])

  const handleDelete = async () => {
    if (!classroomToDelete) return
    setIsDeleting(true)
    try {
      await deleteClassroomUseCase.execute(classroomToDelete.id)
      setClassrooms(prev => prev.filter(c => c.id !== classroomToDelete.id))
      toast.success(`Aula "${classroomToDelete.name}" eliminada correctamente`)
    } catch (error) {
      console.error('Error deleting classroom:', error)
      toast.error('Ocurrió un error al eliminar el aula')
    } finally {
      setIsDeleting(false)
      setClassroomToDelete(null)
    }
  }

  const filteredClassrooms = classrooms.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="animate-in fade-in duration-500">
      {/* HERO */}
      <section className="border-b border-slate-900/10 dark:border-white/10 px-8 md:px-12 py-14 md:py-16">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-8">
          <div className="space-y-4">
            <div className="chip">
              <Users className="h-3.5 w-3.5 text-sky-500" />
              Instructor
            </div>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white uppercase">
              Mis <span className="text-sky-500">Aulas</span>
            </h1>
            <p className="text-base text-slate-500 dark:text-slate-400 max-w-lg font-medium">
              Control total sobre tus grupos de estudio, materiales y seguimiento de alumnos.
            </p>
          </div>
          <Button asChild className="rounded-none bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black uppercase text-[11px] tracking-[0.2em] px-8 py-6 h-auto hover:bg-sky-500 dark:hover:bg-sky-500 hover:text-white transition-all gap-2 shrink-0 group">
            <Link to="/teacher/classrooms/new">
              <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform" /> Crear Nueva Aula
            </Link>
          </Button>
        </div>
      </section>

      {/* LIST */}
      <div className="px-8 md:px-12 py-10">
        {/* Toolbar */}
        <div className="flex flex-col md:flex-row gap-6 justify-between items-center mb-10">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              placeholder="BUSCAR AULA POR NOMBRE..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-slate-900/10 dark:border-white/10 bg-transparent py-3 pl-12 pr-4 text-[11px] font-bold uppercase tracking-widest outline-none focus:border-sky-500 transition-colors"
            />
          </div>
          <div className="label-caps px-6 py-2.5 border border-slate-900/10 dark:border-white/10 text-slate-500 font-black tracking-widest bg-slate-50 dark:bg-white/5">
            {classrooms.length} AULAS BAJO TU CARGO
          </div>
        </div>

        <div className="grid gap-px md:grid-cols-2 lg:grid-cols-3 bg-slate-900/10 dark:bg-white/10 border border-slate-900/10 dark:border-white/10">
          {isLoading ? (
            [1, 2, 3].map(i => (
              <div key={i} className="h-64 bg-white dark:bg-[#0a0a0b] animate-pulse" />
            ))
          ) : filteredClassrooms.length > 0 ? (
            filteredClassrooms.map((classroom) => (
              <div key={classroom.id} className="bg-white dark:bg-[#0a0a0b] p-8 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors group">
                <div className="flex items-start justify-between mb-6">
                  <div className="h-12 w-12 border border-slate-900/10 dark:border-white/10 flex items-center justify-center text-sky-500 shrink-0 group-hover:bg-sky-500 group-hover:text-white transition-all">
                    <Users className="h-5 w-5" />
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-9 w-9 rounded-none hover:bg-slate-100 dark:hover:bg-white/5">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-none border-slate-900/10 dark:border-white/10 bg-white dark:bg-[#0a0a0b] z-50">
                      <DropdownMenuItem
                        onSelect={() => navigate(`/teacher/classrooms/${classroom.id}/manage`)}
                        className="text-xs font-bold uppercase tracking-wider py-3 cursor-pointer"
                      >
                        <Edit2 className="h-4 w-4 mr-2" /> Gestionar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onSelect={() => setClassroomToDelete(classroom)}
                        className="text-xs font-bold uppercase tracking-wider py-3 cursor-pointer text-rose-600 focus:text-rose-600 focus:bg-rose-50 dark:focus:bg-rose-500/10"
                      >
                        <Trash2 className="h-4 w-4 mr-2" /> Eliminar Aula
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight leading-tight mb-1 truncate">{classroom.name}</h3>
                {classroom.description && (
                  <p className="label-micro text-slate-400 mb-4 line-clamp-2 uppercase">{classroom.description}</p>
                )}

                <div className="space-y-4 mt-auto">
                  <div className="pt-6 border-t border-slate-900/5 dark:border-white/5">
                    <p className="label-micro text-slate-400 mb-1">CÓDIGO DE ACCESO</p>
                    <p className="font-mono text-sm font-black tracking-widest text-slate-900 dark:text-white">
                      {classroom.access_code}
                    </p>
                  </div>

                  <div className="flex items-center justify-between py-3 border-y border-slate-900/5 dark:border-white/5">
                    <span className="label-micro text-slate-400">CREADA EL</span>
                    <span className="label-micro font-bold text-slate-700 dark:text-slate-300">
                      {new Date(classroom.created_at).toLocaleDateString('es-ES').toUpperCase()}
                    </span>
                  </div>
                </div>

                <Button
                  asChild
                  className="w-full mt-8 rounded-none bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black uppercase text-[10px] tracking-widest hover:bg-sky-500 dark:hover:bg-sky-500 hover:text-white transition-all h-11"
                >
                  <Link to={`/teacher/classrooms/${classroom.id}/manage`}>
                    GESTIONAR GRUPO <BookOpen className="ml-2 h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
            ))
          ) : (
            <div className="col-span-full py-24 text-center bg-white dark:bg-[#0a0a0b]">
              <div className="h-20 w-20 border border-slate-900/10 dark:border-white/10 mx-auto mb-6 flex items-center justify-center">
                <Users className="h-8 w-8 text-slate-200" />
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2">
                {searchTerm ? 'Sin Resultados' : 'Sin Aulas Activas'}
              </h3>
              <p className="label-micro text-slate-400 max-w-xs mx-auto mb-8 uppercase leading-relaxed">
                {searchTerm ? 'INTENTA CON OTRO TÉRMINO O FILTRO DE BÚSQUEDA.' : 'COMIENZA CREANDO TU PRIMER GRUPO DE ENSEÑANZA.'}
              </p>
              {!searchTerm && (
                <Button asChild className="rounded-none bg-sky-500 hover:bg-sky-600 text-white font-black uppercase text-[10px] tracking-widest px-8 h-12">
                  <Link to="/teacher/classrooms/new">
                    <Plus className="mr-2 h-4 w-4" /> CREAR AULA
                  </Link>
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* DELETE CONFIRM */}
      <AlertDialog open={!!classroomToDelete} onOpenChange={(open) => !open && !isDeleting && setClassroomToDelete(null)}>
        <AlertDialogContent className="rounded-none border-slate-900/10">
          <AlertDialogHeader>
            <div className="flex h-16 w-16 items-center justify-center border border-rose-500/20 bg-rose-500/5 mx-auto mb-6">
              <AlertCircle className="h-8 w-8 text-rose-500" />
            </div>
            <AlertDialogTitle className="text-center text-2xl font-black uppercase tracking-tight">Eliminar Registro</AlertDialogTitle>
            <AlertDialogDescription className="text-center text-sm font-medium py-4">
              Esta operación es irreversible. Se eliminará el aula <span className="text-slate-900 dark:text-white font-bold">"{classroomToDelete?.name?.toUpperCase()}"</span> y todos sus datos de seguimiento.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center gap-3 pt-4">
            <AlertDialogCancel disabled={isDeleting} className="rounded-none font-bold uppercase text-[10px] tracking-[0.2em]">CANCELAR</AlertDialogCancel>
            <AlertDialogAction
              disabled={isDeleting}
              onClick={handleDelete}
              className="rounded-none bg-rose-600 hover:bg-rose-700 font-bold uppercase text-[10px] tracking-[0.2em]"
            >
              {isDeleting ? 'ELIMINANDO...' : 'CONFIRMAR ACCIÓN'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
