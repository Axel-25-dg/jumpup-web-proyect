import { useState, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Award,
  Loader2,
  CheckCircle,
  XCircle,
  AlertCircle,
  ExternalLink,
  Edit2,
  FileDown,
  RotateCcw,
} from 'lucide-react'
import { Button } from '@/presentation/components/ui/button'
import { Skeleton } from '@/presentation/components/ui/skeleton'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/presentation/components/ui/alert-dialog'
import { toast } from 'sonner'
import {
  getCertificateByIdUseCase,
  issueCertificateUseCase,
  revokeCertificateUseCase,
} from '@/infrastructure/factories/admin-certificate.factory'
import type { Certificate } from '@/domain/entities/certificate.entity'

export default function AdminCertificateDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [certificate, setCertificate] = useState<Certificate | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [showRevokeDialog, setShowRevokeDialog] = useState(false)
  const [showReissueDialog, setShowReissueDialog] = useState(false)

  const loadCertificate = async () => {
    if (!id) return
    setIsLoading(true)
    try {
      const data = await getCertificateByIdUseCase.execute(Number(id))
      setCertificate(data)
    } catch (error) {
      console.error('Error loading certificate:', error)
      toast.error('No se pudo cargar el certificado')
      navigate('/admin/certificates')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadCertificate()
  }, [id])

  const handleIssue = async () => {
    if (!certificate) return
    setActionLoading(true)
    try {
      await issueCertificateUseCase.execute(certificate.id)
      toast.success(`Certificado "${certificate.certificate_code}" emitido con éxito`)
      loadCertificate()
    } catch (error) {
      console.error('Error issuing certificate:', error)
      toast.error('Error al emitir el certificado')
    } finally {
      setActionLoading(false)
    }
  }

  const handleRevoke = async () => {
    if (!certificate) return
    setActionLoading(true)
    try {
      await revokeCertificateUseCase.execute(certificate.id)
      toast.success(`Certificado "${certificate.certificate_code}" revocado`)
      setShowRevokeDialog(false)
      loadCertificate()
    } catch (error) {
      console.error('Error revoking certificate:', error)
      toast.error('Error al revocar el certificado')
    } finally {
      setActionLoading(false)
    }
  }

  const handleReissue = async () => {
    if (!certificate) return
    setActionLoading(true)
    try {
      await issueCertificateUseCase.execute(certificate.id, { issued_at: new Date().toISOString() })
      toast.success(`Certificado "${certificate.certificate_code}" re-emitido con éxito`)
      setShowReissueDialog(false)
      loadCertificate()
    } catch (error) {
      console.error('Error reissuing certificate:', error)
      toast.error('Error al re-emitir el certificado')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDownloadPdf = () => {
    if (!certificate) return
    // Abrir la página de verificación para imprimir/descargar como PDF
    window.open(`/verify/${certificate.certificate_code}`, '_blank')
    toast.info('Usa Ctrl+P o Cmd+P para guardar como PDF')
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return { label: 'Pendiente', color: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 border-amber-200 dark:border-amber-800' }
      case 'issued':
        return { label: 'Emitido', color: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 border-emerald-200 dark:border-emerald-800' }
      case 'revoked':
        return { label: 'Revocado', color: 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 border-rose-200 dark:border-rose-800' }
      default:
        return { label: status, color: 'bg-slate-100 dark:bg-white/[0.04] text-slate-500 border-slate-200 dark:border-slate-800' }
    }
  }

  if (isLoading) {
    return (
      <div className="animate-in fade-in duration-500 max-w-4xl mx-auto p-8 space-y-8">
        <Skeleton className="h-12 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!certificate) return null

  const statusBadge = getStatusBadge(certificate.status)

  return (
    <div className="animate-in fade-in duration-500 max-w-4xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-8 md:px-12 py-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild className="-ml-2">
            <Link to="/admin/certificates"><ArrowLeft className="h-5 w-5" /></Link>
          </Button>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              Certificado {certificate.certificate_code}
            </h1>
            <p className="text-sm text-slate-500">Detalle y gestión del certificado</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate(`/admin/certificates/${certificate.id}/edit`)}>
            <Edit2 className="h-4 w-4 mr-2" /> Editar
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownloadPdf}>
            <FileDown className="h-4 w-4 mr-2" /> Descargar PDF
          </Button>
        </div>
      </div>

      {/* CERTIFICATE DETAIL */}
      <div className="mx-8 md:mx-12 mb-12 border border-slate-900/10 dark:border-white/10 bg-white dark:bg-[#0a0a0b]">
        <div className="p-8 md:p-12">
          <div className="flex flex-col items-center text-center space-y-8">
            {/* Icon + Status */}
            <div className="flex flex-col items-center gap-4">
              <div className="h-20 w-20 flex items-center justify-center border-2 border-sky-500/20 text-sky-500 bg-sky-500/5">
                <Award className="h-10 w-10" />
              </div>
              <span className={`label-caps px-4 py-1.5 border ${statusBadge.color}`}>{statusBadge.label}</span>
            </div>

            {/* Info grid */}
            <div className="w-full border-t border-b border-slate-900/10 dark:border-white/10 py-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <p className="label-micro text-slate-400 mb-1">CÓDIGO DE VERIFICACIÓN</p>
                  <p className="font-mono font-black text-lg text-slate-900 dark:text-white">{certificate.certificate_code}</p>
                </div>
                <div>
                  <p className="label-micro text-slate-400 mb-1">ESTUDIANTE</p>
                  <p className="font-bold text-slate-900 dark:text-white">{certificate.student_email}</p>
                </div>
                <div>
                  <p className="label-micro text-slate-400 mb-1">NIVEL MCER</p>
                  <p className="font-black text-2xl text-sky-500">{certificate.level}</p>
                </div>
                <div>
                  <p className="label-micro text-slate-400 mb-1">TÍTULO</p>
                  <p className="font-bold text-slate-900 dark:text-white">{certificate.title}</p>
                </div>
                {certificate.description && (
                  <div className="md:col-span-2">
                    <p className="label-micro text-slate-400 mb-1">DESCRIPCIÓN</p>
                    <p className="text-slate-700 dark:text-slate-300">{certificate.description}</p>
                  </div>
                )}
                <div>
                  <p className="label-micro text-slate-400 mb-1">EMITIDO POR</p>
                  <p className="font-bold text-slate-900 dark:text-white">{certificate.issued_by_email || '—'}</p>
                </div>
                <div>
                  <p className="label-micro text-slate-400 mb-1">FECHA DE EMISIÓN</p>
                  <p className="font-bold text-slate-900 dark:text-white">
                    {certificate.issued_at
                      ? new Date(certificate.issued_at).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })
                      : 'No emitido'}
                  </p>
                </div>
                <div>
                  <p className="label-micro text-slate-400 mb-1">CREADO</p>
                  <p className="font-bold text-slate-900 dark:text-white">
                    {new Date(certificate.created_at).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap justify-center gap-3 pt-4">
              {certificate.status === 'pending' && (
                <Button onClick={handleIssue} disabled={actionLoading} className="bg-emerald-600 hover:bg-emerald-700">
                  {actionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                  Emitir Certificado
                </Button>
              )}
              {certificate.status === 'issued' && (
                <Button onClick={() => setShowRevokeDialog(true)} disabled={actionLoading} variant="outline" className="border-rose-300 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20">
                  <XCircle className="h-4 w-4 mr-2" /> Revocar Certificado
                </Button>
              )}
              {certificate.status === 'revoked' && (
                <Button onClick={() => setShowReissueDialog(true)} disabled={actionLoading} className="bg-sky-600 hover:bg-sky-700">
                  <RotateCcw className="h-4 w-4 mr-2" /> Re-Emitir Certificado
                </Button>
              )}
              <Button variant="outline" asChild>
                <a href={`/verify/${certificate.certificate_code}`} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" /> Ver en portal público
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Revoke Dialog */}
      <AlertDialog open={showRevokeDialog} onOpenChange={setShowRevokeDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex h-14 w-14 items-center justify-center border border-rose-200 dark:border-rose-900/30 mx-auto mb-4">
              <AlertCircle className="h-6 w-6 text-rose-500" />
            </div>
            <AlertDialogTitle className="text-center text-xl font-black">¿Revocar certificado?</AlertDialogTitle>
            <AlertDialogDescription className="text-center text-sm">
              Esta acción marcará como revocado el certificado{' '}
              <span className="font-bold text-slate-900 dark:text-white">"{certificate.certificate_code}"</span>.
              El estudiante perderá la validez del mismo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center gap-3">
            <AlertDialogCancel disabled={actionLoading}>Cancelar</AlertDialogCancel>
            <AlertDialogAction disabled={actionLoading} onClick={handleRevoke} className="bg-rose-600 hover:bg-rose-700">
              {actionLoading ? 'Revocando...' : 'Sí, revocar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Re-issue Dialog */}
      <AlertDialog open={showReissueDialog} onOpenChange={setShowReissueDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex h-14 w-14 items-center justify-center border border-sky-200 dark:border-sky-900/30 mx-auto mb-4">
              <RotateCcw className="h-6 w-6 text-sky-500" />
            </div>
            <AlertDialogTitle className="text-center text-xl font-black">¿Re-emitir certificado?</AlertDialogTitle>
            <AlertDialogDescription className="text-center text-sm">
              El certificado <span className="font-bold text-slate-900 dark:text-white">"{certificate.certificate_code}"</span> será
              emitido nuevamente con la fecha actual. El estudiante recuperará su validez.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center gap-3">
            <AlertDialogCancel disabled={actionLoading}>Cancelar</AlertDialogCancel>
            <AlertDialogAction disabled={actionLoading} onClick={handleReissue} className="bg-sky-600 hover:bg-sky-700">
              {actionLoading ? 'Re-emitiendo...' : 'Sí, re-emitir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}