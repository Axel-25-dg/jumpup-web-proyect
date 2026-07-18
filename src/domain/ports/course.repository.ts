import type { Course, Module, Lesson } from '../entities/course.entity';
import type { PaginatedResult } from '../entities/paginated-result.entity';
import type { CreateCourseDto, UpdateCourseDto } from '@/application/dtos/course.dto';
import type { Language } from '../entities/course.entity';

export interface ExercisePayload {
  lesson: number;
  title: string;
  max_score?: number;
  exercise_type: string;
  question_text: string;
  options: string[];
  correct_answer: string;
}

export interface CourseRepository {
  getAll(params?: Record<string, any>): Promise<PaginatedResult<Course>>;
  getById(id: number): Promise<Course>;
  getLanguages(): Promise<Language[]>;
  create(data: CreateCourseDto): Promise<Course>;
  update(id: number, data: UpdateCourseDto): Promise<Course>;
  delete(id: number): Promise<void>;
  getModulesByCourse(courseId: number): Promise<Module[]>;
  getLessonsByModule(moduleId: number): Promise<Lesson[]>;
  deleteCourse(id: number): Promise<void>;
  createCourse(payload: Partial<Course>): Promise<Course>;
  updateCourse(id: number, payload: Partial<Course>): Promise<Course>;
  createModule(payload: { course: number; title: string; description?: string; order?: number }): Promise<Module>;
  updateModule(id: number, payload: Partial<Module>): Promise<Module>;
  deleteModule(id: number): Promise<void>;
  createLesson(payload: { module: number; title: string; content_type: string; content?: string; video_url?: string; order?: number; xp_reward?: number }): Promise<Lesson>;
  deleteLesson(id: number): Promise<void>;
  createExercise(payload: ExercisePayload): Promise<any>;
  deleteExercise(id: number): Promise<void>;
  getLanguages(): Promise<Array<{ id: number; name: string; code: string }>>;
}
