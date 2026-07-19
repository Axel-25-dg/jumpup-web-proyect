import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Globe,
  Plus,
  Search,
  Edit2,
  Trash2,
  ArrowLeft,
  AlertCircle
} from 'lucide-react'

import { Button } from '@/presentation/components/ui/button'
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
import { courseRepo } from '@/infrastructure/factories/teacher.factory'
import type { Language } from '@/domain/entities/course.entity'

export default function AdminLanguagesPage() {
  const navigate = useNavigate()
  const [languages, setLanguages] = useState<Language[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  // Delete state
  const [langToDelete, setLangToDelete] = useState<Language | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    loadLanguages()
  }, [])

  const loadLanguages = async () => {
    try {
      setIsLoading(true)
      const result = await courseRepo.getLanguages()
      setLanguages(result)
    } catch (error) {
      console.error('Error loading languages:', error)
      toast.error('Error al cargar los idiomas')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteLanguage = async () => {
    if (!langToDelete) return
    setIsDeleting(true)
    try {
      await courseRepo.deleteLanguage!(langToDelete.id)
      setLanguages(languages.filter(l => l.id !== langToDelete.id))
      toast.success('Idioma eliminado con exito')
    } catch (error) {
      console.error('Error deleting language:', error)
      toast.error('Error al eliminar el idioma')
    } finally {
      setIsDeleting(false)
      setLangToDelete(null)
    }
  }

  const filteredLanguages = languages.filter(l => {
    const term = searchTerm.toLowerCase()
    return l.name.toLowerCase().includes(term) || l.code.toLowerCase().includes(term)
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
                <Globe className="h-3.5 w-3.5 text-sky-500" />
                Catalogo
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white uppercase">
              Idiomas <span className="text-sky-500">Disponibles</span>.
            </h1>
            <p className="text-base text-slate-500 dark:text-slate-400 max-w-lg font-medium">
              Administra los idiomas ofertados en JumpUp, configurando sus codigos MCER correspondientes.
            </p>
          </div>
          <Button
            onClick={() => navigate('/admin/management/languages/new')}
            className="rounded-none bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold uppercase text-[11px] tracking-[0.2em] px-8 py-6 h-auto hover:bg-sky-500 dark:hover:bg-sky-500 hover:text-white transition-all"
          >
            <Plus className="h-4 w-4 mr-2" /> Nuevo Idioma
          </Button>
        </div>
      </section>

      {/* TOOLBAR */}
      <div className="border-b border-slate-900/10 dark:border-white/10 p-6 md:p-8 flex flex-col lg:flex-row gap-6 justify-between items-center bg-white dark:bg-transparent">
        <div className="relative w-full lg:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            placeholder="BUSCAR IDIOMA POR NOMBRE O CODIGO..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border border-slate-900/10 dark:border-white/10 bg-transparent py-3.5 pl-12 pr-4 text-[11px] font-bold uppercase tracking-widest outline-none focus:border-sky-500 transition-colors"
          />
        </div>
        <div className="label-caps border border-slate-900/10 dark:border-white/10 text-slate-500 px-6 py-3 bg-slate-50 dark:bg-white/5 font-mono">
          {languages.length} REGISTROS
        </div>
      </div>

      {/* DATA TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px] text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-900/10 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02]">
              <th className="px-8 py-5 label-caps text-slate-400">Identificador</th>
              <th className="px-8 py-5 label-caps text-slate-400">Nombre del Idioma</th>
              <th className="px-8 py-5 label-caps text-slate-400">Codigo MCER/ISO</th>
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
            ) : filteredLanguages.length > 0 ? (
              filteredLanguages.map((lang) => (
                <tr key={lang.id} className="card-hover group">
                  <td className="px-8 py-6">
                    <span className="label-micro text-slate-400 font-mono italic">#{lang.id}</span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 shrink-0 border border-slate-900/10 dark:border-white/10 flex items-center justify-center font-black text-xs text-sky-500 bg-slate-50 dark:bg-white/5 uppercase">
                        {lang.flag_icon_url ? (
                          <img src={lang.flag_icon_url} alt={lang.name} className="h-6 w-6 object-cover" />
                        ) : (
                          lang.code.substring(0, 2)
                        )}
                      </div>
                      <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight group-hover:text-sky-500 transition-colors">
                        {lang.name}
                      </p>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="label-micro px-3 py-1 border border-slate-900/10 dark:border-white/10 bg-slate-50 dark:bg-white/5 font-mono">
                      {lang.code}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-none border-slate-900/10 hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-slate-900 transition-all font-bold text-[10px] uppercase tracking-widest h-9"
                        onClick={() => navigate(`/admin/management/languages/${lang.id}/edit`)}
                      >
                        <Edit2 className="h-3.5 w-3.5 mr-2" /> Editar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-none border-slate-900/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all font-bold text-[10px] uppercase tracking-widest h-9"
                        onClick={() => setLangToDelete(lang)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="py-24 text-center">
                  <div className="flex h-16 w-16 items-center justify-center border border-slate-900/10 dark:border-white/10 mx-auto mb-6">
                    <Globe className="h-6 w-6 text-slate-300" />
                  </div>
                  <p className="label-caps text-slate-400">No se encontraron registros de idiomas</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={!!langToDelete} onOpenChange={(open) => !open && !isDeleting && setLangToDelete(null)}>
        <AlertDialogContent className="rounded-none border-slate-900/10">
          <AlertDialogHeader>
            <div className="flex h-16 w-16 items-center justify-center border border-rose-500/20 bg-rose-500/5 mx-auto mb-6">
              <AlertCircle className="h-8 w-8 text-rose-500" />
            </div>
            <AlertDialogTitle className="text-center text-2xl font-black uppercase tracking-tight">Eliminar Idioma</AlertDialogTitle>
            <AlertDialogDescription className="text-center text-sm font-medium py-4">
              Esta seguro de que desea eliminar el idioma <span className="text-slate-900 dark:text-white font-bold uppercase">"{langToDelete?.name} ({langToDelete?.code})"</span>? Esta accion podria afectar a los cursos vinculados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center gap-3 pt-4">
            <AlertDialogCancel className="rounded-none font-bold uppercase text-[10px] tracking-[0.2em]">Cancelar</AlertDialogCancel>
            <AlertDialogAction disabled={isDeleting} onClick={handleDeleteLanguage} className="rounded-none bg-rose-600 hover:bg-rose-700 font-bold uppercase text-[10px] tracking-[0.2em]">
              {isDeleting ? 'Eliminando...' : 'Confirmar Eliminacion'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}