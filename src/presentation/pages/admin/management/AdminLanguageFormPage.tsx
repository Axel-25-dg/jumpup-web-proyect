import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Save,
  Loader2,
  Globe
} from 'lucide-react'
import { Button } from '@/presentation/components/ui/button'
import { toast } from 'sonner'
import { courseRepo } from '@/infrastructure/factories/teacher.factory'

export default function AdminLanguageFormPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEditing = Boolean(id)

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [name, setName] = useState('')
  const [code, setCode] = useState('')

  useEffect(() => {
    if (!id) return
    const loadLanguage = async () => {
      try {
        setLoading(true)
        const langs = await courseRepo.getLanguages()
        const lang = langs.find(l => l.id === Number(id))
        if (lang) {
          setName(lang.name)
          setCode(lang.code)
        } else {
          toast.error('Idioma no encontrado')
          navigate('/admin/management/languages')
        }
      } catch {
        toast.error('Error al cargar idioma')
      } finally {
        setLoading(false)
      }
    }
    void loadLanguage()
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !code.trim()) {
      toast.error('Completa todos los campos requeridos')
      return
    }
    setSaving(true)
    try {
      if (id) {
        await courseRepo.updateLanguage!(Number(id), { name: name.trim(), code: code.trim().toUpperCase() })
        toast.success('Idioma actualizado con exito')
      } else {
        await courseRepo.createLanguage!({ name: name.trim(), code: code.trim().toUpperCase() })
        toast.success('Idioma creado con exito')
      }
      navigate('/admin/management/languages')
    } catch (err: any) {
      toast.error(err?.detail || 'Error al guardar el idioma')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
        <p className="label-caps text-slate-400">Cargando idioma...</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="animate-in fade-in duration-500 pb-20">
      <section className="border-b border-slate-900/10 dark:border-white/10 px-8 md:px-12 py-14 md:py-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Button type="button" variant="ghost" size="icon" asChild className="-ml-2 rounded-none hover:bg-slate-100 dark:hover:bg-white/5">
                <Link to="/admin/management/languages"><ArrowLeft className="h-4 w-4" /></Link>
              </Button>
              <div className="chip">
                <Globe className="h-3.5 w-3.5 text-sky-500" />
                Catalogo
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white uppercase">
              {isEditing ? 'Editar' : 'Nuevo'} <span className="text-sky-500">Idioma</span>.
            </h1>
            <p className="text-base text-slate-500 dark:text-slate-400 max-w-lg font-medium">
              Administra los idiomas ofertados en JumpUp, configurando sus codigos MCER correspondientes.
            </p>
          </div>
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/admin/management/languages')}
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
              {isEditing ? 'Actualizar Idioma' : 'Crear Idioma'}
            </Button>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-8 md:px-12 py-12">
        <div className="grid lg:grid-cols-[1fr_350px] gap-12">
          <div className="space-y-12">
            <div className="space-y-8">
              <div className="flex items-center gap-3 border-b border-slate-900/10 dark:border-white/10 pb-4">
                <Globe className="h-5 w-5 text-sky-500" />
                <h2 className="label-caps text-slate-900 dark:text-white font-black">Informacion del Idioma</h2>
              </div>
              <div className="space-y-2">
                <label className="label-caps text-slate-400 text-[10px]">Nombre del Idioma <span className="text-sky-500">*</span></label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="EJ. INGLES, FRANCES, ALEMAN"
                  className="w-full border border-slate-900/10 dark:border-white/10 bg-transparent py-4 px-4 text-[12px] font-bold uppercase tracking-widest outline-none focus:border-sky-500 transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="label-caps text-slate-400 text-[10px]">Codigo del Idioma <span className="text-sky-500">*</span></label>
                <input
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="EJ. EN, FR, DE"
                  maxLength={5}
                  className="w-full border border-slate-900/10 dark:border-white/10 bg-transparent py-4 px-4 text-[12px] font-bold uppercase tracking-widest outline-none focus:border-sky-500 transition-colors font-mono max-w-[150px]"
                />
              </div>
            </div>
          </div>
          <div className="space-y-8">
            <div className="p-8 border border-slate-900/10 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02]">
              <h3 className="label-caps text-slate-900 dark:text-white font-black mb-6">Estandar MCER</h3>
              <p className="label-micro text-slate-400 leading-relaxed font-mono">
                El codigo debe seguir el estandar ISO 639-1 (ej: EN, ES, FR, DE).
                Los cambios en idiomas afectan a todos los cursos vinculados.
              </p>
            </div>
            <div className="p-8 border border-slate-900/10 dark:border-white/10 border-dashed">
              <p className="label-micro text-slate-400 leading-relaxed font-mono">
                LOS IDIOMAS CON CURSOS ASOCIADOS NO PUEDEN SER ELIMINADOS.
                VERIFIQUE QUE NO HAYA CURSOS VINCULADOS ANTES DE ELIMINAR.
              </p>
            </div>
          </div>
        </div>
      </div>
    </form>
  )
}