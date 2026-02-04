import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  Dimensions,
  Vibration,
  Alert,
  ImageBackground,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useSounds } from '../../contexts/SoundContext';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { io, Socket } from 'socket.io-client';
import { api } from '../../services/api';

const HOME_BG = require('../../assets/images/home-bg.jpg');
const { width, height } = Dimensions.get('window');

// Emotes
const EMOTES = ['😎', '😂', '😡', '🔥', '👀', '👏', '🤔', '💪'];

export default function MysteryPlayerGame() {
  const { user } = useAuth();
  const { playClick, playSuccess, playError, playGoal } = useSounds();
  const router = useRouter();
  
  // Game state
  const [gameStatus, setGameStatus] = useState<'searching' | 'matched' | 'playing' | 'round_result' | 'game_over'>('searching');
  const [opponent, setOpponent] = useState<any>(null);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [questionNumber, setQuestionNumber] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(10);
  const [myScore, setMyScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [correctAnswer, setCorrectAnswer] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(15);
  const [combo, setCombo] = useState(0);
  const [showEmotes, setShowEmotes] = useState(false);
  const [receivedEmote, setReceivedEmote] = useState<string | null>(null);
  const [roundResults, setRoundResults] = useState<any>(null);
  const [finalResults, setFinalResults] = useState<any>(null);
  const [jokers, setJokers] = useState({ time_extend: 3, eliminate_two: 3, reveal_letter: 3, skip_question: 2 });
  const [eliminatedOptions, setEliminatedOptions] = useState<string[]>([]);
  
  // Animations
  const timerAnim = useRef(new Animated.Value(1)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const scoreAnim = useRef(new Animated.Value(1)).current;
  
  // Socket ref
  const socketRef = useRef<Socket | null>(null);
  
  useEffect(() => {
    // Connect to socket
    const backendUrl = 'https://career-path-mode.preview.emergentagent.com';
    socketRef.current = io(backendUrl, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });
    
    const socket = socketRef.current;
    
    socket.on('connect', () => {
      console.log('Socket connected');
      // Join matchmaking
      socket.emit('join_matchmaking', {
        game_mode: 'mystery-player',
        user_id: user?.user_id,
        username: user?.username || user?.name
      });
    });
    
    socket.on('searching', (data) => {
      console.log('Searching for match...', data);
      setGameStatus('searching');
    });
    
    socket.on('match_found', (data) => {
      console.log('Match found!', data);
      playGoal();
      setOpponent(data.opponent);
      setRoomId(data.room_id);
      setTotalQuestions(data.total_questions);
      setGameStatus('matched');
    });
    
    socket.on('new_question', (data) => {
      console.log('New question:', data);
      setCurrentQuestion(data);
      setQuestionNumber(data.question_number);
      setSelectedAnswer(null);
      setCorrectAnswer(null);
      setEliminatedOptions([]);
      setTimeLeft(data.time_limit || 15);
      setGameStatus('playing');
      startTimer(data.time_limit || 15);
    });
    
    socket.on('round_results', (data) => {
      console.log('Round results:', data);
      setCorrectAnswer(data.correct_answer);
      setRoundResults(data);
      
      // Update scores
      const myResult = data.player_results.find((p: any) => p.user_id === user?.user_id);
      const oppResult = data.player_results.find((p: any) => p.user_id !== user?.user_id);
      
      if (myResult) {
        setMyScore(data.scores[user?.user_id] || 0);
        setCombo(myResult.combo);
        if (myResult.correct) {
          playSuccess();
          animateScore();
        } else {
          playError();
        }
      }
      if (oppResult) {
        setOpponentScore(data.scores[oppResult.user_id] || 0);
      }
      
      setGameStatus('round_result');
    });
    
    socket.on('game_over', (data) => {
      console.log('Game over:', data);
      setFinalResults(data);
      setGameStatus('game_over');
      
      if (data.winner === user?.user_id) {
        playGoal();
      }
    });
    
    socket.on('emote_received', (data) => {
      setReceivedEmote(data.emote);
      setTimeout(() => setReceivedEmote(null), 2000);
    });
    
    socket.on('joker_used', (data) => {
      if (data.eliminated_options) {
        setEliminatedOptions(data.eliminated_options);
      }
      if (data.extra_time) {
        setTimeLeft(prev => prev + data.extra_time);
      }
    });
    
    socket.on('opponent_disconnected', (data) => {
      Alert.alert('Rakip Ayrıldı', `Rakip bağlantısı kesildi. ${data.wait_time} saniye bekleniyor...`);
    });
    
    return () => {
      if (socketRef.current) {
        socketRef.current.emit('leave_matchmaking', { game_mode: 'mystery-player' });
        socketRef.current.disconnect();
      }
    };
  }, [user]);
  
  // Timer effect
  useEffect(() => {
    if (gameStatus !== 'playing' || timeLeft <= 0) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        // Shake effect when time is low
        if (prev <= 5) {
          Vibration.vibrate(50);
          shakeScreen();
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [gameStatus, timeLeft]);
  
  const startTimer = (seconds: number) => {
    timerAnim.setValue(1);
    Animated.timing(timerAnim, {
      toValue: 0,
      duration: seconds * 1000,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();
  };
  
  const shakeScreen = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };
  
  const animateScore = () => {
    Animated.sequence([
      Animated.timing(scoreAnim, { toValue: 1.3, duration: 200, useNativeDriver: true }),
      Animated.timing(scoreAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
  };
  
  const handleAnswerSelect = (answer: string) => {
    if (selectedAnswer || gameStatus !== 'playing') return;
    
    playClick();
    setSelectedAnswer(answer);
    
    socketRef.current?.emit('submit_answer', {
      room_id: roomId,
      answer,
      user_id: user?.user_id
    });
  };
  
  const useJoker = (jokerType: string) => {
    if (jokers[jokerType as keyof typeof jokers] <= 0) {
      Alert.alert('Joker Yok', 'Bu jokerden kalmadı!');
      return;
    }
    
    playClick();
    setJokers(prev => ({
      ...prev,
      [jokerType]: prev[jokerType as keyof typeof prev] - 1
    }));
    
    socketRef.current?.emit('use_joker', {
      room_id: roomId,
      user_id: user?.user_id,
      joker_type: jokerType
    });
  };
  
  const sendEmote = (emote: string) => {
    playClick();
    setShowEmotes(false);
    socketRef.current?.emit('send_emote', {
      room_id: roomId,
      user_id: user?.user_id,
      emote
    });
  };
  
  const requestRematch = () => {
    playClick();
    socketRef.current?.emit('request_rematch', {
      room_id: roomId,
      user_id: user?.user_id
    });
    Alert.alert('Revanş', 'Revanş isteği gönderildi!');
  };
  
  const goHome = () => {
    playClick();
    router.replace('/(tabs)');
  };
  
  // Render functions
  const renderSearching = () => (
    <View style={styles.centerContainer}>
      <Animatable.View animation="pulse" iterationCount="infinite" duration={1500}>
        <Text style={styles.searchingEmoji}>🔍</Text>
      </Animatable.View>
      <Text style={styles.searchingText}>Rakip Aranıyor...</Text>
      <Text style={styles.searchingSubtext}>Lütfen bekleyin</Text>
      <TouchableOpacity style={styles.cancelButton} onPress={goHome}>
        <Text style={styles.cancelButtonText}>İptal</Text>
      </TouchableOpacity>
    </View>
  );
  
  const renderMatched = () => (
    <View style={styles.centerContainer}>
      <Animatable.Text animation="bounceIn" style={styles.vsText}>VS</Animatable.Text>
      <View style={styles.playersRow}>
        <View style={styles.playerInfo}>
          <Text style={styles.playerAvatar}>{user?.avatar || '⚽'}</Text>
          <Text style={styles.playerName}>{user?.username || user?.name}</Text>
        </View>
        <View style={styles.playerInfo}>
          <Text style={styles.playerAvatar}>👤</Text>
          <Text style={styles.playerName}>{opponent?.username}</Text>
        </View>
      </View>
      <Animatable.Text animation="pulse" iterationCount="infinite" style={styles.startingText}>
        Oyun Başlıyor...
      </Animatable.Text>
    </View>
  );
  
  const renderPlaying = () => (
    <Animated.View style={[styles.gameContainer, { transform: [{ translateX: shakeAnim }] }]}>
      {/* Score Bar */}
      <View style={styles.scoreBar}>
        <View style={styles.playerScore}>
          <Text style={styles.scoreAvatar}>{user?.avatar || '⚽'}</Text>
          <Animated.Text style={[styles.scoreValue, { transform: [{ scale: scoreAnim }] }]}>
            {myScore}
          </Animated.Text>
          {combo > 1 && <Text style={styles.comboText}>🔥 x{combo}</Text>}
        </View>
        <View style={styles.roundInfo}>
          <Text style={styles.roundText}>{questionNumber}/{totalQuestions}</Text>
        </View>
        <View style={styles.playerScore}>
          <Text style={styles.scoreAvatar}>👤</Text>
          <Text style={styles.scoreValue}>{opponentScore}</Text>
        </View>
      </View>
      
      {/* Timer */}
      <View style={styles.timerContainer}>
        <Animated.View 
          style={[
            styles.timerBar, 
            { 
              width: timerAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%']
              }),
              backgroundColor: timeLeft <= 5 ? '#FF4444' : '#00FF87'
            }
          ]} 
        />
        <Text style={[styles.timerText, timeLeft <= 5 && styles.timerTextRed]}>
          ⏱️ {timeLeft}
        </Text>
      </View>
      
      {/* Question */}
      <View style={styles.questionContainer}>
        <Text style={styles.questionTitle}>🕵️ Gizli Oyuncu</Text>
        {currentQuestion?.hints?.map((hint: string, index: number) => (
          <Text key={index} style={styles.hintText}>💡 {hint}</Text>
        ))}
      </View>
      
      {/* Options */}
      <View style={styles.optionsContainer}>
        {currentQuestion?.options?.map((option: string, index: number) => {
          const isEliminated = eliminatedOptions.includes(option);
          const isSelected = selectedAnswer === option;
          
          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.optionButton,
                isEliminated && styles.optionEliminated,
                isSelected && styles.optionSelected
              ]}
              onPress={() => !isEliminated && handleAnswerSelect(option)}
              disabled={isEliminated || selectedAnswer !== null}
            >
              <LinearGradient
                colors={isSelected ? ['#FFD700', '#FFA500'] : isEliminated ? ['#444', '#333'] : ['#4CAF50', '#388E3C']}
                style={styles.optionGradient}
              >
                <Text style={[styles.optionText, isEliminated && styles.optionTextEliminated]}>
                  {option}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          );
        })}
      </View>
      
      {/* Jokers */}
      <View style={styles.jokersContainer}>
        <TouchableOpacity style={styles.jokerButton} onPress={() => useJoker('time_extend')}>
          <Text style={styles.jokerEmoji}>⏳</Text>
          <Text style={styles.jokerCount}>{jokers.time_extend}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.jokerButton} onPress={() => useJoker('eliminate_two')}>
          <Text style={styles.jokerEmoji}>❌</Text>
          <Text style={styles.jokerCount}>{jokers.eliminate_two}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.jokerButton} onPress={() => useJoker('reveal_letter')}>
          <Text style={styles.jokerEmoji}>👁️</Text>
          <Text style={styles.jokerCount}>{jokers.reveal_letter}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.jokerButton} onPress={() => useJoker('skip_question')}>
          <Text style={styles.jokerEmoji}>🔄</Text>
          <Text style={styles.jokerCount}>{jokers.skip_question}</Text>
        </TouchableOpacity>
      </View>
      
      {/* Emote Button */}
      <TouchableOpacity style={styles.emoteButton} onPress={() => setShowEmotes(!showEmotes)}>
        <Text style={styles.emoteButtonText}>😎</Text>
      </TouchableOpacity>
      
      {/* Emote Picker */}
      {showEmotes && (
        <View style={styles.emotePicker}>
          {EMOTES.map((emote, index) => (
            <TouchableOpacity key={index} onPress={() => sendEmote(emote)}>
              <Text style={styles.emoteOption}>{emote}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
      
      {/* Received Emote */}
      {receivedEmote && (
        <Animatable.View animation="bounceIn" style={styles.receivedEmote}>
          <Text style={styles.receivedEmoteText}>{receivedEmote}</Text>
        </Animatable.View>
      )}
    </Animated.View>
  );
  
  const renderRoundResult = () => (
    <View style={styles.resultContainer}>
      <Text style={styles.resultTitle}>Doğru Cevap</Text>
      <Text style={styles.correctAnswerText}>{correctAnswer}</Text>
      
      {roundResults?.player_results?.map((result: any, index: number) => (
        <View key={index} style={styles.resultRow}>
          <Text style={styles.resultName}>
            {result.user_id === user?.user_id ? 'Sen' : opponent?.username}
          </Text>
          <Text style={[styles.resultStatus, result.correct ? styles.resultCorrect : styles.resultWrong]}>
            {result.correct ? '✓ Doğru' : '✗ Yanlış'}
          </Text>
          <Text style={styles.resultPoints}>+{result.points}</Text>
        </View>
      ))}
      
      <Text style={styles.waitingText}>Sonraki soru hazırlanıyor...</Text>
    </View>
  );
  
  const renderGameOver = () => {
    const isWinner = finalResults?.winner === user?.user_id;
    const isDraw = finalResults?.is_draw;
    const myReward = finalResults?.rewards?.[user?.user_id || ''];
    
    return (
      <View style={styles.gameOverContainer}>
        <Animatable.Text 
          animation={isWinner ? 'bounceIn' : 'fadeIn'} 
          style={styles.gameOverEmoji}
        >
          {isDraw ? '🤝' : isWinner ? '🏆' : '😢'}
        </Animatable.Text>
        
        <Text style={styles.gameOverTitle}>
          {isDraw ? 'Berabere!' : isWinner ? 'Kazandın!' : 'Kaybettin'}
        </Text>
        
        <View style={styles.finalScores}>
          <View style={styles.finalScoreItem}>
            <Text style={styles.finalScoreName}>{user?.username}</Text>
            <Text style={styles.finalScoreValue}>{finalResults?.final_scores?.[user?.user_id || ''] || 0}</Text>
          </View>
          <Text style={styles.vsDivider}>-</Text>
          <View style={styles.finalScoreItem}>
            <Text style={styles.finalScoreName}>{opponent?.username}</Text>
            <Text style={styles.finalScoreValue}>{opponentScore}</Text>
          </View>
        </View>
        
        {myReward && (
          <View style={styles.rewardsContainer}>
            <Text style={styles.rewardText}>🪙 +{myReward.coins} Coin</Text>
            <Text style={styles.rewardText}>⭐ +{myReward.xp} XP</Text>
          </View>
        )}
        
        <View style={styles.gameOverButtons}>
          <TouchableOpacity style={styles.rematchButton} onPress={requestRematch}>
            <LinearGradient colors={['#FFD700', '#FFA500']} style={styles.buttonGradient}>
              <Text style={styles.buttonText}>🔄 Revanş</Text>
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.homeButton} onPress={goHome}>
            <LinearGradient colors={['#4CAF50', '#388E3C']} style={styles.buttonGradient}>
              <Text style={styles.buttonText}>🏠 Ana Sayfa</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    );
  };
  
  return (
    <ImageBackground source={HOME_BG} style={styles.container} resizeMode="cover">
      <View style={styles.overlay}>
        {gameStatus === 'searching' && renderSearching()}
        {gameStatus === 'matched' && renderMatched()}
        {gameStatus === 'playing' && renderPlaying()}
        {gameStatus === 'round_result' && renderRoundResult()}
        {gameStatus === 'game_over' && renderGameOver()}
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,20,10,0.7)' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  gameContainer: { flex: 1, padding: 16 },
  
  // Searching
  searchingEmoji: { fontSize: 80 },
  searchingText: { fontSize: 24, fontWeight: 'bold', color: '#FFD700', marginTop: 20 },
  searchingSubtext: { fontSize: 16, color: '#fff', marginTop: 10 },
  cancelButton: { marginTop: 30, paddingHorizontal: 30, paddingVertical: 12, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20 },
  cancelButtonText: { color: '#fff', fontSize: 16 },
  
  // Matched
  vsText: { fontSize: 60, fontWeight: '900', color: '#FFD700' },
  playersRow: { flexDirection: 'row', justifyContent: 'space-around', width: '100%', marginTop: 20 },
  playerInfo: { alignItems: 'center' },
  playerAvatar: { fontSize: 50 },
  playerName: { fontSize: 18, color: '#fff', marginTop: 10, fontWeight: 'bold' },
  startingText: { fontSize: 20, color: '#00FF87', marginTop: 30 },
  
  // Score Bar
  scoreBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10 },
  playerScore: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  scoreAvatar: { fontSize: 30 },
  scoreValue: { fontSize: 28, fontWeight: '900', color: '#FFD700' },
  comboText: { fontSize: 14, color: '#FF6B00', fontWeight: 'bold' },
  roundInfo: { backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 15 },
  roundText: { fontSize: 16, color: '#fff', fontWeight: 'bold' },
  
  // Timer
  timerContainer: { height: 30, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 15, overflow: 'hidden', marginVertical: 10 },
  timerBar: { height: '100%', borderRadius: 15 },
  timerText: { position: 'absolute', width: '100%', textAlign: 'center', lineHeight: 30, color: '#fff', fontWeight: 'bold', fontSize: 16 },
  timerTextRed: { color: '#FF4444' },
  
  // Question
  questionContainer: { backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 16, padding: 16, marginVertical: 10 },
  questionTitle: { fontSize: 22, fontWeight: 'bold', color: '#FFD700', textAlign: 'center', marginBottom: 10 },
  hintText: { fontSize: 16, color: '#fff', marginVertical: 5 },
  
  // Options
  optionsContainer: { marginVertical: 10 },
  optionButton: { marginVertical: 6, borderRadius: 12, overflow: 'hidden' },
  optionGradient: { paddingVertical: 14, paddingHorizontal: 20, alignItems: 'center' },
  optionText: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
  optionEliminated: { opacity: 0.4 },
  optionTextEliminated: { textDecorationLine: 'line-through' },
  optionSelected: { borderWidth: 3, borderColor: '#FFD700' },
  
  // Jokers
  jokersContainer: { flexDirection: 'row', justifyContent: 'center', gap: 15, marginVertical: 10 },
  jokerButton: { alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)', padding: 10, borderRadius: 12, minWidth: 60 },
  jokerEmoji: { fontSize: 24 },
  jokerCount: { fontSize: 12, color: '#FFD700', fontWeight: 'bold', marginTop: 4 },
  
  // Emotes
  emoteButton: { position: 'absolute', bottom: 20, right: 20, backgroundColor: 'rgba(0,0,0,0.5)', padding: 12, borderRadius: 25 },
  emoteButtonText: { fontSize: 28 },
  emotePicker: { position: 'absolute', bottom: 80, right: 20, flexDirection: 'row', flexWrap: 'wrap', width: 150, backgroundColor: 'rgba(0,0,0,0.8)', borderRadius: 12, padding: 10 },
  emoteOption: { fontSize: 28, margin: 5 },
  receivedEmote: { position: 'absolute', top: 100, right: 50, backgroundColor: 'rgba(0,0,0,0.8)', padding: 15, borderRadius: 20 },
  receivedEmoteText: { fontSize: 40 },
  
  // Round Result
  resultContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  resultTitle: { fontSize: 24, color: '#fff', marginBottom: 10 },
  correctAnswerText: { fontSize: 28, fontWeight: 'bold', color: '#00FF87', marginBottom: 20 },
  resultRow: { flexDirection: 'row', alignItems: 'center', gap: 15, marginVertical: 8 },
  resultName: { fontSize: 18, color: '#fff', width: 100 },
  resultStatus: { fontSize: 16, fontWeight: 'bold' },
  resultCorrect: { color: '#00FF87' },
  resultWrong: { color: '#FF4444' },
  resultPoints: { fontSize: 16, color: '#FFD700' },
  waitingText: { fontSize: 16, color: '#888', marginTop: 30 },
  
  // Game Over
  gameOverContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  gameOverEmoji: { fontSize: 100 },
  gameOverTitle: { fontSize: 36, fontWeight: '900', color: '#FFD700', marginTop: 20 },
  finalScores: { flexDirection: 'row', alignItems: 'center', marginTop: 30 },
  finalScoreItem: { alignItems: 'center' },
  finalScoreName: { fontSize: 18, color: '#fff' },
  finalScoreValue: { fontSize: 48, fontWeight: '900', color: '#FFD700' },
  vsDivider: { fontSize: 36, color: '#fff', marginHorizontal: 20 },
  rewardsContainer: { flexDirection: 'row', gap: 20, marginTop: 20 },
  rewardText: { fontSize: 20, color: '#fff', backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 10 },
  gameOverButtons: { flexDirection: 'row', gap: 15, marginTop: 40 },
  rematchButton: { borderRadius: 15, overflow: 'hidden' },
  homeButton: { borderRadius: 15, overflow: 'hidden' },
  buttonGradient: { paddingVertical: 14, paddingHorizontal: 24 },
  buttonText: { fontSize: 18, fontWeight: 'bold', color: '#1a1a2e' },
});
