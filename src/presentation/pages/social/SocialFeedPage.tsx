import { useEffect, useState } from 'react'
import { apiClient } from '@/infrastructure/http/axios-client'
import { useAuthStore } from '@/presentation/store/auth.store'
import {
  MessageSquare, ThumbsUp, Heart, Star, Send, Flame,
  Award, Loader2, Plus, Image as ImageIcon, Link as LinkIcon,
  MoreHorizontal, TrendingUp, Search, Users, ArrowRight
} from 'lucide-react'

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

  return (
    <div className="animate-in fade-in duration-500">
      {/* HERO */}
      <section className="border-b border-slate-900/10 dark:border-white/10 px-8 md:px-12 py-10 md:py-14">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
          <div className="space-y-3">
            <div className="chip">
              <Users className="h-3.5 w-3.5 text-sky-500" />
              Comunidad
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
              Red <span className="text-sky-500">Social</span>
            </h1>
            <p className="label-micro text-slate-400">Comparte tus logros, rachas y conecta con otros estudiantes</p>
          </div>
          <div className="flex gap-8 shrink-0">
            <div>
              <p className="text-2xl font-black text-slate-900 dark:text-white">{posts.length}</p>
              <p className="label-micro text-slate-400">Publicaciones</p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 border-b border-slate-900/10 dark:border-white/10 bg-transparent">
        {/* LEFT COLUMN: Profile info & stats */}
        <aside className="lg:col-span-3 border-r border-slate-900/10 dark:border-white/10 bg-white dark:bg-white/[0.02]">
          <div className="p-6 border-b border-slate-900/10 dark:border-white/10 text-center flex flex-col items-center">
            <div className="h-16 w-16 border border-slate-900/10 dark:border-white/10 bg-slate-50 dark:bg-white/10 flex items-center justify-center text-xl font-black text-sky-500 mb-3">
              {user?.username?.slice(0, 2).toUpperCase()}
            </div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">{user?.username}</h2>
            <p className="label-micro text-slate-400 mt-1">Nivel 24 · Explorador</p>
          </div>

          <div className="grid grid-cols-2 divide-x divide-slate-900/10 dark:divide-white/10 border-b border-slate-900/10 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.01]">
            <div className="p-4 text-center">
              <p className="text-base font-black text-slate-900 dark:text-white">128</p>
              <p className="label-micro text-slate-400">Seguidores</p>
            </div>
            <div className="p-4 text-center">
              <p className="text-base font-black text-slate-900 dark:text-white">256</p>
              <p className="label-micro text-slate-400">Siguiendo</p>
            </div>
          </div>

          <div className="p-6 space-y-5">
            <div className="space-y-3">
              <h3 className="label-micro text-slate-400 flex items-center gap-1.5">
                <TrendingUp className="h-3.5 w-3.5 text-sky-500" /> Tendencias
              </h3>
              <div className="space-y-2.5">
                {['#LearnTogether', '#DailyGoal', '#JumpUp'].map(tag => (
                  <div key={tag} className="group cursor-pointer">
                    <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-sky-500 transition-colors">{tag}</p>
                    <p className="label-micro text-slate-400 mt-0.5">1.2k posts</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* MIDDLE COLUMN: Feed */}
        <main className="lg:col-span-6 border-r border-slate-900/10 dark:border-white/10 bg-white dark:bg-white/[0.02]">
          {/* Post creator */}
          <div className="p-6 border-b border-slate-900/10 dark:border-white/10">
            <div className="flex gap-4 items-start">
              <div className="h-10 w-10 border border-slate-900/10 dark:border-white/10 flex items-center justify-center text-xs font-black text-sky-500 shrink-0">
                {user?.username?.slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 space-y-3">
                <textarea
                  placeholder="¿Qué estás aprendiendo hoy? Comparte tus logros..."
                  rows={2}
                  value={newPostBody}
                  onChange={(e) => setNewPostBody(e.target.value)}
                  className="w-full border border-slate-900/10 dark:border-white/10 bg-transparent p-3 text-sm font-medium text-slate-700 dark:text-slate-300 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-sky-500 resize-none"
                />
                <div className="flex items-center justify-between">
                  <div className="flex gap-1.5">
                    <button className="h-8 w-8 border border-slate-900/10 dark:border-white/10 flex items-center justify-center text-slate-400 hover:text-sky-500 transition-colors">
                      <ImageIcon className="h-4 w-4" />
                    </button>
                    <button className="h-8 w-8 border border-slate-900/10 dark:border-white/10 flex items-center justify-center text-slate-400 hover:text-sky-500 transition-colors">
                      <LinkIcon className="h-4 w-4" />
                    </button>
                    <button className="h-8 w-8 border border-slate-900/10 dark:border-white/10 flex items-center justify-center text-slate-400 hover:text-sky-500 transition-colors">
                      <Star className="h-4 w-4" />
                    </button>
                  </div>
                  <button
                    onClick={handleCreatePost}
                    disabled={!newPostBody.trim()}
                    className="bg-sky-500 hover:bg-sky-600 disabled:opacity-40 text-white font-bold px-4 py-1.5 text-xs transition-colors"
                  >
                    Publicar
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Posts list */}
          <div className="divide-y divide-slate-900/5 dark:divide-white/5">
            {filteredPosts.length > 0 ? (
              filteredPosts.map((post) => (
                <div key={post.id} className="p-6 hover:bg-sky-500/[0.02] transition-colors group">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 border border-slate-900/10 dark:border-white/10 bg-slate-50 dark:bg-white/10 flex items-center justify-center font-black text-xs text-sky-500">
                        {post.author_username?.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-bold text-slate-900 dark:text-white">{post.author_username}</span>
                          {post.post_type === 'achievement' && (
                            <span className="label-micro px-1.5 py-0.5 border border-sky-500/30 text-sky-500 bg-sky-500/5">
                              Logro desbloqueado
                            </span>
                          )}
                        </div>
                        <p className="label-micro text-slate-400 mt-0.5">
                          {new Date(post.created_at).toLocaleDateString('es-ES')}
                        </p>
                      </div>
                    </div>
                    <button className="text-slate-400 hover:text-slate-600 transition-colors">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="space-y-4 pl-13 mb-5">
                    <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">
                      {post.content}
                    </p>

                    {post.post_type === 'achievement' && (
                      <div className="p-4 border border-sky-500/20 bg-sky-500/[0.04] flex items-center gap-3">
                        <div className="h-9 w-9 bg-sky-500 text-white flex items-center justify-center shrink-0">
                          <Award className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="label-micro text-sky-500 font-bold">Hito de Sistema</p>
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Racha de 30 días seguidos completada</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pl-13 pt-4 border-t border-slate-900/5 dark:border-white/5">
                    <div className="flex gap-2">
                      {[
                        { type: 'like', icon: ThumbsUp },
                        { type: 'love', icon: Heart },
                        { type: 'fire', icon: Flame },
                        { type: 'star', icon: Star }
                      ].map(({ type, icon: Icon }) => {
                        const count = post.reactions_summary?.[type as keyof typeof post.reactions_summary] ?? 0
                        return (
                          <button
                            key={type}
                            onClick={() => handleReaction(post.id, type as any)}
                            className={`flex items-center gap-1 px-2 py-0.5 border text-xs font-bold transition-all ${
                              count > 0
                                ? 'bg-sky-500 text-white border-sky-500'
                                : 'border-slate-900/10 dark:border-white/10 text-slate-400 hover:border-sky-500/30 hover:text-sky-500'
                            }`}
                          >
                            <Icon className="h-3 w-3" />
                            <span className="text-[10px]">{count}</span>
                          </button>
                        )
                      })}
                    </div>
                    <button
                      onClick={() => handleToggleComments(post.id)}
                      className="label-micro flex items-center gap-1.5 text-slate-500 hover:text-sky-500 transition-colors"
                    >
                      <MessageSquare className="h-3.5 w-3.5" /> {post.comment_count} respuestas
                    </button>
                  </div>

                  {/* Comments section */}
                  {activeCommentPostId === post.id && (
                    <div className="mt-5 pl-13 space-y-3">
                      <div className="border-l border-slate-900/10 dark:border-white/10 pl-4 py-2 space-y-3 bg-slate-50/50 dark:bg-white/[0.01]">
                        {isLoadingComments ? (
                          <div className="flex items-center gap-2 py-2 justify-center">
                            <Loader2 className="h-3.5 w-3.5 animate-spin text-sky-500" />
                            <span className="label-micro text-slate-400">Cargando comentarios...</span>
                          </div>
                        ) : (
                          <>
                            <div className="space-y-3 divide-y divide-slate-900/5 dark:divide-white/5">
                              {(comments[post.id] || []).map((comment) => (
                                <div key={comment.id} className="pt-3 first:pt-0">
                                  <div className="flex justify-between mb-1">
                                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{comment.author_username}</span>
                                    <span className="label-micro text-slate-400">{new Date(comment.created_at).toLocaleDateString()}</span>
                                  </div>
                                  <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">{comment.body}</p>
                                </div>
                              ))}
                            </div>
                            <div className="flex gap-2 pt-3 border-t border-slate-900/5 dark:divide-white/5">
                              <input
                                type="text"
                                value={newCommentBody}
                                onChange={(e) => setNewCommentBody(e.target.value)}
                                placeholder="Escribe un comentario..."
                                className="flex-1 h-8 px-3 border border-slate-900/10 dark:border-white/10 bg-transparent text-xs font-medium text-slate-700 dark:text-slate-300 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-sky-500"
                                onKeyDown={(e) => e.key === 'Enter' && handleCreateComment(post.id)}
                              />
                              <button
                                onClick={() => handleCreateComment(post.id)}
                                className="bg-sky-500 hover:bg-sky-600 text-white p-2 transition-colors flex items-center justify-center shrink-0"
                              >
                                <Send className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="py-16 text-center">
                <Users className="h-10 w-10 text-slate-200 dark:text-slate-700 mx-auto mb-3" />
                <p className="text-sm font-bold text-slate-900 dark:text-white mb-1">Sin publicaciones</p>
                <p className="label-micro text-slate-400">Comparte tu progreso o alguna duda con la comunidad.</p>
              </div>
            )}
          </div>
        </main>

        {/* RIGHT COLUMN: Suggestions */}
        <aside className="lg:col-span-3 bg-white dark:bg-white/[0.02]">
          <div className="p-6 space-y-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar usuarios..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 pl-9 pr-4 border border-slate-900/10 dark:border-white/10 bg-transparent text-sm font-medium text-slate-700 dark:text-slate-300 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            </div>

            <div className="space-y-3">
              <h3 className="label-caps text-slate-400 border-b border-slate-900/10 dark:border-white/10 pb-2">Sugerencias</h3>
              <div className="space-y-3.5">
                {[
                  { name: 'Sarah Miller', lang: 'Inglés C1', xp: '15.4k' },
                  { name: 'Hiroki Tanaka', lang: 'Español B2', xp: '12.1k' }
                ].map((person, i) => (
                  <div key={i} className="flex items-center justify-between group">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 border border-slate-900/10 dark:border-white/10 flex items-center justify-center font-black text-[10px] text-sky-500">
                        {person.name?.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">{person.name}</p>
                        <p className="label-micro text-slate-400">{person.lang} · {person.xp} XP</p>
                      </div>
                    </div>
                    <button className="h-6 w-6 border border-slate-900/10 dark:border-white/10 flex items-center justify-center text-slate-400 hover:text-sky-500 transition-colors">
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
              <button className="label-micro text-sky-500 hover:underline flex items-center gap-1 pt-2">
                Ver todo <ArrowRight className="h-3 w-3" />
              </button>
            </div>

            <div className="p-4 border border-slate-900/10 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.01]">
              <h3 className="label-caps text-slate-950 dark:text-white mb-2">Desafío Semanal</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal mb-3">Completa 5 lecciones perfectas para reclamar una insignia especial.</p>
              <div className="space-y-1">
                <div className="flex justify-between label-micro">
                  <span>Progreso</span>
                  <span>3/5</span>
                </div>
                <div className="h-1 w-full bg-slate-900/10 dark:bg-white/10">
                  <div className="h-full w-[60%] bg-sky-500" />
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
