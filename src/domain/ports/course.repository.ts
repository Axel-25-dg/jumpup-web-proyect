import type { Course, Module, Lesson } from '../entities/course.entity';
import type { PaginatedResult } from '../entities/paginated-result.entity';
import type { CreateCourseDto, UpdateCourseDto } from '@/application/dtos/course.dto';
import type { Language } from '../entities/course.entity';

export interface CourseRepository {
  getAll(params?: Record<string, any>): Promise<PaginatedResult<Course>>;
  getById(id: number): Promise<Course>;
  getLanguages(): Promise<Language[]>;
  create(data: CreateCourseDto): Promise<Course>;
  update(id: number, data: UpdateCourseDto): Promise<Course>;
  delete(id: number): Promise<void>;
  getModulesByCourse(courseId: number): Promise<Module[]>;
  getLessonsByModule(moduleId: number): Promise<Lesson[]>;
}
