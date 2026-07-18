import { useEffect, useState } from 'react'
import { apiClient } from '@/infrastructure/http/axios-client'
import {
  MessageSquare,
  ArrowLeft,
  Send,
  ThumbsUp,
  Heart,
  Lightbulb,
  Loader2,
  Plus,
  Filter,
  Search,
  MoreVertical,
  Flag,
  Share2,
  Clock,
  Eye,
  MessageCircle
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/presentation/components/ui/card'
import { Button } from '@/presentation/components/ui/button'
import { Badge } from '@/presentation/components/ui/badge'
import { Avatar, AvatarFallback } from '@/presentation/components/ui/avatar'
import { cn } from '@/presentation/utils/cn'

interface ForumCategory {
  id: number
  name: string
  description: string
  icon: string
}

interface ForumThread {
  id: number
  title: string
  body: string
  creator_username: string
  views: number
  is_closed: boolean
  is_pinned: boolean
  created_at: string
}

interface ForumPost {
  id: number
  body: string
  creator_username: string
  parent: number | null
  created_at: string
  reactions_summary?: {
    like?: number
    love?: number
    helpful?: number
    confused?: number
  }
}

export default function ForumPage() {
  const [categories, setCategories] = useState<ForumCategory[]>([])
  const [selectedCategory, setSelectedCategory] = useState<ForumCategory | null>(null)
  const [threads, setThreads] = useState<ForumThread[]>([])
  const [selectedThread, setSelectedThread] = useState<ForumThread | null>(null)
  const [posts, setPosts] = useState<ForumPost[]>([])
  
  const [newThreadTitle, setNewThreadTitle] = useState('')
  const [newThreadBody, setNewThreadBody] = useState('')
  const [newPostText, setNewPostText] = useState('')
  
  const [isLoadingCats, setIsLoadingCats] = useState(true)
  const [isLoadingThreads, setIsLoadingThreads] = useState(false)
  const [isLoadingPosts, setIsLoadingPosts] = useState(false)
  
  const [showCreateThread, setShowCreateThread] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await apiClient.get<any>('/forum-categories/')
        const cats = Array.isArray(res.data) ? res.data : (res.data?.results || [])
        setCategories(cats)
        if (cats.length > 0) {
          handleSelectCategory(cats[0])
        }
      } catch (err) {
        console.error('Error fetching categories:', err)
      } finally {
        setIsLoadingCats(false)
      }
    }
    fetchCategories()
  }, [])

  const handleSelectCategory = async (cat: ForumCategory) => {
    setSelectedCategory(cat)
    setSelectedThread(null)
    setShowCreateThread(false)
    setIsLoadingThreads(true)
    try {
      const res = await apiClient.get<any>(`/forum-threads/?category=${cat.id}`)
      const threadList = Array.isArray(res.data) ? res.data : (res.data?.results || [])
      setThreads(threadList)
    } catch (err) {
      console.error('Error loading threads:', err)
    } finally {
      setIsLoadingThreads(false)
    }
  }

  const handleSelectThread = async (thread: ForumThread) => {
    setSelectedThread(thread)
    setIsLoadingPosts(true)
    try {
      const res = await apiClient.get<any>(`/forum-posts/?thread=${thread.id}`)
      const postList = Array.isArray(res.data) ? res.data : (res.data?.results || [])
      setPosts(postList)
    } catch (err) {
      console.error('Error loading posts:', err)
    } finally {
      setIsLoadingPosts(false)
    }
  }

  const handleCreateThread = async () => {
    if (!newThreadTitle.trim() || !newThreadBody.trim() || !selectedCategory) return
    try {
      const res = await apiClient.post<ForumThread>('/forum-threads/', {
        title: newThreadTitle,
        body: newThreadBody,
        category: selectedCategory.id
      })
      setThreads((prev) => [res.data, ...prev])
      setNewThreadTitle('')
      setNewThreadBody('')
      setShowCreateThread(false)
      handleSelectThread(res.data)
    } catch (err) {
      console.error('Error creating thread:', err)
    }
  }

  const handleCreatePost = async () => {
    if (!newPostText.trim() || !selectedThread) return
    try {
      const res = await apiClient.post<ForumPost>('/forum-posts/', {
        body: newPostText,
        thread: selectedThread.id,
        parent: null
      })
      setPosts((prev) => [...prev, res.data])
      setNewPostText('')
    } catch (err) {
      console.error('Error creating post:', err)
    }
  }

  const handleReaction = async (postId: number, reactionType: 'like' | 'love' | 'helpful' | 'confused') => {
    try {
      await apiClient.post('/forum-reactions/', {
        post: postId,
        reaction_type: reactionType
      })
      setPosts((prev) =>
        prev.map((post) => {
          if (post.id !== postId) return post
          const currentSummary = post.reactions_summary || {}
          const currentCount = currentSummary[reactionType] || 0
          return {
            ...post,
            reactions_summary: {
              ...currentSummary,
              [reactionType]: currentCount + 1
            }
          }
        })
      )
    } catch (err) {
      console.error('Error sending forum reaction:', err)
    }
  }

  const filteredThreads = threads.filter(t =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.body.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (isLoadingCats) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground animate-pulse">Cargando comunidad...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-foreground">
            Foro <span className="text-primary">JumpUp</span>
          </h1>
          <p className="text-muted-foreground text-lg mt-2 max-w-2xl">
            Resuelve tus dudas, comparte recursos y conecta con otros estudiantes de todo el mundo.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder="Buscar discusiones..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-muted/50 border-none rounded-full w-64 focus:ring-2 focus:ring-primary/20 transition-all outline-none"
            />
          </div>
          <Button
            className="rounded-full shadow-lg shadow-primary/20 hover:shadow-xl transition-all"
            onClick={() => {
              setSelectedThread(null)
              setShowCreateThread(true)
            }}
          >
            <Plus className="h-4 w-4 mr-2" /> Nuevo Hilo
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar: Categories & Stats */}
        <aside className="lg:col-span-3 space-y-6">
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-2">Categorías</h3>
            <nav className="space-y-1">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleSelectCategory(cat)}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-2xl transition-all duration-200 group",
                    selectedCategory?.id === cat.id
                      ? "bg-primary/10 text-primary shadow-sm"
                      : "hover:bg-muted text-muted-foreground hover:text-foreground"
                  )}
                >
                  <span className={cn(
                    "w-8 h-8 flex items-center justify-center rounded-xl text-lg transition-transform group-hover:scale-110",
                    selectedCategory?.id === cat.id ? "bg-primary text-white" : "bg-muted group-hover:bg-muted/80"
                  )}>
                    {cat.icon || '💬'}
                  </span>
                  <div className="text-left overflow-hidden">
                    <p className="text-sm font-semibold truncate">{cat.name}</p>
                    <p className="text-xs text-muted-foreground font-medium truncate">{cat.description}</p>
                  </div>
                </button>
              ))}
            </nav>
          </div>

          {/* Social Stats/Promo Card */}
          <Card className="bg-gradient-to-br from-indigo-600 to-violet-700 text-white border-none overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <MessageSquare size={80} />
            </div>
            <CardHeader className="p-5 pb-2">
              <CardTitle className="text-lg">Comunidad Activa</CardTitle>
              <CardDescription className="text-indigo-100/70 text-xs">
                Únete a más de 5,000 estudiantes hoy.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 pt-0">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map(i => (
                      <Avatar key={i} className="border-2 border-indigo-600 w-7 h-7">
                        <AvatarFallback className="text-[8px] bg-indigo-400">U{i}</AvatarFallback>
                      </Avatar>
                    ))}
                  </div>
                  <span className="text-[10px] font-medium">+12 online ahora</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </aside>

        {/* Main Content Area */}
        <main className="lg:col-span-9 space-y-6">
          {selectedThread ? (
            /* THREAD DETAIL VIEW */
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedThread(null)}
                className="hover:bg-transparent -ml-2 text-muted-foreground hover:text-primary transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-2" /> Volver a {selectedCategory?.name}
              </Button>

              <Card className="border-none shadow-xl shadow-black/5 rounded-3xl overflow-hidden bg-card/50 backdrop-blur-sm">
                <div className="h-2 bg-primary/20" />
                <CardHeader className="p-8 pb-4">
                  <div className="flex items-center gap-3 mb-4">
                    <Badge variant="secondary" className="bg-primary/5 text-primary hover:bg-primary/10 border-none px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                      {selectedCategory?.name}
                    </Badge>
                    {selectedThread.is_pinned && (
                      <Badge className="bg-amber-500/10 text-amber-600 border-none px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                        Fijado
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-3xl font-black leading-tight text-foreground">
                    {selectedThread.title}
                  </CardTitle>
                  <div className="flex items-center gap-3 mt-4 pt-4 border-t border-border/50">
                    <Avatar className="h-10 w-10 border-2 border-background shadow-sm">
                      <AvatarFallback className="bg-indigo-100 text-indigo-700 font-bold uppercase">
                        {(selectedThread.creator_username || 'U').slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-bold text-foreground">{selectedThread.creator_username}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <Clock className="h-3 w-3" />
                        {new Date(selectedThread.created_at).toLocaleString('es-ES', { day: 'numeric', month: 'long' })}
                      </p>
                    </div>
                    <div className="ml-auto flex items-center gap-2">
                       <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                         <Share2 className="h-4 w-4" />
                       </Button>
                       <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                         <Flag className="h-4 w-4" />
                       </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="px-8 py-6 text-base leading-relaxed text-muted-foreground whitespace-pre-wrap selection:bg-primary/20">
                  {selectedThread.body}
                </CardContent>
                <CardFooter className="bg-muted/30 px-8 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5"><Eye className="h-3.5 w-3.5" /> {selectedThread.views} vistas</span>
                    <span className="flex items-center gap-1.5"><MessageCircle className="h-3.5 w-3.5" /> {posts.length} respuestas</span>
                  </div>
                </CardFooter>
              </Card>

              {/* POSTS / COMMENTS SECTION */}
              <div className="space-y-4 pl-4 border-l-2 border-muted">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-black text-lg tracking-tight">Conversación</h4>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Filter className="h-3 w-3" />
                    <span>Más recientes primero</span>
                  </div>
                </div>
                
                {isLoadingPosts ? (
                  <div className="flex flex-col items-center py-12 gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-xs text-muted-foreground">Cargando respuestas...</p>
                  </div>
                ) : posts.length > 0 ? (
                  <div className="space-y-4">
                    {posts.map((post) => (
                      <div key={post.id} className="group relative">
                        <Card className="border-none shadow-md shadow-black/5 hover:shadow-lg transition-all duration-200 rounded-2xl bg-card overflow-hidden">
                          <CardHeader className="p-4 pb-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Avatar className="h-7 w-7">
                                  <AvatarFallback className="text-[10px] bg-muted font-bold">
                                    {(post.creator_username || 'U').slice(0, 2).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-xs font-bold text-foreground">{post.creator_username}</span>
                                <Badge variant="outline" className="text-[9px] py-0 px-1.5 h-4 border-muted-foreground/30 text-muted-foreground">Colaborador</Badge>
                              </div>
                              <span className="text-[10px] text-muted-foreground italic">
                                {new Date(post.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          </CardHeader>
                          <CardContent className="px-4 py-2 text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                            {post.body}
                          </CardContent>
                          <CardFooter className="px-4 py-3 bg-muted/20 border-t border-border/50 flex justify-between items-center">
                            <div className="flex items-center gap-4">
                              <button
                                onClick={() => handleReaction(post.id, 'like')}
                                className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground hover:text-primary transition-colors"
                              >
                                <ThumbsUp className={cn("h-3.5 w-3.5", (post.reactions_summary?.like ?? 0) > 0 && "text-primary fill-primary/10")} />
                                <span>{post.reactions_summary?.like ?? 0}</span>
                              </button>
                              <button
                                onClick={() => handleReaction(post.id, 'love')}
                                className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground hover:text-rose-500 transition-colors"
                              >
                                <Heart className={cn("h-3.5 w-3.5", (post.reactions_summary?.love ?? 0) > 0 && "text-rose-500 fill-rose-500/10")} />
                                <span>{post.reactions_summary?.love ?? 0}</span>
                              </button>
                              <button
                                onClick={() => handleReaction(post.id, 'helpful')}
                                className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground hover:text-amber-500 transition-colors"
                              >
                                <Lightbulb className={cn("h-3.5 w-3.5", (post.reactions_summary?.helpful ?? 0) > 0 && "text-amber-500 fill-amber-500/10")} />
                                <span>{post.reactions_summary?.helpful ?? 0}</span>
                              </button>
                            </div>
                            <Button variant="ghost" size="sm" className="h-7 text-[10px] text-muted-foreground hover:text-primary">
                              Responder
                            </Button>
                          </CardFooter>
                        </Card>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 bg-muted/20 rounded-2xl border-2 border-dashed border-muted">
                    <p className="text-sm text-muted-foreground">Nadie ha respondido aún. ¡Sé el primero!</p>
                  </div>
                )}

                {/* REPLY BOX */}
                {!selectedThread.is_closed && (
                  <div className="mt-8 relative animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <div className="flex gap-4 items-start">
                      <Avatar className="h-10 w-10 mt-1 border-2 border-primary/20">
                        <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold">ME</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-3">
                        <textarea
                          value={newPostText}
                          onChange={(e) => setNewPostText(e.target.value)}
                          placeholder="Comparte tu opinión o responde a la pregunta..."
                          rows={3}
                          className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none shadow-sm"
                        />
                        <div className="flex justify-end">
                          <Button
                            onClick={handleCreatePost}
                            disabled={!newPostText.trim()}
                            className="rounded-xl px-6 font-bold shadow-lg shadow-primary/20"
                          >
                            <Send className="h-4 w-4 mr-2" /> Publicar Respuesta
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : selectedCategory ? (
            /* THREAD LIST VIEW */
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-2">
                    <span className="w-2 h-8 bg-primary rounded-full" />
                    {selectedCategory.name}
                  </h2>
                  <p className="text-muted-foreground text-sm mt-1">{selectedCategory.description}</p>
                </div>
                <div className="flex items-center gap-2">
                   <Button variant="outline" size="sm" className="rounded-xl border-muted-foreground/20 text-xs font-semibold">
                      Recientes
                   </Button>
                   <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                   </Button>
                </div>
              </div>

              {showCreateThread && (
                <Card className="border-2 border-primary/30 shadow-2xl shadow-primary/5 rounded-3xl overflow-hidden animate-in zoom-in-95 duration-200">
                  <CardHeader className="bg-primary/5 p-6">
                    <CardTitle className="text-lg font-black text-primary">Nuevo Tema de Discusión</CardTitle>
                    <CardDescription className="text-xs">Inicia un diálogo constructivo con la comunidad.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 p-6">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-muted-foreground uppercase ml-1">Título</label>
                      <input
                        type="text"
                        placeholder="Ej: ¿Cómo mejorar mi pronunciación en inglés?"
                        value={newThreadTitle}
                        onChange={(e) => setNewThreadTitle(e.target.value)}
                        className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-muted-foreground uppercase ml-1">Contenido</label>
                      <textarea
                        placeholder="Describe tu duda o comparte tu conocimiento detalladamente..."
                        rows={6}
                        value={newThreadBody}
                        onChange={(e) => setNewThreadBody(e.target.value)}
                        className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                      />
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end gap-3 p-6 bg-muted/20 border-t">
                    <Button variant="ghost" className="rounded-xl font-bold" onClick={() => setShowCreateThread(false)}>Descartar</Button>
                    <Button
                      onClick={handleCreateThread}
                      disabled={!newThreadTitle.trim() || !newThreadBody.trim()}
                      className="rounded-xl px-8 font-bold shadow-lg shadow-primary/20"
                    >
                      Publicar Ahora
                    </Button>
                  </CardFooter>
                </Card>
              )}

              {isLoadingThreads ? (
                <div className="grid grid-cols-1 gap-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-24 rounded-2xl bg-muted animate-pulse" />
                  ))}
                </div>
              ) : filteredThreads.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {filteredThreads.map((thread) => (
                    <Card
                      key={thread.id}
                      onClick={() => handleSelectThread(thread)}
                      className="group cursor-pointer border-none shadow-md shadow-black/5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 rounded-2xl bg-card/70 overflow-hidden relative"
                    >
                      {thread.is_pinned && <div className="absolute top-0 left-0 w-1 h-full bg-amber-500" />}
                      <CardHeader className="p-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              {thread.is_pinned && (
                                <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none px-2 py-0 h-4 text-[9px] font-black uppercase">PIN</Badge>
                              )}
                              <span className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                                <Clock className="h-3 w-3" />
                                {new Date(thread.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            <CardTitle className="text-lg font-bold group-hover:text-primary transition-colors leading-tight">
                              {thread.title}
                            </CardTitle>
                            <CardDescription className="line-clamp-2 text-sm text-slate-600 dark:text-slate-300 font-medium">
                              {thread.body}
                            </CardDescription>
                          </div>
                          <div className="flex flex-col items-end gap-2 shrink-0">
                            <div className="flex -space-x-1.5">
                               <Avatar className="w-6 h-6 border-2 border-background shadow-sm">
                                 <AvatarFallback className="text-[8px] bg-indigo-50 text-indigo-500">{(thread.creator_username || 'U').slice(0, 1)}</AvatarFallback>
                               </Avatar>
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-tighter text-muted-foreground">{thread.creator_username}</span>
                          </div>
                        </div>
                      </CardHeader>
                      <CardFooter className="p-6 pt-0 flex items-center gap-6 border-t border-border/10 mt-2 bg-muted/5">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                           <Eye className="h-4 w-4" />
                           <span>{thread.views}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                           <MessageSquare className="h-4 w-4" />
                           <span>{Math.floor(Math.random() * 10)}</span> {/* Simulated count if not provided */}
                        </div>
                        <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity flex items-center text-primary font-black text-xs uppercase tracking-widest gap-2">
                           Leer más <ArrowLeft className="h-3 w-3 rotate-180" />
                        </div>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 bg-muted/20 border-2 border-dashed border-muted rounded-3xl text-center px-6">
                  <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mb-6">
                    <MessageSquare className="h-10 w-10 text-muted-foreground/50" />
                  </div>
                  <h3 className="text-xl font-black text-foreground">No encontramos hilos</h3>
                  <p className="text-muted-foreground text-sm max-w-sm mt-2">
                    Parece que no hay discusiones en esta categoría con el filtro actual. ¡Sé el pionero e inicia una conversación!
                  </p>
                  <Button
                    className="mt-6 rounded-xl font-bold px-8 shadow-lg shadow-primary/20"
                    onClick={() => setShowCreateThread(true)}
                  >
                    Crear Primer Hilo
                  </Button>
                </div>
              )}
            </div>
          ) : (
            /* WELCOME / EMPTY STATE */
            <div className="flex h-[60vh] flex-col items-center justify-center text-center p-8 bg-card/30 backdrop-blur-sm border-2 border-dashed border-border rounded-[2.5rem] animate-in zoom-in-95 duration-500">
              <div className="relative mb-8">
                 <div className="absolute -inset-4 bg-primary/20 blur-2xl rounded-full animate-pulse" />
                 <MessageSquare className="h-20 w-20 text-primary relative" />
              </div>
              <h3 className="text-3xl font-black text-foreground tracking-tight">Bienvenido a la Comunidad JumpUp</h3>
              <p className="text-muted-foreground text-lg max-w-md mt-4 font-medium leading-relaxed">
                Selecciona una categoría a la izquierda para sumergirte en las discusiones o empieza tu propio hilo.
              </p>
              <div className="mt-10 grid grid-cols-2 gap-4 w-full max-w-sm">
                 <div className="p-4 bg-card shadow-sm rounded-2xl border border-border">
                    <p className="text-2xl font-black text-primary">1.2k</p>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Hilos Activos</p>
                 </div>
                 <div className="p-4 bg-card shadow-sm rounded-2xl border border-border">
                    <p className="text-2xl font-black text-indigo-500">850</p>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Estudiantes Hoy</p>
                 </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
