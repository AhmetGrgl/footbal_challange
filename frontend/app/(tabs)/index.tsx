import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { Colors } from '../../constants/colors';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const router = useRouter();

  const gameModes = [
    { id: 'letter-hunt', name: t('letterHunt'), icon: 'text' as const, color: '#FF6B6B' },
    { id: 'club-connection', name: t('clubConnection'), icon: 'shield' as const, color: '#4ECDC4' },
    { id: 'value-guess', name: t('valueGuess'), icon: 'cash' as const, color: '#45B7D1' },
    { id: 'mystery-player', name: t('mysteryPlayer'), icon: 'help-circle' as const, color: '#FFA07A' },
    { id: 'career-path', name: t('careerPath'), icon: 'trending-up' as const, color: '#98D8C8' },
    { id: 'football-grid', name: t('footballGrid'), icon: 'grid' as const, color: '#FFD93D' },
  ];

  return (
    <LinearGradient colors={[Colors.background, Colors.secondary]} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{t('welcome')}</Text>
            <Text style={styles.userName}>{user?.name}!</Text>
          </View>
          <Ionicons name="football" size={40} color={Colors.accent} />
        </View>

        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user?.stats.wins || 0}</Text>
            <Text style={styles.statLabel}>{t('wins')}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user?.stats.losses || 0}</Text>
            <Text style={styles.statLabel}>{t('losses')}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user?.stats.total_games || 0}</Text>
            <Text style={styles.statLabel}>{t('totalGames')}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>{t('gameModes')}</Text>

        <View style={styles.gamesGrid}>
          {gameModes.map((mode) => (
            <TouchableOpacity
              key={mode.id}
              style={[styles.gameCard, { backgroundColor: mode.color + '20' }]}
              onPress={() => router.push(`/game/${mode.id}`)}
            >
              <View style={[styles.gameIconContainer, { backgroundColor: mode.color }]}>
                <Ionicons name={mode.icon} size={32} color={Colors.text} />
              </View>
              <Text style={styles.gameName}>{mode.name}</Text>
              <TouchableOpacity style={styles.playButton}>
                <Text style={styles.playButtonText}>{t('playNow')}</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  userName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: 4,
  },
  statsCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 32,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.accent,
  },
  statLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.border,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
  },
  gamesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'space-between',
  },
  gameCard: {
    width: '48%',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 8,
  },
  gameIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  gameName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  playButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  playButtonText: {
    color: Colors.text,
    fontSize: 12,
    fontWeight: '600',
  },
});
