import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createDrawerNavigator, DrawerScreenProps } from "@react-navigation/drawer";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AccessibilityProvider } from "./src/contexts/AccessibilityContext";
import { LanguageProvider } from "./src/contexts/LanguageContext";
import { useOnboarding } from "./src/hooks/use-onboarding";
import Home from "./src/components/ui-kit/Home";
import SearchCategory from "./src/screens/SearchCategoryScreen";
import SearchKeyword from "./src/screens/SearchKeywordScreen";
import UpdateLocation from "./src/screens/UpdateLocationScreen";
import ResourcesList from "./src/screens/ResourceListScreen";
import ResourceDetail from "./src/screens/ResourceDetailScreen";
import Favorites from "./src/screens/FavoritesScreen";
import About from "./src/screens/AboutScreen";
import Settings from "./src/screens/SettingsScreen";
import { OnboardingFlow } from "./src/components/Onboarding/OnboardingFlow";
import { SplashScreen } from "./src/screens/SplashScreen";
import Toaster from "./src/components/ui/Toaster";
import { DrawerNavigationProp } from "@react-navigation/drawer";

// Drawer param types
export type DrawerParamList = {
  Home: undefined;
  SearchCategory: undefined;
  SearchKeyword: undefined;
  UpdateLocation: undefined;
  ResourcesList: { category?: string; keyword?: string };
  ResourceDetail: { id: string };
  Favorites: undefined;
  About: undefined;
  Settings: undefined;
};

const Drawer = createDrawerNavigator<DrawerParamList>();
const queryClient = new QueryClient();

// Correct HomeScreenWrapper for navigation prop typing
function HomeScreenWrapper({ navigation }: DrawerScreenProps<DrawerParamList, 'Home'>) {
  function navigateTo(route: string, params?: Record<string, any>) {
    navigation.navigate(route as any, params);
  }
  return <Home navigateTo={navigateTo} />;
}

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
              <Drawer.Screen name="Home" component={HomeScreenWrapper} options={{ title: "Home" }} />
              <Drawer.Screen name="SearchCategory" component={SearchCategory} options={{ title: "Search Category" }} />
              <Drawer.Screen name="SearchKeyword" component={SearchKeyword} options={{ title: "Search Keyword" }} />
              <Drawer.Screen name="UpdateLocation" component={UpdateLocation} options={{ title: "Update Location" }} />
              <Drawer.Screen name="ResourcesList" component={ResourcesList} options={{ title: "Resources List" }} />
              <Drawer.Screen name="ResourceDetail" component={ResourceDetail} options={{ title: "Resource Detail" }} initialParams={{ id: "" }} />
              <Drawer.Screen name="Favorites" component={Favorites} options={{ title: "Favorites" }} />
              <Drawer.Screen name="About" component={About} options={{ title: "About" }} />
              <Drawer.Screen name="Settings" component={Settings} options={{ title: "Settings" }} />
            </Drawer.Navigator>
          </NavigationContainer>
          <Toaster />
        </LanguageProvider>
      </AccessibilityProvider>
    </QueryClientProvider>
  );
}
