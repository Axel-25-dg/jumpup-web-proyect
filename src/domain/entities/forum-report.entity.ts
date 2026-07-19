export interface ForumReport {
  id: number;
  reporter: number;
  reporter_email: string;
  post: number;
  reason: string;
  status: 'pending' | 'reviewed' | 'resolved';
  created_at: string;
}