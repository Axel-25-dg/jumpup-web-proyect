import { useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, GraduationCap, ArrowRight, Sparkles, ShieldCheck, Mail, Lock } from 'lucide-react'
import { useAuthStore } from '@/presentation/store/auth.store'
import { Button } from '@/presentation/components/ui/button'
import { Input } from '@/presentation/components/ui/input'
import { Label } from '@/presentation/components/ui/label'

const loginSchema = z.object({
  username: z.string().min(3, 'El nombre de usuario debe tener al menos 3 caracteres'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
})

type LoginFormData = z.infer<typeof loginSchema>

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
      // Navigation is handled by useEffect when user changes
    } catch {
      // handled by store
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background overflow-hidden">
      {/* Left Column: Form */}
      <div className="flex items-center justify-center p-8 sm:p-12 lg:p-20 relative">
        <div className="absolute top-0 left-0 w-64 h-64 bg-primary/5 blur-[100px] rounded-full -z-10" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-500/5 blur-[120px] rounded-full -z-10" />

        <div className="w-full max-w-md space-y-10 animate-in fade-in slide-in-from-left-4 duration-700">
          <div className="space-y-4">
             <Link to="/" className="inline-flex items-center gap-2 group">
                <div className="bg-primary p-2.5 rounded-2xl shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
                   <GraduationCap className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-black tracking-tighter">JumpUp</span>
             </Link>
             <h1 className="text-4xl font-black tracking-tight text-foreground leading-tight">
                ¡Bienvenido de <br />
                <span className="text-primary">Nuevo!</span>
             </h1>
             <p className="text-muted-foreground font-medium">Ingresa tus credenciales para continuar tu aprendizaje.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <div className="rounded-2xl bg-destructive/10 px-5 py-4 text-sm font-bold text-destructive border border-destructive/20 animate-in shake-2 duration-500 flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-destructive animate-pulse" />
                {error}
              </div>
            )}

            <div className="space-y-5">
               <div className="space-y-2">
                 <Label htmlFor="username" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Nombre de Usuario</Label>
                 <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
                    <Input
                      id="username"
                      type="text"
                      placeholder="tu_usuario"
                      className="h-14 pl-12 rounded-2xl border-border/50 bg-muted/30 font-bold focus:ring-primary/20 focus:border-primary transition-all"
                      {...register('username')}
                    />
                 </div>
                 {errors.username && <p className="text-[10px] font-black text-destructive uppercase tracking-wide ml-1">{errors.username.message}</p>}
               </div>

               <div className="space-y-2">
                 <div className="flex items-center justify-between px-1">
                   <Label htmlFor="password" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Contraseña</Label>
                   <Link to="/forgot-password" className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">
                     ¿Olvidaste tu contraseña?
                   </Link>
                 </div>
                 <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      className="h-14 pl-12 rounded-2xl border-border/50 bg-muted/30 font-bold focus:ring-primary/20 focus:border-primary transition-all"
                      {...register('password')}
                    />
                 </div>
                 {errors.password && <p className="text-[10px] font-black text-destructive uppercase tracking-wide ml-1">{errors.password.message}</p>}
               </div>
            </div>

            <Button type="submit" className="w-full h-16 rounded-2xl text-lg font-black shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all active:scale-95 group" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Conectando...
                </>
              ) : (
                <div className="flex items-center justify-center gap-2">
                   Iniciar Sesión <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                </div>
              )}
            </Button>
          </form>

          <div className="space-y-6 pt-4">
             <div className="relative">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border/50"></span></div>
                <div className="relative flex justify-center text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground">
                   <span className="bg-background px-4">O únete con</span>
                </div>
             </div>

             <p className="text-center font-bold text-muted-foreground">
                ¿No tienes una cuenta?{' '}
                <Link to="/register" className="text-primary hover:underline transition-colors font-black">
                   Regístrate Ahora
                </Link>
             </p>
          </div>
        </div>
      </div>

      {/* Right Column: Visual Branding */}
      <div className="hidden lg:block relative overflow-hidden bg-slate-900 m-6 rounded-[3rem] shadow-2xl">
         {/* Abstract background elements */}
         <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 blur-[150px] rounded-full" />
         <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-500/10 blur-[100px] rounded-full" />

         <div className="relative h-full flex flex-col justify-center p-20 text-white space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-[10px] font-black uppercase tracking-[0.2em] w-fit">
               <Sparkles className="h-4 w-4 text-amber-400" /> Tecnología de Vanguardia
            </div>

            <h2 className="text-6xl font-black tracking-tighter leading-[1.05]">
               Aprende <br />
               Sin <span className="text-primary italic">Límites.</span>
            </h2>

            <p className="text-xl text-slate-300 font-medium max-w-lg leading-relaxed">
               Únete a la plataforma que está revolucionando el aprendizaje de idiomas con IA y gamificación.
            </p>

            <div className="grid grid-cols-2 gap-8 pt-10">
               {[
                  { label: 'Estudiantes', value: '50k+', icon: ShieldCheck },
                  { label: 'Cursos Pro', value: '120+', icon: GraduationCap }
               ].map((stat, i) => (
                  <div key={i} className="space-y-2">
                     <p className="text-4xl font-black text-white tracking-tighter">{stat.value}</p>
                     <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{stat.label}</p>
                  </div>
               ))}
            </div>
         </div>

         {/* Decorative Circles */}
         <div className="absolute bottom-20 right-20 w-32 h-32 border border-white/10 rounded-full animate-pulse" />
         <div className="absolute bottom-40 right-40 w-16 h-16 border border-white/5 rounded-full" />
      </div>
    </div>
  )
}
