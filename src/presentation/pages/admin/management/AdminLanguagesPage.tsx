import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Globe,
  Plus,
  Search,
  Edit2,
  Trash2,
  ArrowLeft,
  AlertCircle,
  Loader2,
  CheckCircle2
} from 'lucide-react'
import { Card, CardContent } from '@/presentation/components/ui/card'
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
import type { Language } from '@/domain/entities/course.entity'

export default function AdminLanguagesPage() {
  const [languages, setLanguages] = useState<Language[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  // Create/Edit modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingLanguage, setEditingLanguage] = useState<Language | null>(null)
  const [langName, setLangName] = useState('')
  const [langCode, setLangCode] = useState('')
  const [isSaving, setIsSaving] = useState(false)

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

  const openCreateModal = () => {
    setEditingLanguage(null)
    setLangName('')
    setLangCode('')
    setIsModalOpen(true)
  }

  const openEditModal = (lang: Language) => {
    setEditingLanguage(lang)
    setLangName(lang.name)
    setLangCode(lang.code)
    setIsModalOpen(true)
  }

  // Note: The current repository doesn't have create/update/delete language methods
  // This UI is prepared for when those APIs are available
  const handleSaveLanguage = async () => {
    if (!langName.trim() || !langCode.trim()) {
      toast.error('Completa todos los campos requeridos')
      return
    }
    setIsSaving(true)
    try {
      // Simulate save - actual API integration needed
      toast.success(editingLanguage ? 'Idioma actualizado (simulado)' : 'Idioma creado (simulado)')
      setIsModalOpen(false)
      await loadLanguages()
    } catch (error: any) {
      console.error('Error saving language:', error)
      toast.error('Error al guardar el idioma')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteLanguage = async () => {
    if (!langToDelete) return
    setIsDeleting(true)
    try {
      // Simulate delete - actual API integration needed
      setLanguages(languages.filter(l => l.id !== langToDelete.id))
      toast.success('Idioma eliminado (simulado)')
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
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild className="rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">
            <Link to="/admin"><ArrowLeft className="h-5 w-5" /></Link>
          </Button>
          <div>
            <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">Catálogo de Idiomas</h1>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-1">Administra los lenguajes disponibles en la plataforma</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button
            className="h-12 rounded-2xl font-black bg-sky-600 hover:bg-sky-700 shadow-xl shadow-sky-500/20 px-6 group"
            onClick={openCreateModal}
          >
            <Plus className="mr-2 h-5 w-5" /> Nuevo Idioma
          </Button>
        </div>
      </div>

      {/* Languages List */}
      <Card className="border-none shadow-2xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50/50 dark:bg-slate-800/20">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 dark:text-slate-500" />
            <Input
              placeholder="Buscar idioma por nombre o código..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-12 pl-12 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
            />
          </div>
          <Badge className="bg-sky-100 text-sky-700 font-bold px-3 py-1">
            {languages.length} idiomas
          </Badge>
        </div>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {[1,2,3].map(i => (
                <Skeleton key={i} className="h-20 w-full rounded-2xl" />
              ))}
            </div>
          ) : filteredLanguages.length > 0 ? (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredLanguages.map((lang) => (
                <div key={lang.id} className="p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-2xl bg-sky-50 dark:bg-sky-900/20 text-sky-600 flex items-center justify-center font-black text-xl uppercase">
                      {lang.flag_icon_url ? (
                        <img src={lang.flag_icon_url} alt={lang.name} className="h-8 w-8 object-cover rounded" />
                      ) : (
                        lang.code.substring(0, 2)
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-black text-slate-900 dark:text-white text-lg">{lang.name}</h3>
                        <Badge className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold uppercase text-[10px]">
                          {lang.code}
                        </Badge>
                      </div>
                      <p className="text-xs font-bold text-slate-400">
                        ID: {lang.id}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-10 w-10 rounded-xl p-0"
                      onClick={() => openEditModal(lang)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-10 w-10 rounded-xl p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                      onClick={() => setLangToDelete(lang)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center">
              <Globe className="h-12 w-12 text-slate-200 dark:text-slate-700 mx-auto mb-4" />
              <h3 className="text-lg font-black text-slate-900 dark:text-white">Sin resultados</h3>
              <p className="text-slate-500 font-medium">
                {searchTerm ? 'No hay idiomas que coincidan con tu búsqueda.' : 'No hay idiomas registrados.'}
              </p>
              {!searchTerm && (
                <Button className="mt-4 rounded-xl font-bold" onClick={openCreateModal}>
                  <Plus className="mr-2 h-4 w-4" /> Agregar Primer Idioma
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-lg rounded-3xl bg-white dark:bg-slate-900">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-slate-900 dark:text-white">
              {editingLanguage ? 'Editar Idioma' : 'Nuevo Idioma'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-black text-slate-900 dark:text-white">Nombre del Idioma</label>
              <Input
                value={langName}
                onChange={(e) => setLangName(e.target.value)}
                placeholder="Ej. Inglés, Francés, Alemán"
                className="h-14 rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-black text-slate-900 dark:text-white">Código del Idioma</label>
              <Input
                value={langCode}
                onChange={(e) => setLangCode(e.target.value.toUpperCase())}
                placeholder="Ej. EN, FR, DE"
                maxLength={5}
                className="h-14 rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium uppercase tracking-widest max-w-[150px]"
              />
              <p className="text-xs font-bold text-slate-400">Código ISO estándar (ej. ES, EN, FR, DE)</p>
            </div>
          </div>
          <DialogFooter className="gap-3">
            <Button variant="outline" onClick={() => setIsModalOpen(false)} className="rounded-xl h-12 px-6 font-bold">
              Cancelar
            </Button>
            <Button
              onClick={handleSaveLanguage}
              disabled={isSaving}
              className="rounded-xl h-12 px-6 font-bold bg-sky-600 hover:bg-sky-700"
            >
              {isSaving ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
              {editingLanguage ? 'Actualizar' : 'Guardar Idioma'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!langToDelete} onOpenChange={(open) => !open && !isDeleting && setLangToDelete(null)}>
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader>
            <div className="mx-auto bg-red-100 dark:bg-red-900/30 p-3 rounded-full w-fit mb-4">
              <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <AlertDialogTitle className="text-center text-2xl font-black">¿Eliminar idioma?</AlertDialogTitle>
            <AlertDialogDescription className="text-center font-medium">
              Esto eliminará permanentemente el idioma <br/>
              <span className="font-bold text-slate-900 dark:text-white">"{langToDelete?.name} ({langToDelete?.code})"</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center gap-3 mt-6">
            <AlertDialogCancel disabled={isDeleting} className="rounded-xl h-12 px-6 font-bold">Cancelar</AlertDialogCancel>
            <AlertDialogAction disabled={isDeleting} onClick={handleDeleteLanguage} className="bg-red-600 hover:bg-red-700 text-white rounded-xl h-12 px-6 font-bold">
              {isDeleting ? 'Eliminando...' : 'Sí, eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}