import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';

const AVATARS = ['⚽', '🏆', '👑', '⭐', '🔥', '⚡', '🎯', '💎'];

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('⚽');
  const [language, setLanguage] = useState('tr');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();
  const { t } = useTranslation();

  const handleRegister = async () => {
    if (!email || !password || !name || !username || !age || !gender) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun');
      return;
    }

    setLoading(true);
    try {
      await register(email, password, name, username, parseInt(age), gender, language);
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Hata', error.message || 'Kayıt başarısız');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#0a0e27', '#162447', '#1f4068']} style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Animatable.View animation="fadeInDown" duration={1000} style={styles.header}>
            <Text style={styles.emoji}>⚽</Text>
            <Text style={styles.title}>Kayıt Ol</Text>
          </Animatable.View>

          <Animatable.View animation="fadeInUp" duration={1000} delay={300} style={styles.form}>
            <View style={styles.inputContainer}>
              <Ionicons name="person" size={20} color="#888" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Ad Soyad"
                placeholderTextColor="#888"
                value={name}
                onChangeText={setName}
              />
            </View>

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
              <Ionicons name="mail" size={20} color="#888" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="E-posta"
                placeholderTextColor="#888"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed" size={20} color="#888" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Şifre"
                placeholderTextColor="#888"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
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

            <View style={styles.genderContainer}>
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

            <View style={styles.avatarContainer}>
              <Text style={styles.label}>Avatar Seç:</Text>
              <View style={styles.avatarsGrid}>
                {AVATARS.map((avatar) => (
                  <TouchableOpacity
                    key={avatar}
                    style={[styles.avatarButton, selectedAvatar === avatar && styles.avatarButtonActive]}
                    onPress={() => setSelectedAvatar(avatar)}
                  >
                    <Text style={styles.avatarEmoji}>{avatar}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.langContainer}>
              <Text style={styles.label}>Dil:</Text>
              <View style={styles.langButtons}>
                <TouchableOpacity
                  style={[styles.langButton, language === 'tr' && styles.langButtonActive]}
                  onPress={() => setLanguage('tr')}
                >
                  <Text style={styles.langEmoji}>🇹🇷</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.langButton, language === 'en' && styles.langButtonActive]}
                  onPress={() => setLanguage('en')}
                >
                  <Text style={styles.langEmoji}>🇬🇧</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={styles.registerButton}
              onPress={handleRegister}
              disabled={loading}
            >
              <LinearGradient colors={['#00ff88', '#00cc6f']} style={styles.buttonGradient}>
                {loading ? (
                  <ActivityIndicator color="#1a1a2e" />
                ) : (
                  <Text style={styles.buttonText}>Kayıt Ol</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.back()} style={styles.linkContainer}>
              <Text style={styles.linkText}>Hesabınız var mı? </Text>
              <Text style={[styles.linkText, styles.linkBold]}>Giriş Yap</Text>
            </TouchableOpacity>
          </Animatable.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  keyboardView: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 24, paddingTop: 60 },
  header: { alignItems: 'center', marginBottom: 32 },
  emoji: { fontSize: 60, marginBottom: 12 },
  titleGradient: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1a1a2e', letterSpacing: 1 },
  subtitle: { fontSize: 18, color: '#fff', marginTop: 12, fontWeight: '600' },
  form: { width: '100%' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 12, marginBottom: 12, paddingHorizontal: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, height: 50, color: '#fff', fontSize: 16 },
  genderContainer: { marginBottom: 16 },
  label: { fontSize: 14, color: '#fff', fontWeight: '600', marginBottom: 8 },
  genderButtons: { flexDirection: 'row', gap: 12 },
  genderButton: { flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.1)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', alignItems: 'center' },
  genderButtonActive: { backgroundColor: '#00ff88', borderColor: '#00ff88' },
  genderText: { fontSize: 16, color: '#fff', fontWeight: '600' },
  genderTextActive: { color: '#1a1a2e' },
  avatarContainer: { marginBottom: 16 },
  avatarsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  avatarButton: { width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.2)' },
  avatarButtonActive: { borderColor: '#ffd700', backgroundColor: 'rgba(255,215,0,0.2)' },
  avatarEmoji: { fontSize: 28 },
  langContainer: { marginBottom: 16 },
  langButtons: { flexDirection: 'row', gap: 12 },
  langButton: { width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.2)' },
  langButtonActive: { borderColor: '#ffd700', backgroundColor: 'rgba(255,215,0,0.2)' },
  langEmoji: { fontSize: 32 },
  registerButton: { marginTop: 8, borderRadius: 12, overflow: 'hidden' },
  buttonGradient: { height: 50, justifyContent: 'center', alignItems: 'center' },
  buttonText: { color: '#1a1a2e', fontSize: 18, fontWeight: 'bold' },
  linkContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  linkText: { color: '#888', fontSize: 14 },
  linkBold: { color: '#ffd700', fontWeight: '700' },
});