import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Award,
  Plus,
  Search,
  MoreVertical,
  CheckCircle,
  XCircle,
  AlertCircle,
  ExternalLink,
  Loader2,
  ArrowLeft,
} from 'lucide-react'
import { Button } from '@/presentation/components/ui/button'
import { Input } from '@/presentation/components/ui/input'
import { Skeleton } from '@/presentation/components/ui/skeleton'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/presentation/components/ui/dropdown-menu'
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
  getCertificatesUseCase,
  issueCertificateUseCase,
  revokeCertificateUseCase,
} from '@/infrastructure/factories/admin.factory'
import type { Certificate } from '@/domain/entities/certificate.entity'

export default function AdminCertificatesPage() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'issued' | 'revoked'>('all')
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<number | null>(null)
  const [certToRevoke, setCertToRevoke] = useState<Certificate | null>(null)
  const [isRevoking, setIsRevoking] = useState(false)

  const loadCertificates = async () => {
    setIsLoading(true)
    try {
      const result = await getCertificatesUseCase.execute()
      setCertificates(result.results || [])
    } catch (error) {
      console.error('Error fetching certificates:', error)
      toast.error('No se pudieron cargar los certificados')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadCertificates()
  }, [])

  const handleIssue = async (cert: Certificate) => {
    setActionLoading(cert.id)
    try {
      await issueCertificateUseCase.execute(cert.id)
      toast.success(`Certificado "${cert.certificate_code}" emitido con éxito`)
      loadCertificates()
    } catch (error) {
      console.error('Error issuing certificate:', error)
      toast.error('Error al emitir el certificado')
    } finally {
      setActionLoading(null)
    }
  }

  const handleRevoke = async () => {
    if (!certToRevoke) return
    setIsRevoking(true)
    try {
      await revokeCertificateUseCase.execute(certToRevoke.id)
      toast.success(`Certificado "${certToRevoke.certificate_code}" revocado`)
      loadCertificates()
    } catch (error) {
      console.error('Error revoking certificate:', error)
      toast.error('Error al revocar el certificado')
    } finally {
      setIsRevoking(false)
      setCertToRevoke(null)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return { label: 'Pendiente', color: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600' }
      case 'issued':
        return { label: 'Emitido', color: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600' }
      case 'revoked':
        return { label: 'Revocado', color: 'bg-rose-50 dark:bg-rose-900/20 text-rose-600' }
      default:
        return { label: status, color: 'bg-slate-100 dark:bg-white/[0.04] text-slate-500' }
    }
  }

  const filteredCerts = certificates.filter(c => {
    const matchesSearch =
      c.certificate_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.student_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.title.toLowerCase().includes(searchTerm.toLowerCase())
    if (!matchesSearch) return false
    if (statusFilter !== 'all' && c.status !== statusFilter) return false
    return true
  })

  return (
    <div className="animate-in fade-in duration-500">
      {/* HERO */}
      <section className="border-b border-slate-900/10 dark:border-white/10 px-8 md:px-12 py-12 md:py-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" asChild className="-ml-2">
                <Link to="/admin"><ArrowLeft className="h-4 w-4" /></Link>
              </Button>
              <div className="chip">
                <Award className="h-3.5 w-3.5 text-sky-500" />
                Certificados
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
              Emisión de <span className="text-sky-500">Certificados</span>.
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Emite y gestiona los certificados oficiales de la plataforma para alumnos acreditados.
            </p>
          </div>
          <Button onClick={() => navigate('/admin/certificates/issue')} size="lg" className="gap-2 shrink-0 group">
            <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform" />
            Emitir Certificado
          </Button>
        </div>
      </section>

      {/* TOOLBAR */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center px-8 md:px-10 py-5 border-b border-slate-900/10 dark:border-white/10">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Buscar por código, email o título..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-1.5">
          {(['all', 'pending', 'issued', 'revoked'] as const).map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-4 py-2 label-caps transition-colors ${
                statusFilter === s
                  ? 'bg-sky-500 text-white'
                  : 'border border-slate-900/10 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/[0.04]'
              }`}
            >
              {s === 'all' ? 'Todos' : s === 'pending' ? 'Pendientes' : s === 'issued' ? 'Emitidos' : 'Revocados'}
            </button>
          ))}
        </div>
      </div>

      {/* CERTIFICATES LIST */}
      <div className="divide-y divide-slate-900/5 dark:divide-white/5 bg-transparent">
        {isLoading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex gap-4 items-center">
                <Skeleton className="h-10 w-10 shrink-0" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredCerts.length > 0 ? (
          filteredCerts.map((cert) => {
            const statusBadge = getStatusBadge(cert.status)
            return (
              <div key={cert.id} className="p-6 flex flex-col md:flex-row items-center gap-6 card-hover group">
                <div className="h-12 w-12 shrink-0 flex items-center justify-center border border-slate-900/10 dark:border-white/10 text-sky-500">
                  <Award className="h-6 w-6" />
                </div>
                <div className="flex-1 min-w-0 text-center md:text-left">
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-1">
                    <span className={`label-caps px-2 py-0.5 ${statusBadge.color}`}>{statusBadge.label}</span>
                    <span className="label-caps px-2 py-0.5 border border-slate-900/10 dark:border-white/10 text-slate-500 font-mono">
                      {cert.certificate_code}
                    </span>
                    <span className="label-caps px-2 py-0.5 border border-sky-900/10 text-sky-600">
                      {cert.level}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">{cert.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {cert.student_email} {cert.issued_by_email && `• Emitido por: ${cert.issued_by_email}`}
                  </p>
                  {cert.issued_at && (
                    <p className="label-micro text-slate-400 dark:text-slate-500 mt-1">
                      Emitido: {new Date(cert.issued_at).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {cert.status === 'pending' && (
                    <Button
                      size="sm"
                      disabled={actionLoading === cert.id}
                      onClick={() => handleIssue(cert)}
                    >
                      {actionLoading === cert.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <><CheckCircle className="mr-2 h-3.5 w-3.5" /> Emitir</>
                      )}
                    </Button>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-9 w-9">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-52">
                      {cert.status === 'issued' && (
                        <DropdownMenuItem
                          onSelect={() => setCertToRevoke(cert)}
                          className="gap-2 text-rose-600 focus:text-rose-600"
                        >
                          <XCircle className="h-4 w-4" /> Revocar Certificado
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        onSelect={() => window.open(`/verify/${cert.certificate_code}`, '_blank')}
                        className="gap-2"
                      >
                        <ExternalLink className="h-4 w-4" /> Verificar en portal
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            )
          })
        ) : (
          <div className="py-20 text-center">
            <div className="flex h-16 w-16 items-center justify-center border border-slate-900/10 dark:border-white/10 mx-auto mb-6">
              <Award className="h-6 w-6 text-sky-500" />
            </div>
            <p className="label-caps text-slate-400 dark:text-slate-500">No se encontraron certificados</p>
          </div>
        )}
      </div>

      {/* Revoke Dialog */}
      <AlertDialog open={!!certToRevoke} onOpenChange={(open) => !open && !isRevoking && setCertToRevoke(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex h-14 w-14 items-center justify-center border border-rose-200 dark:border-rose-900/30 mx-auto mb-4">
              <AlertCircle className="h-6 w-6 text-rose-500" />
            </div>
            <AlertDialogTitle className="text-center text-xl font-black">¿Revocar certificado?</AlertDialogTitle>
            <AlertDialogDescription className="text-center text-sm">
              Esta acción marcará como revocado el certificado{' '}
              <span className="font-bold text-slate-900 dark:text-white">"{certToRevoke?.certificate_code}"</span>.
              El estudiante perderá la validez del mismo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center gap-3">
            <AlertDialogCancel disabled={isRevoking}>Cancelar</AlertDialogCancel>
            <AlertDialogAction disabled={isRevoking} onClick={handleRevoke} className="bg-rose-600 hover:bg-rose-700">
              {isRevoking ? 'Revocando...' : 'Sí, revocar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}