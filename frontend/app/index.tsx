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
    { id: 'club-connection', name: t('clubConnection'), icon: '🏆', color: '#4ECDC4' },
    { id: 'letter-hunt', name: t('letterHunt'), icon: '🔤', color: '#FF6B6B' },
    { id: 'value-guess', name: t('valueGuess'), icon: '💰', color: '#FFD93D' },
    { id: 'mystery-player', name: t('mysteryPlayer'), icon: '❓', color: '#FFA07A' },
    { id: 'career-path', name: t('careerPath'), icon: '📈', color: '#98D8C8' },
    { id: 'football-grid', name: t('footballGrid'), icon: '⚡', color: '#A8E6CF' },
  ];

  return (
    <View style={styles.container}>
      {/* Animated Stadium Background */}
      <LinearGradient
        colors={['#0a0e27', '#162447', '#1f4068', '#1b1b2f']}
        style={styles.background}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Stadium Lights Effect */}
        <View style={styles.lightsTop} />
        <View style={styles.lightsBottom} />
        
        {/* Football Field Pattern */}
        <View style={styles.fieldPattern}>
          <View style={styles.fieldLine} />
          <View style={[styles.fieldLine, { top: '33%' }]} />
          <View style={[styles.fieldLine, { top: '66%' }]} />
        </View>

        {/* Crowd Silhouette */}
        <View style={styles.crowdTop} />
        <View style={styles.crowdBottom} />
        
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <Text style={styles.titleEmoji}>⚽</Text>
              <LinearGradient
                colors={['#ffd700', '#ffed4e', '#ffd700']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.titleGradient}
              >
                <Text style={styles.title}>FOOTBALL CHALLENGE</Text>
              </LinearGradient>
            </View>
            
            <View style={styles.langSelector}>
              <TouchableOpacity
                style={[styles.langButton, selectedLang === 'tr' && styles.langButtonActive]}
                onPress={() => handleLanguageChange('tr')}
              >
                <Text style={[styles.langText, selectedLang === 'tr' && styles.langTextActive]}>
                  🇹🇷
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.langButton, selectedLang === 'en' && styles.langButtonActive]}
                onPress={() => handleLanguageChange('en')}
              >
                <Text style={[styles.langText, selectedLang === 'en' && styles.langTextActive]}>
                  🇬🇧
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.subtitle}>🎮 {selectedLang === 'tr' ? 'Oyun Modları' : 'Game Modes'}</Text>

          {/* Game Cards - Bigger & More Interactive */}
          {gameModes.map((mode, index) => (
            <TouchableOpacity
              key={mode.id}
              style={[styles.gameCard, { borderLeftColor: mode.color }]}
              activeOpacity={0.7}
              onPress={() => router.push(`/game/${mode.id}?mode=bot`)}
            >
              <LinearGradient
                colors={['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)']}
                style={styles.cardGradient}
              >
                <View style={styles.cardContent}>
                  <View style={styles.cardLeft}>
                    <Text style={styles.gameIcon}>{mode.icon}</Text>
                    <View>
                      <Text style={styles.gameName}>{mode.name}</Text>
                      <Text style={styles.gameStatus}>🤖 {selectedLang === 'tr' ? 'Bot ile Oyna' : 'Play vs Bot'}</Text>
                    </View>
                  </View>
                  <View style={[styles.playCircle, { backgroundColor: mode.color }]}>
                    <Text style={styles.playArrow}>▶</Text>
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ))}

          {/* Quick Info */}
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>
              ⭐ {selectedLang === 'tr' ? 'Hazır Özellikler' : 'Ready Features'}
            </Text>
            <View style={styles.infoGrid}>
              <View style={styles.infoItem}>
                <Text style={styles.infoEmoji}>🤖</Text>
                <Text style={styles.infoText}>{selectedLang === 'tr' ? 'Bot Mod' : 'Bot Mode'}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoEmoji}>⚽</Text>
                <Text style={styles.infoText}>10 {selectedLang === 'tr' ? 'Futbolcu' : 'Players'}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoEmoji}>🌍</Text>
                <Text style={styles.infoText}>TR/EN</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoEmoji}>🎯</Text>
                <Text style={styles.infoText}>6 {selectedLang === 'tr' ? 'Mod' : 'Modes'}</Text>
              </View>
            </View>
          </View>

          <Text style={styles.footer}>
            {selectedLang === 'tr' ? '🎮 Hemen Oyna!' : '🎮 Play Now!'}
          </Text>
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
  lightsTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  lightsBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: 'rgba(255, 215, 0, 0.05)',
    shadowColor: '#ffd700',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  fieldPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.03,
  },
  fieldLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#00ff88',
  },
  crowdTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  crowdBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  scrollContent: {
    padding: 20,
    paddingTop: 70,
  },
  header: {
    marginBottom: 30,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  titleEmoji: {
    fontSize: 60,
    marginBottom: 10,
  },
  titleGradient: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 15,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1a1a2e',
    letterSpacing: 2,
    textAlign: 'center',
  },
  langSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 15,
  },
  langButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  langButtonActive: {
    backgroundColor: '#ffd700',
    borderColor: '#ffd700',
    transform: [{ scale: 1.1 }],
  },
  langText: {
    fontSize: 32,
  },
  langTextActive: {
    transform: [{ scale: 1.2 }],
  },
  subtitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#00ff88',
    marginBottom: 20,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  gameCard: {
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
    borderLeftWidth: 8,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  cardGradient: {
    padding: 20,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  gameIcon: {
    fontSize: 48,
  },
  gameName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  gameStatus: {
    fontSize: 13,
    color: '#B8B8B8',
  },
  playCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  playArrow: {
    fontSize: 24,
    color: '#FFFFFF',
    marginLeft: 4,
  },
  infoCard: {
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderRadius: 20,
    padding: 24,
    marginTop: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  infoTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffd700',
    marginBottom: 20,
    textAlign: 'center',
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    gap: 16,
  },
  infoItem: {
    alignItems: 'center',
    width: '40%',
  },
  infoEmoji: {
    fontSize: 36,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
    textAlign: 'center',
  },
  footer: {
    fontSize: 24,
    color: '#00ff88',
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 40,
    textTransform: 'uppercase',
  },
});


