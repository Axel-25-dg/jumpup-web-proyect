import axios, { AxiosError } from 'axios'
import type { InternalAxiosRequestConfig } from 'axios'
import { API_CONFIG } from '../config/api.config'
import { localTokenStorage } from '../storage/local-token-storage'

export const AUTH_EXPIRED_EVENT = 'auth:expired'

export const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
})

apiClient.interceptors.request.use((config) => {
  const accessToken = localTokenStorage.getAccessToken()
  if (accessToken && config.headers) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  return config
})

let isRefreshing = false
let failedQueue: any[] = []

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`
            }
            return apiClient(originalRequest)
          })
          .catch((err) => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      const refreshToken = localTokenStorage.getRefreshToken()
      if (!refreshToken) {
        isRefreshing = false
        localTokenStorage.clearTokens()
        window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT))
        return Promise.reject(error)
      }

      try {
        const { data } = await axios.post(`${API_CONFIG.BASE_URL}/auth/token/refresh/`, {
          refresh: refreshToken,
        })

        const { access } = data
        localTokenStorage.setTokens(access, refreshToken)

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${access}`
        }

        processQueue(null, access)
        return apiClient(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        localTokenStorage.clearTokens()
        window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT))
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  },
)
