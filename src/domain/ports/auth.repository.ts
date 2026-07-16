import type { LoggedUser } from '../entities/logged-user.entity'
import type { AuthTokens } from '../entities/auth-tokens.entity'

export interface AuthSession {
  user: LoggedUser
  tokens: AuthTokens
}

export interface AuthRepository {
  login(email: string, password: string): Promise<AuthSession>
  register(username: string, email: string, password: string): Promise<AuthSession>
  logout(): Promise<void>
  getCurrentUser(): Promise<LoggedUser>
  getStoredTokens(): AuthTokens | null
  clearLocalSession(): void
}
