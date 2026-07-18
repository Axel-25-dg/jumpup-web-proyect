import type { DashboardRepository, AdminDashboardData } from '@/domain/ports/dashboard.repository';

export class GetAdminDashboardUseCase {
  private repository: DashboardRepository;

  constructor(repository: DashboardRepository) {
    this.repository = repository;
  }

  async execute(): Promise<AdminDashboardData> {
    return await this.repository.getAdminData();
  }
}
