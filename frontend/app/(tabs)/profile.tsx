import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { Colors } from '../../constants/colors';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { changeLanguage } from '../../i18n';
import { api } from '../../services/api';

export default function ProfileScreen() {
  const { user, logout, refreshUser } = useAuth();
  const { t, i18n } = useTranslation();

  const handleLogout = () => {
    Alert.alert(
      t('logout'),
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: t('logout'),
          onPress: logout,
          style: 'destructive',
        },
      ]
    );
  };

  const handleLanguageChange = async (lang: string) => {
    try {
      await changeLanguage(lang);
      await api.updateLanguage(lang);
      await refreshUser();
      Alert.alert('Success', 'Language updated!');
    } catch (error) {
      console.error('Failed to update language:', error);
    }
  };

  if (!user) return null;

  const winRate = user.stats.total_games > 0 
    ? Math.round((user.stats.wins / user.stats.total_games) * 100)
    : 0;

  return (
    <LinearGradient colors={[Colors.background, Colors.secondary]} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              {user.picture ? (
                <Text>IMG</Text>
              ) : (
                <Text style={styles.avatarText}>{user.name[0].toUpperCase()}</Text>
              )}
            </View>
            <View style={styles.badge}>
              <Ionicons name="football" size={16} color={Colors.accent} />
            </View>
          </View>
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
        </View>

        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>{t('stats')}</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Ionicons name="trophy" size={32} color={Colors.accent} />
              <Text style={styles.statValue}>{user.stats.wins}</Text>
              <Text style={styles.statLabel}>{t('wins')}</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="close-circle" size={32} color={Colors.error} />
              <Text style={styles.statValue}>{user.stats.losses}</Text>
              <Text style={styles.statLabel}>{t('losses')}</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="game-controller" size={32} color={Colors.primary} />
              <Text style={styles.statValue}>{user.stats.total_games}</Text>
              <Text style={styles.statLabel}>{t('totalGames')}</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="trending-up" size={32} color={Colors.success} />
              <Text style={styles.statValue}>{winRate}%</Text>
              <Text style={styles.statLabel}>Win Rate</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('language')}</Text>
          <View style={styles.languageOptions}>
            <TouchableOpacity
              style={[
                styles.languageButton,
                i18n.language === 'tr' && styles.languageButtonActive,
              ]}
              onPress={() => handleLanguageChange('tr')}
            >
              <Text
                style={[
                  styles.languageButtonText,
                  i18n.language === 'tr' && styles.languageButtonTextActive,
                ]}
              >
                🇹🇷 Türkçe
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.languageButton,
                i18n.language === 'en' && styles.languageButtonActive,
              ]}
              onPress={() => handleLanguageChange('en')}
            >
              <Text
                style={[
                  styles.languageButtonText,
                  i18n.language === 'en' && styles.languageButtonTextActive,
                ]}
              >
                🇬🇧 English
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out" size={20} color={Colors.text} />
          <Text style={styles.logoutButtonText}>{t('logout')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: Colors.accent,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: Colors.text,
  },
  badge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.background,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  statsSection: {
    marginBottom: 32,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    width: '48%',
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  languageOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  languageButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: Colors.card,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  languageButtonActive: {
    borderColor: Colors.accent,
    backgroundColor: Colors.primary,
  },
  languageButtonText: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  languageButtonTextActive: {
    color: Colors.text,
    fontWeight: '700',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.error,
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 24,
    gap: 8,
  },
  logoutButtonText: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
});
