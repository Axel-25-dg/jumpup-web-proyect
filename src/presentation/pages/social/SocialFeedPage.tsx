import { useEffect, useState } from 'react'
import { apiClient } from '@/infrastructure/http/axios-client'
import { useAuthStore } from '@/presentation/store/auth.store'
import {
  MessageSquare,
  ThumbsUp,
  Heart,
  Star,
  Send,
  Flame,
  Award,
  Loader2,
  Plus,
  Image as ImageIcon,
  Link as LinkIcon,
  MoreHorizontal,
  TrendingUp,
  Search,
  Users,
  Trophy
} from 'lucide-react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/presentation/components/ui/card'
import { Button } from '@/presentation/components/ui/button'
import { Avatar, AvatarFallback } from '@/presentation/components/ui/avatar'
import { Badge } from '@/presentation/components/ui/badge'
import { cn } from '@/presentation/utils/cn'

interface SocialPost {
  id: number
  content: string
  author_username: string
  created_at: string
  post_type: 'general' | 'achievement' | 'certificate' | 'progress'
  comment_count: number
  reactions_summary?: {
    like?: number
    love?: number
    clap?: number
    fire?: number
    star?: number
  }
}

interface SocialComment {
  id: number
  body: string
  author_username: string
  created_at: string
}

export default function SocialFeedPage() {
  const { user } = useAuthStore()
  const [posts, setPosts] = useState<SocialPost[]>([])
  const [newPostBody, setNewPostBody] = useState('')
  const [activeCommentPostId, setActiveCommentPostId] = useState<number | null>(null)
  const [comments, setComments] = useState<Record<number, SocialComment[]>>({})
  const [newCommentBody, setNewCommentBody] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingComments, setIsLoadingComments] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    async function fetchPosts() {
      try {
        const res = await apiClient.get<SocialPost[]>('/social-posts/')
        const postsData = res.data as any
        const postsArray = Array.isArray(postsData) ? postsData : (postsData?.data || postsData?.results || [])
        setPosts(postsArray)
      } catch (err) {
        console.error('Error fetching social feed posts:', err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchPosts()
  }, [])

  const handleCreatePost = async () => {
    if (!newPostBody.trim()) return
    try {
      const res = await apiClient.post<SocialPost>('/social-posts/', {
        content: newPostBody,
        post_type: 'general'
      })
      setPosts((prev) => [res.data, ...prev])
      setNewPostBody('')
    } catch (err) {
      console.error('Error creating post:', err)
    }
  }

  const handleToggleComments = async (postId: number) => {
    if (activeCommentPostId === postId) {
      setActiveCommentPostId(null)
      return
    }
    setActiveCommentPostId(postId)
    setIsLoadingComments(true)
    try {
      const res = await apiClient.get<SocialComment[]>(`/social-comments/?post=${postId}`)
      setComments((prev) => ({
        ...prev,
        [postId]: res.data
      }))
    } catch (err) {
      console.error('Error loading comments:', err)
    } finally {
      setIsLoadingComments(false)
    }
  }

  const handleCreateComment = async (postId: number) => {
    if (!newCommentBody.trim()) return
    try {
      const res = await apiClient.post<SocialComment>('/social-comments/', {
        body: newCommentBody,
        post: postId
      })
      setComments((prev) => ({
        ...prev,
        [postId]: [...(prev[postId] || []), res.data]
      }))
      setPosts((prev) =>
        prev.map((p) => {
          if (p.id !== postId) return p
          return { ...p, comment_count: p.comment_count + 1 }
        })
      )
      setNewCommentBody('')
    } catch (err) {
      console.error('Error creating comment:', err)
    }
  }

  const handleReaction = async (postId: number, reactionType: 'like' | 'love' | 'clap' | 'fire' | 'star') => {
    try {
      await apiClient.post('/social-reactions/', {
        post: postId,
        reaction_type: reactionType
      })
      setPosts((prev) =>
        prev.map((p) => {
          if (p.id !== postId) return p
          const currentSummary = p.reactions_summary || {}
          const currentVal = currentSummary[reactionType] || 0
          return {
            ...p,
            reactions_summary: {
              ...currentSummary,
              [reactionType]: currentVal + 1
            }
          }
        })
      )
    } catch (err) {
      console.error('Error sharing reaction:', err)
    }
  }

  const filteredPosts = posts.filter(p =>
    (p.content || '').toLowerCase().includes((searchQuery || '').toLowerCase()) ||
    (p.author_username || '').toLowerCase().includes((searchQuery || '').toLowerCase())
  )

  if (isLoading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
            <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto relative" />
          </div>
          <p className="text-muted-foreground font-medium animate-pulse">Sincronizando el muro...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Left Sidebar: User Quick Stats & Trends */}
        <aside className="hidden lg:block lg:col-span-3 space-y-6">
          <Card className="border-none shadow-xl shadow-black/5 rounded-[2.5rem] overflow-hidden bg-card/50 backdrop-blur-sm">
            <div className="h-24 bg-gradient-to-br from-primary/80 to-indigo-600" />
            <CardHeader className="relative pt-12 pb-4 text-center">
              <div className="absolute -top-12 left-1/2 -translate-x-1/2">
                <Avatar className="h-24 w-24 border-4 border-background shadow-xl">
                  <AvatarFallback className="bg-primary text-white text-2xl font-black">
                    {user?.username?.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
              <CardTitle className="text-xl font-black">{user?.username}</CardTitle>
              <CardDescription className="font-medium text-primary">Nivel 24 · Explorador</CardDescription>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <div className="grid grid-cols-2 gap-4 py-4 border-y border-border/50">
                <div className="text-center">
                  <p className="text-lg font-black text-foreground">128</p>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Seguidores</p>
                </div>
                <div className="text-center border-l border-border/50">
                  <p className="text-lg font-black text-foreground">256</p>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Siguiendo</p>
                </div>
              </div>
              <Button variant="ghost" className="w-full mt-4 rounded-2xl font-bold text-xs text-muted-foreground hover:text-primary transition-colors">
                Ver mi perfil completo
              </Button>
            </CardContent>
          </Card>

          <div className="px-4 space-y-4">
             <h3 className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2">
                <TrendingUp size={14} className="text-primary" /> Tendencias
             </h3>
             <div className="space-y-3">
                {['#LearnTogether', '#DailyGoal', '#JumpUpEnglish', '#GrammarFun'].map(tag => (
                  <div key={tag} className="group cursor-pointer">
                    <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{tag}</p>
                    <p className="text-[10px] text-muted-foreground">1.2k publicaciones esta semana</p>
                  </div>
                ))}
             </div>
          </div>
        </aside>

        {/* Main Feed */}
        <main className="lg:col-span-6 space-y-6">
          {/* Create Post Card */}
          <Card className="border-none shadow-xl shadow-black/5 rounded-[2rem] overflow-hidden bg-card/80 backdrop-blur-md sticky top-4 z-10 border border-white/10">
            <CardContent className="p-6">
              <div className="flex gap-4">
                <Avatar className="h-12 w-12 border-2 border-primary/20 shadow-sm">
                  <AvatarFallback className="bg-primary/10 text-primary font-black">
                    {user?.username?.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-4">
                  <textarea
                    placeholder="¿Qué estás aprendiendo hoy? Comparte un consejo o un logro..."
                    rows={2}
                    value={newPostBody}
                    onChange={(e) => setNewPostBody(e.target.value)}
                    className="w-full rounded-2xl border-none bg-muted/30 px-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none placeholder:text-muted-foreground/60 font-medium"
                  />
                  <div className="flex items-center justify-between pt-2 border-t border-border/50">
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/5">
                        <ImageIcon className="h-5 w-5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full text-muted-foreground hover:text-emerald-500 hover:bg-emerald-50">
                        <LinkIcon className="h-5 w-5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full text-muted-foreground hover:text-amber-500 hover:bg-amber-50">
                        <Star className="h-5 w-5" />
                      </Button>
                    </div>
                    <Button
                      onClick={handleCreatePost}
                      disabled={!newPostBody.trim()}
                      className="rounded-full px-8 font-black shadow-lg shadow-primary/20 hover:shadow-xl transition-all"
                    >
                      Publicar <Plus className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Feed list */}
          <div className="space-y-6">
            {filteredPosts.length > 0 ? (
              filteredPosts.map((post) => (
                <Card
                  key={post.id}
                  className={cn(
                    "border-none shadow-lg shadow-black/5 rounded-[2.5rem] overflow-hidden bg-card transition-all duration-300 hover:shadow-2xl",
                    post.post_type !== 'general' && "ring-2 ring-primary/20"
                  )}
                >
                  <CardHeader className="p-6 pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Avatar className="h-11 w-11 border-2 border-background shadow-md">
                            <AvatarFallback className={cn(
                              "font-black",
                              post.post_type !== 'general' ? 'bg-amber-100 text-amber-700' : 'bg-muted text-muted-foreground'
                            )}>
                              {post.author_username?.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          {post.post_type !== 'general' && (
                            <div className="absolute -bottom-1 -right-1 bg-amber-500 text-white rounded-full p-0.5 border-2 border-background">
                              <Trophy size={10} />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-black text-sm text-foreground tracking-tight">{post.author_username}</span>
                            {post.post_type === 'achievement' && (
                              <Badge className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 border-none text-[9px] font-black px-2 py-0.5 rounded-full uppercase">
                                Logro Desbloqueado
                              </Badge>
                            )}
                            {post.post_type === 'certificate' && (
                              <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-none text-[9px] font-black px-2 py-0.5 rounded-full uppercase">
                                Certificado Obtenido
                              </Badge>
                            )}
                          </div>
                          <span className="text-[10px] font-bold text-muted-foreground flex items-center gap-1 mt-0.5 uppercase tracking-tighter">
                            Hace {Math.floor(Math.random() * 24)} horas • Publico
                          </span>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:bg-muted/50">
                        <MoreHorizontal className="h-5 w-5" />
                      </Button>
                    </div>
                  </CardHeader>

                  <CardContent className="px-8 py-2">
                    <p className={cn(
                      "text-foreground leading-relaxed font-medium selection:bg-primary/20",
                      (post.content || '').length < 60 ? "text-xl font-bold" : "text-sm"
                    )}>
                      {post.content}
                    </p>

                    {post.post_type === 'achievement' && (
                      <div className="mt-4 p-6 bg-gradient-to-r from-amber-50 to-orange-50 rounded-[2rem] border border-amber-100 flex items-center gap-6">
                         <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-amber-500">
                           <Award size={36} strokeWidth={2.5} />
                         </div>
                         <div>
                            <p className="text-sm font-black text-amber-900">¡NUEVO HITO!</p>
                            <p className="text-xs text-amber-700 font-medium">Ha completado 30 días de racha consecutivos.</p>
                         </div>
                      </div>
                    )}
                  </CardContent>

                  <CardFooter className="px-6 py-4 mt-4 bg-muted/10 border-t border-border/20 flex flex-col gap-4">
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-1 sm:gap-2">
                        {[
                          { type: 'like', icon: ThumbsUp, color: 'text-indigo-600', fill: 'fill-indigo-500/10' },
                          { type: 'love', icon: Heart, color: 'text-rose-600', fill: 'fill-rose-500/10' },
                          { type: 'fire', icon: Flame, color: 'text-amber-500', fill: 'fill-amber-500/10' },
                          { type: 'star', icon: Star, color: 'text-yellow-500', fill: 'fill-yellow-500/10' }
                        ].map(({ type, icon: Icon, color, fill }) => {
                          const count = post.reactions_summary?.[type as keyof typeof post.reactions_summary] ?? 0
                          return (
                            <button
                              key={type}
                              onClick={() => handleReaction(post.id, type as any)}
                              className={cn(
                                "group flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all duration-200 hover:bg-white shadow-sm border border-transparent hover:border-border",
                                count > 0 ? "text-foreground font-black scale-105" : "text-muted-foreground font-medium"
                              )}
                            >
                              <Icon className={cn("h-4 w-4 transition-transform group-hover:scale-125", count > 0 && cn(color, fill))} />
                              <span className="text-[11px]">{count}</span>
                            </button>
                          )
                        })}
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-3 rounded-full text-slate-500 hover:text-indigo-600 hover:bg-primary/5 font-bold transition-colors"
                          onClick={() => handleToggleComments(post.id)}
                        >
                          <MessageSquare className="h-4 w-4 mr-2" />
                          <span>{post.comment_count}</span>
                        </Button>
                      </div>
                    </div>

                    {/* Active Comments Section */}
                    {activeCommentPostId === post.id && (
                      <div className="w-full space-y-4 pt-4 border-t border-border/50 animate-in fade-in slide-in-from-top-2 duration-300">
                        {isLoadingComments ? (
                          <div className="flex flex-col items-center py-6 gap-2">
                            <Loader2 className="h-5 w-5 animate-spin text-primary" />
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Cargando conversación</p>
                          </div>
                        ) : (
                          <div className="space-y-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                            {(comments[post.id] || []).map((comment) => (
                              <div key={comment.id} className="flex gap-3 items-start group">
                                <Avatar className="h-6 w-6">
                            <AvatarFallback className="bg-indigo-100 text-indigo-700 text-[10px] font-bold">
                              {comment.author_username?.charAt(0).toUpperCase() || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 bg-slate-100 rounded-2xl p-3">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-xs font-bold text-slate-900">{comment.author_username}</span>
                                    <span className="text-[9px] font-bold text-muted-foreground uppercase">
                                      {new Date(comment.created_at).toLocaleDateString()}
                                    </span>
                                  </div>
                                  <p className="text-xs text-muted-foreground font-medium leading-relaxed">{comment.body}</p>
                                </div>
                              </div>
                            ))}
                            {(comments[post.id] || []).length === 0 && (
                              <p className="text-center py-4 text-xs font-bold text-muted-foreground italic">Sé el primero en decir algo...</p>
                            )}
                          </div>
                        )}

                        <div className="flex gap-3 items-center pt-2">
                          <Avatar className="h-8 w-8 shrink-0">
                             <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-bold">ME</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 relative">
                            <input
                              type="text"
                              value={newCommentBody}
                              onChange={(e) => setNewCommentBody(e.target.value)}
                              placeholder="Escribe un comentario amable..."
                              className="w-full rounded-full border-none bg-muted/50 px-5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                              onKeyDown={(e) => e.key === 'Enter' && handleCreateComment(post.id)}
                            />
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleCreateComment(post.id)}
                              disabled={!newCommentBody.trim()}
                              className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full text-primary hover:bg-primary/10"
                            >
                              <Send className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardFooter>
                </Card>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 bg-muted/10 rounded-[3rem] border-2 border-dashed border-muted">
                <div className="w-20 h-20 bg-muted/20 rounded-full flex items-center justify-center">
                  <Users className="h-10 w-10 text-muted-foreground/40" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-black text-foreground">Tu feed está tranquilo</h3>
                  <p className="text-sm text-muted-foreground max-w-xs mx-auto font-medium">
                    Parece que no hay publicaciones todavía. ¡Inicia el movimiento compartiendo tu progreso!
                  </p>
                </div>
                <Button className="rounded-full px-8 font-black shadow-lg">Comenzar un hilo</Button>
              </div>
            )}
          </div>
        </main>

        {/* Right Sidebar: Recommendations & Events */}
        <aside className="hidden xl:block xl:col-span-3 space-y-6">
          <div className="relative group mb-8">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder="Buscar personas o tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-card border-none rounded-2xl shadow-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none font-medium text-sm shadow-black/5"
            />
          </div>

          <div className="space-y-6">
             <div className="px-2">
                <h3 className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em] mb-4">A quién seguir</h3>
                <div className="space-y-4">
                  {[
                    { name: 'Sarah Miller', lang: 'English C1', xp: '15.4k' },
                    { name: 'Hiroki Tanaka', lang: 'Spanish B2', xp: '12.1k' },
                    { name: 'Elena Rossi', lang: 'Italian C2', xp: '18.9k' }
                  ].map((person, i) => (
                    <div key={i} className="flex items-center justify-between group">
                       <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 border border-border/50">
                             <AvatarFallback className="bg-muted text-[10px] font-bold">{person.name?.slice(0, 2)}</AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                             <p className="text-sm font-black text-foreground truncate">{person.name}</p>
                             <p className="text-[10px] font-bold text-primary uppercase tracking-tighter">{person.lang} • {person.xp} XP</p>
                          </div>
                       </div>
                       <Button variant="ghost" size="sm" className="h-8 w-8 rounded-full p-0 text-muted-foreground hover:text-primary hover:bg-primary/5">
                          <Plus size={16} />
                       </Button>
                    </div>
                  ))}
                </div>
                <Button variant="link" className="text-xs font-black text-primary p-0 h-auto mt-4 uppercase tracking-widest no-underline hover:underline">Ver sugerencias</Button>
             </div>

             <Card className="bg-primary/5 border-none rounded-[2rem] overflow-hidden">
                <CardHeader className="p-6 pb-2">
                   <CardTitle className="text-base font-black flex items-center gap-2">
                      <Award size={18} className="text-amber-500" /> Desafío Semanal
                   </CardTitle>
                </CardHeader>
                <CardContent className="p-6 pt-0 space-y-4">
                   <p className="text-xs font-medium text-muted-foreground leading-relaxed">
                      Completa 5 lecciones perfectas y obtén una insignia exclusiva de "Maestro de Precisión".
                   </p>
                   <div className="space-y-1.5">
                      <div className="flex justify-between text-[10px] font-black uppercase">
                         <span>Progreso</span>
                         <span>3/5</span>
                      </div>
                      <div className="h-2 w-full bg-primary/10 rounded-full overflow-hidden">
                         <div className="h-full bg-primary rounded-full w-[60%]" />
                      </div>
                   </div>
                   <Button className="w-full rounded-xl text-xs font-black shadow-sm h-9">Ver Detalles</Button>
                </CardContent>
             </Card>
          </div>
        </aside>

      </div>
    </div>
  )
}
