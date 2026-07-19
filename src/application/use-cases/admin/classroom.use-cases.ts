import type { ClassroomRepository } from '@/domain/ports/classroom.repository';
import type { Classroom, ClassroomStudent } from '@/domain/entities/classroom.entity';
import type { PaginatedResult } from '@/domain/entities/paginated-result.entity';

export class GetAdminClassroomsUseCase {
  private readonly repository: ClassroomRepository;
  constructor(repository: ClassroomRepository) { this.repository = repository; }
  async execute(params?: Record<string, any>): Promise<PaginatedResult<Classroom>> {
    return this.repository.getAll(params);
  }
}

export class GetAdminClassroomByIdUseCase {
  private readonly repository: ClassroomRepository;
  constructor(repository: ClassroomRepository) { this.repository = repository; }
  async execute(id: number): Promise<Classroom> {
    return this.repository.getById(id);
  }
}

export class GetAdminClassroomStudentsUseCase {
  private readonly repository: ClassroomRepository;
  constructor(repository: ClassroomRepository) { this.repository = repository; }
  async execute(classroomId: number, params?: Record<string, any>): Promise<PaginatedResult<ClassroomStudent>> {
    return this.repository.getStudentsByClassroom(classroomId, params);
  }
}

export class CreateAdminClassroomUseCase {
  private readonly repository: ClassroomRepository;
  constructor(repository: ClassroomRepository) { this.repository = repository; }
  async execute(data: Partial<Classroom>): Promise<Classroom> {
    return this.repository.create(data);
  }
}

export class UpdateAdminClassroomUseCase {
  private readonly repository: ClassroomRepository;
  constructor(repository: ClassroomRepository) { this.repository = repository; }
  async execute(id: number, data: Partial<Classroom>): Promise<Classroom> {
    return this.repository.update(id, data);
  }
}

export class DeleteAdminClassroomUseCase {
  private readonly repository: ClassroomRepository;
  constructor(repository: ClassroomRepository) { this.repository = repository; }
  async execute(id: number): Promise<void> {
    return this.repository.delete(id);
  }
}