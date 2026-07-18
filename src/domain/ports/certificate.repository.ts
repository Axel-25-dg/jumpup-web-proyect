import type { PaginatedResult } from '../entities/paginated-result.entity';
import type { Certificate, CertificateCreatePayload, CertificateIssuePayload } from '../entities/certificate.entity';

export interface CertificateRepository {
  getAll(params?: Record<string, any>): Promise<PaginatedResult<Certificate>>;
  getById(id: number): Promise<Certificate>;
  create(data: CertificateCreatePayload): Promise<Certificate>;
  issue(id: number, data?: CertificateIssuePayload): Promise<Certificate>;
  revoke(id: number): Promise<void>;
  validate(code: string): Promise<Certificate>;
}