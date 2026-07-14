/**
 * Formatea un número como precio en dólares.
 */
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('es-EC', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Formatea una fecha ISO a formato legible.
 */
export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('es-EC', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(iso))
}
