export interface Classroom {
  id: number;
  name: string;
  description?: string;
  teacher_id: number;
  course?: number;
  teacher?: number;
  access_code?: string;
  total_students?: number;
  created_at: string;
}

export interface ClassroomStudent {
  id: number;
  classroom_id: number;
  student_id: number;
  student_name?: string;
  student_email?: string;
  joined_at: string;
  status: 'active' | 'pending' | 'removed';
  progress?: number;
}
