import type { ProgressRepository } from '@/domain/ports/progress.repository';
import type { ProgressSummary } from '@/domain/entities/progress.entity';

export class GetProgressSummaryUseCase {
  private progressRepository: ProgressRepository;

  constructor(progressRepository: ProgressRepository) {
    this.progressRepository = progressRepository;
  }

  async execute(): Promise<ProgressSummary> {
    return this.progressRepository.getSummary();
  }
}
