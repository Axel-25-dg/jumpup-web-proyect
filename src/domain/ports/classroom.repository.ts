import type { Classroom, ClassroomStudent } from '../entities/classroom.entity';
import type { PaginatedResult } from '../entities/paginated-result.entity';

export interface ClassroomRepository {
  getAllByTeacher(teacherId: number, params?: Record<string, any>): Promise<PaginatedResult<Classroom>>;
  getStudentsByClassroom(classroomId: number, params?: Record<string, any>): Promise<PaginatedResult<ClassroomStudent>>;
  create(data: Partial<Classroom>): Promise<Classroom>;
}
