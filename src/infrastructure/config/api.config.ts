export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api',
  // El WebSocket es opcional. No intentar conectar a una URL inventada evita
  // reconexiones continuas cuando el backend no publica Channels.
  WS_URL: import.meta.env.VITE_WS_URL as string | undefined,
  TIMEOUT: 10_000,
} as const
