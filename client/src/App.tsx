import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { SplashScreen } from "@/components/SplashScreen";
import { AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import ResourceDetail from "@/pages/resource-detail";
import About from "@/pages/about";
import Favorites from "@/pages/favorites";
import Settings from "@/pages/settings";
import SearchCategoryPage from "@/pages/search-category";
import SearchKeywordPage from "@/pages/search-keyword";
import UpdateLocationPage from "@/pages/update-location";
import ResourcesListPage from "@/pages/resources-list";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AccessibilityProvider } from "@/contexts/AccessibilityContext";
import { OnboardingFlow, OnboardingPreferences } from "@/components/onboarding/OnboardingFlow";
import { useOnboarding } from "@/hooks/use-onboarding";

function Router() {
  return (
    <>
      <Switch>
        {/* Add pages below */}
        <Route path="/" component={Home} />
        <Route path="/search-category" component={SearchCategoryPage} />
        <Route path="/search-keyword" component={SearchKeywordPage} />
        <Route path="/update-location" component={UpdateLocationPage} />
        <Route path="/resources" component={ResourcesListPage} />
        <Route path="/resources/:id" component={ResourceDetail} />
        <Route path="/favorites" component={Favorites} />
        <Route path="/about" component={About} />
        <Route path="/settings" component={Settings} />
        {/* Fallback to 404 */}
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const { hasCompletedOnboarding, completeOnboarding } = useOnboarding();

  useEffect(() => {
    // Show splash screen while app initializes
    const initializeApp = async () => {
      // Wait for a minimum time to show the splash screen
      const minLoadTime = new Promise(resolve => setTimeout(resolve, 1000));
      
      // You can add actual initialization tasks here if needed
      // For example: preloading categories, checking auth, etc.
      
      await minLoadTime;
      setIsLoading(false);
    };

    initializeApp();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AccessibilityProvider>
        <LanguageProvider>
          <AnimatePresence>
            {isLoading && <SplashScreen isVisible={isLoading} />}
          </AnimatePresence>
          {!isLoading && hasCompletedOnboarding === false && (
            <OnboardingFlow onComplete={completeOnboarding} />
          )}
          {!isLoading && hasCompletedOnboarding === true && (
            <>
              <Router />
            </>
          )}
          <Toaster />
        </LanguageProvider>
      </AccessibilityProvider>
    </QueryClientProvider>
  );
}

export default App;
