export interface Resource {
  id: number;
  title: string;
  file_type: 'pdf' | 'video' | 'audio' | 'image' | 'document';
  file_size?: number;
  file_url?: string;
  file?: string;
  teacher_id: number;
  created_at: string;
}
