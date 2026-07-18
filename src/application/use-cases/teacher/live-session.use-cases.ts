import type { LiveSessionRepository } from '@/domain/ports/live-session.repository';
import type { LiveSession } from '@/domain/entities/live-session.entity';
import type { PaginatedResult } from '@/domain/entities/paginated-result.entity';

export class GetTeacherLiveSessionsUseCase {
  private readonly repository: LiveSessionRepository;
  constructor(repository: LiveSessionRepository) { this.repository = repository; }
  async execute(teacherId: number, params?: Record<string, any>): Promise<PaginatedResult<LiveSession>> {
    return this.repository.getAllByTeacher(teacherId, params);
  }
}

export class CreateLiveSessionUseCase {
  private readonly repository: LiveSessionRepository;
  constructor(repository: LiveSessionRepository) { this.repository = repository; }
  async execute(data: Partial<LiveSession>): Promise<LiveSession> {
    return this.repository.create(data);
  }
}

export class UpdateLiveSessionUseCase {
  private readonly repository: LiveSessionRepository;
  constructor(repository: LiveSessionRepository) { this.repository = repository; }
  async execute(id: number, data: Partial<LiveSession>): Promise<LiveSession> {
    return this.repository.update(id, data);
  }
}

export class CancelLiveSessionUseCase {
  private readonly repository: LiveSessionRepository;
  constructor(repository: LiveSessionRepository) { this.repository = repository; }
  async execute(id: number): Promise<void> {
    return this.repository.cancel(id);
  }
}

export class DeleteLiveSessionUseCase {
  private readonly repository: LiveSessionRepository;
  constructor(repository: LiveSessionRepository) { this.repository = repository; }
  async execute(id: number): Promise<void> {
    return this.repository.delete(id);
  }
}
