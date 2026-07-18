import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Suspense, lazy, useEffect } from 'react'
import { useAuthStore } from '@/presentation/store/auth.store'
import ProtectedRoute from './ProtectedRoute'
import AppShell from '@/presentation/components/AppShell'
import PlaceholderPage from '../pages/PlaceholderPage'

const LoginPage = lazy(() => import('../pages/auth/LoginPage'))
const RegisterPage = lazy(() => import('../pages/auth/RegisterPage'))
const HomePage = lazy(() => import('../pages/home/HomePage'))
const StoryPage = lazy(() => import('../pages/home/StoryPage'))
const TechPage = lazy(() => import('../pages/home/TechPage'))
const TeamPage = lazy(() => import('../pages/home/TeamPage'))
const FeaturesPage = lazy(() => import('../pages/home/FeaturesPage'))
const CatalogPage = lazy(() => import('../pages/catalog/CatalogPage'))
const ProductDetailPage = lazy(() => import('../pages/catalog/ProductDetailPage'))
const CartPage = lazy(() => import('../pages/cart/CartPage'))
const OrderConfirmationPage = lazy(() => import('../pages/cart/OrderConfirmationPage'))
const OrderHistoryPage = lazy(() => import('../pages/cart/OrderHistoryPage'))

// Student Modules
const DashboardPage = lazy(() => import('../pages/dashboard/DashboardPage'))
const RankingPage = lazy(() => import('../pages/dashboard/RankingPage'))
const AchievementsPage = lazy(() => import('../pages/dashboard/AchievementsPage'))
const GamesPage = lazy(() => import('../pages/learning/GamesPage'))
const CoursesPage = lazy(() => import('../pages/learning/CoursesPage'))
const LessonPage = lazy(() => import('../pages/learning/LessonPage'))
const ChatPage = lazy(() => import('../pages/chat/ChatPage'))
const ForumPage = lazy(() => import('../pages/forum/ForumPage'))
const SocialFeedPage = lazy(() => import('../pages/social/SocialFeedPage'))
const ClassroomsPage = lazy(() => import('../pages/classrooms/ClassroomsPage'))
const LiveSessionPage = lazy(() => import('../pages/live/LiveSessionPage'))
const CertificatesPage = lazy(() => import('../pages/certificates/CertificatesPage'))
const ProfilePage = lazy(() => import('../pages/profile/ProfilePage'))

// Admin & Teacher
const AdminDashboardPage = lazy(() => import('../pages/admin/AdminDashboardPage'))

// Admin Management - Courses
const AdminCoursesPage = lazy(() => import('../pages/admin/management/AdminCoursesPage'))
const AdminCourseFormPage = lazy(() => import('../pages/admin/management/AdminCourseFormPage'))
const AdminModulesPage = lazy(() => import('../pages/admin/management/AdminModulesPage'))
const AdminLessonsPage = lazy(() => import('../pages/admin/management/AdminLessonsPage'))
const AdminExercisesPage = lazy(() => import('../pages/admin/management/AdminExercisesPage'))
const AdminLanguagesPage = lazy(() => import('../pages/admin/management/AdminLanguagesPage'))
const AdminAnnouncementsPage = lazy(() => import('../pages/admin/management/AdminAnnouncementsPage'))
const AdminAnnouncementFormPage = lazy(() => import('../pages/admin/management/AdminAnnouncementFormPage'))

// Admin Management - Users, Classrooms, Certificates (NEW)
const AdminUsersPage = lazy(() => import('../pages/admin/management/AdminUsersPage'))
const AdminUserFormPage = lazy(() => import('../pages/admin/management/AdminUserFormPage'))
const AdminClassroomsPage = lazy(() => import('../pages/admin/management/AdminClassroomsPage'))
const AdminClassroomFormPage = lazy(() => import('../pages/admin/management/AdminClassroomFormPage'))
const AdminCertificatesPage = lazy(() => import('../pages/admin/management/AdminCertificatesPage'))
const AdminIssueCertificatePage = lazy(() => import('../pages/admin/management/AdminIssueCertificatePage'))

// Teacher
const TeacherDashboardPage = lazy(() => import('../pages/teacher/TeacherDashboardPage'))
const TeacherCoursesPage = lazy(() => import('../pages/teacher/courses/TeacherCoursesPage'))
const CreateCoursePage = lazy(() => import('../pages/teacher/courses/CreateCoursePage'))
const CreateModulePage = lazy(() => import('../pages/teacher/courses/CreateModulePage'))
const CreateLessonPage = lazy(() => import('../pages/teacher/courses/CreateLessonPage'))
const CreateExercisePage = lazy(() => import('../pages/teacher/courses/CreateExercisePage'))
const CreateClassroomPage = lazy(() => import('../pages/teacher/classrooms/CreateClassroomPage'))
const ManageClassroomPage = lazy(() => import('../pages/teacher/classrooms/ManageClassroomPage'))
const TeacherClassroomsPage = lazy(() => import('../pages/teacher/classrooms/TeacherClassroomsPage'))
const ResourceLibraryPage = lazy(() => import('../pages/teacher/resources/ResourceLibraryPage'))
const ManageLiveSessionsPage = lazy(() => import('../pages/teacher/live/ManageLiveSessionsPage'))
const ScheduleLiveSessionPage = lazy(() => import('../pages/teacher/live/ScheduleLiveSessionPage'))
const EditCoursePage = lazy(() => import('../pages/teacher/courses/EditCoursePage'))
const ModuleExercisesPage = lazy(() => import('../pages/teacher/courses/ModuleExercisesPage'))
const TeacherProfilePage = lazy(() => import('../pages/teacher/profile/TeacherProfilePage'))
const CategoryListPage = lazy(() => import('../pages/categories/CategoryListPage'))
const CategoryFormPage = lazy(() => import('../pages/categories/CategoryFormPage'))
const CourseListPage = lazy(() => import('../pages/courses/CourseListPage'))
const CourseFormPage = lazy(() => import('../pages/courses/CourseFormPage'))

function PageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-sky-500 border-t-transparent" />
        <p className="text-xs font-black uppercase tracking-widest text-sky-600 animate-pulse">Saltando...</p>
      </div>
    </div>
  )
}

// Componente para proteger rutas públicas (si está logueado, va al dashboard)
function PublicRoute({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user)
  const isLoading = useAuthStore((s) => s.isLoading)
  const isInitialized = useAuthStore((s) => s.isInitialized)

  if (!isInitialized || isLoading) return <PageLoader />

  if (user) {
    const role = user.role?.toLowerCase() || ''
    const isTeacher = role === 'teacher' || role === 'profesor'
    const isAdmin = role === 'admin' || role === 'administrador'
    
    if (isAdmin) return <Navigate to="/admin" replace />
    if (isTeacher) return <Navigate to="/teacher" replace />
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}

export default function AppRouter() {
  const loadSession = useAuthStore((s) => s.loadSession)
  const isInitialized = useAuthStore((s) => s.isInitialized)

  useEffect(() => {
    if (!isInitialized) {
      loadSession()
    }
  }, [isInitialized, loadSession])

  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Rutas que NO deben verse si ya estás logueado */}
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

          <Route element={<AppShell />}>
            <Route path="/" element={<PublicRoute><HomePage /></PublicRoute>} />
            <Route path="/story" element={<PublicRoute><StoryPage /></PublicRoute>} />
            <Route path="/tech" element={<PublicRoute><TechPage /></PublicRoute>} />
            <Route path="/team" element={<PublicRoute><TeamPage /></PublicRoute>} />
            <Route path="/features" element={<PublicRoute><FeaturesPage /></PublicRoute>} />
            <Route path="/catalog" element={<CatalogPage />} />
            <Route path="/products/:id" element={<ProductDetailPage />} />

            {/* Student Protected Routes */}
            <Route element={<ProtectedRoute allowedRoles={['student']} />}>
               <Route path="/dashboard" element={<DashboardPage />} />
               <Route path="/ranking" element={<RankingPage />} />
               <Route path="/achievements" element={<AchievementsPage />} />
               <Route path="/games" element={<GamesPage />} />
               <Route path="/courses" element={<CoursesPage />} />
               <Route path="/courses/:courseId/lessons/:lessonId" element={<LessonPage />} />
               <Route path="/chat" element={<ChatPage />} />
               <Route path="/social" element={<SocialFeedPage />} />
               <Route path="/certificates" element={<CertificatesPage />} />
               <Route path="/cart" element={<CartPage />} />
               <Route path="/order-confirmation/:id" element={<OrderConfirmationPage />} />
               <Route path="/orders" element={<OrderHistoryPage />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['teacher']} />}>
               <Route path="/teacher" element={<TeacherDashboardPage />} />
               <Route path="/teacher/courses" element={<TeacherCoursesPage />} />
               <Route path="/teacher/courses/new" element={<CreateCoursePage />} />
               <Route path="/teacher/courses/:id/edit" element={<EditCoursePage />} />
               <Route path="/teacher/modules/new" element={<CreateModulePage />} />
               <Route path="/teacher/lessons/new" element={<CreateLessonPage />} />
               <Route path="/teacher/exercises/new" element={<CreateExercisePage />} />
               <Route path="/teacher/modules/:id/exercises" element={<ModuleExercisesPage />} />
               <Route path="/teacher/classrooms" element={<TeacherClassroomsPage />} />
               <Route path="/teacher/classrooms/new" element={<CreateClassroomPage />} />
               <Route path="/teacher/classrooms/:id/manage" element={<ManageClassroomPage />} />
               <Route path="/teacher/resources" element={<ResourceLibraryPage />} />
               <Route path="/teacher/live" element={<ManageLiveSessionsPage />} />
               <Route path="/teacher/live/new" element={<ScheduleLiveSessionPage />} />
               <Route path="/teacher/profile" element={<TeacherProfilePage />} />
            </Route>

            {/* Gestión académica: en Django, admin y docente tienen is_staff=True. */}
            <Route element={<ProtectedRoute requireStaff />}>
               <Route path="/management/courses" element={<CourseListPage />} />
               <Route path="/management/courses/new" element={<CourseFormPage />} />
               <Route path="/management/courses/:id/edit" element={<CourseFormPage />} />
            </Route>

            {/* Shared Authenticated Routes (Students & Teachers) */}
            <Route element={<ProtectedRoute allowedRoles={['student', 'teacher']} />}>
               <Route path="/forum" element={<ForumPage />} />
               <Route path="/classrooms" element={<ClassroomsPage />} />
               <Route path="/live/:id" element={<LiveSessionPage />} />
               <Route path="/profile" element={<ProfilePage />} />
            </Route>

            {/* Admin Protected Routes */}
             <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                <Route path="/admin" element={<AdminDashboardPage />} />
                
                {/* Users */}
                <Route path="/admin/users" element={<AdminUsersPage />} />
                <Route path="/admin/users/new" element={<AdminUserFormPage />} />
                <Route path="/admin/users/:id/edit" element={<AdminUserFormPage />} />
                
                {/* Categories */}
                <Route path="/admin/categories" element={<CategoryListPage />} />
                <Route path="/admin/categories/new" element={<CategoryFormPage />} />
                <Route path="/admin/categories/:id/edit" element={<CategoryFormPage />} />
                
                {/* Products / Orders */}
                <Route path="/admin/products" element={<PlaceholderPage title="Inventario de Productos" />} />
                <Route path="/admin/orders" element={<PlaceholderPage title="Registro de Ventas" />} />
                
                {/* Announcements */}
                <Route path="/admin/announcements" element={<AdminAnnouncementsPage />} />
                <Route path="/admin/announcements/new" element={<AdminAnnouncementFormPage />} />
                <Route path="/admin/announcements/:id/edit" element={<AdminAnnouncementFormPage />} />

                {/* Admin Management Routes - Courses */}
                <Route path="/admin/management/courses" element={<AdminCoursesPage />} />
                <Route path="/admin/management/courses/new" element={<AdminCourseFormPage />} />
                <Route path="/admin/management/courses/:id/edit" element={<AdminCourseFormPage />} />
                <Route path="/admin/management/modules" element={<AdminModulesPage />} />
                <Route path="/admin/management/lessons" element={<AdminLessonsPage />} />
                <Route path="/admin/management/exercises" element={<AdminExercisesPage />} />
                <Route path="/admin/management/languages" element={<AdminLanguagesPage />} />
                
                {/* Admin - Classrooms */}
                <Route path="/admin/classrooms" element={<AdminClassroomsPage />} />
                <Route path="/admin/classrooms/new" element={<AdminClassroomFormPage />} />
                <Route path="/admin/classrooms/:id/edit" element={<AdminClassroomFormPage />} />
                <Route path="/admin/classrooms/:id/manage" element={<ManageClassroomPage />} />
                
                {/* Admin - Certificates */}
                <Route path="/admin/certificates" element={<AdminCertificatesPage />} />
                <Route path="/admin/certificates/issue" element={<AdminIssueCertificatePage />} />
             </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}