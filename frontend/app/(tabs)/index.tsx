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
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import * as Animatable from 'react-native-animatable';

const HOME_BG = require('../../assets/images/home-bg.jpg');
const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 3;

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const { playClick, isMusicPlaying, toggleBackgroundMusic, isSoundEnabled, toggleSound } = useSounds();
  
  const [pulseAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.03,
          duration: 1200,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // 6 Oyun Modu - Resimdeki gibi
  const gameModes = [
    { 
      id: 'value-guess', 
      name: 'Değer Tahmini', 
      icon: '💰',
      subtitle: '€',
      colors: ['#2E7D32', '#1B5E20', '#004D00'],
    },
    { 
      id: 'mystery-player', 
      name: 'Gizli Oyuncu', 
      icon: '❓',
      subtitle: '🕵️',
      colors: ['#6A1B9A', '#4A148C', '#311B92'],
    },
    { 
      id: 'career-path', 
      name: 'Kariyer Yolu', 
      icon: '📈',
      subtitle: '💼',
      colors: ['#1565C0', '#0D47A1', '#01579B'],
    },
    { 
      id: 'letter-hunt', 
      name: 'Harf Avı', 
      icon: '🔤',
      subtitle: 'ABC',
      colors: ['#C62828', '#B71C1C', '#8E0000'],
    },
    { 
      id: 'club-connection', 
      name: 'Takım Bağlantısı', 
      icon: '🔗',
      subtitle: '⚽',
      colors: ['#00838F', '#006064', '#004D40'],
    },
    { 
      id: 'football-grid', 
      name: 'Futbol Tablosu', 
      icon: '⚡',
      subtitle: '🏆',
      colors: ['#EF6C00', '#E65100', '#BF360C'],
    },
  ];

  const handleGamePress = (gameId: string) => {
    playClick();
    router.push(`/game/${gameId}`);
  };

  const renderGameCard = (mode: typeof gameModes[0], index: number) => (
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
          {/* Main Icon */}
          <View style={styles.gameIconContainer}>
            <Text style={styles.gameMainIcon}>{mode.icon}</Text>
            <Text style={styles.gameSubIcon}>{mode.subtitle}</Text>
          </View>
          
          {/* Game Name */}
          <Text style={styles.gameName}>{mode.name}</Text>
          
          {/* Play Button */}
          <TouchableOpacity 
            style={styles.gamePlayButton}
            onPress={() => handleGamePress(mode.id)}
          >
            <LinearGradient
              colors={['#00FF87', '#00CC6F', '#00994D']}
              style={styles.gamePlayGradient}
            >
              <Text style={styles.gamePlayText}>Şimdi Oyna</Text>
            </LinearGradient>
          </TouchableOpacity>
        </LinearGradient>
      </TouchableOpacity>
    </Animatable.View>
  );

  return (
    <ImageBackground source={HOME_BG} style={styles.container} resizeMode="cover">
      <View style={styles.overlay}>
        <ScrollView 
          contentContainerStyle={styles.scrollContent} 
          showsVerticalScrollIndicator={false}
        >
          {/* Header - Hoş Geldiniz */}
          <Animatable.View animation="fadeInDown" duration={1000} style={styles.header}>
            <Text style={styles.welcomeText}>Hoş Geldiniz</Text>
            <View style={styles.nameRow}>
              <Text style={styles.userName}>{user?.name || 'Futbolcu'}</Text>
              <Text style={styles.ballEmoji}>⚽</Text>
            </View>
          </Animatable.View>

          {/* Stats Card - Skor Tablosu */}
          <Animatable.View animation="fadeInUp" duration={1000} delay={200}>
            <View style={styles.statsCardContainer}>
              <LinearGradient
                colors={['#3D8B40', '#2E7D32', '#1B5E20']}
                style={styles.statsCard}
              >
                {/* Stats Row */}
                <View style={styles.statsRow}>
                  {/* Kazanç with Trophy */}
                  <View style={styles.statItem}>
                    <Text style={styles.trophyEmoji}>🏆</Text>
                    <Text style={styles.statLabel}>Kazanç</Text>
                  </View>

                  {/* Kayıp */}
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{user?.stats?.losses || 0}</Text>
                    <Text style={styles.statLabel}>Kayıp</Text>
                  </View>

                  {/* Toplam Oyun */}
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{user?.stats?.total_games || 0}</Text>
                    <Text style={styles.statLabel}>Toplam Oyun</Text>
                  </View>
                </View>

                {/* Green field line */}
                <View style={styles.fieldLine} />

                {/* Şimdi Oyna Button */}
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
              </LinearGradient>
            </View>
          </Animatable.View>

          {/* Game Cards - First Row (3 cards) */}
          <View style={styles.gamesRow}>
            {gameModes.slice(0, 3).map((mode, index) => renderGameCard(mode, index))}
          </View>

          {/* Game Cards - Second Row (3 cards) */}
          <View style={styles.gamesRow}>
            {gameModes.slice(3, 6).map((mode, index) => renderGameCard(mode, index + 3))}
          </View>

          {/* Bottom Football */}
          <View style={styles.bottomSection}>
            <Text style={styles.bottomBall}>⚽</Text>
          </View>
        </ScrollView>

        {/* Sound Controls */}
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
    backgroundColor: 'rgba(0, 10, 20, 0.3)',
  },
  scrollContent: {
    paddingHorizontal: 12,
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
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  userName: {
    fontSize: 30,
    fontWeight: '900',
    color: '#FFD700',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 6,
  },
  ballEmoji: {
    fontSize: 30,
  },
  statsCardContainer: {
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 3,
    borderColor: '#FFD700',
    overflow: 'hidden',
  },
  statsCard: {
    padding: 12,
    paddingBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 8,
  },
  statItem: {
    alignItems: 'center',
    minWidth: 80,
  },
  trophyEmoji: {
    fontSize: 36,
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
    fontSize: 14,
    color: '#fff',
    fontWeight: '700',
    marginTop: 2,
  },
  fieldLine: {
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.4)',
    marginVertical: 10,
    marginHorizontal: -12,
  },
  playButtonContainer: {
    marginHorizontal: 50,
  },
  playButton: {
    borderRadius: 25,
    overflow: 'hidden',
  },
  playButtonGradient: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  playButtonText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1a1a2e',
    letterSpacing: 1,
  },
  gamesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 8,
  },
  gameCardWrapper: {
    flex: 1,
  },
  gameCard: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255,215,0,0.5)',
  },
  gameCardGradient: {
    padding: 10,
    alignItems: 'center',
    minHeight: 150,
    justifyContent: 'space-between',
  },
  gameIconContainer: {
    alignItems: 'center',
    marginBottom: 4,
  },
  gameMainIcon: {
    fontSize: 36,
  },
  gameSubIcon: {
    fontSize: 18,
    marginTop: -4,
  },
  gameName: {
    fontSize: 12,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
    marginVertical: 6,
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  gamePlayButton: {
    borderRadius: 12,
    overflow: 'hidden',
    width: '100%',
  },
  gamePlayGradient: {
    paddingVertical: 6,
    alignItems: 'center',
  },
  gamePlayText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#1a1a2e',
  },
  bottomSection: {
    alignItems: 'flex-end',
    marginTop: 8,
    paddingRight: 8,
  },
  bottomBall: {
    fontSize: 60,
    opacity: 0.9,
  },
  soundControls: {
    position: 'absolute',
    top: 50,
    right: 12,
    flexDirection: 'row',
    gap: 8,
  },
  soundBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.4)',
  },
});
