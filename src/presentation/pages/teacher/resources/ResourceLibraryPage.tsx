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
  const [uploadType, setUploadType] = useState<'url' | 'file'>('url')
  const [newLinkTitle, setNewLinkTitle] = useState('')
  const [newLinkUrl, setNewLinkUrl] = useState('')
  const [newFile, setNewFile] = useState<File | null>(null)
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
        return <FileText className="h-5 w-5 text-rose-500" />
      case 'video': return <Video className="h-5 w-5 text-indigo-500" />
      case 'image': return <ImageIcon className="h-5 w-5 text-emerald-500" />
      default: return <FolderOpen className="h-5 w-5 text-sky-500" />
    }
  }

  const filteredResources = resources.filter(r => {
    const titleMatch = (r.title || '').toLowerCase().includes(searchTerm.toLowerCase())
    if (!titleMatch) return false
    if (filterType === 'all') return true
    if (filterType === 'doc') return ['pdf', 'doc', 'txt', 'document'].includes((r.file_type || '').toLowerCase())
    if (filterType === 'media') return ['video', 'image', 'audio'].includes((r.file_type || '').toLowerCase())
    return true
  })

  const handleAddResource = async () => {
    if (!user?.user_id) return
    
    if (!selectedCourse || !selectedModule) {
      toast.error('Por favor, selecciona un curso y un módulo')
      return
    }

    if (!newLinkTitle.trim()) {
      toast.error('Por favor, ingresa el título')
      return
    }

    if (uploadType === 'url' && !newLinkUrl.trim()) {
      toast.error('Por favor, ingresa el enlace')
      return
    }

    if (uploadType === 'file' && !newFile) {
      toast.error('Por favor, selecciona un archivo')
      return
    }

    setIsUploading(true)
    const resourcePayload = new FormData()
    resourcePayload.append('title', newLinkTitle)
    resourcePayload.append('teacher', String(user.user_id))
    resourcePayload.append('course', selectedCourse)
    resourcePayload.append('module', selectedModule)
    resourcePayload.append('resource_type', newLinkType)
    resourcePayload.append('content_type', uploadType)
    
    if (uploadType === 'url') {
      resourcePayload.append('external_url', newLinkUrl)
    } else if (uploadType === 'file' && newFile) {
      resourcePayload.append('file', newFile)
    }

    try {
      const created = await uploadResourceUseCase.execute(resourcePayload)
      setResources(prev => [created, ...prev])
      toast.success(`Recurso "${newLinkTitle}" subido correctamente`)
      setIsAddDialogOpen(false)
      setNewLinkTitle('')
      setNewLinkUrl('')
      setNewFile(null)
      setSelectedCourse('')
      setSelectedModule('')
    } catch (error) {
      console.error('Error adding resource:', error)
      toast.error(error instanceof Error ? error.message : 'Error al añadir el recurso')
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
    } catch (error) {
      console.error('Error deleting resource:', error)
      toast.error(error instanceof Error ? error.message : 'Error al eliminar el recurso')
    } finally {
      setIsDeleting(false)
      setResourceToDelete(null)
    }
  }

  return (
    <div className="animate-in fade-in duration-500">
      {/* Header Editorial */}
      <section className="border-b border-slate-900/10 dark:border-white/10 px-8 md:px-12 py-14 md:py-20">
        <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-10">
          <div className="space-y-6 max-w-2xl">
            <div className="chip">
              <FolderOpen className="h-3.5 w-3.5 text-sky-500" />
              Resource Library
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.05] text-slate-900 dark:text-white">
              Biblioteca <br />
              <span className="text-sky-500">Digital.</span>
            </h1>
            <p className="text-base sm:text-lg leading-relaxed text-slate-600 dark:text-slate-300 max-w-lg">
              Sube, organiza y distribuye material didáctico a través de tus cursos y módulos asignados.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Button
              onClick={() => setIsAddDialogOpen(true)}
              size="lg"
              className="gap-2 group"
            >
              <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform" />
              Añadir Enlace
            </Button>
          </div>
        </div>
      </section>

      {/* Filters & Search Editorial */}
      <section className="border-b border-slate-900/10 dark:border-white/10 sticky top-0 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl z-10">
        <div className="flex flex-col md:flex-row">
          <div className="flex-1 border-r border-slate-900/10 dark:border-white/10">
            <div className="relative">
              <Search className="absolute left-8 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="BUSCAR EN LA BIBLIOTECA..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-16 pl-16 pr-8 bg-transparent label-caps outline-none text-slate-900 dark:text-white"
              />
            </div>
          </div>
          <div className="flex divide-x divide-slate-900/10 dark:divide-white/10 border-t md:border-t-0 border-slate-900/10 dark:border-white/10">
            {(['all', 'doc', 'media'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-8 h-16 label-caps transition-colors ${filterType === type ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
              >
                {type === 'all' ? 'TODOS' : type === 'doc' ? 'DOCS' : 'MEDIA'}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Resources Table Editorial */}
      <section className="border-b border-slate-900/10 dark:border-white/10">
        <div className="min-w-full overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-900/10 dark:border-white/10">
                <th className="px-8 py-4 label-caps text-slate-400 font-normal">Tipo</th>
                <th className="px-8 py-4 label-caps text-slate-400 font-normal">Nombre del Recurso</th>
                <th className="px-8 py-4 label-caps text-slate-400 font-normal hidden md:table-cell">Fecha</th>
                <th className="px-8 py-4 label-caps text-slate-400 font-normal text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900/5 dark:divide-white/5">
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-8 py-6"><div className="h-10 w-10 bg-slate-100 dark:bg-slate-800" /></td>
                    <td className="px-8 py-6"><div className="h-4 w-48 bg-slate-100 dark:bg-slate-800" /></td>
                    <td className="px-8 py-6 hidden md:table-cell"><div className="h-4 w-24 bg-slate-100 dark:bg-slate-800" /></td>
                    <td className="px-8 py-6 text-right"><div className="h-8 w-8 ml-auto bg-slate-100 dark:bg-slate-800" /></td>
                  </tr>
                ))
              ) : filteredResources.length > 0 ? (
                filteredResources.map((resource) => (
                  <tr key={resource.id} className="group hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex h-10 w-10 items-center justify-center border border-slate-900/10 dark:border-white/10 bg-white dark:bg-slate-950">
                        {getIcon(resource.file_type)}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="font-black text-slate-900 dark:text-white tracking-tight uppercase">{resource.title}</span>
                        <span className="label-micro text-slate-400 mt-0.5">{resource.file_type || 'LINK'}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 hidden md:table-cell">
                      <span className="label-micro text-slate-500">
                        {resource.created_at ? new Date(resource.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {resource.file_url && (
                          <a
                            href={resource.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="h-10 w-10 flex items-center justify-center border border-slate-900/10 dark:border-white/10 hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-slate-950 transition-all"
                          >
                            <Download className="h-4 w-4" />
                          </a>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="h-10 w-10 flex items-center justify-center border border-transparent hover:border-slate-900/10 dark:hover:border-white/10 transition-colors">
                              <MoreVertical className="h-4 w-4 text-slate-400" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="rounded-none border-2 border-slate-900 dark:border-white p-1">
                            <DropdownMenuItem
                              onClick={() => setResourceToDelete(resource)}
                              className="label-caps py-2 text-red-600 cursor-pointer"
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-24 text-center">
                    <div className="flex h-16 w-16 items-center justify-center border border-slate-900/10 dark:border-white/10 mx-auto mb-6">
                      <FolderOpen className="h-6 w-6 text-slate-200" />
                    </div>
                    <p className="label-caps text-slate-400">Sin recursos disponibles</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Add Link Dialog — Editorial */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="rounded-none border-4 border-slate-900 dark:border-white bg-white dark:bg-slate-950 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-3xl font-black tracking-tighter uppercase leading-none text-slate-900 dark:text-white mb-2">
              Añadir <br /> Recurso.
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-6">
            <div className="space-y-2">
              <label className="label-caps text-slate-400">Curso Destino</label>
              <select
                value={selectedCourse}
                onChange={(e) => {
                  setSelectedCourse(e.target.value)
                  setSelectedModule('')
                }}
                className="w-full h-12 bg-white dark:bg-slate-950 text-slate-900 dark:text-white border-b-2 border-slate-900/10 dark:border-white/10 outline-none font-bold cursor-pointer focus:border-sky-500"
              >
                <option value="">SELECCIONA UN CURSO</option>
                {courses.map(c => <option key={c.id} value={c.id}>{c.title.toUpperCase()}</option>)}
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="label-caps text-slate-400">Módulo</label>
              <select
                value={selectedModule}
                onChange={(e) => setSelectedModule(e.target.value)}
                disabled={!selectedCourse || modules.length === 0}
                className="w-full h-12 bg-white dark:bg-slate-950 text-slate-900 dark:text-white border-b-2 border-slate-900/10 dark:border-white/10 outline-none font-bold cursor-pointer focus:border-sky-500 disabled:opacity-30"
              >
                <option value="">SELECCIONA UN MÓDULO</option>
                {modules.map(m => <option key={m.id} value={m.id}>{m.title.toUpperCase()}</option>)}
              </select>
            </div>

            <div className="flex bg-slate-100 dark:bg-white/5 p-1 gap-1">
              <button
                type="button"
                className={`flex-1 h-10 label-caps transition-colors ${uploadType === 'url' ? 'bg-white dark:bg-slate-900 shadow-sm text-sky-500' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
                onClick={() => setUploadType('url')}
              >
                Vincular Enlace
              </button>
              <button
                type="button"
                className={`flex-1 h-10 label-caps transition-colors ${uploadType === 'file' ? 'bg-white dark:bg-slate-900 shadow-sm text-sky-500' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
                onClick={() => setUploadType('file')}
              >
                Subir Archivo
              </button>
            </div>

            <div className="space-y-2">
              <label className="label-caps text-slate-400">Título</label>
              <input
                value={newLinkTitle}
                onChange={(e) => setNewLinkTitle(e.target.value)}
                placeholder="EJ. GUÍA DE ESTUDIO PDF"
                className="w-full h-12 bg-transparent border-b-2 border-slate-900/10 dark:border-white/10 outline-none font-bold focus:border-sky-500 placeholder:text-slate-200"
              />
            </div>

            <div className="space-y-2">
              <label className="label-caps text-slate-400">Tipo</label>
              <select
                value={newLinkType}
                onChange={(e) => setNewLinkType(e.target.value)}
                className="w-full h-12 bg-white dark:bg-slate-950 text-slate-900 dark:text-white border-b-2 border-slate-900/10 dark:border-white/10 outline-none font-bold cursor-pointer focus:border-sky-500"
              >
                <option value="pdf">PDF / DOCUMENTO</option>
                <option value="video">VIDEO</option>
                <option value="image">IMAGEN</option>
                <option value="audio">AUDIO</option>
              </select>
            </div>

            {uploadType === 'url' ? (
              <div className="space-y-2">
                <label className="label-caps text-slate-400">URL del Recurso</label>
                <input
                  value={newLinkUrl}
                  onChange={(e) => setNewLinkUrl(e.target.value)}
                  placeholder="HTTPS://..."
                  className="w-full h-12 bg-transparent border-b-2 border-slate-900/10 dark:border-white/10 outline-none font-bold focus:border-sky-500 placeholder:text-slate-200"
                />
              </div>
            ) : (
              <div className="space-y-2">
                <label className="label-caps text-slate-400">Archivo</label>
                <input
                  type="file"
                  onChange={(e) => setNewFile(e.target.files?.[0] || null)}
                  className="w-full h-12 py-2 bg-transparent border-b-2 border-slate-900/10 dark:border-white/10 outline-none text-slate-900 dark:text-white file:mr-4 file:py-2 file:px-4 file:border-0 file:bg-slate-900 file:text-white dark:file:bg-white dark:file:text-slate-900 file:font-bold file:uppercase file:text-xs file:tracking-widest hover:file:bg-sky-500 transition-colors"
                />
              </div>
            )}
          </div>
          <DialogFooter className="mt-8">
            <Button
              onClick={handleAddResource}
              disabled={isUploading || !selectedCourse || !selectedModule || !newLinkTitle || (uploadType === 'url' ? !newLinkUrl : !newFile)}
              className="w-full h-14 rounded-none font-black text-lg gap-2"
            >
              {isUploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Plus className="h-5 w-5" />}
              AÑADIR A LA BIBLIOTECA
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog — Editorial */}
      <AlertDialog open={!!resourceToDelete} onOpenChange={(open) => !open && !isDeleting && setResourceToDelete(null)}>
        <AlertDialogContent className="rounded-none border-4 border-slate-900 dark:border-white bg-white dark:bg-slate-950 max-w-md">
          <AlertDialogHeader>
            <div className="flex h-16 w-16 items-center justify-center border border-slate-900/10 dark:border-white/10 mb-6">
              <AlertCircle className="h-8 w-8 text-rose-500" />
            </div>
            <AlertDialogTitle className="text-3xl font-black tracking-tighter uppercase leading-none text-slate-900 dark:text-white mb-4">
              ¿Eliminar <br /> Recurso?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base text-slate-600 dark:text-slate-400 leading-relaxed">
              Estás a punto de eliminar <span className="font-bold text-slate-900 dark:text-white underline decoration-rose-500 decoration-2">"{resourceToDelete?.title}"</span>. Esta acción es permanente y el recurso dejará de estar disponible para todos los estudiantes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-10 sm:justify-start gap-4">
            <AlertDialogCancel disabled={isDeleting} className="rounded-none border-2 border-slate-900 dark:border-white h-12 px-8 label-caps">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={isDeleting}
              onClick={handleDeleteConfirm}
              className="bg-rose-500 hover:bg-rose-600 text-white rounded-none h-12 px-8 label-caps border-none"
            >
              {isDeleting ? 'ELIMINANDO...' : 'SÍ, ELIMINAR'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
