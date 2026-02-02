import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';

const AVATARS = ['⚽', '🏆', '👑', '⭐', '🔥', '⚡', '🎯', '💎', '🚀', '⚡', '🎮', '🏅'];

export default function CompleteProfile() {
  const [username, setUsername] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('⚽');
  const [loading, setLoading] = useState(false);
  const { completeProfile } = useAuth();
  const router = useRouter();

  const handleComplete = async () => {
    if (!username || !age || !gender) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun');
      return;
    }

    setLoading(true);
    try {
      await completeProfile(username, parseInt(age), gender, selectedAvatar);
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Hata', error.message || 'Profil tamamlanamadı');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#0a0e27', '#162447', '#1f4068']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Animatable.View animation="fadeIn" duration={1000} style={styles.header}>
          <Text style={styles.emoji}>🎮</Text>
          <Text style={styles.title}>Profilini Tamamla</Text>
          <Text style={styles.subtitle}>Son bir adım kaldı!</Text>
        </Animatable.View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Ionicons name="at" size={20} color="#888" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Kullanıcı Adı"
              placeholderTextColor="#888"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="calendar" size={20} color="#888" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Yaş"
              placeholderTextColor="#888"
              value={age}
              onChangeText={setAge}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Cinsiyet:</Text>
            <View style={styles.genderButtons}>
              <TouchableOpacity
                style={[styles.genderButton, gender === 'male' && styles.genderButtonActive]}
                onPress={() => setGender('male')}
              >
                <Text style={[styles.genderText, gender === 'male' && styles.genderTextActive]}>
                  👨 Erkek
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.genderButton, gender === 'female' && styles.genderButtonActive]}
                onPress={() => setGender('female')}
              >
                <Text style={[styles.genderText, gender === 'female' && styles.genderTextActive]}>
                  👩 Kadın
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Avatar Seç:</Text>
            <View style={styles.avatarsGrid}>
              {AVATARS.map((avatar, i) => (
                <TouchableOpacity
                  key={i}
                  style={[styles.avatarButton, selectedAvatar === avatar && styles.avatarButtonActive]}
                  onPress={() => setSelectedAvatar(avatar)}
                >
                  <Text style={styles.avatarEmoji}>{avatar}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity
            style={styles.completeButton}
            onPress={handleComplete}
            disabled={loading}
          >
            <LinearGradient colors={['#00ff88', '#00cc6f']} style={styles.buttonGradient}>
              {loading ? (
                <ActivityIndicator color="#1a1a2e" />
              ) : (
                <Text style={styles.buttonText}>Tamamla & Oyna!</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { flexGrow: 1, padding: 24, paddingTop: 80 },
  header: { alignItems: 'center', marginBottom: 40 },
  emoji: { fontSize: 80, marginBottom: 16 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#ffd700', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#888' },
  form: { width: '100%' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 12, marginBottom: 16, paddingHorizontal: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, height: 50, color: '#fff', fontSize: 16 },
  section: { marginBottom: 20 },
  label: { fontSize: 16, color: '#fff', fontWeight: '600', marginBottom: 12 },
  genderButtons: { flexDirection: 'row', gap: 12 },
  genderButton: { flex: 1, paddingVertical: 16, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.1)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', alignItems: 'center' },
  genderButtonActive: { backgroundColor: '#00ff88', borderColor: '#00ff88' },
  genderText: { fontSize: 16, color: '#fff', fontWeight: '600' },
  genderTextActive: { color: '#1a1a2e' },
  avatarsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  avatarButton: { width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: 'rgba(255,255,255,0.2)' },
  avatarButtonActive: { borderColor: '#ffd700', backgroundColor: 'rgba(255,215,0,0.2)', transform: [{ scale: 1.1 }] },
  avatarEmoji: { fontSize: 32 },
  completeButton: { marginTop: 24, borderRadius: 12, overflow: 'hidden' },
  buttonGradient: { height: 56, justifyContent: 'center', alignItems: 'center' },
  buttonText: { color: '#1a1a2e', fontSize: 18, fontWeight: 'bold' },
  linkContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  linkText: { color: '#888', fontSize: 14 },
  linkBold: { color: '#ffd700', fontWeight: '700' },
});