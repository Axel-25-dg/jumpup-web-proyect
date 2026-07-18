import { apiClient } from '../http/axios-client';
import type { CourseRepository } from '@/domain/ports/course.repository';
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
