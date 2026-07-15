import { useEffect, useState } from 'react'
import { apiClient } from '@/infrastructure/http/axios-client'
import { useAuthStore } from '@/presentation/store/auth.store'
import { MessageCircle, ThumbsUp, Heart, Star, Send, Flame, Award, Loader2 } from 'lucide-react'
import { Card, CardContent, CardFooter, CardHeader } from '@/presentation/components/ui/card'
import { Button } from '@/presentation/components/ui/button'
import { Avatar, AvatarFallback } from '@/presentation/components/ui/avatar'
import { Badge } from '@/presentation/components/ui/badge'

interface SocialPost {
  id: number
  body: string
  creator_username: string
  created_at: string
  post_type: 'general' | 'achievement' | 'certificate' | 'progress'
  comments_count: number
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
  creator_username: string
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

  useEffect(() => {
    async function fetchPosts() {
      try {
        const res = await apiClient.get<SocialPost[]>('/social-posts/')
        setPosts(res.data)
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
        body: newPostBody,
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
          return { ...p, comments_count: p.comments_count + 1 }
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
      // Actualizar conteo localmente de forma rápida
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

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Muro Social</h1>
        <p className="text-muted-foreground text-sm mt-1">Comparte tus logros, felicita a tus compañeros y sigue activo.</p>
      </div>

      {/* Create Post Card */}
      <Card className="border-primary/10 shadow-sm">
        <CardContent className="p-4 flex gap-4">
          <Avatar className="h-10 w-10 shrink-0">
            <AvatarFallback className="bg-primary text-white">
              {user?.username.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-3">
            <textarea
              placeholder="¿Qué estás aprendiendo hoy? Comparte tus trucos..."
              rows={3}
              value={newPostBody}
              onChange={(e) => setNewPostBody(e.target.value)}
              className="w-full rounded-xl border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary resize-none"
            />
            <div className="flex justify-end">
              <Button onClick={handleCreatePost} disabled={!newPostBody.trim()} className="rounded-xl">
                Publicar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feed list */}
      <div className="space-y-4">
        {posts.length > 0 ? (
          posts.map((post) => (
            <Card key={post.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="p-4 pb-2">
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9 shrink-0">
                    <AvatarFallback className={post.post_type !== 'general' ? 'bg-amber-100 text-amber-700' : 'bg-muted text-muted-foreground'}>
                      {post.creator_username.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-sm truncate">{post.creator_username}</span>
                      {post.post_type === 'achievement' && (
                        <Badge className="bg-amber-500 text-[10px] py-0 px-1.5 flex items-center gap-0.5">
                          <Award className="h-3 w-3" /> Logro
                        </Badge>
                      )}
                      {post.post_type === 'certificate' && (
                        <Badge className="bg-emerald-500 text-[10px] py-0 px-1.5 flex items-center gap-0.5">
                          <Award className="h-3 w-3" /> Certificado
                        </Badge>
                      )}
                    </div>
                    <span className="text-[10px] text-muted-foreground block">
                      {new Date(post.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-4 pt-0 text-sm whitespace-pre-wrap leading-relaxed text-card-foreground/95">
                {post.body}
              </CardContent>

              <CardFooter className="p-3 border-t bg-muted/10 flex flex-col gap-3">
                {/* Reactions and comment buttons */}
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <button
                      onClick={() => handleReaction(post.id, 'like')}
                      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-indigo-600 transition-colors"
                      title="Like"
                    >
                      <ThumbsUp className="h-3.5 w-3.5" />
                      <span>{post.reactions_summary?.like ?? 0}</span>
                    </button>
                    <button
                      onClick={() => handleReaction(post.id, 'love')}
                      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-rose-600 transition-colors"
                      title="Love"
                    >
                      <Heart className="h-3.5 w-3.5" />
                      <span>{post.reactions_summary?.love ?? 0}</span>
                    </button>
                    <button
                      onClick={() => handleReaction(post.id, 'fire')}
                      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-amber-500 transition-colors"
                      title="Fire"
                    >
                      <Flame className="h-3.5 w-3.5" />
                      <span>{post.reactions_summary?.fire ?? 0}</span>
                    </button>
                    <button
                      onClick={() => handleReaction(post.id, 'star')}
                      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-yellow-500 transition-colors"
                      title="Star"
                    >
                      <Star className="h-3.5 w-3.5" />
                      <span>{post.reactions_summary?.star ?? 0}</span>
                    </button>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleComments(post.id)}
                    className="flex items-center gap-1 text-xs"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>{post.comments_count} {post.comments_count === 1 ? 'Comentario' : 'Comentarios'}</span>
                  </Button>
                </div>

                {/* Nested Comments Box */}
                {activeCommentPostId === post.id && (
                  <div className="w-full space-y-3 border-t pt-3">
                    {isLoadingComments ? (
                      <div className="flex justify-center py-4">
                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {(comments[post.id] || []).map((comm) => (
                          <div key={comm.id} className="flex gap-2.5 items-start bg-card border rounded-lg p-2 text-xs">
                            <Avatar className="h-6 w-6 shrink-0">
                              <AvatarFallback className="text-[9px] bg-muted font-bold">
                                {comm.creator_username.slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between">
                                <span className="font-semibold">{comm.creator_username}</span>
                                <span className="text-[9px] text-muted-foreground">
                                  {new Date(comm.created_at).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="mt-0.5 text-card-foreground/90 whitespace-pre-wrap">{comm.body}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newCommentBody}
                        onChange={(e) => setNewCommentBody(e.target.value)}
                        placeholder="Escribe un comentario..."
                        className="flex-1 rounded-lg border bg-background px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                      />
                      <Button
                        size="sm"
                        onClick={() => handleCreateComment(post.id)}
                        disabled={!newCommentBody.trim()}
                        className="text-xs"
                      >
                        <Send className="h-3 w-3 mr-1" /> Enviar
                      </Button>
                    </div>
                  </div>
                )}
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="text-center py-12 text-muted-foreground text-sm border border-dashed rounded-xl">
            No hay publicaciones en el feed social actualmente.
          </div>
        )}
      </div>
    </div>
  )
}
