import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Language = 'en' | 'es' | 'tl';

export interface LanguageContextType {
  currentLanguage: Language;
  setLanguage: (language: Language) => void;
  translate: (text: string) => Promise<string>;
  translateBatch: (texts: string[], targetLanguage: Language) => Promise<string[]>;
  isTranslating: boolean;
  clearTranslationCache: () => void;
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
  
  // Cache version for invalidation - uses stable version that changes with app updates
  const CACHE_VERSION = 'v1.0.1';
  const CACHE_KEY = 'translation-cache';
  const CACHE_VERSION_KEY = 'translation-cache-version';
  
  // Load cached translations from localStorage on mount
  useEffect(() => {
    const loadCachedTranslations = () => {
      try {
        const cachedVersion = localStorage.getItem(CACHE_VERSION_KEY);
        const currentVersion = CACHE_VERSION;
        
        // Check if cache version matches current build
        if (cachedVersion !== currentVersion) {
          console.log('Cache version mismatch - clearing translation cache');
          localStorage.removeItem(CACHE_KEY);
          localStorage.setItem(CACHE_VERSION_KEY, currentVersion);
          return;
        }
        
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const parsedCache = JSON.parse(cached);
          setTranslationCache(new Map(Object.entries(parsedCache)));
          console.log(`Loaded ${Object.keys(parsedCache).length} cached translations`);
        }
      } catch (error) {
        console.error('Failed to load translation cache:', error);
        // Clear corrupted cache
        localStorage.removeItem(CACHE_KEY);
        localStorage.removeItem(CACHE_VERSION_KEY);
      }
    };
    
    loadCachedTranslations();
  }, [CACHE_VERSION]);
  
  // Save translations to localStorage when cache updates
  useEffect(() => {
    const saveCacheToStorage = () => {
      try {
        const cacheObject = Object.fromEntries(translationCache);
        localStorage.setItem(CACHE_KEY, JSON.stringify(cacheObject));
        localStorage.setItem(CACHE_VERSION_KEY, CACHE_VERSION);
      } catch (error) {
        console.error('Failed to save translation cache:', error);
      }
    };
    
    if (translationCache.size > 0) {
      saveCacheToStorage();
    }
  }, [translationCache, CACHE_VERSION]);

  // Load saved language preference
  useEffect(() => {
    const savedLanguage = localStorage.getItem('app-language') as Language;
    if (savedLanguage && ['en', 'es', 'tl'].includes(savedLanguage)) {
      setCurrentLanguage(savedLanguage);
    }
  }, []);

  const setLanguage = (language: Language) => {
    setCurrentLanguage(language);
    localStorage.setItem('app-language', language);
    // Don't clear cache when switching languages - keep for performance
    // Stop any ongoing translations
    setIsTranslating(false);
  };
  
  // Function to manually clear cache (useful for development)
  const clearTranslationCache = () => {
    setTranslationCache(new Map());
    localStorage.removeItem(CACHE_KEY);
    localStorage.removeItem(CACHE_VERSION_KEY);
    console.log('Translation cache cleared manually');
  };

  // Batch translation function for multiple texts
  const translateBatch = async (texts: string[], targetLanguage: Language): Promise<string[]> => {
    if (targetLanguage === 'en' || texts.length === 0) {
      return texts;
    }

    const uncachedTexts: string[] = [];
    const uncachedIndices: number[] = [];
    const results: string[] = new Array(texts.length);

    // Check cache for all texts first
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

    // If all texts are cached or empty, return immediately
    if (uncachedTexts.length === 0) {
      return results;
    }

    try {
      setIsTranslating(true);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      
      const response = await fetch('/api/translate-batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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
        
        // Cache and assign translations
        uncachedIndices.forEach((originalIndex, batchIndex) => {
          const translatedText = translations[batchIndex] || uncachedTexts[batchIndex];
          const cacheKey = `${uncachedTexts[batchIndex]}-${targetLanguage}`;
          
          setTranslationCache(prev => new Map(prev).set(cacheKey, translatedText));
          results[originalIndex] = translatedText;
        });
      } else {
        // Fallback to original texts on API error
        uncachedIndices.forEach((originalIndex, batchIndex) => {
          results[originalIndex] = uncachedTexts[batchIndex];
        });
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Batch translation request was aborted');
      } else {
        console.error('Batch translation error:', error);
      }
      // Fallback to original texts
      uncachedIndices.forEach((originalIndex, batchIndex) => {
        results[originalIndex] = uncachedTexts[batchIndex];
      });
    } finally {
      setIsTranslating(false);
    }

    return results;
  };

  const translate = async (text: string): Promise<string> => {
    // Short-circuit for English or empty strings
    if (currentLanguage === 'en' || !text || text.trim() === '') {
      return text;
    }

    // Check cache first
    const cacheKey = `${text}-${currentLanguage}`;
    if (translationCache.has(cacheKey)) {
      return translationCache.get(cacheKey)!;
    }

    try {
      setIsTranslating(true);
      
      // Create an AbortController for this request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text.trim(),
          targetLanguage: currentLanguage,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.error(`Translation API error: ${response.status} ${response.statusText}`);
        return text; // Return original text on API error
      }

      const result = await response.json();
      const translatedText = result.translatedText || text;
      
      // Cache the translation
      setTranslationCache(prev => new Map(prev).set(cacheKey, translatedText));
      
      return translatedText;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Translation request was aborted');
      } else {
        console.error('Translation error:', error);
      }
      return text; // Return original text on error
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