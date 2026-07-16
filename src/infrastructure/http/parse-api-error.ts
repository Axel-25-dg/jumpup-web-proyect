export function parseApiError(error: unknown): Error {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const response = error as { response?: { data?: any } }
    const data = response.response?.data

    if (data) {
      // Caso 1: detail o message directo
      if (typeof data.detail === 'string') return new Error(data.detail)
      if (typeof data.message === 'string') return new Error(data.message)
      if (typeof data.error === 'string') {
        // Manejar errores de Django que vienen como string de diccionario
        if (data.error.includes('Este campo es requerido')) {
           if (data.error.includes('email')) return new Error('El correo electrónico es requerido')
           if (data.error.includes('password')) return new Error('La contraseña es requerida')
        }
        return new Error(data.error)
      }

      // Caso 2: Errores de validación (objetos)
      if (typeof data === 'object') {
        const firstKey = Object.keys(data)[0]
        const firstError = data[firstKey]
        if (Array.isArray(firstError) && typeof firstError[0] === 'string') {
          return new Error(`${firstKey}: ${firstError[0]}`)
        }
        if (typeof firstError === 'string') {
          return new Error(firstError)
        }
      }
    }
  }

  if (error instanceof Error) {
    return error
  }

  return new Error('Error de conexión con el servidor')
}
