import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  BookOpen,
  Plus,
  Search,
  Edit2,
  Trash2,
  ArrowLeft,
  ArrowRight,
  Layers,
  AlertCircle,
  Loader2
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/components/ui/card'
import { Button } from '@/presentation/components/ui/button'
import { Input } from '@/presentation/components/ui/input'
import { Badge } from '@/presentation/components/ui/badge'
import { Skeleton } from '@/presentation/components/ui/skeleton'
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/presentation/components/ui/dialog'
import { toast } from 'sonner'
import { courseRepo } from '@/infrastructure/factories/teacher.factory'
import type { Course, Module } from '@/domain/entities/course.entity'

export default function AdminModulesPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const preselectedCourse = searchParams.get('course')

  const [modules, setModules] = useState<Module[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(
    preselectedCourse ? Number(preselectedCourse) : null
  )
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  // Create/Edit modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingModule, setEditingModule] = useState<Module | null>(null)
  const [moduleTitle, setModuleTitle] = useState('')
  const [moduleOrder, setModuleOrder] = useState(1)
  const [isSaving, setIsSaving] = useState(false)

  // Delete state
  const [moduleToDelete, setModuleToDelete] = useState<Module | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        const courseResult = await courseRepo.getAll()
        setCourses(courseResult.results || [])

        if (selectedCourseId) {
          const mods = await courseRepo.getModulesByCourse(selectedCourseId)
          setModules(mods)
        } else {
          setModules([])
        }
      } catch (error) {
        console.error('Error loading data:', error)
        toast.error('Error al cargar los datos')
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [selectedCourseId])

  const handleCourseChange = (courseId: string) => {
    setSelectedCourseId(courseId ? Number(courseId) : null)
  }

  const openCreateModal = () => {
    setEditingModule(null)
    setModuleTitle('')
    setModuleOrder(1)
    setIsModalOpen(true)
  }

  const openEditModal = (mod: Module) => {
    setEditingModule(mod)
    setModuleTitle(mod.title)
    setModuleOrder(mod.order)
    setIsModalOpen(true)
  }

  const handleSaveModule = async () => {
    if (!moduleTitle.trim() || !selectedCourseId) {
      toast.error('Completa todos los campos requeridos')
      return
    }
    setIsSaving(true)
    try {
      if (editingModule) {
        await courseRepo.updateModule(editingModule.id, { title: moduleTitle, order: moduleOrder })
        toast.success('Módulo actualizado con éxito')
      } else {
        await courseRepo.createModule({
          course: selectedCourseId,
          title: moduleTitle,
          order: moduleOrder,
        })
        toast.success('Módulo creado con éxito')
      }
      // Refresh
      const mods = await courseRepo.getModulesByCourse(selectedCourseId)
      setModules(mods)
      setIsModalOpen(false)
    } catch (error: any) {
      console.error('Error saving module:', error)
      toast.error(error?.detail || 'Error al guardar el módulo')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteModule = async () => {
    if (!moduleToDelete) return
    setIsDeleting(true)
    try {
      await courseRepo.deleteModule(moduleToDelete.id)
      setModules(modules.filter(m => m.id !== moduleToDelete.id))
      toast.success('Módulo eliminado con éxito')
    } catch (error) {
      console.error('Error deleting module:', error)
      toast.error('Error al eliminar el módulo')
    } finally {
      setIsDeleting(false)
      setModuleToDelete(null)
    }
  }

  const filteredModules = modules.filter(m =>
    m.title.toLowerCase().includes(searchTerm.toLowerCase())
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
            <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">Gestión de Módulos</h1>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-1">Organiza las lecciones dentro de los cursos</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button
            className="h-12 rounded-2xl font-black bg-sky-600 hover:bg-sky-700 shadow-xl shadow-sky-500/20 px-6 group"
            onClick={openCreateModal}
            disabled={!selectedCourseId}
          >
            <Plus className="mr-2 h-5 w-5" /> Nuevo Módulo
          </Button>
        </div>
      </div>

      {/* Course Selector */}
      <Card className="border-none shadow-xl shadow-slate-200/50 bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-sky-600" />
              <label className="font-black text-sm text-slate-900 dark:text-white">Filtrar por Curso:</label>
            </div>
            <select
              value={selectedCourseId ?? ''}
              onChange={(e) => handleCourseChange(e.target.value)}
              className="flex-1 h-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="">Selecciona un curso...</option>
              {courses.map(c => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Modules List */}
      {selectedCourseId ? (
        <Card className="border-none shadow-2xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50/50 dark:bg-slate-800/20">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 dark:text-slate-500" />
              <Input
                placeholder="Buscar módulo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-12 pl-12 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
              />
            </div>
            <Badge className="bg-sky-100 text-sky-700 font-bold px-3 py-1">
              {modules.length} módulos
            </Badge>
          </div>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 space-y-4">
                {[1,2,3].map(i => (
                  <Skeleton key={i} className="h-20 w-full rounded-2xl" />
                ))}
              </div>
            ) : filteredModules.length > 0 ? (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredModules.map((mod, index) => (
                  <div key={mod.id} className="p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-sky-50 dark:bg-sky-900/20 text-sky-600 flex items-center justify-center font-black text-sm">
                        {mod.order || index + 1}
                      </div>
                      <div>
                        <h3 className="font-black text-slate-900 dark:text-white">{mod.title}</h3>
                        <p className="text-xs font-bold text-slate-400">Curso: {mod.course_title}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-10 w-10 rounded-xl p-0"
                        onClick={() => openEditModal(mod)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-10 w-10 rounded-xl p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={() => setModuleToDelete(mod)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-20 text-center">
                <Layers className="h-12 w-12 text-slate-200 dark:text-slate-700 mx-auto mb-4" />
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Sin módulos</h3>
                <p className="text-slate-500 font-medium">Este curso aún no tiene módulos.</p>
                <Button className="mt-4 rounded-xl font-bold" onClick={openCreateModal}>
                  <Plus className="mr-2 h-4 w-4" /> Crear Primer Módulo
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="border-none shadow-2xl shadow-slate-200/50 bg-white dark:bg-slate-900 rounded-[2.5rem]">
          <CardContent className="py-20 text-center">
            <BookOpen className="h-16 w-16 text-slate-200 dark:text-slate-700 mx-auto mb-4" />
            <h3 className="text-xl font-black text-slate-900 dark:text-white">Selecciona un curso</h3>
            <p className="text-slate-500 font-medium mt-2">Elige un curso arriba para ver sus módulos.</p>
          </CardContent>
        </Card>
      )}

      {/* Create/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-lg rounded-3xl bg-white dark:bg-slate-900">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-slate-900 dark:text-white">
              {editingModule ? 'Editar Módulo' : 'Nuevo Módulo'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-black text-slate-900 dark:text-white">Título del Módulo</label>
              <Input
                value={moduleTitle}
                onChange={(e) => setModuleTitle(e.target.value)}
                placeholder="Ej. Unidad 1: Fundamentos"
                className="h-14 rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-black text-slate-900 dark:text-white">Orden</label>
              <Input
                type="number"
                min={1}
                value={moduleOrder}
                onChange={(e) => setModuleOrder(Number(e.target.value))}
                className="h-14 rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium max-w-[150px]"
              />
            </div>
          </div>
          <DialogFooter className="gap-3">
            <Button variant="outline" onClick={() => setIsModalOpen(false)} className="rounded-xl h-12 px-6 font-bold">
              Cancelar
            </Button>
            <Button
              onClick={handleSaveModule}
              disabled={isSaving}
              className="rounded-xl h-12 px-6 font-bold bg-sky-600 hover:bg-sky-700"
            >
              {isSaving ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
              {editingModule ? 'Actualizar' : 'Crear Módulo'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!moduleToDelete} onOpenChange={(open) => !open && !isDeleting && setModuleToDelete(null)}>
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader>
            <div className="mx-auto bg-red-100 dark:bg-red-900/30 p-3 rounded-full w-fit mb-4">
              <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <AlertDialogTitle className="text-center text-2xl font-black">¿Eliminar módulo?</AlertDialogTitle>
            <AlertDialogDescription className="text-center font-medium">
              Esto eliminará permanentemente el módulo <br/>
              <span className="font-bold text-slate-900 dark:text-white">"{moduleToDelete?.title}"</span> y todas sus lecciones asociadas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center gap-3 mt-6">
            <AlertDialogCancel disabled={isDeleting} className="rounded-xl h-12 px-6 font-bold">Cancelar</AlertDialogCancel>
            <AlertDialogAction disabled={isDeleting} onClick={handleDeleteModule} className="bg-red-600 hover:bg-red-700 text-white rounded-xl h-12 px-6 font-bold">
              {isDeleting ? 'Eliminando...' : 'Sí, eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}