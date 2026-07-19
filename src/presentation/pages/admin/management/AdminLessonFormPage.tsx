import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import {
  ArrowLeft,
  Save,
  Loader2,
  BookOpen,
  Layers,
  Video,
  FileText,
  Headphones,
  Smartphone
} from 'lucide-react'
import { Button } from '@/presentation/components/ui/button'
import { toast } from 'sonner'
import { courseRepo } from '@/infrastructure/factories/teacher.factory'
import type { Course, Module } from '@/domain/entities/course.entity'

const contentTypeOptions = [
  { value: 'text', label: 'TEXTO / ARTICULO', icon: FileText },
  { value: 'video', label: 'VIDEO TUTORIAL', icon: Video },
  { value: 'interactive', label: 'PRACTICA INTERACTIVA', icon: Smartphone },
  { value: 'audio', label: 'AUDIO / PODCAST', icon: Headphones },
]

export default function AdminLessonFormPage() {
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const isEditing = Boolean(id)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [courses, setCourses] = useState<Course[]>([])
  const [modules, setModules] = useState<Module[]>([])

  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null)
  const [selectedModuleId, setSelectedModuleId] = useState<number | null>(
    id ? null : (searchParams.get('module') ? Number(searchParams.get('module')) : null)
  )
  const [title, setTitle] = useState('')
  const [contentType, setContentType] = useState('text')
  const [order, setOrder] = useState(1)
  const [xpReward, setXpReward] = useState(10)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const courseResult = await courseRepo.getAll({ page_size: 100 })
        setCourses(courseResult.results || [])

        if (id) {
          const moduleIdFromParams = searchParams.get('module')
          if (moduleIdFromParams) {
            const mId = Number(moduleIdFromParams)
            setSelectedModuleId(mId)
            // Cargar lecciones del modulo para encontrar la nuestra
            const lesns = await courseRepo.getLessonsByModule(mId)
            const lesson = lesns.find(l => l.id === Number(id))
            if (lesson) {
              setTitle(lesson.title)
              setContentType(lesson.content_type)
              setOrder(lesson.order)
              setXpReward(lesson.xp_reward)
            } else {
              toast.error('Leccion no encontrada')
              navigate('/admin/management/lessons')
            }
          } else {
            toast.error('Parametro module requerido en la URL')
            navigate('/admin/management/lessons')
          }
        } else if (searchParams.get('module')) {
          const mId = Number(searchParams.get('module'))
          setSelectedModuleId(mId)
        }
      } catch (err) {
        console.error(err)
        toast.error('Error al cargar datos')
      } finally {
        setLoading(false)
      }
    }
    void loadData()
  }, [id]) // eslint-disable-line

  useEffect(() => {
    if (!selectedCourseId) {
      setModules([])
      return
    }
    const loadModules = async () => {
      try {
        const mods = await courseRepo.getModulesByCourse(selectedCourseId)
        setModules(mods)
        if (!id && mods.length > 0 && !selectedModuleId) {
          setSelectedModuleId(mods[0].id)
        }
      } catch {
        toast.error('Error al cargar modulos')
      }
    }
    void loadModules()
  }, [selectedCourseId]) // eslint-disable-line

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !selectedModuleId) {
      toast.error('Completa todos los campos requeridos')
      return
    }
    setSaving(true)
    try {
      if (id) {
        await courseRepo.updateLesson(Number(id), {
          title: title.trim(),
          content_type: contentType,
          order,
          xp_reward: xpReward,
        })
        toast.success('Leccion actualizada con exito')
      } else {
        await courseRepo.createLesson({
          module: selectedModuleId,
          title: title.trim(),
          content_type: contentType,
          order,
          xp_reward: xpReward,
        })
        toast.success('Leccion creada con exito')
      }
      navigate('/admin/management/lessons')
    } catch (err: any) {
      toast.error(err?.detail || 'Error al guardar la leccion')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
        <p className="label-caps text-slate-400">Sincronizando Unidades Didacticas...</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="animate-in fade-in duration-500 pb-20">
      {/* HERO SECTION */}
      <section className="border-b border-slate-900/10 dark:border-white/10 px-8 md:px-12 py-14 md:py-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Button type="button" variant="ghost" size="icon" asChild className="-ml-2 rounded-none hover:bg-slate-100 dark:hover:bg-white/5">
                <Link to="/admin/management/lessons"><ArrowLeft className="h-4 w-4" /></Link>
              </Button>
              <div className="chip">
                <BookOpen className="h-3.5 w-3.5 text-sky-500" />
                Contenidos
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white uppercase">
              {isEditing ? 'Editar' : 'Nueva'} <span className="text-sky-500">Leccion</span>.
            </h1>
            <p className="text-base text-slate-500 dark:text-slate-400 max-w-lg font-medium">
              Configuracion de unidades didacticas, tipos de contenido multimedia y gamificacion.
            </p>
          </div>
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/admin/management/lessons')}
              className="rounded-none border-slate-900/10 dark:border-white/10 font-bold uppercase text-[11px] tracking-[0.2em] px-8 py-6 h-auto hover:bg-slate-50 dark:hover:bg-white/5 transition-all"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="rounded-none bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold uppercase text-[11px] tracking-[0.2em] px-8 py-6 h-auto hover:bg-sky-500 dark:hover:bg-sky-500 hover:text-white transition-all shadow-none"
            >
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {isEditing ? 'Actualizar Leccion' : 'Crear Leccion'}
            </Button>
          </div>
        </div>
      </section>

      {/* FORM BODY */}
      <div className="max-w-6xl mx-auto px-8 md:px-12 py-12">
        <div className="grid lg:grid-cols-[1fr_350px] gap-12">
          {/* Main Fields */}
          <div className="space-y-12">
            <div className="space-y-8">
              <div className="flex items-center gap-3 border-b border-slate-900/10 dark:border-white/10 pb-4">
                <Layers className="h-5 w-5 text-sky-500" />
                <h2 className="label-caps text-slate-900 dark:text-white font-black">Informacion de la Leccion</h2>
              </div>
              <div className="space-y-2">
                <label className="label-caps text-slate-400 text-[10px]">Titulo de la Leccion <span className="text-sky-500">*</span></label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="EJ. INTRODUCCION A LAS ESTRUCTURAS"
                  className="w-full border border-slate-900/10 dark:border-white/10 bg-transparent py-4 px-4 text-[12px] font-bold uppercase tracking-widest outline-none focus:border-sky-500 transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="label-caps text-slate-400 text-[10px]">Formato de Contenido</label>
                <div className="grid grid-cols-2 gap-px bg-slate-900/10 dark:bg-white/10 border border-slate-900/10 dark:border-white/10">
                  {contentTypeOptions.map(opt => {
                    const Icon = opt.icon
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setContentType(opt.value)}
                        className={`flex items-center gap-3 py-3 px-4 text-[11px] font-bold uppercase tracking-widest transition-colors ${
                          contentType === opt.value
                            ? 'bg-sky-500 text-white'
                            : 'bg-white dark:bg-[#0a0a0b] text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        {opt.label}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar / Settings */}
          <div className="space-y-8">
            <div className="p-8 border border-slate-900/10 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02]">
              <h3 className="label-caps text-slate-900 dark:text-white font-black mb-6">Parametros Tecnicos</h3>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="label-caps text-slate-400 text-[10px]">Curso</label>
                  <select
                    value={selectedCourseId ?? ''}
                    onChange={(e) => setSelectedCourseId(e.target.value ? Number(e.target.value) : null)}
                    className="w-full appearance-none border border-slate-900/10 dark:border-white/10 bg-white dark:bg-[#0a0a0b] py-4 px-4 text-[11px] font-bold uppercase tracking-widest outline-none focus:border-sky-500 transition-colors"
                  >
                    <option value="" disabled>SELECCIONAR CURSO...</option>
                    {courses.map(c => (
                      <option key={c.id} value={c.id}>{c.title.toUpperCase()} ({c.difficulty_level})</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="label-caps text-slate-400 text-[10px]">Modulo</label>
                  <select
                    value={selectedModuleId ?? ''}
                    onChange={(e) => setSelectedModuleId(e.target.value ? Number(e.target.value) : null)}
                    disabled={isEditing}
                    className="w-full appearance-none border border-slate-900/10 dark:border-white/10 bg-white dark:bg-[#0a0a0b] py-4 px-4 text-[11px] font-bold uppercase tracking-widest outline-none focus:border-sky-500 transition-colors disabled:opacity-60"
                  >
                    <option value="" disabled>SELECCIONAR MODULO...</option>
                    {modules.map(m => (
                      <option key={m.id} value={m.id}>{m.title.toUpperCase()}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="label-caps text-slate-400 text-[10px]">Orden de Secuencia</label>
                  <input
                    type="number"
                    min={1}
                    value={order}
                    onChange={(e) => setOrder(Number(e.target.value))}
                    className="w-full border border-slate-900/10 dark:border-white/10 bg-transparent py-4 px-4 text-[12px] font-bold uppercase tracking-widest outline-none focus:border-sky-500 transition-colors max-w-[120px]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="label-caps text-slate-400 text-[10px]">Recompensa (XP)</label>
                  <input
                    type="number"
                    min={0}
                    value={xpReward}
                    onChange={(e) => setXpReward(Number(e.target.value))}
                    className="w-full border border-slate-900/10 dark:border-white/10 bg-transparent py-4 px-4 text-[12px] font-bold uppercase tracking-widest outline-none focus:border-sky-500 transition-colors max-w-[120px]"
                  />
                </div>
              </div>
            </div>
            <div className="p-8 border border-slate-900/10 dark:border-white/10 border-dashed">
              <p className="label-micro text-slate-400 leading-relaxed font-mono">
                LA MODIFICACION DEL CONTENIDO DE LA LECCION AFECTA A LA EXPERIENCIA DE APRENDIZAJE.
                VERIFIQUE EL TIPO DE CONTENIDO Y LA RECOMPENSA ANTES DE GUARDAR.
              </p>
            </div>
          </div>
        </div>
      </div>
    </form>
  )
}