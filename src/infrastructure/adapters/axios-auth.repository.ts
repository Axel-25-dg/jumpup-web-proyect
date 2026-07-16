import { apiClient } from '@/infrastructure/http/axios-client'
import { parseApiError } from '@/infrastructure/http/parse-api-error'
import { localTokenStorage } from '@/infrastructure/storage/local-token-storage'
import type { AuthRepository, AuthSession } from '@/domain/ports/auth.repository'
import type { LoggedUser } from '@/domain/entities/logged-user.entity'
import type { AuthTokens } from '@/domain/entities/auth-tokens.entity'

interface RawAuthResponse extends LoggedUser {
  access: string
  refresh: string
}

function toAuthSession(raw: RawAuthResponse): AuthSession {
  const { access, refresh, ...user } = raw
  return { user, tokens: { access, refresh } }
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
      const { data } = await apiClient.get<LoggedUser>('/auth/me/')
      return data
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
