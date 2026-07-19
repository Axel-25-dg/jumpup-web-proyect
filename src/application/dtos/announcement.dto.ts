export interface CreateAnnouncementDto {
  title: string
  content: string
  start_date: string
  end_date: string
  is_active?: boolean
}

export type UpdateAnnouncementDto = Partial<CreateAnnouncementDto>