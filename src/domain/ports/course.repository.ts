import type { Course, Module, Lesson } from '../entities/course.entity';
import type { PaginatedResult } from '../entities/paginated-result.entity';

export interface CourseRepository {
  getAll(params?: Record<string, any>): Promise<PaginatedResult<Course>>;
  getById(id: number): Promise<Course>;
  getModulesByCourse(courseId: number): Promise<Module[]>;
  getLessonsByModule(moduleId: number): Promise<Lesson[]>;
  deleteCourse(id: number): Promise<void>;
  createCourse(payload: Partial<Course>): Promise<Course>;
}
