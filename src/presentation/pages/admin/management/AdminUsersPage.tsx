import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Users,
  Plus,
  Search,
  MoreVertical,
  Edit2,
  Trash2,
  UserCheck,
  UserX,
  AlertCircle,
  ArrowLeft,
} from 'lucide-react'
import { Button } from '@/presentation/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/presentation/components/ui/dropdown-menu'
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
import { getAdminUsersUseCase, toggleUserActiveUseCase, deleteAdminUserUseCase } from '@/infrastructure/factories/admin.factory'
import type { AdminUser } from '@/domain/entities/admin-user.entity'

export default function AdminUsersPage() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'teacher' | 'student'>('all')
  const [users, setUsers] = useState<AdminUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [userToDelete, setUserToDelete] = useState<AdminUser | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [toggleLoading, setToggleLoading] = useState<number | null>(null)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const result = await getAdminUsersUseCase.execute()
        setUsers(result.results || [])
      } catch (error) {
        console.error('Error fetching users:', error)
        toast.error('No se pudieron cargar los usuarios')
      } finally {
        setIsLoading(false)
      }
    }
    fetchUsers()
  }, [])

  const handleToggleActive = async (user: AdminUser) => {
    setToggleLoading(user.id)
    try {
      const updated = await toggleUserActiveUseCase.execute(user.id, !user.is_active)
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, is_active: !u.is_active } : u))
      toast.success(`Usuario ${updated.is_active ? 'activado' : 'bloqueado'} con éxito`)
    } catch (error) {
      console.error('Error toggling user status:', error)
      toast.error('Error al cambiar el estado del usuario')
    } finally {
      setToggleLoading(null)
    }
  }

  const handleDeleteUser = async () => {
    if (!userToDelete) return
    setIsDeleting(true)
    try {
      await deleteAdminUserUseCase.execute(userToDelete.id)
      setUsers(prev => prev.filter(u => u.id !== userToDelete.id))
      toast.success(`Usuario "${userToDelete.email}" eliminado con éxito`)
    } catch (error) {
      console.error('Error deleting user:', error)
      toast.error('Ocurrió un error al eliminar el usuario')
    } finally {
      setIsDeleting(false)
      setUserToDelete(null)
    }
  }

  const getRoleBadge = (role: { id: number; name: string } | null) => {
    if (!role) return { label: 'Sin rol', color: 'bg-slate-100 text-slate-700' }
    switch (role.name) {
      case 'admin':
        return { label: 'Admin', color: 'bg-purple-100 text-purple-700' }
      case 'teacher':
        return { label: 'Profesor', color: 'bg-sky-100 text-sky-700' }
      default:
        return { label: 'Estudiante', color: 'bg-emerald-100 text-emerald-700' }
    }
  }

  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.username.toLowerCase().includes(searchTerm.toLowerCase())
    if (!matchesSearch) return false
    if (roleFilter !== 'all') {
      const roleName = u.role?.name || ''
      if (roleFilter === 'admin' && roleName !== 'admin') return false
      if (roleFilter === 'teacher' && roleName !== 'teacher') return false
      if (roleFilter === 'student' && roleName !== 'student' && roleName !== '') return false
    }
    return true
  })

  return (
    <div className="animate-in fade-in duration-500">
      {/* HERO */}
      <section className="border-b border-slate-900/10 dark:border-white/10 px-8 md:px-12 py-14 md:py-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" asChild className="-ml-2 rounded-none hover:bg-slate-100 dark:hover:bg-white/5">
                <Link to="/admin"><ArrowLeft className="h-4 w-4" /></Link>
              </Button>
              <div className="chip">
                <Users className="h-3.5 w-3.5 text-sky-500" />
                Sistemas
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white uppercase">
              Control de <span className="text-sky-500">Usuarios</span>.
            </h1>
            <p className="text-base text-slate-500 dark:text-slate-400 max-w-lg font-medium">
              Gestión centralizada de identidades, roles y estados de acceso a la plataforma.
            </p>
          </div>
          <Button
            onClick={() => navigate('/admin/users/new')}
            className="rounded-none bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold uppercase text-[11px] tracking-[0.2em] px-8 py-6 h-auto hover:bg-sky-500 dark:hover:bg-sky-500 hover:text-white transition-all"
          >
            <Plus className="h-4 w-4 mr-2" /> Crear Usuario
          </Button>
        </div>
      </section>

      {/* FILTERS & SEARCH */}
      <div className="border-b border-slate-900/10 dark:border-white/10 p-6 md:p-8 flex flex-col lg:flex-row gap-6 justify-between items-center bg-white dark:bg-transparent">
        <div className="relative w-full lg:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            placeholder="BUSCAR POR EMAIL O NOMBRE DE USUARIO..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border border-slate-900/10 dark:border-white/10 bg-transparent py-3.5 pl-12 pr-4 text-[11px] font-bold uppercase tracking-widest outline-none focus:border-sky-500 transition-colors"
          />
        </div>
        <div className="flex gap-px bg-slate-900/10 dark:bg-white/10 border border-slate-900/10 dark:border-white/10 overflow-hidden">
          {(['all', 'student', 'teacher', 'admin'] as const).map(role => (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              className={`px-6 py-3 label-micro transition-all ${
                roleFilter === role
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'bg-white dark:bg-[#0a0a0b] text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5'
              }`}
            >
              {role === 'all' ? 'Todos' : role === 'admin' ? 'Admin' : role === 'teacher' ? 'Docentes' : 'Alumnos'}
            </button>
          ))}
        </div>
      </div>

      {/* DATA TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1000px] text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-900/10 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02]">
              <th className="px-8 py-5 label-caps text-slate-400">Identidad / Cuenta</th>
              <th className="px-8 py-5 label-caps text-slate-400">Rol</th>
              <th className="px-8 py-5 label-caps text-slate-400">Estado</th>
              <th className="px-8 py-5 label-caps text-slate-400 text-right">Acciones de Gestión</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-900/5 dark:divide-white/5">
            {isLoading ? (
              [1, 2, 3, 4].map(i => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={4} className="px-8 py-8"><div className="h-4 bg-slate-100 dark:bg-white/5 w-full" /></td>
                </tr>
              ))
            ) : filteredUsers.length > 0 ? (
              filteredUsers.map((user) => {
                const roleBadge = getRoleBadge(user.role)
                return (
                  <tr key={user.id} className="card-hover group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-5">
                        <div className="h-12 w-12 shrink-0 flex items-center justify-center border border-slate-900/10 dark:border-white/10 font-black text-xs text-sky-500 bg-slate-50 dark:bg-white/5 uppercase">
                          {(user.first_name || user.username).substring(0, 2)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight group-hover:text-sky-500 transition-colors">
                            {user.first_name || user.last_name ? `${user.first_name} ${user.last_name}`.trim() : user.username}
                          </p>
                          <p className="label-micro text-slate-400 font-mono mt-0.5">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`label-micro px-3 py-1 border ${roleBadge.color.includes('purple') ? 'border-purple-500/20 text-purple-600 bg-purple-500/5' : roleBadge.color.includes('sky') ? 'border-sky-500/20 text-sky-600 bg-sky-500/5' : 'border-emerald-500/20 text-emerald-600 bg-emerald-500/5'}`}>
                        {roleBadge.label}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`label-micro flex items-center gap-2 ${user.is_active ? 'text-emerald-600' : 'text-rose-500'}`}>
                        <span className={`h-1.5 w-1.5 ${user.is_active ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                        {user.is_active ? 'ACTIVO' : 'BLOQUEADO'}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-none border-slate-900/10 hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-slate-900 transition-all font-bold text-[10px] uppercase tracking-widest h-9"
                          onClick={() => navigate(`/admin/users/${user.id}/edit`)}
                        >
                          <Edit2 className="h-3.5 w-3.5 mr-2" /> Editar
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="icon" className="rounded-none border-slate-900/10 h-9 w-9">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="rounded-none border-slate-900/10 dark:border-white/10">
                            <DropdownMenuItem onSelect={() => navigate(`/admin/users/${user.id}/edit`)} className="label-micro py-3">
                              <Edit2 className="h-4 w-4 mr-2" /> Ver Expediente
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => handleToggleActive(user)} disabled={toggleLoading === user.id} className="label-micro py-3">
                              {user.is_active ? <UserX className="h-4 w-4 mr-2" /> : <UserCheck className="h-4 w-4 mr-2" />}
                              {user.is_active ? 'Restringir Acceso' : 'Habilitar Acceso'}
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => setUserToDelete(user)} className="label-micro py-3 text-rose-500 focus:text-rose-500">
                              <Trash2 className="h-4 w-4 mr-2" /> Eliminar Registro
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                )
              })
            ) : (
              <tr>
                <td colSpan={4} className="py-24 text-center">
                  <div className="flex h-16 w-16 items-center justify-center border border-slate-900/10 dark:border-white/10 mx-auto mb-6">
                    <Users className="h-6 w-6 text-slate-300" />
                  </div>
                  <p className="label-caps text-slate-400">No se encontraron registros de usuarios</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Dialog - Editorial */}
      <AlertDialog open={!!userToDelete} onOpenChange={(open) => !open && !isDeleting && setUserToDelete(null)}>
        <AlertDialogContent className="rounded-none border-slate-900/10">
          <AlertDialogHeader>
            <div className="flex h-16 w-16 items-center justify-center border border-rose-500/20 bg-rose-500/5 mx-auto mb-6">
              <AlertCircle className="h-8 w-8 text-rose-500" />
            </div>
            <AlertDialogTitle className="text-center text-2xl font-black uppercase tracking-tight">Eliminar Registro</AlertDialogTitle>
            <AlertDialogDescription className="text-center text-sm font-medium py-4">
              Esta operación es irreversible. Se eliminará permanentemente la cuenta vinculada al correo <span className="text-slate-900 dark:text-white font-bold">{userToDelete?.email}</span> y todos sus datos asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center gap-3 pt-4">
            <AlertDialogCancel className="rounded-none font-bold uppercase text-[10px] tracking-[0.2em]">Cancelar</AlertDialogCancel>
            <AlertDialogAction disabled={isDeleting} onClick={handleDeleteUser} className="rounded-none bg-rose-600 hover:bg-rose-700 font-bold uppercase text-[10px] tracking-[0.2em]">
              {isDeleting ? 'Eliminando...' : 'Confirmar Eliminación'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}