import type { PaginatedResult } from '../entities/paginated-result.entity';
import type { AdminUser, AdminUserCreatePayload, AdminUserUpdatePayload, Role } from '../entities/admin-user.entity';

export interface AdminUserRepository {
  getAll(params?: Record<string, any>): Promise<PaginatedResult<AdminUser>>;
  getById(id: number): Promise<AdminUser>;
  create(data: AdminUserCreatePayload): Promise<AdminUser>;
  update(id: number, data: AdminUserUpdatePayload): Promise<AdminUser>;
  delete(id: number): Promise<void>;
  getRoles(): Promise<Role[]>;
}