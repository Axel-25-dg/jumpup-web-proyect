import { Award, ShieldCheck } from 'lucide-react'

interface CertificateTemplateProps {
  id: string
  studentName: string
  courseTitle: string
  level: string
  code: string
  date: string
}

/**
 * CertificateTemplate
 *
 * CRITICAL: This component MUST NOT use any Tailwind classes or modern CSS features.
 * html2canvas fails with 'oklch' and other modern CSS.
 * We use absolute pixel values and hex colors.
 */
export const CertificateTemplate = ({ id, studentName, courseTitle, level, code, date }: CertificateTemplateProps) => {
  return (
    <div
      id={id}
      style={{
        width: '1122px',
        height: '794px',
        backgroundColor: '#ffffff',
        color: '#0f172a',
        fontFamily: 'Arial, Helvetica, sans-serif',
        padding: '0',
        margin: '0',
        boxSizing: 'border-box',
        overflow: 'hidden',
        display: 'block',
        visibility: 'visible',
        position: 'relative'
      }}
    >
      <div style={{
        height: '100%',
        width: '100%',
        border: '30px solid #0f172a',
        padding: '60px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'relative',
        boxSizing: 'border-box',
      }}>
        {/* Background Decorations */}
        <div style={{ position: 'absolute', bottom: '-100px', left: '-100px', width: '350px', height: '350px', backgroundColor: '#f8fafc', transform: 'rotate(45deg)', zIndex: 0 }} />
        <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '350px', height: '350px', backgroundColor: '#f0f9ff', transform: 'rotate(45deg)', zIndex: 0 }} />

        {/* Header */}
        <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', justifyContent: 'center', marginBottom: '15px' }}>
            <Award size={48} color="#0ea5e9" />
            <span style={{ fontSize: '32px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.2em' }}>
              JumpUp Academy
            </span>
          </div>
          <div style={{ width: '80px', height: '4px', backgroundColor: '#0ea5e9', margin: '0 auto' }} />
        </div>

        {/* Body */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 1, width: '100%' }}>
          <span style={{ fontSize: '18px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.6em', color: '#64748b', marginBottom: '50px' }}>
            Certificado de Finalización
          </span>

          <span style={{ fontSize: '16px', textTransform: 'uppercase', letterSpacing: '0.2em', color: '#94a3b8', marginBottom: '20px' }}>
            Este reconocimiento se otorga a:
          </span>

          <h1 style={{
            fontSize: '64px',
            fontWeight: '900',
            textTransform: 'uppercase',
            color: '#0f172a',
            borderBottom: '4px solid #0f172a',
            paddingBottom: '20px',
            marginBottom: '40px',
            minWidth: '70%',
            textAlign: 'center',
            margin: '0'
          }}>
            {studentName}
          </h1>

          <p style={{
            fontSize: '18px',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: '#475569',
            maxWidth: '750px',
            lineHeight: '1.8',
            marginBottom: '40px',
            textAlign: 'center'
          }}>
            Por haber demostrado excelencia académica y superado con éxito todas las evaluaciones técnicas correspondientes al nivel de competencia lingüística:
          </p>

          <div style={{
            backgroundColor: '#0f172a',
            color: '#ffffff',
            padding: '25px 80px',
            marginBottom: '25px',
            textAlign: 'center'
          }}>
            <span style={{ fontSize: '32px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              {level} - {courseTitle}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#0ea5e9' }}>
            <ShieldCheck size={20} />
            <span style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.3em' }}>
              Validación Oficial bajo Estándares MCER
            </span>
          </div>
        </div>

        {/* Footer */}
        <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '3px solid #f1f5f9', paddingTop: '30px', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', color: '#94a3b8' }}>Código de Autenticidad</span>
            <span style={{ fontSize: '16px', fontWeight: 'bold', fontFamily: 'monospace', color: '#0f172a' }}>{code}</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '180px', height: '2px', backgroundColor: '#cbd5e1' }} />
            <span style={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', color: '#0f172a' }}>Firma Autorizada</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', color: '#94a3b8' }}>Fecha de Expedición</span>
            <span style={{ fontSize: '16px', fontWeight: 'bold', textTransform: 'uppercase', color: '#0f172a' }}>{date}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
