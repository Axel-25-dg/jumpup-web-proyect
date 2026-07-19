import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Plus,
  Edit2,
  Trash2,
  MessageSquare,
  ArrowLeft,
  Search,
  MoreVertical,
  Layers,
  Activity,
  AlertCircle
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
import { forumCategoryUseCase } from '@/infrastructure/factories/forum-category.factory'
import type { ForumCategory } from '@/domain/entities/forum-category.entity'

export default function AdminForumCategoriesPage() {
  const navigate = useNavigate()
  const [categories, setCategories] = useState<ForumCategory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryToDelete, setCategoryToDelete] = useState<ForumCategory | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const loadCategories = async () => {
    try {
      setIsLoading(true)
      const result = await forumCategoryUseCase.getAll()
      setCategories(result.results || [])
    } catch (err) {
      console.error('Error fetching categories:', err)
      toast.error('No se pudieron cargar las categorías del foro')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { loadCategories() }, [])

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return
    setIsDeleting(true)
    try {
      await forumCategoryUseCase.delete(categoryToDelete.id)
      setCategories(prev => prev.filter(c => c.id !== categoryToDelete.id))
      toast.success(`Categoría "${categoryToDelete.name}" eliminada con éxito`)
    } catch (error) {
      console.error('Error deleting category:', error)
      toast.error('Ocurrió un error al eliminar la categoría')
    } finally {
      setIsDeleting(false)
      setCategoryToDelete(null)
    }
  }

  const filteredCategories = categories.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.description?.toLowerCase().includes(searchTerm.toLowerCase()))
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
                <MessageSquare className="h-3.5 w-3.5 text-sky-500" />
                Arquitectura Social
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white uppercase">
              Secciones del <span className="text-sky-500">Foro</span>.
            </h1>
            <p className="text-base text-slate-500 dark:text-slate-400 max-w-lg font-medium">
              Estructuración de espacios de debate, soporte técnico y colaboración entre pares.
            </p>
          </div>
          <Button
            onClick={() => navigate('/admin/forum-categories/new')}
            className="rounded-none bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold uppercase text-[11px] tracking-[0.2em] px-8 py-6 h-auto hover:bg-sky-500 dark:hover:bg-sky-500 hover:text-white transition-all"
          >
            <Plus className="h-4 w-4 mr-2" /> Nueva Categoría
          </Button>
        </div>
      </section>

      {/* TOOLBAR */}
      <div className="border-b border-slate-900/10 dark:border-white/10 p-6 md:p-8 flex flex-col lg:flex-row gap-6 justify-between items-center bg-white dark:bg-transparent">
        <div className="relative w-full lg:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            placeholder="BUSCAR POR NOMBRE O DESCRIPCIÓN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border border-slate-900/10 dark:border-white/10 bg-transparent py-3.5 pl-12 pr-4 text-[11px] font-bold uppercase tracking-widest outline-none focus:border-sky-500 transition-colors"
          />
        </div>
        <div className="label-caps border border-slate-900/10 dark:border-white/10 text-slate-500 px-6 py-3 bg-slate-50 dark:bg-white/5 font-mono">
          {categories.length} SECCIONES ACTIVAS
        </div>
      </div>

      {/* DATA TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1100px] text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-900/10 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02]">
              <th className="px-8 py-5 label-caps text-slate-400">Orden</th>
              <th className="px-8 py-5 label-caps text-slate-400">Categoría / Atributos</th>
              <th className="px-8 py-5 label-caps text-slate-400">Interacción</th>
              <th className="px-8 py-5 label-caps text-slate-400">Estado Operativo</th>
              <th className="px-8 py-5 label-caps text-slate-400 text-right">Gestión</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-900/5 dark:divide-white/5">
            {isLoading ? (
              [1, 2, 3].map(i => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={5} className="px-8 py-8"><div className="h-4 bg-slate-100 dark:bg-white/5 w-full" /></td>
                </tr>
              ))
            ) : filteredCategories.length > 0 ? (
              filteredCategories.map((category) => (
                <tr key={category.id} className="card-hover group">
                  <td className="px-8 py-6">
                    <span className="h-10 w-10 border border-slate-900/10 dark:border-white/10 flex items-center justify-center font-mono font-bold text-slate-400 bg-slate-50 dark:bg-white/5">
                      {category.order.toString().padStart(2, '0')}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 shrink-0 border border-slate-900/10 dark:border-white/10 flex items-center justify-center text-sky-500 bg-slate-50 dark:bg-white/5">
                        <MessageSquare className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight group-hover:text-sky-500 transition-colors">
                          {category.name}
                        </p>
                        <p className="label-micro text-slate-400 mt-0.5 truncate max-w-[400px]">
                          {category.description || 'SIN DESCRIPCIÓN TÉCNICA'}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                      <Layers className="h-3.5 w-3.5 text-slate-400" />
                      <span className="label-micro text-slate-600 dark:text-slate-300 font-bold font-mono">
                        {category.thread_count} HILOS GENERADOS
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                      <span className={`h-1.5 w-1.5 ${category.is_active ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                      <span className={`label-micro font-bold uppercase ${category.is_active ? 'text-emerald-600' : 'text-rose-500'}`}>
                        {category.is_active ? 'ACTIVO' : 'INACTIVO'}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-none border-slate-900/10 hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-slate-900 transition-all font-bold text-[10px] uppercase tracking-widest h-9"
                        onClick={() => navigate(`/admin/forum-categories/${category.id}/edit`)}
                      >
                        <Edit2 className="h-3.5 w-3.5 mr-2" /> Editar
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="icon" className="rounded-none border-slate-900/10 h-9 w-9">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-none border-slate-900/10 dark:border-white/10">
                          <DropdownMenuItem className="label-micro py-3">
                            <Activity className="h-4 w-4 mr-2" /> Estadísticas
                          </DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => setCategoryToDelete(category)} className="label-micro py-3 text-rose-500 focus:text-rose-500">
                            <Trash2 className="h-4 w-4 mr-2" /> Eliminar Sección
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="py-24 text-center">
                  <div className="flex h-16 w-16 items-center justify-center border border-slate-900/10 dark:border-white/10 mx-auto mb-6">
                    <MessageSquare className="h-6 w-6 text-slate-300" />
                  </div>
                  <p className="label-caps text-slate-400">No se encontraron categorías de foro registradas</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Dialog */}
      <AlertDialog open={!!categoryToDelete} onOpenChange={(open) => !open && !isDeleting && setCategoryToDelete(null)}>
        <AlertDialogContent className="rounded-none border-slate-900/10">
          <AlertDialogHeader>
            <div className="flex h-16 w-16 items-center justify-center border border-rose-500/20 bg-rose-500/5 mx-auto mb-6">
              <AlertCircle className="h-8 w-8 text-rose-500" />
            </div>
            <AlertDialogTitle className="text-center text-2xl font-black uppercase tracking-tight">Eliminar Categoría</AlertDialogTitle>
            <AlertDialogDescription className="text-center text-sm font-medium py-4">
              ¿Desea eliminar definitivamente la categoría <span className="text-slate-900 dark:text-white font-bold uppercase">"{categoryToDelete?.name}"</span>? Esta acción purgará todos los hilos y respuestas asociados a este espacio.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center gap-3 pt-4">
            <AlertDialogCancel className="rounded-none font-bold uppercase text-[10px] tracking-[0.2em]">Cancelar</AlertDialogCancel>
            <AlertDialogAction disabled={isDeleting} onClick={handleDeleteCategory} className="rounded-none bg-rose-600 hover:bg-rose-700 font-bold uppercase text-[10px] tracking-[0.2em]">
              {isDeleting ? 'Eliminando...' : 'Confirmar Eliminación'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
