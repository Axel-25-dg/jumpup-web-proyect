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
const CartPage = lazy(() => import('../pages/cart/CartPage'))
const OrderConfirmationPage = lazy(() => import('../pages/cart/OrderConfirmationPage'))
const OrderHistoryPage = lazy(() => import('../pages/cart/OrderHistoryPage'))

// New Student Modules
const DashboardPage = lazy(() => import('../pages/dashboard/DashboardPage'))
const RankingPage = lazy(() => import('../pages/dashboard/RankingPage'))
const CoursesPage = lazy(() => import('../pages/learning/CoursesPage'))
const LessonPage = lazy(() => import('../pages/learning/LessonPage'))
const ChatPage = lazy(() => import('../pages/chat/ChatPage'))
const ForumPage = lazy(() => import('../pages/forum/ForumPage'))
const SocialFeedPage = lazy(() => import('../pages/social/SocialFeedPage'))
const ClassroomsPage = lazy(() => import('../pages/classrooms/ClassroomsPage'))
const LiveSessionPage = lazy(() => import('../pages/live/LiveSessionPage'))
const CertificatesPage = lazy(() => import('../pages/certificates/CertificatesPage'))

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
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/catalog" element={<CatalogPage />} />
            <Route path="/products/:id" element={<ProductDetailPage />} />

            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/ranking" element={<ProtectedRoute><RankingPage /></ProtectedRoute>} />
            <Route path="/courses" element={<ProtectedRoute><CoursesPage /></ProtectedRoute>} />
            <Route path="/courses/:courseId/lessons/:lessonId" element={<ProtectedRoute><LessonPage /></ProtectedRoute>} />
            <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
            <Route path="/forum" element={<ProtectedRoute><ForumPage /></ProtectedRoute>} />
            <Route path="/social" element={<ProtectedRoute><SocialFeedPage /></ProtectedRoute>} />
            <Route path="/classrooms" element={<ProtectedRoute><ClassroomsPage /></ProtectedRoute>} />
            <Route path="/live/:id" element={<ProtectedRoute><LiveSessionPage /></ProtectedRoute>} />
            <Route path="/certificates" element={<ProtectedRoute><CertificatesPage /></ProtectedRoute>} />

            <Route path="/cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
            <Route path="/order-confirmation/:id" element={<ProtectedRoute><OrderConfirmationPage /></ProtectedRoute>} />
            <Route path="/orders" element={<ProtectedRoute><OrderHistoryPage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><PlaceholderPage title="Perfil — Módulo 7" /></ProtectedRoute>} />

            <Route path="/admin" element={<ProtectedRoute requireStaff><PlaceholderPage title="Admin Dashboard — Módulo 8" /></ProtectedRoute>} />
            <Route path="/admin/categories" element={<ProtectedRoute requireStaff><PlaceholderPage title="Admin Categorías — Módulo 9" /></ProtectedRoute>} />
            <Route path="/admin/products" element={<ProtectedRoute requireStaff><PlaceholderPage title="Admin Productos — Módulo 10" /></ProtectedRoute>} />
            <Route path="/admin/orders" element={<ProtectedRoute requireStaff><PlaceholderPage title="Admin Órdenes — Módulo 11" /></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute requireStaff><PlaceholderPage title="Admin Usuarios — Módulo 12" /></ProtectedRoute>} />
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

