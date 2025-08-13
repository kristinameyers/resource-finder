import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings, Globe, Check } from "lucide-react";
import { useLanguage, type Language } from "@/contexts/LanguageContext";

export default function SettingsPage() {
  const { currentLanguage, setLanguage, translate } = useLanguage();
  const [translatedTexts, setTranslatedTexts] = useState<Record<string, string>>({});

  const languages = [
    { code: 'en' as Language, name: 'English', nativeName: 'English' },
    { code: 'es' as Language, name: 'Spanish (Mexican)', nativeName: 'Español (México)' },
    { code: 'tl' as Language, name: 'Tagalog', nativeName: 'Tagalog' }
  ];

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
        'Configure your app preferences'
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

        {/* Info Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-gray-600">
              <Globe className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm">
                {currentLanguage === 'en' 
                  ? 'The app will translate content automatically when you select a different language.'
                  : t('The app will translate content automatically when you select a different language.')
                }
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}