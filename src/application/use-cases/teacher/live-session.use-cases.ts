import type { LiveSessionRepository } from '@/domain/ports/live-session.repository';
import type { LiveSession } from '@/domain/entities/live-session.entity';
import type { PaginatedResult } from '@/domain/entities/paginated-result.entity';

export class GetTeacherLiveSessionsUseCase {
  private readonly repository: LiveSessionRepository;
  constructor(repository: LiveSessionRepository) {
    this.repository = repository;
  }
  
  async execute(teacherId: number, params?: Record<string, any>): Promise<PaginatedResult<LiveSession>> {
    return this.repository.getAllByTeacher(teacherId, params);
  }
}
