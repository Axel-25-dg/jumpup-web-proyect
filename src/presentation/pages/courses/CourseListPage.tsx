import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Edit2, PlusCircle, Search, Trash2, BookOpen } from 'lucide-react'
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
    <div className="animate-in fade-in duration-500">
      {/* HERO */}
      <section className="border-b border-slate-900/10 dark:border-white/10 px-8 md:px-12 py-14 md:py-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-4">
            <div className="chip">
              <BookOpen className="h-3.5 w-3.5 text-sky-500" />
              Contenido
            </div>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
              Gestión de <span className="text-sky-500">Cursos</span>.
            </h1>
            <p className="text-base text-slate-500 dark:text-slate-400 max-w-lg">
              Crea, edita y administra el catálogo educativo global de la plataforma.
            </p>
          </div>
          <Link
            to="/management/courses/new"
            className="inline-flex items-center justify-center gap-3 bg-slate-900 dark:bg-white px-8 py-4 text-[11px] font-bold uppercase tracking-[0.22em] text-white dark:text-slate-900 transition-all hover:bg-sky-500 dark:hover:bg-sky-500 hover:text-white"
          >
            <PlusCircle className="h-4 w-4" /> Nuevo curso
          </Link>
        </div>
      </section>

      {/* FILTERS */}
      <div className="border-b border-slate-900/10 dark:border-white/10 p-6 md:p-8">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4 max-w-4xl">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="BUSCAR POR TÍTULO O DESCRIPCIÓN..."
              className="w-full border border-slate-900/10 dark:border-white/10 bg-transparent py-3.5 pl-12 pr-4 text-[11px] font-bold uppercase tracking-widest outline-none focus:border-sky-500 transition-colors"
            />
          </div>
          <button className="bg-white dark:bg-white/5 border border-slate-900/10 dark:border-white/10 px-8 py-3 text-[11px] font-bold uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-white/10 transition-colors" type="submit">
            Filtrar
          </button>
        </form>
      </div>

      {error && (
        <div className="m-8 border border-rose-200 bg-rose-50 dark:bg-rose-900/10 dark:border-rose-900/30 p-4 flex items-center gap-3">
          <Trash2 className="h-4 w-4 text-rose-500" />
          <p className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin border-2 border-sky-500 border-t-transparent" />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-900/10 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02]">
                <th className="px-8 py-5 label-caps text-slate-400">Curso / Título</th>
                <th className="px-8 py-5 label-caps text-slate-400">Idioma</th>
                <th className="px-8 py-5 label-caps text-slate-400">Nivel</th>
                <th className="px-8 py-5 label-caps text-slate-400">Descripción</th>
                <th className="px-8 py-5 label-caps text-slate-400 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900/5 dark:divide-white/5">
              {courses.map((course) => (
                <tr key={course.id} className="card-hover group">
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight group-hover:text-sky-500 transition-colors">
                        {course.title}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono mt-0.5">ID: #{course.id}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="label-micro text-slate-600 dark:text-slate-400">{course.language_name}</span>
                  </td>
                  <td className="px-8 py-6">
                    <span className="chip text-[10px] px-2 py-0.5 border-sky-500/20 text-sky-600 bg-sky-500/[0.05]">
                      {course.difficulty_level}
                    </span>
                  </td>
                  <td className="px-8 py-6 max-w-xs">
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate font-medium">
                      {course.description || 'Sin descripción'}
                    </p>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex justify-end gap-2">
                      <Link
                        to={`/management/courses/${course.id}/edit`}
                        className="p-2 border border-slate-900/10 dark:border-white/10 hover:bg-sky-500 hover:text-white transition-all"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </Link>
                      <button
                        onClick={() => void handleDelete(course)}
                        className="p-2 border border-slate-900/10 dark:border-white/10 hover:bg-rose-500 hover:text-white transition-all"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {courses.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <p className="label-caps text-slate-400">No se encontraron cursos en el catálogo.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
