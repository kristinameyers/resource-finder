import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { OnboardingPreferences } from '../components/onboarding/OnboardingFlow';

const ONBOARDING_STORAGE_KEY = 'onboarding-completed';
const PREFERENCES_STORAGE_KEY = 'onboarding-preferences';

export function useOnboarding() {
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean>(false);
  const [preferences, setPreferences] = useState<OnboardingPreferences | null>(null);

  // Load from AsyncStorage on mount
  useEffect(() => {
    async function loadData() {
      try {
        const completed = await AsyncStorage.getItem(ONBOARDING_STORAGE_KEY);
        const savedPreferences = await AsyncStorage.getItem(PREFERENCES_STORAGE_KEY);
        setHasCompletedOnboarding(completed === 'true');

        if (savedPreferences) {
          setPreferences(JSON.parse(savedPreferences));
        }
      } catch (error) {
        console.error('Failed to load onboarding data:', error);
      }
    }
    loadData();
  }, []);

  const completeOnboarding = useCallback(
    async (onboardingPreferences: OnboardingPreferences) => {
      try {
        await AsyncStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
        await AsyncStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(onboardingPreferences));
        setHasCompletedOnboarding(true);
        setPreferences(onboardingPreferences);
      } catch (error) {
        console.error('Failed to save onboarding:', error);
      }
    },
    []
  );

  const resetOnboarding = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(ONBOARDING_STORAGE_KEY);
      await AsyncStorage.removeItem(PREFERENCES_STORAGE_KEY);
      setHasCompletedOnboarding(false);
      setPreferences(null);
    } catch (error) {
      console.error('Failed to reset onboarding:', error);
    }
  }, []);

  return {
    hasCompletedOnboarding,
    preferences,
    completeOnboarding,
    resetOnboarding
  };
}
