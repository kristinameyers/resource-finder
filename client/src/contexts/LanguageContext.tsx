import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Language = 'en' | 'es' | 'tl';

export interface LanguageContextType {
  currentLanguage: Language;
  setLanguage: (language: Language) => void;
  translate: (text: string) => Promise<string>;
  isTranslating: boolean;
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
    // Clear translation cache when language changes
    setTranslationCache(new Map());
  };

  const translate = async (text: string): Promise<string> => {
    // Return original text for English
    if (currentLanguage === 'en') {
      return text;
    }

    // Check cache first
    const cacheKey = `${text}-${currentLanguage}`;
    if (translationCache.has(cacheKey)) {
      return translationCache.get(cacheKey)!;
    }

    try {
      setIsTranslating(true);
      
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          targetLanguage: currentLanguage,
        }),
      });

      if (!response.ok) {
        throw new Error('Translation failed');
      }

      const result = await response.json();
      const translatedText = result.translatedText || text;
      
      // Cache the translation
      setTranslationCache(prev => new Map(prev).set(cacheKey, translatedText));
      
      return translatedText;
    } catch (error) {
      console.error('Translation error:', error);
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
        isTranslating,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}