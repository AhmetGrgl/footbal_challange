import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../services/api';
import { useTranslation } from 'react-i18next';

export default function LetterHuntGame() {
  const router = useRouter();
  const { mode } = useLocalSearchParams();
  const { t } = useTranslation();
  const [playerLetter, setPlayerLetter] = useState('');
  const [botLetter, setBotLetter] = useState('');
  const [letters, setLetters] = useState<string[]>([]);
  const [guess, setGuess] = useState('');
  const [score1, setScore1] = useState(0);
  const [score2, setScore2] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [turn, setTurn] = useState<'player' | 'bot'>('player');
  const [round, setRound] = useState(1);

  const botChooseLetter = () => {
    const alphabet = 'ABCDEFGHIJKLMNOPRSTUVYZ';
    const randomLetter = alphabet[Math.floor(Math.random() * alphabet.length)];
    setBotLetter(randomLetter);
    setLetters([...letters, randomLetter]);
    setTurn('player');
  };

  const handleAddLetter = () => {
    if (!playerLetter.trim()) {
      Alert.alert('Hata', 'Lütfen bir harf girin');
      return;
    }
    setLetters([...letters, playerLetter.toUpperCase()]);
    setPlayerLetter('');
    setTurn('bot');
    setTimeout(botChooseLetter, 2000);
  };

  const handleGuess = async () => {
    if (!guess.trim()) {
      Alert.alert('Hata', 'Lütfen futbolcu ismi girin');
      return;
    }

    try {
      const players = await api.getPlayers();
      const foundPlayer = players.find((p: any) => 
        p.name.toLowerCase() === guess.toLowerCase().trim()
      );

      if (!foundPlayer) {
        Alert.alert('Yanlış!', 'Futbolcu bulunamadı');
        return;
      }

      const playerName = foundPlayer.name.toUpperCase();
      const allLettersMatch = letters.every(letter => playerName.includes(letter));

      if (allLettersMatch) {
        Alert.alert('Doğru! 🎉', `${foundPlayer.name} doğru cevap!`);
        setScore1(score1 + 1);
        if (score1 + 1 >= 3) {
          setGameOver(true);
        } else {
          // Yeni round
          setLetters([]);
          setGuess('');
          setRound(round + 1);
        }
      } else {
        Alert.alert('Yanlış!', 'Bu futbolcu tüm harfleri içermiyor');
      }
    } catch (error) {
      Alert.alert('Hata', 'Doğrulama yapılamadı');
    }
  };

  return (
    <LinearGradient colors={['#1a1a2e', '#0f3460']} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>🔤 Harf Avı</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {!gameOver ? (
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

            <View style={styles.lettersCard}>
              <Text style={styles.lettersTitle}>Seçilen Harfler:</Text>
              <View style={styles.lettersContainer}>
                {letters.length === 0 ? (
                  <Text style={styles.noLetters}>Henüz harf seçilmedi</Text>
                ) : (
                  letters.map((letter, i) => (
                    <View key={i} style={styles.letterBubble}>
                      <Text style={styles.letterText}>{letter}</Text>
                    </View>
                  ))
                )}
              </View>
            </View>

            {turn === 'player' ? (
              <View style={styles.inputSection}>
                <Text style={styles.turnText}>Senin Sıran! Bir harf seç:</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="Harf girin (A-Z)"
                    placeholderTextColor="#888"
                    value={playerLetter}
                    onChangeText={setPlayerLetter}
                    maxLength={1}
                    autoCapitalize="characters"
                  />
                  <TouchableOpacity style={styles.addButton} onPress={handleAddLetter}>
                    <Text style={styles.addButtonText}>Ekle</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.botThinking}>
                <Text style={styles.botText}>Bot düşünüyor...</Text>
              </View>
            )}

            {letters.length >= 2 && (
              <View style={styles.guessSection}>
                <Text style={styles.guessTitle}>Futbolcu tahmini yap:</Text>
                <TextInput
                  style={styles.guessInput}
                  placeholder="Futbolcu ismi..."
                  placeholderTextColor="#888"
                  value={guess}
                  onChangeText={setGuess}
                />
                <TouchableOpacity style={styles.submitButton} onPress={handleGuess}>
                  <Text style={styles.submitText}>Tahmin Et</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        ) : (
          <View style={styles.gameOverContainer}>
            <Text style={styles.gameOverEmoji}>🏆</Text>
            <Text style={styles.gameOverText}>Kazandınız!</Text>
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
  lettersCard: { backgroundColor: 'rgba(78,205,196,0.2)', borderRadius: 12, padding: 16, marginBottom: 20 },
  lettersTitle: { fontSize: 16, fontWeight: 'bold', color: '#4ECDC4', marginBottom: 12 },
  lettersContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  noLetters: { fontSize: 14, color: '#888', fontStyle: 'italic' },
  letterBubble: { backgroundColor: '#FFD700', width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center' },
  letterText: { fontSize: 24, fontWeight: 'bold', color: '#1a1a2e' },
  inputSection: { marginBottom: 20 },
  turnText: { fontSize: 16, color: '#00FF88', fontWeight: 'bold', marginBottom: 12 },
  inputContainer: { flexDirection: 'row', gap: 10 },
  input: { flex: 1, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: 16, color: '#fff', fontSize: 24, textAlign: 'center', textTransform: 'uppercase' },
  addButton: { backgroundColor: '#00FF88', borderRadius: 12, paddingHorizontal: 24, justifyContent: 'center' },
  addButtonText: { fontSize: 16, fontWeight: 'bold', color: '#1a1a2e' },
  botThinking: { backgroundColor: 'rgba(255,107,107,0.2)', borderRadius: 12, padding: 24, alignItems: 'center', marginBottom: 20 },
  botText: { fontSize: 16, color: '#fff' },
  guessSection: { backgroundColor: 'rgba(0,168,107,0.2)', borderRadius: 12, padding: 16 },
  guessTitle: { fontSize: 16, fontWeight: 'bold', color: '#00FF88', marginBottom: 12 },
  guessInput: { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: 16, color: '#fff', fontSize: 16, marginBottom: 12 },
  submitButton: { backgroundColor: '#00FF88', borderRadius: 12, padding: 16, alignItems: 'center' },
  submitText: { fontSize: 16, fontWeight: 'bold', color: '#1a1a2e' },
  gameOverContainer: { alignItems: 'center', paddingVertical: 60 },
  gameOverEmoji: { fontSize: 80, marginBottom: 20 },
  gameOverText: { fontSize: 32, fontWeight: 'bold', color: '#fff', marginBottom: 40 },
  playAgainButton: { backgroundColor: '#00FF88', borderRadius: 12, paddingVertical: 16, paddingHorizontal: 40 },
  playAgainText: { fontSize: 18, fontWeight: 'bold', color: '#1a1a2e' },
});