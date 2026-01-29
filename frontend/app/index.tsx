import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Image } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'expo-router';
import { Colors } from '../constants/colors';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function Index() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { t } = useTranslation();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.replace('/(tabs)');
      } else {
        // Show welcome screen for 2 seconds then go to login
        setTimeout(() => {
          router.replace('/(auth)/login');
        }, 2000);
      }
    }
  }, [user, loading]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={Colors.accent} />
      </View>
    );
  }

  return (
    <LinearGradient
      colors={[Colors.background, Colors.secondary, Colors.primary]}
      style={styles.container}
    >
      <View style={styles.content}>
        <Ionicons name="football" size={120} color={Colors.accent} />
        <Text style={styles.title}>{t('footballChallenge')}</Text>
        <Text style={styles.subtitle}>{t('welcome')}</Text>
        <ActivityIndicator size="large" color={Colors.accent} style={styles.loader} />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: 24,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 24,
    color: Colors.textSecondary,
    marginTop: 8,
  },
  loader: {
    marginTop: 40,
  },
});
