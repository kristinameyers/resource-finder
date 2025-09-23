import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Language = 'en' | 'es' | 'tl';

export interface LanguageContextType {
  currentLanguage: Language;
  setLanguage: (language: Language) => Promise<void>;
  translate: (text: string) => Promise<string>;
  translateBatch: (texts: string[], targetLanguage: Language) => Promise<string[]>;
  isTranslating: boolean;
  clearTranslationCache: () => Promise<void>;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [currentLanguage, setCurrentLanguage] = useState<Language>('en');
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationCache, setTranslationCache] = useState<Map<string, string>>(new Map());

  const CACHE_VERSION = 'v1.0.1';
  const CACHE_KEY = 'translation-cache';
  const CACHE_VERSION_KEY = 'translation-cache-version';
  const LANGUAGE_KEY = 'app-language';

  // Load cached translations and language preference from AsyncStorage
  useEffect(() => {
    async function loadSettings() {
      try {
        const cachedVersion = await AsyncStorage.getItem(CACHE_VERSION_KEY);
        if (cachedVersion !== CACHE_VERSION) {
          await AsyncStorage.removeItem(CACHE_KEY);
          await AsyncStorage.setItem(CACHE_VERSION_KEY, CACHE_VERSION);
        } else {
          const cached = await AsyncStorage.getItem(CACHE_KEY);
          if (cached) {
            const parsedCache = JSON.parse(cached);
            setTranslationCache(new Map(Object.entries(parsedCache)));
          }
        }

        const savedLanguage = (await AsyncStorage.getItem(LANGUAGE_KEY)) as Language | null;
        if (savedLanguage && ['en', 'es', 'tl'].includes(savedLanguage)) {
          setCurrentLanguage(savedLanguage);
        }
      } catch (error) {
        setTranslationCache(new Map());
      }
    }
    loadSettings();
  }, []);

  // Save translations to AsyncStorage when cache updates
  useEffect(() => {
    async function saveCacheToStorage() {
      try {
        const cacheObject = Object.fromEntries(translationCache);
        await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(cacheObject));
        await AsyncStorage.setItem(CACHE_VERSION_KEY, CACHE_VERSION);
      } catch (error) {
        // optionally log error
      }
    }
    if (translationCache.size > 0) {
      saveCacheToStorage();
    }
  }, [translationCache]);

  // Save language preference when changed
  useEffect(() => {
    AsyncStorage.setItem(LANGUAGE_KEY, currentLanguage);
  }, [currentLanguage]);

  const setLanguage = async (language: Language) => {
    setCurrentLanguage(language);
    await AsyncStorage.setItem(LANGUAGE_KEY, language);
    setIsTranslating(false);
  };

  // Clear translation cache
  const clearTranslationCache = async () => {
    setTranslationCache(new Map());
    await AsyncStorage.removeItem(CACHE_KEY);
    await AsyncStorage.removeItem(CACHE_VERSION_KEY);
  };

  // Batch translation function for multiple texts
  const translateBatch = async (
    texts: string[],
    targetLanguage: Language
  ): Promise<string[]> => {
    if (targetLanguage === 'en' || texts.length === 0) {
      return texts;
    }
    const uncachedTexts: string[] = [];
    const uncachedIndices: number[] = [];
    const results: string[] = Array(texts.length);

    texts.forEach((text, index) => {
      const cacheKey = `${text}-${targetLanguage}`;
      if (translationCache.has(cacheKey)) {
        results[index] = translationCache.get(cacheKey)!;
      } else if (text && text.trim() !== '') {
        uncachedTexts.push(text.trim());
        uncachedIndices.push(index);
      } else {
        results[index] = text;
      }
    });

    if (uncachedTexts.length === 0) {
      return results;
    }

    try {
      setIsTranslating(true);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      const response = await fetch('/api/translate-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          texts: uncachedTexts,
          targetLanguage: targetLanguage,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        const result = await response.json();
        const translations = result.translations || uncachedTexts;
        uncachedIndices.forEach((originalIndex, batchIndex) => {
          const translatedText = translations[batchIndex] || uncachedTexts[batchIndex];
          const cacheKey = `${uncachedTexts[batchIndex]}-${targetLanguage}`;
          setTranslationCache(prev => new Map(prev).set(cacheKey, translatedText));
          results[originalIndex] = translatedText;
        });
      } else {
        uncachedIndices.forEach((originalIndex, batchIndex) => {
          results[originalIndex] = uncachedTexts[batchIndex];
        });
      }
    } catch (error) {
      uncachedIndices.forEach((originalIndex, batchIndex) => {
        results[originalIndex] = uncachedTexts[batchIndex];
      });
    } finally {
      setIsTranslating(false);
    }
    return results;
  };

  // Single translation
  const translate = async (text: string): Promise<string> => {
    if (currentLanguage === 'en' || !text || text.trim() === '') {
      return text;
    }
    const cacheKey = `${text}-${currentLanguage}`;
    if (translationCache.has(cacheKey)) {
      return translationCache.get(cacheKey)!;
    }

    try {
      setIsTranslating(true);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: text.trim(),
          targetLanguage: currentLanguage,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        return text;
      }

      const result = await response.json();
      const translatedText = result.translatedText || text;
      setTranslationCache(prev => new Map(prev).set(cacheKey, translatedText));
      return translatedText;
    } catch (error) {
      return text;
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <LanguageContext.Provider
      value={{
        currentLanguage,
        setLanguage,
        translate,
        translateBatch,
        isTranslating,
        clearTranslationCache,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}
