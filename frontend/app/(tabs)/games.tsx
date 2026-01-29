import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { Colors } from '../../constants/colors';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSocket } from '../../contexts/SocketContext';
import { useEffect } from 'react';

export default function GamesScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { joinMatchmaking, leaveMatchmaking, matchFound } = useSocket();
  const [searching, setSearching] = useState(false);
  const [selectedMode, setSelectedMode] = useState<string | null>(null);

  const gameModes = [
    {
      id: 'letter-hunt',
      name: t('letterHunt'),
      icon: 'text' as const,
      color: '#FF6B6B',
      description: 'Take turns writing letters and guess the player',
    },
    {
      id: 'club-connection',
      name: t('clubConnection'),
      icon: 'shield' as const,
      color: '#4ECDC4',
      description: 'Find a player who played for both teams',
    },
    {
      id: 'value-guess',
      name: t('valueGuess'),
      icon: 'cash' as const,
      color: '#45B7D1',
      description: 'Guess the market value of a player',
    },
    {
      id: 'mystery-player',
      name: t('mysteryPlayer'),
      icon: 'help-circle' as const,
      color: '#FFA07A',
      description: 'Reveal letters one by one and guess the player',
    },
    {
      id: 'career-path',
      name: t('careerPath'),
      icon: 'trending-up' as const,
      color: '#98D8C8',
      description: 'Guess the player from their career path',
    },
    {
      id: 'football-grid',
      name: t('footballGrid'),
      icon: 'grid' as const,
      color: '#FFD93D',
      description: 'Tic-tac-toe with football teams',
    },
  ];

  useEffect(() => {
    if (matchFound) {
      setSearching(false);
      setSelectedMode(null);
      router.push(`/game/${selectedMode}?room=${matchFound.room_id}`);
    }
  }, [matchFound]);

  const handleQuickMatch = (modeId: string) => {
    setSelectedMode(modeId);
    setSearching(true);
    joinMatchmaking(modeId);
  };

  const handleCancelSearch = () => {
    if (selectedMode) {
      leaveMatchmaking(selectedMode);
    }
    setSearching(false);
    setSelectedMode(null);
  };

  return (
    <LinearGradient colors={[Colors.background, Colors.secondary]} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('gameModes')}</Text>
          <Ionicons name="game-controller" size={32} color={Colors.accent} />
        </View>

        <View style={styles.gamesContainer}>
          {gameModes.map((mode) => (
            <View key={mode.id} style={[styles.gameCard, { borderLeftColor: mode.color }]}>
              <View style={styles.gameHeader}>
                <View style={[styles.gameIcon, { backgroundColor: mode.color + '30' }]}>
                  <Ionicons name={mode.icon} size={28} color={mode.color} />
                </View>
                <View style={styles.gameInfo}>
                  <Text style={styles.gameName}>{mode.name}</Text>
                  <Text style={styles.gameDescription}>{mode.description}</Text>
                </View>
              </View>
              <TouchableOpacity
                style={[styles.playButton, { backgroundColor: mode.color }]}
                onPress={() => handleQuickMatch(mode.id)}
              >
                <Ionicons name="play" size={20} color={Colors.text} />
                <Text style={styles.playButtonText}>{t('quickMatch')}</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>

      <Modal visible={searching} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ActivityIndicator size="large" color={Colors.accent} />
            <Text style={styles.searchingText}>{t('searching')}</Text>
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancelSearch}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.text,
  },
  gamesContainer: {
    gap: 16,
  },
  gameCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  gameHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  gameIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  gameInfo: {
    flex: 1,
  },
  gameName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  gameDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
  },
  playButtonText: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    minWidth: 280,
  },
  searchingText: {
    fontSize: 18,
    color: Colors.text,
    marginTop: 16,
    marginBottom: 24,
  },
  cancelButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: Colors.error,
    borderRadius: 8,
  },
  cancelButtonText: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
});
