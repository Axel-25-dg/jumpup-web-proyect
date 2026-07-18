import { AxiosCourseRepository } from '../adapters/axios-course.repository';
import { GetCoursesUseCase } from '@/application/use-cases/courses/get-courses.use-case';
import { GetCourseDetailsUseCase } from '@/application/use-cases/courses/get-course-details.use-case';
import { ManageCoursesUseCase } from '@/application/use-cases/courses/manage-courses.use-case';

const repository = new AxiosCourseRepository();

export const getCoursesUseCase = new GetCoursesUseCase(repository);
export const getCourseDetailsUseCase = new GetCourseDetailsUseCase(repository);
export const manageCoursesUseCase = new ManageCoursesUseCase(repository);
