import React, { createContext, useContext, useEffect, useState, ReactNode, useMemo } from 'react';
import { AccessibilityInfo, Vibration, Appearance } from 'react-native';

export type FontScale = 'small' | 'medium' | 'large';
export type ThemeMode = 'default' | 'high-contrast';

// --- Color Palettes ---
const DEFAULT_THEME = {
  background: '#f7f7f7', // Light gray background
  backgroundSecondary: '#ffffff', // White card/surface background
  text: '#222222', // Dark text
  textSecondary: '#666666', // Muted text
  primary: '#005191', // Primary blue accent
  accent: '#539ED0', // Secondary accent blue
  border: '#e0e0e0', // Light border
};

const HIGH_CONTRAST_THEME = {
  background: '#000000', // Black background
  backgroundSecondary: '#000000', // Black card/surface background
  text: '#FFFF00', // High-visibility yellow text
  textSecondary: '#FFFFFF', // White secondary text
  primary: '#FFFF00', // High-visibility yellow accent/primary color
  accent: '#FFFFFF', // White secondary accent
  border: '#FFFFFF', // White border/separator
};
// ----------------------

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
  // Renamed to follow common convention, but kept original logic
  getFontSize: (baseSize: number) => number; 
  triggerHaptic: (type?: 'light' | 'medium' | 'heavy') => void;
  // Use a utility type to ensure 'theme' has all defined color keys
  theme: typeof DEFAULT_THEME; 
}

const AccessibilityContext = createContext<AccessibilityContextValue | undefined>(undefined);

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (context === undefined) {
    // ⚠️ CRITICAL: Fallback should also use the defined theme structure
    return {
      fontSize: 'medium',
      highContrast: false,
      reduceMotion: false,
      screenReader: false,
      hapticFeedback: false,
      setFontSize: () => {},
      setHighContrast: () => {},
      setReduceMotion: () => {},
      setScreenReader: () => {},
      setHapticFeedback: () => {},
      getFontSize: (baseSize: number) => baseSize,
      triggerHaptic: () => {},
      theme: DEFAULT_THEME, // Use the constant defined above
    };
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
    // Note: AccessibilityInfo.isBoldTextEnabled() is often used, but does not 
    // strictly map to a custom high-contrast mode, so we rely on user setting.
    // AccessibilityInfo.isBoldTextEnabled().then(setHighContrastState); 
    
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotionState);
    AccessibilityInfo.isScreenReaderEnabled().then(setScreenReaderState);
  }, []);

  // Font size calculation for scaling
  const getFontSize = (baseSize: number): number => {
    // You should use the additive method (+/- fixed number) for small/medium/large scaling
    // if you want predictable steps, rather than multiplication.
    // However, I've kept your original multiplication logic but fixed the `switch` statement
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

  // ✅ FIX: Corrected color theme logic to use the defined constants
  const theme = highContrast ? HIGH_CONTRAST_THEME : DEFAULT_THEME;

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

  // Use useMemo to prevent unnecessary re-renders of consuming components
  const value = useMemo<AccessibilityContextValue>(() => ({
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
  }), [
    fontSize,
    highContrast,
    reduceMotion,
    screenReader,
    hapticFeedback,
    theme,
  ]);

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
}