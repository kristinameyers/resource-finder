import { useState, useEffect } from "react";
import { useLanguage } from "../contexts/LanguageContext";

/**
 * Custom hook for translating text content
 */
export function useTranslation() {
  const { currentLanguage, translate } = useLanguage();
  
  /**
   * Translate a single text string
   */
  const t = async (text: string): Promise<string> => {
    if (currentLanguage === 'en') {
      return text;
    }
    return await translate(text);
  };

  /**
   * Translate multiple texts and return as an object
   */
  const translateMultiple = async (texts: Record<string, string>): Promise<Record<string, string>> => {
    if (currentLanguage === 'en') {
      return texts;
    }

    const translated: Record<string, string> = {};
    
    for (const [key, text] of Object.entries(texts)) {
      translated[key] = await translate(text);
    }
    
    return translated;
  };

  /**
   * Hook for translating text with state management
   */
  const useTranslatedText = (originalText: string) => {
    const [translatedText, setTranslatedText] = useState(originalText);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
      const translateText = async () => {
        if (currentLanguage === 'en') {
          setTranslatedText(originalText);
          return;
        }

        setIsLoading(true);
        try {
          const translated = await translate(originalText);
          setTranslatedText(translated);
        } catch (error) {
          console.error('Translation error:', error);
          setTranslatedText(originalText); // Fallback to original
        } finally {
          setIsLoading(false);
        }
      };

      translateText();
    }, [originalText, currentLanguage, translate]);

    return { text: translatedText, isLoading };
  };

  return {
    t,
    translateMultiple,
    useTranslatedText,
    currentLanguage
  };
}