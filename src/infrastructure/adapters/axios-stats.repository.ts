import { apiClient } from '../http/axios-client';
import type { StatsRepository } from '@/domain/ports/stats.repository';
import type { UserStats, Achievement } from '@/domain/entities/stats.entity';
import type { PaginatedResult } from '@/domain/entities/paginated-result.entity';
import { parseApiError } from '../http/parse-api-error';

export class AxiosStatsRepository implements StatsRepository {
  async getMyStats(): Promise<UserStats> {
    try {
      // Según los endpoints, /api/stats/ suele devolver el objeto del usuario actual
      const { data } = await apiClient.get<UserStats>('/stats/');
      return data;
    } catch (err) {
      throw parseApiError(err);
    }
  }

  async getAchievements(): Promise<PaginatedResult<Achievement>> {
    try {
      const { data } = await apiClient.get<PaginatedResult<Achievement>>('/my-achievements/');
      return data;
    } catch (err) {
      throw parseApiError(err);
    }
  }

  async getRanking(): Promise<any[]> {
    try {
      const { data } = await apiClient.get<any[]>('/ranking/');
      return data;
    } catch (err) {
      throw parseApiError(err);
    }
  }
}
