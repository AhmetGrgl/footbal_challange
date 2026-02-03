import React, { useState, useEffect, useCallback } from 'react';
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
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { api } from '../../services/api';
import { useSounds } from '../../contexts/SoundContext';

const STADIUM_BG = require('../../assets/images/stadium-bg.png');

const AVATARS = [
  { emoji: '⚽', name: 'Futbol' },
  { emoji: '🏆', name: 'Kupa' },
  { emoji: '👑', name: 'Kral' },
  { emoji: '⭐', name: 'Yıldız' },
  { emoji: '🔥', name: 'Ateş' },
  { emoji: '⚡', name: 'Şimşek' },
  { emoji: '🎯', name: 'Hedef' },
  { emoji: '💎', name: 'Elmas' },
];

export default function Register() {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('⚽');
  const [language, setLanguage] = useState('tr');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Validation states
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid'>('idle');
  const [usernameMessage, setUsernameMessage] = useState('');
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong' | null>(null);
  
  const { register } = useAuth();
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

  // Check username availability
  useEffect(() => {
    const checkUsername = async () => {
      if (!username || username.length < 3) {
        setUsernameStatus('idle');
        setUsernameMessage('');
        return;
      }

      // Validate format
      if (!/^[a-zA-Z0-9]+$/.test(username)) {
        setUsernameStatus('invalid');
        setUsernameMessage('Sadece harf ve rakam kullanabilirsin');
        return;
      }

      if (username.length > 20) {
        setUsernameStatus('invalid');
        setUsernameMessage('En fazla 20 karakter olabilir');
        return;
      }

      setUsernameStatus('checking');
      try {
        const result = await api.checkUsernameAvailable(username);
        if (result.available) {
          setUsernameStatus('available');
          setUsernameMessage('Bu kullanıcı adı müsait ✓');
        } else {
          setUsernameStatus('taken');
          setUsernameMessage(result.error || 'Bu kullanıcı adı alınmış');
        }
      } catch (e) {
        setUsernameStatus('idle');
      }
    };

    const timer = setTimeout(checkUsername, 500);
    return () => clearTimeout(timer);
  }, [username]);

  // Calculate password strength
  useEffect(() => {
    if (!password) {
      setPasswordStrength(null);
      return;
    }

    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 2) setPasswordStrength('weak');
    else if (score <= 3) setPasswordStrength('medium');
    else setPasswordStrength('strong');
  }, [password]);

  const getPasswordStrengthColor = () => {
    switch (passwordStrength) {
      case 'weak': return '#FF4444';
      case 'medium': return '#FFB800';
      case 'strong': return '#00CC6F';
      default: return '#333';
    }
  };

  const getPasswordStrengthText = () => {
    switch (passwordStrength) {
      case 'weak': return 'Zayıf 😅';
      case 'medium': return 'Orta 💪';
      case 'strong': return 'Güçlü 🔥';
      default: return '';
    }
  };

  const getPasswordStrengthWidth = () => {
    switch (passwordStrength) {
      case 'weak': return '33%';
      case 'medium': return '66%';
      case 'strong': return '100%';
      default: return '0%';
    }
  };

  const handleRegister = async () => {
    // Validations
    if (!name || !username || !email || !password || !passwordConfirm || !age || !gender) {
      Alert.alert('Eksik Bilgi ⚠️', 'Lütfen tüm alanları doldur');
      return;
    }

    if (usernameStatus === 'taken' || usernameStatus === 'invalid') {
      Alert.alert('Kullanıcı Adı Sorunu ⚠️', usernameMessage);
      return;
    }

    if (password !== passwordConfirm) {
      Alert.alert('Şifre Uyuşmuyor ⚠️', 'Şifreler aynı değil, kontrol et');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Şifre Çok Kısa ⚠️', 'Şifren en az 6 karakter olmalı');
      return;
    }

    if (!acceptedTerms) {
      Alert.alert('Şartlar ⚠️', 'Kullanım şartlarını kabul etmelisin');
      return;
    }

    setLoading(true);
    try {
      await register(email, password, name, username, parseInt(age), gender, language);
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Kayıt Başarısız 😕', error.message || 'Bir hata oluştu');
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
            {/* Header */}
            <Animatable.View animation="bounceIn" duration={1500} style={styles.header}>
              <Animated.Text style={[styles.ballEmoji, { transform: [{ rotate: spin }] }]}>
                ⚽
              </Animated.Text>
              <Text style={styles.title}>Takıma Katıl!</Text>
              <Text style={styles.subtitle}>Hesabını oluştur ve oynamaya başla 🏆</Text>
            </Animatable.View>

            {/* Form */}
            <Animatable.View animation="fadeInUp" duration={1000} delay={300} style={styles.formContainer}>
              <LinearGradient
                colors={['rgba(0,0,0,0.85)', 'rgba(0,0,0,0.7)']}
                style={styles.formGradient}
              >
                {/* Name */}
                <View style={styles.inputContainer}>
                  <Ionicons name="person" size={22} color="#FFD700" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Ad Soyad"
                    placeholderTextColor="rgba(255,255,255,0.5)"
                    value={name}
                    onChangeText={setName}
                  />
                </View>

                {/* Username */}
                <View style={[
                  styles.inputContainer,
                  usernameStatus === 'available' && styles.inputSuccess,
                  (usernameStatus === 'taken' || usernameStatus === 'invalid') && styles.inputError,
                ]}>
                  <Ionicons name="at" size={22} color="#FFD700" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Kullanıcı Adı"
                    placeholderTextColor="rgba(255,255,255,0.5)"
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                  />
                  {usernameStatus === 'checking' && <ActivityIndicator size="small" color="#FFD700" />}
                  {usernameStatus === 'available' && <Ionicons name="checkmark-circle" size={22} color="#00CC6F" />}
                  {(usernameStatus === 'taken' || usernameStatus === 'invalid') && <Ionicons name="close-circle" size={22} color="#FF4444" />}
                </View>
                {usernameMessage && (
                  <Text style={[
                    styles.statusMessage,
                    usernameStatus === 'available' ? styles.successText : styles.errorText
                  ]}>
                    {usernameMessage}
                  </Text>
                )}

                {/* Email */}
                <View style={styles.inputContainer}>
                  <Ionicons name="mail" size={22} color="#FFD700" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="E-posta"
                    placeholderTextColor="rgba(255,255,255,0.5)"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                {/* Password */}
                <View style={styles.inputContainer}>
                  <Ionicons name="lock-closed" size={22} color="#FFD700" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Şifre (en az 6 karakter)"
                    placeholderTextColor="rgba(255,255,255,0.5)"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
                    <Ionicons name={showPassword ? "eye-off" : "eye"} size={22} color="rgba(255,255,255,0.7)" />
                  </TouchableOpacity>
                </View>

                {/* Password Strength Indicator */}
                {password.length > 0 && (
                  <View style={styles.strengthContainer}>
                    <View style={styles.strengthBar}>
                      <Animated.View 
                        style={[
                          styles.strengthFill, 
                          { 
                            width: getPasswordStrengthWidth(),
                            backgroundColor: getPasswordStrengthColor() 
                          }
                        ]} 
                      />
                    </View>
                    <Text style={[styles.strengthText, { color: getPasswordStrengthColor() }]}>
                      {getPasswordStrengthText()}
                    </Text>
                  </View>
                )}

                {/* Password Confirm */}
                <View style={[
                  styles.inputContainer,
                  passwordConfirm && password === passwordConfirm && styles.inputSuccess,
                  passwordConfirm && password !== passwordConfirm && styles.inputError,
                ]}>
                  <Ionicons name="lock-closed" size={22} color="#FFD700" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Şifre Tekrar"
                    placeholderTextColor="rgba(255,255,255,0.5)"
                    value={passwordConfirm}
                    onChangeText={setPasswordConfirm}
                    secureTextEntry={!showPasswordConfirm}
                  />
                  <TouchableOpacity onPress={() => setShowPasswordConfirm(!showPasswordConfirm)} style={styles.eyeButton}>
                    <Ionicons name={showPasswordConfirm ? "eye-off" : "eye"} size={22} color="rgba(255,255,255,0.7)" />
                  </TouchableOpacity>
                </View>
                {passwordConfirm && password !== passwordConfirm && (
                  <Text style={[styles.statusMessage, styles.errorText]}>Şifreler eşleşmiyor ❌</Text>
                )}
                {passwordConfirm && password === passwordConfirm && password.length >= 6 && (
                  <Text style={[styles.statusMessage, styles.successText]}>Şifreler eşleşiyor ✓</Text>
                )}

                {/* Age */}
                <View style={styles.inputContainer}>
                  <Ionicons name="calendar" size={22} color="#FFD700" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Yaş"
                    placeholderTextColor="rgba(255,255,255,0.5)"
                    value={age}
                    onChangeText={setAge}
                    keyboardType="numeric"
                    maxLength={2}
                  />
                </View>

                {/* Gender Selection */}
                <Text style={styles.sectionLabel}>Cinsiyet</Text>
                <View style={styles.genderButtons}>
                  <TouchableOpacity
                    style={[styles.genderButton, gender === 'male' && styles.genderButtonActive]}
                    onPress={() => setGender('male')}
                  >
                    <Text style={styles.genderEmoji}>👨</Text>
                    <Text style={[styles.genderText, gender === 'male' && styles.genderTextActive]}>Erkek</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.genderButton, gender === 'female' && styles.genderButtonActive]}
                    onPress={() => setGender('female')}
                  >
                    <Text style={styles.genderEmoji}>👩</Text>
                    <Text style={[styles.genderText, gender === 'female' && styles.genderTextActive]}>Kadın</Text>
                  </TouchableOpacity>
                </View>

                {/* Avatar Selection */}
                <Text style={styles.sectionLabel}>Avatar Seç</Text>
                <View style={styles.avatarsGrid}>
                  {AVATARS.map((avatar) => (
                    <TouchableOpacity
                      key={avatar.emoji}
                      style={[styles.avatarButton, selectedAvatar === avatar.emoji && styles.avatarButtonActive]}
                      onPress={() => setSelectedAvatar(avatar.emoji)}
                    >
                      <Text style={styles.avatarEmoji}>{avatar.emoji}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Language Selection */}
                <Text style={styles.sectionLabel}>Dil</Text>
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

                {/* Terms Checkbox */}
                <TouchableOpacity 
                  style={styles.termsContainer} 
                  onPress={() => setAcceptedTerms(!acceptedTerms)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.checkbox, acceptedTerms && styles.checkboxChecked]}>
                    {acceptedTerms && <Ionicons name="checkmark" size={16} color="#1a1a2e" />}
                  </View>
                  <Text style={styles.termsText}>
                    <Text style={styles.termsLink}>Kullanım Şartları</Text> ve{' '}
                    <Text style={styles.termsLink}>KVKK</Text>'yı kabul ediyorum
                  </Text>
                </TouchableOpacity>

                {/* Register Button */}
                <TouchableOpacity
                  style={[styles.registerButton, !acceptedTerms && styles.registerButtonDisabled]}
                  onPress={handleRegister}
                  disabled={loading || !acceptedTerms}
                  activeOpacity={0.8}
                >
                  <LinearGradient 
                    colors={acceptedTerms ? ['#00FF87', '#00CC6F', '#009950'] : ['#555', '#444', '#333']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.buttonGradient}
                  >
                    {loading ? (
                      <View style={styles.loadingContainer}>
                        <Animated.Text style={[styles.loadingBall, { transform: [{ rotate: spin }] }]}>⚽</Animated.Text>
                        <Text style={styles.loadingText}>Hesap oluşturuluyor...</Text>
                      </View>
                    ) : (
                      <View style={styles.buttonContent}>
                        <Text style={[styles.buttonText, !acceptedTerms && styles.buttonTextDisabled]}>Takıma Katıl</Text>
                        <Text style={styles.buttonEmoji}>⚽</Text>
                      </View>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                {/* Login Link */}
                <TouchableOpacity onPress={() => router.back()} style={styles.linkContainer}>
                  <Text style={styles.linkText}>Zaten hesabın var mı? </Text>
                  <Text style={styles.linkBold}>Giriş Yap 🚀</Text>
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
    padding: 20,
    paddingTop: 50,
    paddingBottom: 30,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  ballEmoji: {
    fontSize: 60,
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFD700',
    letterSpacing: 1,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 8,
  },
  formContainer: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  formGradient: {
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.2)',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 14,
    marginBottom: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.3)',
    height: 52,
  },
  inputSuccess: {
    borderColor: '#00CC6F',
  },
  inputError: {
    borderColor: '#FF4444',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 15,
    height: '100%',
  },
  eyeButton: {
    padding: 8,
  },
  statusMessage: {
    fontSize: 12,
    marginTop: -8,
    marginBottom: 12,
    marginLeft: 16,
  },
  successText: {
    color: '#00CC6F',
  },
  errorText: {
    color: '#FF4444',
  },
  strengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: -8,
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  strengthBar: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    marginRight: 10,
  },
  strengthFill: {
    height: '100%',
    borderRadius: 2,
  },
  strengthText: {
    fontSize: 12,
    fontWeight: '600',
  },
  sectionLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
    marginBottom: 10,
    marginTop: 4,
  },
  genderButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  genderButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    gap: 8,
  },
  genderButtonActive: {
    backgroundColor: 'rgba(0,204,111,0.3)',
    borderColor: '#00CC6F',
  },
  genderEmoji: {
    fontSize: 20,
  },
  genderText: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '600',
  },
  genderTextActive: {
    color: '#fff',
  },
  avatarsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  avatarButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  avatarButtonActive: {
    borderColor: '#FFD700',
    backgroundColor: 'rgba(255,215,0,0.2)',
  },
  avatarEmoji: {
    fontSize: 24,
  },
  langButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  langButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  langButtonActive: {
    borderColor: '#FFD700',
    backgroundColor: 'rgba(255,215,0,0.2)',
  },
  langEmoji: {
    fontSize: 28,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#FFD700',
    borderColor: '#FFD700',
  },
  termsText: {
    flex: 1,
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
  },
  termsLink: {
    color: '#FFD700',
    fontWeight: '600',
  },
  registerButton: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  registerButtonDisabled: {
    opacity: 0.7,
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
  buttonTextDisabled: {
    color: 'rgba(255,255,255,0.5)',
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
  linkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
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
