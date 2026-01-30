import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../services/api';

const TEAMS = ['Real Madrid', 'Barcelona', 'PSG', 'Manchester United', 'Juventus', 'Bayern Munich'];

export default function FootballGridGame() {
  const router = useRouter();
  const [topTeams] = useState([TEAMS[0], TEAMS[1], TEAMS[2]]);
  const [sideTeams] = useState([TEAMS[3], TEAMS[4], TEAMS[5]]);
  const [grid, setGrid] = useState<(string | null)[]>(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState<'X' | 'O'>('X');
  const [selectedCell, setSelectedCell] = useState<number | null>(null);
  const [guess, setGuess] = useState('');
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);

  const checkWinner = (newGrid: (string | null)[]) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
      [0, 4, 8], [2, 4, 6] // Diagonals
    ];

    for (let line of lines) {
      const [a, b, c] = line;
      if (newGrid[a] && newGrid[a] === newGrid[b] && newGrid[a] === newGrid[c]) {
        return newGrid[a];
      }
    }
    return null;
  };

  const handleCellPress = (index: number) => {
    if (grid[index] !== null || gameOver) return;
    setSelectedCell(index);
  };

  const handleGuess = async () => {
    if (selectedCell === null || !guess.trim()) {
      Alert.alert('Hata', 'Lütfen bir hücre seçin ve futbolcu ismi girin');
      return;
    }

    const row = Math.floor(selectedCell / 3);
    const col = selectedCell % 3;
    const team1 = topTeams[col];
    const team2 = sideTeams[row];

    try {
      const players = await api.getPlayers();
      const foundPlayer = players.find((p: any) => 
        p.name.toLowerCase() === guess.toLowerCase().trim()
      );

      if (!foundPlayer) {
        Alert.alert('Yanlış!', 'Futbolcu bulunamadı');
        // Bot's turn
        setTimeout(botMove, 1000);
        return;
      }

      const team1Match = foundPlayer.teams.some((t: any) => t.team.toLowerCase() === team1.toLowerCase());
      const team2Match = foundPlayer.teams.some((t: any) => t.team.toLowerCase() === team2.toLowerCase());

      if (team1Match && team2Match) {
        const newGrid = [...grid];
        newGrid[selectedCell] = currentPlayer;
        setGrid(newGrid);
        
        const gameWinner = checkWinner(newGrid);
        if (gameWinner) {
          setGameOver(true);
          setWinner(gameWinner === 'X' ? 'Siz' : 'Bot');
        } else {
          setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X');
          if (currentPlayer === 'X') {
            setTimeout(botMove, 1500);
          }
        }
        
        setSelectedCell(null);
        setGuess('');
      } else {
        Alert.alert('Yanlış!', 'Bu futbolcu her iki takımda da oynamadı');
        setTimeout(botMove, 1000);
      }
    } catch (error) {
      Alert.alert('Hata', 'Doğrulama yapılamadı');
    }
  };

  const botMove = () => {
    const emptyCells = grid.map((cell, i) => cell === null ? i : null).filter(i => i !== null) as number[];
    if (emptyCells.length > 0) {
      const randomIndex = emptyCells[Math.floor(Math.random() * emptyCells.length)];
      const newGrid = [...grid];
      newGrid[randomIndex] = 'O';
      setGrid(newGrid);
      
      const gameWinner = checkWinner(newGrid);
      if (gameWinner) {
        setGameOver(true);
        setWinner('Bot');
      } else {
        setCurrentPlayer('X');
      }
    }
  };

  return (
    <LinearGradient colors={['#1a1a2e', '#0f3460']} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>⚡ Futbol Tablosu</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {!gameOver ? (
          <>
            <View style={styles.turnCard}>
              <Text style={styles.turnText}>
                {currentPlayer === 'X' ? 'Senin Sıran ✅' : 'Bot Düşünüyor 🤖'}
              </Text>
            </View>

            <View style={styles.gridContainer}>
              {/* Top Teams Row */}
              <View style={styles.topRow}>
                <View style={styles.emptyCorner} />
                {topTeams.map((team, i) => (
                  <View key={i} style={styles.teamCell}>
                    <Ionicons name="shield" size={20} color="#FFD700" />
                    <Text style={styles.teamText}>{team}</Text>
                  </View>
                ))}
              </View>

              {/* Grid Rows */}
              {[0, 1, 2].map(row => (
                <View key={row} style={styles.gridRow}>
                  <View style={styles.teamCell}>
                    <Ionicons name="shield" size={20} color="#4ECDC4" />
                    <Text style={styles.teamText}>{sideTeams[row]}</Text>
                  </View>
                  {[0, 1, 2].map(col => {
                    const index = row * 3 + col;
                    return (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.cell,
                          selectedCell === index && styles.selectedCell,
                          grid[index] && styles.filledCell
                        ]}
                        onPress={() => handleCellPress(index)}
                        disabled={currentPlayer === 'O' || grid[index] !== null}
                      >
                        <Text style={[
                          styles.cellText,
                          grid[index] === 'X' && styles.playerX,
                          grid[index] === 'O' && styles.playerO
                        ]}>
                          {grid[index] || ''}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ))}
            </View>

            {selectedCell !== null && currentPlayer === 'X' && (
              <View style={styles.inputSection}>
                <Text style={styles.inputLabel}>Futbolcu ismi girin:</Text>
                <View style={styles.inputRow}>
                  <TextInput
                    style={styles.input}
                    placeholder="Örn: Lionel Messi"
                    placeholderTextColor="#888"
                    value={guess}
                    onChangeText={setGuess}
                  />
                  <TouchableOpacity style={styles.submitButton} onPress={handleGuess}>
                    <Text style={styles.submitText}>✓</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </>
        ) : (
          <View style={styles.gameOverContainer}>
            <Text style={styles.gameOverEmoji}>{winner === 'Siz' ? '🏆' : '🤖'}</Text>
            <Text style={styles.gameOverText}>{winner} Kazandı!</Text>
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
  turnCard: { backgroundColor: 'rgba(0,255,136,0.2)', borderRadius: 12, padding: 16, marginBottom: 24, alignItems: 'center' },
  turnText: { fontSize: 18, fontWeight: 'bold', color: '#00FF88' },
  gridContainer: { marginBottom: 24 },
  topRow: { flexDirection: 'row', marginBottom: 8 },
  emptyCorner: { width: 80, height: 60 },
  teamCell: { flex: 1, height: 60, backgroundColor: 'rgba(255,215,0,0.15)', marginHorizontal: 4, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  teamText: { fontSize: 10, color: '#fff', marginTop: 4, textAlign: 'center' },
  gridRow: { flexDirection: 'row', marginBottom: 8 },
  cell: { flex: 1, aspectRatio: 1, backgroundColor: 'rgba(255,255,255,0.05)', marginHorizontal: 4, borderRadius: 8, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.1)' },
  selectedCell: { borderColor: '#00FF88', backgroundColor: 'rgba(0,255,136,0.2)' },
  filledCell: { backgroundColor: 'rgba(255,215,0,0.2)' },
  cellText: { fontSize: 40, fontWeight: 'bold' },
  playerX: { color: '#00FF88' },
  playerO: { color: '#FF6B6B' },
  inputSection: { backgroundColor: 'rgba(0,168,107,0.2)', borderRadius: 12, padding: 16 },
  inputLabel: { fontSize: 14, color: '#00FF88', fontWeight: 'bold', marginBottom: 12 },
  inputRow: { flexDirection: 'row', gap: 8 },
  input: { flex: 1, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: 12, color: '#fff', fontSize: 14 },
  submitButton: { backgroundColor: '#00FF88', width: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  submitText: { fontSize: 24, color: '#1a1a2e', fontWeight: 'bold' },
  gameOverContainer: { alignItems: 'center', paddingVertical: 60 },
  gameOverEmoji: { fontSize: 80, marginBottom: 20 },
  gameOverText: { fontSize: 32, fontWeight: 'bold', color: '#fff', marginBottom: 40 },
  playAgainButton: { backgroundColor: '#00FF88', borderRadius: 12, paddingVertical: 16, paddingHorizontal: 40 },
  playAgainText: { fontSize: 18, fontWeight: 'bold', color: '#1a1a2e' },
});