export interface ForumPost {
  id: number;
  thread: number;
  author: number;
  author_email: string;
  author_username: string;
  parent: number | null;
  body: string;
  is_deleted: boolean;
  reaction_count: number;
  created_at: string;
  updated_at: string;
}