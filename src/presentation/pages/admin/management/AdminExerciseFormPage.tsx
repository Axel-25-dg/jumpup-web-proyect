import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import {
  ArrowLeft,
  Save,
  Loader2,
  CheckCircle2,
  Layers,
  ListChecks,
  MessageSquareText,
  Headphones,
  PencilLine,
  GitCompareArrows
} from 'lucide-react'
import { Button } from '@/presentation/components/ui/button'
import { toast } from 'sonner'
import { courseRepo } from '@/infrastructure/factories/teacher.factory'
import type { Course, Module, Lesson } from '@/domain/entities/course.entity'
import type { ExercisePayload } from '@/domain/ports/course.repository'

const exerciseTypeOptions = [
  { value: 'multiple_choice', label: 'OPCION MULTIPLE', icon: ListChecks },
  { value: 'translate', label: 'TRADUCCION TECNICA', icon: MessageSquareText },
  { value: 'listen', label: 'COMPRENSION AUDITIVA', icon: Headphones },
  { value: 'fill_blank', label: 'COMPLETAR ESPACIOS', icon: PencilLine },
  { value: 'match', label: 'EMPAREJAMIENTO', icon: GitCompareArrows },
]

export default function AdminExerciseFormPage() {
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const isEditing = Boolean(id)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [courses, setCourses] = useState<Course[]>([])
  const [modules, setModules] = useState<Module[]>([])
  const [lessons, setLessons] = useState<Lesson[]>([])

  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null)
  const [selectedModuleId, setSelectedModuleId] = useState<number | null>(null)
  const [selectedLessonId, setSelectedLessonId] = useState<number | null>(
    id ? null : (searchParams.get('lesson') ? Number(searchParams.get('lesson')) : null)
  )
  const [questionText, setQuestionText] = useState('')
  const [exerciseType, setExerciseType] = useState<string>('multiple_choice')
  const [correctAnswer, setCorrectAnswer] = useState('')
  const [optionsText, setOptionsText] = useState('')
  const [audioUrl, setAudioUrl] = useState('')

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const result = await courseRepo.getAll()
        setCourses(result.results || [])
      } catch {
        toast.error('Error al cargar cursos')
      }
    }
    void loadCourses()
  }, [])

  useEffect(() => {
    if (!selectedCourseId) { setModules([]); return }
    const load = async () => {
      try {
        const mods = await courseRepo.getModulesByCourse(selectedCourseId)
        setModules(mods)
      } catch { toast.error('Error al cargar modulos') }
    }
    void load()
  }, [selectedCourseId])

  useEffect(() => {
    if (!selectedModuleId) { setLessons([]); return }
    const load = async () => {
      try {
        const lesns = await courseRepo.getLessonsByModule(selectedModuleId)
        setLessons(lesns)
      } catch { toast.error('Error al cargar lecciones') }
    }
    void load()
  }, [selectedModuleId])

  useEffect(() => {
    const loadExercise = async () => {
      if (!id) {
        setLoading(false)
        return
      }
      try {
        setLoading(true)
        const lessonIdFromParams = searchParams.get('lesson')
        if (!lessonIdFromParams) {
          toast.error('Parametro lesson requerido en la URL')
          navigate('/admin/management/exercises')
          return
        }
        const lId = Number(lessonIdFromParams)
        setSelectedLessonId(lId)
        const exs = await courseRepo.getExercisesByLesson(lId)
        const exercise = exs.find((e: any) => e.id === Number(id))
        if (exercise) {
          setQuestionText(exercise.question_text)
          setExerciseType(exercise.exercise_type)
          setCorrectAnswer(exercise.correct_answer)
          setOptionsText(exercise.options?.join('\n') || '')
          setAudioUrl(exercise.audio_url || '')
        } else {
          toast.error('Ejercicio no encontrado')
          navigate('/admin/management/exercises')
        }
      } catch {
        toast.error('Error al cargar ejercicio')
      } finally {
        setLoading(false)
      }
    }
    void loadExercise()
  }, [id]) // eslint-disable-line

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!questionText.trim() || !correctAnswer.trim() || !selectedLessonId) {
      toast.error('Completa los campos requeridos')
      return
    }

    const payload: any = {
      lesson: selectedLessonId,
      question_text: questionText.trim(),
      exercise_type: exerciseType,
      correct_answer: correctAnswer.trim(),
    }

    if (exerciseType === 'multiple_choice' && optionsText.trim()) {
      payload.options = optionsText.split('\n').map((s: string) => s.trim()).filter((s: string) => s)
    }
    if (exerciseType === 'listen' && audioUrl.trim()) {
      payload.audio_url = audioUrl.trim()
    }

    setSaving(true)
    try {
      if (id) {
        await courseRepo.updateExercise(Number(id), payload)
        toast.success('Ejercicio actualizado con exito')
      } else {
        await courseRepo.createExercise(payload as ExercisePayload)
        toast.success('Ejercicio creado con exito')
      }
      navigate('/admin/management/exercises')
    } catch (err: any) {
      toast.error(err?.detail || 'Error al guardar el ejercicio')
    } finally {
      setSaving(false)
    }
  }

  const showOptionsField = exerciseType === 'multiple_choice'
  const showAudioField = exerciseType === 'listen'

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
        <p className="label-caps text-slate-400">Cargando reactivo...</p>
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
                <Link to="/admin/management/exercises"><ArrowLeft className="h-4 w-4" /></Link>
              </Button>
              <div className="chip">
                <CheckCircle2 className="h-3.5 w-3.5 text-sky-500" />
                Evaluacion
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white uppercase">
              {isEditing ? 'Editar' : 'Nuevo'} <span className="text-sky-500">Ejercicio</span>.
            </h1>
            <p className="text-base text-slate-500 dark:text-slate-400 max-w-lg font-medium">
              Diseno de reactivos, validacion de respuestas y configuracion de motores de evaluacion.
            </p>
          </div>
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/admin/management/exercises')}
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
              {isEditing ? 'Actualizar Ejercicio' : 'Crear Ejercicio'}
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
                <h2 className="label-caps text-slate-900 dark:text-white font-black">Contenido del Reactivo</h2>
              </div>

              <div className="space-y-2">
                <label className="label-caps text-slate-400 text-[10px]">Tipo de Reactivo <span className="text-sky-500">*</span></label>
                <div className="grid grid-cols-2 gap-px bg-slate-900/10 dark:bg-white/10 border border-slate-900/10 dark:border-white/10">
                  {exerciseTypeOptions.map(opt => {
                    const Icon = opt.icon
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setExerciseType(opt.value)}
                        className={`flex items-center gap-3 py-3 px-4 text-[11px] font-bold uppercase tracking-widest transition-colors ${
                          exerciseType === opt.value
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

              <div className="space-y-2">
                <label className="label-caps text-slate-400 text-[10px]">Enunciado / Pregunta <span className="text-sky-500">*</span></label>
                <textarea
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  placeholder="EJ. CUAL ES EL PASADO SIMPLE DEL VERBO 'GO'?"
                  className="w-full border border-slate-900/10 dark:border-white/10 bg-transparent py-4 px-4 text-[12px] font-bold uppercase tracking-widest outline-none focus:border-sky-500 transition-colors min-h-[100px] resize-none"
                />
              </div>

              {showOptionsField && (
                <div className="space-y-2">
                  <label className="label-caps text-slate-400 text-[10px]">Opciones de Respuesta (Una por linea)</label>
                  <textarea
                    value={optionsText}
                    onChange={(e) => setOptionsText(e.target.value)}
                    placeholder="OPCION A&#10;OPCION B&#10;OPCION C"
                    className="w-full border border-slate-900/10 dark:border-white/10 bg-transparent py-4 px-4 text-[12px] font-bold uppercase tracking-widest outline-none focus:border-sky-500 transition-colors min-h-[120px] resize-none"
                  />
                </div>
              )}

              {showAudioField && (
                <div className="space-y-2">
                  <label className="label-caps text-slate-400 text-[10px]">Recurso de Audio (URL)</label>
                  <input
                    value={audioUrl}
                    onChange={(e) => setAudioUrl(e.target.value)}
                    placeholder="HTTPS://CDN.PLATAFORMA.COM/AUDIO/001.MP3"
                    className="w-full border border-slate-900/10 dark:border-white/10 bg-transparent py-4 px-4 text-[12px] font-bold uppercase tracking-widest outline-none focus:border-sky-500 transition-colors"
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="label-caps text-slate-400 text-[10px] text-emerald-600">Respuesta Correcta <span className="text-sky-500">*</span></label>
                <input
                  value={correctAnswer}
                  onChange={(e) => setCorrectAnswer(e.target.value)}
                  placeholder="VALOR EXACTO PARA VALIDACION"
                  className="w-full border border-emerald-500/30 dark:border-emerald-500/20 bg-emerald-500/5 py-4 px-4 text-[12px] font-bold uppercase tracking-widest outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Sidebar / Settings */}
          <div className="space-y-8">
            <div className="p-8 border border-slate-900/10 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02]">
              <h3 className="label-caps text-slate-900 dark:text-white font-black mb-6">Jerarquia Academica</h3>
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
                    className="w-full appearance-none border border-slate-900/10 dark:border-white/10 bg-white dark:bg-[#0a0a0b] py-4 px-4 text-[11px] font-bold uppercase tracking-widest outline-none focus:border-sky-500 transition-colors"
                  >
                    <option value="" disabled>SELECCIONAR MODULO...</option>
                    {modules.map(m => (
                      <option key={m.id} value={m.id}>{m.title.toUpperCase()}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="label-caps text-slate-400 text-[10px]">Leccion <span className="text-sky-500">*</span></label>
                  <select
                    value={selectedLessonId ?? ''}
                    onChange={(e) => {
                      if (!isEditing) setSelectedLessonId(e.target.value ? Number(e.target.value) : null)
                    }}
                    disabled={isEditing}
                    className="w-full appearance-none border border-slate-900/10 dark:border-white/10 bg-white dark:bg-[#0a0a0b] py-4 px-4 text-[11px] font-bold uppercase tracking-widest outline-none focus:border-sky-500 transition-colors disabled:opacity-60"
                  >
                    <option value="" disabled>SELECCIONAR LECCION...</option>
                    {lessons.map(l => (
                      <option key={l.id} value={l.id}>{l.title.toUpperCase()}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="p-8 border border-slate-900/10 dark:border-white/10 border-dashed">
              <p className="label-micro text-slate-400 leading-relaxed font-mono">
                LA MODIFICACION DE REACTIVOS DE EVALUACION AFECTA A LOS RESULTADOS DE APRENDIZAJE.
                VERIFIQUE LA RESPUESTA CORRECTA ANTES DE GUARDAR.
              </p>
            </div>
          </div>
        </div>
      </div>
    </form>
  )
}