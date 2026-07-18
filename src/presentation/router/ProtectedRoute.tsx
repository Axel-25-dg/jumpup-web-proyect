import { type ReactNode } from 'react'
import { Navigate, useLocation, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/presentation/store/auth.store'
import type { UserRole } from '@/domain/entities/logged-user.entity'

interface ProtectedRouteProps {
  children?: ReactNode
  allowedRoles?: UserRole[]
  requireStaff?: boolean
}

export default function ProtectedRoute({
  children,
  allowedRoles,
  requireStaff = false
}: ProtectedRouteProps) {
  const location = useLocation()
  const user = useAuthStore((state) => state.user)
  const isLoading = useAuthStore((state) => state.isLoading)
  const isInitialized = useAuthStore((state) => state.isInitialized)

  if (!isInitialized || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-sky-500 border-t-transparent" />
          <p className="text-xs font-black uppercase tracking-widest text-sky-600 animate-pulse">
            Verificando credenciales...
          </p>
        </div>
      </div>
    )
  }

  // Si no está autenticado, redirigir al login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Verificar si requiere ser staff (admin/soporte)
  if (requireStaff && !user.is_staff) {
    return <Navigate to="/dashboard" replace />
  }

  // Verificar roles específicos si se definen
  if (allowedRoles) {
    const userRoleStr = user.role?.toLowerCase() || ''
    const mappedRole = 
      (userRoleStr === 'teacher' || userRoleStr === 'profesor') ? 'teacher' :
      (userRoleStr === 'admin' || userRoleStr === 'administrador') ? 'admin' : 
      'student';

    if (!allowedRoles.includes(mappedRole as UserRole)) {
      if (mappedRole === 'admin') return <Navigate to="/admin" replace />
      if (mappedRole === 'teacher') return <Navigate to="/teacher" replace />
      return <Navigate to="/dashboard" replace />
    }
  }

  return children ? <>{children}</> : <Outlet />
}
