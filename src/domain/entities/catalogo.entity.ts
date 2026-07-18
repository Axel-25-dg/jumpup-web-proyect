export interface Catalogo {
  id: number
  titulo: string
  tipo: 'curso' | 'libro'
  precio: string
  contenido_url: string | null
  curso: number | null
  curso_info: {
    id: number
    title: string
    language_name: string
    difficulty_level: string
  } | null
  creado_at: string
}