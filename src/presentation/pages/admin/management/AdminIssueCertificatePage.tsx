import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Save,
  Loader2,
} from 'lucide-react'
import { Card, CardContent } from '@/presentation/components/ui/card'
import { Button } from '@/presentation/components/ui/button'
import { Input } from '@/presentation/components/ui/input'
import { Textarea } from '@/presentation/components/ui/textarea'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { createCertificateUseCase } from '@/infrastructure/factories/admin.factory'

const formSchema = z.object({
  student: z.string().min(1, 'ID del estudiante es requerido'),
  level: z.string().min(1, 'Selecciona un nivel'),
  title: z.string().min(3, 'El título debe tener al menos 3 caracteres'),
  description: z.string().optional(),
  status: z.enum(['pending', 'issued']),
})

type FormData = z.infer<typeof formSchema>

const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']

export default function AdminIssueCertificatePage() {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      student: '',
      level: '',
      title: '',
      description: '',
      status: 'pending',
    }
  })

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true)
    try {
      await createCertificateUseCase.execute({
        student: Number(data.student),
        level: data.level,
        title: data.title,
        description: data.description || '',
        status: data.status,
      })
      toast.success('Certificado creado con éxito')
      navigate('/admin/certificates')
    } catch (error: any) {
      console.error('Error creating certificate:', error)
      toast.error(error.message || 'Error al crear el certificado')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 animate-in fade-in duration-700 max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild className="rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">
            <Link to="/admin/certificates"><ArrowLeft className="h-5 w-5" /></Link>
          </Button>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Emitir Certificado</h1>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-1">Crea un nuevo certificado para un estudiante</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button type="button" variant="outline" className="h-12 rounded-xl font-bold" onClick={() => navigate('/admin/certificates')} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting} className="h-12 rounded-xl font-black bg-sky-600 hover:bg-sky-700 shadow-xl shadow-sky-500/20 px-6">
            {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
            Crear Certificado
          </Button>
        </div>
      </div>

      <Card className="border-none shadow-2xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden">
        <CardContent className="p-8 space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-black text-slate-900 dark:text-white">
                ID del Estudiante <span className="text-red-500">*</span>
              </label>
              <Input
                {...register('student')}
                type="number"
                placeholder="ID numérico del estudiante"
                className={`h-14 rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 font-medium ${errors.student ? 'border-red-500' : ''}`}
              />
              {errors.student && <span className="text-red-500 text-xs font-bold">{errors.student.message}</span>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-black text-slate-900 dark:text-white">
                Nivel MCER <span className="text-red-500">*</span>
              </label>
              <select
                {...register('level')}
                className={`w-full h-14 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 px-4 font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500 ${errors.level ? 'border-red-500' : ''}`}
              >
                <option value="">Selecciona nivel...</option>
                {LEVELS.map(l => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
              {errors.level && <span className="text-red-500 text-xs font-bold">{errors.level.message}</span>}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-black text-slate-900 dark:text-white">
              Título del Certificado <span className="text-red-500">*</span>
            </label>
            <Input
              {...register('title')}
              placeholder='Ej. Certificado de Inglés A1 — JumpUp UTE'
              className={`h-14 rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 font-medium ${errors.title ? 'border-red-500' : ''}`}
            />
            {errors.title && <span className="text-red-500 text-xs font-bold">{errors.title.message}</span>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-black text-slate-900 dark:text-white">Descripción (Opcional)</label>
            <Textarea
              {...register('description')}
              placeholder="Descripción adicional del certificado..."
              className={`min-h-[120px] rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 font-medium resize-none p-4 ${errors.description ? 'border-red-500' : ''}`}
            />
            {errors.description && <span className="text-red-500 text-xs font-bold">{errors.description.message}</span>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-black text-slate-900 dark:text-white">Estado inicial</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="pending"
                  {...register('status')}
                  defaultChecked
                  className="text-sky-600 focus:ring-sky-500"
                />
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Pendiente (requiere aprobación)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="issued"
                  {...register('status')}
                  className="text-sky-600 focus:ring-sky-500"
                />
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Emitido directamente</span>
              </label>
            </div>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}