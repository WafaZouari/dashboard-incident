export interface User {
  id: number;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  role: 'admin' | 'manager' | 'investigator' | 'viewer';
  department?: string | null;
  isActive?: boolean;
  createdAt?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}
