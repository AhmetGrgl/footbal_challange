import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

import tr from './tr.json';
import en from './en.json';

const LANGUAGE_KEY = '@football_challenge_language';

const resources = {
  tr: { translation: tr },
  en: { translation: en },
};

const initI18n = async () => {
  let savedLanguage = 'tr'; // Default to Turkish
  
  // Only use AsyncStorage on mobile
  if (Platform.OS !== 'web') {
    try {
      savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY) || 'tr';
    } catch (error) {
      console.log('Failed to load language from storage:', error);
    }
  } else {
    // For web, use localStorage
    if (typeof window !== 'undefined' && window.localStorage) {
      savedLanguage = window.localStorage.getItem(LANGUAGE_KEY) || 'tr';
    }
  }
  
  if (!savedLanguage) {
    const deviceLanguage = Localization.locale.split('-')[0];
    savedLanguage = ['tr', 'en'].includes(deviceLanguage) ? deviceLanguage : 'tr';
  }

  i18n
    .use(initReactI18next)
    .init({
      resources,
      lng: savedLanguage,
      fallbackLng: 'tr',
      interpolation: {
        escapeValue: false,
      },
    });
};

export const changeLanguage = async (language: string) => {
  if (Platform.OS !== 'web') {
    await AsyncStorage.setItem(LANGUAGE_KEY, language);
  } else {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(LANGUAGE_KEY, language);
    }
  }
  i18n.changeLanguage(language);
};

initI18n();

export default i18n;
