export interface Contact {
  id: number;
  name: string;
  role: string;
  unread_count: number;
  is_online: boolean;
  last_activity: string;
}

export interface Message {
  id: number;
  sender_id: number;
  receiver_id: number;
  content: string;
  sent_at: string;
  read_at?: string;
}
