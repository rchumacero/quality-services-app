import React, { createContext, useContext, useState, useEffect } from 'react';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'specialist' | 'team_lead' | string;
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
];

interface AuthContextType {
  isAuthenticated: boolean;
  user: UserProfile | null;
  login: (email: string, password?: string) => Promise<boolean>;
  logout: () => void;
  switchUser: (email: string) => void;
  testUsers: UserProfile[];
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
      return true;
    }
    return false;
  };

  const switchUser = (email: string) => {
    const selectedUser = TEST_USERS.find((u) => u.email === email.trim()) ?? TEST_USERS[0];
    if (selectedUser) {
      setUser(selectedUser);
      try {
        localStorage.setItem(USER_STORAGE_KEY, selectedUser.email);
      } catch {
        // Ignore
      }
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      localStorage.removeItem(USER_STORAGE_KEY);
    } catch {
      // Ignore
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        login,
        logout,
        switchUser,
        testUsers: TEST_USERS,
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
