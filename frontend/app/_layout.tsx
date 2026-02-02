import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { AuthProvider } from '../contexts/AuthContext';
import { SocketProvider } from '../contexts/SocketContext';
import '../i18n';

export default function RootLayout() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)/login" />
          <Stack.Screen name="(auth)/register" />
          <Stack.Screen name="complete-profile" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="game/club-connection" />
          <Stack.Screen name="game/letter-hunt" />
          <Stack.Screen name="game/value-guess" />
          <Stack.Screen name="game/mystery-player" />
          <Stack.Screen name="game/career-path" />
          <Stack.Screen name="game/football-grid" />
        </Stack>
      </SocketProvider>
    </AuthProvider>
  );
}
