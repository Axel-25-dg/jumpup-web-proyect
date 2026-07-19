export interface VerifyResult {
  valid: boolean;
  certificate_code: string;
  student_name: string;
  level: string;
  title: string;
  status: 'pending' | 'issued' | 'revoked';
  issued_at: string | null;
}