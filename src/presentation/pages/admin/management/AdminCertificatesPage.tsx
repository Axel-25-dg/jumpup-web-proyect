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
import { Card, CardContent } from '@/presentation/components/ui/card'
import { Button } from '@/presentation/components/ui/button'
import { Input } from '@/presentation/components/ui/input'
import { Badge } from '@/presentation/components/ui/badge'
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
      case 'issued':
        return { label: 'Emitido', color: 'bg-emerald-100 text-emerald-700' }
      case 'pending':
        return { label: 'Pendiente', color: 'bg-amber-100 text-amber-700' }
      case 'revoked':
        return { label: 'Revocado', color: 'bg-rose-100 text-rose-700' }
      default:
        return { label: status, color: 'bg-slate-100 text-slate-700' }
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
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild className="rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">
            <Link to="/admin"><ArrowLeft className="h-5 w-5" /></Link>
          </Button>
          <div>
            <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">Certificados</h1>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-1">Emite y gestiona los certificados de la plataforma</p>
          </div>
        </div>
        <Button
          onClick={() => navigate('/admin/certificates/issue')}
          className="h-12 rounded-2xl font-black bg-sky-600 hover:bg-sky-700 shadow-xl shadow-sky-500/20 px-6 group"
        >
          <Plus className="mr-2 h-5 w-5" /> Emitir Certificado
        </Button>
      </div>

      {/* List */}
      <Card className="border-none shadow-2xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50/50 dark:bg-slate-800/20">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 dark:text-slate-500" />
            <Input
              placeholder="Buscar por código, email o título..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-12 pl-12 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
            />
          </div>
          <div className="flex gap-2">
            {(['all', 'pending', 'issued', 'revoked'] as const).map(s => (
              <Button
                key={s}
                onClick={() => setStatusFilter(s)}
                variant={statusFilter === s ? 'default' : 'outline'}
                className={`h-12 rounded-xl font-bold ${
                  statusFilter === s
                    ? 'bg-sky-600 hover:bg-sky-700'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                {s === 'all' ? 'Todos' : s === 'pending' ? 'Pendientes' : s === 'issued' ? 'Emitidos' : 'Revocados'}
              </Button>
            ))}
          </div>
        </div>
        <CardContent className="p-0">
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {isLoading ? (
              <div className="p-6 space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex gap-6 items-center">
                    <Skeleton className="h-14 w-14 rounded-2xl" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-5 w-48" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredCerts.length > 0 ? (
              filteredCerts.map((cert) => {
                const statusBadge = getStatusBadge(cert.status)
                return (
                  <div key={cert.id} className="p-6 flex flex-col md:flex-row items-center gap-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                    <div className="h-14 w-14 rounded-2xl bg-amber-50 dark:bg-amber-900/20 text-amber-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <Award className="h-7 w-7" />
                    </div>
                    <div className="flex-1 min-w-0 text-center md:text-left">
                      <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-1">
                        <Badge className={statusBadge.color}>{statusBadge.label}</Badge>
                        <Badge variant="outline" className="font-mono text-xs">
                          {cert.certificate_code}
                        </Badge>
                        <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
                          {cert.level}
                        </Badge>
                      </div>
                      <h3 className="text-xl font-black text-slate-900 dark:text-white truncate">{cert.title}</h3>
                      <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                        {cert.student_email} {cert.issued_by_email && `• Emitido por: ${cert.issued_by_email}`}
                      </p>
                      {cert.issued_at && (
                        <p className="text-xs font-bold text-slate-400 mt-1">
                          Emitido: {new Date(cert.issued_at).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {cert.status === 'pending' && (
                        <Button
                          size="sm"
                          disabled={actionLoading === cert.id}
                          onClick={() => handleIssue(cert)}
                          className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl h-10 px-4"
                        >
                          {actionLoading === cert.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <><CheckCircle className="mr-2 h-4 w-4" /> Emitir</>}
                        </Button>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800">
                            <MoreVertical className="h-5 w-5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl p-2">
                          {cert.status === 'issued' && (
                            <DropdownMenuItem
                              onSelect={() => setCertToRevoke(cert)}
                              className="font-bold py-3 text-red-600 dark:text-red-400 cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl"
                            >
                              <XCircle className="mr-2 h-4 w-4" /> Revocar Certificado
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onSelect={() => window.open(`http://localhost:8000/api/certificates/verify/${cert.certificate_code}/`, '_blank')}
                            className="font-bold py-3 cursor-pointer text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl"
                          >
                            <ExternalLink className="mr-2 h-4 w-4" /> Verificar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="py-20 text-center">
                <Award className="h-12 w-12 text-slate-200 dark:text-slate-700 mx-auto mb-4" />
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  {searchTerm ? 'No se encontraron certificados' : 'Aún no hay certificados'}
                </h3>
                <p className="text-slate-500 font-medium">
                  {searchTerm ? 'Prueba con otro término de búsqueda.' : 'Emita el primer certificado para empezar.'}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Revoke Dialog */}
      <AlertDialog open={!!certToRevoke} onOpenChange={(open) => !open && !isRevoking && setCertToRevoke(null)}>
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader>
            <div className="mx-auto bg-red-100 dark:bg-red-900/30 p-3 rounded-full w-fit mb-4">
              <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <AlertDialogTitle className="text-center text-2xl font-black">¿Revocar certificado?</AlertDialogTitle>
            <AlertDialogDescription className="text-center font-medium">
              Esta acción marcará como revocado el certificado{' '}
              <span className="font-bold text-slate-900 dark:text-white">"{certToRevoke?.certificate_code}"</span>.
              El estudiante perderá la validez del mismo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center gap-3 mt-6">
            <AlertDialogCancel disabled={isRevoking} className="rounded-xl h-12 px-6 font-bold">Cancelar</AlertDialogCancel>
            <AlertDialogAction disabled={isRevoking} onClick={handleRevoke} className="bg-red-600 hover:bg-red-700 text-white rounded-xl h-12 px-6 font-bold shadow-lg shadow-red-500/20">
              {isRevoking ? 'Revocando...' : 'Sí, revocar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}