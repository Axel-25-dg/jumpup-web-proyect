import type { ResourceRepository } from '@/domain/ports/resource.repository';
import type { Resource } from '@/domain/entities/resource.entity';
import type { PaginatedResult } from '@/domain/entities/paginated-result.entity';

export class GetTeacherResourcesUseCase {
  private readonly repository: ResourceRepository;
  constructor(repository: ResourceRepository) { this.repository = repository; }
  async execute(teacherId: number, params?: Record<string, any>): Promise<PaginatedResult<Resource>> {
    return this.repository.getAllByTeacher(teacherId, params);
  }
}

export class UploadResourceUseCase {
  private readonly repository: ResourceRepository;
  constructor(repository: ResourceRepository) { this.repository = repository; }
  async execute(formData: FormData): Promise<Resource> {
    return this.repository.create(formData);
  }
}

export class DeleteResourceUseCase {
  private readonly repository: ResourceRepository;
  constructor(repository: ResourceRepository) { this.repository = repository; }
  async execute(id: number): Promise<void> {
    return this.repository.delete(id);
  }
}
