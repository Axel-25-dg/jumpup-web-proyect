import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Plus,
  Edit2,
  Trash2,
  Package,
  Calendar,
  Search,
  MoreVertical,
  ArrowLeft,
  AlertCircle,
  ShoppingBag,
} from 'lucide-react'
import { Button } from '@/presentation/components/ui/button'
import { Input } from '@/presentation/components/ui/input'
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
import { catalogoUseCase } from '@/infrastructure/factories/catalogo.factory'
import type { Catalogo } from '@/domain/entities/catalogo.entity'

const TIPO_STYLES: Record<string, string> = {
  curso: 'bg-sky-100 text-sky-700 dark:bg-sky-900/20 dark:text-sky-400',
  libro: 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400',
}

const TIPO_LABELS: Record<string, string> = {
  curso: 'Curso',
  libro: 'Libro',
}

export default function AdminCatalogoPage() {
  const navigate = useNavigate()
  const [items, setItems] = useState<Catalogo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [itemToDelete, setItemToDelete] = useState<Catalogo | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const loadItems = async () => {
    setIsLoading(true)
    try {
      const result = await catalogoUseCase.getAll()
      setItems(result.results || [])
    } catch (err) {
      console.error('Error loading catalog:', err)
      toast.error('No se pudieron cargar los productos')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { loadItems() }, [])

  const handleDelete = async () => {
    if (!itemToDelete) return
    setIsDeleting(true)
    try {
      await catalogoUseCase.delete(itemToDelete.id)
      setItems(prev => prev.filter(i => i.id !== itemToDelete.id))
      toast.success(`Producto "${itemToDelete.titulo}" eliminado con éxito`)
    } catch (err) {
      console.error('Error deleting item:', err)
      toast.error('Error al eliminar el producto')
    } finally {
      setIsDeleting(false)
      setItemToDelete(null)
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  const filteredItems = items.filter(item =>
    item.titulo.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="animate-in fade-in duration-500">
      {/* HERO */}
      <section className="border-b border-slate-900/10 dark:border-white/10 px-8 md:px-12 py-12 md:py-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" asChild className="-ml-2">
                <Link to="/admin"><ArrowLeft className="h-4 w-4" /></Link>
              </Button>
              <div className="chip">
                <ShoppingBag className="h-3.5 w-3.5 text-sky-500" />
                E-Commerce
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
              Catálogo de <span className="text-sky-500">Productos</span>.
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Gestiona los productos y cursos a la venta en la plataforma.
            </p>
          </div>
          <Button onClick={() => navigate('/admin/catalogo/new')} size="lg" className="gap-2 shrink-0 group">
            <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform" />
            Nuevo Producto
          </Button>
        </div>
      </section>

      {/* TOOLBAR */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center px-8 md:px-10 py-5 border-b border-slate-900/10 dark:border-white/10">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Buscar productos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* PRODUCTS LIST */}
      <div className="divide-y divide-slate-900/5 dark:divide-white/5 bg-transparent">
        {isLoading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex gap-4 items-center">
                <Skeleton className="h-12 w-12 shrink-0" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <div key={item.id} className="p-6 flex flex-col md:flex-row items-center gap-6 card-hover group">
              <div className="h-12 w-12 shrink-0 flex items-center justify-center border border-slate-900/10 dark:border-white/10 text-sky-500 bg-sky-50 dark:bg-sky-900/20">
                <Package className="h-6 w-6" />
              </div>
              <div className="flex-1 min-w-0 text-center md:text-left">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-1">
                  <span className={`label-caps px-2 py-0.5 ${TIPO_STYLES[item.tipo] || 'bg-slate-100 text-slate-500'}`}>
                    {TIPO_LABELS[item.tipo] || item.tipo}
                  </span>
                  <span className="label-caps px-2 py-0.5 border border-slate-900/10 dark:border-white/10 text-slate-500 font-mono">
                    ${item.precio}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">{item.titulo}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center justify-center md:justify-start gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatDate(item.creado_at)}
                  {item.curso_info && <> · {item.curso_info.title}</>}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-none border-slate-900/10 hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-slate-900 transition-all font-bold text-[10px] uppercase tracking-widest h-9"
                  onClick={() => navigate(`/admin/catalogo/${item.id}/edit`)}
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
                    <DropdownMenuItem
                      onSelect={() => setItemToDelete(item)}
                      className="gap-2 text-rose-600 focus:text-rose-600 label-micro py-3"
                    >
                      <Trash2 className="h-4 w-4 mr-2" /> Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))
        ) : (
          <div className="py-20 text-center">
            <div className="flex h-16 w-16 items-center justify-center border border-slate-900/10 dark:border-white/10 mx-auto mb-6">
              <Package className="h-6 w-6 text-sky-500" />
            </div>
            <p className="label-caps text-slate-400 dark:text-slate-500">
              {searchTerm ? 'No se encontraron productos' : 'Catálogo vacío'}
            </p>
            {!searchTerm && (
              <Button onClick={() => navigate('/admin/catalogo/new')} className="mt-4">
                <Plus className="h-4 w-4 mr-2" /> Agregar Producto
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Delete Dialog */}
      <AlertDialog open={!!itemToDelete} onOpenChange={(open) => !open && !isDeleting && setItemToDelete(null)}>
        <AlertDialogContent className="rounded-none border-slate-900/10">
          <AlertDialogHeader>
            <div className="flex h-16 w-16 items-center justify-center border border-rose-500/20 bg-rose-500/5 mx-auto mb-6">
              <AlertCircle className="h-8 w-8 text-rose-500" />
            </div>
            <AlertDialogTitle className="text-center text-2xl font-black uppercase tracking-tight">Eliminar Producto</AlertDialogTitle>
            <AlertDialogDescription className="text-center text-sm font-medium py-4">
              ¿Desea eliminar definitivamente el producto <span className="text-slate-900 dark:text-white font-bold uppercase">"{itemToDelete?.titulo}"</span>? Esta acción lo removerá permanentemente del catálogo comercial.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center gap-3 pt-4">
            <AlertDialogCancel className="rounded-none font-bold uppercase text-[10px] tracking-[0.2em]">Cancelar</AlertDialogCancel>
            <AlertDialogAction disabled={isDeleting} onClick={handleDelete} className="rounded-none bg-rose-600 hover:bg-rose-700 font-bold uppercase text-[10px] tracking-[0.2em]">
              {isDeleting ? 'Eliminando...' : 'Confirmar Eliminación'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}