import {
  Globe2,
  Database,
  Smartphone,
  Cloud,
  Shield,
  Zap,
  Cpu,
  Network,
  Server,
  GitBranch,
  Lock,
  Gauge,
  ArrowUpRight,
  ArrowRight,
} from 'lucide-react'
import { SectionAnimated } from '@/presentation/components/ui/SectionAnimated'
import { useOutletContext } from 'react-router-dom'

interface OutletContextType {
  theme: 'light' | 'dark'
}

// Logos de tecnologías del stack
const techLogos = [
  { name: 'Flutter', img: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/flutter/flutter-original.svg' },
  { name: 'Dart', img: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/dart/dart-original.svg' },
  { name: 'Django', img: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/django/django-plain.svg' },
  { name: 'PostgreSQL', img: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg' },
  { name: 'Redis', img: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/redis/redis-original.svg' },
  { name: 'Docker', img: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg' },
  { name: 'Nginx', img: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nginx/nginx-original.svg' },
  { name: 'Python', img: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg' },
]

export default function TechPage() {
  const { theme } = useOutletContext<OutletContextType>()
  const isDark = theme === 'dark'

  // Paleta centralizada — un solo acento (sky), neutrales y hairlines
  const t = {
    page: isDark ? 'bg-[#0a0a0b] text-neutral-100' : 'bg-[#faf9f7] text-neutral-900',
    heroPanel: isDark ? 'bg-[#0e0e10]' : 'bg-[#f2f0ec]',
    border: isDark ? 'border-white/10' : 'border-black/10',
    borderStrong: isDark ? 'border-white/15' : 'border-black/15',
    card: isDark ? 'bg-[#111113]' : 'bg-white',
    cardHover: isDark ? 'hover:bg-[#161618]' : 'hover:bg-[#f6f4f1]',
    muted: isDark ? 'text-neutral-400' : 'text-neutral-500',
    faint: isDark ? 'text-neutral-500' : 'text-neutral-400',
    hairline: isDark ? 'bg-white/10' : 'bg-black/10',
    accent: 'text-sky-500',
    accentBg: isDark ? 'bg-sky-500/10' : 'bg-sky-500/10',
    chip: isDark ? 'bg-white/5 border-white/10 text-neutral-300' : 'bg-black/[0.03] border-black/10 text-neutral-600',
    surface: isDark ? 'bg-[#0e0e10]' : 'bg-white',
  }

  // Estadísticas reales
  const stats = [
    { label: 'Modelos de Datos', value: '57', icon: Database },
    { label: 'Endpoints API', value: '50+', icon: Network },
    { label: 'Canales WebSocket', value: '3', icon: Zap },
    { label: 'Tiempo de Respuesta', value: '<150ms', icon: Cpu },
  ]

  // Capas de la arquitectura
  const layers = [
    {
      index: '01',
      title: 'Frontend Móvil',
      desc: 'Interfaz nativa multiplataforma con estado reactivo y consumo de API tipado.',
      stack: ['Flutter', 'Dart', 'Riverpod', 'Dio'],
      icon: Smartphone,
    },
    {
      index: '02',
      title: 'Backend & API',
      desc: 'Lógica de negocio, autenticación y capa REST construida sobre Django REST Framework.',
      stack: ['Django', 'DRF', 'WebSockets'],
      icon: Server,
    },
    {
      index: '03',
      title: 'Datos & Caché',
      desc: 'Persistencia relacional robusta con cacheo en memoria para respuestas de baja latencia.',
      stack: ['PostgreSQL', 'Redis'],
      icon: Database,
    },
    {
      index: '04',
      title: 'Infraestructura',
      desc: 'Contenedores, proxy inverso y despliegue continuo con cero tiempo de inactividad.',
      stack: ['Docker', 'Nginx', 'CI/CD'],
      icon: Cloud,
    },
  ]

  // Pilares del stack
  const pillars = [
    {
      icon: Gauge,
      title: 'Alto Rendimiento',
      desc: 'Respuestas por debajo de 150ms gracias al cacheo con Redis y consultas optimizadas.',
    },
    {
      icon: Lock,
      title: 'Seguridad Robusta',
      desc: 'Autenticación por tokens, cifrado en tránsito y buenas prácticas OWASP en cada endpoint.',
    },
    {
      icon: GitBranch,
      title: 'CI/CD Automatizado',
      desc: 'Despliegues continuos con Docker y Nginx que garantizan cero tiempo de inactividad.',
    },
  ]

  // Flujo de datos
  const flow = [
    { icon: Smartphone, title: 'App Móvil', desc: 'Flutter · Riverpod · Dio' },
    { icon: Server, title: 'Backend & API', desc: 'Django · DRF · WebSockets' },
    { icon: Cloud, title: 'Infraestructura', desc: 'Docker · Nginx · CI/CD' },
  ]

  return (
    <SectionAnimated
      direction="up"
      className={`py-0 relative w-full transition-colors duration-500 overflow-hidden ${t.page}`}
    >
      {/* ===== HERO ===== */}
      <header className="max-w-7xl mx-auto px-6 lg:px-8 pt-24 pb-16">
        <div className="grid lg:grid-cols-12 gap-10 items-end">
          <div className="lg:col-span-8">
            <div className={`inline-flex items-center gap-2.5 mb-8 pl-1.5 pr-3.5 py-1.5 rounded-full border ${t.border}`}>
              <span className={`grid place-items-center h-6 w-6 rounded-full ${t.accentBg}`}>
                <Globe2 className={`h-3.5 w-3.5 ${t.accent}`} />
              </span>
              <span className={`text-[11px] font-semibold uppercase tracking-[0.2em] ${t.muted}`}>
                Stack de vanguardia
              </span>
            </div>

            <h1 className="text-5xl sm:text-6xl md:text-7xl font-semibold leading-[0.98] tracking-tight text-balance">
              Tecnología construida
              <br />
              para <span className={`italic font-light ${t.accent}`}>escalar</span> sin fricción.
            </h1>
          </div>

          <div className="lg:col-span-4">
            <p className={`text-base leading-relaxed text-pretty ${t.muted}`}>
              JumpUp se apoya en un stack robusto que garantiza baja latencia,
              máxima estabilidad y una experiencia fluida en todos los
              dispositivos.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {['Flutter', 'Django', 'PostgreSQL', 'Redis', 'Docker'].map((tech) => (
                <span
                  key={tech}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border ${t.chip}`}
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className={`mt-14 h-px w-full ${t.hairline}`} />
      </header>

      {/* ===== ECOSISTEMA / LOGOS ===== */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 pb-20">
        <div className="flex items-baseline justify-between mb-8">
          <h2 className={`text-xs font-semibold uppercase tracking-[0.2em] ${t.faint}`}>
            Nuestro ecosistema
          </h2>
          <span className={`text-xs ${t.faint}`}>08 tecnologías</span>
        </div>

        <div className={`grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 border-t border-l ${t.border}`}>
          {techLogos.map((tech) => (
            <div
              key={tech.name}
              title={tech.name}
              className={`group flex flex-col items-center justify-center gap-3 aspect-square border-r border-b ${t.border} ${t.cardHover} transition-colors duration-300`}
            >
              <img
                src={tech.img || "/placeholder.svg"}
                alt={tech.name}
                className="w-10 h-10 object-contain grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500"
              />
              <span className={`text-[11px] font-medium ${t.muted}`}>{tech.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ===== ARQUITECTURA POR CAPAS ===== */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 pb-20">
        <div className="max-w-2xl mb-12">
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-balance">
            Arquitectura por capas
          </h2>
          <p className={`mt-3 text-base leading-relaxed ${t.muted}`}>
            Cada capa está diseñada para ser escalable, segura y de alto
            rendimiento, con responsabilidades claramente delimitadas.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-px">
          {layers.map((layer) => (
            <article
              key={layer.title}
              className={`group relative flex flex-col p-7 border ${t.border} ${t.card} ${t.cardHover} transition-colors duration-300`}
            >
              <div className="flex items-start justify-between mb-8">
                <span className={`text-sm font-mono ${t.faint}`}>{layer.index}</span>
                <layer.icon className={`h-5 w-5 ${t.accent}`} strokeWidth={1.75} />
              </div>

              <h3 className="text-lg font-semibold mb-2">{layer.title}</h3>
              <p className={`text-sm leading-relaxed mb-6 ${t.muted}`}>{layer.desc}</p>

              <div className="mt-auto flex flex-wrap gap-1.5">
                {layer.stack.map((s) => (
                  <span key={s} className={`px-2 py-1 rounded-md text-[11px] font-medium border ${t.chip}`}>
                    {s}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ===== DIAGRAMA DE FLUJO ===== */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 pb-20">
        <div className={`rounded-2xl border ${t.border} ${t.surface} p-8 md:p-12`}>
          <h2 className={`text-xs font-semibold uppercase tracking-[0.2em] mb-10 ${t.faint}`}>
            Flujo de datos
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr_auto_1fr] gap-6 md:gap-4 items-stretch">
            {flow.map((node, i) => (
              <div key={node.title} className="contents">
                <div className={`flex flex-col gap-4 p-6 rounded-xl border ${t.border} ${t.card}`}>
                  <span className={`grid place-items-center h-11 w-11 rounded-lg ${t.accentBg}`}>
                    <node.icon className={`h-5 w-5 ${t.accent}`} strokeWidth={1.75} />
                  </span>
                  <div>
                    <h4 className="font-semibold">{node.title}</h4>
                    <p className={`text-sm mt-1 ${t.muted}`}>{node.desc}</p>
                  </div>
                </div>

                {i < flow.length - 1 && (
                  <div className="flex items-center justify-center">
                    <ArrowRight className={`h-5 w-5 rotate-90 md:rotate-0 ${t.faint}`} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PILARES ===== */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 pb-20">
        <div className="max-w-2xl mb-12">
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-balance">
            Pilares del stack
          </h2>
          <p className={`mt-3 text-base leading-relaxed ${t.muted}`}>
            Los fundamentos que hacen de nuestra plataforma una elección superior.
          </p>
        </div>

        <div className={`grid grid-cols-1 md:grid-cols-3 border-t border-l ${t.border}`}>
          {pillars.map((p) => (
            <div
              key={p.title}
              className={`group p-8 border-r border-b ${t.border} ${t.cardHover} transition-colors duration-300`}
            >
              <div className="flex items-center justify-between mb-6">
                <span className={`grid place-items-center h-11 w-11 rounded-lg ${t.accentBg}`}>
                  <p.icon className={`h-5 w-5 ${t.accent}`} strokeWidth={1.75} />
                </span>
                <ArrowUpRight className={`h-5 w-5 ${t.faint} group-hover:${t.accent} transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5`} />
              </div>
              <h3 className="text-lg font-semibold mb-2">{p.title}</h3>
              <p className={`text-sm leading-relaxed ${t.muted}`}>{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== ESTADÍSTICAS ===== */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 pb-20">
        <div className={`grid grid-cols-2 md:grid-cols-4 border-t border-l ${t.border}`}>
          {stats.map((stat) => (
            <div
              key={stat.label}
              className={`p-8 border-r border-b ${t.border}`}
            >
              <stat.icon className={`h-5 w-5 mb-6 ${t.accent}`} strokeWidth={1.75} />
              <div className="text-4xl md:text-5xl font-semibold tracking-tight">
                {stat.value}
              </div>
              <div className={`mt-2 text-sm ${t.muted}`}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== CIERRE ===== */}
      <footer className="max-w-7xl mx-auto px-6 lg:px-8 pb-20">
        <div className={`h-px w-full ${t.hairline} mb-6`} />
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className={`inline-flex items-center gap-2 text-xs uppercase tracking-widest ${t.faint}`}>
            <Shield className={`h-4 w-4 ${t.accent}`} strokeWidth={1.75} />
            Seguridad y rendimiento al máximo
          </span>
          <span className={`text-xs ${t.faint}`}>© 2027 JumpUp · Tecnología de vanguardia</span>
        </div>
      </footer>
    </SectionAnimated>
  )
}
