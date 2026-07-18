import { apiClient } from '../http/axios-client';
import type { CertificateRepository } from '@/domain/ports/certificate.repository';
import type { Certificate, CertificateCreatePayload, CertificateIssuePayload } from '@/domain/entities/certificate.entity';
import type { PaginatedResult } from '@/domain/entities/paginated-result.entity';
import { parseApiError } from '../http/parse-api-error';

export class AxiosCertificateRepository implements CertificateRepository {
  async getAll(params?: Record<string, any>): Promise<PaginatedResult<Certificate>> {
    try {
      const { data } = await apiClient.get<PaginatedResult<Certificate>>('/certificates/', { params });
      return data;
    } catch (err) {
      throw parseApiError(err);
    }
  }

  async getById(id: number): Promise<Certificate> {
    try {
      const { data } = await apiClient.get<Certificate>(`/certificates/${id}/`);
      return data;
    } catch (err) {
      throw parseApiError(err);
    }
  }

  async create(payload: CertificateCreatePayload): Promise<Certificate> {
    try {
      const { data } = await apiClient.post<Certificate>('/certificates/', payload);
      return data;
    } catch (err) {
      throw parseApiError(err);
    }
  }

  async issue(id: number, payload?: CertificateIssuePayload): Promise<Certificate> {
    try {
      const { data } = await apiClient.patch<Certificate>(`/certificates/${id}/issue/`, payload || {});
      return data;
    } catch (err) {
      throw parseApiError(err);
    }
  }

  async revoke(id: number): Promise<void> {
    try {
      await apiClient.post(`/certificates/${id}/revoke/`);
    } catch (err) {
      throw parseApiError(err);
    }
  }

  async validate(code: string): Promise<Certificate> {
    try {
      const { data } = await apiClient.get<Certificate>(`/certificates/verify/${code}/`);
      return data;
    } catch (err) {
      throw parseApiError(err);
    }
  }
}