import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  user_id: string;
  email: string;
  name: string;
  picture?: string;
  language: string;
  stats: {
    wins: number;
    losses: number;
    total_games: number;
  };
  friends: string[];
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, language: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  // Guest mode - no auth required for bot games
  const login = async (email: string, password: string) => {
    // Not implemented yet
    console.log('Login not implemented');
  };

  const register = async (email: string, password: string, name: string, language: string) => {
    // Not implemented yet
    console.log('Register not implemented');
  };

  const loginWithGoogle = async () => {
    // Not implemented yet
    console.log('Google login not implemented');
  };

  const logout = async () => {
    setUser(null);
  };

  const refreshUser = async () => {
    // Not needed for bot mode
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, loginWithGoogle, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
