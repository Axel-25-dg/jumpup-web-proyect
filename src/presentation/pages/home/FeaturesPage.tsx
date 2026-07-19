import {
  MessageSquareCode,
  BrainCircuit,
  Trophy,
  ShoppingBag,
  Download,
  Smartphone,
  Users,
  Globe,
  Zap,
  Star,
  Sparkles,
  Rocket,
  ArrowUpRight,
  Check,
  Apple,
} from 'lucide-react';
import { SectionAnimated } from '@/presentation/components/ui/SectionAnimated';
import { useOutletContext } from 'react-router-dom';

interface OutletContextType {
  theme: 'light' | 'dark';
}

export default function FeaturesPage() {
  const { theme } = useOutletContext<OutletContextType>();
  const isDark = theme === 'dark';

  // Paleta editorial premium centralizada
  const t = {
    bg: isDark ? 'bg-[#0a0a0b]' : 'bg-[#f7f6f3]',
    text: isDark ? 'text-neutral-100' : 'text-neutral-900',
    sub: isDark ? 'text-neutral-400' : 'text-neutral-500',
    faint: isDark ? 'text-neutral-500' : 'text-neutral-400',
    line: isDark ? 'border-white/10' : 'border-black/10',
    lineStrong: isDark ? 'border-white/20' : 'border-black/20',
    card: isDark ? 'bg-white/[0.03]' : 'bg-white',
    cardHover: isDark ? 'hover:bg-white/[0.06]' : 'hover:bg-black/[0.02]',
    accent: 'text-sky-500',
    accentBg: 'bg-sky-500',
    grid: isDark ? 'divide-white/10' : 'divide-black/10',
  };

  const stats = [
    { label: 'Estudiantes activos', value: '20K+', icon: Users },
    { label: 'Idiomas disponibles', value: '5', icon: Globe },
    { label: 'Lecciones completadas', value: '150K+', icon: Zap },
    { label: 'Puntuación media', value: '4.8', icon: Star },
  ];

  const features = [
    {
      icon: BrainCircuit,
      title: 'Tutoría con IA',
      description:
        'Conversa 24/7 con nuestro tutor entrenado para corregirte y guiar tu pronunciación en tiempo real.',
    },
    {
      icon: Trophy,
      title: 'Ranking Global',
      description:
        'Compite de manera sana con estudiantes de todo el mundo y obtén recompensas exclusivas.',
    },
    {
      icon: ShoppingBag,
      title: 'Tienda de Recompensas',
      description:
        'Canjea tus puntos de experiencia por cursos de nivel superior y beneficios reales.',
    },
    {
      icon: MessageSquareCode,
      title: 'Chat Comunitario',
      description:
        'Conéctate con otros estudiantes, comparte dudas y practica en un entorno colaborativo.',
    },
    {
      icon: Rocket,
      title: 'Minijuegos Educativos',
      description:
        'Flashcards, Ahorcado, Trivia, Memory y Sopa de letras para aprender jugando.',
    },
    {
      icon: Sparkles,
      title: 'Gamificación Total',
      description:
        'Gana XP, sube de nivel, mantén rachas diarias y desbloquea logros exclusivos.',
    },
  ];

  const steps = [
    {
      title: 'Descarga e instala',
      description: 'Obtén el APK oficial y crea tu cuenta en menos de un minuto.',
    },
    {
      title: 'Elige tu idioma',
      description: 'Selecciona entre 5 idiomas y define tu meta diaria de aprendizaje.',
    },
    {
      title: 'Aprende jugando',
      description: 'Completa lecciones, gana XP y sube en el ranking global cada día.',
    },
  ];

  const highlights = [
    'Sin conexión disponible',
    'Actualizaciones gratuitas',
    'Contenido para todos los niveles',
    'Corrección de pronunciación',
  ];

  return (
    <SectionAnimated
      direction="up"
      className={`relative w-full overflow-hidden transition-colors duration-300 ${t.bg} ${t.text}`}
    >
      {/* ===== HERO (alineado al diseño editorial) ===== */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className={`grid grid-cols-1 gap-0 border-b lg:grid-cols-12 ${t.line}`}>

          {/* Texto */}
          <div className={`flex flex-col justify-center py-16 lg:col-span-6 lg:border-r lg:py-24 lg:pr-12 ${t.line}`}>
            <div className="flex items-center gap-3">
              <span className={`flex h-8 w-8 items-center justify-center border ${t.lineStrong}`}>
                <Smartphone className={`h-4 w-4 ${t.accent}`} />
              </span>
              <span className="text-xs font-medium uppercase tracking-[0.25em]">
                JumpUp Idiomas — App Móvil
              </span>
            </div>

            <h1 className="mt-8 text-balance text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl md:text-6xl">
              Más que una app,
              <br />
              un <span className="font-light italic">ecosistema</span> completo.
            </h1>

            <p className={`mt-6 max-w-md text-pretty text-base leading-relaxed ${t.sub}`}>
              Aprende idiomas de forma interactiva con inteligencia artificial,
              gamificación y una comunidad global que te acompaña en cada paso.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
              <a
                href="https://github.com/Axel-25-dg/jumpup_idiomas_movil/releases/download/v1.0.1/app-release.apk"
                target="_blank"
                rel="noopener noreferrer"
                className={`group inline-flex items-center justify-center gap-2 px-7 py-4 text-sm font-medium text-white transition-transform hover:-translate-y-0.5 ${t.accentBg}`}
              >
                <Download className="h-4 w-4" />
                Descargar APK
                <span className="opacity-70">v1.0.1</span>
              </a>
              <a
                href="#"
                className={`inline-flex items-center justify-center gap-2 border px-6 py-4 text-sm font-medium transition-colors ${t.lineStrong} ${t.cardHover}`}
              >
                <Globe className="h-4 w-4" />
                Ver en la web
              </a>
            </div>

            <div className="mt-10 flex flex-wrap gap-x-6 gap-y-2">
              {highlights.map((h) => (
                <span key={h} className={`inline-flex items-center gap-2 text-xs ${t.sub}`}>
                  <Check className={`h-3.5 w-3.5 ${t.accent}`} />
                  {h}
                </span>
              ))}
            </div>
          </div>

          {/* Imagen hero (alineada al estilo original) */}
          <div className="relative lg:col-span-6">
            <div className="group relative h-full min-h-[380px] overflow-hidden">
              <img
                src="https://guaman-idiomas-ute.online/media/media/f428dd43-eb62-47/acfecaf6e0154ba692b99bad561caee2.png"
                alt="Aplicación móvil de JumpUp Idiomas"
                className="h-full w-full object-cover grayscale transition-all duration-700 group-hover:grayscale-0"
              />
              <div className={`pointer-events-none absolute inset-0 ${isDark ? 'bg-sky-500/10' : 'bg-sky-500/5'} mix-blend-multiply`} />
              <div className="absolute bottom-5 left-5 flex items-center gap-2 bg-sky-500 px-4 py-2 text-xs font-medium text-white">
                <Smartphone className="h-3.5 w-3.5" />
                Disponible en Android
              </div>
            </div>
          </div>

        </div>
      </div>
      {/* ===== STATS ===== */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className={`grid grid-cols-2 border-b divide-x md:grid-cols-4 ${t.line} ${t.grid} border-l border-r-0`}>
          {stats.map((s) => (
            <div key={s.label} className={`border-r px-6 py-10 ${t.line}`}>
              <s.icon className={`h-5 w-5 ${t.accent}`} />
              <div className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">{s.value}</div>
              <div className={`mt-1 text-xs uppercase tracking-wider ${t.faint}`}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ===== FEATURES ===== */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className={`flex items-end justify-between border-b py-10 ${t.line}`}>
          <div>
            <span className={`text-xs font-medium uppercase tracking-[0.25em] ${t.accent}`}>
              Características
            </span>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              Todo lo que necesitas <span className="font-light italic">para aprender</span>
            </h2>
          </div>
          <span className={`hidden text-sm sm:block ${t.faint}`}>06 herramientas</span>
        </div>

        <div className={`grid grid-cols-1 border-l border-b sm:grid-cols-2 lg:grid-cols-3 ${t.line}`}>
          {features.map((f, i) => (
            <div
              key={f.title}
              className={`group relative border-r border-t p-8 transition-colors ${t.line} ${t.cardHover}`}
            >
              <div className="flex items-start justify-between">
                <span className={`flex h-11 w-11 items-center justify-center border ${t.lineStrong}`}>
                  <f.icon className={`h-5 w-5 ${t.accent}`} />
                </span>
                <span className={`text-xs tabular-nums ${t.faint}`}>
                  {String(i + 1).padStart(2, '0')}
                </span>
              </div>
              <h3 className="mt-6 text-lg font-semibold tracking-tight">{f.title}</h3>
              <p className={`mt-2 text-sm leading-relaxed ${t.sub}`}>{f.description}</p>
              <ArrowUpRight
                className={`mt-6 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 ${t.accent}`}
              />
            </div>
          ))}
        </div>
      </div>

      {/* ===== SHOWCASE (pantallas) ===== */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className={`grid grid-cols-1 items-stretch border-b lg:grid-cols-12 ${t.line}`}>
          <div className="relative lg:col-span-7">
            <div className="group relative h-full min-h-[360px] overflow-hidden">
              <video
                src="/app_publicidad.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="h-full w-full object-cover grayscale transition-all duration-700 group-hover:grayscale-0"
              />
              <div className={`pointer-events-none absolute inset-0 ${isDark ? 'bg-sky-500/10' : 'bg-sky-500/5'} mix-blend-multiply`} />
            </div>
          </div>
          <div className={`flex flex-col justify-center border-t p-10 lg:col-span-5 lg:border-l lg:border-t-0 ${t.line}`}>
            <span className={`text-xs font-medium uppercase tracking-[0.25em] ${t.accent}`}>
              Diseño intuitivo
            </span>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight">
              Una interfaz <span className="font-light italic">pensada para ti</span>
            </h2>
            <p className={`mt-4 text-sm leading-relaxed ${t.sub}`}>
              Cada pantalla está diseñada para que tu progreso sea claro y motivador.
              Lecciones, ranking y tutor con IA, siempre a un toque de distancia.
            </p>
            <div className={`mt-8 grid grid-cols-2 divide-x border-t ${t.grid} ${t.line}`}>
              <div className="py-5 pr-5">
                <div className="text-2xl font-semibold">100%</div>
                <div className={`text-xs uppercase tracking-wider ${t.faint}`}>Offline</div>
              </div>
              <div className="py-5 pl-5">
                <div className="text-2xl font-semibold">4.8</div>
                <div className={`text-xs uppercase tracking-wider ${t.faint}`}>Play Store</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== STEPS ===== */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className={`border-b py-10 ${t.line}`}>
          <span className={`text-xs font-medium uppercase tracking-[0.25em] ${t.accent}`}>
            Cómo empezar
          </span>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            Tres pasos <span className="font-light italic">para tu primer día</span>
          </h2>
        </div>
        <div className={`grid grid-cols-1 border-l border-b md:grid-cols-3 ${t.line}`}>
          {steps.map((s, i) => (
            <div key={s.title} className={`border-r border-t p-8 ${t.line}`}>
              <div className={`text-5xl font-semibold tracking-tight ${t.accent}`}>
                {String(i + 1).padStart(2, '0')}
              </div>
              <h3 className="mt-5 text-lg font-semibold tracking-tight">{s.title}</h3>
              <p className={`mt-2 text-sm leading-relaxed ${t.sub}`}>{s.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ===== COMMUNITY + GAMIFICATION IMAGES ===== */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className={`grid grid-cols-1 border-b md:grid-cols-2 ${t.line}`}>
          <figure className={`group relative overflow-hidden border-r ${t.line}`}>
            <img
              src="https://guaman-idiomas-ute.online/media/media/2ee4ffa8-f984-4b/0fdcb6a5ec5440d79725eee011863236.jpg"
              alt="Comunidad de estudiantes de idiomas"
              className="h-72 w-full object-cover grayscale transition-all duration-700 group-hover:grayscale-0 md:h-96"
            />
            <figcaption className="absolute bottom-5 left-5 bg-sky-500 px-4 py-2 text-xs font-medium text-white">
              Comunidad global
            </figcaption>
          </figure>
          <figure className="group relative overflow-hidden">
            <img
              src="https://guaman-idiomas-ute.online/media/media/12c8316f-077b-47/64462f2b8ae4434ca6726577ee24da9d.png"
              alt="Minijuegos educativos en la app"
              className="h-72 w-full object-cover grayscale transition-all duration-700 group-hover:grayscale-0 md:h-96"
            />
            <figcaption className="absolute bottom-5 left-5 bg-sky-500 px-4 py-2 text-xs font-medium text-white">
              Aprende jugando
            </figcaption>
          </figure>
        </div>
      </div>

      {/* ===== CTA ===== */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className={`flex flex-col items-center gap-6 border-b py-20 text-center ${t.line}`}>
          <h2 className="max-w-2xl text-balance text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">
            Empieza a aprender <span className="font-light italic">hoy mismo</span>
          </h2>
          <p className={`max-w-md text-sm leading-relaxed ${t.sub}`}>
            Descarga JumpUp Idiomas y únete a más de 20.000 estudiantes que ya aprenden jugando.
          </p>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row">
            <a
              href="https://github.com/Axel-25-dg/jumpup_idiomas_movil/releases/download/v1.0.1/app-release.apk"
              target="_blank"
              rel="noopener noreferrer"
              className={`group inline-flex items-center justify-center gap-2 px-8 py-4 text-sm font-medium text-white transition-transform hover:-translate-y-0.5 ${t.accentBg}`}
            >
              <Download className="h-4 w-4" />
              Descargar APK (Android)
            </a>
            <a
              href="#"
              className={`inline-flex items-center justify-center gap-2 border px-8 py-4 text-sm font-medium transition-colors ${t.lineStrong} ${t.cardHover}`}
            >
              <Apple className="h-4 w-4" />
              Próximamente en iOS
            </a>
          </div>
        </div>
      </div>

      {/* ===== FOOTER CREDITS ===== */}
      <div className="mx-auto max-w-7xl px-6 py-12 text-center lg:px-8">
        <p className={`text-sm ${t.sub}`}>
          Desarrollado por{' '}
          <span className={`font-medium ${t.accent}`}>
            Danny Guamán · Alex Macías · Ariel Paucar
          </span>
        </p>
        <p className={`mt-1 text-xs ${t.faint}`}>
          {`© ${new Date().getFullYear()} JumpUp Idiomas — Universidad Tecnológica Equinoccial`}
        </p>
      </div>
    </SectionAnimated>
  );
}