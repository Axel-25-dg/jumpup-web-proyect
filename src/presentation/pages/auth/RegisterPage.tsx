import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, ArrowRight, UserPlus, Sparkles, Mail, Lock, User } from 'lucide-react'
import { useAuthStore } from '@/presentation/store/auth.store'
import { Button } from '@/presentation/components/ui/button'
import { Input } from '@/presentation/components/ui/input'
import { Label } from '@/presentation/components/ui/label'

const registerSchema = z
  .object({
    username: z.string().min(3, 'El usuario debe tener al menos 3 caracteres').max(150, 'El usuario es demasiado largo').regex(/^[\w.@+-]+$/, 'Solo letras, números y los caracteres @ . + - _'),
    email: z.string().min(1, 'El email es obligatorio').email('Introduce un email válido'),
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
    confirmPassword: z.string().min(1, 'Confirma tu contraseña'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  })

type RegisterFormData = z.infer<typeof registerSchema>

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
    <div className="min-h-screen grid lg:grid-cols-2 bg-background overflow-hidden">
      {/* Left Column: Visual Branding */}
      <div className="hidden lg:block relative overflow-hidden bg-slate-900 m-6 rounded-[3rem] shadow-2xl order-last lg:order-first">
         <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-emerald-500/10 blur-[150px] rounded-full" />
         <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-primary/20 blur-[100px] rounded-full" />

         <div className="relative h-full flex flex-col justify-center p-20 text-white space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-[10px] font-black uppercase tracking-[0.2em] w-fit">
               <Sparkles className="h-4 w-4 text-emerald-400" /> Sé parte del futuro
            </div>

            <h2 className="text-6xl font-black tracking-tighter leading-[1.05]">
               Tu Viaje <br />
               Comienza <span className="text-emerald-500 italic">Aquí.</span>
            </h2>

            <p className="text-xl text-slate-300 font-medium max-w-lg leading-relaxed">
               Crea tu cuenta hoy y accede a una experiencia de aprendizaje personalizada impulsada por inteligencia artificial.
            </p>

            <div className="space-y-6 pt-10">
               {[
                  'Rutas de aprendizaje adaptativas',
                  'Comunidad global de estudiantes',
                  'Certificados verificados por blockchain'
               ].map((benefit, i) => (
                  <div key={i} className="flex items-center gap-4">
                     <div className="h-6 w-6 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                        <div className="h-2 w-2 rounded-full bg-emerald-500" />
                     </div>
                     <span className="font-bold text-slate-200">{benefit}</span>
                  </div>
               ))}
            </div>
         </div>
      </div>

      {/* Right Column: Form */}
      <div className="flex items-center justify-center p-8 sm:p-12 lg:p-20 relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[100px] rounded-full -z-10" />

        <div className="w-full max-w-md space-y-10 animate-in fade-in slide-in-from-right-4 duration-700">
          <div className="space-y-4">
             <Link to="/" className="inline-flex items-center gap-2 group">
                <div className="bg-emerald-500 p-2.5 rounded-2xl shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform">
                   <UserPlus className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-black tracking-tighter">JumpUp</span>
             </Link>
             <h1 className="text-4xl font-black tracking-tight text-foreground leading-tight">
                Crear <br />
                <span className="text-emerald-500">Cuenta</span>
             </h1>
             <p className="text-muted-foreground font-medium">Únete a más de 50,000 estudiantes en todo el mundo.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {error && (
              <div className="rounded-2xl bg-destructive/10 px-5 py-4 text-sm font-bold text-destructive border border-destructive/20 animate-in shake-2 duration-500">
                {error}
              </div>
            )}

            <div className="space-y-4">
               <div className="space-y-2">
                 <Label htmlFor="username" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Nombre de Usuario</Label>
                 <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-emerald-500 transition-colors" size={18} />
                    <Input
                      id="username"
                      placeholder="usuario_pro"
                      className="h-14 pl-12 rounded-2xl border-border/50 bg-muted/30 font-bold focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                      {...register('username')}
                    />
                 </div>
                 {errors.username && <p className="text-[10px] font-black text-destructive uppercase tracking-wide ml-1">{errors.username.message}</p>}
               </div>

               <div className="space-y-2">
                 <Label htmlFor="email" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Correo Electrónico</Label>
                 <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-emerald-500 transition-colors" size={18} />
                    <Input
                      id="email"
                      type="email"
                      placeholder="tu@ejemplo.com"
                      className="h-14 pl-12 rounded-2xl border-border/50 bg-muted/30 font-bold focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                      {...register('email')}
                    />
                 </div>
                 {errors.email && <p className="text-[10px] font-black text-destructive uppercase tracking-wide ml-1">{errors.email.message}</p>}
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Contraseña</Label>
                    <div className="relative group">
                       <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-emerald-500 transition-colors" size={18} />
                       <Input
                         id="password"
                         type="password"
                         placeholder="••••••••"
                         className="h-14 pl-12 rounded-2xl border-border/50 bg-muted/30 font-bold focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                         {...register('password')}
                       />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Confirmar</Label>
                    <div className="relative group">
                       <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-emerald-500 transition-colors" size={18} />
                       <Input
                         id="confirmPassword"
                         type="password"
                         placeholder="••••••••"
                         className="h-14 pl-12 rounded-2xl border-border/50 bg-muted/30 font-bold focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                         {...register('confirmPassword')}
                       />
                    </div>
                  </div>
               </div>
               {(errors.password || errors.confirmPassword) && (
                  <p className="text-[10px] font-black text-destructive uppercase tracking-wide ml-1">
                     {errors.password?.message || errors.confirmPassword?.message}
                  </p>
               )}
            </div>

            <Button type="submit" className="w-full h-16 rounded-2xl text-lg font-black bg-emerald-500 hover:bg-emerald-600 text-white shadow-xl shadow-emerald-500/20 transition-all active:scale-95 group mt-4" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Creando...
                </>
              ) : (
                <div className="flex items-center justify-center gap-2">
                   Empezar Ahora <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                </div>
              )}
            </Button>
          </form>

          <p className="text-center font-bold text-muted-foreground">
             ¿Ya tienes una cuenta?{' '}
             <Link to="/login" className="text-emerald-500 hover:underline transition-colors font-black">
                Inicia Sesión
             </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
