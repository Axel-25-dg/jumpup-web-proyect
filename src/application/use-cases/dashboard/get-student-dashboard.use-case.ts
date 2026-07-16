import type { DashboardRepository, StudentDashboardData, RankingUser } from '@/domain/ports/dashboard.repository';
import type { Achievement } from '@/domain/entities/stats.entity';

export class GetStudentDashboardUseCase {
  private dashboardRepository: DashboardRepository;

  constructor(dashboardRepository: DashboardRepository) {
    this.dashboardRepository = dashboardRepository;
  }

  async execute(): Promise<{
    data: StudentDashboardData;
    achievements: Achievement[];
    ranking: RankingUser[];
  }> {
    const [data, achievements, ranking] = await Promise.all([
      this.dashboardRepository.getStudentData(),
      this.dashboardRepository.getAchievements(3),
      this.dashboardRepository.getRanking(5),
    ]);

    return { data, achievements, ranking };
  }
}
