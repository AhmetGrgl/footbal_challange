import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Backend URL - use the proxy URL for web preview
// On fork, the URL changes, so we use environment variable
const getBackendUrl = () => {
  // First try expo config
  const expoUrl = Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_URL;
  if (expoUrl) return expoUrl;
  
  // Then try process.env
  const envUrl = process.env.EXPO_PUBLIC_BACKEND_URL;
  if (envUrl) return envUrl;
  
  // Fallback to packager proxy URL
  const proxyUrl = process.env.EXPO_PACKAGER_PROXY_URL;
  if (proxyUrl) return proxyUrl;
  
  // Default fallback - use relative path for web
  return '';
};

const BACKEND_URL = getBackendUrl();

console.log('[API] Using backend URL:', BACKEND_URL);

const TOKEN_KEY = '@session_token';

export const api = {
  async processSessionId(sessionId: string) {
    const response = await fetch(`${BACKEND_URL}/api/auth/session`, {
      method: 'POST',
      headers: { 'X-Session-ID': sessionId },
    });
    if (!response.ok) throw new Error('Failed to process session');
    const data = await response.json();
    await AsyncStorage.setItem(TOKEN_KEY, data.session_token);
    return data;
  },

  async register(email: string, password: string, name: string, username: string, age: number, gender: string, language: string) {
    console.log('[API] Register request to:', `${BACKEND_URL}/api/auth/register`);
    const response = await fetch(`${BACKEND_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name, username, age, gender, language }),
    });
    console.log('[API] Register response status:', response.status);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Kayıt başarısız');
    }
    const data = await response.json();
    await AsyncStorage.setItem(TOKEN_KEY, data.session_token);
    return data;
  },

  async completeProfile(username: string, age: number, gender: string, avatar: string, location?: string) {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    const response = await fetch(`${BACKEND_URL}/api/auth/complete-profile`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({ username, age, gender, avatar, location }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Profil tamamlama başarısız');
    }
    return response.json();
  },

  async login(email: string, password: string) {
    console.log('[API] Login request to:', `${BACKEND_URL}/api/auth/login`);
    const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    console.log('[API] Login response status:', response.status);
    if (!response.ok) {
      const error = await response.json();
      // Daha iyi hata mesajları
      if (response.status === 401) {
        throw new Error('E-posta veya şifre hatalı');
      }
      throw new Error(error.detail || 'Giriş başarısız');
    }
    const data = await response.json();
    await AsyncStorage.setItem(TOKEN_KEY, data.session_token);
    return data;
  },

  async logout() {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    if (token) {
      await fetch(`${BACKEND_URL}/api/auth/logout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      await AsyncStorage.removeItem(TOKEN_KEY);
    }
  },

  async getCurrentUser() {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    if (!token) return null;
    
    const response = await fetch(`${BACKEND_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      if (response.status === 401) {
        await AsyncStorage.removeItem(TOKEN_KEY);
      }
      return null;
    }
    return response.json();
  },

  async forgotPassword(email: string) {
    console.log('[API] Forgot password request for:', email);
    const response = await fetch(`${BACKEND_URL}/api/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'İşlem başarısız');
    }
    return response.json();
  },

  async resetPassword(token: string, newPassword: string) {
    const response = await fetch(`${BACKEND_URL}/api/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, new_password: newPassword }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Şifre sıfırlama başarısız');
    }
    return response.json();
  },

  async checkUsernameAvailable(username: string) {
    const response = await fetch(`${BACKEND_URL}/api/auth/check-username?username=${encodeURIComponent(username)}`);
    if (!response.ok) return { available: false };
    return response.json();
  },

  async updateProfile(data: any) {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    const response = await fetch(`${BACKEND_URL}/api/users/profile`, {
      method: 'PUT',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async updateLanguage(language: string) {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    const response = await fetch(`${BACKEND_URL}/api/users/language?language=${language}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  },

  async searchUsers(username: string) {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    const response = await fetch(`${BACKEND_URL}/api/users/search?username=${username}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  },

  async getPlayers() {
    const response = await fetch(`${BACKEND_URL}/api/players`);
    return response.json();
  },

  async getRandomPlayer() {
    const response = await fetch(`${BACKEND_URL}/api/players/random`);
    return response.json();
  },

  async getFriends() {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    const response = await fetch(`${BACKEND_URL}/api/friends`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  },

  async getFriendRequests() {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    const response = await fetch(`${BACKEND_URL}/api/friends/requests`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  },

  async sendFriendRequest(receiverId: string) {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    const response = await fetch(`${BACKEND_URL}/api/friends/request/${receiverId}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  },

  async acceptFriendRequest(requestId: string) {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    const response = await fetch(`${BACKEND_URL}/api/friends/accept/${requestId}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  },

  async finishGame(gameMode: string, won: boolean) {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    const response = await fetch(`${BACKEND_URL}/api/game/finish?game_mode=${gameMode}&won=${won}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  },

  async getGlobalLeaderboard() {
    const response = await fetch(`${BACKEND_URL}/api/leaderboard/global`);
    return response.json();
  },

  async getLocationLeaderboard(location: string) {
    const response = await fetch(`${BACKEND_URL}/api/leaderboard/location?location=${location}`);
    return response.json();
  },

  getToken: () => AsyncStorage.getItem(TOKEN_KEY),
};
