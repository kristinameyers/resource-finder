import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { AccessibilityInfo, Vibration, Appearance } from 'react-native';

export type FontScale = 'small' | 'medium' | 'large';
export type ThemeMode = 'default' | 'high-contrast';

interface AccessibilitySettings {
  fontSize: FontScale;
  highContrast: boolean;
  reduceMotion: boolean;
  screenReader: boolean;
  hapticFeedback: boolean;
}

interface AccessibilityContextValue extends AccessibilitySettings {
  setFontSize: (size: FontScale) => void;
  setHighContrast: (enabled: boolean) => void;
  setReduceMotion: (enabled: boolean) => void;
  setScreenReader: (enabled: boolean) => void;
  setHapticFeedback: (enabled: boolean) => void;
  getFontSize: (baseSize: number) => number;
  triggerHaptic: (type?: 'light' | 'medium' | 'heavy') => void;
  theme: {
    background: string;
    text: string;
    primary: string;
    accent: string;
  };
}

const AccessibilityContext = createContext<AccessibilityContextValue | undefined>(undefined);

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
}

interface AccessibilityProviderProps {
  children: ReactNode;
}

export function AccessibilityProvider({ children }: AccessibilityProviderProps) {
  const [fontSize, setFontSizeState] = useState<FontScale>('medium');
  const [highContrast, setHighContrastState] = useState(false);
  const [reduceMotion, setReduceMotionState] = useState(false);
  const [screenReader, setScreenReaderState] = useState(false);
  const [hapticFeedback, setHapticFeedbackState] = useState(true);

  // Loads accessibility settings from system APIs
  useEffect(() => {
    AccessibilityInfo.isBoldTextEnabled().then(setHighContrastState);
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotionState);
    AccessibilityInfo.isScreenReaderEnabled().then(setScreenReaderState);

    // Appearance module is for color scheme, not contrast—could expand here if wanted
  }, []);

  // Font size calculation for scaling
  const getFontSize = (baseSize: number): number => {
    switch (fontSize) {
      case 'small': return baseSize * 0.85;
      case 'large': return baseSize * 1.25;
      default: return baseSize;
    }
  };

  // Haptic feedback function for mobile
  const triggerHaptic = (type: 'light' | 'medium' | 'heavy' = 'light') => {
    if (!hapticFeedback) return;
    if (type === 'light') Vibration.vibrate(10);
    else if (type === 'medium') Vibration.vibrate(20);
    else Vibration.vibrate(50);
  };

  // Color theme, high contrast variant
  const theme = highContrast
    ? {
        background: '#ffffff',
        text: '#000000',
        primary: '#000000',
        accent: '#FFD700'
      }
    : {
        background: '#f7f7f7',
        text: '#222222',
        primary: '#005191',
        accent: '#539ED0'
      };

  // Setter functions for state
  const setFontSize = (size: FontScale) => {
    setFontSizeState(size);
    triggerHaptic('light');
  };

  const setHighContrast = (enabled: boolean) => {
    setHighContrastState(enabled);
    triggerHaptic('medium');
  };

  const setReduceMotion = (enabled: boolean) => {
    setReduceMotionState(enabled);
    triggerHaptic('light');
  };

  const setScreenReader = (enabled: boolean) => {
    setScreenReaderState(enabled);
    triggerHaptic('light');
  };

  const setHapticFeedback = (enabled: boolean) => {
    setHapticFeedbackState(enabled);
    if (enabled) triggerHaptic('light');
  };

  const value: AccessibilityContextValue = {
    fontSize,
    highContrast,
    reduceMotion,
    screenReader,
    hapticFeedback,
    setFontSize,
    setHighContrast,
    setReduceMotion,
    setScreenReader,
    setHapticFeedback,
    getFontSize,
    triggerHaptic,
    theme
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
}
