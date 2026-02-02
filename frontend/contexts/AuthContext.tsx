import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

WebBrowser.maybeCompleteAuthSession();

interface User {
  user_id: string;
  email: string;
  name: string;
  username: string;
  age?: number;
  gender?: string;
  picture?: string;
  avatar: string;
  language: string;
  location?: string;
  stats: {
    wins: number;
    losses: number;
    total_games: number;
    points: number;
    rank: string;
  };
  friends: string[];
  profile_completed?: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, username: string, age: number, gender: string, language: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  completeProfile: (username: string, age: number, gender: string, avatar: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
    setupDeepLinkListener();
  }, []);

  const setupDeepLinkListener = () => {
    const handleUrl = async ({ url }: { url: string }) => {
      const sessionId = extractSessionId(url);
      if (sessionId) {
        try {
          await api.processSessionId(sessionId);
          await checkAuth();
        } catch (error) {
          console.error('Failed to process session:', error);
        }
      }
    };

    Linking.getInitialURL().then((url) => {
      if (url) handleUrl({ url });
    });

    const subscription = Linking.addEventListener('url', handleUrl);
    return () => subscription.remove();
  };

  const extractSessionId = (url: string): string | null => {
    const hashMatch = url.match(/[#&]session_id=([^&]+)/);
    const queryMatch = url.match(/[?&]session_id=([^&]+)/);
    return hashMatch?.[1] || queryMatch?.[1] || null;
  };

  const checkAuth = async () => {
    try {
      const currentUser = await api.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    await api.login(email, password);
    await checkAuth();
  };

  const register = async (email: string, password: string, name: string, username: string, age: number, gender: string, language: string) => {
    await api.register(email, password, name, username, age, gender, language);
    await checkAuth();
  };

  const loginWithGoogle = async () => {
    try {
      const BACKEND_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_URL || process.env.EXPO_PUBLIC_BACKEND_URL;
      const redirectUrl = Platform.OS === 'web' 
        ? `${BACKEND_URL}/` 
        : Linking.createURL('/');
      
      const authUrl = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
      
      if (Platform.OS === 'web') {
        window.location.href = authUrl;
      } else {
        const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUrl);
        
        if (result.type === 'success' && result.url) {
          const sessionId = extractSessionId(result.url);
          if (sessionId) {
            await api.processSessionId(sessionId);
            await checkAuth();
          }
        }
      }
    } catch (error) {
      console.error('Google login failed:', error);
      throw error;
    }
  };

  const completeProfile = async (username: string, age: number, gender: string, avatar: string) => {
    await api.completeProfile(username, age, gender, avatar);
    await checkAuth();
  };

  const logout = async () => {
    await api.logout();
    setUser(null);
  };

  const refreshUser = async () => {
    await checkAuth();
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, loginWithGoogle, completeProfile, logout, refreshUser }}>
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