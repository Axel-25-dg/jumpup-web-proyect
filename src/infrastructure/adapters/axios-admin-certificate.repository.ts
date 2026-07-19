import { apiClient } from '../http/axios-client';
import type { Certificate, CertificateCreatePayload, CertificateIssuePayload } from '@/domain/entities/certificate.entity';
import type { VerifyResult } from '@/domain/entities/verify-result.entity';
import type { PaginatedResult } from '@/domain/entities/paginated-result.entity';
import { parseApiError } from '../http/parse-api-error';

export class AxiosAdminCertificateRepository {
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

  async update(id: number, payload: Partial<CertificateCreatePayload>): Promise<Certificate> {
    try {
      const { data } = await apiClient.patch<Certificate>(`/certificates/${id}/`, payload);
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
      await apiClient.patch(`/certificates/${id}/revoke/`);
    } catch (err) {
      throw parseApiError(err);
    }
  }

  async validate(code: string): Promise<VerifyResult> {
    try {
      const { data } = await apiClient.get<VerifyResult>(`/certificates/verify/${code}/`);
      return data;
    } catch (err) {
      throw parseApiError(err);
    }
  }
}