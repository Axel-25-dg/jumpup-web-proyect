import { AxiosStatsRepository } from '../adapters/axios-stats.repository';
import { GetUserStatsUseCase } from '@/application/use-cases/stats/get-user-stats.use-case';

const repository = new AxiosStatsRepository();

export const getUserStatsUseCase = new GetUserStatsUseCase(repository);
