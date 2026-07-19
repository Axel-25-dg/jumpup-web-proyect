import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Suspense, lazy, useEffect } from 'react'
import { useAuthStore } from '@/presentation/store/auth.store'
import ProtectedRoute from './ProtectedRoute'
import AppShell from '@/presentation/components/AppShell'

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
const ForumPage = lazy(() => import('../pages/forum/ForumPage'))
const SocialFeedPage = lazy(() => import('../pages/social/SocialFeedPage'))
const ClassroomsPage = lazy(() => import('../pages/classrooms/ClassroomsPage'))
const ClassroomDetailPage = lazy(() => import('../pages/classrooms/ClassroomDetailPage'))
const LiveSessionPage = lazy(() => import('../pages/live/LiveSessionPage'))
const CertificatesPage = lazy(() => import('../pages/certificates/CertificatesPage'))
const VerifyCertificatePage = lazy(() => import('../pages/certificates/VerifyCertificatePage'))
const ProfilePage = lazy(() => import('../pages/profile/ProfilePage'))

// Admin & Teacher
const AdminDashboardPage = lazy(() => import('../pages/admin/AdminDashboardPage'))

// Admin Management - Courses
const AdminCoursesPage = lazy(() => import('../pages/admin/management/AdminCoursesPage'))
const AdminCourseFormPage = lazy(() => import('../pages/admin/management/AdminCourseFormPage'))
const AdminModulesPage = lazy(() => import('../pages/admin/management/AdminModulesPage'))
const AdminModuleFormPage = lazy(() => import('../pages/admin/management/AdminModuleFormPage'))
const AdminLessonsPage = lazy(() => import('../pages/admin/management/AdminLessonsPage'))
const AdminLessonFormPage = lazy(() => import('../pages/admin/management/AdminLessonFormPage'))
const AdminExercisesPage = lazy(() => import('../pages/admin/management/AdminExercisesPage'))
const AdminExerciseFormPage = lazy(() => import('../pages/admin/management/AdminExerciseFormPage'))
const AdminLanguagesPage = lazy(() => import('../pages/admin/management/AdminLanguagesPage'))
const AdminLanguageFormPage = lazy(() => import('../pages/admin/management/AdminLanguageFormPage'))
const AdminAnnouncementsPage = lazy(() => import('../pages/admin/management/AdminAnnouncementsPage'))
const AdminAnnouncementFormPage = lazy(() => import('../pages/admin/management/AdminAnnouncementFormPage'))
const AdminForumCategoryFormPage = lazy(() => import('../pages/admin/management/AdminForumCategoryFormPage'))
const AdminForumPage = lazy(() => import('../pages/admin/management/AdminForumPage'))
const AdminResourcesPage = lazy(() => import('../pages/admin/management/AdminResourcesPage'))
const AdminResourceFormPage = lazy(() => import('../pages/admin/management/AdminResourceFormPage'))
const AdminLiveSessionsPage = lazy(() => import('../pages/admin/management/AdminLiveSessionsPage'))
const AdminLiveSessionFormPage = lazy(() => import('../pages/admin/management/AdminLiveSessionFormPage'))

// E-Commerce - Catalogo
const AdminCatalogoPage = lazy(() => import('../pages/admin/management/AdminCatalogoPage'))
const AdminCatalogoFormPage = lazy(() => import('../pages/admin/management/AdminCatalogoFormPage'))

// E-Commerce - Ordenes de Compra
const AdminOrdenesCompraPage = lazy(() => import('../pages/admin/management/AdminOrdenesCompraPage'))
const AdminOrdenCompraDetailPage = lazy(() => import('../pages/admin/management/AdminOrdenCompraDetailPage'))

// Admin Management - Users, Classrooms, Certificates (NEW)
const AdminUsersPage = lazy(() => import('../pages/admin/management/AdminUsersPage'))
const AdminUserFormPage = lazy(() => import('../pages/admin/management/AdminUserFormPage'))
const AdminClassroomsPage = lazy(() => import('../pages/admin/management/AdminClassroomsPage'))
const AdminClassroomFormPage = lazy(() => import('../pages/admin/management/AdminClassroomFormPage'))
const AdminCertificatesPage = lazy(() => import('../pages/admin/management/AdminCertificatesPage'))
const AdminIssueCertificatePage = lazy(() => import('../pages/admin/management/AdminIssueCertificatePage'))
const AdminCertificateDetailPage = lazy(() => import('../pages/admin/management/AdminCertificateDetailPage'))
const AdminCertificateEditPage = lazy(() => import('../pages/admin/management/AdminCertificateEditPage'))

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
          <Route path="/verify" element={<VerifyCertificatePage />} />
          <Route path="/verify/:code" element={<VerifyCertificatePage />} />

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

            {/* Shared Authenticated Routes (All roles) */}
            <Route element={<ProtectedRoute allowedRoles={['student', 'teacher', 'admin']} />}>
               <Route path="/forum" element={<ForumPage />} />
               <Route path="/classrooms" element={<ClassroomsPage />} />
               <Route path="/classrooms/:id" element={<ClassroomDetailPage />} />
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
                
                {/* E-Commerce - Catalogo */}
                <Route path="/admin/catalogo" element={<AdminCatalogoPage />} />
                <Route path="/admin/catalogo/new" element={<AdminCatalogoFormPage />} />
                <Route path="/admin/catalogo/:id/edit" element={<AdminCatalogoFormPage />} />

                {/* E-Commerce - Ordenes de Compra */}
                <Route path="/admin/ordenes-compra" element={<AdminOrdenesCompraPage />} />
                <Route path="/admin/ordenes-compra/:id" element={<AdminOrdenCompraDetailPage />} />
                
                {/* Announcements */}
                <Route path="/admin/announcements" element={<AdminAnnouncementsPage />} />
                <Route path="/admin/announcements/new" element={<AdminAnnouncementFormPage />} />
                <Route path="/admin/announcements/:id/edit" element={<AdminAnnouncementFormPage />} />

                {/* Forum */}
                <Route path="/admin/forum" element={<AdminForumPage />} />
                <Route path="/admin/forum-categories" element={<AdminForumPage />} />
                <Route path="/admin/forum-categories/new" element={<AdminForumCategoryFormPage />} />
                <Route path="/admin/forum-categories/:id/edit" element={<AdminForumCategoryFormPage />} />

                {/* Resources */}
                <Route path="/admin/resources" element={<AdminResourcesPage />} />
                <Route path="/admin/resources/new" element={<AdminResourceFormPage />} />
                <Route path="/admin/resources/:id/edit" element={<AdminResourceFormPage />} />

                {/* Live Sessions */}
                <Route path="/admin/live-sessions" element={<AdminLiveSessionsPage />} />
                <Route path="/admin/live-sessions/new" element={<AdminLiveSessionFormPage />} />
                <Route path="/admin/live-sessions/:id/edit" element={<AdminLiveSessionFormPage />} />

                {/* Admin Management Routes - Courses */}
                <Route path="/admin/management/courses" element={<AdminCoursesPage />} />
                <Route path="/admin/management/courses/new" element={<AdminCourseFormPage />} />
                <Route path="/admin/management/courses/:id/edit" element={<AdminCourseFormPage />} />
                <Route path="/admin/management/modules" element={<AdminModulesPage />} />
                <Route path="/admin/management/modules/new" element={<AdminModuleFormPage />} />
                <Route path="/admin/management/modules/:id/edit" element={<AdminModuleFormPage />} />
                <Route path="/admin/management/lessons" element={<AdminLessonsPage />} />
                <Route path="/admin/management/lessons/new" element={<AdminLessonFormPage />} />
                <Route path="/admin/management/lessons/:id/edit" element={<AdminLessonFormPage />} />
                <Route path="/admin/management/exercises" element={<AdminExercisesPage />} />
                <Route path="/admin/management/exercises/new" element={<AdminExerciseFormPage />} />
                <Route path="/admin/management/exercises/:id/edit" element={<AdminExerciseFormPage />} />
                <Route path="/admin/management/languages" element={<AdminLanguagesPage />} />
                <Route path="/admin/management/languages/new" element={<AdminLanguageFormPage />} />
                <Route path="/admin/management/languages/:id/edit" element={<AdminLanguageFormPage />} />
                
                {/* Admin - Classrooms */}
                <Route path="/admin/classrooms" element={<AdminClassroomsPage />} />
                <Route path="/admin/classrooms/new" element={<AdminClassroomFormPage />} />
                <Route path="/admin/classrooms/:id/edit" element={<AdminClassroomFormPage />} />
                <Route path="/admin/classrooms/:id/manage" element={<ManageClassroomPage />} />
                
                {/* Admin - Certificates */}
                <Route path="/admin/certificates" element={<AdminCertificatesPage />} />
                <Route path="/admin/certificates/issue" element={<AdminIssueCertificatePage />} />
                <Route path="/admin/certificates/:id" element={<AdminCertificateDetailPage />} />
                <Route path="/admin/certificates/:id/edit" element={<AdminCertificateEditPage />} />
             </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}