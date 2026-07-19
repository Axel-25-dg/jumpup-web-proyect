export interface CreateAdminLiveSessionDto {
  title: string
  description?: string
  course?: number | null
  scheduled_at: string
  duration_min: number
  meeting_url?: string
  max_students?: number
  status?: 'scheduled' | 'live' | 'ended' | 'cancelled'
}

export type UpdateAdminLiveSessionDto = Partial<CreateAdminLiveSessionDto>