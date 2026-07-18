import type { ClassroomRepository } from '@/domain/ports/classroom.repository';
import type { Classroom, ClassroomStudent } from '@/domain/entities/classroom.entity';
import type { PaginatedResult } from '@/domain/entities/paginated-result.entity';

export class GetTeacherClassroomsUseCase {
  private readonly repository: ClassroomRepository;
  constructor(repository: ClassroomRepository) {
    this.repository = repository;
  }
  
  async execute(teacherId: number, params?: Record<string, any>): Promise<PaginatedResult<Classroom>> {
    return this.repository.getAllByTeacher(teacherId, params);
  }
}

export class GetClassroomStudentsUseCase {
  private readonly repository: ClassroomRepository;
  constructor(repository: ClassroomRepository) {
    this.repository = repository;
  }
  
  async execute(classroomId: number, params?: Record<string, any>): Promise<PaginatedResult<ClassroomStudent>> {
    return this.repository.getStudentsByClassroom(classroomId, params);
  }
}
