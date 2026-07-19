import type { Certificate, CertificateCreatePayload, CertificateIssuePayload } from '@/domain/entities/certificate.entity';
import type { VerifyResult } from '@/domain/entities/verify-result.entity';
import type { PaginatedResult } from '@/domain/entities/paginated-result.entity';
import type { AxiosAdminCertificateRepository } from '@/infrastructure/adapters/axios-admin-certificate.repository';

export class GetCertificatesUseCase {
  private readonly repository: AxiosAdminCertificateRepository;
  constructor(repository: AxiosAdminCertificateRepository) { this.repository = repository; }
  async execute(params?: Record<string, any>): Promise<PaginatedResult<Certificate>> {
    return this.repository.getAll(params);
  }
}

export class GetCertificateByIdUseCase {
  private readonly repository: AxiosAdminCertificateRepository;
  constructor(repository: AxiosAdminCertificateRepository) { this.repository = repository; }
  async execute(id: number): Promise<Certificate> {
    return this.repository.getById(id);
  }
}

export class CreateCertificateUseCase {
  private readonly repository: AxiosAdminCertificateRepository;
  constructor(repository: AxiosAdminCertificateRepository) { this.repository = repository; }
  async execute(data: CertificateCreatePayload): Promise<Certificate> {
    return this.repository.create(data);
  }
}

export class UpdateCertificateUseCase {
  private readonly repository: AxiosAdminCertificateRepository;
  constructor(repository: AxiosAdminCertificateRepository) { this.repository = repository; }
  async execute(id: number, data: Partial<CertificateCreatePayload>): Promise<Certificate> {
    return this.repository.update(id, data);
  }
}

export class IssueCertificateUseCase {
  private readonly repository: AxiosAdminCertificateRepository;
  constructor(repository: AxiosAdminCertificateRepository) { this.repository = repository; }
  async execute(id: number, data?: CertificateIssuePayload): Promise<Certificate> {
    return this.repository.issue(id, data);
  }
}

export class RevokeCertificateUseCase {
  private readonly repository: AxiosAdminCertificateRepository;
  constructor(repository: AxiosAdminCertificateRepository) { this.repository = repository; }
  async execute(id: number): Promise<void> {
    return this.repository.revoke(id);
  }
}

export class ValidateCertificateUseCase {
  private readonly repository: AxiosAdminCertificateRepository;
  constructor(repository: AxiosAdminCertificateRepository) { this.repository = repository; }
  async execute(code: string): Promise<VerifyResult> {
    return this.repository.validate(code);
  }
}