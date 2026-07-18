import type { CreateCourseDto, UpdateCourseDto } from '@/application/dtos/course.dto'
import type { Course, Language } from '@/domain/entities/course.entity'
import type { CourseRepository } from '@/domain/ports/course.repository'

export class ManageCoursesUseCase {
  private readonly courseRepository: CourseRepository

  constructor(courseRepository: CourseRepository) {
    this.courseRepository = courseRepository
  }

  getLanguages(): Promise<Language[]> {
    return this.courseRepository.getLanguages()
  }

  getById(id: number): Promise<Course> {
    return this.courseRepository.getById(id)
  }

  create(data: CreateCourseDto): Promise<Course> {
    return this.courseRepository.create(data)
  }

  update(id: number, data: UpdateCourseDto): Promise<Course> {
    return this.courseRepository.update(id, data)
  }

  delete(id: number): Promise<void> {
    return this.courseRepository.delete(id)
  }
}
