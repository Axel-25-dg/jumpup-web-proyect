import type { UserStats, Achievement } from '../entities/stats.entity';
import type { PaginatedResult } from '../entities/paginated-result.entity';

export interface StatsRepository {
  getMyStats(): Promise<UserStats>;
  getAchievements(): Promise<PaginatedResult<Achievement>>;
  getRanking(): Promise<any[]>;
}
