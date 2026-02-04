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
  Image,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useSounds } from '../../contexts/SoundContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import * as Animatable from 'react-native-animatable';

const HOME_BG = require('../../assets/images/home-bg.jpg');
const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 60) / 3;

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const { playClick, isMusicPlaying, toggleBackgroundMusic, isSoundEnabled, toggleSound } = useSounds();
  
  // Animations
  const [pulseAnim] = useState(new Animated.Value(1));
  const [confettiAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    // Pulse animation for play button
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.02,
          duration: 1500,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Confetti animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(confettiAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(confettiAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.linear,
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
      image: '💶',
      colors: ['#2E7D32', '#1B5E20'],
    },
    { 
      id: 'mystery-player', 
      name: 'Gizli Oyuncu', 
      emoji: '❓',
      image: '🕵️',
      colors: ['#7B1FA2', '#4A148C'],
    },
    { 
      id: 'career-path', 
      name: 'Kariyer Yolu', 
      emoji: '📈',
      image: '💼',
      colors: ['#1565C0', '#0D47A1'],
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
          {/* Header with Welcome */}
          <Animatable.View animation="fadeInDown" duration={1000} style={styles.header}>
            <Text style={styles.welcomeText}>Hoş Geldiniz</Text>
            <View style={styles.nameRow}>
              <Text style={styles.userName}>{user?.name || 'Futbolcu'}</Text>
              <Text style={styles.ballEmoji}>⚽</Text>
            </View>
          </Animatable.View>

          {/* Stats Card - Scoreboard Style */}
          <Animatable.View animation="fadeInUp" duration={1000} delay={200}>
            <View style={styles.statsCard}>
              <LinearGradient
                colors={['#3D8B40', '#2E7D32', '#1B5E20']}
                style={styles.statsGradient}
              >
                {/* Confetti decoration */}
                <View style={styles.confettiContainer}>
                  <Text style={styles.confetti}>🎊</Text>
                  <Text style={[styles.confetti, styles.confettiRight]}>🎉</Text>
                </View>

                {/* Stats Row */}
                <View style={styles.statsRow}>
                  {/* Wins with Trophy */}
                  <View style={styles.statItem}>
                    <Text style={styles.trophyEmoji}>🏆</Text>
                    <Text style={styles.statLabel}>Kazanç</Text>
                  </View>

                  {/* Score */}
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{user?.stats?.wins || 0}</Text>
                    <Text style={styles.statLabel}>Kayıp</Text>
                  </View>

                  {/* Total Games */}
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{user?.stats?.total_games || 0}</Text>
                    <Text style={styles.statLabel}>Toplam Oyun</Text>
                  </View>
                </View>

                {/* Play Now Button */}
                <Animated.View style={[styles.playButtonContainer, { transform: [{ scale: pulseAnim }] }]}>
                  <TouchableOpacity 
                    style={styles.playButton}
                    onPress={() => {
                      playClick();
                      router.push('/game/mystery-player');
                    }}
                    activeOpacity={0.9}
                  >
                    <LinearGradient
                      colors={['#FFD700', '#FFC107', '#FF9800']}
                      style={styles.playButtonGradient}
                    >
                      <Text style={styles.playButtonText}>Şimdi Oyna</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </Animated.View>

                {/* Green field line */}
                <View style={styles.fieldLine} />
              </LinearGradient>

              {/* Golden border effect */}
              <View style={styles.goldenBorder} />
            </View>
          </Animatable.View>

          {/* Game Mode Cards */}
          <View style={styles.gamesSection}>
            <View style={styles.gamesRow}>
              {gameModes.map((mode, index) => (
                <Animatable.View
                  key={mode.id}
                  animation="fadeInUp"
                  duration={800}
                  delay={400 + index * 150}
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
                      {/* Game Image/Emoji */}
                      <View style={styles.gameImageContainer}>
                        <Text style={styles.gameImage}>{mode.image}</Text>
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

          {/* Bottom Football */}
          <View style={styles.bottomSection}>
            <Text style={styles.bottomBall}>⚽</Text>
          </View>
        </ScrollView>

        {/* Sound Controls - Floating */}
        <View style={styles.soundControls}>
          <TouchableOpacity 
            style={styles.soundBtn} 
            onPress={() => { playClick(); toggleSound(); }}
          >
            <Ionicons 
              name={isSoundEnabled ? "volume-high" : "volume-mute"} 
              size={20} 
              color="#FFD700" 
            />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.soundBtn} 
            onPress={() => { playClick(); toggleBackgroundMusic(); }}
          >
            <Ionicons 
              name={isMusicPlaying ? "musical-notes" : "musical-notes-outline"} 
              size={20} 
              color={isMusicPlaying ? "#00FF87" : "#FFD700"} 
            />
          </TouchableOpacity>
        </View>
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
    backgroundColor: 'rgba(0, 15, 30, 0.4)',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 100,
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
  },
  welcomeText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
    marginBottom: 4,
  },
  nameRow: {
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
    textShadowRadius: 6,
  },
  ballEmoji: {
    fontSize: 32,
  },
  statsCard: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 20,
    position: 'relative',
  },
  statsGradient: {
    padding: 16,
    paddingBottom: 20,
    borderRadius: 18,
    borderWidth: 3,
    borderColor: '#FFD700',
  },
  goldenBorder: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: 'rgba(255, 215, 0, 0.5)',
  },
  confettiContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingTop: 5,
  },
  confetti: {
    fontSize: 20,
  },
  confettiRight: {
    transform: [{ scaleX: -1 }],
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 10,
  },
  statItem: {
    alignItems: 'center',
    minWidth: 80,
  },
  trophyEmoji: {
    fontSize: 36,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 36,
    fontWeight: '900',
    color: '#FFD700',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  statLabel: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
    marginTop: 2,
  },
  playButtonContainer: {
    marginTop: 8,
    marginHorizontal: 40,
  },
  playButton: {
    borderRadius: 25,
    overflow: 'hidden',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  playButtonGradient: {
    paddingVertical: 14,
    paddingHorizontal: 40,
    alignItems: 'center',
  },
  playButtonText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1a1a2e',
    letterSpacing: 1,
  },
  fieldLine: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginTop: 16,
    marginHorizontal: -16,
    borderRadius: 2,
  },
  gamesSection: {
    marginTop: 8,
  },
  gamesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  gameCardWrapper: {
    flex: 1,
  },
  gameCard: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  gameCardGradient: {
    padding: 12,
    alignItems: 'center',
    minHeight: 180,
    justifyContent: 'space-between',
  },
  gameImageContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  gameImage: {
    fontSize: 40,
  },
  gameName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  gamePlayButton: {
    borderRadius: 15,
    overflow: 'hidden',
    width: '100%',
  },
  gamePlayGradient: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  gamePlayText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1a1a2e',
  },
  bottomSection: {
    alignItems: 'flex-end',
    marginTop: 16,
    paddingRight: 10,
  },
  bottomBall: {
    fontSize: 70,
    opacity: 0.9,
  },
  soundControls: {
    position: 'absolute',
    top: 50,
    right: 16,
    flexDirection: 'row',
    gap: 10,
  },
  soundBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.4)',
  },
});
