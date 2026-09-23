export type UserRole = 'admin' | 'auditor' | 'manager' | 'customer';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthSession {
  user: UserProfile;
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
}
