export interface ForumReaction {
  id: number;
  user: number;
  user_email: string;
  post: number;
  reaction: 'like' | 'love' | 'helpful' | 'confused';
  created_at: string;
}