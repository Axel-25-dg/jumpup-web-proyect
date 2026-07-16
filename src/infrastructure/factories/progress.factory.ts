import { AxiosProgressRepository } from '../adapters/axios-progress.repository';
import { GetProgressSummaryUseCase } from '@/application/use-cases/progress/get-progress-summary.use-case';
import { GetLanguageProgressUseCase } from '@/application/use-cases/progress/get-language-progress.use-case';

const repository = new AxiosProgressRepository();

export const getProgressSummaryUseCase = new GetProgressSummaryUseCase(repository);
export const getLanguageProgressUseCase = new GetLanguageProgressUseCase(repository);
