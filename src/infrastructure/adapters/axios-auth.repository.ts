import { apiClient } from '@/infrastructure/http/axios-client'
import { parseApiError } from '@/infrastructure/http/parse-api-error'
import { localTokenStorage } from '@/infrastructure/storage/local-token-storage'
import type { AuthRepository, AuthSession } from '@/domain/ports/auth.repository'
import type { LoggedUser } from '@/domain/entities/logged-user.entity'
import type { AuthTokens } from '@/domain/entities/auth-tokens.entity'

interface RawAuthResponse extends Omit<LoggedUser, 'role'> {
  role?: LoggedUser['role'] | { name?: string } | null
  role_name?: string
  access: string
  refresh: string
}

function safeExtractRole(rawUser: any): string {
  let r = rawUser.role || rawUser.role_name;
  if (r) {
    if (typeof r === 'string') return r.toLowerCase();
    if (Array.isArray(r) && r.length > 0) r = r[0];
    if (typeof r === 'object') {
      if (r.name) return String(r.name).toLowerCase();
      if (r.role) return String(r.role).toLowerCase();
    }
    return String(r).toLowerCase();
  }
  if (rawUser.is_superuser) return 'admin';
  if (rawUser.is_staff) return 'teacher';
  return 'student';
}

function normalizeUser(raw: any): LoggedUser {
  // Si el backend envía los datos dentro de { user: { ... } }, extraemos eso.
  const userData = (raw.user && typeof raw.user === 'object') ? raw.user : raw;
  
  if (userData.id && !userData.user_id) {
    userData.user_id = userData.id;
  }
  
  return {
    ...userData,
    firstName: userData.firstName || userData.first_name,
    lastName: userData.lastName || userData.last_name,
    role: safeExtractRole(userData)
  } as LoggedUser;
}

function toAuthSession(raw: RawAuthResponse): AuthSession {
  const { access, refresh, ...rest } = raw;
  return { user: normalizeUser(rest), tokens: { access, refresh } }
}

export class AxiosAuthRepository implements AuthRepository {
  async login(username: string, password: string): Promise<AuthSession> {
    try {
      // El backend espera 'email' en lugar de 'username'
      const { data } = await apiClient.post<RawAuthResponse>('/auth/login/', {
        email: username,
        password,
      })
      const session = toAuthSession(data)
      localTokenStorage.setTokens(session.tokens.access, session.tokens.refresh)
      return session
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async register(username: string, email: string, password: string): Promise<AuthSession> {
    try {
      const { data } = await apiClient.post<RawAuthResponse>('/auth/register/', {
        username,
        email,
        password,
      })
      const session = toAuthSession(data)
      localTokenStorage.setTokens(session.tokens.access, session.tokens.refresh)
      return session
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async logout(): Promise<void> {
    const refresh = localTokenStorage.getRefreshToken()
    if (refresh) {
      try {
        await apiClient.post('/auth/logout/', { refresh })
      } catch {
        // ignore
      }
    }
    localTokenStorage.clearTokens()
  }

  async getCurrentUser(): Promise<LoggedUser> {
    try {
      const { data } = await apiClient.get<any>('/auth/me/')
      return normalizeUser(data)
    } catch (err) {
      throw parseApiError(err)
    }
  }

  getStoredTokens(): AuthTokens | null {
    return localTokenStorage.getTokens()
  }

  clearLocalSession(): void {
    localTokenStorage.clearTokens()
  }
}
