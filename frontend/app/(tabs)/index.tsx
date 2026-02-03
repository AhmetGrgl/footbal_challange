import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  ImageBackground,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useSounds } from '../../contexts/SoundContext';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import * as Animatable from 'react-native-animatable';

const HOME_BG = require('../../assets/images/home-bg.jpg');
const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

export default function HomeScreen() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const router = useRouter();
  const { playClick, isMusicPlaying, toggleBackgroundMusic, isSoundEnabled, toggleSound } = useSounds();
  
  // Animations
  const [confettiAnim] = useState(new Animated.Value(0));
  const [pulseAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    // Confetti floating animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(confettiAnim, {
          toValue: 1,
          duration: 3000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(confettiAnim, {
          toValue: 0,
          duration: 3000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Pulse animation for play button
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const gameModes = [
    { 
      id: 'value-guess', 
      name: 'Değer Tahmini', 
      emoji: '💰',
      colors: ['#2E7D32', '#1B5E20'],
      description: 'Futbolcuların değerini tahmin et!'
    },
    { 
      id: 'mystery-player', 
      name: 'Gizli Oyuncu', 
      emoji: '❓',
      colors: ['#7B1FA2', '#4A148C'],
      description: 'Kim bu gizemli futbolcu?'
    },
    { 
      id: 'career-path', 
      name: 'Kariyer Yolu', 
      emoji: '📈',
      colors: ['#1565C0', '#0D47A1'],
      description: 'Transferleri takip et!'
    },
    { 
      id: 'letter-hunt', 
      name: 'Harf Avı', 
      emoji: '🔤',
      colors: ['#C62828', '#B71C1C'],
      description: 'Harflerden oyuncu bul!'
    },
    { 
      id: 'club-connection', 
      name: 'Takım Bağlantısı', 
      emoji: '🔗',
      colors: ['#00838F', '#006064'],
      description: 'Takımları eşleştir!'
    },
    { 
      id: 'football-grid', 
      name: 'Futbol Grid', 
      emoji: '🧩',
      colors: ['#EF6C00', '#E65100'],
      description: 'Grid bulmacasını çöz!'
    },
  ];

  const handleGamePress = (gameId: string) => {
    playClick();
    router.push(`/game/${gameId}`);
  };

  return (
    <ImageBackground source={HOME_BG} style={styles.container} resizeMode="cover">
      <View style={styles.overlay}>
        <ScrollView 
          contentContainerStyle={styles.scrollContent} 
          showsVerticalScrollIndicator={false}
        >
          {/* Sound Control */}
          <View style={styles.soundControl}>
            <TouchableOpacity 
              style={styles.soundButton} 
              onPress={() => {
                playClick();
                toggleSound();
              }}
            >
              <Ionicons 
                name={isSoundEnabled ? "volume-high" : "volume-mute"} 
                size={24} 
                color="#FFD700" 
              />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.soundButton} 
              onPress={() => {
                playClick();
                toggleBackgroundMusic();
              }}
            >
              <Ionicons 
                name={isMusicPlaying ? "musical-notes" : "musical-notes-outline"} 
                size={24} 
                color={isMusicPlaying ? "#00FF87" : "#FFD700"} 
              />
            </TouchableOpacity>
          </View>

          {/* Header with Welcome */}
          <Animatable.View animation="fadeInDown" duration={1000} style={styles.header}>
            <Text style={styles.welcomeText}>Hoş Geldiniz</Text>
            <View style={styles.nameContainer}>
              <Text style={styles.userName}>{user?.name || 'Futbolcu'}</Text>
              <Text style={styles.ballEmoji}>⚽</Text>
            </View>
          </Animatable.View>

          {/* Stats Card - Scoreboard Style */}
          <Animatable.View animation="fadeInUp" duration={1000} delay={200}>
            <LinearGradient
              colors={['#2E7D32', '#1B5E20', '#2E7D32']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.statsCard}
            >
              <View style={styles.statsInner}>
                {/* Trophy and Wins */}
                <View style={styles.statItem}>
                  <Text style={styles.trophyEmoji}>🏆</Text>
                  <Text style={styles.statValue}>{user?.stats?.wins || 0}</Text>
                  <Text style={styles.statLabel}>Kazanç</Text>
                </View>

                {/* Losses */}
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{user?.stats?.losses || 0}</Text>
                  <Text style={styles.statLabel}>Kayıp</Text>
                </View>

                {/* Total Games */}
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{user?.stats?.total_games || 0}</Text>
                  <Text style={styles.statLabel}>Toplam Oyun</Text>
                </View>
              </View>

              {/* Play Now Button */}
              <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                <TouchableOpacity 
                  style={styles.playNowButton}
                  onPress={() => {
                    playClick();
                    router.push('/game/mystery-player');
                  }}
                >
                  <LinearGradient
                    colors={['#FFD700', '#FFA500']}
                    style={styles.playNowGradient}
                  >
                    <Text style={styles.playNowText}>Şimdi Oyna</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>
            </LinearGradient>
          </Animatable.View>

          {/* Game Modes Grid */}
          <View style={styles.gamesSection}>
            <View style={styles.gamesGrid}>
              {gameModes.map((mode, index) => (
                <Animatable.View
                  key={mode.id}
                  animation="fadeInUp"
                  duration={800}
                  delay={300 + index * 100}
                  style={styles.gameCardWrapper}
                >
                  <TouchableOpacity
                    style={styles.gameCard}
                    onPress={() => handleGamePress(mode.id)}
                    activeOpacity={0.9}
                  >
                    <LinearGradient
                      colors={mode.colors}
                      style={styles.gameCardGradient}
                    >
                      {/* Game Icon/Emoji */}
                      <View style={styles.gameEmojiContainer}>
                        <Text style={styles.gameEmoji}>{mode.emoji}</Text>
                      </View>
                      
                      {/* Game Name */}
                      <Text style={styles.gameName}>{mode.name}</Text>
                      
                      {/* Play Button */}
                      <TouchableOpacity 
                        style={styles.gamePlayButton}
                        onPress={() => handleGamePress(mode.id)}
                      >
                        <LinearGradient
                          colors={['#00FF87', '#00CC6F']}
                          style={styles.gamePlayGradient}
                        >
                          <Text style={styles.gamePlayText}>Şimdi Oyna</Text>
                        </LinearGradient>
                      </TouchableOpacity>
                    </LinearGradient>
                  </TouchableOpacity>
                </Animatable.View>
              ))}
            </View>
          </View>

          {/* Bottom Decorative Ball */}
          <View style={styles.bottomDecor}>
            <Text style={styles.bottomBall}>⚽</Text>
          </View>
        </ScrollView>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 20, 10, 0.3)',
  },
  scrollContent: {
    padding: 16,
    paddingTop: 50,
    paddingBottom: 100,
  },
  soundControl: {
    position: 'absolute',
    top: 10,
    right: 16,
    flexDirection: 'row',
    gap: 12,
    zIndex: 10,
  },
  soundButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.3)',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 20,
  },
  welcomeText: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  userName: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFD700',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  ballEmoji: {
    fontSize: 36,
  },
  statsCard: {
    borderRadius: 20,
    padding: 3,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: 'rgba(255,215,0,0.4)',
  },
  statsInner: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 16,
  },
  statItem: {
    alignItems: 'center',
    minWidth: 80,
  },
  trophyEmoji: {
    fontSize: 28,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFD700',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 2,
    fontWeight: '600',
  },
  playNowButton: {
    marginTop: 12,
    marginBottom: 8,
    marginHorizontal: 60,
    borderRadius: 25,
    overflow: 'hidden',
  },
  playNowGradient: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  playNowText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1a1a2e',
    letterSpacing: 1,
  },
  gamesSection: {
    marginTop: 8,
  },
  gamesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  gameCardWrapper: {
    width: CARD_WIDTH,
    marginBottom: 4,
  },
  gameCard: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  gameCardGradient: {
    padding: 16,
    alignItems: 'center',
    minHeight: 160,
  },
  gameEmojiContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  gameEmoji: {
    fontSize: 32,
  },
  gameName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 12,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  gamePlayButton: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  gamePlayGradient: {
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  gamePlayText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1a1a2e',
  },
  bottomDecor: {
    alignItems: 'flex-end',
    marginTop: 20,
    paddingRight: 20,
  },
  bottomBall: {
    fontSize: 60,
    opacity: 0.8,
  },
});
