export interface CreateAdminResourceDto {
  title: string
  description?: string
  resource_type: 'pdf' | 'audio' | 'video' | 'word' | 'image' | 'link' | 'other'
  content_type: 'file' | 'url' | 'video'
  course: number
  lesson?: number | null
  file_url?: string | null
  external_url?: string | null
  is_public?: boolean
}

export type UpdateAdminResourceDto = Partial<CreateAdminResourceDto>
