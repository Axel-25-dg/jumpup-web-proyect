import { apiClient } from '../http/axios-client';
import type { CourseRepository } from '@/domain/ports/course.repository';
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
      // Según los endpoints proporcionados, /api/modules/ tiene filtro por curso usualmente
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
}
