import React, { useState, useEffect } from "react";
import { Text, TextProps, StyleProp, TextStyle } from "react-native";
import { useLanguage } from "../contexts/LanguageContext";

interface TranslatedTextProps extends TextProps {
  text: string;
  fallback?: string;
  style?: StyleProp<TextStyle>;
}

/**
 * Component that automatically translates text based on current language
 */
export function TranslatedText({ text, fallback, style, ...rest }: TranslatedTextProps) {
  const { currentLanguage, translate } = useLanguage();
  const [translatedText, setTranslatedText] = useState(text);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const translateText = async () => {
      if (currentLanguage === "en" || !text || text.trim() === "") {
        setTranslatedText(text);
        return;
      }
      setIsLoading(true);
      try {
        const translated = await translate(text);
        setTranslatedText(translated);
      } catch (error) {
        console.error("Translation error:", error);
        setTranslatedText(fallback || text);
      } finally {
        setIsLoading(false);
      }
    };

    translateText();
  }, [text, currentLanguage, translate, fallback]);

  return (
    <Text style={style} {...rest}>
      {isLoading ? (fallback || text) : translatedText}
    </Text>
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
      if (currentLanguage === "en" || !text || text.trim() === "") {
        setTranslatedText(text);
        return;
      }
      setIsLoading(true);
      try {
        const translated = await translate(text);
        setTranslatedText(translated);
      } catch (error) {
        console.error("Translation error:", error);
        setTranslatedText(text);
      } finally {
        setIsLoading(false);
      }
    };

    translateText();
  }, [text, currentLanguage, translate]);

  return { text: translatedText, isLoading };
}