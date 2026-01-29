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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
    setupDeepLinkListener();
  }, []);

  const setupDeepLinkListener = () => {
    // Handle deep link for OAuth redirect
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

    // Check initial URL (cold start)
    Linking.getInitialURL().then((url) => {
      if (url) handleUrl({ url });
    });

    // Listen for URL changes (hot link)
    const subscription = Linking.addEventListener('url', handleUrl);
    return () => subscription.remove();
  };

  const extractSessionId = (url: string): string | null => {
    // Check both hash (#) and query (?) parameters
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

  const register = async (email: string, password: string, name: string, language: string) => {
    await api.register(email, password, name, language);
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
        // Web: redirect directly
        window.location.href = authUrl;
      } else {
        // Mobile: use WebBrowser
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

  const logout = async () => {
    await api.logout();
    setUser(null);
  };

  const refreshUser = async () => {
    await checkAuth();
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
