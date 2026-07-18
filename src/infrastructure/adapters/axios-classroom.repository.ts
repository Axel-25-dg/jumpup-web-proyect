import { apiClient } from '../http/axios-client';
import type { ClassroomRepository } from '@/domain/ports/classroom.repository';
import type { Classroom, ClassroomStudent } from '@/domain/entities/classroom.entity';
import type { PaginatedResult } from '@/domain/entities/paginated-result.entity';
import { parseApiError } from '../http/parse-api-error';

export class AxiosClassroomRepository implements ClassroomRepository {
  async getAllByTeacher(teacherId: number, params?: Record<string, any>): Promise<PaginatedResult<Classroom>> {
    try {
      const { data } = await apiClient.get<PaginatedResult<Classroom>>('/classrooms/', { 
        params: { ...params, teacher_id: teacherId } 
      });
      return data;
    } catch (err) {
      throw parseApiError(err);
    }
  }

  async getStudentsByClassroom(classroomId: number, params?: Record<string, any>): Promise<PaginatedResult<ClassroomStudent>> {
    try {
      const { data } = await apiClient.get<PaginatedResult<ClassroomStudent>>(`/classrooms/${classroomId}/students/`, { params });
      return data;
    } catch (err) {
      throw parseApiError(err);
    }
  }

  async create(payload: Partial<Classroom>): Promise<Classroom> {
    try {
      const { data } = await apiClient.post<Classroom>('/classrooms/', payload);
      return data;
    } catch (err) {
      throw parseApiError(err);
    }
  }
}
