const ACCESS_TOKEN_KEY = 'jumpupacess'
const REFRESH_TOKEN_KEY = 'jumpuprefresh'

export const localTokenStorage = {
  setTokens(access: string, refresh: string) {
    localStorage.setItem(ACCESS_TOKEN_KEY, access)
    localStorage.setItem(REFRESH_TOKEN_KEY, refresh)
  },

  getAccessToken() {
    return localStorage.getItem(ACCESS_TOKEN_KEY)
  },

  getRefreshToken() {
    return localStorage.getItem(REFRESH_TOKEN_KEY)
  },

  getTokens() {
    const access = this.getAccessToken()
    const refresh = this.getRefreshToken()
    if (!access || !refresh) return null
    return { access, refresh }
  },

  clearTokens() {
    localStorage.removeItem(ACCESS_TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
  },
}
