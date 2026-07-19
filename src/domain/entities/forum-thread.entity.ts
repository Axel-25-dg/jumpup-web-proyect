export interface ForumThread {
  id: number;
  category: number;
  category_name: string;
  author: number;
  author_email: string;
  author_username: string;
  title: string;
  body: string;
  is_pinned: boolean;
  is_closed: boolean;
  views: number;
  post_count: number;
  created_at: string;
  updated_at: string;
}