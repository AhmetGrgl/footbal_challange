import React, { useState, useEffect } from 'react';
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
  ImageBackground,
  Animated,
  Easing,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { api } from '../../services/api';

const STADIUM_BG = require('../../assets/images/stadium-bg.png');

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const router = useRouter();

  // Ball animation
  const rotateAnim = new Animated.Value(0);

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert('Dikkat ⚠️', 'E-posta adresini girmelisin');
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Geçersiz E-posta ⚠️', 'Lütfen geçerli bir e-posta adresi gir');
      return;
    }

    setLoading(true);
    try {
      await api.forgotPassword(email);
      setSent(true);
    } catch (error: any) {
      // Show success anyway for security
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <ImageBackground source={STADIUM_BG} style={styles.backgroundImage} resizeMode="cover">
        <View style={styles.overlay}>
          <View style={styles.successContainer}>
            <Animatable.View animation="bounceIn" duration={1500} style={styles.successContent}>
              <Text style={styles.successEmoji}>📧</Text>
              <Text style={styles.successTitle}>E-posta Gönderildi!</Text>
              <Text style={styles.successText}>
                E-posta adresin sistemde kayıtlıysa, şifre sıfırlama bağlantısı gönderildi.
              </Text>
              <Text style={styles.successHint}>
                Spam/Gereksiz klasörünü kontrol etmeyi unutma!
              </Text>
              
              <TouchableOpacity 
                style={styles.backButton} 
                onPress={() => router.replace('/(auth)/login')}
              >
                <LinearGradient 
                  colors={['#00FF87', '#00CC6F']} 
                  style={styles.backButtonGradient}
                >
                  <Ionicons name="arrow-back" size={20} color="#1a1a2e" />
                  <Text style={styles.backButtonText}>Giriş Sayfasına Dön</Text>
                </LinearGradient>
              </TouchableOpacity>
            </Animatable.View>
          </View>
        </View>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground source={STADIUM_BG} style={styles.backgroundImage} resizeMode="cover">
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Back Button */}
            <TouchableOpacity style={styles.headerBackButton} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={28} color="#FFD700" />
            </TouchableOpacity>

            {/* Header */}
            <Animatable.View animation="bounceIn" duration={1500} style={styles.header}>
              <Animated.Text style={[styles.lockEmoji, { transform: [{ rotate: spin }] }]}>
                🔐
              </Animated.Text>
              <Text style={styles.title}>Şifremi Unuttum</Text>
              <Text style={styles.subtitle}>
                Endişelenme, herkese olur! E-posta adresini gir, sana şifre sıfırlama bağlantısı gönderelim.
              </Text>
            </Animatable.View>

            {/* Form */}
            <Animatable.View animation="fadeInUp" duration={1000} delay={300} style={styles.formContainer}>
              <LinearGradient
                colors={['rgba(0,0,0,0.85)', 'rgba(0,0,0,0.7)']}
                style={styles.formGradient}
              >
                {/* Email Input */}
                <View style={styles.inputContainer}>
                  <Ionicons name="mail" size={22} color="#FFD700" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="E-posta adresin"
                    placeholderTextColor="rgba(255,255,255,0.5)"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                  />
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={handleForgotPassword}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  <LinearGradient 
                    colors={['#FFD700', '#FFA500']} 
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.buttonGradient}
                  >
                    {loading ? (
                      <View style={styles.loadingContainer}>
                        <Animated.Text style={[styles.loadingBall, { transform: [{ rotate: spin }] }]}>⚽</Animated.Text>
                        <Text style={styles.loadingText}>Gönderiliyor...</Text>
                      </View>
                    ) : (
                      <View style={styles.buttonContent}>
                        <Ionicons name="send" size={20} color="#1a1a2e" />
                        <Text style={styles.buttonText}>Sıfırlama Bağlantısı Gönder</Text>
                      </View>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                {/* Back to Login */}
                <TouchableOpacity onPress={() => router.back()} style={styles.linkContainer}>
                  <Ionicons name="arrow-back" size={18} color="#FFD700" />
                  <Text style={styles.linkText}> Giriş sayfasına dön</Text>
                </TouchableOpacity>
              </LinearGradient>
            </Animatable.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 20, 40, 0.75)',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    paddingTop: 60,
  },
  headerBackButton: {
    position: 'absolute',
    top: 20,
    left: 10,
    padding: 10,
    zIndex: 10,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  lockEmoji: {
    fontSize: 70,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFD700',
    letterSpacing: 1,
    marginBottom: 12,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 22,
  },
  formContainer: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  formGradient: {
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.2)',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 14,
    marginBottom: 20,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.3)',
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    height: '100%',
  },
  submitButton: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  buttonGradient: {
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  buttonText: {
    color: '#1a1a2e',
    fontSize: 16,
    fontWeight: '800',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  loadingBall: {
    fontSize: 20,
  },
  loadingText: {
    color: '#1a1a2e',
    fontSize: 16,
    fontWeight: '600',
  },
  linkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  linkText: {
    color: '#FFD700',
    fontSize: 15,
    fontWeight: '600',
  },
  // Success Screen
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  successContent: {
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.3)',
  },
  successEmoji: {
    fontSize: 80,
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#00FF87',
    marginBottom: 16,
  },
  successText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 24,
  },
  successHint: {
    fontSize: 13,
    color: '#FFD700',
    textAlign: 'center',
    marginBottom: 24,
  },
  backButton: {
    borderRadius: 14,
    overflow: 'hidden',
    width: '100%',
  },
  backButtonGradient: {
    height: 52,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  backButtonText: {
    color: '#1a1a2e',
    fontSize: 16,
    fontWeight: '700',
  },
});
