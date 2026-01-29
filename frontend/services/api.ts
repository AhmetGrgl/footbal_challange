import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BACKEND_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_URL || process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:8001';

const TOKEN_KEY = '@session_token';

export const api = {
  // Auth
  async processSessionId(sessionId: string) {
    const response = await fetch(`${BACKEND_URL}/api/auth/session`, {
      method: 'POST',
      headers: {
        'X-Session-ID': sessionId,
      },
    });
    if (!response.ok) throw new Error('Failed to process session');
    const data = await response.json();
    await AsyncStorage.setItem(TOKEN_KEY, data.session_token);
    return data;
  },

  async register(email: string, password: string, name: string, language: string) {
    const response = await fetch(`${BACKEND_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name, language }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Registration failed');
    }
    const data = await response.json();
    await AsyncStorage.setItem(TOKEN_KEY, data.session_token);
    return data;
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

  // Users
  async updateLanguage(language: string) {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    const response = await fetch(`${BACKEND_URL}/api/users/language?language=${language}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  },

  // Players
  async getPlayers() {
    const response = await fetch(`${BACKEND_URL}/api/players`);
    return response.json();
  },

  async getRandomPlayer() {
    const response = await fetch(`${BACKEND_URL}/api/players/random`);
    return response.json();
  },

  // Friends
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

  getToken: () => AsyncStorage.getItem(TOKEN_KEY),
};
