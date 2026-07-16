import { AxiosDashboardRepository } from '../adapters/axios-dashboard.repository';
import { GetStudentDashboardUseCase } from '@/application/use-cases/dashboard/get-student-dashboard.use-case';

const repository = new AxiosDashboardRepository();

export const getStudentDashboardUseCase = new GetStudentDashboardUseCase(repository);
