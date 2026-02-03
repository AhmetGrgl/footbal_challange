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
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { api } from '../../services/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const router = useRouter();

  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert('Hata', 'Lütfen e-posta adresinizi girin');
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Hata', 'Geçerli bir e-posta adresi girin');
      return;
    }

    setLoading(true);
    try {
      await api.forgotPassword(email);
      setSent(true);
      Alert.alert(
        'Başarılı', 
        'E-posta adresiniz sistemde kayıtlıysa, şifre sıfırlama bağlantısı gönderildi.',
        [{ text: 'Tamam', onPress: () => router.back() }]
      );
    } catch (error: any) {
      // Even if email not found, show success for security
      setSent(true);
      Alert.alert(
        'Başarılı', 
        'E-posta adresiniz sistemde kayıtlıysa, şifre sıfırlama bağlantısı gönderildi.',
        [{ text: 'Tamam', onPress: () => router.back() }]
      );
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
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>

          <Animatable.View animation="fadeInDown" duration={1000} style={styles.header}>
            <Text style={styles.emoji}>🔐</Text>
            <Text style={styles.title}>Şifremi Unuttum</Text>
            <Text style={styles.subtitle}>E-posta adresinizi girin, size şifre sıfırlama bağlantısı gönderelim.</Text>
          </Animatable.View>

          <Animatable.View animation="fadeInUp" duration={1000} delay={300} style={styles.form}>
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
                autoComplete="email"
              />
            </View>

            <TouchableOpacity
              style={[styles.submitButton, sent && styles.submitButtonDisabled]}
              onPress={handleForgotPassword}
              disabled={loading || sent}
            >
              <LinearGradient 
                colors={sent ? ['#666', '#444'] : ['#00ff88', '#00cc6f']} 
                style={styles.buttonGradient}
              >
                {loading ? (
                  <ActivityIndicator color="#1a1a2e" />
                ) : sent ? (
                  <View style={styles.sentContainer}>
                    <Ionicons name="checkmark-circle" size={24} color="#fff" />
                    <Text style={styles.sentText}>Gönderildi</Text>
                  </View>
                ) : (
                  <Text style={styles.buttonText}>Sıfırlama Bağlantısı Gönder</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.back()} style={styles.linkContainer}>
              <Text style={styles.linkText}>Geri dön - </Text>
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
  scrollContent: { flexGrow: 1, padding: 24, paddingTop: 60 },
  backButton: { 
    position: 'absolute', 
    top: 20, 
    left: 0, 
    padding: 10,
    zIndex: 10,
  },
  header: { alignItems: 'center', marginBottom: 48, marginTop: 40 },
  emoji: { fontSize: 60, marginBottom: 16 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 12 },
  subtitle: { fontSize: 14, color: '#aaa', textAlign: 'center', paddingHorizontal: 20 },
  form: { width: '100%' },
  inputContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: 'rgba(255,255,255,0.1)', 
    borderRadius: 12, 
    marginBottom: 16, 
    paddingHorizontal: 16, 
    borderWidth: 1, 
    borderColor: 'rgba(255,255,255,0.2)' 
  },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, height: 50, color: '#fff', fontSize: 16 },
  submitButton: { marginTop: 8, borderRadius: 12, overflow: 'hidden' },
  submitButtonDisabled: { opacity: 0.8 },
  buttonGradient: { height: 50, justifyContent: 'center', alignItems: 'center' },
  buttonText: { color: '#1a1a2e', fontSize: 16, fontWeight: 'bold' },
  sentContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sentText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  linkContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  linkText: { color: '#888', fontSize: 14 },
  linkBold: { color: '#ffd700', fontWeight: '700' },
});
