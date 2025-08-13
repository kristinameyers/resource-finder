import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Settings, Globe, Check, Eye, Palette, Volume2, Smartphone, Type, Accessibility } from "lucide-react";
import { useLanguage, type Language } from "@/contexts/LanguageContext";

export default function SettingsPage() {
  const { currentLanguage, setLanguage, translate } = useLanguage();
  const [translatedTexts, setTranslatedTexts] = useState<Record<string, string>>({});
  
  // Accessibility settings state
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [highContrast, setHighContrast] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [screenReader, setScreenReader] = useState(false);
  const [hapticFeedback, setHapticFeedback] = useState(true);

  const languages = [
    { code: 'en' as Language, name: 'English', nativeName: 'English' },
    { code: 'es' as Language, name: 'Spanish (Mexican)', nativeName: 'Español (México)' },
    { code: 'tl' as Language, name: 'Tagalog', nativeName: 'Tagalog' }
  ];

  // Load accessibility settings from localStorage
  useEffect(() => {
    const savedFontSize = localStorage.getItem('accessibility-font-size') as 'small' | 'medium' | 'large';
    const savedHighContrast = localStorage.getItem('accessibility-high-contrast') === 'true';
    const savedReduceMotion = localStorage.getItem('accessibility-reduce-motion') === 'true';
    const savedScreenReader = localStorage.getItem('accessibility-screen-reader') === 'true';
    const savedHapticFeedback = localStorage.getItem('accessibility-haptic-feedback') !== 'false';

    if (savedFontSize) setFontSize(savedFontSize);
    setHighContrast(savedHighContrast);
    setReduceMotion(savedReduceMotion);
    setScreenReader(savedScreenReader);
    setHapticFeedback(savedHapticFeedback);
  }, []);

  // Apply accessibility settings to document
  useEffect(() => {
    const root = document.documentElement;
    
    // Apply font size
    root.classList.remove('font-small', 'font-medium', 'font-large');
    root.classList.add(`font-${fontSize}`);
    
    // Apply high contrast
    if (highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
    
    // Apply reduced motion
    if (reduceMotion) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }
    
    // Save settings
    localStorage.setItem('accessibility-font-size', fontSize);
    localStorage.setItem('accessibility-high-contrast', highContrast.toString());
    localStorage.setItem('accessibility-reduce-motion', reduceMotion.toString());
    localStorage.setItem('accessibility-screen-reader', screenReader.toString());
    localStorage.setItem('accessibility-haptic-feedback', hapticFeedback.toString());
  }, [fontSize, highContrast, reduceMotion, screenReader, hapticFeedback]);

  // Translate page content
  useEffect(() => {
    const translatePageContent = async () => {
      const textsToTranslate = [
        'Settings',
        'Language',
        'Choose your preferred language',
        'Current Language',
        'Save Changes',
        'Language settings have been saved successfully.',
        'Resource Finder Settings',
        'Configure your app preferences',
        'Accessibility',
        'Customize display and interaction settings',
        'Font Size',
        'Make text easier to read',
        'Small',
        'Medium', 
        'Large',
        'Display Mode',
        'Choose how content appears',
        'Default',
        'High Contrast',
        'Motion',
        'Reduce animations and transitions',
        'Reduce Motion',
        'Screen Reader',
        'Optimize for screen reader users',
        'Enable Screen Reader Mode',
        'Haptic Feedback',
        'Vibration feedback for interactions',
        'Enable Haptic Feedback'
      ];

      const translations: Record<string, string> = {};
      for (const text of textsToTranslate) {
        translations[text] = await translate(text);
      }
      setTranslatedTexts(translations);
    };

    translatePageContent();
  }, [currentLanguage, translate]);

  const handleLanguageChange = (languageCode: string) => {
    setLanguage(languageCode as Language);
  };

  const t = (text: string) => translatedTexts[text] || text;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <Settings className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t('Resource Finder Settings')}
          </h1>
          <p className="text-gray-600">
            {t('Configure your app preferences')}
          </p>
        </div>

        {/* Language Settings Card */}
        <Card className="mb-6">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Globe className="w-5 h-5 text-blue-600" />
              {t('Language')}
            </CardTitle>
            <p className="text-sm text-gray-600">
              {t('Choose your preferred language')}
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Current Language Display */}
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                {t('Current Language')}
              </Label>
              <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border">
                <Check className="w-4 h-4 text-blue-600" />
                <span className="font-medium text-blue-800">
                  {languages.find(lang => lang.code === currentLanguage)?.nativeName}
                </span>
                <span className="text-blue-600 text-sm">
                  ({languages.find(lang => lang.code === currentLanguage)?.name})
                </span>
              </div>
            </div>

            {/* Language Selection */}
            <div>
              <Label htmlFor="language-select" className="text-sm font-medium text-gray-700 mb-2 block">
                {t('Choose your preferred language')}
              </Label>
              <Select value={currentLanguage} onValueChange={handleLanguageChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a language" />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((language) => (
                    <SelectItem key={language.code} value={language.code}>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{language.nativeName}</span>
                        <span className="text-gray-500 text-sm">({language.name})</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Language Descriptions */}
            <div className="grid gap-3">
              {languages.map((language) => (
                <div
                  key={language.code}
                  className={`p-3 rounded-lg border-2 transition-colors ${
                    currentLanguage === language.code
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">
                        {language.nativeName}
                      </div>
                      <div className="text-sm text-gray-600">
                        {language.name}
                      </div>
                    </div>
                    {currentLanguage === language.code && (
                      <Check className="w-5 h-5 text-blue-600" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Success Message */}
        {currentLanguage !== 'en' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-800">
                {t('Language settings have been saved successfully.')}
              </span>
            </div>
          </div>
        )}

        {/* Accessibility Settings Card */}
        <Card className="mb-6">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Accessibility className="w-5 h-5 text-blue-600" />
              {t('Accessibility')}
            </CardTitle>
            <p className="text-sm text-gray-600">
              {t('Customize display and interaction settings')}
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Font Size */}
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-3 block">
                <div className="flex items-center gap-2">
                  <Type className="w-4 h-4" />
                  {t('Font Size')}
                </div>
                <span className="text-xs text-gray-500 font-normal">
                  {t('Make text easier to read')}
                </span>
              </Label>
              <div className="grid grid-cols-3 gap-3">
                {['small', 'medium', 'large'].map((size) => (
                  <button
                    key={size}
                    onClick={() => setFontSize(size as 'small' | 'medium' | 'large')}
                    className={`p-3 rounded-lg border-2 transition-colors ${
                      fontSize === size
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="text-center">
                      <div className={`font-medium ${
                        size === 'small' ? 'text-sm' : size === 'large' ? 'text-lg' : 'text-base'
                      }`}>
                        Aa
                      </div>
                      <div className="text-xs mt-1 capitalize">
                        {t(size.charAt(0).toUpperCase() + size.slice(1))}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Display Mode */}
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-3 block">
                <div className="flex items-center gap-2">
                  <Palette className="w-4 h-4" />
                  {t('Display Mode')}
                </div>
                <span className="text-xs text-gray-500 font-normal">
                  {t('Choose how content appears')}
                </span>
              </Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setHighContrast(false)}
                  className={`p-4 rounded-lg border-2 transition-colors ${
                    !highContrast
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="text-center">
                    <Eye className="w-5 h-5 mx-auto mb-2 text-gray-600" />
                    <div className="font-medium text-sm">{t('Default')}</div>
                  </div>
                </button>
                <button
                  onClick={() => setHighContrast(true)}
                  className={`p-4 rounded-lg border-2 transition-colors ${
                    highContrast
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="text-center">
                    <Palette className="w-5 h-5 mx-auto mb-2 text-gray-900" />
                    <div className="font-medium text-sm">{t('High Contrast')}</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Motion Settings */}
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-3 block">
                <div className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4" />
                  {t('Motion')}
                </div>
                <span className="text-xs text-gray-500 font-normal">
                  {t('Reduce animations and transitions')}
                </span>
              </Label>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-sm">{t('Reduce Motion')}</div>
                </div>
                <Switch
                  checked={reduceMotion}
                  onCheckedChange={setReduceMotion}
                />
              </div>
            </div>

            {/* Screen Reader */}
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-3 block">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  {t('Screen Reader')}
                </div>
                <span className="text-xs text-gray-500 font-normal">
                  {t('Optimize for screen reader users')}
                </span>
              </Label>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-sm">{t('Enable Screen Reader Mode')}</div>
                </div>
                <Switch
                  checked={screenReader}
                  onCheckedChange={setScreenReader}
                />
              </div>
            </div>

            {/* Haptic Feedback */}
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-3 block">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4" />
                  {t('Haptic Feedback')}
                </div>
                <span className="text-xs text-gray-500 font-normal">
                  {t('Vibration feedback for interactions')}
                </span>
              </Label>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-sm">{t('Enable Haptic Feedback')}</div>
                </div>
                <Switch
                  checked={hapticFeedback}
                  onCheckedChange={setHapticFeedback}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-gray-600">
              <Settings className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm">
                {currentLanguage === 'en' 
                  ? 'Settings are automatically saved and will be remembered next time you visit.'
                  : t('Settings are automatically saved and will be remembered next time you visit.')
                }
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}