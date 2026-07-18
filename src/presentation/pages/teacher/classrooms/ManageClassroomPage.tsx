import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Users,
  MessageSquare,
  Settings,
  UserX,
  UserCheck
} from 'lucide-react'
import { Card, CardContent } from '@/presentation/components/ui/card'
import { Button } from '@/presentation/components/ui/button'
import { Input } from '@/presentation/components/ui/input'
import { Search } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/presentation/components/ui/avatar'
import { Badge } from '@/presentation/components/ui/badge'
import { Skeleton } from '@/presentation/components/ui/skeleton'
import { getClassroomStudentsUseCase } from '@/infrastructure/factories/teacher.factory'
import type { ClassroomStudent } from '@/domain/entities/classroom.entity'

export default function ManageClassroomPage() {
  const { id } = useParams()
  const [searchTerm, setSearchTerm] = useState('')
  const [students, setStudents] = useState<ClassroomStudent[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStudents = async () => {
      if (!id) return
      try {
        const result = await getClassroomStudentsUseCase.execute(Number(id))
        setStudents(result.results || [])
      } catch (error) {
        console.error('Error fetching students:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchStudents()
  }, [id])

  const filteredStudents = students.filter(s => 
    s.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.student_email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-8 animate-in fade-in duration-700 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild className="rounded-xl hover:bg-slate-100">
            <Link to="/classrooms"><ArrowLeft className="h-5 w-5" /></Link>
          </Button>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Gestión de Aula</h1>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-1">Nivel B2 - Grupo Mañana</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="h-12 rounded-xl font-bold">
            <Settings className="mr-2 h-5 w-5" /> Ajustes
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-none shadow-xl shadow-slate-200/50 rounded-[2rem]">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="bg-sky-50 text-sky-600 p-4 rounded-2xl">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Alumnos</p>
              <h4 className="text-3xl font-black text-slate-900">{students.length}</h4>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-xl shadow-slate-200/50 rounded-[2rem]">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="bg-emerald-50 text-emerald-600 p-4 rounded-2xl">
              <UserCheck className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Activos</p>
              <h4 className="text-3xl font-black text-slate-900">{students.filter(s => s.status === 'active').length}</h4>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl shadow-slate-200/50 rounded-[2rem]">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="bg-amber-50 text-amber-600 p-4 rounded-2xl">
              <MessageSquare className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pendientes</p>
              <h4 className="text-3xl font-black text-slate-900">{students.filter(s => s.status === 'pending').length}</h4>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Student List */}
      <Card className="border-none shadow-2xl shadow-slate-200/50 bg-white rounded-[2.5rem] overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50/50">
           <div className="relative w-full sm:max-w-md">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
             <Input 
               placeholder="Buscar alumno por nombre o email..." 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="h-12 pl-12 rounded-xl border-slate-200 bg-white font-medium"
             />
           </div>
        </div>
        <CardContent className="p-0">
          <div className="divide-y divide-slate-100">
            {isLoading ? (
               <div className="p-6 space-y-4">
                 {[1,2,3].map(i => (
                   <div key={i} className="flex gap-6 items-center">
                     <Skeleton className="h-14 w-14 rounded-full" />
                     <div className="space-y-2 flex-1">
                       <Skeleton className="h-4 w-32" />
                       <Skeleton className="h-3 w-48" />
                     </div>
                   </div>
                 ))}
               </div>
            ) : filteredStudents.length > 0 ? (
              filteredStudents.map((student) => (
                <div key={student.id} className="p-6 flex flex-col md:flex-row items-center gap-6 hover:bg-slate-50 transition-colors group">
                  <Avatar className="h-14 w-14 border-2 border-white shadow-md">
                    <AvatarFallback className="bg-gradient-to-br from-sky-400 to-indigo-500 text-white font-black">
                      {(student.student_name || 'Al').substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-center md:text-left">
                    <h3 className="text-lg font-black text-slate-900">{student.student_name || 'Alumno sin nombre'}</h3>
                    <p className="text-sm font-bold text-slate-500">{student.student_email}</p>
                  </div>
                  
                  <div className="flex flex-col items-center gap-1 min-w-[100px]">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Progreso</span>
                    <Badge variant="outline" className={`font-black ${(student.progress || 0) > 70 ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-amber-50 text-amber-600 border-amber-200'}`}>
                      {student.progress || 0}%
                    </Badge>
                  </div>

                  <div className="flex items-center gap-3 w-full md:w-auto justify-center">
                    {student.status === 'pending' ? (
                      <>
                        <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl h-10 px-4">
                          <UserCheck className="mr-2 h-4 w-4" /> Aprobar
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-500 border-red-200 hover:bg-red-50 font-bold rounded-xl h-10 px-4">
                           Rechazar
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button size="sm" variant="outline" className="font-bold rounded-xl h-10 px-4">
                          Ver Perfil
                        </Button>
                        <Button size="sm" variant="ghost" className="text-red-500 hover:bg-red-50 hover:text-red-600 rounded-xl h-10 w-10 p-0">
                          <UserX className="h-5 w-5" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="py-20 text-center">
                <Users className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                <h3 className="text-lg font-black text-slate-900">No se encontraron alumnos</h3>
                <p className="text-slate-500 font-medium">Prueba con otra búsqueda.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
