// apps/mobile/src/App.tsx

import React, { useState, useEffect } from "react";
import 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NavigationContainer } from "@react-navigation/native";
import { createDrawerNavigator } from "@react-navigation/drawer";

import Home from "@sb211/ui-kit"; // Component from packages
import SearchCategory from "./screens/SearchCategoryScreen";
import SearchKeyword from "./screens/SearchKeywordScreen";
import UpdateLocation from "./screens/UpdateLocationScreen";
import ResourcesList from "./screens/resources-list";
import ResourceDetail from "./screens/resource-detail";
import Favorites from "./screens/favorites";
import About from "./screens/AboutScreen";
import Settings from "./screens/settings";

import { LanguageProvider } from "./contexts/LanguageContext";
import { AccessibilityProvider } from "./contexts/AccessibilityContext";
import { OnboardingFlow } from "./components/onboarding/OnboardingFlow";
import { SplashScreen } from "./components/SplashScreen";
import { Toaster } from "./components/ui/toaster";
import { useOnboarding } from "./hooks/use-onboarding";

// Instantiate QueryClient once
const queryClient = new QueryClient();
const Drawer = createDrawerNavigator();

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const { hasCompletedOnboarding, completeOnboarding } = useOnboarding();

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <SplashScreen isVisible={true} />;
  }

  if (!hasCompletedOnboarding) {
    return <OnboardingFlow onComplete={completeOnboarding} />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AccessibilityProvider>
        <LanguageProvider>
          <NavigationContainer>
            <Drawer.Navigator initialRouteName="Home" screenOptions={{ headerShown: true }}>
              <Drawer.Screen
                name="Home"
                component={Home}
                options={{ title: "Home" }}
              />
              <Drawer.Screen
                name="SearchCategory"
                component={SearchCategory}
                options={{ title: "Search Category" }}
              />
              <Drawer.Screen
                name="SearchKeyword"
                component={SearchKeyword}
                options={{ title: "Search Keyword" }}
              />
              <Drawer.Screen
                name="UpdateLocation"
                component={UpdateLocation}
                options={{ title: "Update Location" }}
              />
              <Drawer.Screen
                name="ResourcesList"
                component={ResourcesList}
                options={{ title: "Resources List" }}
              />
              <Drawer.Screen
                name="ResourceDetail"
                component={ResourceDetail}
                options={{ title: "Resource Detail" }}
                initialParams={{ id: "" }}
              />
              <Drawer.Screen
                name="Favorites"
                component={Favorites}
                options={{ title: "Favorites" }}
              />
              <Drawer.Screen
                name="About"
                component={About}
                options={{ title: "About" }}
              />
              <Drawer.Screen
                name="Settings"
                component={Settings}
                options={{ title: "Settings" }}
              />
            </Drawer.Navigator>
          </NavigationContainer>
          <Toaster />
        </LanguageProvider>
      </AccessibilityProvider>
    </QueryClientProvider>
  );
}

