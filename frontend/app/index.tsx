import React, { useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, ImageBackground } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'expo-router';

const STADIUM_BG = require('../assets/images/stadium-bg.png');

export default function Index() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        // User is logged in
        if (user.profile_completed === false || !user.username) {
          router.replace('/complete-profile');
        } else {
          router.replace('/(tabs)');
        }
      } else {
        // Not logged in - go directly to register
        router.replace('/(auth)/register');
      }
    }
  }, [user, loading]);

  // Show minimal loading while checking auth
  return (
    <ImageBackground source={STADIUM_BG} style={styles.container} resizeMode="cover">
      <View style={styles.overlay}>
        <ActivityIndicator size="large" color="#FFD700" />
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 20, 40, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
});
