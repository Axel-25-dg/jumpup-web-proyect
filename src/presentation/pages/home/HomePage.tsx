import { Link } from 'react-router-dom'
import {
  Sparkles,
  ArrowRight,
  History,
  BrainCircuit,
  ShoppingBag,
  Code2,
  Database,
  Terminal,
  Trophy
} from 'lucide-react'
import { Button } from '@/presentation/components/ui/button'
import { Badge } from '@/presentation/components/ui/badge'

export default function HomePage() {
  return (
    <div className="bg-white text-slate-900 font-sans selection:bg-sky-100 selection:text-sky-600">
      {/* --- HERO SECTION --- */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[600px] h-[600px] bg-sky-400/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[500px] h-[500px] bg-blue-400/10 blur-[100px] rounded-full" />

        <div className="container mx-auto px-6 relative z-10 text-center space-y-10">
          <Badge className="bg-sky-50 text-sky-600 border-sky-100 px-5 py-2 font-black text-xs uppercase tracking-[0.2em] rounded-full shadow-sm">
            <Sparkles className="h-4 w-4 mr-2" />
            La revolución del aprendizaje de idiomas
          </Badge>

          <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.85] text-slate-900">
            Salta al siguiente <br />
            <span className="text-sky-500">nivel de fluidez.</span>
          </h1>

          <p className="text-xl md:text-2xl text-slate-500 font-medium max-w-3xl mx-auto leading-relaxed">
            Domina un nuevo idioma con la plataforma que combina <span className="text-sky-600 font-bold">Inteligencia Artificial</span>, gamificación y una comunidad global.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-6">
            <Button asChild size="lg" className="h-16 px-12 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white font-black text-xl shadow-xl shadow-sky-200 border-none transition-all hover:scale-105 active:scale-95 group">
              <Link to="/register">
                Empezar Gratis
                <ArrowRight className="ml-2 h-6 w-6 group-hover:translate-x-2 transition-transform" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="h-16 px-12 rounded-2xl border-2 border-sky-100 text-sky-600 font-black text-xl hover:bg-sky-50 transition-all group">
              <Link to="/login" className="flex items-center">
                Iniciar Sesión
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* --- NUESTRA HISTORIA --- */}
      <section id="story" className="py-24 bg-slate-50 border-y border-slate-100">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm border border-sky-100">
                <History className="h-5 w-5 text-sky-500" />
                <span className="text-xs font-black uppercase tracking-widest text-sky-600">Nuestra Trayectoria</span>
              </div>
              <h2 className="text-5xl font-black text-slate-900 leading-tight">
                JumpUp: Una visión <span className="text-sky-500 italic">sin fronteras.</span>
              </h2>
              <div className="space-y-6 text-lg text-slate-600 font-medium leading-relaxed">
                <p>
                  Todo comenzó en las aulas universitarias, donde el equipo fundador identificó un problema crítico: el aprendizaje de idiomas era estático, aburrido y desconectado de la tecnología moderna.
                </p>
                <p>
                  Nuestra misión es democratizar el acceso a una educación de calidad, utilizando algoritmos de aprendizaje adaptativo y entornos sociales que obligan al estudiante a usar el idioma desde el primer día.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-sky-50 text-center space-y-2">
                <p className="text-5xl font-black text-sky-500">2024</p>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-tighter">Fundación</p>
              </div>
              <div className="bg-sky-500 p-8 rounded-[2rem] shadow-xl text-center space-y-2 text-white">
                <p className="text-5xl font-black">15+</p>
                <p className="text-sm font-bold text-sky-100 uppercase tracking-tighter">Idiomas</p>
              </div>
              <div className="bg-slate-900 p-8 rounded-[2rem] shadow-xl text-center space-y-2 text-white col-span-2">
                <p className="text-3xl font-black">Aprendizaje Activo</p>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-tighter">Basado en el Marco Común Europeo (MCER)</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- TECH STACK (DOCUMENTACIÓN) --- */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-black text-slate-900 mb-4">Arquitectura y Tecnología</h2>
            <p className="text-slate-500 font-medium">JumpUp está construido sobre un stack moderno de alto rendimiento para garantizar estabilidad y velocidad.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-[2.5rem] bg-slate-50 border border-slate-100 hover:border-sky-200 transition-all">
              <div className="bg-sky-100 p-4 rounded-2xl w-fit mb-6">
                <Code2 className="h-8 w-8 text-sky-600" />
              </div>
              <h3 className="text-xl font-black mb-3">Frontend Moderno</h3>
              <ul className="space-y-2 text-sm font-bold text-slate-500">
                <li className="flex items-center gap-2"><div className="h-1.5 w-1.5 rounded-full bg-sky-500"/> React 18 + Vite</li>
                <li className="flex items-center gap-2"><div className="h-1.5 w-1.5 rounded-full bg-sky-500"/> TypeScript para robustez</li>
                <li className="flex items-center gap-2"><div className="h-1.5 w-1.5 rounded-full bg-sky-500"/> Tailwind CSS 4.0</li>
                <li className="flex items-center gap-2"><div className="h-1.5 w-1.5 rounded-full bg-sky-500"/> Zustand (Estado Global)</li>
              </ul>
            </div>

            <div className="p-8 rounded-[2.5rem] bg-slate-50 border border-slate-100 hover:border-sky-200 transition-all">
              <div className="bg-blue-100 p-4 rounded-2xl w-fit mb-6">
                <Database className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-black mb-3">Backend Robusto</h3>
              <ul className="space-y-2 text-sm font-bold text-slate-500">
                <li className="flex items-center gap-2"><div className="h-1.5 w-1.5 rounded-full bg-blue-500"/> Django Rest Framework</li>
                <li className="flex items-center gap-2"><div className="h-1.5 w-1.5 rounded-full bg-blue-500"/> PostgreSQL Database</li>
                <li className="flex items-center gap-2"><div className="h-1.5 w-1.5 rounded-full bg-blue-500"/> Redis para Caching</li>
                <li className="flex items-center gap-2"><div className="h-1.5 w-1.5 rounded-full bg-blue-500"/> JWT Authentication</li>
              </ul>
            </div>

            <div className="p-8 rounded-[2.5rem] bg-slate-50 border border-slate-100 hover:border-sky-200 transition-all">
              <div className="bg-indigo-100 p-4 rounded-2xl w-fit mb-6">
                <Terminal className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-black mb-3">Infraestructura</h3>
              <ul className="space-y-2 text-sm font-bold text-slate-500">
                <li className="flex items-center gap-2"><div className="h-1.5 w-1.5 rounded-full bg-indigo-500"/> Docker Containers</li>
                <li className="flex items-center gap-2"><div className="h-1.5 w-1.5 rounded-full bg-indigo-500"/> Nginx Web Server</li>
                <li className="flex items-center gap-2"><div className="h-1.5 w-1.5 rounded-full bg-indigo-500"/> WebSockets (Django Channels)</li>
                <li className="flex items-center gap-2"><div className="h-1.5 w-1.5 rounded-full bg-indigo-500"/> GitHub Actions CI/CD</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* --- COLABORADORES --- */}
      <section className="py-24 bg-slate-900 text-white rounded-[4rem] mx-6 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-sky-500/20 blur-[150px] rounded-full" />

        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-5xl font-black">Equipo de Desarrollo</h2>
            <p className="text-sky-300 font-bold uppercase tracking-widest text-sm">Los arquitectos detrás de JumpUp</p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              { name: "Henry Macías", role: "Fullstack Developer", desc: "Especialista en arquitecturas escalables y seguridad de datos.", initials: "HM" },
              { name: "Kevin Guamán", role: "Frontend Lead", desc: "Experto en UI/UX y optimización de interfaces reactivas.", initials: "KG" },
              { name: "Andrés Paucar", role: "Backend Engineer", desc: "Responsable de la lógica de negocio y sistemas de IA.", initials: "AP" }
            ].map((member, i) => (
              <div key={i} className="group text-center space-y-6">
                <div className="mx-auto w-32 h-32 rounded-full bg-white/10 flex items-center justify-center text-3xl font-black border-4 border-white/5 group-hover:border-sky-500 transition-all duration-500 group-hover:scale-110">
                  {member.initials}
                </div>
                <div className="space-y-2">
                  <h4 className="text-2xl font-black">{member.name}</h4>
                  <Badge className="bg-sky-500/20 text-sky-400 border-sky-500/30 uppercase text-[10px] font-black">{member.role}</Badge>
                  <p className="text-slate-400 text-sm font-medium px-4">{member.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- SECCIÓN DE CAPACIDADES --- */}
      <section className="py-32 bg-white">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            <div className="lg:w-1/2 space-y-8">
              <h2 className="text-5xl font-black text-slate-900 leading-tight">Más que una app, un <span className="text-sky-500">ecosistema completo.</span></h2>
              <div className="grid gap-4">
                {[
                  { t: "Tutoría con IA", d: "Conversa 24/7 con nuestro tutor entrenado para corregirte.", i: BrainCircuit },
                  { t: "Ranking Global", d: "Compite con estudiantes de todo el mundo y gana premios.", i: Trophy },
                  { t: "Tienda de Recompensas", d: "Canjea tu XP por cursos reales y beneficios.", i: ShoppingBag }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 p-6 rounded-3xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                    <div className="bg-sky-500 p-3 rounded-2xl h-fit text-white">
                      <item.i className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="text-xl font-black">{item.t}</h4>
                      <p className="text-slate-500 font-medium">{item.d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="lg:w-1/2 bg-sky-100 rounded-[3rem] p-4 rotate-2 shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2070&auto=format&fit=crop"
                alt="Colaboración en equipo"
                className="rounded-[2.5rem] object-cover aspect-video"
              />
            </div>
          </div>
        </div>
      </section>

      {/* --- FOOTER CTA --- */}
      <section className="py-32 text-center bg-sky-50 border-t border-sky-100">
        <div className="container mx-auto px-6 max-w-4xl space-y-10">
          <h2 className="text-6xl font-black text-slate-900">¿Damos el salto?</h2>
          <p className="text-2xl text-slate-500 font-medium italic">
            "El único límite para aprender un idioma es el primer paso."
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Button asChild size="lg" className="h-20 px-16 rounded-3xl bg-slate-900 hover:bg-black text-white font-black text-2xl shadow-2xl transition-all hover:scale-105 active:scale-95">
              <Link to="/register">Crear Cuenta Gratis</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
