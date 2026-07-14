import axios from 'axios'
import { API_CONFIG } from '../config/api.config'
import { localTokenStorage } from '../storage/local-token-storage'

export const AUTH_EXPIRED_EVENT = 'auth:expired'

export const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
})

apiClient.interceptors.request.use((config) => {
  const accessToken = localTokenStorage.getAccessToken()
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      localTokenStorage.clearTokens()
      window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT))
    }
    return Promise.reject(error)
  },
)
