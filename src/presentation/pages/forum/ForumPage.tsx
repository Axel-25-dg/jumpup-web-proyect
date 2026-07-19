import { useEffect, useState } from 'react'
import { apiClient } from '@/infrastructure/http/axios-client'
import {
  MessageSquare, Search, Plus, ChevronRight,
  Clock, Globe, Filter, ArrowUpRight
} from 'lucide-react'

interface ForumThread {
  id: number
  title: string
  content: string
  author_username: string
  created_at: string
  category_name: string
  comment_count: number
}

const CATEGORIES = ['Todos', 'Lingüística', 'Tecnología', 'JumpUp Labs', 'General']

export default function ForumPage() {
  const [threads, setThreads] = useState<ForumThread[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('Todos')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchThreads() {
      try {
        const res = await apiClient.get('/forum-threads/')
        // Normalize: API may return paginated object or plain array
        const raw = res.data as any
        const arr: ForumThread[] = Array.isArray(raw)
          ? raw
          : Array.isArray(raw?.results)
            ? raw.results
            : []
        setThreads(arr)
      } catch (err) {
        console.error('Error fetching threads:', err)
        setThreads([])
      } finally {
        setIsLoading(false)
      }
    }
    fetchThreads()
  }, [])

  const filteredThreads = threads.filter(t => {
    const matchesSearch =
      (t.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.content || '').toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory =
      activeCategory === 'Todos' ||
      (t.category_name || '').toLowerCase().includes(activeCategory.toLowerCase())
    return matchesSearch && matchesCategory
  })

  return (
    <div className="animate-in fade-in duration-500">
      {/* HERO */}
      <section className="border-b border-slate-900/10 dark:border-white/10 px-8 md:px-12 py-10 md:py-14">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
          <div className="space-y-3">
            <div className="chip">
              <MessageSquare className="h-3.5 w-3.5 text-sky-500" />
              Comunidad
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
              Foro de <span className="text-sky-500">Discusión</span>
            </h1>
            <p className="label-micro text-slate-400">
              Centro de intercambio de conocimiento técnico y lingüístico
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-2xl font-black text-slate-900 dark:text-white">{threads.length}</p>
                <p className="label-micro text-slate-400">Hilos</p>
              </div>
            </div>
            <button className="inline-flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white text-sm font-bold px-4 py-2.5 transition-colors">
              <Plus className="h-4 w-4" /> Nuevo Hilo
            </button>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] min-h-[calc(100vh-180px)]">
        {/* SIDEBAR */}
        <aside className="border-r border-slate-900/10 dark:border-white/10 bg-white dark:bg-white/[0.02]">
          <div className="p-6 space-y-6">
            {/* Categories */}
            <div className="space-y-2">
              <h3 className="label-micro text-slate-400 flex items-center gap-2">
                <Filter className="h-3.5 w-3.5 text-sky-500" /> Categorías
              </h3>
              <nav className="flex flex-col gap-0.5">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`flex items-center justify-between px-3 py-2.5 text-xs font-bold transition-colors text-left ${
                      activeCategory === cat
                        ? 'bg-sky-500 text-white'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-sky-500/[0.06] hover:text-sky-600 dark:hover:text-sky-400'
                    }`}
                  >
                    {cat}
                    {activeCategory === cat && <ChevronRight className="h-3 w-3" />}
                  </button>
                ))}
              </nav>
            </div>

            {/* Stats */}
            <div className="border-t border-slate-900/10 dark:border-white/10 pt-5 space-y-3">
              <h3 className="label-micro text-slate-400">Estado del Sistema</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="label-micro text-slate-500">Latencia API</span>
                  <span className="label-micro text-emerald-500 font-bold">24ms — OK</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="label-micro text-slate-500">Índice</span>
                  <span className="label-micro text-sky-500 font-bold">Optimizado</span>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main>
          {/* Toolbar */}
          <div className="px-6 py-4 border-b border-slate-900/10 dark:border-white/10 flex flex-col sm:flex-row gap-3 justify-between items-center bg-white dark:bg-white/[0.02]">
            <div className="relative w-full sm:max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar en el foro..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 pl-9 pr-4 border border-slate-900/10 dark:border-white/10 bg-transparent text-sm font-medium text-slate-700 dark:text-slate-300 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            </div>
            <span className="label-micro text-slate-400 shrink-0">
              {filteredThreads.length} hilos
            </span>
          </div>

          {/* Thread List */}
          {isLoading ? (
            <div className="divide-y divide-slate-900/5 dark:divide-white/5">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="px-6 py-6 animate-pulse">
                  <div className="h-3 w-24 bg-slate-100 dark:bg-white/5 mb-3" />
                  <div className="h-5 w-3/4 bg-slate-100 dark:bg-white/5 mb-2" />
                  <div className="h-3 w-1/2 bg-slate-100 dark:bg-white/5" />
                </div>
              ))}
            </div>
          ) : filteredThreads.length > 0 ? (
            <div className="divide-y divide-slate-900/5 dark:divide-white/5">
              {filteredThreads.map((thread) => (
                <div
                  key={thread.id}
                  className="px-6 py-6 hover:bg-sky-500/[0.04] transition-colors group cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="label-micro px-1.5 py-0.5 border border-sky-500/30 text-sky-500">
                          {thread.category_name || 'General'}
                        </span>
                        <span className="label-micro text-slate-400">
                          #{thread.id.toString().padStart(4, '0')}
                        </span>
                      </div>
                      <h2 className="text-base font-black tracking-tight text-slate-900 dark:text-white group-hover:text-sky-500 transition-colors line-clamp-2">
                        {thread.title}
                      </h2>
                      <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
                        {thread.content}
                      </p>
                      <div className="flex flex-wrap items-center gap-4 pt-1">
                        <div className="flex items-center gap-1.5">
                          <div className="h-5 w-5 border border-slate-900/10 dark:border-white/10 flex items-center justify-center text-[9px] font-black text-sky-500">
                            {thread.author_username?.slice(0, 1).toUpperCase()}
                          </div>
                          <span className="label-micro text-slate-600 dark:text-slate-400 font-bold">
                            {thread.author_username}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3 w-3 text-sky-500" />
                          <span className="label-micro text-slate-400">
                            {new Date(thread.created_at).toLocaleDateString('es-ES')}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MessageSquare className="h-3 w-3 text-sky-500" />
                          <span className="label-micro text-slate-500 font-bold">
                            {thread.comment_count} respuestas
                          </span>
                        </div>
                      </div>
                    </div>
                    <button className="h-8 w-8 border border-slate-900/10 dark:border-white/10 flex items-center justify-center text-slate-400 hover:text-sky-500 hover:border-sky-500/30 transition-colors shrink-0 opacity-0 group-hover:opacity-100">
                      <ArrowUpRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center">
              <Globe className="h-10 w-10 text-slate-200 dark:text-slate-700 mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-900 dark:text-white mb-1">Sin resultados</p>
              <p className="label-micro text-slate-400 mb-4">
                {searchQuery ? 'Ningún hilo coincide con tu búsqueda.' : 'Inicia una discusión para poblar el foro.'}
              </p>
              {!searchQuery && (
                <button className="inline-flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold px-4 py-2 transition-colors">
                  <Plus className="h-3.5 w-3.5" /> Crear Primer Hilo
                </button>
              )}
            </div>
          )}

          {/* Pagination */}
          {filteredThreads.length > 0 && (
            <div className="px-6 py-6 border-t border-slate-900/10 dark:border-white/10 flex items-center gap-1.5">
              {[1, 2, 3].map((p) => (
                <button
                  key={p}
                  className={`h-8 w-8 border text-xs font-bold transition-colors ${
                    p === 1
                      ? 'bg-sky-500 text-white border-sky-500'
                      : 'border-slate-900/10 dark:border-white/10 text-slate-500 hover:border-sky-500/30 hover:text-sky-500'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
