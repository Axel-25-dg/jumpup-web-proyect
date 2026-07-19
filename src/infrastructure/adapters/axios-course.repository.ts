import { apiClient } from '../http/axios-client';
import type { CourseRepository, ExercisePayload } from '@/domain/ports/course.repository';
import type { Course, Language, Module, Lesson } from '@/domain/entities/course.entity';
import type { PaginatedResult } from '@/domain/entities/paginated-result.entity';
import type { CreateCourseDto, UpdateCourseDto } from '@/application/dtos/course.dto';
import { parseApiError } from '../http/parse-api-error';

export class AxiosCourseRepository implements CourseRepository {
  async getAll(params?: Record<string, any>): Promise<PaginatedResult<Course>> {
    try {
      const { data } = await apiClient.get<PaginatedResult<Course>>('/courses/', { params });
      return data;
    } catch (err) {
      throw parseApiError(err);
    }
  }

  async getById(id: number): Promise<Course> {
    try {
      const { data } = await apiClient.get<Course>(`/courses/${id}/`);
      return data;
    } catch (err) {
      throw parseApiError(err);
    }
  }

  async getLanguages(): Promise<Language[]> {
    try {
      const { data } = await apiClient.get<PaginatedResult<Language>>('/languages/', {
        params: { page_size: 100, ordering: 'name' },
      });
      return data.results;
    } catch (err) {
      throw parseApiError(err);
    }
  }

  async create(dto: CreateCourseDto): Promise<Course> {
    try {
      const { data } = await apiClient.post<Course>('/courses/', this.toFormData(dto));
      return data;
    } catch (err) {
      throw parseApiError(err);
    }
  }

  async update(id: number, dto: UpdateCourseDto): Promise<Course> {
    try {
      const { data } = await apiClient.patch<Course>(`/courses/${id}/`, this.toFormData(dto));
      return data;
    } catch (err) {
      throw parseApiError(err);
    }
  }

  async delete(id: number): Promise<void> {
    try {
      await apiClient.delete(`/courses/${id}/`);
    } catch (err) {
      throw parseApiError(err);
    }
  }

  async getModulesByCourse(courseId: number): Promise<Module[]> {
    try {
      const { data } = await apiClient.get<PaginatedResult<Module>>('/modules/', {
        params: { course: courseId }
      });
      return data.results;
    } catch (err) {
      throw parseApiError(err);
    }
  }

  async getLessonsByModule(moduleId: number): Promise<Lesson[]> {
    try {
      const { data } = await apiClient.get<PaginatedResult<Lesson>>('/lessons/', {
        params: { module: moduleId }
      });
      return data.results;
    } catch (err) {
      throw parseApiError(err);
    }
  }

  async deleteCourse(id: number): Promise<void> {
    try {
      await apiClient.delete(`/courses/${id}/`);
    } catch (err) {
      throw parseApiError(err);
    }
  }

  async createCourse(payload: Partial<Course>): Promise<Course> {
    try {
      const { data } = await apiClient.post<Course>('/courses/', payload);
      return data;
    } catch (err) {
      throw parseApiError(err);
    }
  }

  async updateCourse(id: number, payload: Partial<Course> | FormData): Promise<Course> {
    try {
      const { data } = await apiClient.patch<Course>(`/courses/${id}/`, payload, {
        headers: payload instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : undefined
      });
      return data;
    } catch (err) {
      throw parseApiError(err);
    }
  }

  async createModule(payload: { course: number; title: string; description?: string; order?: number }): Promise<Module> {
    try {
      const { data } = await apiClient.post<Module>('/modules/', payload);
      return data;
    } catch (err) {
      throw parseApiError(err);
    }
  }

  async updateModule(id: number, payload: Partial<Module>): Promise<Module> {
    try {
      const { data } = await apiClient.patch<Module>(`/modules/${id}/`, payload);
      return data;
    } catch (err) {
      throw parseApiError(err);
    }
  }

  async deleteModule(id: number): Promise<void> {
    try {
      await apiClient.delete(`/modules/${id}/`);
    } catch (err) {
      throw parseApiError(err);
    }
  }

  async createLesson(payload: {
    module: number;
    title: string;
    content_type: string;
    content?: string;
    video_url?: string;
    order?: number;
    xp_reward?: number;
  }): Promise<Lesson> {
    try {
      const { data } = await apiClient.post<Lesson>('/lessons/', payload);
      return data;
    } catch (err) {
      throw parseApiError(err);
    }
  }

  async updateLesson(id: number, payload: Partial<{ title: string; content_type: string; order: number; xp_reward: number }>): Promise<Lesson> {
    try {
      const { data } = await apiClient.patch<Lesson>(`/lessons/${id}/`, payload);
      return data;
    } catch (err) {
      throw parseApiError(err);
    }
  }

  async deleteLesson(id: number): Promise<void> {
    try {
      await apiClient.delete(`/lessons/${id}/`);
    } catch (err) {
      throw parseApiError(err);
    }
  }

  async getExercisesByLesson(lessonId: number): Promise<any[]> {
    try {
      const { data } = await apiClient.get<PaginatedResult<any>>('/exercises/', {
        params: { lesson: lessonId, page_size: 100 },
      });
      return data.results;
    } catch (err) {
      throw parseApiError(err);
    }
  }

  async createLanguage(payload: { name: string; code: string }): Promise<any> {
    try {
      const { data } = await apiClient.post('/languages/', payload);
      return data;
    } catch (err) {
      throw parseApiError(err);
    }
  }

  async updateLanguage(id: number, payload: { name?: string; code?: string }): Promise<any> {
    try {
      const { data } = await apiClient.patch(`/languages/${id}/`, payload);
      return data;
    } catch (err) {
      throw parseApiError(err);
    }
  }

  async deleteLanguage(id: number): Promise<void> {
    try {
      await apiClient.delete(`/languages/${id}/`);
    } catch (err) {
      throw parseApiError(err);
    }
  }

  async createExercise(payload: ExercisePayload): Promise<any> {
    try {
      const { data } = await apiClient.post('/exercises/', payload);
      return data;
    } catch (err) {
      throw parseApiError(err);
    }
  }

  async updateExercise(id: number, payload: Partial<ExercisePayload>): Promise<any> {
    try {
      const { data } = await apiClient.patch(`/exercises/${id}/`, payload);
      return data;
    } catch (err) {
      throw parseApiError(err);
    }
  }

  async deleteExercise(id: number): Promise<void> {
    try {
      await apiClient.delete(`/exercises/${id}/`);
    } catch (err) {
      throw parseApiError(err);
    }
  }

  private toFormData(dto: CreateCourseDto | UpdateCourseDto): FormData {
    const formData = new FormData();
    if (dto.language !== undefined) formData.append('language', String(dto.language));
    if (dto.title !== undefined) formData.append('title', dto.title);
    if (dto.description !== undefined) formData.append('description', dto.description);
    if (dto.difficulty_level !== undefined) formData.append('difficulty_level', dto.difficulty_level);
    if (dto.image instanceof File) formData.append('image', dto.image);
    return formData;
  }
}
