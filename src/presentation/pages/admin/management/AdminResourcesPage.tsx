import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Plus,
  Edit2,
  Trash2,
  FileText,
  Video,
  Image,
  Music,
  Globe,
  File,
  Search,
  ArrowLeft,
  AlertCircle,
  MoreVertical,
  Download,
  ExternalLink
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
import { adminResourceUseCase } from '@/infrastructure/factories/admin-resource.factory'
import type { AdminResource } from '@/domain/entities/admin-resource.entity'

const TYPE_ICONS: Record<string, any> = {
  pdf: FileText,
  audio: Music,
  video: Video,
  word: FileText,
  image: Image,
  link: Globe,
  other: File,
}

const TYPE_LABELS: Record<string, string> = {
  pdf: 'PDF',
  audio: 'Audio',
  video: 'Video',
  word: 'Word',
  image: 'Imagen',
  link: 'Enlace',
  other: 'Otro',
}

export default function AdminResourcesPage() {
  const navigate = useNavigate()
  const [resources, setResources] = useState<AdminResource[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [resourceToDelete, setResourceToDelete] = useState<AdminResource | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const loadResources = async () => {
    try {
      setIsLoading(true)
      const result = await adminResourceUseCase.getAll()
      setResources(result.results || [])
    } catch (err) {
      console.error('Error fetching resources:', err)
      toast.error('No se pudieron cargar los recursos')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { loadResources() }, [])

  const handleDeleteResource = async () => {
    if (!resourceToDelete) return
    setIsDeleting(true)
    try {
      await adminResourceUseCase.delete(resourceToDelete.id)
      setResources(prev => prev.filter(r => r.id !== resourceToDelete.id))
      toast.success(`Recurso "${resourceToDelete.title}" eliminado con éxito`)
    } catch (error) {
      console.error('Error deleting resource:', error)
      toast.error('Ocurrió un error al eliminar el recurso')
    } finally {
      setIsDeleting(false)
      setResourceToDelete(null)
    }
  }

  const formatDate = (d: string) => new Date(d).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })

  const filteredResources = resources.filter(r =>
    r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.teacher_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.course_title?.toLowerCase().includes(searchTerm.toLowerCase()))
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
                <File className="h-3.5 w-3.5 text-sky-500" />
                Biblioteca Técnica
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white uppercase">
              Repositorio de <span className="text-sky-500">Recursos</span>.
            </h1>
            <p className="text-base text-slate-500 dark:text-slate-400 max-w-lg font-medium">
              Gestión centralizada de activos educativos, documentos técnicos y material multimedia.
            </p>
          </div>
          <Button
            onClick={() => navigate('/admin/resources/new')}
            className="rounded-none bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold uppercase text-[11px] tracking-[0.2em] px-8 py-6 h-auto hover:bg-sky-500 dark:hover:bg-sky-500 hover:text-white transition-all"
          >
            <Plus className="h-4 w-4 mr-2" /> Nuevo Recurso
          </Button>
        </div>
      </section>

      {/* TOOLBAR */}
      <div className="border-b border-slate-900/10 dark:border-white/10 p-6 md:p-8 flex flex-col lg:flex-row gap-6 justify-between items-center bg-white dark:bg-transparent">
        <div className="relative w-full lg:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            placeholder="BUSCAR POR TÍTULO, DOCENTE O CURSO..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border border-slate-900/10 dark:border-white/10 bg-transparent py-3.5 pl-12 pr-4 text-[11px] font-bold uppercase tracking-widest outline-none focus:border-sky-500 transition-colors"
          />
        </div>
        <div className="label-caps border border-slate-900/10 dark:border-white/10 text-slate-500 px-6 py-3 bg-slate-50 dark:bg-white/5 font-mono">
          {resources.length} ACTIVOS REGISTRADOS
        </div>
      </div>

      {/* DATA TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1100px] text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-900/10 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02]">
              <th className="px-8 py-5 label-caps text-slate-400">Activo / Tipo</th>
              <th className="px-8 py-5 label-caps text-slate-400">Origen / Docente</th>
              <th className="px-8 py-5 label-caps text-slate-400 text-center">Privacidad</th>
              <th className="px-8 py-5 label-caps text-slate-400">Fecha Carga</th>
              <th className="px-8 py-5 label-caps text-slate-400 text-right">Gestión</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-900/5 dark:divide-white/5">
            {isLoading ? (
              [1, 2, 3, 4].map(i => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={5} className="px-8 py-8"><div className="h-4 bg-slate-100 dark:bg-white/5 w-full" /></td>
                </tr>
              ))
            ) : filteredResources.length > 0 ? (
              filteredResources.map((resource) => {
                const Icon = TYPE_ICONS[resource.resource_type] || File
                return (
                  <tr key={resource.id} className="card-hover group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-5">
                        <div className="h-12 w-12 shrink-0 flex items-center justify-center border border-slate-900/10 dark:border-white/10 text-sky-500 bg-slate-50 dark:bg-white/5 transition-colors group-hover:bg-sky-500 group-hover:text-white group-hover:border-sky-500">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight group-hover:text-sky-500 transition-colors">
                            {resource.title}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="label-micro text-slate-400 font-mono uppercase italic">
                              {TYPE_LABELS[resource.resource_type] || resource.resource_type}
                            </span>
                            <span className="h-1 w-1 rounded-full bg-slate-300" />
                            <span className="label-micro text-slate-400 font-mono">ID: {resource.id}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="space-y-1">
                        <p className="label-micro text-slate-600 dark:text-slate-300 font-bold uppercase truncate max-w-[200px]">
                          {resource.course_title || 'RECURSO GLOBAL'}
                        </p>
                        <p className="label-micro text-slate-400 font-mono truncate max-w-[200px]">
                          {resource.teacher_email}
                        </p>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex justify-center">
                        <span className={`label-micro px-3 py-1 border ${resource.is_public ? 'border-emerald-500/20 text-emerald-600 bg-emerald-500/5' : 'border-slate-900/10 text-slate-400 bg-slate-50'}`}>
                          {resource.is_public ? 'PÚBLICO' : 'PRIVADO'}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <p className="label-micro text-slate-500 font-mono">{formatDate(resource.created_at)}</p>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-none border-slate-900/10 hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-slate-900 transition-all font-bold text-[10px] uppercase tracking-widest h-9"
                          onClick={() => navigate(`/admin/resources/${resource.id}/edit`)}
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
                            {resource.file_url && (
                              <DropdownMenuItem onSelect={() => window.open(resource.file_url ?? undefined, '_blank')} className="label-micro py-3">
                                <Download className="h-4 w-4 mr-2" /> Descargar Activo
                              </DropdownMenuItem>
                            )}
                            {resource.external_url && (
                              <DropdownMenuItem onSelect={() => window.open(resource.external_url ?? undefined, '_blank')} className="label-micro py-3">
                                <ExternalLink className="h-4 w-4 mr-2" /> Abrir Enlace
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onSelect={() => setResourceToDelete(resource)} className="label-micro py-3 text-rose-500 focus:text-rose-500">
                              <Trash2 className="h-4 w-4 mr-2" /> Eliminar Recurso
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                )
              })
            ) : (
              <tr>
                <td colSpan={5} className="py-24 text-center">
                  <div className="flex h-16 w-16 items-center justify-center border border-slate-900/10 dark:border-white/10 mx-auto mb-6">
                    <File className="h-6 w-6 text-slate-300" />
                  </div>
                  <p className="label-caps text-slate-400">No se encontraron activos en el repositorio</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Dialog */}
      <AlertDialog open={!!resourceToDelete} onOpenChange={(open) => !open && !isDeleting && setResourceToDelete(null)}>
        <AlertDialogContent className="rounded-none border-slate-900/10">
          <AlertDialogHeader>
            <div className="flex h-16 w-16 items-center justify-center border border-rose-500/20 bg-rose-500/5 mx-auto mb-6">
              <AlertCircle className="h-8 w-8 text-rose-500" />
            </div>
            <AlertDialogTitle className="text-center text-2xl font-black uppercase tracking-tight">Eliminar Activo</AlertDialogTitle>
            <AlertDialogDescription className="text-center text-sm font-medium py-4">
              ¿Está seguro de que desea eliminar el recurso <span className="text-slate-900 dark:text-white font-bold uppercase">"{resourceToDelete?.title}"</span>? Esta acción es irreversible y el archivo dejará de estar disponible para los estudiantes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center gap-3 pt-4">
            <AlertDialogCancel className="rounded-none font-bold uppercase text-[10px] tracking-[0.2em]">Cancelar</AlertDialogCancel>
            <AlertDialogAction disabled={isDeleting} onClick={handleDeleteResource} className="rounded-none bg-rose-600 hover:bg-rose-700 font-bold uppercase text-[10px] tracking-[0.2em]">
              {isDeleting ? 'Eliminando...' : 'Confirmar Eliminación'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
