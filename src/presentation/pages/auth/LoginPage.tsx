import { useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Loader2,
  ArrowRight,
  Sparkles,
  Mail,
  Lock,
  Globe,
  Users,
  Zap,
} from 'lucide-react'
import { useAuthStore } from '@/presentation/store/auth.store'
import { Button } from '@/presentation/components/ui/button'
import { Input } from '@/presentation/components/ui/input'
import { Label } from '@/presentation/components/ui/label'

const loginSchema = z.object({
  username: z.string().min(3, 'El nombre de usuario debe tener al menos 3 caracteres'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
})

type LoginFormData = z.infer<typeof loginSchema>

const stats = [
  { icon: Users, value: '20K+', label: 'Estudiantes' },
  { icon: Globe, value: '50+', label: 'Países' },
  { icon: Zap, value: '5M+', label: 'XP Generados' },
]

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: Location })?.from?.pathname ?? '/'

  const { login, isLoading, error, clearError, user } = useAuthStore()

  useEffect(() => {
    if (user) navigate(from, { replace: true })
  }, [user, from, navigate])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  async function onSubmit(data: LoginFormData) {
    clearError()
    try {
      await login(data.username, data.password)
    } catch {
      // handled by store
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-[#0a0a0b] overflow-hidden">

      {/* ── Left column: Form ── */}
      <div className="relative flex items-center justify-center p-8 sm:p-12 lg:p-20">
        {/* Subtle grid texture */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
        {/* Glow blobs */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-sky-500/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-600/5 blur-[140px] rounded-full pointer-events-none" />

        <div className="relative w-full max-w-md space-y-10">
          {/* Logo */}
          <Link to="/" className="inline-flex items-center gap-2.5 group">
            <div className="h-9 w-9 grid place-items-center border border-neutral-800 group-hover:border-sky-500/50 group-hover:bg-sky-500/10 transition-colors">
              <Sparkles className="h-4 w-4 text-sky-500" />
            </div>
            <span className="text-xl font-semibold tracking-tight text-neutral-100">
              Jump<span className="text-sky-500">Up</span>
            </span>
          </Link>

          {/* Heading */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-4">
              <span className="h-px flex-1 bg-neutral-800" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-neutral-600">
                Acceso seguro
              </span>
              <span className="h-px flex-1 bg-neutral-800" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-neutral-100 leading-[1.05]">
              Bienvenido<br />
              <span className="text-sky-500 italic font-light">de nuevo.</span>
            </h1>
            <p className="text-neutral-500 text-base font-medium leading-relaxed">
              Continúa tu viaje de aprendizaje donde lo dejaste.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <div className="flex items-center gap-3 px-4 py-3 border border-rose-500/20 bg-rose-500/5 text-rose-400 text-sm font-medium">
                <div className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse shrink-0" />
                {error}
              </div>
            )}

            <div className="space-y-4">
              {/* Username */}
              <div className="space-y-2">
                <Label
                  htmlFor="login-username"
                  className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-600"
                >
                  Usuario
                </Label>
                <div className="relative group">
                  <Mail
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-700 group-focus-within:text-sky-500 transition-colors"
                    size={16}
                  />
                  <Input
                    id="login-username"
                    type="text"
                    placeholder="tu_usuario"
                    className="h-12 pl-11 rounded-none border-neutral-800 bg-neutral-900/60 text-neutral-100 font-medium placeholder:text-neutral-700 focus-visible:ring-0 focus-visible:border-sky-500/60 transition-colors"
                    {...register('username')}
                  />
                </div>
                {errors.username && (
                  <p className="text-[10px] font-semibold text-rose-500 uppercase tracking-wide">
                    {errors.username.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="login-password"
                    className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-600"
                  >
                    Contraseña
                  </Label>
                  <Link
                    to="/forgot-password"
                    className="text-[10px] font-semibold text-sky-500 hover:text-sky-400 uppercase tracking-[0.15em] transition-colors"
                  >
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
                <div className="relative group">
                  <Lock
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-700 group-focus-within:text-sky-500 transition-colors"
                    size={16}
                  />
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    className="h-12 pl-11 rounded-none border-neutral-800 bg-neutral-900/60 text-neutral-100 font-medium placeholder:text-neutral-700 focus-visible:ring-0 focus-visible:border-sky-500/60 transition-colors"
                    {...register('password')}
                  />
                </div>
                {errors.password && (
                  <p className="text-[10px] font-semibold text-rose-500 uppercase tracking-wide">
                    {errors.password.message}
                  </p>
                )}
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 rounded-none text-sm font-semibold bg-sky-500 hover:bg-sky-600 text-white shadow-lg shadow-sky-500/20 transition-all active:scale-[0.98] group"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Conectando...
                </>
              ) : (
                <span className="flex items-center gap-2">
                  Iniciar Sesión
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </span>
              )}
            </Button>
          </form>

          {/* Footer */}
          <div className="border-t border-neutral-800/60 pt-6">
            <p className="text-center text-sm font-medium text-neutral-600">
              ¿No tienes una cuenta?{' '}
              <Link
                to="/register"
                className="text-sky-500 hover:text-sky-400 font-semibold transition-colors"
              >
                Regístrate gratis
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* ── Right column: Visual Branding ── */}
      <div className="hidden lg:flex relative overflow-hidden flex-col">
        {/* Background image with overlay */}
        <div className="absolute inset-0">
          <img
            src="https://guaman-idiomas-ute.online/media/media/9ead07c7-1f71-4e/7af66d79fabf4d0b9f2edad7725a8229.jpg"
            alt="Estudiantes aprendiendo"
            className="w-full h-full object-cover grayscale"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0b]/95 via-[#0a0a0b]/70 to-sky-950/60" />
          {/* Grid texture */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between h-full p-16">
          {/* Top badge */}
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 grid place-items-center border border-neutral-700">
              <Sparkles className="h-4 w-4 text-sky-500" />
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-neutral-500">
              JumpUp · UTE 2026
            </span>
          </div>

          {/* Center text */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <span className="h-px w-8 bg-sky-500" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-sky-500">
                Plataforma educativa
              </span>
            </div>
            <h2 className="text-5xl xl:text-6xl font-semibold tracking-tight text-neutral-100 leading-[1.0]">
              Aprende sin<br />
              <span className="text-sky-500 italic font-light">límites.</span>
            </h2>
            <p className="text-base text-neutral-400 leading-relaxed max-w-xs font-medium">
              Gamificación, IA adaptativa y comunidad global.
              El aprendizaje que siempre quisiste.
            </p>

            {/* Stats */}
            <div className={`grid grid-cols-3 border border-neutral-800 mt-8`}>
              {stats.map((stat, i) => (
                <div
                  key={i}
                  className={`py-6 text-center ${i < stats.length - 1 ? 'border-r border-neutral-800' : ''}`}
                >
                  <stat.icon className="mx-auto h-4 w-4 text-sky-500 mb-3" />
                  <div className="text-2xl font-semibold text-neutral-100 tracking-tight tabular-nums">
                    {stat.value}
                  </div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-600 mt-1">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <p className="text-xs text-neutral-700 font-medium">
            © 2027 JumpUp · Hecho en la UTE
          </p>
        </div>
      </div>
    </div>
  )
}
