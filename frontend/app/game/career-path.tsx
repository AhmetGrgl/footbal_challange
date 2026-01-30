import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../services/api';

export default function CareerPathGame() {
  const router = useRouter();
  const [player, setPlayer] = useState<any>(null);
  const [guess, setGuess] = useState('');
  const [score1, setScore1] = useState(0);
  const [score2, setScore2] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [loading, setLoading] = useState(true);

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
      Alert.alert('Hata', 'Lütfen bir isim girin');
      return;
    }

    if (guess.toLowerCase().trim() === player.name.toLowerCase()) {
      Alert.alert('Doğru! 🎉', `${player.name} doğru cevap!`);
      setScore1(score1 + 1);
      if (score1 + 1 >= 3) {
        setGameOver(true);
      } else {
        loadRandomPlayer();
        setGuess('');
      }
    } else {
      Alert.alert('Yanlış!', `Doğru cevap: ${player.name}`);
      setScore2(score2 + 1);
      if (score2 + 1 >= 3) {
        setGameOver(true);
      } else {
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
        <Text style={styles.title}>📈 Kariyer Yolu</Text>
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

            <View style={styles.questionCard}>
              <Text style={styles.questionText}>Bu takımlarda oynayan futbolcu kim?</Text>
            </View>

            <View style={styles.careerPath}>
              {player?.teams.map((team: any, index: number) => (
                <View key={index} style={styles.teamCard}>
                  <View style={styles.teamIconContainer}>
                    <Ionicons name="shield" size={32} color="#FFD700" />
                  </View>
                  <View style={styles.teamInfo}>
                    <Text style={styles.teamName}>{team.team}</Text>
                    <Text style={styles.teamYears}>
                      {team.years[0]} - {team.years[team.years.length - 1]}
                    </Text>
                  </View>
                  {index < player.teams.length - 1 && (
                    <Ionicons name="arrow-down" size={20} color="#4ECDC4" style={styles.arrow} />
                  )}
                </View>
              ))}
            </View>

            <View style={styles.hintCard}>
              <Text style={styles.hintTitle}>💡 İpuçları:</Text>
              <Text style={styles.hintText}>• Uyruk: {player?.nationality}</Text>
              <Text style={styles.hintText}>• Pozisyon: {player?.position}</Text>
            </View>

            <View style={styles.inputSection}>
              <TextInput
                style={styles.input}
                placeholder="Futbolcu ismini girin..."
                placeholderTextColor="#888"
                value={guess}
                onChangeText={setGuess}
              />
              <TouchableOpacity style={styles.submitButton} onPress={handleGuess}>
                <Text style={styles.submitText}>Tahmin Et</Text>
              </TouchableOpacity>
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
  questionCard: { backgroundColor: 'rgba(0,168,107,0.2)', borderRadius: 12, padding: 20, marginBottom: 24, alignItems: 'center' },
  questionText: { fontSize: 18, fontWeight: 'bold', color: '#00FF88', textAlign: 'center' },
  careerPath: { marginBottom: 24 },
  teamCard: { backgroundColor: 'rgba(255,215,0,0.15)', borderRadius: 16, padding: 16, marginBottom: 12, flexDirection: 'row', alignItems: 'center', borderWidth: 2, borderColor: 'rgba(255,215,0,0.3)' },
  teamIconContainer: { marginRight: 16 },
  teamInfo: { flex: 1 },
  teamName: { fontSize: 18, fontWeight: 'bold', color: '#FFD700', marginBottom: 4 },
  teamYears: { fontSize: 14, color: '#B8B8B8' },
  arrow: { marginLeft: 8 },
  hintCard: { backgroundColor: 'rgba(78,205,196,0.2)', borderRadius: 12, padding: 16, marginBottom: 24 },
  hintTitle: { fontSize: 16, fontWeight: 'bold', color: '#4ECDC4', marginBottom: 12 },
  hintText: { fontSize: 14, color: '#B8B8B8', marginBottom: 6 },
  inputSection: { gap: 12 },
  input: { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: 16, color: '#fff', fontSize: 16 },
  submitButton: { backgroundColor: '#00FF88', borderRadius: 12, padding: 18, alignItems: 'center' },
  submitText: { fontSize: 18, fontWeight: 'bold', color: '#1a1a2e' },
  gameOverContainer: { alignItems: 'center', paddingVertical: 60 },
  gameOverEmoji: { fontSize: 80, marginBottom: 20 },
  gameOverText: { fontSize: 32, fontWeight: 'bold', color: '#fff', marginBottom: 16 },
  finalScore: { fontSize: 20, color: '#B8B8B8', marginBottom: 40 },
  playAgainButton: { backgroundColor: '#00FF88', borderRadius: 12, paddingVertical: 16, paddingHorizontal: 40 },
  playAgainText: { fontSize: 18, fontWeight: 'bold', color: '#1a1a2e' },
});