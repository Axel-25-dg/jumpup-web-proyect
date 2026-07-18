import type { DashboardRepository, TeacherDashboardData } from '@/domain/ports/dashboard.repository';

export class GetTeacherDashboardUseCase {
  private repository: DashboardRepository;

  constructor(repository: DashboardRepository) {
    this.repository = repository;
  }

  async execute(): Promise<TeacherDashboardData> {
    return await this.repository.getTeacherData();
  }
}
