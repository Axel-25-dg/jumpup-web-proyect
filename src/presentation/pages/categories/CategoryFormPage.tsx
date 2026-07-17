import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { ArrowLeft, Save } from 'lucide-react'
import { CategoryUseCase } from '@/application/use-cases/category.use-case'
import { AxiosCategoryRepository } from '@/infrastructure/adapters/axios-category.repository'
import type { CreateCategoryDto } from '@/application/dtos/category.dto'

const categoryRepository = new AxiosCategoryRepository()
const categoryUseCase = new CategoryUseCase(categoryRepository)

export default function CategoryFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEditing = Boolean(id)
  const navigate = useNavigate()

  const [formData, setFormData] = useState<CreateCategoryDto>({
    name: '',
    description: '',
  })
  const [loading, setLoading] = useState(isEditing)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isEditing && id) {
      loadCategory(Number(id))
    }
  }, [id, isEditing])

  const loadCategory = async (categoryId: number) => {
    try {
      setLoading(true)
      const data = await categoryUseCase.getCategoryById(categoryId)
      setFormData({ name: data.name, description: data.description })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar categoría')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setSaving(true)
      setError(null)
      if (isEditing && id) {
        await categoryUseCase.updateCategory(Number(id), formData)
      } else {
        await categoryUseCase.createCategory(formData)
      }
      navigate('/admin/categories')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar categoría')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto w-full">
      <div className="flex items-center gap-4 mb-8">
        <Link
          to="/admin/categories"
          className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">
            {isEditing ? 'Editar Categoría' : 'Nueva Categoría'}
          </h1>
          <p className="text-slate-500 mt-1">
            {isEditing ? 'Modifica los datos de la categoría' : 'Crea una nueva categoría en el sistema'}
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 font-medium">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex h-64 items-center justify-center bg-white rounded-2xl border border-slate-200">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-sky-500 border-t-transparent" />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
          
          <div className="space-y-1.5">
            <label htmlFor="name" className="text-sm font-bold text-slate-700">
              Nombre de la Categoría
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 transition-colors focus:border-sky-500 focus:outline-none focus:ring-4 focus:ring-sky-500/10 placeholder:text-slate-400"
              placeholder="Ej. Idiomas, Programación..."
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="description" className="text-sm font-bold text-slate-700">
              Descripción
            </label>
            <textarea
              id="description"
              name="description"
              required
              rows={4}
              value={formData.description}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 transition-colors focus:border-sky-500 focus:outline-none focus:ring-4 focus:ring-sky-500/10 placeholder:text-slate-400 resize-none"
              placeholder="Describe el propósito de esta categoría..."
            />
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <Link
              to="/admin/categories"
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-100"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-sky-500/30 transition-all hover:-translate-y-0.5 hover:bg-sky-400 focus:outline-none focus:ring-4 focus:ring-sky-500/20 active:translate-y-0 disabled:opacity-70 disabled:pointer-events-none"
            >
              {saving ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {saving ? 'Guardando...' : 'Guardar Categoría'}
            </button>
          </div>

        </form>
      )}
    </div>
  )
}
