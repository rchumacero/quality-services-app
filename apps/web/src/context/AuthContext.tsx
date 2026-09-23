import React, { createContext, useContext, useState, useEffect } from 'react';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: UserProfile | null;
  login: (email: string, password?: string) => Promise<boolean>;
  logout: () => void;
}

const STORAGE_KEY = 'qs_auth_state';

const defaultUser: UserProfile = {
  id: '33333333-3333-3333-3333-333333333333',
  name: 'Elena R.',
  email: 'elena.r@qualityservice.com',
  role: 'QA Ops Lead',
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored === 'true';
    } catch {
      return false;
    }
  });

  const [user, setUser] = useState<UserProfile | null>(() => {
    return isAuthenticated ? defaultUser : null;
  });

  useEffect(() => {
    try {
      if (isAuthenticated) {
        localStorage.setItem(STORAGE_KEY, 'true');
        setUser(defaultUser);
      } else {
        localStorage.removeItem(STORAGE_KEY);
        setUser(null);
      }
    } catch {
      // Ignore localStorage errors
    }
  }, [isAuthenticated]);

  const login = async (email: string, _password?: string): Promise<boolean> => {
    // Fake login: allow sign in with any provided email or fallback
    const resolvedUser: UserProfile = {
      ...defaultUser,
      email: email.trim() || defaultUser.email,
    };
    setUser(resolvedUser);
    setIsAuthenticated(true);
    return true;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
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
