import { useState, useEffect } from "react";
import { useLanguage } from "../contexts/LanguageContext";

interface TranslatedTextProps {
  text: string;
  className?: string;
  fallback?: string;
}

/**
 * Component that automatically translates text based on current language
 */
export function TranslatedText({ text, className, fallback }: TranslatedTextProps) {
  const { currentLanguage, translate } = useLanguage();
  const [translatedText, setTranslatedText] = useState(text);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const translateText = async () => {
      if (currentLanguage === 'en' || !text || text.trim() === '') {
        setTranslatedText(text);
        return;
      }

      setIsLoading(true);
      try {
        const translated = await translate(text);
        setTranslatedText(translated);
      } catch (error) {
        console.error('Translation error:', error);
        setTranslatedText(fallback || text); // Use fallback or original text
      } finally {
        setIsLoading(false);
      }
    };

    const runTranslation = async () => {
      try {
        await translateText();
      } catch (error) {
        console.error('Async translation error:', error);
        setTranslatedText(fallback || text);
        setIsLoading(false);
      }
    };
    
    runTranslation();
  }, [text, currentLanguage, translate, fallback]);

  return (
    <span className={className}>
      {isLoading ? (fallback || text) : translatedText}
    </span>
  );
}

/**
 * Hook for translating text with loading state
 */
export function useTranslatedText(text: string) {
  const { currentLanguage, translate } = useLanguage();
  const [translatedText, setTranslatedText] = useState(text);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const translateText = async () => {
      if (currentLanguage === 'en' || !text || text.trim() === '') {
        setTranslatedText(text);
        return;
      }

      setIsLoading(true);
      try {
        const translated = await translate(text);
        setTranslatedText(translated);
      } catch (error) {
        console.error('Translation error:', error);
        setTranslatedText(text); // Fallback to original
      } finally {
        setIsLoading(false);
      }
    };

    const runTranslation = async () => {
      try {
        await translateText();
      } catch (error) {
        console.error('Async translation error:', error);
        setTranslatedText(text);
        setIsLoading(false);
      }
    };
    
    runTranslation();
  }, [text, currentLanguage, translate]);

  return { text: translatedText, isLoading };
}