import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 30, // 30 minutes
    },
  },
});

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    // Note: Add actual font files to assets/fonts/ directory
    // 'League Gothic': require('../assets/fonts/LeagueGothic-Regular.ttf'),
    // 'Roboto': require('../assets/fonts/Roboto-Regular.ttf'),
    // 'Roboto-Medium': require('../assets/fonts/Roboto-Medium.ttf'),
    // 'Roboto-Bold': require('../assets/fonts/Roboto-Bold.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="category/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="resource/[id]" options={{ headerShown: false }} />
      </Stack>
    </QueryClientProvider>
  );
}