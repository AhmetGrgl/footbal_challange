import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

export default function Index() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>⚽ Football Challenge</Text>
        <Text style={styles.subtitle}>Multiplayer Football Quiz Game</Text>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎮 Game Modes</Text>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>1. Letter Hunt</Text>
            <Text style={styles.cardText}>Take turns writing letters and guess the player</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>2. Club Connection</Text>
            <Text style={styles.cardText}>Find a player who played for both teams</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>3. Value Guess</Text>
            <Text style={styles.cardText}>Guess the market value of a player</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>4. Mystery Player</Text>
            <Text style={styles.cardText}>Reveal letters one by one</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>5. Career Path</Text>
            <Text style={styles.cardText}>Guess player from career history</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>6. Football Grid</Text>
            <Text style={styles.cardText}>Tic-tac-toe with football teams</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>✅ Features Ready</Text>
          <Text style={styles.feature}>• Google OAuth + Email/Password Auth</Text>
          <Text style={styles.feature}>• Real-time Multiplayer (Socket.IO)</Text>
          <Text style={styles.feature}>• Friends System</Text>
          <Text style={styles.feature}>• Multi-language (Turkish/English)</Text>
          <Text style={styles.feature}>• 10 Famous Players Database</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🗂️ Players in Database</Text>
          <Text style={styles.player}>⭐ Lionel Messi</Text>
          <Text style={styles.player}>⭐ Cristiano Ronaldo</Text>
          <Text style={styles.player}>⭐ Arda Güler</Text>
          <Text style={styles.player}>⭐ Erling Haaland</Text>
          <Text style={styles.player}>⭐ Kylian Mbappe</Text>
          <Text style={styles.player}>⭐ Neymar Jr</Text>
          <Text style={styles.player}>⭐ Karim Benzema</Text>
          <Text style={styles.player}>⭐ Mohamed Salah</Text>
          <Text style={styles.player}>⭐ Kevin De Bruyne</Text>
          <Text style={styles.player}>⭐ Vinicius Junior</Text>
        </View>

        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>🎯 Start Playing (Coming Soon)</Text>
        </TouchableOpacity>

        <Text style={styles.footer}>Backend API: ✅ Working | Frontend: ✅ Ready</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A1F12',
  },
  content: {
    padding: 24,
    paddingTop: 60,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFD700',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#B8B8B8',
    textAlign: 'center',
    marginBottom: 32,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#00A86B',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#1A472A',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2D5A3D',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  cardText: {
    fontSize: 14,
    color: '#B8B8B8',
  },
  feature: {
    fontSize: 15,
    color: '#FFFFFF',
    marginBottom: 8,
    paddingLeft: 8,
  },
  player: {
    fontSize: 15,
    color: '#FFD700',
    marginBottom: 6,
    paddingLeft: 8,
  },
  button: {
    backgroundColor: '#00A86B',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  footer: {
    fontSize: 14,
    color: '#00A86B',
    textAlign: 'center',
    marginTop: 24,
    fontWeight: '600',
  },
});


