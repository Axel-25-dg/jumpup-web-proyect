import type { CourseRepository } from '@/domain/ports/course.repository';
import type { Course } from '@/domain/entities/course.entity';
import type { PaginatedResult } from '@/domain/entities/paginated-result.entity';

export class GetCoursesUseCase {
  private courseRepository: CourseRepository;

  constructor(courseRepository: CourseRepository) {
    this.courseRepository = courseRepository;
  }

  async execute(params?: Record<string, any>): Promise<PaginatedResult<Course>> {
    return this.courseRepository.getAll(params);
  }
}
