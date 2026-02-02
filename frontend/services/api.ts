import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Backend URL - use the preview URL for both web and native
// The /api/* routes are proxied to the backend via ingress
const BACKEND_URL = 'https://football-quiz-37.preview.emergentagent.com';

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
    const response = await fetch(`${BACKEND_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name, username, age, gender, language }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Registration failed');
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
      throw new Error(error.detail || 'Profile completion failed');
    }
    return response.json();
  },

  async login(email: string, password: string) {
    const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Login failed');
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