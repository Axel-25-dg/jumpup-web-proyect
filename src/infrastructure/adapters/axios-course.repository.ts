import { apiClient } from '../http/axios-client';
import type { CourseRepository, ExercisePayload } from '@/domain/ports/course.repository';
import type { Course, Module, Lesson } from '@/domain/entities/course.entity';
import type { PaginatedResult } from '@/domain/entities/paginated-result.entity';
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

  async deleteLesson(id: number): Promise<void> {
    try {
      await apiClient.delete(`/lessons/${id}/`);
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

  async deleteExercise(id: number): Promise<void> {
    try {
      await apiClient.delete(`/exercises/${id}/`);
    } catch (err) {
      throw parseApiError(err);
    }
  }

  async getLanguages(): Promise<Array<{ id: number; name: string; code: string }>> {
    try {
      const { data } = await apiClient.get<PaginatedResult<{ id: number; name: string; code: string }>>('/languages/');
      return data.results ?? (data as any);
    } catch (err) {
      throw parseApiError(err);
    }
  }
}
