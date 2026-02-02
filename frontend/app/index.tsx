import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';

export default function Index() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        // Check if profile is completed
        if (user.profile_completed === false || !user.username) {
          router.replace('/complete-profile');
        } else {
          router.replace('/(tabs)');
        }
      } else {
        setTimeout(() => {
          router.replace('/(auth)/login');
        }, 2000);
      }
    }
  }, [user, loading]);

  return (
    <LinearGradient colors={['#0a0e27', '#162447', '#1f4068', '#1b1b2f']} style={styles.container}>
      <Animatable.View animation="pulse" iterationCount="infinite" duration={1500} style={styles.content}>
        <Text style={styles.emoji}>⚽</Text>
        <LinearGradient
          colors={['#ffd700', '#ffed4e', '#ffd700']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.titleGradient}
        >
          <Text style={styles.title}>FOOTBALL CHALLENGE</Text>
        </LinearGradient>
        <ActivityIndicator size="large" color="#ffd700" style={styles.loader} />
      </Animatable.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { alignItems: 'center', padding: 24 },
  emoji: { fontSize: 80, marginBottom: 20 },
  titleGradient: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 15 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1a1a2e', letterSpacing: 2 },
  loader: { marginTop: 40 },
});