import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  BookOpen, Plus, Search, Edit2, Trash2, ArrowLeft,
  Layers, AlertCircle
} from 'lucide-react'
import { Button } from '@/presentation/components/ui/button'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/presentation/components/ui/alert-dialog'
import { toast } from 'sonner'
import { courseRepo } from '@/infrastructure/factories/teacher.factory'
import type { Course, Module } from '@/domain/entities/course.entity'

export default function AdminModulesPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const preselectedCourse = searchParams.get('course')

  const [allModules, setAllModules] = useState<(Module & { courseTitle?: string })[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(
    preselectedCourse ? Number(preselectedCourse) : null
  )
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  const [moduleToDelete, setModuleToDelete] = useState<Module | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const loadAllModules = async () => {
      try {
        setIsLoading(true)
        const courseResult = await courseRepo.getAll()
        const coursesList = courseResult.results || []
        setCourses(coursesList)

        // Cargar todos los modulos de todos los cursos
        const allMods: (Module & { courseTitle?: string })[] = []
        for (const course of coursesList) {
          const mods = await courseRepo.getModulesByCourse(course.id)
          mods.forEach(m => {
            allMods.push({ ...m, courseTitle: course.title })
          })
        }
        setAllModules(allMods)
      } catch (error) {
        console.error('Error loading data:', error)
        toast.error('Error al cargar los datos')
      } finally {
        setIsLoading(false)
      }
    }
    void loadAllModules()
  }, [])

  const handleCourseChange = (courseId: string) => {
    setSelectedCourseId(courseId ? Number(courseId) : null)
  }

  const handleDeleteModule = async () => {
    if (!moduleToDelete) return
    setIsDeleting(true)
    try {
      await courseRepo.deleteModule(moduleToDelete.id)
      setAllModules(allModules.filter(m => m.id !== moduleToDelete.id))
      toast.success('Modulo eliminado con exito')
    } catch {
      toast.error('Error al eliminar el modulo')
    } finally {
      setIsDeleting(false)
      setModuleToDelete(null)
    }
  }

  const filteredModules = allModules.filter(m => {
    const matchesSearch = m.title.toLowerCase().includes(searchTerm.toLowerCase())
    if (!matchesSearch) return false
    if (selectedCourseId) return m.course === selectedCourseId
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
                <Layers className="h-3.5 w-3.5 text-sky-500" />
                Estructura
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white uppercase">
              Gestion de <span className="text-sky-500">Modulos</span>.
            </h1>
            <p className="text-base text-slate-500 dark:text-slate-400 max-w-lg font-medium">
              Organizacion jerarquica de contenidos y secuenciacion de lecciones por curso.
            </p>
          </div>
          <Button
            onClick={() => {
              const courseParam = selectedCourseId ? `?course=${selectedCourseId}` : ''
              navigate(`/admin/management/modules/new${courseParam}`)
            }}
            className="rounded-none bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold uppercase text-[11px] tracking-[0.2em] px-8 py-6 h-auto hover:bg-sky-500 dark:hover:bg-sky-500 hover:text-white transition-all"
          >
            <Plus className="h-4 w-4 mr-2" /> Nuevo Modulo
          </Button>
        </div>
      </section>

      {/* SELECTOR & TOOLBAR */}
      <div className="border-b border-slate-900/10 dark:border-white/10 p-6 md:p-8 flex flex-col lg:flex-row gap-6 justify-between items-center bg-white dark:bg-transparent">
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:max-w-2xl">
          <div className="flex items-center gap-3 shrink-0">
            <BookOpen className="h-4 w-4 text-sky-500" />
            <span className="label-caps text-slate-900 dark:text-white">Filtrar Curso:</span>
          </div>
          <select
            value={selectedCourseId ?? ''}
            onChange={(e) => handleCourseChange(e.target.value)}
            className="flex-1 w-full border border-slate-900/10 dark:border-white/10 bg-transparent py-3 px-4 text-[11px] font-bold uppercase tracking-widest outline-none focus:border-sky-500 transition-colors appearance-none"
          >
            <option value="" className="bg-white dark:bg-[#0a0a0b]">TODOS LOS CURSOS</option>
            {courses.map(c => (
              <option key={c.id} value={c.id} className="bg-white dark:bg-[#0a0a0b]">{c.title.toUpperCase()}</option>
            ))}
          </select>
        </div>

        <div className="relative w-full lg:max-w-xs">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            placeholder="BUSCAR MODULO..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border border-slate-900/10 dark:border-white/10 bg-transparent py-3 pl-12 pr-4 text-[11px] font-bold uppercase tracking-widest outline-none focus:border-sky-500 transition-colors"
          />
        </div>
      </div>

      {/* DATA TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px] text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-900/10 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02]">
              <th className="px-8 py-5 label-caps text-slate-400 w-24">Orden</th>
              <th className="px-8 py-5 label-caps text-slate-400">Identificador / Titulo del Modulo</th>
              <th className="px-8 py-5 label-caps text-slate-400">Curso</th>
              <th className="px-8 py-5 label-caps text-slate-400 text-right">Acciones de Gestion</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-900/5 dark:divide-white/5">
            {isLoading ? (
              [1, 2, 3].map(i => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={4} className="px-8 py-8"><div className="h-4 bg-slate-100 dark:bg-white/5 w-full" /></td>
                </tr>
              ))
            ) : !isLoading && filteredModules.length > 0 ? (
              filteredModules.map((mod, index) => (
                <tr key={mod.id} className="card-hover group">
                  <td className="px-8 py-6">
                    <div className="h-10 w-10 flex items-center justify-center border border-slate-900/10 dark:border-white/10 font-black text-sm text-sky-500 bg-slate-50 dark:bg-white/5">
                      {mod.order || index + 1}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div>
                      <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight group-hover:text-sky-500 transition-colors">
                        {mod.title}
                      </p>
                      <p className="label-micro text-slate-400 font-mono mt-0.5">MOD_ID: {mod.id.toString().padStart(4, '0')}</p>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="label-micro px-2 py-0.5 border border-sky-500/20 text-sky-600 bg-sky-500/5 uppercase">
                      {mod.courseTitle || mod.course_title || '---'}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-none border-slate-900/10 hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-slate-900 transition-all font-bold text-[10px] uppercase tracking-widest h-9"
                        onClick={() => navigate(`/admin/management/modules/${mod.id}/edit?course=${mod.course}`)}
                      >
                        <Edit2 className="h-3.5 w-3.5 mr-2" /> Editar
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="rounded-none border-slate-900/10 h-9 w-9 text-rose-500 hover:bg-rose-500 hover:text-white"
                        onClick={() => setModuleToDelete(mod)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            ) : !isLoading ? (
              <tr>
                <td colSpan={4} className="py-24 text-center">
                  <div className="flex h-16 w-16 items-center justify-center border border-slate-900/10 dark:border-white/10 mx-auto mb-6">
                    <Layers className="h-6 w-6 text-slate-300" />
                  </div>
                  <p className="label-caps text-slate-400 mb-6">No hay modulos registrados</p>
                  <Button
                    size="sm"
                    onClick={() => navigate('/admin/management/modules/new')}
                    className="rounded-none bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold uppercase text-[10px] tracking-widest px-6"
                  >
                    Crear Primer Modulo
                  </Button>
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      {/* DELETE DIALOG */}
      <AlertDialog open={!!moduleToDelete} onOpenChange={(open) => !open && !isDeleting && setModuleToDelete(null)}>
        <AlertDialogContent className="rounded-none border-slate-900/10">
          <AlertDialogHeader>
            <div className="flex h-16 w-16 items-center justify-center border border-rose-500/20 bg-rose-500/5 mx-auto mb-6">
              <AlertCircle className="h-8 w-8 text-rose-500" />
            </div>
            <AlertDialogTitle className="text-center text-2xl font-black uppercase tracking-tight">Eliminar Estructura</AlertDialogTitle>
            <AlertDialogDescription className="text-center text-sm font-medium py-4">
              Confirmas la eliminacion de <span className="text-slate-900 dark:text-white font-bold">"{moduleToDelete?.title}"</span>? Se perderan todas las lecciones y recursos vinculados a este modulo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center gap-3 pt-4">
            <AlertDialogCancel className="rounded-none font-bold uppercase text-[10px] tracking-[0.2em]">Cancelar</AlertDialogCancel>
            <AlertDialogAction disabled={isDeleting} onClick={handleDeleteModule} className="rounded-none bg-rose-600 hover:bg-rose-700 font-bold uppercase text-[10px] tracking-[0.2em]">
              {isDeleting ? 'Eliminando...' : 'Confirmar Eliminacion'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}