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
import Accessibility from "@/pages/accessibility";
import { BottomNavigation } from "@/components/BottomNavigation";

function Router() {
  return (
    <>
      <Switch>
        {/* Add pages below */}
        <Route path="/" component={Home} />
        <Route path="/resources/:id" component={ResourceDetail} />
        <Route path="/favorites" component={Favorites} />
        <Route path="/about" component={About} />
        <Route path="/accessibility" component={Accessibility} />
        {/* Fallback to 404 */}
        <Route component={NotFound} />
      </Switch>
      <BottomNavigation />
    </>
  );
}

function App() {
  const [isLoading, setIsLoading] = useState(true);

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
      <AnimatePresence>
        {isLoading && <SplashScreen isVisible={isLoading} />}
      </AnimatePresence>
      {!isLoading && <Router />}
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
