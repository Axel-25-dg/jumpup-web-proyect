import type { ProgressRepository } from '@/domain/ports/progress.repository';
import type { UserProgress } from '@/domain/entities/progress.entity';

export class GetLanguageProgressUseCase {
  private progressRepository: ProgressRepository;

  constructor(progressRepository: ProgressRepository) {
    this.progressRepository = progressRepository;
  }

  async execute(languageId: number): Promise<UserProgress[]> {
    return this.progressRepository.getByLanguage(languageId);
  }
}
