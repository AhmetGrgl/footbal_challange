import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../services/api';

export default function ValueGuessGame() {
  const router = useRouter();
  const [player, setPlayer] = useState<any>(null);
  const [guess, setGuess] = useState('');
  const [score1, setScore1] = useState(0);
  const [score2, setScore2] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [loading, setLoading] = useState(true);
  const [round, setRound] = useState(1);

  useEffect(() => {
    loadRandomPlayer();
  }, []);

  const loadRandomPlayer = async () => {
    setLoading(true);
    try {
      const randomPlayer = await api.getRandomPlayer();
      setPlayer(randomPlayer);
    } catch (error) {
      Alert.alert('Hata', 'Futbolcu yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleGuess = () => {
    if (!guess.trim()) {
      Alert.alert('Hata', 'Lütfen bir değer girin');
      return;
    }

    const guessValue = parseInt(guess.replace(/\D/g, ''));
    const actualValue = player.market_values[0]?.value || 50000000;
    const difference = Math.abs(guessValue - actualValue);
    const percentDiff = (difference / actualValue) * 100;

    if (percentDiff <= 20) {
      Alert.alert('Harika! 🎉', `Çok yakın! Gerçek değer: €${(actualValue / 1000000).toFixed(1)}M`);
      setScore1(score1 + 1);
      if (score1 + 1 >= 3) {
        setGameOver(true);
      } else {
        setRound(round + 1);
        loadRandomPlayer();
        setGuess('');
      }
    } else {
      Alert.alert('Uzak!', `Gerçek değer: €${(actualValue / 1000000).toFixed(1)}M\nSenin tahmin: €${(guessValue / 1000000).toFixed(1)}M`);
      // Bot's turn - bot wins this round
      setScore2(score2 + 1);
      if (score2 + 1 >= 3) {
        setGameOver(true);
      } else {
        setRound(round + 1);
        loadRandomPlayer();
        setGuess('');
      }
    }
  };

  return (
    <LinearGradient colors={['#1a1a2e', '#0f3460']} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>💰 Değer Tahmini</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {loading ? (
          <ActivityIndicator size="large" color="#FFD700" />
        ) : !gameOver ? (
          <>
            <View style={styles.scoreBoard}>
              <View style={styles.scoreItem}>
                <Text style={styles.scoreName}>Siz</Text>
                <Text style={styles.scoreValue}>{score1}</Text>
              </View>
              <Text style={styles.vsText}>VS</Text>
              <View style={styles.scoreItem}>
                <Text style={styles.scoreName}>Bot 🤖</Text>
                <Text style={styles.scoreValue}>{score2}</Text>
              </View>
            </View>

            <View style={styles.roundCard}>
              <Text style={styles.roundText}>Round {round}</Text>
            </View>

            <View style={styles.playerCard}>
              <Text style={styles.playerEmoji}>⚽</Text>
              <Text style={styles.playerName}>{player?.name}</Text>
              <Text style={styles.playerInfo}>{player?.nationality} • {player?.position}</Text>
              <Text style={styles.questionText}>Bu futbolcunun piyasa değeri ne kadar?</Text>
            </View>

            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Tahminini gir (Milyon € cinsinden):</Text>
              <View style={styles.inputContainer}>
                <Text style={styles.currency}>€</Text>
                <TextInput
                  style={styles.input}
                  placeholder="50"
                  placeholderTextColor="#888"
                  value={guess}
                  onChangeText={setGuess}
                  keyboardType="numeric"
                />
                <Text style={styles.million}>M</Text>
              </View>
              <TouchableOpacity style={styles.submitButton} onPress={handleGuess}>
                <Text style={styles.submitText}>Tahmin Et</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.hintCard}>
              <Text style={styles.hintTitle}>💡 İpucu:</Text>
              <Text style={styles.hintText}>%20 hata payı ile doğru tahmin yaparsanız puan kazanırsınız!</Text>
            </View>
          </>
        ) : (
          <View style={styles.gameOverContainer}>
            <Text style={styles.gameOverEmoji}>{score1 > score2 ? '🏆' : '🤖'}</Text>
            <Text style={styles.gameOverText}>{score1 > score2 ? 'Kazandınız!' : 'Bot Kazandı!'}</Text>
            <Text style={styles.finalScore}>Skor: {score1} - {score2}</Text>
            <TouchableOpacity style={styles.playAgainButton} onPress={() => router.back()}>
              <Text style={styles.playAgainText}>Ana Menü</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, paddingTop: 60 },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  placeholder: { width: 40 },
  content: { padding: 16 },
  scoreBoard: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', backgroundColor: 'rgba(26,71,42,0.5)', borderRadius: 16, padding: 20, marginBottom: 24 },
  scoreItem: { alignItems: 'center' },
  scoreName: { fontSize: 14, color: '#B8B8B8', marginBottom: 8 },
  scoreValue: { fontSize: 32, fontWeight: 'bold', color: '#FFD700' },
  vsText: { fontSize: 18, fontWeight: 'bold', color: '#B8B8B8' },
  roundCard: { backgroundColor: 'rgba(255,215,0,0.2)', borderRadius: 12, padding: 16, marginBottom: 20, alignItems: 'center' },
  roundText: { fontSize: 24, fontWeight: 'bold', color: '#FFD700' },
  playerCard: { backgroundColor: 'rgba(78,205,196,0.2)', borderRadius: 20, padding: 24, marginBottom: 24, alignItems: 'center', borderWidth: 2, borderColor: '#4ECDC4' },
  playerEmoji: { fontSize: 60, marginBottom: 16 },
  playerName: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 8 },
  playerInfo: { fontSize: 16, color: '#B8B8B8', marginBottom: 20 },
  questionText: { fontSize: 18, color: '#4ECDC4', textAlign: 'center' },
  inputSection: { marginBottom: 24 },
  inputLabel: { fontSize: 16, color: '#00FF88', fontWeight: 'bold', marginBottom: 12 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: 16, marginBottom: 16 },
  currency: { fontSize: 24, color: '#FFD700', fontWeight: 'bold', marginRight: 8 },
  input: { flex: 1, fontSize: 32, color: '#fff', textAlign: 'center', fontWeight: 'bold' },
  million: { fontSize: 24, color: '#FFD700', fontWeight: 'bold', marginLeft: 8 },
  submitButton: { backgroundColor: '#00FF88', borderRadius: 12, padding: 18, alignItems: 'center' },
  submitText: { fontSize: 18, fontWeight: 'bold', color: '#1a1a2e' },
  hintCard: { backgroundColor: 'rgba(255,215,0,0.15)', borderRadius: 12, padding: 16 },
  hintTitle: { fontSize: 16, fontWeight: 'bold', color: '#FFD700', marginBottom: 8 },
  hintText: { fontSize: 14, color: '#B8B8B8' },
  gameOverContainer: { alignItems: 'center', paddingVertical: 60 },
  gameOverEmoji: { fontSize: 80, marginBottom: 20 },
  gameOverText: { fontSize: 32, fontWeight: 'bold', color: '#fff', marginBottom: 16 },
  finalScore: { fontSize: 20, color: '#B8B8B8', marginBottom: 40 },
  playAgainButton: { backgroundColor: '#00FF88', borderRadius: 12, paddingVertical: 16, paddingHorizontal: 40 },
  playAgainText: { fontSize: 18, fontWeight: 'bold', color: '#1a1a2e' },
});