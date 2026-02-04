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

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const { playClick } = useSounds();
  
  const [pulseAnim] = useState(new Animated.Value(1));

  useEffect(() => {
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
  }, []);

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
          {/* Header - Hoş Geldiniz */}
          <Animatable.View animation="fadeInDown" duration={1000} style={styles.header}>
            <Text style={styles.welcomeText}>Hoş Geldiniz</Text>
            <View style={styles.nameRow}>
              <Text style={styles.userName}>{user?.name || 'Futbolcu'}</Text>
              <Text style={styles.ballEmoji}>⚽</Text>
            </View>
          </Animatable.View>

          {/* Stats Card - Exactly like the image */}
          <Animatable.View animation="fadeInUp" duration={1000} delay={200}>
            <LinearGradient
              colors={['#4CAF50', '#388E3C', '#2E7D32']}
              style={styles.statsCard}
            >
              {/* Golden glow border effect */}
              <View style={styles.statsInnerBorder}>
                {/* Stats Row */}
                <View style={styles.statsRow}>
                  {/* Kazanç with Trophy */}
                  <View style={styles.statItem}>
                    <Text style={styles.trophyEmoji}>🏆</Text>
                    <Text style={styles.statLabelGold}>Kazanç</Text>
                  </View>

                  {/* Kayıp */}
                  <View style={styles.statItem}>
                    <Text style={styles.statValueLarge}>{user?.stats?.losses || 0}</Text>
                    <Text style={styles.statLabel}>Kayıp</Text>
                  </View>

                  {/* Toplam Oyun */}
                  <View style={styles.statItem}>
                    <Text style={styles.statValueLarge}>{user?.stats?.total_games || 0}</Text>
                    <Text style={styles.statLabel}>Toplam Oyun</Text>
                  </View>
                </View>

                {/* Şimdi Oyna Button */}
                <TouchableOpacity 
                  style={styles.playButton}
                  onPress={() => {
                    playClick();
                    router.push('/game/mystery-player');
                  }}
                  activeOpacity={0.9}
                >
                  <LinearGradient
                    colors={['#4CAF50', '#388E3C']}
                    style={styles.playButtonGradient}
                  >
                    <Text style={styles.playButtonText}>Şimdi Oyna</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </Animatable.View>

          {/* Game Cards Row - First 3 */}
          <View style={styles.gamesRow}>
            {/* Değer Tahmini */}
            <Animatable.View animation="fadeInUp" delay={400} style={styles.gameCardWrapper}>
              <TouchableOpacity
                style={styles.gameCard}
                onPress={() => handleGamePress('value-guess')}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={['#4CAF50', '#388E3C', '#1B5E20']}
                  style={styles.gameCardGradient}
                >
                  <View style={styles.gameImageArea}>
                    <Text style={styles.moneyBag}>💰</Text>
                    <Text style={styles.euroSign}>€</Text>
                    <Text style={styles.coins}>🪙🪙🪙</Text>
                  </View>
                  <Text style={styles.gameName}>Değer Tahmini</Text>
                  <TouchableOpacity style={styles.gamePlayBtn} onPress={() => handleGamePress('value-guess')}>
                    <LinearGradient colors={['#00E676', '#00C853']} style={styles.gamePlayGradient}>
                      <Text style={styles.gamePlayText}>Şimdi Oyna</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </LinearGradient>
              </TouchableOpacity>
            </Animatable.View>

            {/* Gizli Oyuncu */}
            <Animatable.View animation="fadeInUp" delay={500} style={styles.gameCardWrapper}>
              <TouchableOpacity
                style={styles.gameCard}
                onPress={() => handleGamePress('mystery-player')}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={['#9C27B0', '#7B1FA2', '#4A148C']}
                  style={styles.gameCardGradient}
                >
                  <View style={styles.gameImageArea}>
                    <Text style={styles.questionMark}>❓</Text>
                    <Text style={styles.silhouette}>👤</Text>
                    <View style={styles.questionMarksRow}>
                      <Text style={styles.smallQuestion}>❓</Text>
                      <Text style={styles.smallQuestion}>❓</Text>
                    </View>
                  </View>
                  <Text style={styles.gameName}>Gizli Oyuncu</Text>
                  <TouchableOpacity style={styles.gamePlayBtn} onPress={() => handleGamePress('mystery-player')}>
                    <LinearGradient colors={['#00E676', '#00C853']} style={styles.gamePlayGradient}>
                      <Text style={styles.gamePlayText}>Şimdi Oyna</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </LinearGradient>
              </TouchableOpacity>
            </Animatable.View>

            {/* Kariyer Yolu */}
            <Animatable.View animation="fadeInUp" delay={600} style={styles.gameCardWrapper}>
              <TouchableOpacity
                style={styles.gameCard}
                onPress={() => handleGamePress('career-path')}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={['#4CAF50', '#388E3C', '#1B5E20']}
                  style={styles.gameCardGradient}
                >
                  <View style={styles.gameImageArea}>
                    <Text style={styles.briefcase}>💼</Text>
                    <Text style={styles.chart}>📈</Text>
                    <Text style={styles.moneyStack}>💵</Text>
                  </View>
                  <Text style={styles.gameName}>Kariyer Yolu</Text>
                  <TouchableOpacity style={styles.gamePlayBtn} onPress={() => handleGamePress('career-path')}>
                    <LinearGradient colors={['#00E676', '#00C853']} style={styles.gamePlayGradient}>
                      <Text style={styles.gamePlayText}>Şimdi Oyna</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </LinearGradient>
              </TouchableOpacity>
            </Animatable.View>
          </View>

          {/* Game Cards Row - Second 3 */}
          <View style={styles.gamesRow}>
            {/* Harf Avı */}
            <Animatable.View animation="fadeInUp" delay={700} style={styles.gameCardWrapper}>
              <TouchableOpacity
                style={styles.gameCard}
                onPress={() => handleGamePress('letter-hunt')}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={['#F44336', '#D32F2F', '#B71C1C']}
                  style={styles.gameCardGradient}
                >
                  <View style={styles.gameImageArea}>
                    <Text style={styles.letters}>🔤</Text>
                    <Text style={styles.abc}>ABC</Text>
                  </View>
                  <Text style={styles.gameName}>Harf Avı</Text>
                  <TouchableOpacity style={styles.gamePlayBtn} onPress={() => handleGamePress('letter-hunt')}>
                    <LinearGradient colors={['#00E676', '#00C853']} style={styles.gamePlayGradient}>
                      <Text style={styles.gamePlayText}>Şimdi Oyna</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </LinearGradient>
              </TouchableOpacity>
            </Animatable.View>

            {/* Takım Bağlantısı */}
            <Animatable.View animation="fadeInUp" delay={800} style={styles.gameCardWrapper}>
              <TouchableOpacity
                style={styles.gameCard}
                onPress={() => handleGamePress('club-connection')}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={['#00BCD4', '#00ACC1', '#00838F']}
                  style={styles.gameCardGradient}
                >
                  <View style={styles.gameImageArea}>
                    <Text style={styles.link}>🔗</Text>
                    <Text style={styles.football}>⚽</Text>
                  </View>
                  <Text style={styles.gameName}>Takım Bağlantısı</Text>
                  <TouchableOpacity style={styles.gamePlayBtn} onPress={() => handleGamePress('club-connection')}>
                    <LinearGradient colors={['#00E676', '#00C853']} style={styles.gamePlayGradient}>
                      <Text style={styles.gamePlayText}>Şimdi Oyna</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </LinearGradient>
              </TouchableOpacity>
            </Animatable.View>

            {/* Futbol Tablosu */}
            <Animatable.View animation="fadeInUp" delay={900} style={styles.gameCardWrapper}>
              <TouchableOpacity
                style={styles.gameCard}
                onPress={() => handleGamePress('football-grid')}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={['#FF9800', '#F57C00', '#E65100']}
                  style={styles.gameCardGradient}
                >
                  <View style={styles.gameImageArea}>
                    <Text style={styles.lightning}>⚡</Text>
                    <Text style={styles.trophy}>🏆</Text>
                  </View>
                  <Text style={styles.gameName}>Futbol Tablosu</Text>
                  <TouchableOpacity style={styles.gamePlayBtn} onPress={() => handleGamePress('football-grid')}>
                    <LinearGradient colors={['#00E676', '#00C853']} style={styles.gamePlayGradient}>
                      <Text style={styles.gamePlayText}>Şimdi Oyna</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </LinearGradient>
              </TouchableOpacity>
            </Animatable.View>
          </View>

          {/* Bottom Football */}
          <View style={styles.bottomSection}>
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
  },
  scrollContent: {
    paddingHorizontal: 12,
    paddingTop: 40,
    paddingBottom: 100,
  },
  header: {
    alignItems: 'center',
    marginBottom: 12,
  },
  welcomeText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  userName: {
    fontSize: 36,
    fontWeight: '900',
    color: '#FFD700',
    textShadowColor: 'rgba(0,0,0,0.9)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 8,
  },
  ballEmoji: {
    fontSize: 36,
  },
  // Stats Card - Like the image
  statsCard: {
    borderRadius: 24,
    padding: 4,
    marginBottom: 16,
    borderWidth: 4,
    borderColor: '#FFD700',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 10,
  },
  statsInnerBorder: {
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 20,
    padding: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 12,
  },
  statItem: {
    alignItems: 'center',
    minWidth: 90,
  },
  trophyEmoji: {
    fontSize: 50,
  },
  statValueLarge: {
    fontSize: 42,
    fontWeight: '900',
    color: '#FFD700',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  statLabel: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '700',
    marginTop: 4,
  },
  statLabelGold: {
    fontSize: 16,
    color: '#FFD700',
    fontWeight: '700',
    marginTop: 4,
  },
  playButton: {
    marginHorizontal: 40,
    borderRadius: 25,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  playButtonGradient: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  playButtonText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  // Game Cards
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
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: 'rgba(255,215,0,0.6)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  gameCardGradient: {
    padding: 10,
    alignItems: 'center',
    minHeight: 170,
    justifyContent: 'space-between',
  },
  gameImageArea: {
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  // Değer Tahmini emojis
  moneyBag: {
    fontSize: 50,
    position: 'absolute',
  },
  euroSign: {
    fontSize: 24,
    position: 'absolute',
    bottom: 0,
    left: 10,
    color: '#FFD700',
    fontWeight: 'bold',
  },
  coins: {
    fontSize: 16,
    position: 'absolute',
    bottom: -5,
    right: 5,
  },
  // Gizli Oyuncu emojis
  questionMark: {
    fontSize: 30,
    position: 'absolute',
    top: -5,
  },
  silhouette: {
    fontSize: 50,
    opacity: 0.8,
  },
  questionMarksRow: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 0,
    gap: 30,
  },
  smallQuestion: {
    fontSize: 20,
  },
  // Kariyer Yolu emojis
  briefcase: {
    fontSize: 45,
  },
  chart: {
    fontSize: 24,
    position: 'absolute',
    top: 0,
    right: 5,
  },
  moneyStack: {
    fontSize: 20,
    position: 'absolute',
    bottom: -5,
    left: 5,
  },
  // Harf Avı
  letters: {
    fontSize: 50,
  },
  abc: {
    fontSize: 18,
    color: '#FFD700',
    fontWeight: '900',
    position: 'absolute',
    bottom: -5,
  },
  // Takım Bağlantısı
  link: {
    fontSize: 45,
  },
  football: {
    fontSize: 30,
    position: 'absolute',
    bottom: -10,
    right: 10,
  },
  // Futbol Tablosu
  lightning: {
    fontSize: 45,
  },
  trophy: {
    fontSize: 30,
    position: 'absolute',
    bottom: -5,
  },
  gameName: {
    fontSize: 13,
    fontWeight: '900',
    color: '#fff',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
    marginVertical: 6,
  },
  gamePlayBtn: {
    borderRadius: 15,
    overflow: 'hidden',
    width: '100%',
  },
  gamePlayGradient: {
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 15,
  },
  gamePlayText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1a1a2e',
  },
  bottomSection: {
    alignItems: 'flex-end',
    marginTop: 8,
    paddingRight: 8,
  },
  bottomBall: {
    fontSize: 70,
  },
});
