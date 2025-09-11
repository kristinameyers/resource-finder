import fetch from 'node-fetch';

const GOOGLE_TRANSLATE_API_KEY = process.env.GOOGLE_TRANSLATE_API;
const GOOGLE_TRANSLATE_URL = 'https://translate.googleapis.com/translate_a/single';

export interface TranslationRequest {
  text: string;
  targetLanguage: 'es' | 'tl'; // Spanish (Mexican) or Tagalog
  sourceLanguage?: string;
}

export interface TranslationResponse {
  translatedText: string;
  detectedLanguage?: string;
}

/**
 * Translate text using Google Translate API
 */
export async function translateText(request: TranslationRequest): Promise<TranslationResponse> {
  if (!GOOGLE_TRANSLATE_API_KEY) {
    throw new Error('Google Translate API key not configured');
  }

  const { text, targetLanguage, sourceLanguage = 'en' } = request;

  try {
    // Using Google Translate's free endpoint with proper parameters
    const params = new URLSearchParams({
      client: 'gtx',
      sl: sourceLanguage, // source language
      tl: targetLanguage, // target language
      dt: 't', // return translation
      q: text // query text
    });

    const response = await fetch(`${GOOGLE_TRANSLATE_URL}?${params.toString()}`, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ResourceFinder/1.0)',
      }
    });

    if (!response.ok) {
      throw new Error(`Translation API error: ${response.status}`);
    }

    const data = await response.json() as any;
    
    // Google Translate free API returns an array format
    // Structure: [[[translated_text, original_text, null, null, 0]], null, source_language]
    const translatedText = data[0]?.[0]?.[0] || text;
    const detectedLanguage = data[2] || sourceLanguage;

    return {
      translatedText,
      detectedLanguage
    };
  } catch (error) {
    console.error('Translation error:', error);
    // Return original text if translation fails
    return {
      translatedText: text,
      detectedLanguage: sourceLanguage
    };
  }
}

/**
 * Batch translate multiple texts
 */
export async function translateBatch(
  texts: string[], 
  targetLanguage: 'es' | 'tl'
): Promise<TranslationResponse[]> {
  const translations = await Promise.all(
    texts.map(text => translateText({ text, targetLanguage }))
  );
  
  return translations;
}

/**
 * Get supported languages
 */
export function getSupportedLanguages() {
  return [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'es', name: 'Spanish (Mexican)', nativeName: 'Español (México)' },
    { code: 'tl', name: 'Tagalog', nativeName: 'Tagalog' }
  ];
}