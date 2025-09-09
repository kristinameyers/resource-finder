// OnboardingFlow.tsx

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { MapPin, ArrowRight } from "lucide-react";
import { useTranslatedText } from "@/components/TranslatedText";
import { useAccessibility } from "@/contexts/AccessibilityContext";
import new211Logo from "@/assets/new-211-logo.png";

interface OnboardingFlowProps {
  onComplete: (preferences: OnboardingPreferences) => void;
}

export interface OnboardingPreferences {
  zipCode?: string;
  useLocation?: boolean;
  favoriteCategories: string[];
}

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [zipCode, setZipCode] = useState("");
  const [useLocation, setUseLocation] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const { triggerHaptic, reduceMotion } = useAccessibility();

  // Translated text
  const { text: welcomeText } = useTranslatedText("Welcome To");
  const { text: santaBarbaraText } = useTranslatedText("Santa Barbara 211");
  const { text: descriptionText } = useTranslatedText("Find essential services, including food, shelter, health care and more.");
  const { text: letsGoText } = useTranslatedText("Let's Go");
  const { text: findResourcesText } = useTranslatedText("Find Resources Closest To You");
  // const { text: locationDescText } = useTranslatedText("Use Your Current Location or Enter Your Zip Code");
  const { text: enterZipText } = useTranslatedText("Enter your zip code");
  const { text: useLocationText } = useTranslatedText("Click to use your current location");
  const { text: saveText } = useTranslatedText("Save");
  const { text: skipText } = useTranslatedText("Skip");
  const { text: selectThreeText } = useTranslatedText("Select Three Resources That You Use Most Often");

  const categories = [
    { id: 'children-family', name: 'Children & Family' },
    { id: 'food', name: 'Food' },
    { id: 'education', name: 'Education' },
    { id: 'finance-employment', name: 'Finance & Employment' },
    { id: 'housing', name: 'Housing' },
    { id: 'healthcare', name: 'Health Care' },
    { id: 'hygiene-household', name: 'Hygiene & Household' },
    { id: 'mental-wellness', name: 'Mental Wellness' },
    { id: 'legal-assistance', name: 'Legal Assistance' },
    { id: 'substance-use', name: 'Substance Use' },
    { id: 'transportation', name: 'Transportation' },
    { id: 'young-adults', name: 'Young Adults' }
  ];

  const handleLocationRequest = async () => {
    try {
      setUseLocation(true);
      triggerHaptic('light');
    } catch (error) {
      console.error('Location access failed:', error);
    }
  };

  const handleNext = () => {
    triggerHaptic('light');
    setCurrentStep(currentStep + 1);
  };

  const handleCategoryToggle = (categoryId: string) => {
    triggerHaptic('light');
    setSelectedCategories(prev => {
      if (prev.includes(categoryId)) {
        return prev.filter(id => id !== categoryId);
      } else if (prev.length < 3) {
        return [...prev, categoryId];
      }
      return prev;
    });
  };

  const handleComplete = () => {
    triggerHaptic('medium');
    onComplete({
      zipCode: zipCode || undefined,
      useLocation,
      favoriteCategories: selectedCategories
    });
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 300 : -300,
      opacity: 0
    })
  };

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      <AnimatePresence mode="wait">
        {currentStep === 1 && (
          <motion.div
            key="step1"
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: reduceMotion ? 0 : 0.3 }}
            className="flex-1 flex flex-col items-center justify-center p-8 text-center"
          >
            <div className="mb-12">
              <img 
                src={new211Logo} 
                alt="Santa Barbara County 211 Logo" 
                className="h-32 w-auto mx-auto mb-8"
              />
              <p className="text-sm text-gray-600 mt-2">Get connected. Get Help.</p>
            </div>
            <div className="mb-12">
              <h1 className="text-2xl font-normal text-gray-800 mb-4">
                {welcomeText}<br />{santaBarbaraText}
              </h1>
              <p className="text-gray-600 px-4">
                {descriptionText}
              </p>
            </div>
            <Button 
              onClick={handleNext}
              className="bg-[#FFB351] hover:bg-[#e89d42] text-white px-12 py-3 rounded-lg flex items-center gap-2"
              aria-label="Continue to next step"
            >
              {letsGoText}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </motion.div>
        )}

        {/* Combined Step 2 */}
        {currentStep === 2 && (
          <motion.div
            key="step2"
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: reduceMotion ? 0 : 0.3 }}
            className="flex-1 flex flex-col items-center justify-center p-8 text-center"
          >
            <div className="mb-8">
              <img 
                src={new211Logo} 
                alt="Santa Barbara County 211 Logo" 
                className="h-24 w-auto mx-auto mb-4"
              />
              <p className="text-sm text-gray-600">Get connected. Get Help.</p>
            </div>

            {/* Location and Category Section */}
            <div className="w-full max-w-md mx-auto">
              {/* Location Entry */}
              <h2 className="text-xl font-normal text-gray-800 mb-4">{findResourcesText}</h2>
              <p className="text-gray-600 mb-4">{locationDescText}</p>
              <Input
                type="text"
                placeholder={enterZipText}
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                className="w-full mb-4"
                aria-label="Enter zip code"
              />
              <Button
                variant="outline"
                onClick={handleLocationRequest}
                className="w-full flex items-center gap-2 mb-4"
                aria-label="Use current location"
              >
                <MapPin className="w-4 h-4" />
                {useLocationText}
              </Button>

              {/* Category Selection */}
              <h2 className="text-lg font-normal text-gray-800 mb-4 mt-8">
                {selectThreeText}
              </h2>
              <div className="flex-1 overflow-y-auto mb-4 max-h-52">
                <div className="space-y-3 max-w-sm mx-auto">
                  {categories.map((category) => (
                    <div 
                      key={category.id}
                      className="flex items-center space-x-3 p-2"
                    >
                      <Checkbox
                        id={category.id}
                        checked={selectedCategories.includes(category.id)}
                        onCheckedChange={() => handleCategoryToggle(category.id)}
                        disabled={!selectedCategories.includes(category.id) && selectedCategories.length >= 3}
                        aria-label={`Select ${category.name} category`}
                      />
                      <label 
                        htmlFor={category.id}
                        className="text-gray-800 cursor-pointer flex-1"
                      >
                        {category.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              <p className="text-sm text-gray-600 text-center font-medium mb-4">
                {selectedCategories.length > 0 
                  ? `${selectedCategories.length} of 3 categories selected`
                  : "Categories are optional - click Continue to proceed"
                }
              </p>
              <Button 
                onClick={handleComplete}
                className="bg-[#005191] hover:bg-[#004080] text-white w-full py-4 flex items-center justify-center gap-2 font-bold text-xl shadow-xl border-4 border-yellow-400"
                aria-label="Complete onboarding and go to home screen"
                data-testid="onboarding-complete-button"
              >
                🏠 Continue to Home
                <ArrowRight className="w-6 h-6" />
              </Button>
              <Button 
                variant="outline"
                onClick={handleComplete}
                className="bg-[#FFB351] text-white border-[#FFB351] hover:bg-[#e89d42] w-full mt-3"
                aria-label="Skip location and category setup"
              >
                {skipText}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
