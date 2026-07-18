import {
  History,
  Rocket,
  Code2,
  Users,
  Sparkles,
  Zap,
  Trophy,
  Globe,
  Award,
  Target,
  Brain,
  Heart,
  Flame,
  Quote,
  Lightbulb,
  ShieldCheck,
  ArrowUpRight,
} from 'lucide-react'
import { SectionAnimated } from '@/presentation/components/ui/SectionAnimated'
import { useOutletContext } from 'react-router-dom'

export default function StoryPage() {
  const { theme } = useOutletContext<{ theme: 'light' | 'dark' }>()
  const isDark = theme === 'dark'

  // Paleta centralizada (editorial premium, acento único sky)
  const t = {
    bg: isDark ? 'bg-[#0a0a0b]' : 'bg-[#f7f6f3]',
    text: isDark ? 'text-neutral-100' : 'text-neutral-900',
    muted: isDark ? 'text-neutral-400' : 'text-neutral-500',
    faint: isDark ? 'text-neutral-500' : 'text-neutral-400',
    line: isDark ? 'border-neutral-800' : 'border-neutral-200',
    lineBg: isDark ? 'bg-neutral-800' : 'bg-neutral-200',
    card: isDark ? 'bg-neutral-900/40' : 'bg-white',
    cardHover: isDark ? 'hover:bg-neutral-900' : 'hover:bg-neutral-50',
    accent: 'text-sky-500',
    accentBg: isDark ? 'bg-sky-500/10' : 'bg-sky-50',
    accentBorder: isDark ? 'border-sky-500/30' : 'border-sky-200',
  }

  const timeline = [
    {
      year: '2025',
      title: 'La Chispa',
      desc: 'Cuatro estudiantes de Software, una noche de café y frustración por un examen de inglés, dibujan el concepto en una servilleta.',
      icon: Lightbulb,
    },
    {
      year: '2026',
      title: 'El Origen',
      desc: 'Nace oficialmente JumpUp en los laboratorios de la UTE. El primer prototipo funciona: una app que convierte el aprendizaje en un juego.',
      icon: Rocket,
    },
    {
      year: '2026',
      title: 'IA Integrada',
      desc: 'Integramos OpenAI GPT-4o para crear Nova, el tutor virtual que conversa, corrige y motiva a los estudiantes 24/7.',
      icon: Brain,
    },
    {
      year: '2027',
      title: 'Gamificación Total',
      desc: 'Lanzamos el sistema de XP, niveles, rachas y logros. Cada error suma experiencia y cada acierto te acerca a la cima del ranking global.',
      icon: Trophy,
    },
    {
      year: '2027',
      title: 'Comunidad Global',
      desc: 'Superamos los 20,000 estudiantes en 50 países. JumpUp se convierte en un puente cultural entre continentes.',
      icon: Globe,
    },
  ]

  const values = [
    {
      icon: Heart,
      title: 'Sin miedo a equivocarse',
      desc: 'Cada error es un paso más hacia la fluidez. Aquí no hay calificaciones, solo aprendizaje constante.',
    },
    {
      icon: Flame,
      title: 'Constancia sobre intensidad',
      desc: 'Cinco minutos al día construyen un hábito; tres horas una vez al mes, solo frustración. Diseñamos para la constancia.',
    },
    {
      icon: Brain,
      title: 'IA que se adapta a ti',
      desc: 'Nuestro tutor aprende tu ritmo, tus fallos y tus metas. Cada lección es única, porque tú eres único.',
    },
    {
      icon: ShieldCheck,
      title: 'Aprendizaje sin ansiedad',
      desc: 'Sin notificaciones culposas ni muros de pago. Creemos en la educación como un derecho, no como un privilegio.',
    },
  ]

  const stats = [
    { label: 'Estudiantes', value: '20K+', icon: Users },
    { label: 'Países', value: '50+', icon: Globe },
    { label: 'Lecciones', value: '1.2K+', icon: Target },
    { label: 'XP Generado', value: '5M+', icon: Zap },
  ]

  return (
    <SectionAnimated
      direction="up"
      className={`py-0 sm:py-0 relative w-full transition-colors duration-500 overflow-hidden ${t.bg} ${t.text}`}
    >
      {/* ===== HERO ===== */}
      <div className="relative min-h-[92vh] flex items-end overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://guaman-idiomas-ute.online/media/media/9ead07c7-1f71-4e/7af66d79fabf4d0b9f2edad7725a8229.jpg"
            alt="Equipo JumpUp"
            className="w-full h-full object-cover grayscale"
          />
          <div
            className={`absolute inset-0 ${isDark
              ? 'bg-gradient-to-t from-[#0a0a0b] via-[#0a0a0b]/70 to-[#0a0a0b]/30'
              : 'bg-gradient-to-t from-[#f7f6f3] via-[#f7f6f3]/70 to-[#f7f6f3]/20'
              }`}
          />
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-8 pb-16 md:pb-24">
          <div className="flex items-center gap-3 mb-8">
            <span className={`h-9 w-9 grid place-items-center border ${t.line} ${t.accent}`}>
              <Rocket className="h-4 w-4" />
            </span>
            <span className={`text-[11px] font-semibold uppercase tracking-[0.25em] ${t.muted}`}>
              Origen · UTE 2026
            </span>
          </div>

          <h1 className="text-5xl sm:text-7xl md:text-8xl font-semibold leading-[0.98] tracking-tight text-balance max-w-4xl">
            El código que
            <br />
            <span className={`${t.accent} italic font-light`}>rompió las barreras.</span>
          </h1>

          <p className={`mt-8 max-w-xl text-base md:text-lg leading-relaxed ${t.muted}`}>
            Todo nació en los laboratorios de la{' '}
            <strong className={t.text}>Universidad UTE</strong>. Un grupo de estudiantes de
            Software, hartos de las aplicaciones de idiomas monótonas, decidimos que era hora
            de hackear el aprendizaje.
          </p>

          <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3">
            {[
              { icon: Code2, label: 'Desarrollo UTE' },
              { icon: Users, label: 'Comunidad Global' },
              { icon: Award, label: 'Excelencia Académica' },
            ].map((chip, i) => (
              <div key={i} className="flex items-center gap-2">
                <chip.icon className={`h-4 w-4 ${t.accent}`} />
                <span className={`text-sm font-medium ${t.text}`}>{chip.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ===== MANIFIESTO ===== */}
      <div className="max-w-4xl mx-auto px-6 lg:px-8 py-24 md:py-32">
        <div className="flex items-center gap-4 mb-10">
          <Quote className={`h-6 w-6 ${t.accent}`} />
          <span className={`text-[11px] font-semibold uppercase tracking-[0.25em] ${t.muted}`}>
            Nuestro Manifiesto
          </span>
          <span className={`flex-1 h-px ${t.lineBg}`} />
        </div>
        <p className="text-3xl md:text-5xl font-semibold leading-[1.1] tracking-tight text-pretty">
          Aprender un idioma no debería sentirse como una tarea, sino como el{' '}
          <span className={`${t.accent} italic font-light`}>nivel de un juego</span> que no
          quieres soltar.
        </p>
        <p className={`mt-8 text-base md:text-lg leading-relaxed max-w-2xl ${t.muted}`}>
          No construimos otra app de tarjetas de vocabulario. Construimos un mundo donde
          equivocarse suma XP, donde tu racha importa y donde una IA te acompaña hasta que
          hablar otro idioma se vuelva tan natural como respirar.
        </p>
      </div>

      {/* ===== SECCIONES IMAGEN + TEXTO ===== */}
      <div className={`border-t ${t.line}`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {/* Fila 1 */}
          <div className={`grid md:grid-cols-2 gap-10 md:gap-16 items-center py-20 md:py-28 border-b ${t.line}`}>
            <div className="order-2 md:order-1 overflow-hidden group">
              <img
                src="https://guaman-idiomas-ute.online/media/media/adfac6b1-38f8-4e/3930d9f4fe544aa0bb1e22a8ee0c851e.png"
                alt="Código en pantalla"
                className="object-cover w-full h-80 md:h-[28rem] grayscale group-hover:grayscale-0 transition-all duration-700"
              />
            </div>
            <div className="order-1 md:order-2">
              <div className={`flex items-center gap-2 mb-5 text-[11px] font-semibold uppercase tracking-[0.25em] ${t.accent}`}>
                <Code2 className="h-4 w-4" />
                Desarrollo
              </div>
              <h2 className="text-3xl md:text-5xl font-semibold leading-tight tracking-tight text-balance">
                Hecho por estudiantes,{' '}
                <span className={`${t.accent} italic font-light`}>para estudiantes</span>
              </h2>
              <p className={`mt-6 text-base md:text-lg leading-relaxed ${t.muted}`}>
                Cada línea de código fue escrita en las mismas aulas donde hoy estudian nuestros
                usuarios. Conocemos las dificultades, las horas de estudio y la frustración de un
                mal examen. Por eso JumpUp no es solo una app, es una solución creada desde la
                empatía.
              </p>
            </div>
          </div>

          {/* Fila 2 */}
          <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center py-20 md:py-28">
            <div>
              <div className={`flex items-center gap-2 mb-5 text-[11px] font-semibold uppercase tracking-[0.25em] ${t.accent}`}>
                <Users className="h-4 w-4" />
                Comunidad
              </div>
              <h2 className="text-3xl md:text-5xl font-semibold leading-tight tracking-tight text-balance">
                De un laboratorio{' '}
                <span className={`${t.accent} italic font-light`}>al mundo entero</span>
              </h2>
              <p className={`mt-6 text-base md:text-lg leading-relaxed ${t.muted}`}>
                Lo que empezó como un proyecto universitario hoy conecta a más de 20,000 personas
                en 50 países. Cada día, estudiantes de diferentes culturas aprenden juntos,
                comparten sus logros y se motivan para seguir avanzando.
              </p>
            </div>
            <div className="overflow-hidden group">
              <img
                src="https://guaman-idiomas-ute.online/media/media/46b487f9-ca0a-43/2108f1cc3a76477297e17bc1fb4c08fd.jpg"
                alt="Comunidad global"
                className="object-cover w-full h-80 md:h-[28rem] grayscale group-hover:grayscale-0 transition-all duration-700"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ===== LÍNEA DE TIEMPO ===== */}
      <div className={`border-t ${t.line}`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-24 md:py-32">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-16">
            <div>
              <div className={`flex items-center gap-2 mb-4 text-[11px] font-semibold uppercase tracking-[0.25em] ${t.accent}`}>
                <History className="h-4 w-4" />
                Evolución
              </div>
              <h2 className="text-4xl md:text-6xl font-semibold tracking-tight text-balance">
                Cinco hitos, <span className={`${t.accent} italic font-light`}>una misión</span>
              </h2>
            </div>
            <p className={`max-w-sm text-base leading-relaxed ${t.muted}`}>
              El camino de JumpUp hacia la transformación del aprendizaje de idiomas, año a año.
            </p>
          </div>

          <div className={`border-t ${t.line}`}>
            {timeline.map((item, index) => (
              <div
                key={index}
                className={`grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8 py-8 md:py-10 border-b ${t.line} group items-start`}
              >
                <div className="md:col-span-2 flex items-center gap-4">
                  <span className={`text-sm font-mono ${t.faint}`}>
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className={`text-lg font-semibold ${t.accent}`}>{item.year}</span>
                </div>
                <div className="md:col-span-1 hidden md:flex justify-center">
                  <span className={`h-10 w-10 grid place-items-center border ${t.line} ${t.text} group-hover:${t.accentBg} transition-colors`}>
                    <item.icon className="h-4 w-4" />
                  </span>
                </div>
                <h3 className="md:col-span-3 text-xl md:text-2xl font-semibold tracking-tight">
                  {item.title}
                </h3>
                <p className={`md:col-span-6 text-base leading-relaxed ${t.muted}`}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ===== VALORES ===== */}
      <div className={`border-t ${t.line}`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-24 md:py-32">
          <div className="mb-16">
            <div className={`flex items-center gap-2 mb-4 text-[11px] font-semibold uppercase tracking-[0.25em] ${t.accent}`}>
              <Sparkles className="h-4 w-4" />
              Principios
            </div>
            <h2 className="text-4xl md:text-6xl font-semibold tracking-tight text-balance max-w-3xl">
              Cuatro pilares que guían{' '}
              <span className={`${t.accent} italic font-light`}>cada decisión</span>
            </h2>
          </div>

          <div className={`grid grid-cols-1 sm:grid-cols-2 border-t border-l ${t.line}`}>
            {values.map((v, i) => (
              <div
                key={i}
                className={`p-8 md:p-10 border-b border-r ${t.line} ${t.cardHover} transition-colors group`}
              >
                <div className="flex items-start justify-between mb-8">
                  <span className={`h-11 w-11 grid place-items-center border ${t.line} ${t.accent}`}>
                    <v.icon className="h-5 w-5" />
                  </span>
                  <ArrowUpRight className={`h-5 w-5 ${t.faint} group-hover:${t.accent} group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all`} />
                </div>
                <h3 className="text-xl font-semibold tracking-tight mb-3">{v.title}</h3>
                <p className={`text-base leading-relaxed ${t.muted}`}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ===== ESTADÍSTICAS ===== */}
      <div className={`border-t ${t.line}`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className={`grid grid-cols-2 md:grid-cols-4 border-l ${t.line}`}>
            {stats.map((stat, idx) => (
              <div
                key={idx}
                className={`py-12 md:py-16 px-6 border-r ${t.line} text-center group`}
              >
                <stat.icon className={`mx-auto h-6 w-6 mb-5 ${t.accent}`} />
                <div className="text-4xl md:text-6xl font-semibold tracking-tight tabular-nums">
                  {stat.value}
                </div>
                <div className={`mt-2 text-xs font-semibold uppercase tracking-[0.2em] ${t.muted}`}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ===== CIERRE ===== */}
      <div className={`border-t ${t.line}`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className={`h-4 w-4 ${t.accent}`} />
            <span className={`text-xs uppercase tracking-[0.2em] ${t.muted}`}>
              Construyendo el futuro del aprendizaje
            </span>
          </div>
          <p className={`text-xs ${t.faint}`}>© 2027 JumpUp · Hecho en la UTE</p>
        </div>
      </div>
    </SectionAnimated>
  )
}