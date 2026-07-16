export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api',
  WS_URL: import.meta.env.VITE_WS_URL ?? 'wss://guaman-idiomas-ute.online/ws',
  TIMEOUT: 10_000,
} as const
