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
  ArrowRight,
  ArrowLeft,
} from 'lucide-react'
import { Card, CardContent } from '@/presentation/components/ui/card'
import { Button } from '@/presentation/components/ui/button'
import { Input } from '@/presentation/components/ui/input'
import { Badge } from '@/presentation/components/ui/badge'
import { Skeleton } from '@/presentation/components/ui/skeleton'
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
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild className="rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">
            <Link to="/admin"><ArrowLeft className="h-5 w-5" /></Link>
          </Button>
          <div>
            <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">Gestión de Usuarios</h1>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-1">Administra todos los usuarios de la plataforma</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => navigate('/admin/users/new')}
            className="h-12 rounded-2xl font-black bg-sky-600 hover:bg-sky-700 shadow-xl shadow-sky-500/20 px-6 group"
          >
            <Plus className="mr-2 h-5 w-5" /> Crear Usuario
            <ArrowRight className="ml-2 h-4 w-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
          </Button>
        </div>
      </div>

      {/* Users List */}
      <Card className="border-none shadow-2xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50/50 dark:bg-slate-800/20">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 dark:text-slate-500" />
            <Input
              placeholder="Buscar por email o usuario..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-12 pl-12 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
          </div>
          <div className="flex gap-2">
            {(['all', 'student', 'teacher', 'admin'] as const).map(role => (
              <Button
                key={role}
                onClick={() => setRoleFilter(role)}
                variant={roleFilter === role ? 'default' : 'outline'}
                className={`h-12 rounded-xl font-bold ${
                  roleFilter === role
                    ? 'bg-sky-600 hover:bg-sky-700'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                {role === 'all' ? 'Todos' : role === 'admin' ? 'Admin' : role === 'teacher' ? 'Profesores' : 'Estudiantes'}
              </Button>
            ))}
          </div>
        </div>
        <CardContent className="p-0">
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {isLoading ? (
              <div className="p-6 space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex gap-6 items-center">
                    <Skeleton className="h-14 w-14 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-5 w-48" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredUsers.length > 0 ? (
              filteredUsers.map((user) => {
                const roleBadge = getRoleBadge(user.role)
                return (
                  <div key={user.id} className="p-6 flex flex-col md:flex-row items-center gap-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                    <div className="h-14 w-14 rounded-full overflow-hidden shrink-0 flex items-center justify-center bg-gradient-to-br from-sky-400 to-indigo-500 text-white font-black text-xl shadow-lg">
                      {(user.first_name || user.username).substring(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0 text-center md:text-left">
                      <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-1">
                        <Badge className={roleBadge.color}>{roleBadge.label}</Badge>
                        <Badge className={user.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}>
                          {user.is_active ? 'Activo' : 'Bloqueado'}
                        </Badge>
                      </div>
                      <h3 className="text-xl font-black text-slate-900 dark:text-white truncate">
                        {user.first_name || user.last_name ? `${user.first_name} ${user.last_name}`.trim() : user.username}
                      </h3>
                      <p className="text-sm font-bold text-slate-500 dark:text-slate-400">{user.email}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-10 rounded-xl font-bold bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
                        onClick={() => navigate(`/admin/users/${user.id}/edit`)}
                      >
                        <Edit2 className="mr-2 h-4 w-4" /> Editar
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800">
                            <MoreVertical className="h-5 w-5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-48 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 p-2">
                          <DropdownMenuItem
                            onSelect={() => navigate(`/admin/users/${user.id}/edit`)}
                            className="font-bold py-3 cursor-pointer text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl"
                          >
                            <Edit2 className="mr-2 h-4 w-4" /> Editar Usuario
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onSelect={() => handleToggleActive(user)}
                            disabled={toggleLoading === user.id}
                            className="font-bold py-3 cursor-pointer text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl"
                          >
                            {user.is_active ? <UserX className="mr-2 h-4 w-4" /> : <UserCheck className="mr-2 h-4 w-4" />}
                            {user.is_active ? 'Bloquear' : 'Desbloquear'}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onSelect={() => setUserToDelete(user)}
                            className="font-bold py-3 text-red-600 dark:text-red-400 cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl"
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="py-20 text-center">
                <Users className="h-12 w-12 text-slate-200 dark:text-slate-700 mx-auto mb-4" />
                <h3 className="text-lg font-black text-slate-900 dark:text-white">No se encontraron usuarios</h3>
                <p className="text-slate-500 font-medium">No hay usuarios que coincidan con tu búsqueda.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Delete Dialog */}
      <AlertDialog open={!!userToDelete} onOpenChange={(open) => !open && !isDeleting && setUserToDelete(null)}>
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader>
            <div className="mx-auto bg-red-100 dark:bg-red-900/30 p-3 rounded-full w-fit mb-4">
              <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <AlertDialogTitle className="text-center text-2xl font-black">¿Eliminar usuario?</AlertDialogTitle>
            <AlertDialogDescription className="text-center font-medium">
              Esta acción no se puede deshacer. Se eliminará permanentemente el usuario{' '}
              <span className="font-bold text-slate-900 dark:text-white">"{userToDelete?.email}"</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center gap-3 mt-6">
            <AlertDialogCancel disabled={isDeleting} className="rounded-xl h-12 px-6 font-bold">Cancelar</AlertDialogCancel>
            <AlertDialogAction disabled={isDeleting} onClick={handleDeleteUser} className="bg-red-600 hover:bg-red-700 text-white rounded-xl h-12 px-6 font-bold shadow-lg shadow-red-500/20">
              {isDeleting ? 'Eliminando...' : 'Sí, eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}