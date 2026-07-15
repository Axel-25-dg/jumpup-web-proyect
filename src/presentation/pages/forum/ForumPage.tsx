import { useEffect, useState } from 'react'
import { apiClient } from '@/infrastructure/http/axios-client'
import { MessageSquare, ArrowLeft, Send, ThumbsUp, Heart, Lightbulb, Loader2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/presentation/components/ui/card'
import { Button } from '@/presentation/components/ui/button'
import { Badge } from '@/presentation/components/ui/badge'

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

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await apiClient.get<ForumCategory[]>('/forum-categories/')
        setCategories(res.data)
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
      const res = await apiClient.get<ForumThread[]>(`/forum-threads/?category=${cat.id}`)
      setThreads(res.data)
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
      const res = await apiClient.get<ForumPost[]>(`/forum-posts/?thread=${thread.id}`)
      setPosts(res.data)
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
      // Actualizar conteo localmente de forma directa
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

  if (isLoadingCats) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Forum Header */}
      <div className="border-b pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Foro Comunitario</h1>
          <p className="text-muted-foreground text-sm mt-1">Conéctate, comparte conocimientos y resuelve dudas con otros estudiantes.</p>
        </div>
      </div>

      {/* Main layout */}
      <div className="grid gap-6 md:grid-cols-4">
        {/* Sidebar: Categories */}
        <div className="md:col-span-1 space-y-3">
          <h3 className="font-bold text-sm text-muted-foreground uppercase tracking-wider">Categorías</h3>
          <div className="flex flex-col gap-1">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleSelectCategory(cat)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${
                  selectedCategory?.id === cat.id
                    ? 'bg-primary text-primary-foreground font-semibold shadow-sm'
                    : 'hover:bg-muted text-card-foreground'
                }`}
              >
                <span className="text-lg">{cat.icon || '💬'}</span>
                <div>
                  <p className="text-sm">{cat.name}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Contents area */}
        <div className="md:col-span-3 space-y-6">
          {selectedThread ? (
            /* HILO DETALLE */
            <div className="space-y-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedThread(null)}
                className="flex items-center gap-1.5"
              >
                <ArrowLeft className="h-4 w-4" /> Volver a los hilos
              </Button>

              <Card className="border-primary/10 shadow-md">
                <CardHeader className="bg-muted/10">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{selectedCategory?.name}</Badge>
                    {selectedThread.is_pinned && <Badge className="bg-amber-500">Fijado</Badge>}
                  </div>
                  <CardTitle className="text-xl mt-2">{selectedThread.title}</CardTitle>
                  <CardDescription className="text-xs">
                    Creado por <span className="font-semibold text-foreground">{selectedThread.creator_username}</span> · {new Date(selectedThread.created_at).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 text-sm leading-relaxed text-card-foreground/90 whitespace-pre-wrap">
                  {selectedThread.body}
                </CardContent>
              </Card>

              {/* Respuestas / Posts */}
              <div className="space-y-4">
                <h4 className="font-bold text-base">Respuestas ({posts.length})</h4>
                
                {isLoadingPosts ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : posts.length > 0 ? (
                  <div className="space-y-3">
                    {posts.map((post) => (
                      <Card key={post.id} className="hover:shadow-sm transition-shadow">
                        <CardHeader className="p-4 pb-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-indigo-600">{post.creator_username}</span>
                            <span className="text-[10px] text-muted-foreground">
                              {new Date(post.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </CardHeader>
                        <CardContent className="p-4 pt-0 text-sm whitespace-pre-wrap">
                          {post.body}
                        </CardContent>
                        <CardFooter className="p-3 bg-muted/20 border-t flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => handleReaction(post.id, 'like')}
                              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-indigo-600 transition-colors"
                            >
                              <ThumbsUp className="h-3.5 w-3.5" />
                              <span>{post.reactions_summary?.like ?? 0}</span>
                            </button>
                            <button
                              onClick={() => handleReaction(post.id, 'love')}
                              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-rose-600 transition-colors"
                            >
                              <Heart className="h-3.5 w-3.5" />
                              <span>{post.reactions_summary?.love ?? 0}</span>
                            </button>
                            <button
                              onClick={() => handleReaction(post.id, 'helpful')}
                              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-amber-500 transition-colors"
                            >
                              <Lightbulb className="h-3.5 w-3.5" />
                              <span>{post.reactions_summary?.helpful ?? 0}</span>
                            </button>
                          </div>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground text-sm">
                    No hay respuestas todavía. ¡Sé el primero en responder!
                  </div>
                )}

                {/* Caja para responder */}
                {!selectedThread.is_closed && (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newPostText}
                      onChange={(e) => setNewPostText(e.target.value)}
                      placeholder="Escribe una respuesta comunitaria..."
                      className="flex-1 rounded-xl border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                    />
                    <Button onClick={handleCreatePost} disabled={!newPostText.trim()}>
                      <Send className="h-4 w-4 mr-1.5" /> Responder
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ) : selectedCategory ? (
            /* HILOS LISTADO */
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <div>
                  <h2 className="text-2xl font-bold">{selectedCategory.name}</h2>
                  <p className="text-muted-foreground text-xs">{selectedCategory.description}</p>
                </div>
                <Button size="sm" onClick={() => setShowCreateThread(!showCreateThread)}>
                  {showCreateThread ? 'Cancelar' : 'Nuevo Hilo'}
                </Button>
              </div>

              {showCreateThread && (
                <Card className="border-primary/20">
                  <CardHeader>
                    <CardTitle className="text-base">Crear un Nuevo Hilo</CardTitle>
                    <CardDescription className="text-xs">Formula tu pregunta o comparte tus apuntes.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <input
                      type="text"
                      placeholder="Título llamativo..."
                      value={newThreadTitle}
                      onChange={(e) => setNewThreadTitle(e.target.value)}
                      className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                    />
                    <textarea
                      placeholder="Escribe el cuerpo del mensaje aquí..."
                      rows={4}
                      value={newThreadBody}
                      onChange={(e) => setNewThreadBody(e.target.value)}
                      className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary resize-none"
                    />
                  </CardContent>
                  <CardFooter className="flex justify-end gap-2 p-3 bg-muted/10 border-t">
                    <Button variant="ghost" onClick={() => setShowCreateThread(false)}>Cancelar</Button>
                    <Button onClick={handleCreateThread} disabled={!newThreadTitle.trim() || !newThreadBody.trim()}>
                      Publicar Hilo
                    </Button>
                  </CardFooter>
                </Card>
              )}

              {isLoadingThreads ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : threads.length > 0 ? (
                <div className="space-y-3">
                  {threads.map((thread) => (
                    <Card
                      key={thread.id}
                      onClick={() => handleSelectThread(thread)}
                      className="cursor-pointer hover:border-primary/40 hover:shadow-sm transition-all"
                    >
                      <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between gap-4">
                        <div>
                          <CardTitle className="text-base font-semibold">{thread.title}</CardTitle>
                          <CardDescription className="text-xs mt-1">
                            Por {thread.creator_username} · {new Date(thread.created_at).toLocaleDateString()}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-1.5 text-muted-foreground text-xs shrink-0 mt-0.5">
                          <MessageSquare className="h-3.5 w-3.5" />
                          <span>{thread.views} vistas</span>
                        </div>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground text-sm border border-dashed rounded-xl">
                  No hay hilos en esta categoría. ¡Empieza creando uno!
                </div>
              )}
            </div>
          ) : (
            <div className="flex h-96 flex-col items-center justify-center border-2 border-dashed rounded-xl p-8 text-center text-muted-foreground">
              <MessageSquare className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
              <h3 className="font-bold text-lg">Foro JumpUp</h3>
              <p className="text-sm max-w-xs mt-1">
                Haz clic en cualquiera de las categorías del menú lateral para explorar hilos de dudas, consejos y debates de la comunidad.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
