import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Edit2,
  Trash2,
  Bell,
  Plus,
  ArrowLeft,
  Search,
  MoreVertical,
  AlertCircle,
  Eye,
  Settings
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
import { announcementUseCase } from '@/infrastructure/factories/announcement.factory'
import type { Announcement } from '@/domain/entities/announcement.entity'

export default function AdminAnnouncementsPage() {
  const navigate = useNavigate()
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [announcementToDelete, setAnnouncementToDelete] = useState<Announcement | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const loadAnnouncements = async () => {
    try {
      setIsLoading(true)
      const result = await announcementUseCase.getAll()
      setAnnouncements(result.results || [])
    } catch (err) {
      console.error('Error fetching announcements:', err)
      toast.error('No se pudieron cargar los anuncios')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { loadAnnouncements() }, [])

  const handleDeleteAnnouncement = async () => {
    if (!announcementToDelete) return
    setIsDeleting(true)
    try {
      await announcementUseCase.delete(announcementToDelete.id)
      setAnnouncements(prev => prev.filter(a => a.id !== announcementToDelete.id))
      toast.success(`Anuncio "${announcementToDelete.title}" eliminado con éxito`)
    } catch (error) {
      console.error('Error deleting announcement:', error)
      toast.error('Ocurrió un error al eliminar el anuncio')
    } finally {
      setIsDeleting(false)
      setAnnouncementToDelete(null)
    }
  }

  const getStatusBadge = (announcement: Announcement) => {
    const now = new Date()
    const start = new Date(announcement.start_date)
    const end = new Date(announcement.end_date)

    if (!announcement.is_active) {
      return <span className="label-micro px-3 py-1 border border-slate-900/10 text-slate-400 bg-slate-50 uppercase font-bold">INACTIVO</span>
    }
    if (now < start) {
      return <span className="label-micro px-3 py-1 border border-amber-500/20 text-amber-600 bg-amber-500/5 uppercase font-bold">PROGRAMADO</span>
    }
    if (now > end) {
      return <span className="label-micro px-3 py-1 border border-slate-900/10 text-slate-400 bg-slate-50 uppercase font-bold">EXPIRADO</span>
    }
    return <span className="label-micro px-3 py-1 border border-emerald-500/20 text-emerald-600 bg-emerald-500/5 uppercase font-bold">ACTIVO</span>
  }

  const formatDate = (d: string) => new Date(d).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })

  const filteredAnnouncements = announcements.filter(a =>
    a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (a.author_username?.toLowerCase().includes(searchTerm.toLowerCase()))
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
                <Bell className="h-3.5 w-3.5 text-sky-500" />
                Comunicación Institucional
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white uppercase">
              Tablón de <span className="text-sky-500">Anuncios</span>.
            </h1>
            <p className="text-base text-slate-500 dark:text-slate-400 max-w-lg font-medium">
              Gestión de notificaciones globales, avisos de mantenimiento y circulares académicas.
            </p>
          </div>
          <Button
            onClick={() => navigate('/admin/announcements/new')}
            className="rounded-none bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold uppercase text-[11px] tracking-[0.2em] px-8 py-6 h-auto hover:bg-sky-500 dark:hover:bg-sky-500 hover:text-white transition-all"
          >
            <Plus className="h-4 w-4 mr-2" /> Nuevo Anuncio
          </Button>
        </div>
      </section>

      {/* TOOLBAR */}
      <div className="border-b border-slate-900/10 dark:border-white/10 p-6 md:p-8 flex flex-col lg:flex-row gap-6 justify-between items-center bg-white dark:bg-transparent">
        <div className="relative w-full lg:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            placeholder="BUSCAR POR TÍTULO O AUTOR..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border border-slate-900/10 dark:border-white/10 bg-transparent py-3.5 pl-12 pr-4 text-[11px] font-bold uppercase tracking-widest outline-none focus:border-sky-500 transition-colors"
          />
        </div>
        <div className="label-caps border border-slate-900/10 dark:border-white/10 text-slate-500 px-6 py-3 bg-slate-50 dark:bg-white/5 font-mono">
          {announcements.length} COMUNICADOS
        </div>
      </div>

      {/* DATA TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1200px] text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-900/10 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02]">
              <th className="px-8 py-5 label-caps text-slate-400">Identificador</th>
              <th className="px-8 py-5 label-caps text-slate-400">Título del Anuncio</th>
              <th className="px-8 py-5 label-caps text-slate-400">Estado / Vigencia</th>
              <th className="px-8 py-5 label-caps text-slate-400">Periodo de Publicación</th>
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
            ) : filteredAnnouncements.length > 0 ? (
              filteredAnnouncements.map((announcement) => (
                <tr key={announcement.id} className="card-hover group">
                  <td className="px-8 py-6">
                    <span className="label-micro text-slate-400 font-mono italic">#{announcement.id}</span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 shrink-0 border border-slate-900/10 dark:border-white/10 flex items-center justify-center bg-slate-50 dark:bg-white/5 text-sky-500">
                        <Bell className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight group-hover:text-sky-500 transition-colors">
                          {announcement.title}
                        </p>
                        <p className="label-micro text-slate-400 mt-0.5 font-mono uppercase">
                          Autor: {announcement.author_username || `#${announcement.author}`}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    {getStatusBadge(announcement)}
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="space-y-1">
                        <p className="label-micro text-slate-400 uppercase">Inicio</p>
                        <p className="label-micro text-slate-900 dark:text-white font-bold font-mono uppercase">{formatDate(announcement.start_date)}</p>
                      </div>
                      <div className="h-4 border-l border-slate-900/10" />
                      <div className="space-y-1">
                        <p className="label-micro text-slate-400 uppercase">Término</p>
                        <p className="label-micro text-slate-900 dark:text-white font-bold font-mono uppercase">{formatDate(announcement.end_date)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-none border-slate-900/10 hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-slate-900 transition-all font-bold text-[10px] uppercase tracking-widest h-9"
                        onClick={() => navigate(`/admin/announcements/${announcement.id}/edit`)}
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
                            <Eye className="h-4 w-4 mr-2" /> Vista Previa
                          </DropdownMenuItem>
                          <DropdownMenuItem className="label-micro py-3">
                            <Settings className="h-4 w-4 mr-2" /> Configuración
                          </DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => setAnnouncementToDelete(announcement)} className="label-micro py-3 text-rose-500 focus:text-rose-500">
                            <Trash2 className="h-4 w-4 mr-2" /> Retirar Anuncio
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
                    <Bell className="h-6 w-6 text-slate-300" />
                  </div>
                  <p className="label-caps text-slate-400">No se encontraron anuncios activos o programados</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Dialog */}
      <AlertDialog open={!!announcementToDelete} onOpenChange={(open) => !open && !isDeleting && setAnnouncementToDelete(null)}>
        <AlertDialogContent className="rounded-none border-slate-900/10">
          <AlertDialogHeader>
            <div className="flex h-16 w-16 items-center justify-center border border-rose-500/20 bg-rose-500/5 mx-auto mb-6">
              <AlertCircle className="h-8 w-8 text-rose-500" />
            </div>
            <AlertDialogTitle className="text-center text-2xl font-black uppercase tracking-tight">Eliminar Comunicado</AlertDialogTitle>
            <AlertDialogDescription className="text-center text-sm font-medium py-4">
              ¿Está seguro de que desea eliminar permanentemente el anuncio <span className="text-slate-900 dark:text-white font-bold uppercase">"{announcementToDelete?.title}"</span>? Esta acción no se puede deshacer y el mensaje desaparecerá del tablón de todos los usuarios.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center gap-3 pt-4">
            <AlertDialogCancel className="rounded-none font-bold uppercase text-[10px] tracking-[0.2em]">Cancelar</AlertDialogCancel>
            <AlertDialogAction disabled={isDeleting} onClick={handleDeleteAnnouncement} className="rounded-none bg-rose-600 hover:bg-rose-700 font-bold uppercase text-[10px] tracking-[0.2em]">
              {isDeleting ? 'Eliminando...' : 'Confirmar Eliminación'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
