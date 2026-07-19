export interface AdminUser {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: { id: number; name: string } | null;
  role_id?: number;
  is_staff: boolean;
  is_superuser: boolean;
  is_active: boolean;
  created_at?: string;
}

export interface AdminUserCreatePayload {
  username: string;
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
  role_id: number;
  is_active?: boolean;
}

export interface AdminUserUpdatePayload {
  username?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  role_id?: number;
  is_active?: boolean;
  password?: string;
}

export interface Role {
  id: number;
  name: string;
}