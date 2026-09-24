import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserMenuPermissions, MenuItemOption } from '@quality-services/types';
import { apiClient } from '../lib/apiClient';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'specialist' | 'team_lead' | 'admin' | string;
  assignedBrands?: string[];
  avatar?: string;
}

export const TEST_USERS: UserProfile[] = [
  {
    id: 'aaaaaaaa-1111-0000-0000-000000000001',
    name: 'Juan',
    email: 'juan@qualityservice.com',
    role: 'specialist',
    assignedBrands: ['IBM', 'NVIDIA'],
  },
  {
    id: 'aaaaaaaa-2222-0000-0000-000000000002',
    name: 'Carla',
    email: 'carla@qualityservice.com',
    role: 'specialist',
    assignedBrands: ['NVIDIA', 'APPLE'],
  },
  {
    id: 'aaaaaaaa-3333-0000-0000-000000000003',
    name: 'Miguel',
    email: 'miguel@qualityservice.com',
    role: 'team_lead',
    assignedBrands: ['IBM', 'APPLE'],
  },
  {
    id: 'aaaaaaaa-4444-0000-0000-000000000004',
    name: 'Lorena',
    email: 'lorena@qualityservice.com',
    role: 'team_lead',
    assignedBrands: ['NVIDIA'],
  },
  {
    id: 'a7772aec-98a9-49e4-bd3b-7ccaf0eb5d89',
    name: 'Admin User',
    email: 'admin@qualityservice.com',
    role: 'admin',
    assignedBrands: ['IBM', 'NVIDIA', 'APPLE'],
  },
];

export const getFallbackPermissions = (role: string): UserMenuPermissions => {
  const normalized = (role || '').toLowerCase().trim();
  if (normalized === 'specialist') {
    return {
      role: 'specialist',
      allowedMenus: ['Dashboard', 'Replies'],
      items: [
        { id: 'dashboard', label: 'Dashboard', path: '/dashboard', icon: 'LayoutDashboard' },
        { id: 'replies', label: 'Replies', path: '/replies', icon: 'MessageSquareReply' },
      ],
    };
  }
  if (normalized === 'team_lead') {
    return {
      role: 'team_lead',
      allowedMenus: ['Dashboard', 'Evaluations'],
      items: [
        { id: 'dashboard', label: 'Dashboard', path: '/dashboard', icon: 'LayoutDashboard' },
        { id: 'evaluations', label: 'Evaluations', path: '/evaluations', icon: 'ClipboardCheck' },
      ],
    };
  }
  return {
    role: normalized || 'admin',
    allowedMenus: ['Dashboard', 'Admin', 'Users', 'Brands', 'Replies', 'Evaluations'],
    items: [
      { id: 'dashboard', label: 'Dashboard', path: '/dashboard', icon: 'LayoutDashboard' },
      {
        id: 'admin',
        label: 'Admin',
        path: '/admin',
        icon: 'ShieldCheck',
        children: [
          { id: 'users', label: 'Users', path: '/users', icon: 'Users' },
          { id: 'brands', label: 'Brands', path: '/brands', icon: 'Building2' },
        ],
      },
      { id: 'replies', label: 'Replies', path: '/replies', icon: 'MessageSquareReply' },
      { id: 'evaluations', label: 'Evaluations', path: '/evaluations', icon: 'ClipboardCheck' },
    ],
  };
};

interface AuthContextType {
  isAuthenticated: boolean;
  user: UserProfile | null;
  allowedMenus: string[];
  menuItems: MenuItemOption[];
  isLoadingMenu: boolean;
  login: (email: string, password?: string) => Promise<boolean>;
  logout: () => void;
  switchUser: (email: string) => Promise<void>;
  testUsers: UserProfile[];
  fetchMenuPermissions: (role: string, userId?: string) => Promise<UserMenuPermissions>;
  isMenuAllowed: (menuName: string) => boolean;
}

const AUTH_STORAGE_KEY = 'qs_auth_state';
const USER_STORAGE_KEY = 'qs_auth_active_user';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return localStorage.getItem(AUTH_STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const [user, setUser] = useState<UserProfile | null>(() => {
    if (!isAuthenticated) return null;
    try {
      const savedEmail = localStorage.getItem(USER_STORAGE_KEY);
      const found = TEST_USERS.find((u) => u.email === savedEmail);
      return found ?? TEST_USERS[0] ?? null;
    } catch {
      return TEST_USERS[0] ?? null;
    }
  });

  const [menuPermissions, setMenuPermissions] = useState<UserMenuPermissions>(() => {
    const role = user?.role || 'specialist';
    return getFallbackPermissions(role);
  });
  const [isLoadingMenu, setIsLoadingMenu] = useState<boolean>(false);

  const fetchMenuPermissions = useCallback(async (role: string, userId?: string): Promise<UserMenuPermissions> => {
    setIsLoadingMenu(true);
    try {
      const res = await apiClient.get<UserMenuPermissions>('/users/menu-options', {
        params: { role },
        userId,
      });
      if (res.data && Array.isArray(res.data.allowedMenus)) {
        setMenuPermissions(res.data);
        setIsLoadingMenu(false);
        return res.data;
      }
    } catch (err) {
      console.warn('Unable to reach /users/menu-options API, falling back to local role matrix:', err);
    }
    const fallback = getFallbackPermissions(role);
    setMenuPermissions(fallback);
    setIsLoadingMenu(false);
    return fallback;
  }, []);

  useEffect(() => {
    try {
      if (isAuthenticated) {
        localStorage.setItem(AUTH_STORAGE_KEY, 'true');
        if (user) {
          localStorage.setItem(USER_STORAGE_KEY, user.email);
        }
      } else {
        localStorage.removeItem(AUTH_STORAGE_KEY);
        localStorage.removeItem(USER_STORAGE_KEY);
        setUser(null);
      }
    } catch {
      // Ignore localStorage errors
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchMenuPermissions(user.role, user.id);
    }
  }, [isAuthenticated, user?.id, user?.role, fetchMenuPermissions]);

  const login = async (email: string, _password?: string): Promise<boolean> => {
    const selectedUser = TEST_USERS.find((u) => u.email === email.trim()) ?? TEST_USERS[0];
    if (selectedUser) {
      setUser(selectedUser);
      setIsAuthenticated(true);
      try {
        localStorage.setItem(AUTH_STORAGE_KEY, 'true');
        localStorage.setItem(USER_STORAGE_KEY, selectedUser.email);
      } catch {
        // Ignore
      }
      // Load granted menu options immediately during login
      await fetchMenuPermissions(selectedUser.role, selectedUser.id);
      return true;
    }
    return false;
  };

  const switchUser = async (email: string) => {
    const selectedUser = TEST_USERS.find((u) => u.email === email.trim()) ?? TEST_USERS[0];
    if (selectedUser) {
      setUser(selectedUser);
      try {
        localStorage.setItem(USER_STORAGE_KEY, selectedUser.email);
      } catch {
        // Ignore
      }
      await fetchMenuPermissions(selectedUser.role, selectedUser.id);
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setMenuPermissions(getFallbackPermissions('specialist'));
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      localStorage.removeItem(USER_STORAGE_KEY);
    } catch {
      // Ignore
    }
  };

  const isMenuAllowed = useCallback(
    (menuName: string): boolean => {
      const normalized = (menuName || '').toLowerCase().trim();
      return (menuPermissions?.allowedMenus || []).some(
        (m) => m.toLowerCase().trim() === normalized,
      );
    },
    [menuPermissions],
  );

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        allowedMenus: menuPermissions?.allowedMenus || [],
        menuItems: menuPermissions?.items || [],
        isLoadingMenu,
        login,
        logout,
        switchUser,
        testUsers: TEST_USERS,
        fetchMenuPermissions,
        isMenuAllowed,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
