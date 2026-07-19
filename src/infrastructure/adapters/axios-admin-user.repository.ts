import { apiClient } from '../http/axios-client';
import type { AdminUserRepository } from '@/domain/ports/admin-user.repository';
import type { AdminUser, AdminUserCreatePayload, AdminUserUpdatePayload, Role } from '@/domain/entities/admin-user.entity';
import type { PaginatedResult } from '@/domain/entities/paginated-result.entity';

/**
 * Helper que ejecuta dos peticiones en paralelo y devuelve la primera que
 * responda con éxito. Si ambas fallan, lanza el error de la primera.
 * 
 * Usa .catch() para silenciar errores de axios en consola.
 */
async function firstSuccessful<T>(
  endpoints: (() => Promise<{ data: T }>)[],
): Promise<T> {
  const promises = endpoints.map(fn => fn().catch(() => Promise.reject(null)));
  const results = await Promise.allSettled(promises);
  
  for (const result of results) {
    if (result.status === 'fulfilled') {
      return result.value.data;
    }
  }
  
  throw new Error('No se pudo completar la operación en ningún endpoint');
}

export class AxiosAdminUserRepository implements AdminUserRepository {
  async getAll(params?: Record<string, any>): Promise<PaginatedResult<AdminUser>> {
    // Hacemos ambas peticiones en paralelo sin mostrar errores en consola
    const [staffRes, studentsRes] = await Promise.allSettled([
      apiClient.get<PaginatedResult<AdminUser>>('/users/', { params }).catch(() => Promise.reject('staff')),
      apiClient.get<PaginatedResult<AdminUser>>('/admin-students/', { params }).catch(() => Promise.reject('student')),
    ]);

    const staff: AdminUser[] = staffRes.status === 'fulfilled' ? staffRes.value.data.results || [] : [];
    const students: AdminUser[] = studentsRes.status === 'fulfilled' ? studentsRes.value.data.results || [] : [];

    return {
      count: staff.length + students.length,
      next: null,
      previous: null,
      results: [...staff, ...students],
    } as PaginatedResult<AdminUser>;
  }

  async getById(id: number): Promise<AdminUser> {
    return firstSuccessful([
      () => apiClient.get<AdminUser>(`/users/${id}/`),
      () => apiClient.get<AdminUser>(`/admin-students/${id}/`),
    ]);
  }

  async create(payload: AdminUserCreatePayload): Promise<AdminUser> {
    const { data } = await apiClient.post<AdminUser>('/users/', payload);
    return data;
  }

  async update(id: number, payload: AdminUserUpdatePayload): Promise<AdminUser> {
    return firstSuccessful([
      () => apiClient.patch<AdminUser>(`/users/${id}/`, payload),
      () => apiClient.patch<AdminUser>(`/admin-students/${id}/`, payload),
    ]);
  }

  async delete(id: number): Promise<void> {
    await firstSuccessful([
      () => apiClient.delete(`/users/${id}/`),
      () => apiClient.delete(`/admin-students/${id}/`),
    ]);
  }

  async getRoles(): Promise<Role[]> {
    const rolesMap = new Map<number, string>();
    
    try {
      const { data } = await apiClient.get<PaginatedResult<AdminUser>>('/users/', { params: { page_size: 50 } });
      if (data.results) {
        for (const user of data.results) {
          if (user.role?.id && user.role?.name) {
            rolesMap.set(user.role.id, user.role.name);
          }
        }
      }
    } catch {
      // ignore
    }
    
    try {
      const { data } = await apiClient.get<PaginatedResult<AdminUser>>('/admin-students/', { params: { page_size: 50 } });
      if (data.results) {
        for (const user of data.results) {
          if (user.role?.id && user.role?.name) {
            rolesMap.set(user.role.id, user.role.name);
          }
        }
      }
    } catch {
      // ignore
    }
    
    if (rolesMap.size > 0) {
      return Array.from(rolesMap.entries()).map(([id, name]) => ({ id, name }));
    }
    
    return [
      { id: 1, name: 'student' },
      { id: 2, name: 'teacher' },
      { id: 3, name: 'admin' },
    ];
  }

  async getStudents(params?: Record<string, any>): Promise<PaginatedResult<AdminUser>> {
    const { data } = await apiClient.get<PaginatedResult<AdminUser>>('/admin-students/', { params });
    return data;
  }
}