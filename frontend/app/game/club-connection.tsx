import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors } from '../../constants/colors';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSocket } from '../../contexts/SocketContext';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';

export default function ClubConnectionGame() {
  const { room } = useLocalSearchParams();
  const router = useRouter();
  const { t } = useTranslation();
  const { socket } = useSocket();
  const { user } = useAuth();
  
  const [team1, setTeam1] = useState('Real Madrid');
  const [team2, setTeam2] = useState('Barcelona');
  const [guess, setGuess] = useState('');
  const [score1, setScore1] = useState(0);
  const [score2, setScore2] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmitGuess = async () => {
    if (!guess.trim()) {
      Alert.alert('Error', 'Please enter a player name');
      return;
    }

    setLoading(true);
    try {
      // Simple validation - check if player exists in database
      const players = await api.getPlayers();
      const foundPlayer = players.find(
        (p: any) => p.name.toLowerCase() === guess.toLowerCase().trim()
      );

      if (!foundPlayer) {
        Alert.alert('Error', 'Player not found!');
        setLoading(false);
        return;
      }

      // Check if player played for both teams
      const team1Match = foundPlayer.teams.some(
        (t: any) => t.team.toLowerCase() === team1.toLowerCase()
      );
      const team2Match = foundPlayer.teams.some(
        (t: any) => t.team.toLowerCase() === team2.toLowerCase()
      );

      if (team1Match && team2Match) {
        Alert.alert('Correct!', `${foundPlayer.name} is correct!`);
        setScore1(score1 + 1);
        if (score1 + 1 >= 3) {
          setGameOver(true);
          setWinner('You');
        }
        setGuess('');
      } else {
        Alert.alert('Wrong!', 'This player did not play for both teams');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to validate guess');
    } finally {
      setLoading(false);
    }
  };

  const handlePlayAgain = () => {
    setScore1(0);
    setScore2(0);
    setGameOver(false);
    setWinner(null);
    setGuess('');
  };

  const handleExit = () => {
    router.back();
  };

  return (
    <LinearGradient colors={[Colors.background, Colors.secondary]} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleExit} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>{t('clubConnection')}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.scoreBoard}>
          <View style={styles.scoreItem}>
            <Text style={styles.scoreName}>You</Text>
            <Text style={styles.scoreValue}>{score1}</Text>
          </View>
          <View style={styles.scoreItem}>
            <Text style={styles.scoreName}>Opponent</Text>
            <Text style={styles.scoreValue}>{score2}</Text>
          </View>
        </View>

        {!gameOver ? (
          <>
            <View style={styles.teamsContainer}>
              <View style={styles.teamCard}>
                <Ionicons name="shield" size={40} color={Colors.accent} />
                <Text style={styles.teamName}>{team1}</Text>
              </View>
              <Ionicons name="add" size={32} color={Colors.textSecondary} />
              <View style={styles.teamCard}>
                <Ionicons name="shield" size={40} color={Colors.accent} />
                <Text style={styles.teamName}>{team2}</Text>
              </View>
            </View>

            <View style={styles.instructionCard}>
              <Ionicons name="information-circle" size={24} color={Colors.accent} />
              <Text style={styles.instructionText}>
                Find a player who played for both {team1} and {team2}
              </Text>
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="person" size={20} color={Colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter player name..."
                placeholderTextColor={Colors.textSecondary}
                value={guess}
                onChangeText={setGuess}
              />
            </View>

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmitGuess}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={Colors.text} />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={20} color={Colors.text} />
                  <Text style={styles.submitButtonText}>{t('submitGuess')}</Text>
                </>
              )}
            </TouchableOpacity>

            <View style={styles.hintsCard}>
              <Text style={styles.hintsTitle}>Examples of correct answers:</Text>
              <Text style={styles.hintText}>• Arda Güler (Fenerbahce & Real Madrid)</Text>
              <Text style={styles.hintText}>• Luis Figo (Barcelona & Real Madrid)</Text>
            </View>
          </>
        ) : (
          <View style={styles.gameOverContainer}>
            <Ionicons
              name={winner === 'You' ? 'trophy' : 'sad'}
              size={80}
              color={winner === 'You' ? Colors.accent : Colors.error}
            />
            <Text style={styles.gameOverText}>
              {winner === 'You' ? t('youWon') : t('youLost')}
            </Text>
            <Text style={styles.finalScore}>
              Final Score: {score1} - {score2}
            </Text>
            <TouchableOpacity style={styles.playAgainButton} onPress={handlePlayAgain}>
              <Ionicons name="refresh" size={20} color={Colors.text} />
              <Text style={styles.playAgainButtonText}>{t('playAgain')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.exitButton} onPress={handleExit}>
              <Text style={styles.exitButtonText}>Exit</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
  },
  placeholder: {
    width: 40,
  },
  content: {
    padding: 16,
  },
  scoreBoard: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  scoreItem: {
    alignItems: 'center',
  },
  scoreName: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  scoreValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.accent,
  },
  teamsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  teamCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    width: '40%',
  },
  teamName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 8,
    textAlign: 'center',
  },
  instructionCard: {
    flexDirection: 'row',
    backgroundColor: Colors.primary + '30',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.primary,
    alignItems: 'center',
  },
  instructionText: {
    fontSize: 14,
    color: Colors.text,
    marginLeft: 12,
    flex: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 50,
    color: Colors.text,
    fontSize: 16,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 24,
    gap: 8,
  },
  submitButtonText: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  hintsCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  hintsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  hintText: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  gameOverContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  gameOverText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: 24,
    marginBottom: 16,
  },
  finalScore: {
    fontSize: 18,
    color: Colors.textSecondary,
    marginBottom: 32,
  },
  playAgainButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
  },
  playAgainButtonText: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  exitButton: {
    paddingVertical: 12,
    paddingHorizontal: 40,
  },
  exitButtonText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
});
