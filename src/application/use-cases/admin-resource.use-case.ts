import type { AdminResourceRepository } from '@/domain/ports/admin-resource.repository'
import type { AdminResource } from '@/domain/entities/admin-resource.entity'
import type { CreateAdminResourceDto, UpdateAdminResourceDto } from '@/application/dtos/admin-resource.dto'
import type { PaginatedResult } from '@/domain/entities/paginated-result.entity'

export class AdminResourceUseCase {
  private readonly repository: AdminResourceRepository

  constructor(repository: AdminResourceRepository) {
    this.repository = repository
  }

  getAll(params?: Record<string, any>): Promise<PaginatedResult<AdminResource>> {
    return this.repository.getAll(params)
  }

  getById(id: number): Promise<AdminResource> {
    return this.repository.getById(id)
  }

  create(data: CreateAdminResourceDto): Promise<AdminResource> {
    return this.repository.create(data)
  }

  createWithFormData(formData: FormData): Promise<AdminResource> {
    return this.repository.createWithFormData(formData)
  }

  update(id: number, data: UpdateAdminResourceDto): Promise<AdminResource> {
    return this.repository.update(id, data)
  }

  updateWithFormData(id: number, formData: FormData): Promise<AdminResource> {
    return this.repository.updateWithFormData(id, formData)
  }

  delete(id: number): Promise<void> {
    return this.repository.delete(id)
  }
}