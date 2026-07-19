import type { AdminUserRepository } from '@/domain/ports/admin-user.repository';
import type { AdminUser, AdminUserCreatePayload, AdminUserUpdatePayload, Role } from '@/domain/entities/admin-user.entity';
import type { PaginatedResult } from '@/domain/entities/paginated-result.entity';

export class GetAdminUsersUseCase {
  private readonly repository: AdminUserRepository;
  constructor(repository: AdminUserRepository) { this.repository = repository; }
  async execute(params?: Record<string, any>): Promise<PaginatedResult<AdminUser>> {
    return this.repository.getAll(params);
  }
}

export class GetAdminUserByIdUseCase {
  private readonly repository: AdminUserRepository;
  constructor(repository: AdminUserRepository) { this.repository = repository; }
  async execute(id: number): Promise<AdminUser> {
    return this.repository.getById(id);
  }
}

export class CreateAdminUserUseCase {
  private readonly repository: AdminUserRepository;
  constructor(repository: AdminUserRepository) { this.repository = repository; }
  async execute(data: AdminUserCreatePayload): Promise<AdminUser> {
    return this.repository.create(data);
  }
}

export class UpdateAdminUserUseCase {
  private readonly repository: AdminUserRepository;
  constructor(repository: AdminUserRepository) { this.repository = repository; }
  async execute(id: number, data: AdminUserUpdatePayload): Promise<AdminUser> {
    return this.repository.update(id, data);
  }
}

export class DeleteAdminUserUseCase {
  private readonly repository: AdminUserRepository;
  constructor(repository: AdminUserRepository) { this.repository = repository; }
  async execute(id: number): Promise<void> {
    return this.repository.delete(id);
  }
}

export class GetRolesUseCase {
  private readonly repository: AdminUserRepository;
  constructor(repository: AdminUserRepository) { this.repository = repository; }
  async execute(): Promise<Role[]> {
    return this.repository.getRoles();
  }
}

export class ToggleUserActiveUseCase {
  private readonly repository: AdminUserRepository;
  constructor(repository: AdminUserRepository) { this.repository = repository; }
  async execute(id: number, isActive: boolean): Promise<AdminUser> {
    return this.repository.update(id, { is_active: isActive });
  }
}