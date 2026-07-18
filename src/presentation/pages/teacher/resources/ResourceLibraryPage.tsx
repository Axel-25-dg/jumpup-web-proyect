import { useState, useEffect } from 'react'
import {
  FolderOpen,
  Plus,
  Search,
  FileText,
  Video,
  Image as ImageIcon,
  MoreVertical,
  Download,
  Trash2,
  AlertCircle,
  Loader2
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/presentation/components/ui/dialog'
import {
  getTeacherResourcesUseCase,
  uploadResourceUseCase,
  deleteResourceUseCase,
  courseRepo
} from '@/infrastructure/factories/teacher.factory'
import { useAuthStore } from '@/presentation/store/auth.store'
import type { Resource } from '@/domain/entities/resource.entity'
import type { Course, Module } from '@/domain/entities/course.entity'
import { toast } from 'sonner'

export default function ResourceLibraryPage() {
  const user = useAuthStore(s => s.user)

  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'doc' | 'media'>('all')
  const [resources, setResources] = useState<Resource[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [resourceToDelete, setResourceToDelete] = useState<Resource | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  
  const [courses, setCourses] = useState<Course[]>([])
  const [selectedCourse, setSelectedCourse] = useState<string>('')
  const [modules, setModules] = useState<Module[]>([])
  const [selectedModule, setSelectedModule] = useState<string>('')

  // New Link states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newLinkTitle, setNewLinkTitle] = useState('')
  const [newLinkUrl, setNewLinkUrl] = useState('')
  const [newLinkType, setNewLinkType] = useState('pdf')

  useEffect(() => {
    const fetchResources = async () => {
      if (!user?.user_id) return
      try {
        const result = await getTeacherResourcesUseCase.execute(user.user_id)
        setResources(result.results || [])
      } catch (error) {
        console.error('Error fetching resources:', error)
        toast.error('Ocurrió un error al cargar la biblioteca de recursos')
      } finally {
        setIsLoading(false)
      }
    }
    
    const loadCourses = async () => {
      try {
        const courseResult = await courseRepo.getAll()
        setCourses(courseResult.results || [])
      } catch (error) {
        console.error('Error fetching courses:', error)
      }
    }
    
    fetchResources()
    loadCourses()
  }, [user?.user_id])

  useEffect(() => {
    if (selectedCourse) {
      courseRepo.getModulesByCourse(Number(selectedCourse)).then(setModules)
    } else {
      setModules([])
    }
  }, [selectedCourse])

  const getIcon = (type?: string) => {
    switch (type?.toLowerCase()) {
      case 'pdf':
      case 'doc':
      case 'txt':
      case 'document':
        return <FileText className="h-8 w-8 text-rose-500" />
      case 'video': return <Video className="h-8 w-8 text-indigo-500" />
      case 'image': return <ImageIcon className="h-8 w-8 text-emerald-500" />
      default: return <FolderOpen className="h-8 w-8 text-sky-500" />
    }
  }

  const filteredResources = resources.filter(r => {
    const matchesSearch = (r.title || '').toLowerCase().includes(searchTerm.toLowerCase())
    if (!matchesSearch) return false
    if (filterType === 'all') return true
    if (filterType === 'doc') return ['pdf', 'doc', 'txt', 'document'].includes((r.file_type || '').toLowerCase())
    if (filterType === 'media') return ['video', 'image', 'audio'].includes((r.file_type || '').toLowerCase())
    return true
  })

  const handleAddLink = async () => {
    if (!user?.user_id) return
    
    if (!selectedCourse || !selectedModule) {
      toast.error('Por favor, selecciona un curso y un módulo')
      return
    }

    if (!newLinkTitle.trim() || !newLinkUrl.trim()) {
      toast.error('Por favor, ingresa el título y el enlace')
      return
    }

    setIsUploading(true)
    const resourcePayload = new FormData()
    resourcePayload.append('title', newLinkTitle)
    resourcePayload.append('teacher', String(user.user_id))
    resourcePayload.append('course', selectedCourse)
    resourcePayload.append('module', selectedModule)
    resourcePayload.append('resource_type', newLinkType)
    resourcePayload.append('file_url', newLinkUrl)

    try {
      const created = await uploadResourceUseCase.execute(resourcePayload)
      setResources(prev => [created, ...prev])
      toast.success(`Enlace "${newLinkTitle}" subido correctamente`)
      setIsAddDialogOpen(false)
      setNewLinkTitle('')
      setNewLinkUrl('')
      setSelectedCourse('')
      setSelectedModule('')
    } catch (error: any) {
      console.error('Error adding resource:', error)
      const errorMsg = error?.detail || error?.message || (typeof error === 'object' ? JSON.stringify(error) : 'Error al añadir el recurso')
      toast.error(`Error: ${errorMsg}`)
    } finally {
      setIsUploading(false)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!resourceToDelete) return
    setIsDeleting(true)
    try {
      await deleteResourceUseCase.execute(resourceToDelete.id)
      setResources(prev => prev.filter(r => r.id !== resourceToDelete.id))
      toast.success(`"${resourceToDelete.title}" eliminado correctamente`)
    } catch (error: any) {
      console.error('Error deleting resource:', error)
      toast.error(error?.detail || 'Error al eliminar el recurso')
    } finally {
      setIsDeleting(false)
      setResourceToDelete(null)
    }
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'N/A'
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / 1048576).toFixed(1)} MB`
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">Biblioteca de Recursos</h1>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-1">Sube y organiza tus materiales didácticos</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={() => setIsAddDialogOpen(true)}
            disabled={isUploading}
            className="h-12 rounded-xl font-black bg-sky-600 hover:bg-sky-700 shadow-xl shadow-sky-500/20 px-6 shrink-0"
          >
            <Plus className="mr-2 h-5 w-5" /> Añadir Enlace
          </Button>
        </div>
      </div>

      {/* Add Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black">Añadir Nuevo Enlace</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-black text-slate-900 dark:text-white">Curso</label>
              <select
                value={selectedCourse}
                onChange={(e) => {
                  setSelectedCourse(e.target.value)
                  setSelectedModule('')
                }}
                className="w-full h-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 font-medium"
              >
                <option value="">Selecciona un curso...</option>
                {courses.map(c => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-black text-slate-900 dark:text-white">Módulo</label>
              <select
                value={selectedModule}
                onChange={(e) => setSelectedModule(e.target.value)}
                disabled={!selectedCourse || modules.length === 0}
                className="w-full h-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 font-medium disabled:opacity-50"
              >
                <option value="">Selecciona un módulo...</option>
                {modules.map(m => (
                  <option key={m.id} value={m.id}>{m.title}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-black text-slate-900 dark:text-white">Título del recurso</label>
              <Input
                value={newLinkTitle}
                onChange={(e) => setNewLinkTitle(e.target.value)}
                placeholder="Ej. Documento guía..."
                className="h-12 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-black text-slate-900 dark:text-white">Tipo de Recurso</label>
              <select
                value={newLinkType}
                onChange={(e) => setNewLinkType(e.target.value)}
                className="w-full h-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 font-medium"
              >
                <option value="pdf">PDF / Documento de texto</option>
                <option value="word">Documento Word</option>
                <option value="video">Video</option>
                <option value="image">Imagen</option>
                <option value="audio">Audio</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-black text-slate-900 dark:text-white">Enlace (URL)</label>
              <Input
                value={newLinkUrl}
                onChange={(e) => setNewLinkUrl(e.target.value)}
                placeholder="https://..."
                className="h-12 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={handleAddLink}
              disabled={isUploading || !selectedCourse || !selectedModule || !newLinkTitle || !newLinkUrl}
              className="w-full h-12 rounded-xl font-black bg-sky-600 hover:bg-sky-700"
            >
              {isUploading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Guardando...</> : 'Guardar Enlace'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card className="border-none shadow-2xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50/50 dark:bg-slate-800/20">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 dark:text-slate-500" />
            <Input
              placeholder="Buscar por nombre de archivo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-12 pl-12 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
            />
          </div>
          <div className="flex gap-2">
            {(['all', 'doc', 'media'] as const).map((type) => (
              <Button
                key={type}
                variant={filterType === type ? 'default' : 'outline'}
                onClick={() => setFilterType(type)}
                className={`h-12 rounded-xl font-bold ${filterType === type ? 'bg-sky-600 hover:bg-sky-700' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
              >
                {type === 'all' ? 'Todos' : type === 'doc' ? 'Documentos' : 'Multimedia'}
              </Button>
            ))}
          </div>
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
            ) : filteredResources.length > 0 ? (
              filteredResources.map((resource) => (
                <div key={resource.id} className="p-6 flex flex-col md:flex-row items-center gap-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                  <div className="h-16 w-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    {getIcon(resource.file_type)}
                  </div>
                  <div className="flex-1 min-w-0 text-center md:text-left">
                    <h3 className="text-lg font-black text-slate-900 dark:text-white truncate">{resource.title}</h3>
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-1">
                      <Badge variant="outline" className="bg-white dark:bg-slate-900 font-bold uppercase tracking-wider text-[10px] text-slate-500 dark:border-slate-700">
                        {resource.file_type}
                      </Badge>
                      <span className="text-xs font-bold text-slate-400">{formatFileSize(resource.file_size as any)}</span>
                      <span className="text-xs font-bold text-slate-400">
                        &bull; {resource.created_at ? new Date(resource.created_at).toLocaleDateString('es-ES') : 'N/A'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {resource.file_url ? (
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="h-10 rounded-xl font-bold text-sky-600 dark:text-sky-400 border-sky-200 dark:border-sky-900 hover:bg-sky-50 dark:hover:bg-sky-900/20"
                      >
                        <a href={resource.file_url} target="_blank" rel="noopener noreferrer" download>
                          <Download className="mr-2 h-4 w-4" /> Descargar
                        </a>
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled
                        className="h-10 rounded-xl font-bold opacity-50"
                      >
                        <Download className="mr-2 h-4 w-4" /> Sin archivo
                      </Button>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800">
                          <MoreVertical className="h-5 w-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-48 rounded-2xl bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 p-2">
                        <DropdownMenuItem
                          onSelect={() => setResourceToDelete(resource)}
                          className="font-bold py-3 text-red-600 dark:text-red-400 cursor-pointer focus:bg-red-50 dark:focus:bg-red-900/30 rounded-xl"
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
                <FolderOpen className="h-12 w-12 text-slate-200 dark:text-slate-700 mx-auto mb-4" />
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  {searchTerm ? 'No se encontraron archivos' : 'Tu biblioteca está vacía'}
                </h3>
                <p className="text-slate-500 font-medium mt-2">
                  {searchTerm ? 'Prueba con otro término.' : 'Sube archivos para poder usarlos en tus lecciones.'}
                </p>
                {!searchTerm && (
                  <Button
                    onClick={() => setIsAddDialogOpen(true)}
                    className="mt-4 bg-sky-600 hover:bg-sky-700 rounded-xl font-black"
                  >
                    <Plus className="mr-2 h-4 w-4" /> Añadir primer enlace
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Delete Dialog */}
      <AlertDialog open={!!resourceToDelete} onOpenChange={(open) => !open && !isDeleting && setResourceToDelete(null)}>
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader>
            <div className="mx-auto bg-red-100 dark:bg-red-900/30 p-3 rounded-full w-fit mb-4">
              <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <AlertDialogTitle className="text-center text-2xl font-black">¿Eliminar recurso?</AlertDialogTitle>
            <AlertDialogDescription className="text-center font-medium">
              Se eliminará permanentemente{' '}
              <span className="font-bold text-slate-900 dark:text-white">"{resourceToDelete?.title}"</span>.
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center gap-3 mt-6">
            <AlertDialogCancel disabled={isDeleting} className="rounded-xl h-12 px-6 font-bold">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              disabled={isDeleting}
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700 text-white rounded-xl h-12 px-6 font-bold"
            >
              {isDeleting ? 'Eliminando...' : 'Sí, eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
