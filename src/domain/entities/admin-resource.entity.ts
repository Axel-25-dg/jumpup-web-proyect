export interface AdminResource {
  id: number
  teacher: number
  teacher_email: string
  course: number | null
  course_title: string | null
  lesson: number | null
  lesson_title: string | null
  title: string
  description: string
  resource_type: 'pdf' | 'audio' | 'video' | 'word' | 'image' | 'link' | 'other'
  resource_type_display: string
  content_type: 'file' | 'url' | 'video'
  file: string | null
  image: string | null
  file_url: string | null
  external_url: string | null
  is_public: boolean
  created_at: string
  updated_at: string
}
