import { AxiosAdminUserRepository } from '../adapters/axios-admin-user.repository';
import { AxiosCertificateRepository } from '../adapters/axios-certificate.repository';
import { AxiosClassroomRepository } from '../adapters/axios-classroom.repository';

import {
  GetAdminUsersUseCase,
  GetAdminUserByIdUseCase,
  CreateAdminUserUseCase,
  UpdateAdminUserUseCase,
  DeleteAdminUserUseCase,
  GetRolesUseCase,
  ToggleUserActiveUseCase,
} from '@/application/use-cases/admin/admin-user.use-cases';

import {
  GetCertificatesUseCase,
  GetCertificateByIdUseCase,
  CreateCertificateUseCase,
  IssueCertificateUseCase,
  RevokeCertificateUseCase,
  ValidateCertificateUseCase,
} from '@/application/use-cases/admin/certificate.use-cases';

import {
  GetAdminClassroomsUseCase,
  GetAdminClassroomByIdUseCase,
  GetAdminClassroomStudentsUseCase,
  CreateAdminClassroomUseCase,
  UpdateAdminClassroomUseCase,
  DeleteAdminClassroomUseCase,
} from '@/application/use-cases/admin/classroom.use-cases';

// Repositories
const adminUserRepo = new AxiosAdminUserRepository();
const certificateRepo = new AxiosCertificateRepository();
const adminClassroomRepo = new AxiosClassroomRepository();

// User use cases
export const getAdminUsersUseCase = new GetAdminUsersUseCase(adminUserRepo);
export const getAdminUserByIdUseCase = new GetAdminUserByIdUseCase(adminUserRepo);
export const createAdminUserUseCase = new CreateAdminUserUseCase(adminUserRepo);
export const updateAdminUserUseCase = new UpdateAdminUserUseCase(adminUserRepo);
export const deleteAdminUserUseCase = new DeleteAdminUserUseCase(adminUserRepo);
export const getRolesUseCase = new GetRolesUseCase(adminUserRepo);
export const toggleUserActiveUseCase = new ToggleUserActiveUseCase(adminUserRepo);

// Certificate use cases
export const getCertificatesUseCase = new GetCertificatesUseCase(certificateRepo);
export const getCertificateByIdUseCase = new GetCertificateByIdUseCase(certificateRepo);
export const createCertificateUseCase = new CreateCertificateUseCase(certificateRepo);
export const issueCertificateUseCase = new IssueCertificateUseCase(certificateRepo);
export const revokeCertificateUseCase = new RevokeCertificateUseCase(certificateRepo);
export const validateCertificateUseCase = new ValidateCertificateUseCase(certificateRepo);

// Classroom use cases (admin)
export const getAdminClassroomsUseCase = new GetAdminClassroomsUseCase(adminClassroomRepo);
export const getAdminClassroomByIdUseCase = new GetAdminClassroomByIdUseCase(adminClassroomRepo);
export const getAdminClassroomStudentsUseCase = new GetAdminClassroomStudentsUseCase(adminClassroomRepo);
export const createAdminClassroomUseCase = new CreateAdminClassroomUseCase(adminClassroomRepo);
export const updateAdminClassroomUseCase = new UpdateAdminClassroomUseCase(adminClassroomRepo);
export const deleteAdminClassroomUseCase = new DeleteAdminClassroomUseCase(adminClassroomRepo);
