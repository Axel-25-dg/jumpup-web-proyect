import type { CourseRepository } from '@/domain/ports/course.repository';
import type { Course, Module, Lesson } from '@/domain/entities/course.entity';

export class GetCourseDetailsUseCase {
  private courseRepository: CourseRepository;

  constructor(courseRepository: CourseRepository) {
    this.courseRepository = courseRepository;
  }

  async execute(courseId: number): Promise<{ course: Course; modules: (Module & { lessons: Lesson[] })[] }> {
    const course = await this.courseRepository.getById(courseId);
    const modules = await this.courseRepository.getModulesByCourse(courseId);

    const modulesWithLessons = await Promise.all(
      modules.map(async (module) => {
        const lessons = await this.courseRepository.getLessonsByModule(module.id);
        return { ...module, lessons };
      })
    );

    return { course, modules: modulesWithLessons };
  }
}
