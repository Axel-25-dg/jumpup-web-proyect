import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Loader2,
  ArrowRight,
  Sparkles,
  Mail,
  Lock,
  User,
  CircleCheck,
} from 'lucide-react'
import { useAuthStore } from '@/presentation/store/auth.store'
import { Button } from '@/presentation/components/ui/button'
import { Input } from '@/presentation/components/ui/input'
import { Label } from '@/presentation/components/ui/label'

const registerSchema = z
  .object({
    username: z
      .string()
      .min(3, 'El usuario debe tener al menos 3 caracteres')
      .max(150, 'El usuario es demasiado largo')
      .regex(/^[\w.@+-]+$/, 'Solo letras, números y los caracteres @ . + - _'),
    email: z.string().min(1, 'El email es obligatorio').email('Introduce un email válido'),
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
    confirmPassword: z.string().min(1, 'Confirma tu contraseña'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  })

type RegisterFormData = z.infer<typeof registerSchema>

const benefits = [
  'Rutas de aprendizaje adaptativas con IA',
  'Comunidad global de 20,000+ estudiantes',
  'Gamificación: XP, rachas y rankings',
  'Certificados verificados al completar cursos',
]

export default function RegisterPage() {
  const navigate = useNavigate()
  const { register: registerUser, isLoading, error, clearError, user } = useAuthStore()

  useEffect(() => {
    if (user) navigate('/', { replace: true })
  }, [user, navigate])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  async function onSubmit(data: RegisterFormData) {
    clearError()
    try {
      await registerUser(data.username, data.email, data.password)
      navigate('/', { replace: true })
    } catch {
      // handled by store
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-[#0a0a0b] overflow-hidden">

      {/* ── Left column: Visual Branding ── */}
      <div className="hidden lg:flex relative overflow-hidden flex-col order-last lg:order-first">
        {/* Background */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=1400"
            alt="Código y aprendizaje"
            className="w-full h-full object-cover grayscale"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0b]/95 via-[#0a0a0b]/75 to-sky-950/50" />
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
          <div className="space-y-8">
            <div className="flex items-center gap-2">
              <span className="h-px w-8 bg-sky-500" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-sky-500">
                Únete al futuro
              </span>
            </div>
            <h2 className="text-5xl xl:text-6xl font-semibold tracking-tight text-neutral-100 leading-[1.0]">
              Tu viaje<br />
              <span className="text-sky-500 italic font-light">comienza aquí.</span>
            </h2>
            <p className="text-base text-neutral-400 leading-relaxed max-w-xs font-medium">
              Crea tu cuenta gratis y accede a la plataforma que está
              revolucionando el aprendizaje de idiomas.
            </p>

            {/* Benefits list */}
            <div className="space-y-3 border-t border-neutral-800 pt-8">
              {benefits.map((benefit, i) => (
                <div key={i} className="flex items-start gap-3">
                  <CircleCheck className="h-4 w-4 text-sky-500 shrink-0 mt-0.5" />
                  <span className="text-sm font-medium text-neutral-300">{benefit}</span>
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

      {/* ── Right column: Form ── */}
      <div className="relative flex items-center justify-center p-8 sm:p-12 lg:p-16">
        {/* Subtle grid texture */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
        <div className="absolute top-0 right-0 w-72 h-72 bg-sky-500/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600/5 blur-[140px] rounded-full pointer-events-none" />

        <div className="relative w-full max-w-md space-y-8">
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
                Registro gratuito
              </span>
              <span className="h-px flex-1 bg-neutral-800" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-neutral-100 leading-[1.05]">
              Crear<br />
              <span className="text-sky-500 italic font-light">cuenta.</span>
            </h1>
            <p className="text-neutral-500 text-base font-medium leading-relaxed">
              Únete a más de 20,000 estudiantes en 50 países.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
                  htmlFor="reg-username"
                  className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-600"
                >
                  Nombre de Usuario
                </Label>
                <div className="relative group">
                  <User
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-700 group-focus-within:text-sky-500 transition-colors"
                    size={16}
                  />
                  <Input
                    id="reg-username"
                    placeholder="usuario_pro"
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

              {/* Email */}
              <div className="space-y-2">
                <Label
                  htmlFor="reg-email"
                  className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-600"
                >
                  Correo Electrónico
                </Label>
                <div className="relative group">
                  <Mail
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-700 group-focus-within:text-sky-500 transition-colors"
                    size={16}
                  />
                  <Input
                    id="reg-email"
                    type="email"
                    placeholder="tu@ejemplo.com"
                    className="h-12 pl-11 rounded-none border-neutral-800 bg-neutral-900/60 text-neutral-100 font-medium placeholder:text-neutral-700 focus-visible:ring-0 focus-visible:border-sky-500/60 transition-colors"
                    {...register('email')}
                  />
                </div>
                {errors.email && (
                  <p className="text-[10px] font-semibold text-rose-500 uppercase tracking-wide">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="reg-password"
                    className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-600"
                  >
                    Contraseña
                  </Label>
                  <div className="relative group">
                    <Lock
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-700 group-focus-within:text-sky-500 transition-colors"
                      size={16}
                    />
                    <Input
                      id="reg-password"
                      type="password"
                      placeholder="••••••••"
                      className="h-12 pl-11 rounded-none border-neutral-800 bg-neutral-900/60 text-neutral-100 font-medium placeholder:text-neutral-700 focus-visible:ring-0 focus-visible:border-sky-500/60 transition-colors"
                      {...register('password')}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="reg-confirm"
                    className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-600"
                  >
                    Confirmar
                  </Label>
                  <div className="relative group">
                    <Lock
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-700 group-focus-within:text-sky-500 transition-colors"
                      size={16}
                    />
                    <Input
                      id="reg-confirm"
                      type="password"
                      placeholder="••••••••"
                      className="h-12 pl-11 rounded-none border-neutral-800 bg-neutral-900/60 text-neutral-100 font-medium placeholder:text-neutral-700 focus-visible:ring-0 focus-visible:border-sky-500/60 transition-colors"
                      {...register('confirmPassword')}
                    />
                  </div>
                </div>
              </div>

              {(errors.password || errors.confirmPassword) && (
                <p className="text-[10px] font-semibold text-rose-500 uppercase tracking-wide">
                  {errors.password?.message || errors.confirmPassword?.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 rounded-none text-sm font-semibold bg-sky-500 hover:bg-sky-600 text-white shadow-lg shadow-sky-500/20 transition-all active:scale-[0.98] group mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creando cuenta...
                </>
              ) : (
                <span className="flex items-center gap-2">
                  Empezar Gratis
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </span>
              )}
            </Button>
          </form>

          {/* Footer */}
          <div className="border-t border-neutral-800/60 pt-6">
            <p className="text-center text-sm font-medium text-neutral-600">
              ¿Ya tienes una cuenta?{' '}
              <Link
                to="/login"
                className="text-sky-500 hover:text-sky-400 font-semibold transition-colors"
              >
                Iniciar Sesión
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
