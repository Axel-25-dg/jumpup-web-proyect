import { useEffect, useState } from 'react'
import { apiClient } from '@/infrastructure/http/axios-client'
import { Award, ShieldCheck, ExternalLink, Loader2, ArrowLeft, Download } from 'lucide-react'
import { Button } from '@/presentation/components/ui/button'
import { Link } from 'react-router-dom'

interface Certificate {
  id: number
  certificate_code: string
  level: string
  issued_at: string | null
  status: 'pending' | 'issued' | 'revoked'
  title: string
  issued_by_email: string | null
  certificate_file?: string | null
}

export default function CertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadCertificates() {
      try {
        const res = await apiClient.get<any>('/certificates/mine/')
        const certArray = Array.isArray(res.data) ? res.data : (res.data?.results || [])
        setCertificates(certArray)
      } catch (err: any) {
        if (err.response?.status === 404) {
          // If /mine/ doesn't exist, try /certificates/
          try {
            const res = await apiClient.get<any>('/certificates/')
            const certArray = Array.isArray(res.data) ? res.data : (res.data?.results || [])
            setCertificates(certArray)
          } catch (e) {
            console.error('Error fallback loading certificates:', e)
          }
        } else {
          console.error('Error loading certificates:', err)
        }
      } finally {
        setIsLoading(false)
      }
    }
    loadCertificates()
  }, [])

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
      </div>
    )
  }

  // Only show issued certificates for the student, or pending if you want them to know
  const visibleCerts = certificates.filter(c => c.status === 'issued')

  return (
    <div className="animate-in fade-in duration-500">
      {/* HERO */}
      <section className="border-b border-slate-900/10 dark:border-white/10 px-8 md:px-12 py-14 md:py-16">
        <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" asChild className="-ml-2 rounded-none hover:bg-slate-100 dark:hover:bg-white/5">
                <Link to="/dashboard"><ArrowLeft className="h-4 w-4" /></Link>
              </Button>
              <div className="chip">
                <ShieldCheck className="h-3.5 w-3.5 text-sky-500" />
                Acreditación
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white uppercase">
              Tus Certificados <span className="text-sky-500">MCER</span>.
            </h1>
            <p className="text-base text-slate-500 dark:text-slate-400 max-w-xl font-medium leading-relaxed">
              Credenciales técnicas que validan tu competencia lingüística bajo el Marco Común Europeo de Referencia.
            </p>
          </div>
        </div>
      </section>

      {/* LISTING */}
      <div className="px-8 md:px-12 py-12 bg-[#f7f6f3] dark:bg-[#0a0a0b]">
        {visibleCerts.length > 0 ? (
          <div className="grid gap-px md:grid-cols-2 lg:grid-cols-3 bg-slate-900/10 dark:bg-white/10 border border-slate-900/10 dark:border-white/10 shadow-xl shadow-slate-200/50 dark:shadow-none">
            {visibleCerts.map((cert) => (
              <div key={cert.id} className="p-10 bg-white dark:bg-[#0a0a0b] hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors group flex flex-col justify-between h-full">
                <div>
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex h-12 w-12 items-center justify-center border border-slate-900/10 dark:border-white/10 text-sky-500 group-hover:bg-sky-500 group-hover:text-white transition-all">
                      <Award className="h-6 w-6" />
                    </div>
                    <span className="label-micro font-black border border-sky-500/20 px-3 py-1 text-sky-600 bg-sky-500/5 tracking-[0.2em]">
                      NIVEL {(cert.level || '').toUpperCase()}
                    </span>
                  </div>

                  <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight uppercase leading-tight mb-8 min-h-[3rem] group-hover:text-sky-500 transition-colors">
                    {cert.title || 'CURSO TÉCNICO CERTIFICADO'}
                  </h3>

                  <div className="space-y-4 pt-8 border-t border-slate-900/5 dark:border-white/5">
                    <div className="flex justify-between items-center py-1">
                      <span className="label-micro text-slate-400 tracking-widest font-bold">CÓDIGO VERIF.</span>
                      <span className="font-mono text-xs text-slate-950 dark:text-white font-black tracking-wider bg-slate-50 dark:bg-white/5 px-2 py-0.5">{cert.certificate_code}</span>
                    </div>

                    <div className="flex justify-between items-center py-1">
                      <span className="label-micro text-slate-400 tracking-widest font-bold">EMITIDO</span>
                      <span className="label-micro font-black text-slate-700 dark:text-slate-300">
                        {cert.issued_at ? new Date(cert.issued_at).toLocaleDateString('es-ES').toUpperCase() : 'N/A'}
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-1">
                      <span className="label-micro text-slate-400 tracking-widest font-bold">AUTORIZADO POR</span>
                      <span className="label-micro font-black text-slate-700 dark:text-slate-300 uppercase truncate max-w-[150px]">
                        {cert.issued_by_email || 'SYSTEM_VALIDATOR'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-10 space-y-2">
                  {cert.certificate_file && (
                    <Button
                      variant="default"
                      className="w-full rounded-none font-black uppercase text-[10px] tracking-widest bg-emerald-600 hover:bg-emerald-700 text-white h-12 gap-3"
                      asChild
                    >
                      <a
                        href={cert.certificate_file}
                        target="_blank"
                        rel="noopener noreferrer"
                        download={`Certificado_${cert.level}.pdf`}
                      >
                        <Download className="h-3.5 w-3.5" /> DESCARGAR PDF
                      </a>
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    className="w-full rounded-none border-slate-900/10 font-black uppercase text-[10px] tracking-widest hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-slate-900 transition-all h-12 gap-3"
                    asChild
                  >
                    <a
                      href={`/verify/${cert.certificate_code}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      VERIFICACIÓN PÚBLICA <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-24 text-center bg-white dark:bg-[#0a0a0b] border border-slate-900/10 dark:border-white/10">
            <div className="h-20 w-20 border border-slate-900/10 dark:border-white/10 mx-auto mb-8 flex items-center justify-center">
              <Award className="h-8 w-8 text-slate-100" />
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2">Sin Certificaciones Emitidas</h3>
            <p className="label-micro text-slate-400 max-w-sm mx-auto uppercase tracking-widest leading-relaxed px-6">
              COMPLETA LAS EVALUACIONES DE NIVEL PARA OBTENER TUS CREDENCIALES OFICIALES MCER.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
