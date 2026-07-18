import { AxiosDashboardRepository } from '../adapters/axios-dashboard.repository';
import { GetStudentDashboardUseCase } from '@/application/use-cases/dashboard/get-student-dashboard.use-case';
import { GetTeacherDashboardUseCase } from '@/application/use-cases/dashboard/get-teacher-dashboard.use-case';
import { GetAdminDashboardUseCase } from '@/application/use-cases/dashboard/get-admin-dashboard.use-case';

const repository = new AxiosDashboardRepository();

export const getStudentDashboardUseCase = new GetStudentDashboardUseCase(repository);
export const getTeacherDashboardUseCase = new GetTeacherDashboardUseCase(repository);
export const getAdminDashboardUseCase = new GetAdminDashboardUseCase(repository);
