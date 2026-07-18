const baseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api'
const defaultWsUrl = baseUrl
  .replace(/^http:/, 'ws:')
  .replace(/^https:/, 'wss:')
  .replace(/\/api\/?$/, '/ws')

export const API_CONFIG = {
  BASE_URL: baseUrl,
  // Puede sobrescribirse con VITE_WS_URL si API y Channels usan dominios distintos.
  WS_URL: import.meta.env.VITE_WS_URL ?? defaultWsUrl,
  TIMEOUT: 10_000,
} as const
