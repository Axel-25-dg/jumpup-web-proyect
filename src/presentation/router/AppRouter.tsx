import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Suspense, lazy, useEffect } from 'react'
import { useAuthStore } from '@/presentation/store/auth.store'
import ProtectedRoute from './ProtectedRoute'
import AppShell from '@/presentation/components/AppShell'
import PlaceholderPage from '../pages/PlaceholderPage'

const LoginPage = lazy(() => import('../pages/auth/LoginPage'))
const RegisterPage = lazy(() => import('../pages/auth/RegisterPage'))
const CatalogPage = lazy(() => import('../pages/catalog/CatalogPage'))
const ProductDetailPage = lazy(() => import('../pages/catalog/ProductDetailPage'))

function PageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  )
}

export default function AppRouter() {
  const loadSession = useAuthStore((state) => state.loadSession)

  useEffect(() => {
    loadSession()
  }, [loadSession])

  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route element={<AppShell />}>
            <Route path="/" element={<CatalogPage />} />
            <Route path="/catalog" element={<CatalogPage />} />
            <Route path="/products/:id" element={<ProductDetailPage />} />

            <Route path="/cart" element={<ProtectedRoute><PlaceholderPage title="Carrito — Módulo 6" /></ProtectedRoute>} />
            <Route path="/orders" element={<ProtectedRoute><PlaceholderPage title="Órdenes — Módulo 7" /></ProtectedRoute>} />
            <Route path="/orders/:id" element={<ProtectedRoute><PlaceholderPage title="Detalle de orden — Módulo 7" /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><PlaceholderPage title="Perfil — Módulo 8" /></ProtectedRoute>} />

            <Route path="/admin" element={<ProtectedRoute requireStaff><PlaceholderPage title="Admin Dashboard — Módulo 9" /></ProtectedRoute>} />
            <Route path="/admin/categories" element={<ProtectedRoute requireStaff><PlaceholderPage title="Admin Categorías — Módulo 10" /></ProtectedRoute>} />
            <Route path="/admin/products" element={<ProtectedRoute requireStaff><PlaceholderPage title="Admin Productos — Módulo 11" /></ProtectedRoute>} />
            <Route path="/admin/orders" element={<ProtectedRoute requireStaff><PlaceholderPage title="Admin Órdenes — Módulo 12" /></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute requireStaff><PlaceholderPage title="Admin Usuarios — Módulo 13" /></ProtectedRoute>} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
