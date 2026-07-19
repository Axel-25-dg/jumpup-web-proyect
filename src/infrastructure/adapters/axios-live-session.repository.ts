import { apiClient } from '../http/axios-client';
import type { LiveSessionRepository } from '@/domain/ports/live-session.repository';
import type { LiveSession } from '@/domain/entities/live-session.entity';
import type { PaginatedResult } from '@/domain/entities/paginated-result.entity';
import { parseApiError } from '../http/parse-api-error';

function toDomain(raw: any): LiveSession {
  return {
    id: raw.id,
    title: raw.title,
    scheduled_date: raw.scheduled_at,
    duration_minutes: raw.duration_min,
    teacher_id: raw.teacher,
    course_id: raw.course,
    status: raw.status === 'scheduled' ? 'upcoming' : raw.status,
    join_url: raw.meeting_url,
    enrolled_count: raw.participant_count
  } as LiveSession;
}

function toPayload(domain: Partial<LiveSession>): any {
  const payload: any = {};
  if (domain.title !== undefined) payload.title = domain.title;
  if (domain.scheduled_date !== undefined) payload.scheduled_at = domain.scheduled_date;
  if (domain.duration_minutes !== undefined) payload.duration_min = domain.duration_minutes;
  if (domain.course_id !== undefined) payload.course = domain.course_id;
  if (domain.join_url !== undefined) payload.meeting_url = domain.join_url;
  if (domain.teacher_id !== undefined) payload.teacher = domain.teacher_id;
  if (domain.classroom_id !== undefined) payload.classroom = domain.classroom_id;
  if (domain.status !== undefined) payload.status = domain.status === 'upcoming' ? 'scheduled' : domain.status;
  return payload;
}

export class AxiosLiveSessionRepository implements LiveSessionRepository {
  async getAllByTeacher(teacherId: number, params?: Record<string, any>): Promise<PaginatedResult<LiveSession>> {
    try {
      const { data } = await apiClient.get<any>('/live-sessions/', {
        params: { ...params, teacher_id: teacherId }
      });
      return {
        ...data,
        results: data.results.map(toDomain)
      };
    } catch (err) {
      throw parseApiError(err);
    }
  }

  async create(payload: Partial<LiveSession>): Promise<LiveSession> {
    try {
      const { data } = await apiClient.post<any>('/live-sessions/', toPayload(payload));
      return toDomain(data);
    } catch (err) {
      throw parseApiError(err);
    }
  }

  async update(id: number, payload: Partial<LiveSession>): Promise<LiveSession> {
    try {
      const { data } = await apiClient.patch<any>(`/live-sessions/${id}/`, toPayload(payload));
      return toDomain(data);
    } catch (err) {
      throw parseApiError(err);
    }
  }

  async cancel(id: number): Promise<void> {
    try {
      await apiClient.patch(`/live-sessions/${id}/`, { status: 'cancelled' });
    } catch (err) {
      throw parseApiError(err);
    }
  }

  async delete(id: number): Promise<void> {
    try {
      await apiClient.delete(`/live-sessions/${id}/`);
    } catch (err) {
      throw parseApiError(err);
    }
  }
}
