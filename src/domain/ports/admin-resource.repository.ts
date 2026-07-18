import type { AdminResource } from '../entities/admin-resource.entity'
import type { CreateAdminResourceDto, UpdateAdminResourceDto } from '@/application/dtos/admin-resource.dto'
import type { PaginatedResult } from '../entities/paginated-result.entity'

export interface AdminResourceRepository {
  getAll(params?: Record<string, any>): Promise<PaginatedResult<AdminResource>>
  getById(id: number): Promise<AdminResource>
  create(data: CreateAdminResourceDto): Promise<AdminResource>
  createWithFormData(formData: FormData): Promise<AdminResource>
  update(id: number, data: UpdateAdminResourceDto): Promise<AdminResource>
  updateWithFormData(id: number, formData: FormData): Promise<AdminResource>
  delete(id: number): Promise<void>
}
