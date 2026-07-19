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
  PanelLeft,
  FolderOpen,
  Sun,
  Moon,
  X,
  Menu,
  ArrowRight,
  Tags,
  Bell,
  ShoppingBag,
  Receipt,
  Video,
  Radio,
} from 'lucide-react'
import { useAuthStore } from '@/presentation/store/auth.store'

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
  

  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const menuRef = useRef<HTMLDivElement>(null)
  const notificationRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Sync theme class to documentElement
  useEffect(() => {
    const root = window.document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [theme])

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false)
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false)
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
        { to: '/teacher/classrooms', label: 'Mis Aulas', icon: Radio, protected: true },
        { to: '/teacher/resources', label: 'Recursos', icon: FolderOpen, protected: true },
        { to: '/forum', label: 'Comunidad', icon: MessageSquare, protected: true },
        { to: '/teacher/profile', label: 'Mi Perfil', icon: User, protected: true }
      ]
    }
    if (role === 'admin' || role === 'administrador') {
      return [
        { to: '/admin', label: 'Panel de Control', icon: LayoutDashboard, protected: true },
        { to: '/admin/management/courses', label: 'Cursos', icon: BookOpen, protected: true },
        { to: '/admin/management/modules', label: 'Módulos', icon: BookOpen, protected: true },
        { to: '/admin/management/lessons', label: 'Lecciones', icon: BookOpen, protected: true },
        { to: '/admin/management/exercises', label: 'Ejercicios', icon: BookOpen, protected: true },
        { to: '/admin/management/languages', label: 'Idiomas', icon: Tags, protected: true },
        { to: '/admin/users', label: 'Usuarios', icon: Users, protected: true },
        { to: '/admin/classrooms', label: 'Aulas', icon: Users, protected: true },
        { to: '/admin/certificates', label: 'Certificados', icon: Award, protected: true },
        { to: '/admin/categories', label: 'Categorías', icon: Tags, protected: true },
        { to: '/admin/announcements', label: 'Anuncios', icon: Bell, protected: true },
        { to: '/admin/forum-categories', label: 'Foro', icon: MessageSquare, protected: true },
        { to: '/admin/resources', label: 'Recursos', icon: FolderOpen, protected: true },
        { to: '/admin/catalogo', label: 'Catálogo', icon: ShoppingBag, protected: true },
        { to: '/admin/ordenes-compra', label: 'Órdenes', icon: Receipt, protected: true },
        { to: '/admin/live-sessions', label: 'Sesiones', icon: Video, protected: true },
      ]
    }
    return [
      { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, protected: true },
      { to: '/courses', label: 'Mis Cursos', icon: BookOpen, protected: true },
      { to: '/chat', label: 'Tutor IA', icon: Sparkles, protected: true },
      { to: '/forum', label: 'Comunidad', icon: MessageSquare, protected: true },
      { to: '/social', label: 'Social', icon: Users, protected: true },
      { to: '/classrooms', label: 'Aulas Vivas', icon: Radio, protected: true },
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
            <span translate="no" className="text-lg font-semibold tracking-tight">JumpUp</span>
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

        <Link to="/" className="flex items-center gap-2 group shrink-0 transition-opacity hover:opacity-90">
          <img
            src="/JumpUp_Logo.png"
            alt="JumpUp"
            className="h-8 w-8 object-contain"
          />
          <span
            translate="no"
            className={cn(
              'text-xl font-bold tracking-tight',
              theme === 'dark' ? 'text-white' : 'text-neutral-900'
            )}
          >
            <span className="text-sky-500">ump</span>Up
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

  const notifications = [
    {
      id: 1,
      title: "Nueva clase disponible",
      desc: "Tu profesor ha subido material en 'Inglés Intermedio B2'.",
      time: "Hace 10 min",
      read: false,
    },
    {
      id: 2,
      title: "Logro desbloqueado",
      desc: "Has obtenido la insignia 'Racha Imbatible' por 7 días seguidos.",
      time: "Hace 1 hora",
      read: false,
    },
    {
      id: 3,
      title: "Feedback de Ejercicio",
      desc: "El tutor IA analizó tu última pronunciación de voz.",
      time: "Hace 3 horas",
      read: true,
    }
  ]

  // ─── Protected Sidebar/Topbar Layout ───────────────────────────────────────────────
  return (
    <div className={cn("flex min-h-screen", theme === 'dark' ? "bg-[#0a0a0b]" : "bg-[#f7f6f3]")}>
      {/* TOP BAR */}
      <header className={cn(
        "fixed top-0 z-[50] w-full border-b border-slate-200 dark:border-white/[0.06] bg-white/80 dark:bg-[#0a0a0b]/80 backdrop-blur-md transition-all duration-300",
        user ? (isSidebarExpanded ? "pl-64" : "pl-16") : "pl-0"
      )}>
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-8">
            {/* Left side info (search or page title style) */}
            {user && (
              <div className="hidden md:flex relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500 group-focus-within:text-sky-500 transition-colors" />
                <input
                  type="text"
                  placeholder="Buscar recursos..."
                  className={cn("h-10 w-64 pl-10 pr-4 rounded-xl border-none text-sm font-medium focus:ring-2 focus:ring-sky-500/20 transition-all outline-none", theme === 'dark' ? 'bg-white/[0.04] text-white' : 'bg-slate-100 text-slate-900')}
                />
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            {user && (
              <>
                <Badge variant="outline" className="hidden sm:flex bg-amber-500/5 text-amber-600 dark:text-amber-400 border-amber-500/20 gap-1.5 font-bold py-1.5 px-3 rounded-full">
                  <Trophy className="h-3.5 w-3.5" />
                  <span>1,240 XP</span>
                </Badge>
              </>
            )}

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              aria-label="Cambiar tema"
              className={cn(
                'p-2.5 border rounded-xl transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95',
                theme === 'dark'
                  ? 'border-white/10 text-sky-400 hover:border-white/20 bg-white/[0.02]'
                  : 'border-slate-200 text-amber-500 hover:border-slate-300 bg-slate-50'
              )}
            >
              {theme === 'dark' ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
            </button>

            {/* Notifications Dropdown */}
            {user && (
              <div className="relative" ref={notificationRef}>
                <button
                  type="button"
                  onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 dark:border-white/10 hover:border-sky-500 dark:hover:border-sky-500/30 transition-all text-slate-500 dark:text-slate-400 hover:text-sky-500 cursor-pointer active:scale-95 bg-slate-50 dark:bg-white/[0.02] relative"
                >
                  <Bell size={18} />
                  <span className="absolute top-2.5 right-2.5 flex h-2 w-2 rounded-full bg-sky-500"></span>
                </button>

                {isNotificationOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-[#0e0e11] rounded-2xl shadow-xl border border-slate-200 dark:border-white/[0.06] p-2 z-[110]">
                    <div className="p-3 border-b border-slate-100 dark:border-white/[0.04]">
                      <p className="text-sm font-bold text-slate-900 dark:text-white">Notificaciones</p>
                    </div>
                    <div className="py-2 max-h-72 overflow-y-auto custom-scrollbar">
                      {notifications.map((notif) => (
                        <div
                          key={notif.id}
                          className={cn(
                            "p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors flex flex-col gap-1 cursor-pointer",
                            !notif.read && "bg-sky-500/[0.03] dark:bg-sky-500/[0.03]"
                          )}
                        >
                          <div className="flex justify-between items-start">
                            <p className="text-xs font-bold text-slate-900 dark:text-white">{notif.title}</p>
                            <span className="text-[9px] text-slate-400 dark:text-slate-500 font-semibold">{notif.time}</span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">{notif.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {user ? (
              <div className="relative z-[100]" ref={menuRef}>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsUserMenuOpen(!isUserMenuOpen)
                  }}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 dark:border-white/10 hover:border-sky-500 dark:hover:border-sky-500 transition-all p-0 shadow-xs bg-slate-100 dark:bg-white/[0.02] overflow-hidden cursor-pointer active:scale-95"
                >
                  <Avatar className="h-full w-full rounded-none">
                    <AvatarFallback className="bg-gradient-to-br from-sky-500 to-blue-600 text-white font-bold text-xs">
                      {getInitials(user.username)}
                    </AvatarFallback>
                  </Avatar>
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-[#0e0e11] rounded-2xl shadow-xl border border-slate-150 dark:border-white/[0.06] p-2 z-[110]">
                    <div className="p-3">
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{user.username}</p>
                      <p className="truncate text-xs text-slate-500 dark:text-slate-400 font-medium">{user.email}</p>
                    </div>
                    <div className="h-px bg-slate-100 dark:bg-white/[0.04] my-2" />
                    <Link
                      to="/profile"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors"
                    >
                      <div className="bg-slate-100 dark:bg-white/[0.04] p-1.5 rounded-lg"><User className="h-4 w-4" /></div>
                      <span className="font-bold text-sm text-slate-700 dark:text-slate-300">Mi Perfil</span>
                    </Link>
                    <div className="h-px bg-slate-100 dark:bg-white/[0.04] my-2" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 w-full p-2.5 rounded-xl hover:bg-rose-55 dark:hover:bg-rose-950/20 text-rose-600 transition-colors text-left cursor-pointer"
                    >
                      <div className="bg-rose-100 dark:bg-rose-950/30 p-1.5 rounded-lg"><LogOut className="h-4 w-4" /></div>
                      <span className="font-bold text-sm">Cerrar Sesión</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" asChild size="sm" className="hidden sm:flex font-bold text-slate-650">
                  <Link to="/login">Entrar</Link>
                </Button>
                <Button asChild size="sm" className="bg-sky-650 hover:bg-sky-700 text-white font-bold rounded-xl shadow-md shadow-sky-500/10 px-6">
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
            "fixed left-0 top-0 h-screen border-r z-[60] transition-all duration-300 ease-in-out flex flex-col pt-4",
            theme === 'dark'
              ? "bg-[#0a0a0b] border-white/10"
              : "bg-white border-slate-900/10",
            isSidebarExpanded ? "w-64" : "w-16"
          )}
        >
          {/* Logo container inside sidebar */}
          <div className="flex items-center gap-3 px-4 h-12 mb-6 shrink-0">
            <img
              src="/JumpUp_Logo.png"
              alt="JumpUp Logo"
              className="h-8 w-8 object-contain shrink-0"
            />
            {isSidebarExpanded && (
              <span translate="no" className="text-xl font-bold tracking-tight text-slate-900 dark:text-white select-none">
                <span className="text-sky-500">ump</span>Up
              </span>
            )}
          </div>

          <div className="flex items-center px-4 mb-6">
            {isSidebarExpanded ? (
              <button
                onClick={() => setIsSidebarExpanded(false)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-white/[0.04] rounded-xl text-slate-500 dark:text-slate-400 transition-colors cursor-pointer ml-auto"
              >
                <PanelLeft size={18} />
              </button>
            ) : (
              <button
                onClick={() => setIsSidebarExpanded(true)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-white/[0.04] rounded-xl text-slate-500 dark:text-slate-400 transition-colors cursor-pointer mx-auto"
              >
                <PanelRight size={18} />
              </button>
            )}
          </div>

          <nav className="flex-1 px-2 space-y-1 overflow-y-auto no-scrollbar overflow-x-hidden">
            {filteredNavItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => cn(
                  "flex items-center gap-4 p-3 transition-colors duration-150 group relative",
                  isActive
                    ? "text-sky-500"
                    : theme === 'dark'
                      ? "text-neutral-400 hover:text-neutral-100"
                      : "text-neutral-500 hover:text-neutral-900"
                )}
              >
                {({ isActive }) => (
                  <>
                    <div className={cn(
                      "min-w-[24px] flex justify-center",
                    )}>
                      <item.icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                    </div>

                    <span className={cn(
                      "text-sm font-semibold whitespace-nowrap transition-all duration-300",
                      isSidebarExpanded ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4 pointer-events-none"
                    )}>
                      {item.label}
                    </span>

                    {!isSidebarExpanded && (
                      <div className={cn(
                        "absolute left-full ml-4 px-3 py-1 text-white text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none uppercase tracking-wider whitespace-nowrap z-[70]",
                        theme === 'dark' ? 'bg-neutral-800' : 'bg-slate-900'
                      )}>
                        {item.label}
                      </div>
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Sidebar Footer */}
          <div className="p-3 border-t border-slate-100 dark:border-white/[0.04] bg-slate-50/50 dark:bg-white/[0.01]">
             <div className={cn(
               "flex items-center gap-3 transition-all duration-300",
               !isSidebarExpanded && "justify-center"
             )}>
                <div className="h-10 w-10 rounded-xl bg-sky-500 shrink-0 flex items-center justify-center text-white font-bold text-xs shadow-md shadow-sky-500/10">
                  {getInitials(user.username)}
                </div>
                <div className={cn(
                  "flex flex-col transition-opacity duration-300 overflow-hidden",
                  isSidebarExpanded ? "opacity-100 w-full" : "opacity-0 w-0"
                )}>
                  <span className="text-xs font-bold text-slate-900 dark:text-white truncate">{user.username}</span>
                  <span className="text-[10px] font-semibold text-sky-600 dark:text-sky-400 uppercase tracking-wider">{displayRole}</span>
                </div>
             </div>
          </div>
        </aside>
      )}

      {/* MAIN CONTENT */}
      <main className={cn(
        "flex-1 pt-16 transition-all duration-300",
        user ? (isSidebarExpanded ? "pl-64" : "pl-16") : "pl-0"
      )}>
        <div className="max-w-7xl mx-auto px-0">
          <Outlet context={{ theme }} />
        </div>
      </main>
    </div>
  )
}

