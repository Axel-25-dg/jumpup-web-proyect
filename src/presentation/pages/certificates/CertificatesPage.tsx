import { useEffect, useState } from 'react'
import { apiClient } from '@/infrastructure/http/axios-client'
import { Award, ShieldCheck, ExternalLink, Loader2, ArrowLeft, Download } from 'lucide-react'
import { Button } from '@/presentation/components/ui/button'
import { Link } from 'react-router-dom'
import { useAuthStore } from '@/presentation/store/auth.store'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { CertificateTemplate } from './CertificateTemplate'

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
  const { user } = useAuthStore()
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState<number | null>(null)

  useEffect(() => {
    async function loadCertificates() {
      try {
        // We use /certificates/ as it's the standard endpoint that handles
        // ownership filtering on the backend.
        const res = await apiClient.get<any>('/certificates/')
        const certArray = Array.isArray(res.data) ? res.data : (res.data?.results || [])
        setCertificates(certArray)
      } catch (err: any) {
        console.error('Error loading certificates:', err)
      } finally {
        setIsLoading(false)
      }
    }
    loadCertificates()
  }, [])

  const handleDownloadPDF = async (cert: Certificate) => {
    const elementId = `cert-template-${cert.id}`
    const element = document.getElementById(elementId)
    if (!element) {
      console.error('Template element not found:', elementId)
      return
    }

    setIsGenerating(cert.id)
    try {
      // Ensure the template is ready and images are loaded
      await new Promise(resolve => setTimeout(resolve, 800))

      // We use html2canvas because it handles CORS and SecurityErrors more gracefully
      // than html-to-image when there are third-party scripts (like Google Translate) active.
      const canvas = await html2canvas(element, {
        scale: 2, // Higher quality
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: 1122,
        height: 794,
        onclone: (clonedDoc) => {
          // Ensure the element is visible in the cloned document for capture
          const clonedElement = clonedDoc.getElementById(elementId)
          if (clonedElement) {
            clonedElement.style.display = 'block'
            clonedElement.style.position = 'static'
            clonedElement.style.visibility = 'visible'
          }
        }
      })

      const dataUrl = canvas.toDataURL('image/png')

      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [1122, 794]
      })

      pdf.addImage(dataUrl, 'PNG', 0, 0, 1122, 794)
      pdf.save(`Certificado_${cert.level || 'Nivel'}_${cert.certificate_code}.pdf`)
    } catch (err) {
      console.error('Error generating PDF:', err)
      alert('Error técnico al generar el PDF. Asegúrate de no tener traductores automáticos activos y reintenta.')
    } finally {
      setIsGenerating(null)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
      </div>
    )
  }

  const visibleCerts = certificates.filter(c => c.status === 'issued')

  return (
    <>
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
                    </div>
                  </div>

                  <div className="mt-10 space-y-2">
                    <Button
                      onClick={() => handleDownloadPDF(cert)}
                      disabled={isGenerating === cert.id}
                      className="w-full rounded-none font-black uppercase text-[10px] tracking-widest bg-emerald-600 hover:bg-emerald-700 text-white h-12 gap-3"
                    >
                      {isGenerating === cert.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Download className="h-3.5 w-3.5" />
                      )}
                      <span>
                        {isGenerating === cert.id ? 'GENERANDO...' : 'DESCARGAR PDF'}
                      </span>
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full rounded-none border-slate-900/10 font-black uppercase text-[10px] tracking-widest hover:bg-slate-900 hover:text-white transition-all h-12 gap-3"
                      asChild
                    >
                      <a href={`/verify/${cert.certificate_code}`} target="_blank" rel="noopener noreferrer">
                        VERIFICACIÓN PÚBLICA <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-24 text-center bg-white dark:bg-[#0a0a0b] border border-slate-900/10 dark:border-white/10">
              <Award className="h-8 w-8 text-slate-200 mx-auto mb-4" />
              <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2">Sin Certificaciones</h3>
              <p className="label-micro text-slate-400 max-w-sm mx-auto uppercase tracking-widest px-6">
                Completa tus evaluaciones para obtener tus credenciales MCER.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Templates for PDF generation - Placed outside the main tree */}
      <div style={{
        position: 'fixed',
        top: '0',
        left: '-10000px',
        width: '1122px',
        height: '794px',
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: -1000
      }}>
        {visibleCerts.map(cert => (
          <CertificateTemplate
            key={`temp-${cert.id}`}
            id={`cert-template-${cert.id}`}
            studentName={user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username : 'Estudiante'}
            courseTitle={cert.title || 'Curso de Inglés'}
            level={cert.level}
            code={cert.certificate_code}
            date={cert.issued_at ? new Date(cert.issued_at).toLocaleDateString('es-ES') : 'N/A'}
          />
        ))}
      </div>
    </>
  )
}
