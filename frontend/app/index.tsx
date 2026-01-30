import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ImageBackground } from 'react-native';
import { useTranslation } from 'react-i18next';
import { changeLanguage } from '../i18n';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

export default function Index() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const [selectedLang, setSelectedLang] = useState(i18n.language);

  const handleLanguageChange = async (lang: string) => {
    setSelectedLang(lang);
    await changeLanguage(lang);
  };

  const gameModes = [
    { id: 'letter-hunt', name: t('letterHunt'), icon: '🔤', color: '#FF6B6B', description: 'Take turns writing letters' },
    { id: 'club-connection', name: t('clubConnection'), icon: '🏆', color: '#4ECDC4', description: 'Find common players' },
    { id: 'value-guess', name: t('valueGuess'), icon: '💰', color: '#FFD93D', description: 'Guess market values' },
    { id: 'mystery-player', name: t('mysteryPlayer'), icon: '❓', color: '#FFA07A', description: 'Reveal letters' },
    { id: 'career-path', name: t('careerPath'), icon: '📈', color: '#98D8C8', description: 'Career history quiz' },
    { id: 'football-grid', name: t('footballGrid'), icon: '⚡', color: '#A8E6CF', description: 'Tic-tac-toe football' },
  ];

  return (
    <View style={styles.container}>
      {/* Stadium Background Effect */}
      <LinearGradient
        colors={['#1a1a2e', '#16213e', '#0f3460', '#1a472a']}
        style={styles.background}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Tribün Pattern Overlay */}
        <View style={styles.stadiumPattern} />
        
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header with Language Selector */}
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <Text style={styles.titleEmoji}>⚽</Text>
              <Text style={styles.title}>Football Challenge</Text>
            </View>
            
            {/* Language Selector */}
            <View style={styles.langSelector}>
              <TouchableOpacity
                style={[styles.langButton, selectedLang === 'tr' && styles.langButtonActive]}
                onPress={() => handleLanguageChange('tr')}
              >
                <Text style={[styles.langText, selectedLang === 'tr' && styles.langTextActive]}>
                  🇹🇷 TR
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.langButton, selectedLang === 'en' && styles.langButtonActive]}
                onPress={() => handleLanguageChange('en')}
              >
                <Text style={[styles.langText, selectedLang === 'en' && styles.langTextActive]}>
                  🇬🇧 EN
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.subtitle}>🎮 {t('gameModes')}</Text>

          {/* Game Mode Cards */}
          <View style={styles.gameModeGrid}>
            {gameModes.map((mode, index) => (
              <TouchableOpacity
                key={mode.id}
                style={[styles.gameModeCard, { borderLeftColor: mode.color }]}
                activeOpacity={0.8}
                onPress={() => router.push(`/game/${mode.id}`)}
              >
                <View style={styles.gameModeHeader}>
                  <Text style={styles.gameModeIcon}>{mode.icon}</Text>
                  <View style={styles.gameModeBadge}>
                    <Text style={styles.badgeText}>NEW</Text>
                  </View>
                </View>
                <Text style={styles.gameModeName}>{mode.name}</Text>
                <Text style={styles.gameModeDesc}>{mode.description}</Text>
                
                {/* Play Buttons */}
                <View style={styles.playButtons}>
                  <TouchableOpacity 
                    style={[styles.playBtn, styles.playBtnPrimary]}
                    onPress={() => router.push(`/game/${mode.id}?mode=bot`)}
                  >
                    <Text style={styles.playBtnText}>🤖 {t('playNow')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.playBtn, styles.playBtnSecondary]}
                    onPress={() => router.push(`/game/${mode.id}?mode=online`)}
                  >
                    <Text style={styles.playBtnTextSecondary}>👥 Online</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Features Section */}
          <View style={styles.featuresCard}>
            <Text style={styles.featuresTitle}>✨ Features</Text>
            <View style={styles.featuresList}>
              <Text style={styles.featureItem}>🎯 6 Different Game Modes</Text>
              <Text style={styles.featureItem}>🤖 Play vs Bot (Practice)</Text>
              <Text style={styles.featureItem}>👥 Real-time Multiplayer</Text>
              <Text style={styles.featureItem}>🏆 Leaderboards & Stats</Text>
              <Text style={styles.featureItem}>⭐ 10 Famous Players</Text>
              <Text style={styles.featureItem}>🌍 Multi-language Support</Text>
            </View>
          </View>

          {/* Players Preview */}
          <View style={styles.playersCard}>
            <Text style={styles.playersTitle}>⭐ Star Players</Text>
            <View style={styles.playersList}>
              {['Messi', 'Ronaldo', 'Arda Güler', 'Haaland', 'Mbappe', 'Neymar'].map((player, i) => (
                <View key={i} style={styles.playerChip}>
                  <Text style={styles.playerChipText}>{player}</Text>
                </View>
              ))}
            </View>
          </View>

          <Text style={styles.footer}>🎮 Ready to Play!</Text>
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  stadiumPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.1,
    backgroundColor: 'transparent',
  },
  scrollContent: {
    padding: 20,
    paddingTop: 60,
  },
  header: {
    marginBottom: 32,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  titleEmoji: {
    fontSize: 48,
    marginRight: 12,
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#FFD700',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  langSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  langButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  langButtonActive: {
    backgroundColor: '#FFD700',
    borderColor: '#FFD700',
  },
  langText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  langTextActive: {
    color: '#1a1a2e',
  },
  subtitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#00FF88',
    marginBottom: 20,
    textAlign: 'center',
  },
  gameModeGrid: {
    gap: 16,
    marginBottom: 24,
  },
  gameModeCard: {
    backgroundColor: 'rgba(26, 71, 42, 0.7)',
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 6,
    backdropFilter: 'blur(10px)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  gameModeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  gameModeIcon: {
    fontSize: 36,
  },
  gameModeBadge: {
    backgroundColor: '#FF4757',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  gameModeName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  gameModeDesc: {
    fontSize: 14,
    color: '#B8B8B8',
    marginBottom: 16,
  },
  playButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  playBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  playBtnPrimary: {
    backgroundColor: '#00FF88',
  },
  playBtnSecondary: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  playBtnText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1a1a2e',
  },
  playBtnTextSecondary: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  featuresCard: {
    backgroundColor: 'rgba(78, 205, 196, 0.15)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(78, 205, 196, 0.3)',
  },
  featuresTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#4ECDC4',
    marginBottom: 16,
  },
  featuresList: {
    gap: 10,
  },
  featureItem: {
    fontSize: 15,
    color: '#FFFFFF',
    paddingLeft: 8,
  },
  playersCard: {
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  playersTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 16,
  },
  playersList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  playerChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.5)',
  },
  playerChipText: {
    color: '#FFD700',
    fontSize: 13,
    fontWeight: '600',
  },
  footer: {
    fontSize: 18,
    color: '#00FF88',
    textAlign: 'center',
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 40,
  },
});


