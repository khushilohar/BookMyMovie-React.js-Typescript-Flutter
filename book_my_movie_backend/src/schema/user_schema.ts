export interface User {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  is_verified: boolean;
  is_active: boolean;
  reset_password_token?: string | null;
  reset_password_expires?: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface UserResponse {
  id: number;
  name: string;
  email: string;
}