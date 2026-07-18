import { SiGithub, SiInstagram } from 'react-icons/si';
import { FaLinkedinIn } from 'react-icons/fa';
import { Badge } from '@/presentation/components/ui/badge';
import { SectionAnimated } from '@/presentation/components/ui/SectionAnimated';
import { useOutletContext } from 'react-router-dom';
import { ArrowUpRight, Briefcase, Target, Zap, Award } from 'lucide-react';

interface OutletContextType {
  theme: 'light' | 'dark';
}

const TEAM_MEMBERS = [
  {
    name: 'Alex Macías',
    role: 'Fullstack Developer',
    image:
      'https://guaman-idiomas-ute.online/media/media/2476b91e-a692-4f/91a455be53974ca79124c1ff8d4f3645.png',
    desc: 'Arquitecturas escalables, seguridad y lógica de integración backend. Apasionado por sistemas distribuidos y DevOps.',
    social: {
      github: 'https://github.com',
      linkedin: 'https://linkedin.com/in/tu-perfil',
      instagram: 'https://instagram.com',
    },
    skills: ['AWS Certified', 'Kubernetes', 'Microservicios'],
    stats: { projects: 24, years: 10 },
  },
  {
    name: 'Alexander Guamán',
    role: 'Frontend Lead',
    image:
      'https://guaman-idiomas-ute.online/media/media/f9b6a15d-ca88-46/73d1fc0767f448189a9e448df8356093.png',
    desc: 'Experto en UI/UX, animaciones complejas y diseño de interfaces reactivas. Especialista en motion design y performance.',
    social: {
      github: 'https://github.com',
      linkedin: 'https://linkedin.com/in/tu-perfil',
      instagram: 'https://instagram.com',
    },
    skills: ['UI/UX Senior', 'Framer Motion', 'Design Systems'],
    stats: { projects: 18, years: 8 },
  },
  {
    name: 'Ariel Paucar',
    role: 'Backend Engineer',
    image:
      'https://static.vecteezy.com/system/resources/thumbnails/041/641/689/small/3d-character-people-close-up-portrait-smiling-nice-3d-avartar-or-icon-png.png',
    desc: 'Especialista en procesamiento de lenguaje natural y sistemas IA. Constructor de pipelines de ML a escala.',
    social: {
      github: 'https://github.com',
      linkedin: 'https://linkedin.com/in/tu-perfil',
      instagram: 'https://instagram.com',
    },
    skills: ['PhD en IA', 'NLP', 'MLOps'],
    stats: { projects: 12, years: 12 },
  },
];

const teamStats = [
  { label: 'Años combinados', value: '30+', icon: Briefcase },
  { label: 'Proyectos entregados', value: '54', icon: Target },
  { label: 'Tecnologías', value: '15+', icon: Zap },
  { label: 'Certificaciones', value: '8', icon: Award },
];

const values = [
  {
    index: '01',
    title: 'Calidad ante todo',
    desc: 'Cada línea de código pasa por revisión exhaustiva y pruebas automatizadas antes de llegar a producción.',
  },
  {
    index: '02',
    title: 'Innovación constante',
    desc: 'Exploramos las últimas tecnologías para elevar la experiencia y adelantarnos a lo que viene.',
  },
  {
    index: '03',
    title: 'Colaboración real',
    desc: 'Creemos en el poder del equipo, el feedback continuo y la transparencia en cada decisión.',
  },
];

export default function TeamPage() {
  const { theme } = useOutletContext<OutletContextType>();
  const isDark = theme === 'dark';

  // Paleta editorial: neutros + un único acento sobrio
  const t = {
    section: isDark ? 'bg-[#0a0a0b] text-neutral-100' : 'bg-[#f7f6f3] text-neutral-900',
    muted: isDark ? 'text-neutral-400' : 'text-neutral-500',
    subtle: isDark ? 'text-neutral-300' : 'text-neutral-600',
    hairline: isDark ? 'border-neutral-800' : 'border-neutral-200',
    card: isDark ? 'bg-neutral-950 border-neutral-800/80' : 'bg-white border-neutral-200',
    chip: isDark
      ? 'border-neutral-800 text-neutral-300'
      : 'border-neutral-200 text-neutral-600',
    accent: 'text-sky-500',
    social: isDark
      ? 'border-neutral-800 text-neutral-400 hover:text-neutral-100 hover:border-neutral-600'
      : 'border-neutral-200 text-neutral-500 hover:text-neutral-900 hover:border-neutral-400',
  };

  return (
    <SectionAnimated
      direction="up"
      className={`relative w-full overflow-hidden py-24 transition-colors duration-500 sm:py-32 ${t.section}`}
    >
      <div className="relative z-10 mx-auto max-w-6xl px-6 lg:px-8">
        {/* ===== ENCABEZADO EDITORIAL ===== */}
        <header className={`border-b pb-14 ${t.hairline}`}>
          <div className="flex items-center gap-3">
            <Badge
              className={`rounded-none border bg-transparent px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] ${t.chip}`}
            >
              Equipo técnico
            </Badge>
            <span className={`h-px flex-1 ${isDark ? 'bg-neutral-800' : 'bg-neutral-200'}`} />
            <span className={`text-[11px] font-medium uppercase tracking-[0.25em] ${t.muted}`}>
              JumpUp / 2027
            </span>
          </div>

          <div className="mt-10 grid gap-8 md:grid-cols-12 md:items-end">
            <h1 className="col-span-8 text-balance text-5xl font-semibold leading-[0.95] tracking-tight sm:text-6xl md:text-7xl">
              Personas que{' '}
              <span className="italic font-light">construyen</span>
              <br />
              productos que <span className={t.accent}>importan.</span>
            </h1>
            <p className={`col-span-4 text-pretty text-base leading-relaxed ${t.subtle}`}>
              Un equipo reducido de ingenieros obsesionados con el detalle, la
              performance y la experiencia. Sin ruido, solo trabajo bien hecho.
            </p>
          </div>
        </header>

        {/* ===== PERFILES ===== */}
        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {TEAM_MEMBERS.map((member, index) => (
            <article
              key={member.name}
              className={`group flex flex-col overflow-hidden rounded-2xl border transition-all duration-500 hover:-translate-y-1.5 ${t.card} ${isDark ? 'hover:border-neutral-700' : 'hover:shadow-[0_20px_60px_-20px_rgba(0,0,0,0.15)]'
                }`}
            >
              <div className="relative aspect-[4/5] overflow-hidden">
                <span
                  className={`absolute left-4 top-4 z-10 text-xs font-medium tracking-widest ${t.muted}`}
                >
                  0{index + 1}
                </span>
                <img
                  src={member.image || '/placeholder.svg'}
                  alt={member.name}
                  className="h-full w-full object-cover grayscale transition-all duration-700 ease-out group-hover:scale-[1.04] group-hover:grayscale-0"
                />
                <div
                  className={`absolute inset-0 bg-gradient-to-t ${isDark ? 'from-neutral-950 via-neutral-950/10' : 'from-black/40 via-transparent'
                    } to-transparent`}
                />
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-5">
                  <div>
                    <h3 className="text-xl font-semibold tracking-tight text-white">
                      {member.name}
                    </h3>
                    <p className="text-sm font-medium text-sky-300">{member.role}</p>
                  </div>
                  <ArrowUpRight className="h-5 w-5 -translate-y-1 text-white/70 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100" />
                </div>
              </div>

              <div className="flex flex-1 flex-col p-5">
                <p className={`text-sm leading-relaxed ${t.subtle}`}>{member.desc}</p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {member.skills.map((skill) => (
                    <span
                      key={skill}
                      className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${t.chip}`}
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                <div className={`mt-5 flex items-center justify-between border-t pt-4 ${t.hairline}`}>
                  <div className="flex gap-5">
                    <span className={`text-xs ${t.muted}`}>
                      <span className="font-semibold text-sky-500">{member.stats.years}</span> años
                    </span>
                    <span className={`text-xs ${t.muted}`}>
                      <span className="font-semibold text-sky-500">{member.stats.projects}</span>{' '}
                      proyectos
                    </span>
                  </div>
                  <div className="flex gap-2">
                    {[
                      { href: member.social.github, Icon: SiGithub },
                      { href: member.social.linkedin, Icon: FaLinkedinIn },
                      { href: member.social.instagram, Icon: SiInstagram },
                    ].map(({ href, Icon }, i) => (
                      <a
                        key={i}
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex h-8 w-8 items-center justify-center rounded-full border transition-colors duration-300 ${t.social}`}
                      >
                        <Icon size={14} />
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* ===== ESTADÍSTICAS ===== */}
        <div className={`mt-20 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border md:grid-cols-4 ${t.hairline} ${isDark ? 'bg-neutral-800/60' : 'bg-neutral-200'}`}>
          {teamStats.map((stat) => (
            <div
              key={stat.label}
              className={`flex flex-col gap-2 p-8 ${isDark ? 'bg-[#0a0a0b]' : 'bg-[#f7f6f3]'}`}
            >
              <stat.icon className={`h-5 w-5 ${t.muted}`} />
              <div className="text-4xl font-semibold tracking-tight">{stat.value}</div>
              <div className={`text-sm ${t.muted}`}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* ===== CULTURA / VALORES ===== */}
        <div className="mt-24">
          <div className="flex items-end justify-between gap-4">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Nuestra cultura
            </h2>
            <span className={`hidden text-sm sm:block ${t.muted}`}>
              Principios que nos definen
            </span>
          </div>

          <div className={`mt-10 grid gap-px overflow-hidden rounded-2xl border md:grid-cols-3 ${t.hairline} ${isDark ? 'bg-neutral-800/60' : 'bg-neutral-200'}`}>
            {values.map((val) => (
              <div
                key={val.index}
                className={`group p-8 transition-colors duration-300 ${isDark ? 'bg-[#0a0a0b] hover:bg-neutral-950' : 'bg-[#f7f6f3] hover:bg-white'}`}
              >
                <span className={`text-sm font-medium tracking-widest ${t.accent}`}>
                  {val.index}
                </span>
                <h3 className="mt-4 text-lg font-semibold tracking-tight">{val.title}</h3>
                <p className={`mt-2 text-sm leading-relaxed ${t.subtle}`}>{val.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ===== PIE ===== */}
        <footer className={`mt-24 flex flex-col items-center gap-2 border-t pt-10 text-center ${t.hairline}`}>
          <p className={`text-sm ${t.muted}`}>Excelencia en cada detalle</p>
          <p className={`text-xs ${t.muted}`}>© 2027 JumpUp · Equipo técnico</p>
        </footer>
      </div>
    </SectionAnimated>
  );
}
