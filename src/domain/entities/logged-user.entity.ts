export type UserRole = 'admin' | 'teacher' | 'student';

export interface LoggedUser {
  user_id: number;
  username: string;
  email: string;
  is_staff: boolean;
  role: UserRole;
}
