import { Link, useOutletContext } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import {
  ArrowRight,
  ArrowUpRight,
  Sparkles,
  MapPin,
  Info,
  GraduationCap,
  School,
  Brain,
  Trophy,
  Globe,
  Mic,
  Star,
  Quote,
} from 'lucide-react'
import { Button } from '@/presentation/components/ui/button'

export default function HomePage() {
  const { theme } = useOutletContext<{ theme: 'light' | 'dark' }>()
  const dark = theme === 'dark'

  const heroImage =
    'https://guaman-idiomas-ute.online/media/media/dad42e8c-7d5f-4f/3d7010514fef482584093c0c11404a66.webp'

  // Rockstar parallax displacement based on scroll position
  const { scrollY } = useScroll()
  const y = useTransform(scrollY, [0, 800], [0, 200])

  // Centralized theme tokens for easy palette tuning
  const t = {
    page: dark ? 'bg-[#0a0e14] text-slate-100' : 'bg-[#f7f6f3] text-slate-900',
    sectionAlt: dark ? 'bg-[#0c1119]' : 'bg-white',
    hairline: dark ? 'border-white/10' : 'border-slate-900/10',
    muted: dark ? 'text-slate-400' : 'text-slate-500',
    body: dark ? 'text-slate-300' : 'text-slate-600',
    heading: dark ? 'text-white' : 'text-slate-900',
    chip: dark
      ? 'bg-white/[0.03] border-white/10 text-slate-300'
      : 'bg-white border-slate-900/10 text-slate-700',
    cardBg: dark ? 'bg-white/[0.02]' : 'bg-white',
    accent: 'text-sky-500',
  }

  const stats = [
    { value: '120K+', label: 'Estudiantes activos' },
    { value: '38', label: 'Idiomas disponibles' },
    { value: '4.9', label: 'Valoración media' },
    { value: '24/7', label: 'Tutoría con IA' },
  ]

  const features = [
    {
      icon: Brain,
      title: 'IA Adaptativa',
      desc: 'Un tutor que ajusta cada lección a tu ritmo, tus errores y tus objetivos en tiempo real.',
    },
    {
      icon: Trophy,
      title: 'Gamificación',
      desc: 'Ligas, rachas y recompensas que convierten la práctica diaria en un hábito adictivo.',
    },
    {
      icon: Globe,
      title: 'Comunidad Global',
      desc: 'Conversa con hablantes nativos y compañeros de todo el mundo en retos reales.',
    },
    {
      icon: Mic,
      title: 'Corrección por Voz',
      desc: 'Pronuncia y recibe feedback fonético instantáneo para sonar natural desde el día uno.',
    },
  ]

  const steps = [
    {
      k: '01',
      title: 'Define tu meta',
      desc: 'Cuéntanos tu nivel y para qué quieres el idioma. La IA diseña tu ruta personalizada.',
    },
    {
      k: '02',
      title: 'Practica a diario',
      desc: 'Micro-lecciones inmersivas de pocos minutos, con conversación real y feedback inmediato.',
    },
    {
      k: '03',
      title: 'Alcanza la fluidez',
      desc: 'Mide tu progreso con métricas claras y salta de nivel con certificaciones reconocidas.',
    },
  ]

  const testimonials = [
    {
      quote:
        'En tres meses pasé de no poder pedir un café a mantener reuniones de trabajo en inglés. La tutoría de IA es de otro nivel.',
      name: 'Camila R.',
      role: 'Diseñadora UX',
    },
    {
      quote:
        'La gamificación me enganchó. Llevo 214 días de racha y por primera vez disfruto estudiar un idioma.',
      name: 'Andrés M.',
      role: 'Estudiante UTE',
    },
    {
      quote:
        'Hablar con la comunidad global me dio la confianza que ningún libro me dio en años.',
      name: 'Sofía L.',
      role: 'Ingeniera de datos',
    },
  ]

  return (
    <div className={`w-full relative flex flex-col transition-colors duration-300 ${t.page}`}>
      {/* --- HERO WITH ROCKSTAR PARALLAX --- */}
      <section className="relative h-screen w-full overflow-hidden flex flex-col justify-center items-center">
        <motion.div style={{ y }} className="absolute inset-0 z-0 h-[120vh] w-full">
          <motion.img
            src={heroImage || '/placeholder.svg'}
            alt="Estudiantes dando el salto hacia la fluidez"
            className="w-full h-full object-cover object-center grayscale-[35%]"
            initial={{ scale: 1 }}
            animate={{ scale: 1.15 }}
            transition={{ duration: 30, repeat: Infinity, repeatType: 'reverse', ease: 'linear' }}
          />
        </motion.div>

        {/* Cinematic overlay */}
        <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/70 via-black/45 to-black/80" />

        {/* Frame hairlines */}
        <div className="absolute inset-4 sm:inset-6 z-20 border border-white/15 pointer-events-none" />

        {/* Hero content */}
        <div className="relative z-30 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 text-center max-w-6xl mx-auto w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="inline-flex items-center gap-2 px-4 py-2 border border-white/25 bg-white/5 backdrop-blur-md"
          >
            <Sparkles className="h-3.5 w-3.5 text-sky-400" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-100">
              La revolución del aprendizaje de idiomas
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 35 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
            className="mt-8 text-5xl sm:text-7xl md:text-8xl font-black tracking-tight leading-[0.92] text-white text-balance"
          >
            Salta al siguiente
            <br />
            <span className="italic font-light text-sky-400">nivel de fluidez.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 35 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="mt-8 text-base sm:text-xl text-slate-200 font-medium max-w-2xl mx-auto leading-relaxed text-pretty"
          >
            Domina un nuevo idioma con la plataforma que combina inteligencia artificial,
            gamificación y una comunidad global.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 35 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.42, ease: [0.16, 1, 0.3, 1] }}
            className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto"
          >
            <Button
              asChild
              size="lg"
              className="w-full sm:w-auto h-14 px-10 rounded-none bg-sky-500 hover:bg-sky-400 text-white font-bold text-base tracking-wide transition-all group cursor-pointer"
            >
              <Link to="/register" className="flex items-center justify-center gap-2">
                Empezar gratis
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="w-full sm:w-auto h-14 px-10 rounded-none border border-white/30 bg-transparent text-white font-bold text-base tracking-wide hover:bg-white/10 transition-all cursor-pointer"
            >
              <Link to="/login" className="flex items-center justify-center">
                Iniciar sesión
              </Link>
            </Button>
          </motion.div>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2">
          <span className="text-[10px] uppercase tracking-[0.3em] text-white/60">Desliza</span>
          <div className="h-10 w-px bg-white/30" />
        </div>
      </section>

      {/* --- STATS STRIP --- */}
      <section className={`w-full border-y ${t.hairline} ${t.sectionAlt}`}>
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4">
          {stats.map((s, i) => (
            <div
              key={s.label}
              className={`px-6 py-10 md:py-14 border-b md:border-b-0 ${t.hairline} ${i !== 0 ? `md:border-l ${t.hairline}` : ''
                } ${i % 2 !== 0 ? `border-l ${t.hairline} md:border-l` : ''}`}
            >
              <div className={`text-4xl md:text-5xl font-black tracking-tight ${t.heading}`}>
                {s.value}
              </div>
              <div className={`mt-2 text-xs uppercase tracking-[0.2em] ${t.muted}`}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* --- SECCIÓN 1: INFORMACIÓN GENERAL --- */}
      <section className={`py-24 md:py-32 w-full border-b ${t.hairline} ${t.sectionAlt}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            <div className="lg:w-1/2 space-y-8">
              <div className={`inline-flex items-center gap-2 px-4 py-2 border ${t.chip}`}>
                <Info className="h-4 w-4 text-sky-500" />
                <span className="text-[11px] font-bold uppercase tracking-[0.22em]">
                  Información general
                </span>
              </div>
              <h2 className={`text-3xl sm:text-4xl md:text-5xl font-black leading-tight text-balance ${t.heading}`}>
                Un salto estratégico hacia tu{' '}
                <span className="italic font-light text-sky-500">futuro bilingüe.</span>
              </h2>
              <p className={`text-base sm:text-lg leading-relaxed text-pretty ${t.body}`}>
                JumpUp es un ecosistema interactivo de vanguardia diseñado para acelerar tu
                aprendizaje mediante inteligencia artificial adaptativa y dinámicas de gamificación
                inmersivas. Olvídate de memorizar gramática aburrida: interactúa con nuestro tutor de
                IA 24/7 y compite en retos reales mientras acumulas recompensas.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-transparent">
                <div className={`flex items-start gap-3 py-4 pr-6 border-t ${t.hairline}`}>
                  <GraduationCap className="h-6 w-6 text-sky-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className={`font-bold ${t.heading}`}>Metodología activa</h4>
                    <p className={`text-sm ${t.muted}`}>Aprende haciendo con simulaciones reales.</p>
                  </div>
                </div>
                <div className={`flex items-start gap-3 py-4 pr-6 border-t ${t.hairline}`}>
                  <Sparkles className="h-6 w-6 text-sky-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className={`font-bold ${t.heading}`}>Tutoría IA inteligente</h4>
                    <p className={`text-sm ${t.muted}`}>Corrección gramatical inmediata por voz.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Rockstar zoom image */}
            <div className="lg:w-1/2 w-full">
              <div className={`relative overflow-hidden border ${t.hairline}`}>
                <div className="overflow-hidden aspect-[4/3] relative group">
                  <motion.img
                    src="https://guaman-idiomas-ute.online/media/media/1bd96a4a-5826-42/62bec80165d448f991d501745c5b0c3c.jpg"
                    alt="Estudiantes en el campus"
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-[filter] duration-700"
                    initial={{ scale: 1 }}
                    animate={{ scale: 1.12 }}
                    transition={{ duration: 15, repeat: Infinity, repeatType: 'reverse', ease: 'linear' }}
                  />
                </div>
                <div className={`flex items-center justify-between px-5 py-4 border-t ${t.hairline} ${t.cardBg}`}>
                  <span className={`text-xs uppercase tracking-[0.2em] ${t.muted}`}>
                    Experiencia inmersiva
                  </span>
                  <ArrowUpRight className="h-4 w-4 text-sky-500" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- FEATURES GRID --- */}
      <section className={`py-24 md:py-32 w-full border-b ${t.hairline} ${t.page}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className={`inline-flex items-center gap-2 px-4 py-2 border ${t.chip}`}>
              <Star className="h-4 w-4 text-sky-500" />
              <span className="text-[11px] font-bold uppercase tracking-[0.22em]">
                Por qué JumpUp
              </span>
            </div>
            <h2 className={`mt-6 text-3xl sm:text-4xl md:text-5xl font-black leading-tight text-balance ${t.heading}`}>
              Todo lo que necesitas para{' '}
              <span className="italic font-light text-sky-500">hablar de verdad.</span>
            </h2>
          </div>

          <div className={`mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border-t border-l ${t.hairline}`}>
            {features.map((f) => (
              <div
                key={f.title}
                className={`group p-8 border-b border-r ${t.hairline} ${t.cardBg} transition-colors hover:bg-sky-500/[0.04]`}
              >
                <div className={`flex h-12 w-12 items-center justify-center border ${t.hairline}`}>
                  <f.icon className="h-6 w-6 text-sky-500" />
                </div>
                <h3 className={`mt-6 text-xl font-bold ${t.heading}`}>{f.title}</h3>
                <p className={`mt-3 text-sm leading-relaxed ${t.body}`}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- METHODOLOGY STEPS --- */}
      <section className={`py-24 md:py-32 w-full border-b ${t.hairline} ${t.sectionAlt}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <h2 className={`text-3xl sm:text-4xl md:text-5xl font-black leading-tight text-balance ${t.heading}`}>
              Fluidez en{' '}
              <span className="italic font-light text-sky-500">tres pasos.</span>
            </h2>
            <p className={`max-w-md text-base ${t.body}`}>
              Un método probado que convierte minutos diarios en resultados reales, medibles y
              duraderos.
            </p>
          </div>

          <div className={`mt-16 grid grid-cols-1 md:grid-cols-3 border-t border-l ${t.hairline}`}>
            {steps.map((s) => (
              <div key={s.k} className={`p-8 md:p-10 border-b border-r ${t.hairline}`}>
                <span className="text-5xl font-black text-sky-500/80">{s.k}</span>
                <h3 className={`mt-6 text-2xl font-bold ${t.heading}`}>{s.title}</h3>
                <p className={`mt-3 text-base leading-relaxed ${t.body}`}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- SECCIÓN 2: UBICACIÓN UTE --- */}
      <section className={`py-24 md:py-32 w-full border-b ${t.hairline} ${t.page}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row-reverse gap-16 items-center">
            <div className="lg:w-1/2 space-y-8">
              <div className={`inline-flex items-center gap-2 px-4 py-2 border ${t.chip}`}>
                <MapPin className="h-4 w-4 text-sky-500" />
                <span className="text-[11px] font-bold uppercase tracking-[0.22em]">
                  Ubicación de excelencia
                </span>
              </div>
              <h2 className={`text-3xl sm:text-4xl md:text-5xl font-black leading-tight text-balance ${t.heading}`}>
                Estamos situados en la{' '}
                <span className="italic font-light text-sky-500">Universidad UTE.</span>
              </h2>
              <p className={`text-base sm:text-lg leading-relaxed text-pretty ${t.body}`}>
                Nuestras operaciones académicas y de desarrollo tecnológico tienen su sede principal
                en los modernos laboratorios de la Universidad UTE en Quito, Ecuador. Aprovechamos su
                infraestructura de vanguardia y talento de primer nivel para impulsar la
                investigación aplicada en inteligencia artificial y tecnologías educativas.
              </p>

              <div className={`flex items-center gap-4 text-sm font-bold py-4 border-t ${t.hairline} ${t.muted}`}>
                <School className="h-6 w-6 text-sky-500" />
                <span>Campus Matriz UTE — Quito, Ecuador</span>
              </div>
            </div>

            <div className="lg:w-1/2 w-full">
              <div className={`relative overflow-hidden border ${t.hairline} group`}>
                <img
                  src="https://guaman-idiomas-ute.online/media/media/b380d01b-3573-41/e081bd96730d4cc3a8c1159eae4a8a41.png"
                  alt="Campus de la Universidad UTE"
                  className="w-full h-auto block grayscale group-hover:grayscale-0 transition-[filter] duration-700"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- TESTIMONIALS --- */}
      <section className={`py-24 md:py-32 w-full border-b ${t.hairline} ${t.sectionAlt}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className={`inline-flex items-center gap-2 px-4 py-2 border ${t.chip}`}>
              <Quote className="h-4 w-4 text-sky-500" />
              <span className="text-[11px] font-bold uppercase tracking-[0.22em]">
                Lo que dicen
              </span>
            </div>
            <h2 className={`mt-6 text-3xl sm:text-4xl md:text-5xl font-black leading-tight text-balance ${t.heading}`}>
              Miles de saltos{' '}
              <span className="italic font-light text-sky-500">ya cumplidos.</span>
            </h2>
          </div>

          <div className={`mt-16 grid grid-cols-1 md:grid-cols-3 border-t border-l ${t.hairline}`}>
            {testimonials.map((tm) => (
              <figure key={tm.name} className={`p-8 md:p-10 border-b border-r ${t.hairline} ${t.cardBg}`}>
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-sky-500 text-sky-500" />
                  ))}
                </div>
                <blockquote className={`mt-6 text-base leading-relaxed ${t.body}`}>
                  {'"'}
                  {tm.quote}
                  {'"'}
                </blockquote>
                <figcaption className="mt-6">
                  <div className={`font-bold ${t.heading}`}>{tm.name}</div>
                  <div className={`text-sm ${t.muted}`}>{tm.role}</div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* --- FINAL CTA --- */}
      <section className={`py-24 md:py-32 w-full ${t.page}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`relative overflow-hidden border ${t.hairline} bg-sky-500`}>
            <div className="relative z-10 px-8 py-16 md:px-16 md:py-24 text-center">
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[0.95] text-white text-balance">
                Da el salto.
                <br />
                <span className="italic font-light text-sky-950">Empieza hoy, gratis.</span>
              </h2>
              <p className="mt-6 text-lg text-sky-50/90 max-w-xl mx-auto text-pretty">
                Únete a más de 120.000 estudiantes que ya están alcanzando la fluidez con JumpUp.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button
                  asChild
                  size="lg"
                  className="w-full sm:w-auto h-14 px-10 rounded-none bg-white text-sky-600 hover:bg-slate-100 font-bold text-base tracking-wide transition-all group cursor-pointer"
                >
                  <Link to="/register" className="flex items-center justify-center gap-2">
                    Crear mi cuenta
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto h-14 px-10 rounded-none border border-white/60 bg-transparent text-white font-bold text-base tracking-wide hover:bg-white/10 transition-all cursor-pointer"
                >
                  <Link to="/login" className="flex items-center justify-center">
                    Ya tengo cuenta
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}