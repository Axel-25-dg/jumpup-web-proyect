export interface AdminLiveSession {
  id: number
  teacher: number
  teacher_email: string
  course: number | null
  course_title: string | null
  title: string
  description: string
  scheduled_at: string
  duration_min: number
  meeting_url: string
  status: 'scheduled' | 'live' | 'ended' | 'cancelled'
  status_display: string
  max_students: number
  participant_count: number
  created_at: string
}