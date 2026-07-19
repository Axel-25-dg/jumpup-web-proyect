export interface OrdenDetalle {
  id: number
  producto: number
  producto_info: {
    id: number
    titulo: string
    tipo: 'curso' | 'libro'
    precio: string
    contenido_url: string | null
    curso: number | null
    creado_at: string
  }
  precio_unitario: string
}

export interface OrdenCompra {
  id: number
  estudiante_email: string
  total: string
  estado: 'pendiente' | 'pagada' | 'cancelada'
  detalles: OrdenDetalle[]
  fecha_creacion: string
}