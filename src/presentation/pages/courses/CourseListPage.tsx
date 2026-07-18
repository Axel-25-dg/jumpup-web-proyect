import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Edit2, PlusCircle, Search, Trash2 } from 'lucide-react'
import type { Course } from '@/domain/entities/course.entity'
import { getCoursesUseCase, manageCoursesUseCase } from '@/infrastructure/factories/course.factory'

export default function CourseListPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadCourses = async (query = '') => {
    try {
      setLoading(true)
      setError(null)
      const response = await getCoursesUseCase.execute({ page_size: 100, search: query || undefined })
      setCourses(response.results)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron cargar los cursos.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadCourses()
  }, [])

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault()
    void loadCourses(search)
  }

  const handleDelete = async (course: Course) => {
    if (!window.confirm(`¿Eliminar el curso “${course.title}”? Esta acción no se puede deshacer.`)) return

    try {
      await manageCoursesUseCase.delete(course.id)
      setCourses((current) => current.filter((item) => item.id !== course.id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo eliminar el curso.')
    }
  }

  return (
    <div className="mx-auto w-full max-w-7xl p-6">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-800">Cursos</h1>
          <p className="mt-1 text-slate-500">Crea y administra el catálogo educativo.</p>
        </div>
        <Link
          to="/management/courses/new"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-sky-500/30 transition-all hover:bg-sky-400"
        >
          <PlusCircle className="h-5 w-5" /> Nuevo curso
        </Link>
      </div>

      <form onSubmit={handleSearch} className="mb-6 flex gap-3">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por título o descripción"
            className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10"
          />
        </div>
        <button className="rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 hover:bg-slate-50" type="submit">
          Buscar
        </button>
      </form>

      {error && <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-600">{error}</div>}

      {loading ? (
        <div className="flex h-64 items-center justify-center"><div className="h-10 w-10 animate-spin rounded-full border-4 border-sky-500 border-t-transparent" /></div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[720px] text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500">
              <tr><th className="px-6 py-4">Curso</th><th className="px-6 py-4">Idioma</th><th className="px-6 py-4">Nivel</th><th className="px-6 py-4">Descripción</th><th className="px-6 py-4 text-right">Acciones</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {courses.map((course) => (
                <tr key={course.id} className="hover:bg-slate-50/70">
                  <td className="px-6 py-4 font-bold text-slate-700">{course.title}</td>
                  <td className="px-6 py-4">{course.language_name}</td>
                  <td className="px-6 py-4"><span className="rounded-full bg-sky-50 px-2.5 py-1 text-xs font-bold text-sky-700">{course.difficulty_level}</span></td>
                  <td className="max-w-xs truncate px-6 py-4">{course.description || 'Sin descripción'}</td>
                  <td className="px-6 py-4"><div className="flex justify-end gap-2">
                    <Link to={`/management/courses/${course.id}/edit`} title="Editar" className="rounded-lg p-2 text-slate-400 hover:bg-sky-50 hover:text-sky-600"><Edit2 className="h-4 w-4" /></Link>
                    <button onClick={() => void handleDelete(course)} title="Eliminar" className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                  </div></td>
                </tr>
              ))}
              {courses.length === 0 && <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-500">No hay cursos para mostrar.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
