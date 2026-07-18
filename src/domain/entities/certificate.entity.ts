export interface Certificate {
  id: number;
  student: number;
  student_email: string;
  issued_by: number | null;
  issued_by_email: string | null;
  level: string;
  level_display: string;
  title: string;
  description: string;
  certificate_code: string;
  status: 'pending' | 'issued' | 'revoked';
  status_display: string;
  issued_at: string | null;
  created_at: string;
}

export interface CertificateCreatePayload {
  student: number;
  level: string;
  title: string;
  description?: string;
  status?: 'pending' | 'issued';
  issued_at?: string | null;
}

export interface CertificateIssuePayload {
  issued_at?: string | null;
}