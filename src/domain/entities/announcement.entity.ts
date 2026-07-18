export interface Announcement {
  id: number
  author: number
  author_username?: string
  title: string
  content: string
  start_date: string
  end_date: string
  is_active: boolean
  created_at: string
}