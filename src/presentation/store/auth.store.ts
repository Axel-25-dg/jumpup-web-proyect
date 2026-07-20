import { create } from 'zustand'
import { authUseCase } from '@/infrastructure/factories/auth.factory'
import { AUTH_EXPIRED_EVENT } from '@/infrastructure/http/axios-client'
import type { LoggedUser } from '@/domain/entities/logged-user.entity'
import type { AuthTokens } from '@/domain/entities/auth-tokens.entity'

interface AuthState {
  user: LoggedUser | null
  tokens: AuthTokens | null
  isLoading: boolean
  isInitialized: boolean // Nuevo estado para saber si ya intentamos cargar la sesión
  error: string | null
}

interface AuthActions {
  login(username: string, password: string): Promise<void>
  register(username: string, email: string, password: string, password2: string): Promise<void>
  logout(): Promise<void>
  loadSession(): Promise<void>
  clearError(): void
  _clearSession(): void
}

export const useAuthStore = create<AuthState & AuthActions>((set, get) => {
  if (typeof window !== 'undefined') {
    window.addEventListener(AUTH_EXPIRED_EVENT, () => {
      get()._clearSession()
    })
  }

  return {
    user: null,
    tokens: null,
    isLoading: false,
    isInitialized: false,
    error: null,

    async login(username, password) {
      set({ isLoading: true, error: null })
      try {
        const { user, tokens } = await authUseCase.login({ username, password })
        set({ user, tokens, isLoading: false, isInitialized: true })
      } catch (err: unknown) {
        const apiErr = err as { detail?: string; message?: string }
        set({
          isLoading: false,
          error: apiErr.detail ?? apiErr.message ?? 'Error al iniciar sesión',
        })
        throw err
      }
    },

    async register(username, email, password, password2) {
      set({ isLoading: true, error: null })
      try {
        const { user, tokens } = await authUseCase.register({ username, email, password, password2 })
        set({ user, tokens, isLoading: false, isInitialized: true })
      } catch (err: unknown) {
        const apiErr = err as { detail?: string; message?: string }
        set({
          isLoading: false,
          error: apiErr.detail ?? apiErr.message ?? 'Error al registrarse',
        })
        throw err
      }
    },

    async logout() {
      set({ isLoading: true })
      await authUseCase.logout()
      set({ user: null, tokens: null, isLoading: false, isInitialized: true, error: null })
    },

    async loadSession() {
      // Si ya está inicializado, no re-intentar para evitar bucles
      if (get().isInitialized) return;

      set({ isLoading: true })
      try {
        const session = await authUseCase.restoreSession()
        if (session) {
          set({ user: session.user, tokens: session.tokens, isLoading: false, isInitialized: true })
        } else {
          set({ user: null, tokens: null, isLoading: false, isInitialized: true })
        }
      } catch {
        set({ user: null, tokens: null, isLoading: false, isInitialized: true })
      }
    },

    clearError() {
      set({ error: null })
    },

    _clearSession() {
      authUseCase.clearLocalSession()
      set({ user: null, tokens: null, isLoading: false, error: null })
    },
  }
})

export const selectIsAuthenticated = (state: AuthState) => state.user !== null
export const selectIsStaff = (state: AuthState) => state.user?.is_staff === true
