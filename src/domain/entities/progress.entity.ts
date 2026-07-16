export interface UserProgress {
  id: number;
  lesson: number;
  lesson_title: string;
  is_completed: boolean;
  score: number;
  completed_at: string | null;
}

export interface ProgressSummary {
  total_lessons: number;
  completed_lessons: number;
  percentage_complete: number;
  current_streak: number;
  total_xp: number;
}
