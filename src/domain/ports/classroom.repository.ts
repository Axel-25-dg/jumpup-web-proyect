import type { Classroom, ClassroomStudent } from '../entities/classroom.entity';
import type { PaginatedResult } from '../entities/paginated-result.entity';

export interface ClassroomRepository {
  getAllByTeacher(teacherId: number, params?: Record<string, any>): Promise<PaginatedResult<Classroom>>;
  getAll(params?: Record<string, any>): Promise<PaginatedResult<Classroom>>;
  getById(id: number): Promise<Classroom>;
  getStudentsByClassroom(classroomId: number, params?: Record<string, any>): Promise<PaginatedResult<ClassroomStudent>>;
  create(data: Partial<Classroom>): Promise<Classroom>;
  update(id: number, data: Partial<Classroom>): Promise<Classroom>;
  delete(id: number): Promise<void>;
  approveStudent(classroomId: number, studentId: number): Promise<ClassroomStudent>;
  rejectStudent(classroomId: number, studentId: number): Promise<void>;
  removeStudent(classroomId: number, studentId: number): Promise<void>;
}
