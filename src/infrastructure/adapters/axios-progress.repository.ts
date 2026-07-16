import { apiClient } from '../http/axios-client';
import type { ProgressRepository } from '@/domain/ports/progress.repository';
import type { UserProgress, ProgressSummary } from '@/domain/entities/progress.entity';
import { parseApiError } from '../http/parse-api-error';

export class AxiosProgressRepository implements ProgressRepository {
  async getSummary(): Promise<ProgressSummary> {
    try {
      const { data } = await apiClient.get<ProgressSummary>('/progress/summary/');
      return data;
    } catch (err) {
      throw parseApiError(err);
    }
  }

  async getByLanguage(languageId: number): Promise<UserProgress[]> {
    try {
      const { data } = await apiClient.get<UserProgress[]>('/progress/by-language/', {
        params: { language: languageId }
      });
      return data;
    } catch (err) {
      throw parseApiError(err);
    }
  }

  async updateProgress(lessonId: number, data: { score: number; completed: boolean }): Promise<UserProgress> {
    try {
      const { data: response } = await apiClient.post<UserProgress>('/progress/', {
        lesson: lessonId,
        score: data.score,
        is_completed: data.completed
      });
      return response;
    } catch (err) {
      throw parseApiError(err);
    }
  }
}
