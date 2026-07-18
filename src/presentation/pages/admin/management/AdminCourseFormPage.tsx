import { useEffect, useState, type ReactNode } from 'react'
import { ArrowLeft, Save } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import type { CreateCourseDto } from '@/application/dtos/course.dto'
import type { DifficultyLevel, Language } from '@/domain/entities/course.entity'
import { manageCoursesUseCase } from '@/infrastructure/factories/course.factory'

const difficultyLevels: DifficultyLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
const fieldClassName = 'w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 outline-none transition-colors focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10'

export default function AdminCourseFormPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEditing = Boolean(id)
  const [languages, setLanguages] = useState<Language[]>([])
  const [formData, setFormData] = useState<CreateCourseDto>({ language: 0, title: '', description: '', difficulty_level: 'A1', image: null })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const loadedLanguages = await manageCoursesUseCase.getLanguages()
        setLanguages(loadedLanguages)

        if (id) {
          const course = await manageCoursesUseCase.getById(Number(id))
          setFormData({
            language: course.language,
            title: course.title,
            description: course.description,
            difficulty_level: course.difficulty_level,
            image: null,
          })
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudo cargar el formulario.')
      } finally {
        setLoading(false)
      }
    }
    void loadData()
  }, [id])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!formData.language) {
      setError('Selecciona un idioma.')
      return
    }
    try {
      setSaving(true)
      setError(null)
      if (id) await manageCoursesUseCase.update(Number(id), formData)
      else await manageCoursesUseCase.create(formData)
      navigate('/admin/management/courses')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar el curso.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="flex h-64 items-center justify-center"><div className="h-10 w-10 animate-spin rounded-full border-4 border-sky-500 border-t-transparent" /></div>

  return (
    <div className="mx-auto w-full max-w-3xl p-6">
      <div className="mb-8 flex items-center gap-4"><Link to="/admin/management/courses" className="rounded-full p-2 text-slate-400 hover:bg-slate-100"><ArrowLeft className="h-5 w-5" /></Link><div><h1 className="text-3xl font-black text-slate-800">{isEditing ? 'Editar curso' : 'Nuevo curso'}</h1><p className="mt-1 text-slate-500">Configura la información académica del curso.</p></div></div>
      {error && <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-600">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="Idioma"><select required value={formData.language || ''} onChange={(event) => setFormData((current) => ({ ...current, language: Number(event.target.value) }))} className={fieldClassName}><option value="" disabled>Selecciona un idioma</option>{languages.map((language) => <option key={language.id} value={language.id}>{language.name} ({language.code})</option>)}</select></Field>
          <Field label="Nivel"><select value={formData.difficulty_level} onChange={(event) => setFormData((current) => ({ ...current, difficulty_level: event.target.value as DifficultyLevel }))} className={fieldClassName}>{difficultyLevels.map((level) => <option key={level} value={level}>{level}</option>)}</select></Field>
        </div>
        <Field label="Título"><input required maxLength={200} value={formData.title} onChange={(event) => setFormData((current) => ({ ...current, title: event.target.value }))} className={fieldClassName} placeholder="Ej. Inglés para viajeros" /></Field>
        <Field label="Descripción"><textarea value={formData.description} onChange={(event) => setFormData((current) => ({ ...current, description: event.target.value }))} className={`${fieldClassName} min-h-28 resize-y`} placeholder="Describe el contenido y objetivos del curso." /></Field>
        <Field label="Imagen (JPEG, PNG o WebP; máximo 2 MB)"><input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => setFormData((current) => ({ ...current, image: event.target.files?.[0] ?? null }))} className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-sky-50 file:px-3 file:py-2 file:font-bold file:text-sky-700 hover:file:bg-sky-100" /></Field>
        <div className="flex justify-end gap-3"><Link to="/admin/management/courses" className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50">Cancelar</Link><button disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-sky-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-sky-500/30 hover:bg-sky-400 disabled:opacity-70"><Save className="h-4 w-4" />{saving ? 'Guardando...' : 'Guardar curso'}</button></div>
      </form>
    </div>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="block space-y-1.5"><span className="text-sm font-bold text-slate-700">{label}</span>{children}</label>
}