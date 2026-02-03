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
  Switch,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSounds } from '../../contexts/SoundContext';

const STADIUM_BG = require('../../assets/images/stadium-bg.png');

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [onlineCount] = useState(Math.floor(Math.random() * 5000) + 8000);
  const { login, loginWithGoogle } = useAuth();
  const router = useRouter();
  const { playClick, playSuccess, playError, playWhistle } = useSounds();

  // Ball rotation animation
  const rotateAnim = new Animated.Value(0);

  useEffect(() => {
    // Load remembered email
    loadRememberedEmail();
    
    // Start ball animation
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const loadRememberedEmail = async () => {
    try {
      const savedEmail = await AsyncStorage.getItem('@remembered_email');
      if (savedEmail) {
        setEmail(savedEmail);
        setRememberMe(true);
      }
    } catch (e) {
      console.log('Error loading remembered email');
    }
  };

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Dikkat! ⚠️', 'E-posta ve şifre alanlarını doldurmalısın');
      return;
    }

    setLoading(true);
    try {
      // Save email if remember me is checked
      if (rememberMe) {
        await AsyncStorage.setItem('@remembered_email', email);
      } else {
        await AsyncStorage.removeItem('@remembered_email');
      }
      
      await login(email, password);
      router.replace('/(tabs)');
    } catch (error: any) {
      const errorMsg = error.message || 'Giriş başarısız';
      if (errorMsg.includes('401') || errorMsg.toLowerCase().includes('invalid') || errorMsg.toLowerCase().includes('hatal')) {
        Alert.alert('Hatalı Giriş ⚠️', 'E-posta veya şifre yanlış, tekrar dene!');
      } else {
        Alert.alert('Bir Sorun Oluştu 😕', errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
    } catch (error: any) {
      Alert.alert('Google Girişi Başarısız 😕', error.message || 'Tekrar dene');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground source={STADIUM_BG} style={styles.backgroundImage} resizeMode="cover">
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Online Users Badge */}
            <Animatable.View animation="fadeIn" delay={500} style={styles.onlineBadge}>
              <View style={styles.onlineDot} />
              <Text style={styles.onlineText}>Şu an {onlineCount.toLocaleString()}+ futbolsever oynuyor!</Text>
            </Animatable.View>

            {/* Header with Animated Ball */}
            <Animatable.View animation="bounceIn" duration={1500} style={styles.header}>
              <Animated.Text style={[styles.ballEmoji, { transform: [{ rotate: spin }] }]}>
                ⚽
              </Animated.Text>
              <LinearGradient
                colors={['#FFD700', '#FFA500', '#FF6B00']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.titleGradient}
              >
                <Text style={styles.title}>FUTBOL CHALLENGE</Text>
              </LinearGradient>
              <Text style={styles.subtitle}>Bilgini Konuştur! 🏆</Text>
            </Animatable.View>

            {/* Login Form */}
            <Animatable.View animation="fadeInUp" duration={1000} delay={300} style={styles.formContainer}>
              <LinearGradient
                colors={['rgba(0,0,0,0.8)', 'rgba(0,0,0,0.6)']}
                style={styles.formGradient}
              >
                <Text style={styles.formTitle}>Giriş Yap</Text>

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

                {/* Password Input */}
                <View style={styles.inputContainer}>
                  <Ionicons name="lock-closed" size={22} color="#FFD700" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Şifren"
                    placeholderTextColor="rgba(255,255,255,0.5)"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
                    <Ionicons 
                      name={showPassword ? "eye-off" : "eye"} 
                      size={22} 
                      color="rgba(255,255,255,0.7)" 
                    />
                  </TouchableOpacity>
                </View>

                {/* Remember Me & Forgot Password Row */}
                <View style={styles.optionsRow}>
                  <View style={styles.rememberContainer}>
                    <Switch
                      value={rememberMe}
                      onValueChange={setRememberMe}
                      trackColor={{ false: '#333', true: '#00cc6f' }}
                      thumbColor={rememberMe ? '#FFD700' : '#888'}
                      style={styles.switch}
                    />
                    <Text style={styles.rememberText}>Beni Hatırla</Text>
                  </View>
                  <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password')}>
                    <Text style={styles.forgotText}>Şifremi Unuttum</Text>
                  </TouchableOpacity>
                </View>

                {/* Login Button */}
                <TouchableOpacity
                  style={styles.loginButton}
                  onPress={handleLogin}
                  disabled={loading}
                  testID="login-button"
                  activeOpacity={0.8}
                >
                  <LinearGradient 
                    colors={['#00FF87', '#00CC6F', '#009950']} 
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.buttonGradient}
                  >
                    {loading ? (
                      <View style={styles.loadingContainer}>
                        <Animated.Text style={[styles.loadingBall, { transform: [{ rotate: spin }] }]}>⚽</Animated.Text>
                        <Text style={styles.loadingText}>Giriş yapılıyor...</Text>
                      </View>
                    ) : (
                      <View style={styles.buttonContent}>
                        <Text style={styles.buttonText}>Maça Başla</Text>
                        <Text style={styles.buttonEmoji}>⚽</Text>
                      </View>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                {/* Divider */}
                <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>VEYA</Text>
                  <View style={styles.dividerLine} />
                </View>

                {/* Google Login */}
                <TouchableOpacity
                  style={styles.googleButton}
                  onPress={handleGoogleLogin}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  <Ionicons name="logo-google" size={24} color="#fff" />
                  <Text style={styles.googleButtonText}>Google ile Giriş Yap</Text>
                </TouchableOpacity>

                {/* Register Link */}
                <TouchableOpacity onPress={() => router.push('/(auth)/register')} style={styles.linkContainer}>
                  <Text style={styles.linkText}>Hesabın yok mu? </Text>
                  <Text style={styles.linkBold}>Takıma Katıl! 🏟️</Text>
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
    paddingTop: 50,
    paddingBottom: 30,
  },
  onlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 200, 100, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 200, 100, 0.3)',
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00FF87',
    marginRight: 8,
  },
  onlineText: {
    color: '#00FF87',
    fontSize: 13,
    fontWeight: '600',
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  ballEmoji: {
    fontSize: 70,
    marginBottom: 15,
  },
  titleGradient: {
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 16,
    marginBottom: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: '#1a1a2e',
    letterSpacing: 2,
    textAlign: 'center',
    textShadowColor: 'rgba(255,255,255,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  subtitle: {
    fontSize: 18,
    color: '#FFD700',
    fontWeight: '700',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
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
  formTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 14,
    marginBottom: 16,
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
  eyeButton: {
    padding: 8,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  rememberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  switch: {
    transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }],
  },
  rememberText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    marginLeft: 4,
  },
  forgotText: {
    color: '#FFD700',
    fontSize: 13,
    fontWeight: '600',
  },
  loginButton: {
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: 8,
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
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 1,
  },
  buttonEmoji: {
    fontSize: 24,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  loadingBall: {
    fontSize: 24,
  },
  loadingText: {
    color: '#1a1a2e',
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  dividerText: {
    color: 'rgba(255,255,255,0.5)',
    marginHorizontal: 16,
    fontSize: 12,
    fontWeight: '600',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    height: 52,
    borderRadius: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  googleButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  linkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  linkText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 15,
  },
  linkBold: {
    color: '#FFD700',
    fontWeight: '700',
    fontSize: 15,
  },
});
