import { Link, NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  LogOut,
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
  Mail,
  Sun,
  Moon,
  X,
  Menu,
  ArrowRight,
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
  const location = useLocation()
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const cart = useCartStore((s) => s.cart)

  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const menuRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Focus search input when modal opens
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [isSearchOpen])

  // Close search on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsSearchOpen(false)
        setIsMobileMenuOpen(false)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Prevent body scroll when modals open
  useEffect(() => {
    if (isSearchOpen || isMobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isSearchOpen, isMobileMenuOpen])

  const handleLogout = () => {
    logout()
    navigate('/')
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

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
  }

  const isPublicLanding = ['/', '/story', '/tech', '/team', '/features'].includes(location.pathname)

  const publicNavLinks = [
    { label: 'Inicio', to: '/' },
    { label: 'Historia', to: '/story' },
    { label: 'Tecnología', to: '/tech' },
    { label: 'Equipo', to: '/team' },
    { label: 'Móvil', to: '/features' },
  ]

  const quickSearchLinks = [
    { label: 'Cursos de Inglés', to: '/catalog' },
    { label: 'Comunidad', to: '/forum' },
    { label: 'Nuestra Historia', to: '/story' },
    { label: 'Equipo', to: '/team' },
  ]

  // ─── Search Overlay Modal ──────────────────────────────────────────────────
  const SearchModal = () => (
    <div
      className={cn(
        'fixed inset-0 z-[200] flex items-start justify-center pt-24 px-4',
        'transition-all duration-300',
        isSearchOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      )}
      onClick={() => setIsSearchOpen(false)}
    >
      {/* Backdrop */}
      <div className={cn(
        'absolute inset-0 backdrop-blur-sm transition-colors duration-300',
        theme === 'dark' ? 'bg-black/70' : 'bg-neutral-900/40'
      )} />

      {/* Search Box */}
      <div
        className={cn(
          'relative w-full max-w-2xl rounded-none shadow-2xl transition-all duration-300',
          isSearchOpen ? 'translate-y-0' : '-translate-y-4',
          theme === 'dark'
            ? 'bg-neutral-900 border border-neutral-800'
            : 'bg-white border border-neutral-200'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Input row */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-neutral-800/50">
          <Search className="h-5 w-5 text-sky-500 shrink-0" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar cursos, lecciones, páginas..."
            className={cn(
              'flex-1 bg-transparent text-base font-medium outline-none placeholder:font-normal',
              theme === 'dark'
                ? 'text-neutral-100 placeholder:text-neutral-600'
                : 'text-neutral-900 placeholder:text-neutral-400'
            )}
          />
          <button
            onClick={() => setIsSearchOpen(false)}
            className={cn(
              'p-1 transition-colors cursor-pointer',
              theme === 'dark'
                ? 'text-neutral-500 hover:text-neutral-200'
                : 'text-neutral-400 hover:text-neutral-700'
            )}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Quick links */}
        <div className="p-5">
          <p className={cn(
            'text-[10px] font-semibold uppercase tracking-[0.2em] mb-3',
            theme === 'dark' ? 'text-neutral-600' : 'text-neutral-400'
          )}>
            Accesos rápidos
          </p>
          <div className="space-y-1">
            {quickSearchLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setIsSearchOpen(false)}
                className={cn(
                  'flex items-center justify-between px-3 py-2.5 group transition-colors',
                  theme === 'dark'
                    ? 'hover:bg-neutral-800 text-neutral-300 hover:text-white'
                    : 'hover:bg-neutral-50 text-neutral-700 hover:text-neutral-900'
                )}
              >
                <span className="text-sm font-medium">{link.label}</span>
                <ArrowRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-sky-500" />
              </Link>
            ))}
          </div>
        </div>

        {/* Bottom hint */}
        <div className={cn(
          'px-5 py-3 border-t flex items-center gap-4',
          theme === 'dark' ? 'border-neutral-800' : 'border-neutral-100'
        )}>
          <span className={cn(
            'text-[10px] font-semibold uppercase tracking-widest',
            theme === 'dark' ? 'text-neutral-700' : 'text-neutral-400'
          )}>
            Esc para cerrar
          </span>
        </div>
      </div>
    </div>
  )

  // ─── Mobile Menu Overlay ───────────────────────────────────────────────────
  const MobileMenu = () => (
    <div
      className={cn(
        'fixed inset-0 z-[150] transition-all duration-300',
        isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      )}
    >
      <div
        className={cn(
          'absolute inset-0',
          theme === 'dark' ? 'bg-black/60' : 'bg-neutral-900/30'
        )}
        onClick={() => setIsMobileMenuOpen(false)}
      />
      <div className={cn(
        'absolute top-0 left-0 h-full w-[280px] flex flex-col transition-transform duration-300',
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full',
        theme === 'dark'
          ? 'bg-[#0a0a0b] border-r border-neutral-800'
          : 'bg-white border-r border-neutral-200'
      )}>
        {/* Header */}
        <div className={cn(
          'flex items-center justify-between px-6 h-16 border-b',
          theme === 'dark' ? 'border-neutral-800' : 'border-neutral-200'
        )}>
          <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2">
            <div className="bg-sky-500 p-1.5 rounded-none">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-semibold tracking-tight">JumpUp</span>
          </Link>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className={cn(
              'p-2 cursor-pointer transition-colors',
              theme === 'dark' ? 'text-neutral-400 hover:text-white' : 'text-neutral-500 hover:text-neutral-900'
            )}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {publicNavLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) => cn(
                'flex items-center px-3 py-3 text-sm font-semibold transition-colors',
                isActive
                  ? 'text-sky-500'
                  : theme === 'dark'
                    ? 'text-neutral-400 hover:text-white'
                    : 'text-neutral-500 hover:text-neutral-900'
              )}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Auth buttons */}
        <div className={cn(
          'p-4 border-t space-y-3',
          theme === 'dark' ? 'border-neutral-800' : 'border-neutral-200'
        )}>
          <Link
            to="/login"
            onClick={() => setIsMobileMenuOpen(false)}
            className={cn(
              'flex items-center justify-center w-full py-3 text-sm font-semibold border transition-colors',
              theme === 'dark'
                ? 'border-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-600'
                : 'border-neutral-200 text-neutral-600 hover:text-neutral-900'
            )}
          >
            Entrar
          </Link>
          <Link
            to="/register"
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center justify-center w-full py-3 text-sm font-semibold bg-sky-500 hover:bg-sky-600 text-white transition-colors"
          >
            Empezar gratis
          </Link>
        </div>
      </div>
    </div>
  )

  // ─── Public Header ─────────────────────────────────────────────────────────
  const renderPublicHeader = () => (
    <header className={cn(
      'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
      theme === 'dark'
        ? 'bg-[#0a0a0b]/80 border-b border-neutral-800/60 text-neutral-100'
        : 'bg-white/80 border-b border-neutral-200/60 text-neutral-900',
      'backdrop-blur-md'
    )}>
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group shrink-0">
          <div className={cn(
            'h-8 w-8 grid place-items-center border transition-colors',
            theme === 'dark'
              ? 'border-neutral-700 group-hover:border-sky-500/60'
              : 'border-neutral-200 group-hover:border-sky-500/40',
            'group-hover:bg-sky-500/10'
          )}>
            <Sparkles className="h-4 w-4 text-sky-500" />
          </div>
          <span className={cn(
            'text-lg font-semibold tracking-tight',
            theme === 'dark' ? 'text-neutral-100' : 'text-neutral-900'
          )}>
            Jump<span className="text-sky-500">Up</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          {publicNavLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => cn(
                'relative py-1 transition-colors cursor-pointer group',
                isActive
                  ? 'text-sky-500'
                  : theme === 'dark'
                    ? 'text-neutral-400 hover:text-neutral-100'
                    : 'text-neutral-500 hover:text-neutral-900'
              )}
            >
              {link.label}
              <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-sky-500 transition-all duration-300 group-hover:w-full" />
            </NavLink>
          ))}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {/* Search button */}
          <button
            id="public-search-btn"
            onClick={() => setIsSearchOpen(true)}
            aria-label="Abrir buscador"
            className={cn(
              'flex items-center gap-2 px-3 py-2 text-sm font-medium border transition-all duration-200 cursor-pointer group',
              theme === 'dark'
                ? 'border-neutral-800 text-neutral-500 hover:border-neutral-600 hover:text-neutral-200 bg-neutral-900/50'
                : 'border-neutral-200 text-neutral-500 hover:border-neutral-300 hover:text-neutral-700 bg-neutral-50'
            )}
          >
            <Search className="h-4 w-4 group-hover:text-sky-500 transition-colors" />
            <span className="hidden sm:inline tracking-wide text-xs">Buscar</span>
            <span className={cn(
              'hidden sm:inline text-[10px] font-semibold px-1.5 py-0.5 tracking-widest border',
              theme === 'dark'
                ? 'border-neutral-700 text-neutral-600'
                : 'border-neutral-200 text-neutral-400'
            )}>⌘K</span>
          </button>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Cambiar tema"
            className={cn(
              'p-2.5 border transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95',
              theme === 'dark'
                ? 'border-neutral-800 text-sky-400 hover:border-neutral-600 bg-neutral-900/50'
                : 'border-neutral-200 text-amber-500 hover:border-neutral-300 bg-neutral-50'
            )}
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          {/* Auth — desktop */}
          <div className="hidden md:flex items-center gap-2">
            <Link
              to="/login"
              className={cn(
                'px-4 py-2 text-sm font-semibold transition-colors',
                theme === 'dark'
                  ? 'text-neutral-400 hover:text-neutral-100'
                  : 'text-neutral-500 hover:text-neutral-900'
              )}
            >
              Entrar
            </Link>
            <Link
              to="/register"
              className="px-5 py-2 text-sm font-semibold bg-sky-500 hover:bg-sky-600 text-white transition-colors"
            >
              Empezar
            </Link>
          </div>

          {/* Hamburger — mobile */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Abrir menú"
            className={cn(
              'md:hidden p-2.5 border transition-colors cursor-pointer',
              theme === 'dark'
                ? 'border-neutral-800 text-neutral-400 hover:text-neutral-100'
                : 'border-neutral-200 text-neutral-500 hover:text-neutral-900'
            )}
          >
            <Menu className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  )

  // ─── Public Landing Layout ─────────────────────────────────────────────────
  if (isPublicLanding) {
    return (
      <div className={cn(
        'w-full min-h-screen transition-colors duration-300 font-sans overflow-x-hidden',
        'selection:bg-sky-500/20 selection:text-sky-400',
        theme === 'dark' ? 'bg-[#0a0a0b] text-neutral-100' : 'bg-[#f7f6f3] text-neutral-900'
      )}>
        {renderPublicHeader()}
        <SearchModal />
        <MobileMenu />
        <main className="w-full min-h-screen pt-16 flex flex-col">
          <Outlet context={{ theme }} />
        </main>
      </div>
    )
  }

  // ─── Protected Sidebar/Topbar Layout ──────────────────────────────────────
  return (
    <div className={cn("flex min-h-screen", theme === 'dark' ? "bg-slate-950" : "bg-slate-50")}>
      {/* TOP BAR */}
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
                  className={cn("h-10 w-64 pl-10 pr-4 rounded-xl border-none text-sm font-medium focus:ring-2 focus:ring-sky-500/20 transition-all outline-none", theme === 'dark' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-900')}
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

      {/* SIDEBAR */}
      {user && (
        <aside
          className={cn(
            "fixed right-0 top-0 h-screen bg-white dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800 z-[60] transition-all duration-300 ease-in-out shadow-2xl flex flex-col pt-4",
            isSidebarExpanded ? "w-64" : "w-16"
          )}
        >
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

      {/* MAIN CONTENT */}
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

