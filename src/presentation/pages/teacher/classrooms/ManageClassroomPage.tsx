import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Users,
  MessageSquare,
  Settings,
  UserX,
  UserCheck,
  Search,
  AlertCircle,
  Loader2
} from 'lucide-react'
import { Button } from '@/presentation/components/ui/button'
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
import {
  getClassroomByIdUseCase,
  approveStudentUseCase,
  rejectStudentUseCase,
  removeStudentUseCase
} from '@/infrastructure/factories/teacher.factory'
import type { Classroom, ClassroomStudent } from '@/domain/entities/classroom.entity'
import { toast } from 'sonner'

export default function ManageClassroomPage() {
  const { id } = useParams()
  const classroomId = Number(id)

  const [classroom, setClassroom] = useState<Classroom | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [students, setStudents] = useState<ClassroomStudent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<number | null>(null)
  const [studentToRemove, setStudentToRemove] = useState<ClassroomStudent | null>(null)
  const [isRemoving, setIsRemoving] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      if (!classroomId) return
      try {
        const classroomData = await getClassroomByIdUseCase.execute(classroomId)
        setClassroom(classroomData)
        
        const enrollments = (classroomData as any).enrollments || []
        console.log('DEBUG classroomData:', classroomData)
        console.log('DEBUG enrollments:', enrollments)
        
        const mappedStudents: ClassroomStudent[] = enrollments
          .map((e: any) => ({
            id: e.id,
            classroom_id: classroomId,
            student_id: e.student,
            student_name: e.student_username,
            student_email: e.student_email,
            joined_at: e.enrolled_at || e.joined_at,
            status: e.is_active ? 'active' : (e.status || 'pending'),
            progress: e.progress || 0
          }))
          .filter((s: ClassroomStudent) => s.student_id !== classroomData.teacher_id && s.student_id !== classroomData.teacher)
          
        setStudents(mappedStudents)
      } catch (error) {
        console.error('Error fetching classroom data:', error)
        toast.error('Ocurrió un error al cargar los datos del aula')
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [classroomId])

  const handleApprove = async (student: ClassroomStudent) => {
    setActionLoading(student.id)
    try {
      const updated = await approveStudentUseCase.execute(classroomId, student.student_id)
      setStudents(prev => prev.map(s => s.id === student.id ? { ...s, ...updated, status: 'active' } : s))
      toast.success(`${student.student_name || 'Alumno'} aprobado correctamente`)
    } catch (error) {
      console.error('Error approving student:', error)
      toast.error('Error al aprobar al estudiante')
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async (student: ClassroomStudent) => {
    setActionLoading(student.id)
    try {
      await rejectStudentUseCase.execute(classroomId, student.student_id)
      setStudents(prev => prev.filter(s => s.id !== student.id))
      toast.success(`Solicitud de ${student.student_name || 'alumno'} rechazada`)
    } catch (error) {
      console.error('Error rejecting student:', error)
      toast.error('Error al rechazar al estudiante')
    } finally {
      setActionLoading(null)
    }
  }

  const handleRemove = async () => {
    if (!studentToRemove) return
    setIsRemoving(true)
    try {
      await removeStudentUseCase.execute(classroomId, studentToRemove.student_id)
      setStudents(prev => prev.filter(s => s.id !== studentToRemove.id))
      toast.success(`${studentToRemove.student_name || 'Alumno'} eliminado del aula`)
    } catch (error) {
      console.error('Error removing student:', error)
      toast.error('Error al eliminar al estudiante')
    } finally {
      setIsRemoving(false)
      setStudentToRemove(null)
    }
  }

  const filteredStudents = students.filter(s =>
    s.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.student_email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="animate-in fade-in duration-500">
      {/* HERO */}
      <section className="border-b border-slate-900/10 dark:border-white/10 px-8 md:px-12 py-14 md:py-16">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" asChild className="-ml-2 rounded-none hover:bg-slate-100 dark:hover:bg-white/5">
                <Link to="/teacher/classrooms"><ArrowLeft className="h-4 w-4" /></Link>
              </Button>
              <div className="chip">
                <Users className="h-3.5 w-3.5 text-sky-500" />
                Control de Aula
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white uppercase">
              {isLoading ? 'CARGANDO...' : (classroom?.name || 'Gestión Técnica')}
            </h1>
            <p className="text-base text-slate-500 dark:text-slate-400 max-w-xl font-medium leading-relaxed">
              {isLoading ? 'Recuperando parámetros del aula...' : (classroom?.description?.toUpperCase() || 'ADMINISTRACIÓN DE INSCRIPCIONES Y SEGUIMIENTO ACADÉMICO.')}
            </p>
            {!isLoading && classroom?.access_code && (
              <div className="flex items-center gap-4 pt-2">
                <span className="label-micro text-slate-400 tracking-widest">CÓDIGO DE ACCESO VIGENTE:</span>
                <span className="font-mono text-sm font-black text-sky-500 border border-sky-500/20 bg-sky-500/5 px-4 py-1">
                  {classroom.access_code}
                </span>
              </div>
            )}
          </div>
          <Button variant="outline" className="rounded-none border-slate-900/10 dark:border-white/10 h-14 px-8 font-black uppercase text-[11px] tracking-[0.2em] hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-slate-900 transition-all">
            <Settings className="mr-3 h-4 w-4" /> Configuración Avanzada
          </Button>
        </div>
      </section>

      {/* STATS GRID */}
      <div className="grid gap-px sm:grid-cols-3 bg-slate-900/10 dark:bg-white/10 border-b border-slate-900/10 dark:border-white/10">
        <div className="p-10 bg-white dark:bg-[#0a0a0b] group">
          <p className="label-caps text-slate-400 mb-6 tracking-widest">Total Alumnos</p>
          <div className="flex items-end justify-between">
            <h4 className="text-5xl font-black text-slate-900 dark:text-white leading-none">
              {students.length.toString().padStart(2, '0')}
            </h4>
            <div className="h-12 w-12 border border-slate-900/10 dark:border-white/10 flex items-center justify-center text-sky-500 group-hover:bg-sky-500 group-hover:text-white transition-all">
              <Users className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="p-10 bg-white dark:bg-[#0a0a0b] group">
          <p className="label-caps text-slate-400 mb-6 tracking-widest">Estado Activo</p>
          <div className="flex items-end justify-between">
            <h4 className="text-5xl font-black text-emerald-600 dark:text-emerald-500 leading-none">
              {students.filter(s => s.status === 'active').length.toString().padStart(2, '0')}
            </h4>
            <div className="h-12 w-12 border border-slate-900/10 dark:border-white/10 flex items-center justify-center text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-all">
              <UserCheck className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="p-10 bg-white dark:bg-[#0a0a0b] group">
          <p className="label-caps text-slate-400 mb-6 tracking-widest">Solicitudes</p>
          <div className="flex items-end justify-between">
            <h4 className="text-5xl font-black text-amber-500 leading-none">
              {students.filter(s => s.status === 'pending').length.toString().padStart(2, '0')}
            </h4>
            <div className="h-12 w-12 border border-slate-900/10 dark:border-white/10 flex items-center justify-center text-amber-500 group-hover:bg-amber-500 group-hover:text-white transition-all">
              <MessageSquare className="h-6 w-6" />
            </div>
          </div>
        </div>
      </div>

      {/* SEARCH TOOLBAR */}
      <div className="px-8 md:px-12 py-8 bg-white dark:bg-transparent border-b border-slate-900/10 dark:border-white/10">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            placeholder="BUSCAR ALUMNO POR IDENTIDAD O EMAIL..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border border-slate-900/10 dark:border-white/10 bg-transparent py-3.5 pl-12 pr-4 text-[11px] font-bold uppercase tracking-widest outline-none focus:border-sky-500 transition-colors"
          />
        </div>
      </div>

      {/* STUDENT LIST / TABLE */}
      <div className="overflow-x-auto bg-[#f7f6f3] dark:bg-[#0a0a0b]">
        <table className="w-full min-w-[1000px] text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-900/10 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02]">
              <th className="px-10 py-5 label-caps text-slate-400">Identidad del Estudiante</th>
              <th className="px-10 py-5 label-caps text-slate-400">Progreso Académico</th>
              <th className="px-10 py-5 label-caps text-slate-400">Estado de Cuenta</th>
              <th className="px-10 py-5 label-caps text-slate-400 text-right">Operaciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-900/5 dark:divide-white/5 bg-white dark:bg-transparent">
            {isLoading ? (
              [1, 2, 3].map(i => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={4} className="px-10 py-10"><div className="h-4 bg-slate-100 dark:bg-white/5 w-full" /></td>
                </tr>
              ))
            ) : filteredStudents.length > 0 ? (
              filteredStudents.map((student) => (
                <tr key={student.id} className="card-hover group">
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-5">
                      <div className="h-14 w-14 shrink-0 border border-slate-900/10 dark:border-white/10 flex items-center justify-center bg-slate-50 dark:bg-white/5 font-black text-xs text-sky-500 group-hover:bg-sky-500 group-hover:text-white transition-all uppercase">
                        {(student.student_name || 'AL').substring(0, 2)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight group-hover:text-sky-500 transition-colors">
                          {student.student_name || 'ALUMNO SIN NOMBRE'}
                        </p>
                        <p className="label-micro text-slate-400 font-mono mt-0.5">{student.student_email}</p>
                        <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">
                          INGRESO: {new Date(student.joined_at).toLocaleDateString('es-ES').toUpperCase()}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-10 py-6">
                    <div className="w-full max-w-[120px] space-y-2">
                      <div className="flex justify-between items-center label-micro">
                        <span className="text-slate-400">RENDIMIENTO</span>
                        <span className="font-black text-slate-900 dark:text-white">{student.progress || 0}%</span>
                      </div>
                      <div className="h-1 bg-slate-100 dark:bg-white/5 overflow-hidden">
                        <div
                          className={`h-full transition-all duration-1000 ${
                            (student.progress || 0) > 70 ? 'bg-emerald-500' : 'bg-amber-500'
                          }`}
                          style={{ width: `${student.progress || 0}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  <td className="px-10 py-6">
                    <span className={`label-micro px-3 py-1 border font-bold ${
                      student.status === 'active'
                      ? 'border-emerald-500/20 text-emerald-600 bg-emerald-500/5'
                      : 'border-amber-500/20 text-amber-600 bg-amber-500/5'
                    }`}>
                      {student.status.toUpperCase()}
                    </span>
                  </td>

                  <td className="px-10 py-6">
                    <div className="flex justify-end gap-2">
                      {student.status === 'pending' ? (
                        <>
                          <Button
                            size="sm"
                            disabled={actionLoading === student.id}
                            onClick={() => handleApprove(student)}
                            className="rounded-none bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase text-[10px] tracking-widest h-9 px-4"
                          >
                            {actionLoading === student.id ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Aprobar'}
                          </Button>
                          <Button
                            size="sm"
                            disabled={actionLoading === student.id}
                            onClick={() => handleReject(student)}
                            variant="outline"
                            className="rounded-none border-rose-200 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 font-black uppercase text-[10px] tracking-widest h-9 px-4"
                          >
                            Rechazar
                          </Button>
                        </>
                      ) : (
                        <Button
                          size="icon"
                          disabled={actionLoading === student.id}
                          onClick={() => setStudentToRemove(student)}
                          variant="outline"
                          className="rounded-none border-slate-900/10 h-9 w-9 text-rose-500 hover:bg-rose-600 hover:text-white transition-all"
                        >
                          <UserX className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="py-32 text-center">
                  <div className="h-20 w-20 border border-slate-900/10 dark:border-white/10 mx-auto mb-6 flex items-center justify-center">
                    <Users className="h-8 w-8 text-slate-100" />
                  </div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Sin Registros</h3>
                  <p className="label-micro text-slate-400 uppercase tracking-widest mt-2">
                    {searchTerm ? 'LA BÚSQUEDA NO COINCIDE CON NINGÚN ALUMNO.' : 'ESTE AULA NO CUENTA CON ALUMNOS INSCRITOS AÚN.'}
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Remove Confirmation Dialog */}
      <AlertDialog open={!!studentToRemove} onOpenChange={(open) => !open && !isRemoving && setStudentToRemove(null)}>
        <AlertDialogContent className="rounded-none border-slate-900/10">
          <AlertDialogHeader>
            <div className="flex h-16 w-16 items-center justify-center border border-rose-500/20 bg-rose-500/5 mx-auto mb-6">
              <AlertCircle className="h-8 w-8 text-rose-500" />
            </div>
            <AlertDialogTitle className="text-center text-2xl font-black uppercase tracking-tight">Expulsar del Aula</AlertDialogTitle>
            <AlertDialogDescription className="text-center text-sm font-medium py-4">
              Esta operación restringirá el acceso a <span className="text-slate-900 dark:text-white font-bold">{studentToRemove?.student_name?.toUpperCase()}</span>. El alumno perderá acceso inmediato a los contenidos y sesiones de este grupo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center gap-3 pt-4">
            <AlertDialogCancel disabled={isRemoving} className="rounded-none font-bold uppercase text-[10px] tracking-[0.2em]">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              disabled={isRemoving}
              onClick={handleRemove}
              className="rounded-none bg-rose-600 hover:bg-rose-700 font-bold uppercase text-[10px] tracking-[0.2em]"
            >
              {isRemoving ? 'PROCESANDO...' : 'CONFIRMAR EXPULSIÓN'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
