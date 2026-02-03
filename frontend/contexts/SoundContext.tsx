import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Audio } from 'expo-av';
import { Platform } from 'react-native';

interface SoundContextType {
  playClick: () => void;
  playSuccess: () => void;
  playError: () => void;
  playGoal: () => void;
  playWhistle: () => void;
  toggleBackgroundMusic: () => void;
  isMusicPlaying: boolean;
  isSoundEnabled: boolean;
  toggleSound: () => void;
}

const SoundContext = createContext<SoundContextType | undefined>(undefined);

export const useSounds = () => {
  const context = useContext(SoundContext);
  if (!context) {
    throw new Error('useSounds must be used within a SoundProvider');
  }
  return context;
};

// Sound URLs - using free sound effects
const SOUND_URLS = {
  click: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
  success: 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3',
  error: 'https://assets.mixkit.co/active_storage/sfx/2955/2955-preview.mp3',
  goal: 'https://assets.mixkit.co/active_storage/sfx/2018/2018-preview.mp3',
  whistle: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
  background: 'https://assets.mixkit.co/active_storage/sfx/209/209-preview.mp3',
};

export const SoundProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const backgroundMusicRef = useRef<Audio.Sound | null>(null);
  const soundsRef = useRef<{ [key: string]: Audio.Sound | null }>({});

  useEffect(() => {
    // Configure audio mode
    const setupAudio = async () => {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          staysActiveInBackground: false,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });
      } catch (error) {
        console.log('Audio setup error:', error);
      }
    };

    if (Platform.OS !== 'web') {
      setupAudio();
    }

    return () => {
      // Cleanup sounds
      Object.values(soundsRef.current).forEach(async (sound) => {
        if (sound) {
          try {
            await sound.unloadAsync();
          } catch (e) {}
        }
      });
      if (backgroundMusicRef.current) {
        backgroundMusicRef.current.unloadAsync();
      }
    };
  }, []);

  const loadAndPlaySound = async (soundKey: keyof typeof SOUND_URLS) => {
    if (!isSoundEnabled) return;
    
    try {
      // For web, use HTML5 Audio
      if (Platform.OS === 'web') {
        const audio = new window.Audio(SOUND_URLS[soundKey]);
        audio.volume = 0.5;
        audio.play().catch(() => {});
        return;
      }

      // For native
      const { sound } = await Audio.Sound.createAsync(
        { uri: SOUND_URLS[soundKey] },
        { shouldPlay: true, volume: 0.5 }
      );
      
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync();
        }
      });
    } catch (error) {
      console.log('Sound play error:', error);
    }
  };

  const playClick = () => loadAndPlaySound('click');
  const playSuccess = () => loadAndPlaySound('success');
  const playError = () => loadAndPlaySound('error');
  const playGoal = () => loadAndPlaySound('goal');
  const playWhistle = () => loadAndPlaySound('whistle');

  const toggleBackgroundMusic = async () => {
    try {
      if (isMusicPlaying && backgroundMusicRef.current) {
        await backgroundMusicRef.current.stopAsync();
        await backgroundMusicRef.current.unloadAsync();
        backgroundMusicRef.current = null;
        setIsMusicPlaying(false);
      } else {
        if (Platform.OS === 'web') {
          // Web doesn't support background music well
          return;
        }
        
        const { sound } = await Audio.Sound.createAsync(
          { uri: SOUND_URLS.background },
          { shouldPlay: true, isLooping: true, volume: 0.3 }
        );
        backgroundMusicRef.current = sound;
        setIsMusicPlaying(true);
      }
    } catch (error) {
      console.log('Background music error:', error);
    }
  };

  const toggleSound = () => {
    setIsSoundEnabled(!isSoundEnabled);
    if (isMusicPlaying) {
      toggleBackgroundMusic();
    }
  };

  return (
    <SoundContext.Provider
      value={{
        playClick,
        playSuccess,
        playError,
        playGoal,
        playWhistle,
        toggleBackgroundMusic,
        isMusicPlaying,
        isSoundEnabled,
        toggleSound,
      }}
    >
      {children}
    </SoundContext.Provider>
  );
};
