import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  BookOpen, Plus, Search, Edit2, Trash2, ArrowLeft,
  Layers, AlertCircle, Loader2
} from 'lucide-react'
import { Button } from '@/presentation/components/ui/button'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/presentation/components/ui/alert-dialog'
import {
  Dialog, DialogContent,
} from '@/presentation/components/ui/dialog'
import { toast } from 'sonner'
import { courseRepo } from '@/infrastructure/factories/teacher.factory'
import type { Course, Module } from '@/domain/entities/course.entity'

export default function AdminModulesPage() {
  const [searchParams] = useSearchParams()
  const preselectedCourse = searchParams.get('course')

  const [modules, setModules] = useState<Module[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(
    preselectedCourse ? Number(preselectedCourse) : null
  )
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingModule, setEditingModule] = useState<Module | null>(null)
  const [moduleTitle, setModuleTitle] = useState('')
  const [moduleOrder, setModuleOrder] = useState(1)
  const [isSaving, setIsSaving] = useState(false)

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
        await courseRepo.createModule({ course: selectedCourseId, title: moduleTitle, order: moduleOrder })
        toast.success('Módulo creado con éxito')
      }
      const mods = await courseRepo.getModulesByCourse(selectedCourseId)
      setModules(mods)
      setIsModalOpen(false)
    } catch (error: any) {
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
              Gestión de <span className="text-sky-500">Módulos</span>.
            </h1>
            <p className="text-base text-slate-500 dark:text-slate-400 max-w-lg font-medium">
              Organización jerárquica de contenidos y secuenciación de lecciones por curso.
            </p>
          </div>
          <Button
            onClick={openCreateModal}
            disabled={!selectedCourseId}
            className="rounded-none bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold uppercase text-[11px] tracking-[0.2em] px-8 py-6 h-auto hover:bg-sky-500 dark:hover:bg-sky-500 hover:text-white transition-all disabled:opacity-50"
          >
            <Plus className="h-4 w-4 mr-2" /> Nuevo Módulo
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
            <option value="" className="bg-white dark:bg-[#0a0a0b]">SELECCIONAR CURSO...</option>
            {courses.map(c => (
              <option key={c.id} value={c.id} className="bg-white dark:bg-[#0a0a0b]">{c.title.toUpperCase()}</option>
            ))}
          </select>
        </div>

        {selectedCourseId && (
          <div className="relative w-full lg:max-w-xs">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              placeholder="BUSCAR MÓDULO..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-slate-900/10 dark:border-white/10 bg-transparent py-3 pl-12 pr-4 text-[11px] font-bold uppercase tracking-widest outline-none focus:border-sky-500 transition-colors"
            />
          </div>
        )}
      </div>

      {/* DATA TABLE */}
      <div className="overflow-x-auto">
        {selectedCourseId ? (
          <table className="w-full min-w-[800px] text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-900/10 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02]">
                <th className="px-8 py-5 label-caps text-slate-400 w-24">Orden</th>
                <th className="px-8 py-5 label-caps text-slate-400">Identificador / Título del Módulo</th>
                <th className="px-8 py-5 label-caps text-slate-400 text-right">Acciones de Gestión</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900/5 dark:divide-white/5">
              {isLoading ? (
                [1, 2, 3].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={3} className="px-8 py-8"><div className="h-4 bg-slate-100 dark:bg-white/5 w-full" /></td>
                  </tr>
                ))
              ) : filteredModules.length > 0 ? (
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
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-none border-slate-900/10 hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-slate-900 transition-all font-bold text-[10px] uppercase tracking-widest h-9"
                          onClick={() => openEditModal(mod)}
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
              ) : (
                <tr>
                  <td colSpan={3} className="py-24 text-center">
                    <div className="flex h-16 w-16 items-center justify-center border border-slate-900/10 dark:border-white/10 mx-auto mb-6">
                      <Layers className="h-6 w-6 text-slate-300" />
                    </div>
                    <p className="label-caps text-slate-400 mb-6">No hay módulos registrados en este curso</p>
                    <Button
                      size="sm"
                      onClick={openCreateModal}
                      className="rounded-none bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold uppercase text-[10px] tracking-widest px-6"
                    >
                      Crear Primer Módulo
                    </Button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        ) : (
          <div className="py-32 text-center border-b border-slate-900/10 dark:border-white/10">
            <BookOpen className="h-12 w-12 text-slate-200 dark:text-slate-800 mx-auto mb-6" />
            <p className="label-caps text-slate-400">Selecciona un curso para gestionar su estructura</p>
          </div>
        )}
      </div>

      {/* CREATE/EDIT MODAL - Editorial */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="rounded-none border-slate-900/10 dark:border-white/10 p-0 overflow-hidden max-w-md">
          <div className="bg-slate-900 dark:bg-white p-6">
            <h2 className="text-xl font-black text-white dark:text-slate-900 uppercase tracking-tight">
              {editingModule ? 'Actualizar Módulo' : 'Nuevo Módulo Técnico'}
            </h2>
          </div>
          <div className="p-8 space-y-6">
            <div className="space-y-2">
              <label className="label-caps text-slate-400">Título del Módulo</label>
              <input
                value={moduleTitle}
                onChange={(e) => setModuleTitle(e.target.value)}
                placeholder="EJ. UNIDAD 01: FUNDAMENTOS"
                className="w-full border border-slate-900/10 dark:border-white/10 bg-transparent py-3 px-4 text-[11px] font-bold uppercase tracking-widest outline-none focus:border-sky-500 transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="label-caps text-slate-400">Orden de Secuencia</label>
              <input
                type="number"
                min={1}
                value={moduleOrder}
                onChange={(e) => setModuleOrder(Number(e.target.value))}
                className="w-full border border-slate-900/10 dark:border-white/10 bg-transparent py-3 px-4 text-[11px] font-bold uppercase tracking-widest outline-none focus:border-sky-500 transition-colors max-w-[120px]"
              />
            </div>
          </div>
          <div className="p-6 bg-slate-50 dark:bg-white/5 border-t border-slate-900/10 dark:border-white/10 flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              className="rounded-none font-bold uppercase text-[10px] tracking-widest"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSaveModule}
              disabled={isSaving}
              className="rounded-none bg-sky-500 hover:bg-sky-600 text-white font-bold uppercase text-[10px] tracking-widest"
            >
              {isSaving ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : null}
              {editingModule ? 'Guardar Cambios' : 'Confirmar Creación'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* DELETE DIALOG - Editorial */}
      <AlertDialog open={!!moduleToDelete} onOpenChange={(open) => !open && !isDeleting && setModuleToDelete(null)}>
        <AlertDialogContent className="rounded-none border-slate-900/10">
          <AlertDialogHeader>
            <div className="flex h-16 w-16 items-center justify-center border border-rose-500/20 bg-rose-500/5 mx-auto mb-6">
              <AlertCircle className="h-8 w-8 text-rose-500" />
            </div>
            <AlertDialogTitle className="text-center text-2xl font-black uppercase tracking-tight">Eliminar Estructura</AlertDialogTitle>
            <AlertDialogDescription className="text-center text-sm font-medium py-4">
              ¿Confirmas la eliminación de <span className="text-slate-900 dark:text-white font-bold">"{moduleToDelete?.title}"</span>? Se perderán todas las lecciones y recursos vinculados a este módulo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center gap-3 pt-4">
            <AlertDialogCancel className="rounded-none font-bold uppercase text-[10px] tracking-[0.2em]">Cancelar</AlertDialogCancel>
            <AlertDialogAction disabled={isDeleting} onClick={handleDeleteModule} className="rounded-none bg-rose-600 hover:bg-rose-700 font-bold uppercase text-[10px] tracking-[0.2em]">
              {isDeleting ? 'Eliminando...' : 'Confirmar Eliminación'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>

  )
}