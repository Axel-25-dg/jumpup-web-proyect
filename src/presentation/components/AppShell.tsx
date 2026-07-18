import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  LogOut,
  Package,
  ShoppingBag,
  ShoppingCart,
  User,
  BookOpen,
  MessageSquare,
  Users,
  Award,
  Trophy,
  Sparkles,
  Search,
  PanelRight,
  FolderOpen,
  Mail
} from 'lucide-react'
import { useAuthStore } from '@/presentation/store/auth.store'
import { useCartStore } from '@/presentation/store/cart.store'
import { Button } from '@/presentation/components/ui/button'
import { Badge } from '@/presentation/components/ui/badge'
import { Avatar, AvatarFallback } from '@/presentation/components/ui/avatar'
import { useState, useRef, useEffect } from 'react'
import { cn } from '@/presentation/utils/cn'

function getInitials(username?: string): string {
  if (!username) return 'U'
  return username.slice(0, 2).toUpperCase()
}

export default function AppShell() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const cart = useCartStore((s) => s.cart)

  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const cartItemCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false)
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  async function handleLogout() {
    await logout()
    setIsUserMenuOpen(false)
    navigate('/', { replace: true })
  }

  const getNavItems = () => {
    if (!user) {
      return []
    }
    
    const role = user.role?.toLowerCase() || ''
    
    if (role === 'teacher' || role === 'profesor') {
      return [
        { to: '/teacher', label: 'Panel Profesor', icon: LayoutDashboard, protected: true },
        { to: '/teacher/courses', label: 'Mis Cursos', icon: BookOpen, protected: true },
        { to: '/teacher/classrooms', label: 'Mis Aulas', icon: Users, protected: true },
        { to: '/teacher/resources', label: 'Recursos', icon: FolderOpen, protected: true },
        { to: '/forum', label: 'Comunidad', icon: MessageSquare, protected: true },
        { to: '/teacher/inbox', label: 'Mensajes', icon: Mail, protected: true },
        { to: '/teacher/profile', label: 'Mi Perfil', icon: User, protected: true }
      ]
    }
    if (role === 'admin' || role === 'administrador') {
      return [
        { to: '/admin', label: 'Panel Admin', icon: LayoutDashboard, protected: true },
        { to: '/admin/users', label: 'Usuarios', icon: Users, protected: true },
        { to: '/admin/categories', label: 'Categorías', icon: BookOpen, protected: true },
      ]
    }
    return [
      { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, protected: true },
      { to: '/courses', label: 'Mis Cursos', icon: BookOpen, protected: true },
      { to: '/chat', label: 'Tutor IA', icon: Sparkles, protected: true },
      { to: '/forum', label: 'Comunidad', icon: MessageSquare, protected: true },
      { to: '/social', label: 'Social', icon: Users, protected: true },
      { to: '/classrooms', label: 'Aulas Vivas', icon: Users, protected: true },
      { to: '/certificates', label: 'Certificados', icon: Award, protected: true },
    ]
  }

  const navItems = getNavItems()

  const filteredNavItems = navItems.filter(item => !item.protected || user)

  const getDisplayRole = () => {
    if (!user) return ''
    const r = user.role?.toLowerCase() || ''
    if (r === 'admin' || r === 'administrador') return 'Administrador'
    if (r === 'teacher' || r === 'profesor') return 'Profesor'
    return 'Estudiante Pro'
  }
  
  const displayRole = getDisplayRole()

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* --- TOP BAR --- */}
      <header className={cn(
        "fixed top-0 z-[70] w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md transition-all duration-300",
        user ? (isSidebarExpanded ? "pr-64" : "pr-16") : "pr-0"
      )}>
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="bg-sky-500 p-1.5 rounded-xl shadow-lg shadow-sky-200 group-hover:scale-110 transition-all duration-300">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
                JumpUp
              </span>
            </Link>

            {user && (
              <div className="hidden md:flex relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500 group-focus-within:text-sky-500 transition-colors" />
                <input
                  type="text"
                  placeholder="Buscar recursos..."
                  className="h-10 w-64 pl-10 pr-4 rounded-xl bg-slate-100 dark:bg-slate-900 border-none text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500/20 transition-all"
                />
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            {user && (
              <>
                <Badge variant="outline" className="hidden sm:flex bg-amber-50 text-amber-600 border-amber-200 gap-1.5 font-bold py-1.5 px-3 rounded-full">
                  <Trophy className="h-3.5 w-3.5" />
                  <span>1,240 XP</span>
                </Badge>
              </>
            )}

            {user ? (
              <div className="relative z-[100]" ref={menuRef}>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsUserMenuOpen(!isUserMenuOpen)
                  }}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-transparent hover:border-sky-200 dark:hover:border-sky-800 transition-all p-0 shadow-sm bg-slate-100 dark:bg-slate-800 overflow-hidden cursor-pointer active:scale-95"
                >
                  <Avatar className="h-full w-full rounded-none">
                    <AvatarFallback className="bg-gradient-to-br from-sky-500 to-blue-600 text-white font-black text-xs">
                      {getInitials(user.username)}
                    </AvatarFallback>
                  </Avatar>
                </button>

                {/* Perfil Dropdown Manual */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-100 dark:border-slate-800 p-2 z-[110]">
                    <div className="p-3">
                      <p className="text-sm font-black text-slate-900 dark:text-white">{user.username}</p>
                      <p className="truncate text-xs text-slate-500 dark:text-slate-400 font-bold">{user.email}</p>
                    </div>
                    <div className="h-px bg-slate-100 dark:bg-slate-800 my-2" />
                    <Link
                      to="/profile"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors"
                    >
                      <div className="bg-slate-100 p-1.5 rounded-lg"><User className="h-4 w-4" /></div>
                      <span className="font-bold text-sm text-slate-700">Mi Perfil</span>
                    </Link>
                    <div className="h-px bg-slate-100 my-2" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 w-full p-2.5 rounded-xl hover:bg-rose-50 text-rose-600 transition-colors text-left"
                    >
                      <div className="bg-rose-100 p-1.5 rounded-lg"><LogOut className="h-4 w-4" /></div>
                      <span className="font-bold text-sm">Cerrar Sesión</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" asChild size="sm" className="hidden sm:flex font-black text-slate-600">
                  <Link to="/login">Entrar</Link>
                </Button>
                <Button asChild size="sm" className="bg-sky-600 hover:bg-sky-700 text-white font-black rounded-xl shadow-lg shadow-sky-200 px-6">
                  <Link to="/register">Empezar</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* --- SIDEBAR (RIGHT - GEMINI STYLE) --- */}
      {user && (
        <aside
          className={cn(
            "fixed right-0 top-0 h-screen bg-white dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800 z-[60] transition-all duration-300 ease-in-out shadow-2xl flex flex-col pt-4",
            isSidebarExpanded ? "w-64" : "w-16"
          )}
        >
          {/* Header del Sidebar con Toggle */}
          <div className="flex items-center justify-end px-4 mb-6 mt-16">
            <button
              onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-xl text-slate-500 dark:text-slate-400 transition-colors"
            >
              <PanelRight size={20} className={cn("transition-transform", isSidebarExpanded && "rotate-180")} />
            </button>
          </div>

          <nav className="flex-1 px-2 space-y-1 overflow-y-auto no-scrollbar overflow-x-hidden">
            {filteredNavItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => cn(
                  "flex items-center gap-4 p-3 rounded-xl transition-all duration-200 group relative",
                  isActive
                    ? "bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400 shadow-sm"
                    : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white"
                )}
              >
                {({ isActive }) => (
                  <>
                    <div className={cn(
                      "min-w-[24px] flex justify-center transition-transform duration-300",
                      "group-hover:scale-110"
                    )}>
                      <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                    </div>

                    <span className={cn(
                      "font-bold text-sm whitespace-nowrap transition-all duration-300",
                      isSidebarExpanded ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4 pointer-events-none"
                    )}>
                      {item.label}
                    </span>

                    {/* Tooltip for collapsed state */}
                    {!isSidebarExpanded && (
                      <div className="absolute right-full mr-4 px-3 py-1 bg-slate-900 text-white text-[10px] font-black rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none uppercase tracking-widest whitespace-nowrap z-[70]">
                        {item.label}
                      </div>
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Sidebar Footer */}
          <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
             <div className={cn(
               "flex items-center gap-3 transition-all duration-300",
               !isSidebarExpanded && "justify-center"
             )}>
                <div className="h-10 w-10 rounded-xl bg-sky-500 shrink-0 flex items-center justify-center text-white font-black text-xs shadow-lg shadow-sky-200">
                  {getInitials(user.username)}
                </div>
                <div className={cn(
                  "flex flex-col transition-opacity duration-300 overflow-hidden",
                  isSidebarExpanded ? "opacity-100 w-full" : "opacity-0 w-0"
                )}>
                  <span className="text-xs font-black text-slate-900 dark:text-white truncate">{user.username}</span>
                  <span className="text-[10px] font-bold text-sky-600 dark:text-sky-400 uppercase tracking-tighter">{displayRole}</span>
                </div>
             </div>
          </div>
        </aside>
      )}

      {/* --- MAIN CONTENT --- */}
      <main className={cn(
        "flex-1 pt-16 transition-all duration-300",
        user ? (isSidebarExpanded ? "pr-64" : "pr-16") : "pr-0"
      )}>
        <div className="p-6 md:p-10 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
