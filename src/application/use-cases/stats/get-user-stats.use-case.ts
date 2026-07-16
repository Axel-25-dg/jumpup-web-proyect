import type { StatsRepository } from '@/domain/ports/stats.repository';
import type { UserStats } from '@/domain/entities/stats.entity';

export class GetUserStatsUseCase {
  private statsRepository: StatsRepository;

  constructor(statsRepository: StatsRepository) {
    this.statsRepository = statsRepository;
  }

  async execute(): Promise<UserStats> {
    return this.statsRepository.getMyStats();
  }
}
