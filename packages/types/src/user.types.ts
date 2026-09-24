export type UserRole = 'admin' | 'auditor' | 'manager' | 'customer' | 'specialist' | 'team_lead';

export interface UserProfile {
  id: string;
  email: string;
  fullName?: string;
  name?: string;
  role: UserRole | string;
  avatarUrl?: string;
  assignedBrands?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthSession {
  user: UserProfile;
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
}

export interface MenuItemOption {
  id: string;
  label: string;
  path: string;
  icon: string;
  children?: MenuItemOption[];
}

export interface UserMenuPermissions {
  role: string;
  allowedMenus: string[];
  items: MenuItemOption[];
}
