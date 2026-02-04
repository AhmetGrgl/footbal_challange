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
              <Text style={styles.settingsIcon}>⚙️</Text>
            </View>
          </Animatable.View>

          {/* Stats Card - Green with Golden Border */}
          <Animatable.View animation="fadeInUp" duration={1000} delay={200}>
            <View style={styles.statsCardOuter}>
              <LinearGradient
                colors={['#2E7D32', '#1B5E20', '#0D3B10']}
                style={styles.statsCard}
              >
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
                    colors={['#4CAF50', '#388E3C', '#2E7D32']}
                    style={styles.playButtonGradient}
                  >
                    <Text style={styles.playButtonText}>Şimdi Oyna</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </LinearGradient>
            </View>
          </Animatable.View>

          {/* Game Cards - First Row (3 small cards) */}
          <View style={styles.gamesRowSmall}>
            {/* Harf Avı - Red */}
            <Animatable.View animation="fadeInUp" delay={400} style={styles.smallCardWrapper}>
              <TouchableOpacity
                style={styles.smallCard}
                onPress={() => handleGamePress('letter-hunt')}
                activeOpacity={0.9}
              >
                <LinearGradient colors={['#D32F2F', '#B71C1C', '#8E0000']} style={styles.smallCardGradient}>
                  <View style={styles.abcBox}>
                    <Text style={styles.abcText}>abc</Text>
                  </View>
                  <Text style={styles.abcLabel}>ABC</Text>
                  <Text style={styles.smallCardName}>Harf Avı</Text>
                  <TouchableOpacity style={styles.hizliBtn} onPress={() => handleGamePress('letter-hunt')}>
                    <LinearGradient colors={['#4CAF50', '#388E3C']} style={styles.hizliBtnGradient}>
                      <Text style={styles.hizliBtnText}>Hızlı Eşleşme</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </LinearGradient>
              </TouchableOpacity>
            </Animatable.View>

            {/* Takım Bağlantısı - Cyan */}
            <Animatable.View animation="fadeInUp" delay={500} style={styles.smallCardWrapper}>
              <TouchableOpacity
                style={styles.smallCard}
                onPress={() => handleGamePress('club-connection')}
                activeOpacity={0.9}
              >
                <LinearGradient colors={['#00ACC1', '#00838F', '#006064']} style={styles.smallCardGradient}>
                  <View style={styles.iconContainer}>
                    <Text style={styles.linkIcon}>🔗</Text>
                    <Text style={styles.ballSmall}>⚽</Text>
                  </View>
                  <Text style={styles.smallCardName}>Takım{'\n'}Bağlantısı</Text>
                  <TouchableOpacity style={styles.hizliBtn} onPress={() => handleGamePress('club-connection')}>
                    <LinearGradient colors={['#4CAF50', '#388E3C']} style={styles.hizliBtnGradient}>
                      <Text style={styles.hizliBtnText}>Hızlı Eşleşme</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </LinearGradient>
              </TouchableOpacity>
            </Animatable.View>

            {/* Futbol Tablosu - Orange */}
            <Animatable.View animation="fadeInUp" delay={600} style={styles.smallCardWrapper}>
              <TouchableOpacity
                style={styles.smallCard}
                onPress={() => handleGamePress('football-grid')}
                activeOpacity={0.9}
              >
                <LinearGradient colors={['#FF9800', '#F57C00', '#E65100']} style={styles.smallCardGradient}>
                  <View style={styles.iconContainer}>
                    <Text style={styles.lightning}>⚡</Text>
                    <Text style={styles.trophySmall}>🏆</Text>
                  </View>
                  <Text style={styles.smallCardName}>Futbol{'\n'}Tablosu</Text>
                  <TouchableOpacity style={styles.hizliBtn} onPress={() => handleGamePress('football-grid')}>
                    <LinearGradient colors={['#4CAF50', '#388E3C']} style={styles.hizliBtnGradient}>
                      <Text style={styles.hizliBtnText}>Hızlı Eşleşme</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </LinearGradient>
              </TouchableOpacity>
            </Animatable.View>
          </View>

          {/* Game Cards - Second Row (2 big cards) */}
          <View style={styles.gamesRowBig}>
            {/* Gizli Oyuncu - Purple */}
            <Animatable.View animation="fadeInUp" delay={700} style={styles.bigCardWrapper}>
              <TouchableOpacity
                style={styles.bigCard}
                onPress={() => handleGamePress('mystery-player')}
                activeOpacity={0.9}
              >
                <LinearGradient colors={['#9C27B0', '#7B1FA2', '#4A148C']} style={styles.bigCardGradient}>
                  <View style={styles.bigIconArea}>
                    <Text style={styles.questionBig}>❓</Text>
                    <Text style={styles.personIcon}>👤</Text>
                    <Text style={styles.questionSmall}>❓</Text>
                  </View>
                  <Text style={styles.bigCardName}>Gizli Oyuncu</Text>
                  <TouchableOpacity style={styles.hizliBtnBig} onPress={() => handleGamePress('mystery-player')}>
                    <LinearGradient colors={['#4CAF50', '#388E3C']} style={styles.hizliBtnGradient}>
                      <Text style={styles.hizliBtnText}>Hızlı Eşleşme</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </LinearGradient>
              </TouchableOpacity>
            </Animatable.View>

            {/* Değer Tahmini - Green with money */}
            <Animatable.View animation="fadeInUp" delay={800} style={styles.bigCardWrapper}>
              <TouchableOpacity
                style={styles.bigCard}
                onPress={() => handleGamePress('value-guess')}
                activeOpacity={0.9}
              >
                <LinearGradient colors={['#43A047', '#388E3C', '#2E7D32']} style={styles.bigCardGradient}>
                  <View style={styles.bigIconArea}>
                    <Text style={styles.moneyBag}>💰</Text>
                    <Text style={styles.dollar}>$</Text>
                    <Text style={styles.coinsRow}>🪙🪙🪙</Text>
                  </View>
                  <Text style={styles.bigCardName}>Değer Tahmini</Text>
                  <TouchableOpacity style={styles.hizliBtnBig} onPress={() => handleGamePress('value-guess')}>
                    <LinearGradient colors={['#4CAF50', '#388E3C']} style={styles.hizliBtnGradient}>
                      <Text style={styles.hizliBtnText}>Hızlı Eşleşme</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </LinearGradient>
              </TouchableOpacity>
            </Animatable.View>
          </View>

          {/* Kariyer Yolu - Full width card */}
          <Animatable.View animation="fadeInUp" delay={900} style={styles.fullCardWrapper}>
            <TouchableOpacity
              style={styles.fullCard}
              onPress={() => handleGamePress('career-path')}
              activeOpacity={0.9}
            >
              <LinearGradient colors={['#5D4037', '#4E342E', '#3E2723']} style={styles.fullCardGradient}>
                <View style={styles.fullCardContent}>
                  <View style={styles.fullIconArea}>
                    <Text style={styles.briefcaseBig}>💼</Text>
                    <Text style={styles.chartIcon}>📈</Text>
                    <Text style={styles.moneyIcon}>💵</Text>
                  </View>
                  <View style={styles.fullCardTextArea}>
                    <Text style={styles.fullCardName}>Kariyer Yolu</Text>
                    <TouchableOpacity style={styles.hizliBtnFull} onPress={() => handleGamePress('career-path')}>
                      <LinearGradient colors={['#4CAF50', '#388E3C']} style={styles.hizliBtnGradient}>
                        <Text style={styles.hizliBtnText}>Hızlı Eşleşme</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </Animatable.View>

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
    backgroundColor: 'rgba(0, 10, 5, 0.4)',
  },
  scrollContent: {
    paddingHorizontal: 12,
    paddingTop: 45,
    paddingBottom: 100,
  },
  header: {
    alignItems: 'center',
    marginBottom: 12,
  },
  welcomeText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  userName: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFD700',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 6,
  },
  settingsIcon: {
    fontSize: 24,
  },
  // Stats Card
  statsCardOuter: {
    borderRadius: 16,
    borderWidth: 3,
    borderColor: '#FFD700',
    overflow: 'hidden',
    marginBottom: 12,
  },
  statsCard: {
    padding: 14,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 10,
  },
  statItem: {
    alignItems: 'center',
  },
  trophyEmoji: {
    fontSize: 44,
  },
  statValueLarge: {
    fontSize: 36,
    fontWeight: '900',
    color: '#FFD700',
  },
  statLabel: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  statLabelGold: {
    fontSize: 14,
    color: '#FFD700',
    fontWeight: '700',
  },
  playButton: {
    marginHorizontal: 30,
    borderRadius: 20,
    overflow: 'hidden',
  },
  playButtonGradient: {
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 20,
  },
  playButtonText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
  },
  // Small Cards Row
  gamesRowSmall: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    gap: 8,
  },
  smallCardWrapper: {
    flex: 1,
  },
  smallCard: {
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255,215,0,0.5)',
  },
  smallCardGradient: {
    padding: 10,
    alignItems: 'center',
    minHeight: 140,
    justifyContent: 'space-between',
  },
  abcBox: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  abcText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#333',
  },
  abcLabel: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFA000',
    marginTop: 2,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
  },
  linkIcon: {
    fontSize: 30,
  },
  ballSmall: {
    fontSize: 18,
    marginTop: -5,
  },
  lightning: {
    fontSize: 32,
  },
  trophySmall: {
    fontSize: 22,
    marginTop: -8,
  },
  smallCardName: {
    fontSize: 11,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
    lineHeight: 14,
  },
  hizliBtn: {
    borderRadius: 10,
    overflow: 'hidden',
    width: '100%',
    marginTop: 4,
  },
  hizliBtnGradient: {
    paddingVertical: 6,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  hizliBtnText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#fff',
  },
  // Big Cards Row
  gamesRowBig: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    gap: 10,
  },
  bigCardWrapper: {
    flex: 1,
  },
  bigCard: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255,215,0,0.5)',
  },
  bigCardGradient: {
    padding: 12,
    alignItems: 'center',
    minHeight: 160,
    justifyContent: 'space-between',
  },
  bigIconArea: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 70,
    position: 'relative',
  },
  questionBig: {
    fontSize: 24,
    position: 'absolute',
    top: -5,
    left: 10,
  },
  personIcon: {
    fontSize: 50,
    opacity: 0.9,
  },
  questionSmall: {
    fontSize: 20,
    position: 'absolute',
    bottom: 5,
    right: 10,
  },
  moneyBag: {
    fontSize: 55,
  },
  dollar: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFD700',
    position: 'absolute',
    top: 5,
    left: 15,
  },
  coinsRow: {
    fontSize: 14,
    position: 'absolute',
    bottom: -5,
  },
  bigCardName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
  },
  hizliBtnBig: {
    borderRadius: 12,
    overflow: 'hidden',
    width: '100%',
    marginTop: 6,
  },
  // Full Width Card
  fullCardWrapper: {
    marginBottom: 10,
  },
  fullCard: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255,215,0,0.5)',
  },
  fullCardGradient: {
    padding: 14,
  },
  fullCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fullIconArea: {
    width: 100,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  briefcaseBig: {
    fontSize: 50,
  },
  chartIcon: {
    fontSize: 24,
    position: 'absolute',
    top: 0,
    right: 10,
  },
  moneyIcon: {
    fontSize: 20,
    position: 'absolute',
    bottom: 5,
    left: 10,
  },
  fullCardTextArea: {
    flex: 1,
    marginLeft: 10,
  },
  fullCardName: {
    fontSize: 18,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 10,
  },
  hizliBtnFull: {
    borderRadius: 12,
    overflow: 'hidden',
    width: 130,
  },
});
