import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// App contexts
import { AccessibilityProvider } from "./contexts/AccessibilityContext";
import { LanguageProvider } from "./contexts/LanguageContext";
// Onboarding and screens
import { useOnboarding } from "./hooks/use-onboarding";
import HomeScreen from "./screens/HomeScreen";
import SearchCategoryScreen from "./screens/SearchCategoryScreen";
import SearchKeywordScreen from "./screens/SearchKeywordScreen";
import UpdateLocationScreen from "./screens/UpdateLocationScreen";
import ResourceListScreen from "./screens/ResourceListScreen";
import ResourceDetailScreen from "./screens/ResourceDetailScreen";
import FavoritesScreen from "./screens/FavoritesScreen";
import AboutScreen from "./screens/AboutScreen";
import SettingsScreen from "./screens/SettingsScreen";
import { SplashScreen } from "./screens/SplashScreen";
import { OnboardingFlow } from "./components/onboarding/OnboardingFlow";
import Toaster from "./components/ui/Toaster";

// Drawer param types
export type DrawerParamList = {
  Home: undefined;
  SearchCategory: undefined;
  SearchKeyword: undefined;
  UpdateLocation: undefined;
  ResourceList: { category?: string; keyword?: string };
  ResourceDetail: { id: string };
  Favorites: undefined;
  About: undefined;
  Settings: undefined;
};

// Make sure Drawer is declared after createDrawerNavigator import
const Drawer = createDrawerNavigator<DrawerParamList>();
const queryClient = new QueryClient();

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const { hasCompletedOnboarding, completeOnboarding } = useOnboarding();

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AccessibilityProvider>
        <LanguageProvider>
          {isLoading ? (
            <SplashScreen isVisible={true} />
          ) : !hasCompletedOnboarding ? (
            <OnboardingFlow onComplete={completeOnboarding} />
          ) : (
            <>
              <NavigationContainer>
                <Drawer.Navigator initialRouteName="Home" screenOptions={{ headerShown: true }}>
                  <Drawer.Screen name="Home" component={HomeScreen} options={{ title: "Home" }} />
                  <Drawer.Screen name="SearchCategory" component={SearchCategoryScreen} options={{ title: "Search Category" }} />
                  <Drawer.Screen name="SearchKeyword" component={SearchKeywordScreen} options={{ title: "Search Keyword" }} />
                  <Drawer.Screen name="UpdateLocation" component={UpdateLocationScreen} options={{ title: "Update Location" }} />
                  <Drawer.Screen name="ResourceList" component={ResourceListScreen} options={{ title: "Resources List" }} />
                  <Drawer.Screen name="ResourceDetail" component={ResourceDetailScreen} options={{ title: "Resource Detail" }} initialParams={{ id: "" }} />
                  <Drawer.Screen name="Favorites" component={FavoritesScreen} options={{ title: "Favorites" }} />
                  <Drawer.Screen name="About" component={AboutScreen} options={{ title: "About" }} />
                  <Drawer.Screen name="Settings" component={SettingsScreen} options={{ title: "Settings" }} />
                </Drawer.Navigator>
              </NavigationContainer>
              <Toaster />
            </>
          )}
        </LanguageProvider>
      </AccessibilityProvider>
    </QueryClientProvider>
  );
}
