export interface LiveSession {
  id: number;
  title: string;
  scheduled_date: string; // ISO String
  duration_minutes: number;
  teacher_id: number;
  classroom_id?: number;
  status: 'upcoming' | 'live' | 'past' | 'cancelled';
  join_url?: string;
  enrolled_count?: number;
}
