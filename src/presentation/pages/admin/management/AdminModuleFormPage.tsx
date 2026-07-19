import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import {
  ArrowLeft,
  Save,
  Loader2,
  Layers,
  Globe
} from 'lucide-react'
import { Button } from '@/presentation/components/ui/button'
import { toast } from 'sonner'
import { courseRepo } from '@/infrastructure/factories/teacher.factory'
import type { Course } from '@/domain/entities/course.entity'

export default function AdminModuleFormPage() {
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const isEditing = Boolean(id)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [courses, setCourses] = useState<Course[]>([])

  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(
    id ? null : (searchParams.get('course') ? Number(searchParams.get('course')) : null)
  )
  const [title, setTitle] = useState('')
  const [order, setOrder] = useState(1)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const courseResult = await courseRepo.getAll({ page_size: 100 })
        setCourses(courseResult.results || [])

        if (id) {
          // Modo edición: se obtiene el modulo desde searchParams con course id
          const courseIdFromParams = searchParams.get('course')
          if (courseIdFromParams) {
            const cId = Number(courseIdFromParams)
            setSelectedCourseId(cId)
            const mods = await courseRepo.getModulesByCourse(cId)
            const mod = mods.find(m => m.id === Number(id))
            if (mod) {
              setTitle(mod.title)
              setOrder(mod.order)
            } else {
              toast.error('Modulo no encontrado')
              navigate('/admin/management/modules')
            }
          } else {
            // Fallback: buscar modulo recorriendo todos los cursos
            let found = false
            for (const course of courseResult.results || []) {
              const mods = await courseRepo.getModulesByCourse(course.id)
              const mod = mods.find(m => m.id === Number(id))
              if (mod) {
                setSelectedCourseId(course.id)
                setTitle(mod.title)
                setOrder(mod.order)
                found = true
                break
              }
            }
            if (!found) {
              toast.error('Modulo no encontrado')
              navigate('/admin/management/modules')
            }
          }
        } else if (searchParams.get('course')) {
          // Nuevo: preseleccionar curso si viene en la URL
          setSelectedCourseId(Number(searchParams.get('course')))
        } else if (courseResult.results?.length) {
          // Nuevo: seleccionar el primer curso por defecto
          setSelectedCourseId(courseResult.results[0].id)
        }
      } catch (err) {
        console.error(err)
        toast.error('Error al cargar datos')
      } finally {
        setLoading(false)
      }
    }
    void loadData()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !selectedCourseId) {
      toast.error('Completa todos los campos requeridos')
      return
    }
    setSaving(true)
    try {
      if (id) {
        await courseRepo.updateModule(Number(id), { title: title.trim(), order })
        toast.success('Modulo actualizado con exito')
      } else {
        await courseRepo.createModule({ course: selectedCourseId, title: title.trim(), order })
        toast.success('Modulo creado con exito')
      }
      navigate('/admin/management/modules')
    } catch (err: any) {
      toast.error(err?.detail || 'Error al guardar el modulo')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
        <p className="label-caps text-slate-400">Sincronizando Estructura Modular...</p>
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
                <Link to="/admin/management/modules"><ArrowLeft className="h-4 w-4" /></Link>
              </Button>
              <div className="chip">
                <Layers className="h-3.5 w-3.5 text-sky-500" />
                Estructura Modular
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white uppercase">
              {isEditing ? 'Editar' : 'Nuevo'} <span className="text-sky-500">Modulo</span>.
            </h1>
            <p className="text-base text-slate-500 dark:text-slate-400 max-w-lg font-medium">
              Organizacion jerarquica de contenidos y secuenciacion de lecciones por curso.
            </p>
          </div>
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/admin/management/modules')}
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
              {isEditing ? 'Actualizar Modulo' : 'Crear Modulo'}
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
                <h2 className="label-caps text-slate-900 dark:text-white font-black">Informacion del Modulo</h2>
              </div>
              <div className="space-y-2">
                <label className="label-caps text-slate-400 text-[10px]">Titulo del Modulo <span className="text-sky-500">*</span></label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="EJ. UNIDAD 01: FUNDAMENTOS BASICOS"
                  className="w-full border border-slate-900/10 dark:border-white/10 bg-transparent py-4 px-4 text-[12px] font-bold uppercase tracking-widest outline-none focus:border-sky-500 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Sidebar / Settings */}
          <div className="space-y-8">
            <div className="p-8 border border-slate-900/10 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02]">
              <h3 className="label-caps text-slate-900 dark:text-white font-black mb-6">Parametros Tecnicos</h3>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="label-caps text-slate-400 text-[10px]">Curso Asociado</label>
                  <div className="relative">
                    <select
                      value={selectedCourseId ?? ''}
                      onChange={(e) => setSelectedCourseId(e.target.value ? Number(e.target.value) : null)}
                      disabled={isEditing}
                      className="w-full appearance-none border border-slate-900/10 dark:border-white/10 bg-white dark:bg-[#0a0a0b] py-4 px-4 text-[11px] font-bold uppercase tracking-widest outline-none focus:border-sky-500 transition-colors disabled:opacity-60"
                    >
                      <option value="" disabled>SELECCIONAR CURSO...</option>
                      {courses.map(c => (
                        <option key={c.id} value={c.id}>{c.title.toUpperCase()} ({c.difficulty_level})</option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none border-l border-slate-900/10 dark:border-white/10 pl-3">
                      <Globe className="h-4 w-4 text-slate-300" />
                    </div>
                  </div>
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
              </div>
            </div>
            <div className="p-8 border border-slate-900/10 dark:border-white/10 border-dashed">
              <p className="label-micro text-slate-400 leading-relaxed font-mono">
                LA MODIFICACION DE LA ESTRUCTURA MODULAR AFECTA A LA SECUENCIA DE APRENDIZAJE.
                VERIFIQUE EL ORDEN ANTES DE GUARDAR.
              </p>
            </div>
          </div>
        </div>
      </div>
    </form>
  )
}