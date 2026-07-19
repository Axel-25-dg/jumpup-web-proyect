export interface CreateCatalogoDto {
  titulo: string
  tipo: 'curso' | 'libro'
  precio: number | string
  contenido_url?: string
  curso?: number | null
}

export type UpdateCatalogoDto = Partial<CreateCatalogoDto>