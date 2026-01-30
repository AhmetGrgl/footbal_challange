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
import { api } from '../../services/api';

const TEAM_PAIRS = [
  ['Real Madrid', 'Barcelona'],
  ['Real Madrid', 'Fenerbahce'],
  ['Manchester United', 'Real Madrid'],
  ['Barcelona', 'PSG'],
  ['Juventus', 'Real Madrid'],
];

export default function ClubConnectionGame() {
  const { room, mode } = useLocalSearchParams();
  const router = useRouter();
  const { t } = useTranslation();
  
  const [team1, setTeam1] = useState('');
  const [team2, setTeam2] = useState('');
  const [guess, setGuess] = useState('');
  const [score1, setScore1] = useState(0);
  const [score2, setScore2] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isBot, setIsBot] = useState(mode === 'bot');
  const [botThinking, setBotThinking] = useState(false);
  const [lastAnswers, setLastAnswers] = useState<string[]>([]);

  useEffect(() => {
    // Select random teams
    const randomPair = TEAM_PAIRS[Math.floor(Math.random() * TEAM_PAIRS.length)];
    setTeam1(randomPair[0]);
    setTeam2(randomPair[1]);
  }, []);

  const botMakeGuess = async () => {
    setBotThinking(true);
    
    // Simulate bot thinking
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    try {
      const players = await api.getPlayers();
      
      // Find a correct answer
      const correctPlayer = players.find((p: any) => {
        const team1Match = p.teams.some((t: any) => t.team.toLowerCase() === team1.toLowerCase());
        const team2Match = p.teams.some((t: any) => t.team.toLowerCase() === team2.toLowerCase());
        return team1Match && team2Match && !lastAnswers.includes(p.name);
      });

      setBotThinking(false);

      if (correctPlayer) {
        Alert.alert('Bot scored!', `Bot answered: ${correctPlayer.name}`);
        setLastAnswers([...lastAnswers, correctPlayer.name]);
        setScore2(score2 + 1);
        
        if (score2 + 1 >= 3) {
          setGameOver(true);
          setWinner('Bot');
        }
      } else {
        Alert.alert('Bot missed!', 'Bot could not find an answer');
      }
    } catch (error) {
      setBotThinking(false);
      console.error('Bot error:', error);
    }
  };

  const handleSubmitGuess = async () => {
    if (!guess.trim()) {
      Alert.alert('Error', 'Please enter a player name');
      return;
    }

    setLoading(true);
    try {
      const players = await api.getPlayers();
      const foundPlayer = players.find(
        (p: any) => p.name.toLowerCase() === guess.toLowerCase().trim()
      );

      if (!foundPlayer) {
        Alert.alert('Error', 'Player not found in database!');
        setLoading(false);
        
        // Bot's turn if playing vs bot
        if (isBot && !gameOver) {
          await botMakeGuess();
        }
        return;
      }

      // Check if player already answered
      if (lastAnswers.includes(foundPlayer.name)) {
        Alert.alert('Error', 'This player was already mentioned!');
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
        Alert.alert('Correct! 🎉', `${foundPlayer.name} is correct!`);
        setLastAnswers([...lastAnswers, foundPlayer.name]);
        setScore1(score1 + 1);
        setGuess('');
        
        if (score1 + 1 >= 3) {
          setGameOver(true);
          setWinner('You');
        } else if (isBot && !gameOver) {
          // Bot's turn
          await botMakeGuess();
        }
      } else {
        Alert.alert('Wrong! ❌', 'This player did not play for both teams');
        
        // Bot's turn if playing vs bot
        if (isBot && !gameOver) {
          await botMakeGuess();
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to validate guess');
    } finally {
      setLoading(false);
    }
  };

  const handlePlayAgain = () => {
    // Select new random teams
    const randomPair = TEAM_PAIRS[Math.floor(Math.random() * TEAM_PAIRS.length)];
    setTeam1(randomPair[0]);
    setTeam2(randomPair[1]);
    setScore1(0);
    setScore2(0);
    setGameOver(false);
    setWinner(null);
    setGuess('');
    setLastAnswers([]);
  };

  const handleExit = () => {
    router.back();
  };

  return (
    <LinearGradient colors={['#1a1a2e', '#0f3460']} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleExit} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.title}>{t('clubConnection')}</Text>
          {isBot && <Text style={styles.modeBadge}>🤖 Bot Mode</Text>}
        </View>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.scoreBoard}>
          <View style={styles.scoreItem}>
            <Text style={styles.scoreName}>You</Text>
            <Text style={styles.scoreValue}>{score1}</Text>
          </View>
          <Text style={styles.vsText}>VS</Text>
          <View style={styles.scoreItem}>
            <Text style={styles.scoreName}>{isBot ? 'Bot 🤖' : 'Opponent'}</Text>
            <Text style={[styles.scoreValue, { color: '#FF6B6B' }]}>{score2}</Text>
          </View>
        </View>

        {!gameOver ? (
          <>
            <View style={styles.teamsContainer}>
              <View style={styles.teamCard}>
                <Ionicons name="shield" size={40} color={Colors.accent} />
                <Text style={styles.teamName}>{team1}</Text>
              </View>
              <Text style={styles.plusIcon}>+</Text>
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

            {lastAnswers.length > 0 && (
              <View style={styles.answersCard}>
                <Text style={styles.answersTitle}>✅ Correct Answers:</Text>
                {lastAnswers.map((ans, i) => (
                  <Text key={i} style={styles.answerText}>• {ans}</Text>
                ))}
              </View>
            )}

            {botThinking ? (
              <View style={styles.botThinkingCard}>
                <ActivityIndicator size="large" color={Colors.accent} />
                <Text style={styles.botThinkingText}>Bot is thinking...</Text>
              </View>
            ) : (
              <>
                <View style={styles.inputContainer}>
                  <Ionicons name="person" size={20} color={Colors.textSecondary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter player name..."
                    placeholderTextColor={Colors.textSecondary}
                    value={guess}
                    onChangeText={setGuess}
                    editable={!loading && !botThinking}
                  />
                </View>

                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={handleSubmitGuess}
                  disabled={loading || botThinking}
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
              </>
            )}

            <View style={styles.hintsCard}>
              <Text style={styles.hintsTitle}>💡 Hints:</Text>
              <Text style={styles.hintText}>• Arda Güler (Fenerbahce & Real Madrid)</Text>
              <Text style={styles.hintText}>• Cristiano Ronaldo (Man Utd & Real Madrid)</Text>
              <Text style={styles.hintText}>• Luis Figo (Barcelona & Real Madrid)</Text>
            </View>
          </>
        ) : (
          <View style={styles.gameOverContainer}>
            <Text style={styles.gameOverEmoji}>
              {winner === 'You' ? '🏆' : '🤖'}
            </Text>
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
              <Text style={styles.exitButtonText}>Back to Menu</Text>
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
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
  },
  modeBadge: {
    fontSize: 12,
    color: Colors.accent,
    marginTop: 4,
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
    alignItems: 'center',
    backgroundColor: 'rgba(26, 71, 42, 0.5)',
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
  vsText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textSecondary,
  },
  teamsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  teamCard: {
    backgroundColor: 'rgba(26, 71, 42, 0.5)',
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
  plusIcon: {
    fontSize: 24,
    color: Colors.accent,
    fontWeight: 'bold',
  },
  instructionCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 168, 107, 0.2)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
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
  answersCard: {
    backgroundColor: 'rgba(78, 205, 196, 0.2)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#4ECDC4',
  },
  answersTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4ECDC4',
    marginBottom: 8,
  },
  answerText: {
    fontSize: 13,
    color: Colors.text,
    marginBottom: 4,
  },
  botThinkingCard: {
    backgroundColor: 'rgba(255, 107, 107, 0.2)',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  botThinkingText: {
    fontSize: 16,
    color: Colors.text,
    marginTop: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(26, 71, 42, 0.5)',
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
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  hintsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.accent,
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
  gameOverEmoji: {
    fontSize: 80,
    marginBottom: 16,
  },
  gameOverText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.text,
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
