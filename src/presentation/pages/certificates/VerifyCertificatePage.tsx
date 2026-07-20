import { useEffect, useState, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { apiClient } from '@/infrastructure/http/axios-client'
import { Award, ShieldCheck, ShieldAlert, Loader2, ArrowLeft, CheckCircle2, Search, Download } from 'lucide-react'
import { Button } from '@/presentation/components/ui/button'
import type { Certificate } from '@/domain/entities/certificate.entity'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'

export default function VerifyCertificatePage() {
  const { code } = useParams()
  const [certificate, setCertificate] = useState<Certificate | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchCode, setSearchCode] = useState(code || '')
  const [isDownloading, setIsDownloading] = useState(false)
  const certificateRef = useRef<HTMLDivElement>(null)

  const handleDownloadPdf = async () => {
    if (!certificateRef.current) {
      alert('Error: No se encontró el contenedor del certificado.')
      return
    }
    setIsDownloading(true)
    try {
      // Small delay to ensure everything is rendered
      await new Promise(resolve => setTimeout(resolve, 500))

      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        ignoreElements: (element) => element.id === 'pdf-actions'
      })
      
      const dataUrl = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const imgWidth = canvas.width
      const imgHeight = canvas.height
      const pdfHeight = (imgHeight * pdfWidth) / imgWidth
      
      pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight)
      pdf.save(`Certificado_${certificate?.certificate_code || 'JumpUp'}.pdf`)
    } catch (error: any) {
      alert('Hubo un error al generar el PDF. Asegúrate de desactivar traductores automáticos y reintenta.')
      console.error('Error generating PDF', error)
    } finally {
      setIsDownloading(false)
    }
  }

  const verifyCode = async (codeToVerify: string) => {
    if (!codeToVerify) return
    setIsLoading(true)
    setError(null)
    try {
      // The API returns the certificate details if valid, or 404 if invalid.
      const res = await apiClient.get<any>(`/certificates/verify/${codeToVerify}/`)
      // Check if it's returning a nested object or directly the certificate
      const certData = res.data.certificate || res.data
      setCertificate(certData)
    } catch (err: any) {
      console.error('Error verifying certificate:', err)
      setError(err.response?.data?.detail || 'Certificado no encontrado o inválido.')
      setCertificate(null)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (code) {
      verifyCode(code)
    } else {
      setIsLoading(false)
    }
  }, [code])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchCode.trim()) {
      verifyCode(searchCode.trim())
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f6f3] dark:bg-[#0a0a0b] flex flex-col font-sans">
      {/* HEADER */}
      <header className="h-16 border-b border-slate-900/10 dark:border-white/10 bg-white dark:bg-[#0a0a0b] flex items-center px-6 shrink-0 print:hidden">
        <Link to="/" className="flex items-center gap-2 group transition-opacity hover:opacity-90">
          <img src="/JumpUp_Logo.png" alt="JumpUp Logo" className="h-8 w-8 object-contain" />
          <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            <span className="text-sky-500">ump</span>Up
          </span>
        </Link>
        <div className="ml-auto">
          <Button variant="ghost" asChild className="text-sm font-bold">
            <Link to="/"><ArrowLeft className="h-4 w-4 mr-2" /> Volver al Inicio</Link>
          </Button>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center py-16 px-6">
        <div className="w-full max-w-2xl space-y-8 animate-in fade-in duration-500">
          
          <div className="text-center space-y-4 print:hidden">
            <div className="inline-flex h-16 w-16 items-center justify-center border border-slate-900/10 dark:border-white/10 text-sky-500 bg-white dark:bg-[#0a0a0b] shadow-xl shadow-slate-200/50 dark:shadow-none mb-2">
              <ShieldCheck className="h-8 w-8" />
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white uppercase">
              Verificación Pública
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium max-w-lg mx-auto">
              Valida la autenticidad de los certificados MCER emitidos por nuestra plataforma.
            </p>
          </div>

          <form onSubmit={handleSearch} className="flex gap-2 print:hidden">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Ingresa el código del certificado (ej. CERT-123456)"
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
                className="w-full h-14 pl-12 pr-4 bg-white dark:bg-[#0a0a0b] border border-slate-900/10 dark:border-white/10 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all font-mono text-slate-900 dark:text-white uppercase"
              />
            </div>
            <Button type="submit" disabled={isLoading || !searchCode.trim()} className="h-14 px-8 font-bold uppercase tracking-widest bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-slate-200 dark:text-slate-900 rounded-none">
              Verificar
            </Button>
          </form>

          {isLoading ? (
            <div className="bg-white dark:bg-[#0a0a0b] border border-slate-900/10 dark:border-white/10 p-12 flex flex-col items-center justify-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
              <p className="label-caps text-slate-400">Verificando credencial...</p>
            </div>
          ) : certificate ? (
            <div className="w-full">
              <div ref={certificateRef} className="bg-white dark:bg-[#0a0a0b] border border-emerald-500/30 p-8 md:p-12 shadow-2xl shadow-emerald-500/5 relative overflow-hidden max-w-3xl mx-auto">
                <div className="absolute -right-12 -top-12 h-32 w-32 bg-emerald-500/10 rounded-full blur-2xl" />
                <div className="absolute -left-12 -bottom-12 h-32 w-32 bg-sky-500/10 rounded-full blur-2xl" />
                
                <div className="relative flex flex-col items-center text-center space-y-8">
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex h-16 w-16 items-center justify-center bg-emerald-500/10 text-emerald-500 rounded-full mb-2">
                      <CheckCircle2 className="h-8 w-8" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Certificado Válido</h2>
                    <span className="font-mono text-sm font-bold text-slate-500 bg-slate-100 dark:bg-white/5 px-3 py-1">
                      {certificate.certificate_code}
                    </span>
                  </div>

                  <div className="w-full space-y-6 text-left border-t border-b border-slate-900/10 dark:border-white/10 py-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <p className="label-micro text-slate-400 mb-1">TITULAR</p>
                        <p className="font-black text-lg text-slate-900 dark:text-white uppercase truncate" title={certificate.student_email}>
                          {certificate.student_email}
                        </p>
                      </div>
                      <div>
                        <p className="label-micro text-slate-400 mb-1">NIVEL ALCANZADO</p>
                        <p className="font-black text-lg text-sky-500 uppercase">
                          {certificate.level}
                        </p>
                      </div>
                      <div className="md:col-span-2">
                        <p className="label-micro text-slate-400 mb-1">ACREDITACIÓN</p>
                        <p className="font-bold text-slate-900 dark:text-white uppercase">
                          {certificate.title}
                        </p>
                        {certificate.description && (
                          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                            {certificate.description}
                          </p>
                        )}
                      </div>
                      <div>
                        <p className="label-micro text-slate-400 mb-1">FECHA DE EMISIÓN</p>
                        <p className="font-bold text-slate-900 dark:text-white uppercase">
                          {certificate.issued_at ? new Date(certificate.issued_at).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="label-micro text-slate-400 mb-1">EMITIDO POR</p>
                        <p className="font-bold text-slate-900 dark:text-white uppercase truncate" title={certificate.issued_by_email || 'JumpUp'}>
                          {certificate.issued_by_email || 'JUMPUP PLATFORM'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex flex-col items-center">
                    <Award className="h-10 w-10 text-slate-300 dark:text-slate-700 mb-3" />
                    <p className="text-xs text-slate-500 max-w-sm font-medium text-center mb-6">
                      Este documento certifica electrónicamente que la persona mencionada ha completado exitosamente los requisitos del programa.
                    </p>
                    
                    <div id="pdf-actions" className="w-full flex justify-center print:hidden">
                      {certificate.certificate_code ? (
                        <Button
                          variant="default"
                          className="w-full max-w-sm rounded-none font-black uppercase text-[10px] tracking-widest bg-emerald-600 hover:bg-emerald-700 text-white h-12 gap-3"
                          asChild
                        >
                          <a
                            href={certificate.certificate_code}
                            target="_blank"
                            rel="noopener noreferrer"
                            download={`Certificado_${certificate.level}.pdf`}
                          >
                            <Download className="h-3.5 w-3.5" /> DESCARGAR PDF OFICIAL
                          </a>
                        </Button>
                      ) : (
                        <Button
                          variant="default"
                          className="w-full max-w-sm rounded-none font-black uppercase text-[10px] tracking-widest bg-sky-600 hover:bg-sky-700 text-white h-12 gap-3"
                          onClick={handleDownloadPdf}
                          disabled={isDownloading}
                        >
                          {isDownloading ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Download className="h-3.5 w-3.5" />
                          )}
                          {isDownloading ? 'GENERANDO PDF...' : 'DESCARGAR PDF'}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : error && searchCode ? (
            <div className="bg-white dark:bg-[#0a0a0b] border border-rose-500/30 p-12 text-center flex flex-col items-center space-y-4 shadow-xl shadow-rose-500/5">
              <div className="flex h-16 w-16 items-center justify-center bg-rose-500/10 text-rose-500 rounded-full">
                <ShieldAlert className="h-8 w-8" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2">Verificación Fallida</h3>
                <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto">{error}</p>
              </div>
            </div>
          ) : null}

        </div>
      </main>
    </div>
  )
}
