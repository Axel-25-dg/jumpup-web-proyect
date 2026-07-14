export function parseApiError(error: unknown): Error {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const response = error as { response?: { data?: { detail?: string; message?: string } } }
    const detail = response.response?.data?.detail ?? response.response?.data?.message
    if (detail) {
      return new Error(detail)
    }
  }

  if (error instanceof Error) {
    return error
  }

  return new Error('Error inesperado')
}
