import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Eye, Volume2, Smartphone, Palette, Type } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AccessibilitySettings {
  fontSize: 'small' | 'medium' | 'large';
  display: 'default' | 'high-contrast';
  reduceMotion: boolean;
  screenReader: boolean;
  hapticFeedback: boolean;
}

export default function Accessibility() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<AccessibilitySettings>({
    fontSize: 'medium',
    display: 'default',
    reduceMotion: false,
    screenReader: false,
    hapticFeedback: false
  });

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('accessibilitySettings');
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.error('Error loading accessibility settings:', error);
      }
    }
  }, []);

  // Apply settings to document
  useEffect(() => {
    const root = document.documentElement;
    
    // Font size
    root.classList.remove('text-small', 'text-medium', 'text-large');
    root.classList.add(`text-${settings.fontSize}`);
    
    // High contrast
    if (settings.display === 'high-contrast') {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
    
    // Reduce motion
    if (settings.reduceMotion) {
      root.style.setProperty('--motion-reduce', 'reduce');
    } else {
      root.style.removeProperty('--motion-reduce');
    }
    
    // Save to localStorage
    localStorage.setItem('accessibilitySettings', JSON.stringify(settings));
  }, [settings]);

  const handleSettingChange = (key: keyof AccessibilitySettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    toast({
      title: "Setting Updated",
      description: "Your accessibility preference has been saved.",
    });
  };

  const resetSettings = () => {
    const defaultSettings: AccessibilitySettings = {
      fontSize: 'medium',
      display: 'default',
      reduceMotion: false,
      screenReader: false,
      hapticFeedback: false
    };
    setSettings(defaultSettings);
    toast({
      title: "Settings Reset",
      description: "All accessibility settings have been reset to default.",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
            <Eye className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Accessibility Settings</h1>
          <p className="text-lg text-gray-600">
            Customize your experience to meet your accessibility needs
          </p>
        </div>

        <div className="space-y-6">
          {/* Font Size Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Type className="w-5 h-5 mr-2 text-blue-600" />
                Font Size
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={settings.fontSize}
                onValueChange={(value) => handleSettingChange('fontSize', value as 'small' | 'medium' | 'large')}
                className="space-y-4"
              >
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="small" id="font-small" />
                  <Label htmlFor="font-small" className="text-sm">Small text</Label>
                </div>
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="medium" id="font-medium" />
                  <Label htmlFor="font-medium" className="text-base">Medium text (Default)</Label>
                </div>
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="large" id="font-large" />
                  <Label htmlFor="font-large" className="text-lg">Large text</Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Display Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Palette className="w-5 h-5 mr-2 text-blue-600" />
                Display
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={settings.display}
                onValueChange={(value) => handleSettingChange('display', value as 'default' | 'high-contrast')}
                className="space-y-4"
              >
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="default" id="display-default" />
                  <Label htmlFor="display-default">Default colors</Label>
                </div>
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="high-contrast" id="display-contrast" />
                  <Label htmlFor="display-contrast">High contrast colors</Label>
                </div>
              </RadioGroup>
              <p className="text-sm text-gray-600 mt-2">
                High contrast mode increases color contrast for better visibility
              </p>
            </CardContent>
          </Card>

          {/* Motion Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Eye className="w-5 h-5 mr-2 text-blue-600" />
                Motion & Animation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="reduce-motion">Reduce motion</Label>
                  <p className="text-sm text-gray-600">
                    Minimizes animations and transitions that may cause discomfort
                  </p>
                </div>
                <Switch
                  id="reduce-motion"
                  checked={settings.reduceMotion}
                  onCheckedChange={(checked) => handleSettingChange('reduceMotion', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Screen Reader Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Volume2 className="w-5 h-5 mr-2 text-blue-600" />
                Screen Reader
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="screen-reader">Enable screen reader optimizations</Label>
                  <p className="text-sm text-gray-600">
                    Enhances compatibility with screen reading software
                  </p>
                </div>
                <Switch
                  id="screen-reader"
                  checked={settings.screenReader}
                  onCheckedChange={(checked) => handleSettingChange('screenReader', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Haptic Feedback Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Smartphone className="w-5 h-5 mr-2 text-blue-600" />
                Haptic Feedback
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="haptic-feedback">Enable haptic feedback</Label>
                  <p className="text-sm text-gray-600">
                    Provides tactile feedback when interacting with elements (mobile devices)
                  </p>
                </div>
                <Switch
                  id="haptic-feedback"
                  checked={settings.hapticFeedback}
                  onCheckedChange={(checked) => handleSettingChange('hapticFeedback', checked)}
                />
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Reset Settings */}
          <div className="text-center">
            <Button variant="outline" onClick={resetSettings}>
              Reset All Settings
            </Button>
            <p className="text-sm text-gray-600 mt-2">
              This will restore all accessibility settings to their default values
            </p>
          </div>

          {/* Additional Information */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-6">
              <h3 className="font-semibold text-blue-900 mb-2">Additional Accessibility Resources</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Contact us at <a href="tel:18004001572" className="underline">1-800-400-1572</a> for accessibility assistance</li>
                <li>• Use keyboard navigation: Tab to navigate, Enter to select</li>
                <li>• Screen readers can announce page content and form labels</li>
                <li>• All interactive elements are designed to meet WCAG 2.1 AA standards</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}