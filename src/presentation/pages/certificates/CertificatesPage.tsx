import { useEffect, useState } from 'react'
import { apiClient } from '@/infrastructure/http/axios-client'
import { Award, ShieldCheck, Calendar, UserCheck, ExternalLink, Loader2 } from 'lucide-react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/presentation/components/ui/card'
import { Button } from '@/presentation/components/ui/button'
import { Badge } from '@/presentation/components/ui/badge'

interface Certificate {
  id: number
  code: string
  difficulty_level: string
  issued_date: string
  status: 'pending' | 'issued' | 'revoked'
  course_info?: {
    title: string
  }
  teacher_info?: {
    username: string
  }
}

export default function CertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadCertificates() {
      try {
        const res = await apiClient.get<Certificate[]>('/certificates/')
        setCertificates(res.data)
      } catch (err) {
        console.error('Error loading certificates:', err)
      } finally {
        setIsLoading(false)
      }
    }
    loadCertificates()
  }, [])

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Title */}
      <div className="border-b pb-4">
        <h1 className="text-3xl font-extrabold tracking-tight">Tus Certificados MCER</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Credenciales oficiales que validan tu competencia comunicativa en diferentes niveles del Marco Común Europeo de Referencia.
        </p>
      </div>

      {/* Grid listing */}
      {certificates.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2">
          {certificates.map((cert) => (
            <Card key={cert.id} className="relative overflow-hidden border-2 border-amber-200/60 dark:border-amber-900/40 shadow-md bg-gradient-to-b from-amber-50/10 to-white dark:from-amber-950/5">
              {/* Ribbon decoration */}
              <div className="absolute right-0 top-0 h-16 w-16 overflow-hidden">
                <div className="absolute transform rotate-45 bg-amber-500 text-white text-[9px] font-bold text-center py-1 right-[-35px] top-[15px] w-[100px] uppercase tracking-wider shadow">
                  Oficial
                </div>
              </div>

              <CardHeader className="p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                    <Award className="h-7 w-7" />
                  </div>
                  <div>
                    <Badge variant="outline" className="border-amber-300 text-amber-800 bg-amber-50 dark:bg-amber-950/20 font-bold uppercase">
                      Nivel {cert.difficulty_level}
                    </Badge>
                    <CardTitle className="text-lg mt-1 font-extrabold">{cert.course_info?.title || 'Curso Certificado'}</CardTitle>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-6 pt-0 space-y-4 text-sm">
                <div className="space-y-2 border-t border-dashed pt-4">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                      Código de Verificación
                    </span>
                    <span className="font-mono font-bold text-card-foreground">{cert.code}</span>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-indigo-500" />
                      Fecha de Emisión
                    </span>
                    <span className="font-medium">{new Date(cert.issued_date).toLocaleDateString()}</span>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <UserCheck className="h-3.5 w-3.5 text-blue-500" />
                      Profesor Firmante
                    </span>
                    <span className="font-medium">{cert.teacher_info?.username || 'Profesor Calificado'}</span>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="p-4 bg-muted/20 border-t flex gap-2">
                <Button variant="outline" size="sm" className="w-full text-xs font-semibold" asChild>
                  <a
                    href={`http://localhost:8000/api/certificates/verify/${cert.code}/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Verificación Pública
                  </a>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex h-64 flex-col items-center justify-center border-2 border-dashed rounded-xl p-8 text-center text-muted-foreground">
          <Award className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
          <h3 className="font-bold text-lg">Sin Certificados</h3>
          <p className="text-sm max-w-xs mt-1">
            Completa satisfactoriamente los cursos de idiomas y aprueba las evaluaciones finales para recibir tus credenciales MCER verificables.
          </p>
        </div>
      )}
    </div>
  )
}
