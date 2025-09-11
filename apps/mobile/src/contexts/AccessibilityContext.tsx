import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

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

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedFontSize = localStorage.getItem('accessibility-font-size') as FontScale;
    const savedHighContrast = localStorage.getItem('accessibility-high-contrast') === 'true';
    const savedReduceMotion = localStorage.getItem('accessibility-reduce-motion') === 'true';
    const savedScreenReader = localStorage.getItem('accessibility-screen-reader') === 'true';
    const savedHapticFeedback = localStorage.getItem('accessibility-haptic-feedback') !== 'false';

    if (savedFontSize) setFontSizeState(savedFontSize);
    setHighContrastState(savedHighContrast);
    setReduceMotionState(savedReduceMotion);
    setScreenReaderState(savedScreenReader);
    setHapticFeedbackState(savedHapticFeedback);

    // Check system preferences for reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion && !savedReduceMotion) {
      setReduceMotionState(true);
    }
  }, []);

  // Apply accessibility settings to DOM and save to localStorage
  useEffect(() => {
    const root = document.documentElement;
    
    // Apply font size classes
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

    // Apply screen reader optimizations
    if (screenReader) {
      root.classList.add('screen-reader-optimized');
    } else {
      root.classList.remove('screen-reader-optimized');
    }
    
    // Save all settings to localStorage
    localStorage.setItem('accessibility-font-size', fontSize);
    localStorage.setItem('accessibility-high-contrast', highContrast.toString());
    localStorage.setItem('accessibility-reduce-motion', reduceMotion.toString());
    localStorage.setItem('accessibility-screen-reader', screenReader.toString());
    localStorage.setItem('accessibility-haptic-feedback', hapticFeedback.toString());
  }, [fontSize, highContrast, reduceMotion, screenReader, hapticFeedback]);

  // Font size scaling function
  const getFontSize = (baseSize: number): number => {
    switch (fontSize) {
      case 'small': return baseSize * 0.85;
      case 'large': return baseSize * 1.25;
      default: return baseSize;
    }
  };

  // Haptic feedback function
  const triggerHaptic = (type: 'light' | 'medium' | 'heavy' = 'light') => {
    if (!hapticFeedback) return;
    
    // Use Vibration API if available
    if ('vibrator' in navigator || 'vibrate' in navigator) {
      const patterns = {
        light: [10],
        medium: [20],
        heavy: [50]
      };
      navigator.vibrate?.(patterns[type]);
    }
  };

  // Theme configuration
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

  // Setter functions that also trigger haptic feedback
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
    // Don't trigger haptic when disabling haptics
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