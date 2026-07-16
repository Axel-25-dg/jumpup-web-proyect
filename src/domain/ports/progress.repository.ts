import type { UserProgress, ProgressSummary } from '../entities/progress.entity';

export interface ProgressRepository {
  getSummary(): Promise<ProgressSummary>;
  getByLanguage(languageId: number): Promise<UserProgress[]>;
  updateProgress(lessonId: number, data: { score: number; completed: boolean }): Promise<UserProgress>;
}
