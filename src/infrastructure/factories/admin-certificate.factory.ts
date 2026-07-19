import { AxiosAdminCertificateRepository } from '../adapters/axios-admin-certificate.repository';

import {
  GetCertificatesUseCase,
  GetCertificateByIdUseCase,
  CreateCertificateUseCase,
  UpdateCertificateUseCase,
  IssueCertificateUseCase,
  RevokeCertificateUseCase,
  ValidateCertificateUseCase,
} from '@/application/use-cases/admin/admin-certificate.use-cases';

const adminCertificateRepo = new AxiosAdminCertificateRepository();

export const getCertificatesUseCase = new GetCertificatesUseCase(adminCertificateRepo);
export const getCertificateByIdUseCase = new GetCertificateByIdUseCase(adminCertificateRepo);
export const createCertificateUseCase = new CreateCertificateUseCase(adminCertificateRepo);
export const updateCertificateUseCase = new UpdateCertificateUseCase(adminCertificateRepo);
export const issueCertificateUseCase = new IssueCertificateUseCase(adminCertificateRepo);
export const revokeCertificateUseCase = new RevokeCertificateUseCase(adminCertificateRepo);
export const validateCertificateUseCase = new ValidateCertificateUseCase(adminCertificateRepo);
