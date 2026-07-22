import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  MessageSquare,
  Search,
  Loader2,
  Plus,
  Pin,
  PinOff,
  Lock,
  Unlock,
  Trash2,
  Edit2,
  Flag,
  CheckCircle2,
  Clock,
  AlertCircle,
  Layers,
  FileText,
  Save,
} from 'lucide-react'
import { Button } from '@/presentation/components/ui/button'
import { Skeleton } from '@/presentation/components/ui/skeleton'
import { Input } from '@/presentation/components/ui/input'
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
import { forumThreadRepoInstance, forumPostRepoInstance, forumReportRepoInstance } from '@/infrastructure/factories/admin-forum.factory'
import type { ForumCategory } from '@/domain/entities/forum-category.entity'
import type { ForumThread } from '@/domain/entities/forum-thread.entity'
import type { ForumPost } from '@/domain/entities/forum-post.entity'
import type { ForumReport } from '@/domain/entities/forum-report.entity'
import type { CreateForumCategoryDto } from '@/application/dtos/forum-category.dto'

type Tab = 'categories' | 'threads' | 'posts' | 'reports'

const PRESET_ICONS = ['💬', '📚', '🎯', '🎓', '💡', '❓', '📝', '🗣️', '🌍', '📢', '🎮', '💻', '📸', '🎵', '🏆', '🔬', '📊', '🤝', '🚀', '⭐']

export default function AdminForumPage() {
  const [activeTab, setActiveTab] = useState<Tab>('categories')

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
                <MessageSquare className="h-3.5 w-3.5 text-sky-500" />
                Comunidad
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
              Gestión del <span className="text-sky-500">Foro</span>.
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Administra categorías, hilos, posts y reportes de la comunidad.
            </p>
          </div>
        </div>
      </section>

      {/* TABS */}
      <div className="flex gap-px bg-slate-900/10 dark:bg-white/10 mx-8 md:mx-12 mt-6 border border-slate-900/10 dark:border-white/10">
        {([
          { id: 'categories' as Tab, label: 'Categorías', icon: Layers },
          { id: 'threads' as Tab, label: 'Hilos', icon: MessageSquare },
          { id: 'posts' as Tab, label: 'Posts', icon: FileText },
          { id: 'reports' as Tab, label: 'Reportes', icon: Flag },
        ]).map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-4 text-xs font-bold uppercase tracking-widest transition-all ${
              activeTab === tab.id
                ? 'bg-sky-500 text-white'
                : 'bg-white dark:bg-[#0a0a0b] text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB CONTENT */}
      <div className="mt-2 bg-transparent">
        {activeTab === 'categories' && <CategoriesTab />}
        {activeTab === 'threads' && <ThreadsTab />}
        {activeTab === 'posts' && <PostsTab />}
        {activeTab === 'reports' && <ReportsTab />}
      </div>
    </div>
  )
}

// ─── CATEGORIES TAB ──────────────────────────────────────────────────────────
function CategoriesTab() {
  const [categories, setCategories] = useState<ForumCategory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState<ForumCategory | null>(null)
  const [categoryToDelete, setCategoryToDelete] = useState<ForumCategory | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [formData, setFormData] = useState({ name: '', description: '', icon: '💬', order: 1, is_active: true })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const loadCategories = async () => {
    setIsLoading(true)
    try {
      const result = await forumCategoryUseCase.getAll()
      setCategories(result.results || [])
    } catch { toast.error('Error al cargar categorías') }
    finally { setIsLoading(false) }
  }

  useEffect(() => { loadCategories() }, [])

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      const payload: CreateForumCategoryDto = formData
      if (editingCategory) {
        await forumCategoryUseCase.update(editingCategory.id, payload)
        toast.success('Categoría actualizada')
      } else {
        await forumCategoryUseCase.create(payload)
        toast.success('Categoría creada')
      }
      setShowForm(false)
      setEditingCategory(null)
      setFormData({ name: '', description: '', icon: '💬', order: 1, is_active: true })
      loadCategories()
    } catch { toast.error('Error al guardar') }
    finally { setIsSubmitting(false) }
  }

  const handleDelete = async () => {
    if (!categoryToDelete) return
    setIsDeleting(true)
    try {
      await forumCategoryUseCase.delete(categoryToDelete.id)
      setCategories(prev => prev.filter(c => c.id !== categoryToDelete.id))
      toast.success('Categoría eliminada')
    } catch { toast.error('Error al eliminar') }
    finally { setIsDeleting(false); setCategoryToDelete(null) }
  }

  const startEdit = (cat: ForumCategory) => {
    setEditingCategory(cat)
    setFormData({ name: cat.name, description: cat.description || '', icon: cat.icon || '💬', order: cat.order, is_active: cat.is_active })
    setShowForm(true)
  }

  const filtered = categories.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <div className="px-8 md:px-12 py-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-6">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input placeholder="Buscar categorías..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
        </div>
        <Button onClick={() => { setShowForm(true); setEditingCategory(null); setFormData({ name: '', description: '', icon: '💬', order: 1, is_active: true }) }} size="sm">
          <Plus className="h-4 w-4 mr-2" /> Nueva Categoría
        </Button>
      </div>

      {/* Form inline */}
      {showForm && (
        <div className="mb-6 p-6 border border-sky-200 dark:border-sky-800 bg-sky-50 dark:bg-sky-900/20">
          <h3 className="text-sm font-black mb-4 uppercase">{editingCategory ? 'Editar' : 'Nueva'} Categoría</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="label-micro text-slate-500">Nombre</label>
              <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border border-slate-900/10 dark:border-white/10 bg-transparent p-3 text-sm outline-none focus:border-sky-500" />
            </div>
            <div>
              <label className="label-micro text-slate-500">Orden</label>
              <input type="number" value={formData.order} onChange={e => setFormData({...formData, order: Number(e.target.value)})} className="w-full border border-slate-900/10 dark:border-white/10 bg-transparent p-3 text-sm outline-none focus:border-sky-500" />
            </div>
            <div className="md:col-span-2">
              <label className="label-micro text-slate-500">Descripción</label>
              <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full border border-slate-900/10 dark:border-white/10 bg-transparent p-3 text-sm outline-none focus:border-sky-500 min-h-[80px]" />
            </div>
            <div>
              <label className="label-micro text-slate-500">Icono</label>
              <div className="flex gap-1 flex-wrap">
                {PRESET_ICONS.map(icon => (
                  <button key={icon} type="button" onClick={() => setFormData({...formData, icon})} className={`h-8 w-8 text-sm flex items-center justify-center border ${formData.icon === icon ? 'border-sky-500 bg-sky-500 text-white' : 'border-slate-900/10 dark:border-white/10'}`}>{icon}</button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <label className="label-micro text-slate-500">Activo</label>
              <input type="checkbox" checked={formData.is_active} onChange={e => setFormData({...formData, is_active: e.target.checked})} className="h-5 w-5 text-sky-500" />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button onClick={handleSubmit} disabled={isSubmitting} size="sm">
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              {editingCategory ? 'Actualizar' : 'Crear'}
            </Button>
            <Button variant="outline" size="sm" onClick={() => { setShowForm(false); setEditingCategory(null) }}>Cancelar</Button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto border border-slate-900/10 dark:border-white/10">
        <table className="w-full text-left">
          <thead className="bg-slate-50 dark:bg-white/[0.02] border-b border-slate-900/10 dark:border-white/10">
            <tr>
              <th className="px-6 py-4 label-caps text-slate-400">Orden</th>
              <th className="px-6 py-4 label-caps text-slate-400">Nombre</th>
              <th className="px-6 py-4 label-caps text-slate-400">Hilos</th>
              <th className="px-6 py-4 label-caps text-slate-400">Estado</th>
              <th className="px-6 py-4 label-caps text-slate-400 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-900/5 dark:divide-white/5">
            {isLoading ? (
              <tr><td colSpan={5} className="p-8"><Skeleton className="h-8 w-full" /></td></tr>
            ) : filtered.length > 0 ? filtered.map(cat => (
              <tr key={cat.id} className="card-hover group">
                <td className="px-6 py-4 font-mono text-sm text-slate-400">{cat.order.toString().padStart(2,'0')}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{cat.icon || '💬'}</span>
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{cat.name}</p>
                      <p className="text-xs text-slate-500 truncate max-w-[300px]">{cat.description}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-500 font-mono">{cat.thread_count || 0}</td>
                <td className="px-6 py-4">
                  <span className={`label-micro px-2 py-0.5 ${cat.is_active ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'}`}>
                    {cat.is_active ? 'ACTIVO' : 'INACTIVO'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => startEdit(cat)} title="Editar"><Edit2 className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-500" onClick={() => setCategoryToDelete(cat)} title="Eliminar"><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={5} className="py-12 text-center text-slate-400">No hay categorías</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <AlertDialog open={!!categoryToDelete} onOpenChange={o => !o && !isDeleting && setCategoryToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex h-14 w-14 items-center justify-center border border-rose-200 mx-auto mb-4"><AlertCircle className="h-6 w-6 text-rose-500" /></div>
            <AlertDialogTitle className="text-center">¿Eliminar categoría?</AlertDialogTitle>
            <AlertDialogDescription className="text-center">Se eliminarán todos los hilos asociados.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center">
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction disabled={isDeleting} onClick={handleDelete} className="bg-rose-600">{isDeleting ? 'Eliminando...' : 'Eliminar'}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// ─── THREADS TAB ─────────────────────────────────────────────────────────────
function ThreadsTab() {
  const [threads, setThreads] = useState<ForumThread[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [actionLoading, setActionLoading] = useState<number | null>(null)
  const [threadToDelete, setThreadToDelete] = useState<ForumThread | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const load = async () => {
    setIsLoading(true)
    try {
      const result = await forumThreadRepoInstance.getAll()
      setThreads(result.results || [])
    } catch { toast.error('Error al cargar hilos') }
    finally { setIsLoading(false) }
  }

  useEffect(() => { load() }, [])

  const handlePin = async (t: ForumThread) => {
    setActionLoading(t.id)
    try {
      const r = await forumThreadRepoInstance.pin(t.id)
      toast.success(r.is_pinned ? 'Hilo fijado' : 'Hilo desfijado')
      load()
    } catch { toast.error('Error') } finally { setActionLoading(null) }
  }

  const handleClose = async (t: ForumThread) => {
    setActionLoading(t.id)
    try {
      const r = await forumThreadRepoInstance.close(t.id)
      toast.success(r.is_closed ? 'Hilo cerrado' : 'Hilo reabierto')
      load()
    } catch { toast.error('Error') } finally { setActionLoading(null) }
  }

  const handleDelete = async () => {
    if (!threadToDelete) return
    setIsDeleting(true)
    try {
      await forumThreadRepoInstance.delete(threadToDelete.id)
      setThreads(prev => prev.filter(t => t.id !== threadToDelete.id))
      toast.success('Hilo eliminado')
    } catch { toast.error('Error') }
    finally { setIsDeleting(false); setThreadToDelete(null) }
  }

  const filtered = threads.filter(t =>
    t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.author_email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="px-8 md:px-12 py-6">
      <div className="relative w-full sm:max-w-sm mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input placeholder="Buscar por título o email..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
      </div>

      <div className="divide-y divide-slate-900/5 dark:divide-white/5 border border-slate-900/10 dark:border-white/10">
        {isLoading ? (
          <div className="p-8 space-y-4">{[1,2,3].map(i => <Skeleton key={i} className="h-16 w-full" />)}</div>
        ) : filtered.length > 0 ? filtered.map(t => (
          <div key={t.id} className="p-5 flex items-center gap-4 card-hover group">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="label-caps px-2 py-0.5 border border-sky-900/10 text-sky-600 text-[10px]">{t.category_name}</span>
                {t.is_pinned && <Pin className="h-3 w-3 text-amber-500" />}
                {t.is_closed && <Lock className="h-3 w-3 text-rose-500" />}
                <span className="label-micro text-slate-400">{t.views} vistas</span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">{t.title}</h3>
              <p className="text-xs text-slate-500">
                {t.author_email} • {t.post_count} posts
              </p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handlePin(t)} disabled={actionLoading === t.id} title={t.is_pinned ? 'Desfijar' : 'Fijar'}>
                {actionLoading === t.id ? <Loader2 className="h-4 w-4 animate-spin" /> : t.is_pinned ? <PinOff className="h-4 w-4 text-amber-500" /> : <Pin className="h-4 w-4" />}
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleClose(t)} disabled={actionLoading === t.id} title={t.is_closed ? 'Reabrir' : 'Cerrar'}>
                {actionLoading === t.id ? <Loader2 className="h-4 w-4 animate-spin" /> : t.is_closed ? <Unlock className="h-4 w-4 text-rose-500" /> : <Lock className="h-4 w-4" />}
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-500" onClick={() => setThreadToDelete(t)} title="Eliminar"><Trash2 className="h-4 w-4" /></Button>
            </div>
          </div>
        )) : (
          <div className="py-16 text-center text-slate-400">No se encontraron hilos</div>
        )}
      </div>

      <AlertDialog open={!!threadToDelete} onOpenChange={o => !o && !isDeleting && setThreadToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex h-14 w-14 items-center justify-center border border-rose-200 mx-auto mb-4"><AlertCircle className="h-6 w-6 text-rose-500" /></div>
            <AlertDialogTitle className="text-center">¿Eliminar hilo?</AlertDialogTitle>
            <AlertDialogDescription className="text-center">Se eliminará permanentemente.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center">
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction disabled={isDeleting} onClick={handleDelete} className="bg-rose-600">{isDeleting ? 'Eliminando...' : 'Eliminar'}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// ─── POSTS TAB ───────────────────────────────────────────────────────────────
function PostsTab() {
  const [posts, setPosts] = useState<ForumPost[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [postToDelete, setPostToDelete] = useState<ForumPost | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const load = async () => {
    setIsLoading(true)
    try {
      const result = await forumPostRepoInstance.getAll()
      setPosts(result.results || [])
    } catch { toast.error('Error al cargar posts') }
    finally { setIsLoading(false) }
  }

  useEffect(() => { load() }, [])

  const handleDelete = async () => {
    if (!postToDelete) return
    setIsDeleting(true)
    try {
      await forumPostRepoInstance.delete(postToDelete.id)
      setPosts(prev => prev.filter(p => p.id !== postToDelete.id))
      toast.success('Post eliminado')
    } catch { toast.error('Error') }
    finally { setIsDeleting(false); setPostToDelete(null) }
  }

  const filtered = posts.filter(p =>
    p.body.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.author_email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="px-8 md:px-12 py-6">
      <div className="relative w-full sm:max-w-sm mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input placeholder="Buscar por contenido o email..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
      </div>

      <div className="divide-y divide-slate-900/5 dark:divide-white/5 border border-slate-900/10 dark:border-white/10">
        {isLoading ? (
          <div className="p-8 space-y-4">{[1,2,3].map(i => <Skeleton key={i} className="h-16 w-full" />)}</div>
        ) : filtered.length > 0 ? filtered.map(p => (
          <div key={p.id} className="p-5 flex items-center gap-4 card-hover group">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="label-micro text-slate-400 font-mono">#{p.thread} • {p.reaction_count} reacciones</span>
                {p.parent && <span className="label-micro text-sky-500">Respuesta</span>}
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-2">{p.body}</p>
              <p className="text-xs text-slate-500 mt-1">{p.author_email}</p>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-500 shrink-0" onClick={() => setPostToDelete(p)} title="Eliminar"><Trash2 className="h-4 w-4" /></Button>
          </div>
        )) : (
          <div className="py-16 text-center text-slate-400">No se encontraron posts</div>
        )}
      </div>

      <AlertDialog open={!!postToDelete} onOpenChange={o => !o && !isDeleting && setPostToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex h-14 w-14 items-center justify-center border border-rose-200 mx-auto mb-4"><AlertCircle className="h-6 w-6 text-rose-500" /></div>
            <AlertDialogTitle className="text-center">¿Eliminar post?</AlertDialogTitle>
            <AlertDialogDescription className="text-center">Soft-delete: el contenido quedará oculto.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center">
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction disabled={isDeleting} onClick={handleDelete} className="bg-rose-600">{isDeleting ? 'Eliminando...' : 'Eliminar'}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// ─── REPORTS TAB ─────────────────────────────────────────────────────────────
function ReportsTab() {
  const [reports, setReports] = useState<ForumReport[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'reviewed' | 'resolved'>('all')
  const [actionLoading, setActionLoading] = useState<number | null>(null)

  const load = async () => {
    setIsLoading(true)
    try {
      const params = statusFilter !== 'all' ? { status: statusFilter } : {}
      const result = await forumReportRepoInstance.getAll(params)
      setReports(result.results || [])
    } catch { toast.error('Error al cargar reportes') }
    finally { setIsLoading(false) }
  }

  useEffect(() => { load() }, [statusFilter])

  const handleStatus = async (r: ForumReport, newStatus: 'reviewed' | 'resolved') => {
    setActionLoading(r.id)
    try {
      await forumReportRepoInstance.updateStatus(r.id, newStatus)
      toast.success(`Reporte ${newStatus === 'reviewed' ? 'revisado' : 'resuelto'}`)
      load()
    } catch { toast.error('Error') }
    finally { setActionLoading(null) }
  }

  const statusBadge = (s: string) => {
    switch (s) {
      case 'pending': return { label: 'Pendiente', color: 'bg-amber-50 text-amber-600 border-amber-200' }
      case 'reviewed': return { label: 'Revisado', color: 'bg-sky-50 text-sky-600 border-sky-200' }
      case 'resolved': return { label: 'Resuelto', color: 'bg-emerald-50 text-emerald-600 border-emerald-200' }
      default: return { label: s, color: 'bg-slate-100 text-slate-500' }
    }
  }

  return (
    <div className="px-8 md:px-12 py-6">
      <div className="flex gap-1.5 mb-6">
        {(['all', 'pending', 'reviewed', 'resolved'] as const).map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`px-4 py-2 label-caps transition-colors ${statusFilter === s ? 'bg-sky-500 text-white' : 'border border-slate-900/10 text-slate-600 hover:bg-slate-50'}`}>
            {s === 'all' ? 'Todos' : s === 'pending' ? 'Pendientes' : s === 'reviewed' ? 'Revisados' : 'Resueltos'}
          </button>
        ))}
      </div>

      <div className="divide-y divide-slate-900/5 dark:divide-white/5 border border-slate-900/10 dark:border-white/10">
        {isLoading ? (
          <div className="p-8 space-y-4">{[1,2,3].map(i => <Skeleton key={i} className="h-16 w-full" />)}</div>
        ) : reports.length > 0 ? reports.map(r => {
          const sb = statusBadge(r.status)
          return (
            <div key={r.id} className="p-5 flex items-center gap-4 card-hover group">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`label-caps px-2 py-0.5 border ${sb.color}`}>{sb.label}</span>
                  <span className="label-micro text-slate-400 font-mono">#{r.post}</span>
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-2">{r.reason}</p>
                <p className="text-xs text-slate-500 mt-1">Reportado por {r.reporter_email}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {r.status === 'pending' && (
                  <>
                    <Button size="sm" variant="outline" onClick={() => handleStatus(r, 'reviewed')} disabled={actionLoading === r.id}>
                      {actionLoading === r.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Clock className="h-3 w-3 mr-1" />} Revisado
                    </Button>
                    <Button size="sm" onClick={() => handleStatus(r, 'resolved')} disabled={actionLoading === r.id} className="bg-emerald-600">
                      <CheckCircle2 className="h-3 w-3 mr-1" /> Resolver
                    </Button>
                  </>
                )}
                {r.status === 'reviewed' && (
                  <Button size="sm" onClick={() => handleStatus(r, 'resolved')} disabled={actionLoading === r.id} className="bg-emerald-600">
                    <CheckCircle2 className="h-3 w-3 mr-1" /> Resolver
                  </Button>
                )}
              </div>
            </div>
          )
        }) : (
          <div className="py-16 text-center text-slate-400">No se encontraron reportes</div>
        )}
      </div>
    </div>
  )
}

