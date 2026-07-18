import type { ClassroomRepository } from '@/domain/ports/classroom.repository';
import type { Classroom, ClassroomStudent } from '@/domain/entities/classroom.entity';
import type { PaginatedResult } from '@/domain/entities/paginated-result.entity';

export class GetTeacherClassroomsUseCase {
  private readonly repository: ClassroomRepository;
  constructor(repository: ClassroomRepository) { this.repository = repository; }
  async execute(teacherId: number, params?: Record<string, any>): Promise<PaginatedResult<Classroom>> {
    return this.repository.getAllByTeacher(teacherId, params);
  }
}

export class GetClassroomByIdUseCase {
  private readonly repository: ClassroomRepository;
  constructor(repository: ClassroomRepository) { this.repository = repository; }
  async execute(id: number): Promise<Classroom> {
    return this.repository.getById(id);
  }
}

export class GetClassroomStudentsUseCase {
  private readonly repository: ClassroomRepository;
  constructor(repository: ClassroomRepository) { this.repository = repository; }
  async execute(classroomId: number, params?: Record<string, any>): Promise<PaginatedResult<ClassroomStudent>> {
    return this.repository.getStudentsByClassroom(classroomId, params);
  }
}

export class CreateClassroomUseCase {
  private readonly repository: ClassroomRepository;
  constructor(repository: ClassroomRepository) { this.repository = repository; }
  async execute(data: Partial<Classroom>): Promise<Classroom> {
    return this.repository.create(data);
  }
}

export class UpdateClassroomUseCase {
  private readonly repository: ClassroomRepository;
  constructor(repository: ClassroomRepository) { this.repository = repository; }
  async execute(id: number, data: Partial<Classroom>): Promise<Classroom> {
    return this.repository.update(id, data);
  }
}

export class DeleteClassroomUseCase {
  private readonly repository: ClassroomRepository;
  constructor(repository: ClassroomRepository) { this.repository = repository; }
  async execute(id: number): Promise<void> {
    return this.repository.delete(id);
  }
}

export class ApproveStudentUseCase {
  private readonly repository: ClassroomRepository;
  constructor(repository: ClassroomRepository) { this.repository = repository; }
  async execute(classroomId: number, studentId: number): Promise<ClassroomStudent> {
    return this.repository.approveStudent(classroomId, studentId);
  }
}

export class RejectStudentUseCase {
  private readonly repository: ClassroomRepository;
  constructor(repository: ClassroomRepository) { this.repository = repository; }
  async execute(classroomId: number, studentId: number): Promise<void> {
    return this.repository.rejectStudent(classroomId, studentId);
  }
}

export class RemoveStudentUseCase {
  private readonly repository: ClassroomRepository;
  constructor(repository: ClassroomRepository) { this.repository = repository; }
  async execute(classroomId: number, studentId: number): Promise<void> {
    return this.repository.removeStudent(classroomId, studentId);
  }
}
