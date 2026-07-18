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
  ArrowRight,
  AlertCircle,
  School,
  ArrowLeft,
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
import { getAdminClassroomsUseCase, deleteAdminClassroomUseCase } from '@/infrastructure/factories/admin.factory'
import type { Classroom } from '@/domain/entities/classroom.entity'

export default function AdminClassroomsPage() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [classrooms, setClassrooms] = useState<Classroom[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [classroomToDelete, setClassroomToDelete] = useState<Classroom | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

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
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild className="rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">
            <Link to="/admin"><ArrowLeft className="h-5 w-5" /></Link>
          </Button>
          <div>
            <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">Aulas Virtuales</h1>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-1">Gestiona todas las aulas de la plataforma</p>
          </div>
        </div>
        <Button asChild className="h-12 rounded-2xl font-black bg-sky-600 hover:bg-sky-700 shadow-xl shadow-sky-500/20 px-6 group">
          <Link to="/admin/classrooms/new">
            <Plus className="mr-2 h-5 w-5" /> Crear Aula
            <ArrowRight className="ml-2 h-4 w-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
          </Link>
        </Button>
      </div>

      {/* List */}
      <Card className="border-none shadow-2xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50/50 dark:bg-slate-800/20">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 dark:text-slate-500" />
            <Input
              placeholder="Buscar aula por nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-12 pl-12 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
            />
          </div>
          <Badge variant="outline" className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold px-4 py-2">
            {classrooms.length} aula{classrooms.length !== 1 ? 's' : ''}
          </Badge>
        </div>

        <CardContent className="p-0">
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {isLoading ? (
              <div className="p-6 space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex gap-6 items-center">
                    <Skeleton className="h-16 w-16 rounded-2xl" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-5 w-48" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredClassrooms.length > 0 ? (
              filteredClassrooms.map((classroom) => (
                <div key={classroom.id} className="p-6 flex flex-col md:flex-row items-center gap-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                  <div className="h-16 w-16 rounded-2xl bg-amber-50 dark:bg-amber-900/20 text-amber-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <School className="h-8 w-8" />
                  </div>
                  <div className="flex-1 min-w-0 text-center md:text-left">
                    <h3 className="text-xl font-black text-slate-900 dark:text-white truncate">{classroom.name}</h3>
                    {classroom.description && (
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1 truncate">{classroom.description}</p>
                    )}
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        <BookOpen className="h-3 w-3 mr-1" /> {(classroom as any).course_title || 'Sin curso'}
                      </Badge>
                      <span className="text-xs font-bold text-slate-400">
                        {(classroom as any).teacher_email || 'Sin profesor'}
                      </span>
                      <span className="text-xs font-bold text-slate-400">
                        <Users className="h-3 w-3 inline mr-1" />{(classroom as any).total_students || 0} estudiantes
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-10 rounded-xl font-bold bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
                      onClick={() => navigate(`/admin/classrooms/${classroom.id}/manage`)}
                    >
                      <Users className="mr-2 h-4 w-4" /> Inscripciones
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800">
                          <MoreVertical className="h-5 w-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-48 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl p-2">
                        <DropdownMenuItem
                          onSelect={() => navigate(`/admin/classrooms/${classroom.id}/edit`)}
                          className="font-bold py-3 cursor-pointer text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl"
                        >
                          <Edit2 className="mr-2 h-4 w-4" /> Editar Aula
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onSelect={() => navigate(`/admin/classrooms/${classroom.id}/manage`)}
                          className="font-bold py-3 cursor-pointer text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl"
                        >
                          <Users className="mr-2 h-4 w-4" /> Ver Inscripciones
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onSelect={() => setClassroomToDelete(classroom)}
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
                <School className="h-12 w-12 text-slate-200 dark:text-slate-700 mx-auto mb-4" />
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  {searchTerm ? 'No se encontraron aulas' : 'Aún no hay aulas creadas'}
                </h3>
                <p className="text-slate-500 font-medium mt-1">
                  {searchTerm ? 'Prueba con otro término de búsqueda.' : 'Crea la primera aula para empezar.'}
                </p>
                {!searchTerm && (
                  <Button asChild className="mt-4 bg-sky-600 hover:bg-sky-700 rounded-xl font-black">
                    <Link to="/admin/classrooms/new"><Plus className="mr-2 h-4 w-4" /> Crear Aula</Link>
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Delete Dialog */}
      <AlertDialog open={!!classroomToDelete} onOpenChange={(open) => !open && !isDeleting && setClassroomToDelete(null)}>
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader>
            <div className="mx-auto bg-red-100 dark:bg-red-900/30 p-3 rounded-full w-fit mb-4">
              <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <AlertDialogTitle className="text-center text-2xl font-black">¿Eliminar aula?</AlertDialogTitle>
            <AlertDialogDescription className="text-center font-medium">
              Esta acción no se puede deshacer. Se eliminará permanentemente el aula{' '}
              <span className="font-bold text-slate-900 dark:text-white">"{classroomToDelete?.name}"</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center gap-3 mt-6">
            <AlertDialogCancel disabled={isDeleting} className="rounded-xl h-12 px-6 font-bold">Cancelar</AlertDialogCancel>
            <AlertDialogAction disabled={isDeleting} onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white rounded-xl h-12 px-6 font-bold shadow-lg shadow-red-500/20">
              {isDeleting ? 'Eliminando...' : 'Sí, eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}