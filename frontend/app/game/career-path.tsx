import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput, 
  ScrollView, 
  ActivityIndicator,
  Animated,
  Dimensions,
  Vibration,
  Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { api } from '../../services/api';
import { useSounds } from '../../contexts/SoundContext';

const { width, height } = Dimensions.get('window');

// Neon renkleri
const NEON_COLORS = {
  cyan: '#00FFFF',
  pink: '#FF00FF',
  green: '#00FF88',
  yellow: '#FFFF00',
  orange: '#FF6B35',
  purple: '#9D4EDD',
  blue: '#00D4FF',
};

export default function CareerPathGame() {
  const router = useRouter();
  const { playClick } = useSounds();
  
  // Oyun durumu
  const [player, setPlayer] = useState<any>(null);
  const [revealedClubs, setRevealedClubs] = useState<number>(1);
  const [lives, setLives] = useState(5);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [correctGuesses, setCorrectGuesses] = useState(0);
  const [totalGames, setTotalGames] = useState(0);
  const [guess, setGuess] = useState('');
  const [gameState, setGameState] = useState<'playing' | 'correct' | 'wrong' | 'gameover' | 'leaderboard'>('playing');
  const [loading, setLoading] = useState(true);
  const [hints, setHints] = useState<string[]>([]);
  const [showHints, setShowHints] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [allPlayers, setAllPlayers] = useState<any[]>([]);
  const [filteredPlayers, setFilteredPlayers] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // Leaderboard
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [myStats, setMyStats] = useState<any>(null);
  const [scoreResult, setScoreResult] = useState<any>(null);
  const [submittingScore, setSubmittingScore] = useState(false);
  
  // Animasyonlar
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  // Neon glow animasyonu
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: false,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, []);
  
  // Fade in animasyonu
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);
  
  // Oyuncuları yükle
  useEffect(() => {
    loadGame();
    loadAllPlayers();
  }, []);
  
  const loadAllPlayers = async () => {
    try {
      const players = await api.getCareerPathPlayers();
      setAllPlayers(players);
    } catch (error) {
      console.error('Error loading players:', error);
    }
  };
  
  const loadGame = async () => {
    setLoading(true);
    try {
      const randomPlayer = await api.getCareerPathRandomPlayer();
      setPlayer(randomPlayer);
      setRevealedClubs(1);
      setHints([]);
      setShowHints(false);
      setHintsUsed(0);
      setGuess('');
      setGameState('playing');
      
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    } catch (error) {
      console.error('Error loading player:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Arama filtresi
  const handleGuessChange = (text: string) => {
    setGuess(text);
    if (text.length >= 2) {
      const filtered = allPlayers.filter(p => 
        p.name.toLowerCase().includes(text.toLowerCase())
      ).slice(0, 5);
      setFilteredPlayers(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };
  
  const selectSuggestion = (name: string) => {
    setGuess(name);
    setShowSuggestions(false);
  };
  
  // Titreme animasyonu
  const triggerShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
    
    if (Platform.OS !== 'web') {
      Vibration.vibrate(200);
    }
  };
  
  // Tahmin kontrolü
  const handleGuess = async () => {
    if (!guess.trim() || !player) return;
    
    playClick();
    
    const isCorrect = guess.toLowerCase().trim() === player.name.toLowerCase();
    
    if (isCorrect) {
      // Doğru cevap!
      setGameState('correct');
      const pointsEarned = Math.max(100 - (revealedClubs - 1) * 15, 20) * (streak + 1);
      setScore(prev => prev + pointsEarned);
      const newStreak = streak + 1;
      setStreak(newStreak);
      setCorrectGuesses(prev => prev + 1);
      setTotalGames(prev => prev + 1);
      
      // En iyi seriyi güncelle
      if (newStreak > bestStreak) {
        setBestStreak(newStreak);
      }
      
      // 2 saniye sonra yeni oyuncu
      setTimeout(() => {
        loadGame();
      }, 2500);
    } else {
      // Yanlış cevap
      triggerShake();
      setLives(prev => prev - 1);
      setStreak(0);
      
      // İpucu ver
      const newHints = [];
      const guessedPlayer = allPlayers.find(p => p.name.toLowerCase() === guess.toLowerCase().trim());
      
      if (guessedPlayer) {
        // Aynı ülkeden mi kontrol et
        if (player.nationality === guessedPlayer.nationality) {
          newHints.push(`✅ Ülke doğru: ${player.nationality}`);
        }
        // Pozisyon kontrolü - basitleştirilmiş
        newHints.push(`💡 Pozisyon: ${player.position}`);
      }
      
      setHints(prev => [...prev, ...newHints]);
      
      // Bir kulüp daha aç
      if (revealedClubs < (player.team_history?.length || 1)) {
        setRevealedClubs(prev => prev + 1);
      }
      
      if (lives <= 1) {
        // Oyun bitti - skoru gönder
        handleGameOver();
      } else {
        setGameState('wrong');
        setTimeout(() => setGameState('playing'), 1500);
      }
      
      setGuess('');
    }
  };
  
  // Oyun bitti - skoru gönder
  const handleGameOver = async () => {
    setGameState('gameover');
    setSubmittingScore(true);
    
    try {
      // Skoru backend'e gönder
      const result = await api.submitCareerPathScore(score, correctGuesses, totalGames, bestStreak);
      setScoreResult(result);
      
      // Leaderboard'u yükle
      const lb = await api.getCareerPathLeaderboard(20);
      setLeaderboard(lb);
      
      // Kendi istatistiklerimi yükle
      const stats = await api.getCareerPathMyStats();
      setMyStats(stats);
    } catch (error) {
      console.error('Skor gönderilemedi:', error);
    } finally {
      setSubmittingScore(false);
    }
  };
  
  // Leaderboard'u göster
  const showLeaderboardScreen = async () => {
    setLoading(true);
    try {
      const lb = await api.getCareerPathLeaderboard(50);
      setLeaderboard(lb);
      const stats = await api.getCareerPathMyStats();
      setMyStats(stats);
      setGameState('leaderboard');
    } catch (error) {
      console.error('Leaderboard yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Yeni oyun başlat
  const startNewGame = () => {
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setCorrectGuesses(0);
    setTotalGames(0);
    setLives(5);
    setScoreResult(null);
    loadGame();
  };
  
  // İpucu aç
  const revealHint = () => {
    if (!player || hintsUsed >= 3) return;
    
    playClick();
    const availableHints = [];
    
    if (hintsUsed === 0) {
      availableHints.push(`🌍 Ülke: ${player.nationality}`);
    } else if (hintsUsed === 1) {
      availableHints.push(`⚽ Pozisyon: ${player.position}`);
    } else if (hintsUsed === 2) {
      availableHints.push(`📅 Yaş: ${player.age}`);
    }
    
    setHints(prev => [...prev, ...availableHints]);
    setHintsUsed(prev => prev + 1);
    setShowHints(true);
  };
  
  // Kulüp kartını render et
  const renderClubCard = (club: any, index: number, isRevealed: boolean) => {
    const cardOpacity = isRevealed ? 1 : 0.3;
    
    return (
      <Animated.View
        key={index}
        style={[
          styles.clubCard,
          { opacity: cardOpacity },
          isRevealed && styles.clubCardRevealed,
        ]}
      >
        <LinearGradient
          colors={isRevealed 
            ? ['rgba(0,255,255,0.15)', 'rgba(0,212,255,0.05)'] 
            : ['rgba(50,50,50,0.5)', 'rgba(30,30,30,0.5)']}
          style={styles.clubCardGradient}
        >
          {/* Sol çizgi - Neon */}
          <View style={[styles.clubLine, isRevealed && styles.clubLineActive]} />
          
          {/* Kulüp bilgisi */}
          <View style={styles.clubInfo}>
            <Text style={[styles.clubEmoji, !isRevealed && styles.hidden]}>
              {isRevealed ? club.logo : '❓'}
            </Text>
            <View style={styles.clubTextContainer}>
              <Text style={[styles.clubName, !isRevealed && styles.hiddenText]}>
                {isRevealed ? club.team : '???'}
              </Text>
              <Text style={[styles.clubYears, !isRevealed && styles.hiddenText]}>
                {isRevealed ? club.years : '????-????'}
              </Text>
            </View>
          </View>
          
          {/* Sıra numarası */}
          <View style={[styles.clubNumber, isRevealed && styles.clubNumberActive]}>
            <Text style={styles.clubNumberText}>{index + 1}</Text>
          </View>
        </LinearGradient>
      </Animated.View>
    );
  };
  
  // Can ikonları
  const renderLives = () => {
    return (
      <View style={styles.livesContainer}>
        {[...Array(5)].map((_, i) => (
          <Text key={i} style={[styles.heartIcon, i >= lives && styles.heartEmpty]}>
            {i < lives ? '❤️' : '🖤'}
          </Text>
        ))}
      </View>
    );
  };
  
  if (loading) {
    return (
      <LinearGradient colors={['#0a0a1a', '#1a1a2e', '#0f0f23']} style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={NEON_COLORS.cyan} />
          <Text style={styles.loadingText}>Oyuncu Yükleniyor...</Text>
        </View>
      </LinearGradient>
    );
  }
  
  return (
    <LinearGradient colors={['#0a0a1a', '#1a1a2e', '#0f0f23']} style={styles.container}>
      {/* Neon arka plan efektleri */}
      <View style={styles.neonBackground}>
        <Animated.View style={[styles.neonCircle1, { opacity: glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.1, 0.3] }) }]} />
        <Animated.View style={[styles.neonCircle2, { opacity: glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.15, 0.25] }) }]} />
      </View>
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => { playClick(); router.back(); }} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={NEON_COLORS.cyan} />
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <Text style={styles.title}>KARİYER YOLU</Text>
          <Text style={styles.subtitle}>🔍 Futbolcuyu Tahmin Et</Text>
        </View>
        
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreLabel}>SKOR</Text>
          <Text style={styles.scoreValue}>{score}</Text>
        </View>
      </View>
      
      {/* Seri ve Canlar */}
      <View style={styles.statsBar}>
        {renderLives()}
        <View style={styles.streakContainer}>
          <Text style={styles.streakText}>🔥 {streak}</Text>
        </View>
      </View>
      
      {/* Oyun Alanı */}
      <Animated.View style={[styles.gameArea, { transform: [{ translateX: shakeAnim }], opacity: fadeAnim }]}>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Soru Kartı */}
          <View style={styles.questionCard}>
            <LinearGradient
              colors={['rgba(0,255,136,0.1)', 'rgba(0,212,255,0.05)']}
              style={styles.questionGradient}
            >
              <Text style={styles.questionEmoji}>🎯</Text>
              <Text style={styles.questionText}>Bu kulüplerde oynayan futbolcu kim?</Text>
              <Text style={styles.revealInfo}>
                {revealedClubs} / {player?.team_history?.length || 0} kulüp gösteriliyor
              </Text>
            </LinearGradient>
          </View>
          
          {/* Kulüp Listesi */}
          <View style={styles.clubsList}>
            {player?.team_history?.map((club: any, index: number) => 
              renderClubCard(club, index, index < revealedClubs)
            )}
          </View>
          
          {/* İpuçları */}
          {hints.length > 0 && (
            <View style={styles.hintsCard}>
              <Text style={styles.hintsTitle}>💡 İpuçları</Text>
              {hints.map((hint, index) => (
                <Text key={index} style={styles.hintText}>{hint}</Text>
              ))}
            </View>
          )}
          
          {/* Doğru/Yanlış Mesajı */}
          {gameState === 'correct' && (
            <View style={styles.resultCard}>
              <LinearGradient colors={['rgba(0,255,136,0.2)', 'rgba(0,255,136,0.05)']} style={styles.resultGradient}>
                <Text style={styles.resultEmoji}>🎉</Text>
                <Text style={styles.resultText}>DOĞRU!</Text>
                <Text style={styles.playerName}>{player?.name}</Text>
              </LinearGradient>
            </View>
          )}
          
          {gameState === 'wrong' && (
            <View style={styles.resultCard}>
              <LinearGradient colors={['rgba(255,0,100,0.2)', 'rgba(255,0,100,0.05)']} style={styles.resultGradient}>
                <Text style={styles.resultEmoji}>❌</Text>
                <Text style={[styles.resultText, { color: NEON_COLORS.pink }]}>YANLIŞ!</Text>
                <Text style={styles.wrongHint}>Bir kulüp daha açıldı...</Text>
              </LinearGradient>
            </View>
          )}
          
          {/* Game Over */}
          {gameState === 'gameover' && (
            <View style={styles.gameOverCard}>
              <LinearGradient colors={['rgba(157,78,221,0.3)', 'rgba(157,78,221,0.1)']} style={styles.gameOverGradient}>
                <Text style={styles.gameOverEmoji}>💀</Text>
                <Text style={styles.gameOverTitle}>OYUN BİTTİ</Text>
                <Text style={styles.gameOverPlayer}>Doğru Cevap: {player?.name}</Text>
                <Text style={styles.finalScore}>Final Skor: {score}</Text>
                
                {/* Skor sonucu */}
                {submittingScore ? (
                  <View style={styles.submittingContainer}>
                    <ActivityIndicator color={NEON_COLORS.cyan} />
                    <Text style={styles.submittingText}>Skor kaydediliyor...</Text>
                  </View>
                ) : scoreResult && (
                  <View style={styles.scoreResultContainer}>
                    {scoreResult.is_new_high_score && (
                      <Text style={styles.newHighScore}>🏆 YENİ REKOR!</Text>
                    )}
                    <Text style={styles.coinsEarned}>💰 +{scoreResult.coins_earned} Coin Kazandın!</Text>
                    <Text style={styles.statsText}>
                      En Yüksek Skor: {scoreResult.high_score}
                    </Text>
                  </View>
                )}
                
                <View style={styles.gameOverButtons}>
                  <TouchableOpacity style={styles.retryButton} onPress={startNewGame}>
                    <LinearGradient colors={[NEON_COLORS.green, '#00AA66']} style={styles.retryGradient}>
                      <Text style={styles.retryText}>🔄 Tekrar Oyna</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={styles.leaderboardButton} onPress={showLeaderboardScreen}>
                    <LinearGradient colors={[NEON_COLORS.yellow, '#FFB800']} style={styles.retryGradient}>
                      <Text style={styles.leaderboardButtonText}>🏆 Liderlik Tablosu</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={styles.menuButton} onPress={() => router.back()}>
                    <Text style={styles.menuText}>🏠 Ana Menü</Text>
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            </View>
          )}
          
          {/* Leaderboard Ekranı */}
          {gameState === 'leaderboard' && (
            <View style={styles.leaderboardCard}>
              <LinearGradient colors={['rgba(0,212,255,0.2)', 'rgba(0,255,136,0.1)']} style={styles.leaderboardGradient}>
                <Text style={styles.leaderboardTitle}>🏆 LİDERLİK TABLOSU</Text>
                
                {/* Kendi sıralaman */}
                {myStats && (
                  <View style={styles.myRankContainer}>
                    <Text style={styles.myRankText}>
                      Senin Sıran: #{myStats.rank} | En Yüksek: {myStats.stats.high_score}
                    </Text>
                  </View>
                )}
                
                {/* Top 20 */}
                <ScrollView style={styles.leaderboardList} showsVerticalScrollIndicator={false}>
                  {leaderboard.map((user, index) => (
                    <View key={user.user_id || index} style={[
                      styles.leaderboardItem,
                      index === 0 && styles.leaderboardItemFirst,
                      index === 1 && styles.leaderboardItemSecond,
                      index === 2 && styles.leaderboardItemThird,
                    ]}>
                      <Text style={styles.leaderboardRank}>
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${user.rank}`}
                      </Text>
                      <Text style={styles.leaderboardAvatar}>{user.avatar || '⚽'}</Text>
                      <View style={styles.leaderboardUserInfo}>
                        <Text style={styles.leaderboardUsername}>{user.username}</Text>
                        <Text style={styles.leaderboardStats}>
                          🔥 {user.best_streak} | ✅ {user.correct_guesses}
                        </Text>
                      </View>
                      <Text style={styles.leaderboardScore}>{user.high_score}</Text>
                    </View>
                  ))}
                </ScrollView>
                
                <View style={styles.leaderboardButtons}>
                  <TouchableOpacity style={styles.retryButton} onPress={startNewGame}>
                    <LinearGradient colors={[NEON_COLORS.green, '#00AA66']} style={styles.retryGradient}>
                      <Text style={styles.retryText}>🎮 Oyna</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={styles.menuButton} onPress={() => router.back()}>
                    <Text style={styles.menuText}>🏠 Ana Menü</Text>
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            </View>
          )}
          
        </ScrollView>
      </Animated.View>
      
      {/* Alt Giriş Alanı */}
      {gameState === 'playing' && (
        <View style={styles.inputArea}>
          {/* İpucu Butonu */}
          <TouchableOpacity 
            style={[styles.hintButton, hintsUsed >= 3 && styles.hintButtonDisabled]}
            onPress={revealHint}
            disabled={hintsUsed >= 3}
          >
            <Ionicons name="bulb" size={24} color={hintsUsed >= 3 ? '#444' : NEON_COLORS.yellow} />
            <Text style={[styles.hintButtonText, hintsUsed >= 3 && styles.hintButtonTextDisabled]}>
              {3 - hintsUsed}
            </Text>
          </TouchableOpacity>
          
          {/* Giriş Alanı */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Futbolcu adını yazın..."
              placeholderTextColor="#666"
              value={guess}
              onChangeText={handleGuessChange}
              onSubmitEditing={handleGuess}
              autoCapitalize="words"
            />
            
            {/* Öneriler */}
            {showSuggestions && filteredPlayers.length > 0 && (
              <View style={styles.suggestionsContainer}>
                {filteredPlayers.map((p, index) => (
                  <TouchableOpacity 
                    key={index} 
                    style={styles.suggestionItem}
                    onPress={() => selectSuggestion(p.name)}
                  >
                    <Text style={styles.suggestionText}>{p.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
          
          {/* Tahmin Butonu */}
          <TouchableOpacity style={styles.guessButton} onPress={handleGuess}>
            <LinearGradient colors={[NEON_COLORS.cyan, NEON_COLORS.blue]} style={styles.guessGradient}>
              <Ionicons name="send" size={24} color="#000" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  neonBackground: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  neonCircle1: {
    position: 'absolute',
    top: -100,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: NEON_COLORS.cyan,
  },
  neonCircle2: {
    position: 'absolute',
    bottom: -150,
    left: -100,
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: NEON_COLORS.purple,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: NEON_COLORS.cyan,
    fontSize: 16,
    marginTop: 16,
    fontWeight: '600',
  },
  
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,255,255,0.3)',
  },
  headerCenter: {
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: NEON_COLORS.cyan,
    letterSpacing: 2,
    textShadowColor: NEON_COLORS.cyan,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  subtitle: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  scoreContainer: {
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 10,
    color: '#666',
    fontWeight: '600',
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: '900',
    color: NEON_COLORS.green,
    textShadowColor: NEON_COLORS.green,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  
  // Stats Bar
  statsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  livesContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  heartIcon: {
    fontSize: 22,
  },
  heartEmpty: {
    opacity: 0.4,
  },
  streakContainer: {
    backgroundColor: 'rgba(255,107,53,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,107,53,0.4)',
  },
  streakText: {
    color: NEON_COLORS.orange,
    fontSize: 16,
    fontWeight: '700',
  },
  
  // Game Area
  gameArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  
  // Question Card
  questionCard: {
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0,255,136,0.3)',
  },
  questionGradient: {
    padding: 20,
    alignItems: 'center',
  },
  questionEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
  },
  revealInfo: {
    fontSize: 12,
    color: NEON_COLORS.cyan,
    marginTop: 8,
  },
  
  // Club Cards
  clubsList: {
    gap: 12,
    marginBottom: 20,
  },
  clubCard: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  clubCardRevealed: {
    borderWidth: 1,
    borderColor: 'rgba(0,255,255,0.3)',
  },
  clubCardGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  clubLine: {
    width: 4,
    height: '100%',
    backgroundColor: '#333',
    borderRadius: 2,
    marginRight: 14,
  },
  clubLineActive: {
    backgroundColor: NEON_COLORS.cyan,
    shadowColor: NEON_COLORS.cyan,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },
  clubInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  clubEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  hidden: {
    opacity: 0.3,
  },
  clubTextContainer: {
    flex: 1,
  },
  clubName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  hiddenText: {
    color: '#444',
  },
  clubYears: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  clubNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#222',
    justifyContent: 'center',
    alignItems: 'center',
  },
  clubNumberActive: {
    backgroundColor: 'rgba(0,255,255,0.2)',
    borderWidth: 1,
    borderColor: NEON_COLORS.cyan,
  },
  clubNumberText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  
  // Hints Card
  hintsCard: {
    backgroundColor: 'rgba(255,255,0,0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,0,0.3)',
  },
  hintsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: NEON_COLORS.yellow,
    marginBottom: 10,
  },
  hintText: {
    fontSize: 14,
    color: '#ccc',
    marginBottom: 4,
  },
  
  // Result Cards
  resultCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
  },
  resultGradient: {
    padding: 24,
    alignItems: 'center',
  },
  resultEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  resultText: {
    fontSize: 28,
    fontWeight: '900',
    color: NEON_COLORS.green,
    textShadowColor: NEON_COLORS.green,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  playerName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginTop: 8,
  },
  wrongHint: {
    fontSize: 14,
    color: '#aaa',
    marginTop: 8,
  },
  
  // Game Over
  gameOverCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  gameOverGradient: {
    padding: 30,
    alignItems: 'center',
  },
  gameOverEmoji: {
    fontSize: 64,
    marginBottom: 12,
  },
  gameOverTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: NEON_COLORS.purple,
    marginBottom: 16,
  },
  gameOverPlayer: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 8,
  },
  finalScore: {
    fontSize: 24,
    fontWeight: '700',
    color: NEON_COLORS.green,
    marginBottom: 24,
  },
  gameOverButtons: {
    gap: 12,
    width: '100%',
  },
  retryButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  retryGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  retryText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  menuButton: {
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#444',
    borderRadius: 12,
  },
  menuText: {
    fontSize: 16,
    color: '#888',
  },
  
  // Input Area
  inputArea: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 30,
    backgroundColor: 'rgba(10,10,26,0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,255,255,0.2)',
    gap: 12,
  },
  hintButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,0,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,0,0.3)',
  },
  hintButtonDisabled: {
    backgroundColor: 'rgba(50,50,50,0.5)',
    borderColor: '#333',
  },
  hintButtonText: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    fontSize: 10,
    fontWeight: '700',
    color: NEON_COLORS.yellow,
  },
  hintButtonTextDisabled: {
    color: '#444',
  },
  inputContainer: {
    flex: 1,
    position: 'relative',
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 14,
    fontSize: 16,
    color: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(0,255,255,0.3)',
  },
  suggestionsContainer: {
    position: 'absolute',
    bottom: '100%',
    left: 0,
    right: 0,
    backgroundColor: 'rgba(20,20,40,0.98)',
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,255,255,0.3)',
    overflow: 'hidden',
  },
  suggestionItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  suggestionText: {
    color: '#fff',
    fontSize: 14,
  },
  guessButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
  },
  guessGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
