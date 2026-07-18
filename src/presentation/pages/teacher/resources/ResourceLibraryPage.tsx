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
  Trash2
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
import { getTeacherResourcesUseCase } from '@/infrastructure/factories/teacher.factory'
import { useAuthStore } from '@/presentation/store/auth.store'
import type { Resource } from '@/domain/entities/resource.entity'
import { toast } from 'sonner'

export default function ResourceLibraryPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'doc' | 'media'>('all')
  const [resources, setResources] = useState<Resource[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const user = useAuthStore(s => s.user)

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
    fetchResources()
  }, [user?.user_id])

  const getIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'pdf': 
      case 'doc':
      case 'txt':
        return <FileText className="h-8 w-8 text-rose-500" />
      case 'video': return <Video className="h-8 w-8 text-indigo-500" />
      case 'image': return <ImageIcon className="h-8 w-8 text-emerald-500" />
      default: return <FolderOpen className="h-8 w-8 text-sky-500" />
    }
  }

  const filteredResources = resources.filter(r => {
    const matchesSearch = r.title.toLowerCase().includes(searchTerm.toLowerCase())
    if (!matchesSearch) return false
    
    if (filterType === 'all') return true
    if (filterType === 'doc') return ['pdf', 'doc', 'txt'].includes(r.file_type.toLowerCase())
    if (filterType === 'media') return ['video', 'image', 'audio'].includes(r.file_type.toLowerCase())
    return true
  })

  const handleDelete = (id: number) => {
    // Simulated delete logic for now until endpoint is fully ready
    setResources(resources.filter(r => r.id !== id))
    toast.success('Recurso eliminado correctamente')
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">Biblioteca de Recursos</h1>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-1">Sube y organiza tus materiales didácticos</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => toast.info('Función de subida de archivos en desarrollo')} className="h-12 rounded-2xl font-black bg-sky-600 hover:bg-sky-700 shadow-xl shadow-sky-500/20 px-6">
            <Plus className="mr-2 h-5 w-5" /> Subir Archivo
          </Button>
        </div>
      </div>

      <Card className="border-none shadow-2xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50/50 dark:bg-slate-800/20">
           <div className="relative w-full sm:max-w-md">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 dark:text-slate-500" />
             <Input 
               placeholder="Buscar por nombre de archivo..." 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="h-12 pl-12 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium placeholder:text-slate-400 dark:placeholder:text-slate-500"
             />
           </div>
           <div className="flex gap-2">
             <Button 
               variant={filterType === 'all' ? 'default' : 'outline'} 
               onClick={() => setFilterType('all')}
               className={`h-12 rounded-xl font-bold ${filterType === 'all' ? 'bg-sky-600 hover:bg-sky-700' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
             >
               Todos
             </Button>
             <Button 
               variant={filterType === 'doc' ? 'default' : 'outline'} 
               onClick={() => setFilterType('doc')}
               className={`h-12 rounded-xl font-bold ${filterType === 'doc' ? 'bg-sky-600 hover:bg-sky-700' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
             >
               Documentos
             </Button>
             <Button 
               variant={filterType === 'media' ? 'default' : 'outline'} 
               onClick={() => setFilterType('media')}
               className={`h-12 rounded-xl font-bold ${filterType === 'media' ? 'bg-sky-600 hover:bg-sky-700' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
             >
               Multimedia
             </Button>
           </div>
        </div>
        <CardContent className="p-0">
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {isLoading ? (
               <div className="p-6 space-y-4">
                 {[1,2,3].map(i => (
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
                      <span className="text-xs font-bold text-slate-400">{resource.file_size || 'N/A'}</span>
                      <span className="text-xs font-bold text-slate-400">&bull; {resource.created_at ? new Date(resource.created_at).toLocaleDateString() : 'N/A'}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button onClick={() => toast.success('Descarga iniciada...')} variant="outline" size="sm" className="h-10 rounded-xl font-bold text-sky-600 dark:text-sky-400 border-sky-200 dark:border-sky-900 hover:bg-sky-50 dark:hover:bg-sky-900/20">
                       <Download className="mr-2 h-4 w-4" /> Descargar
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800">
                          <MoreVertical className="h-5 w-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-48 rounded-2xl bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                        <DropdownMenuItem 
                          onSelect={() => handleDelete(resource.id)}
                          className="font-bold py-3 text-red-600 dark:text-red-400 cursor-pointer focus:bg-red-50 dark:focus:bg-red-900/30"
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
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Tu biblioteca está vacía</h3>
                <p className="text-slate-500 font-medium mt-2">Sube archivos para poder usarlos en tus lecciones.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
