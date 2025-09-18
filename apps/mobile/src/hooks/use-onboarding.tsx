import { useState, useEffect } from 'react';
import { OnboardingPreferences } from '../components/onboarding/OnboardingFlow';

const ONBOARDING_STORAGE_KEY = 'onboarding-completed';
const PREFERENCES_STORAGE_KEY = 'onboarding-preferences';

export function useOnboarding() {
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean | null>(null);
  const [preferences, setPreferences] = useState<OnboardingPreferences | null>(null);

  useEffect(() => {
    // Check if onboarding has been completed
    const completed = localStorage.getItem(ONBOARDING_STORAGE_KEY);
    const savedPreferences = localStorage.getItem(PREFERENCES_STORAGE_KEY);
    
    setHasCompletedOnboarding(completed === 'true');
    
    if (savedPreferences) {
      try {
        setPreferences(JSON.parse(savedPreferences));
      } catch (error) {
        console.error('Failed to parse onboarding preferences:', error);
      }
    }
  }, []);

  const completeOnboarding = (onboardingPreferences: OnboardingPreferences) => {
    localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
    localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(onboardingPreferences));
    setHasCompletedOnboarding(true);
    setPreferences(onboardingPreferences);
  };

  const resetOnboarding = () => {
    localStorage.removeItem(ONBOARDING_STORAGE_KEY);
    localStorage.removeItem(PREFERENCES_STORAGE_KEY);
    setHasCompletedOnboarding(false);
    setPreferences(null);
  };

  return {
    hasCompletedOnboarding,
    preferences,
    completeOnboarding,
    resetOnboarding
  };
}