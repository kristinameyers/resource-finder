// AppNavigator.tsx
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import {
  createStackNavigator,
  StackNavigationOptions,
} from "@react-navigation/stack";

/* --------------------------------------------------------------
   Screens
   -------------------------------------------------------------- */
import HomeScreen from "../screens/HomeScreen";
import ResourceListScreen from "../screens/ResourceListScreen";
import ResourceDetailScreen from "../screens/ResourceDetailScreen";
import FavoritesScreen from "../screens/FavoritesScreen";

/* --------------------------------------------------------------
   1️⃣  Navigation param typings
   -------------------------------------------------------------- */
export type HomeStackParamList = {
  HomeMain: undefined;
  // Updated: accept the extra optional fields that HomeScreen sends
  ResourceList: {
    keyword: string;          // the search term (category name or taxonomy keyword)
    zipCode?: string;
    categoryId?: string;      // optional – useful if you need the raw id later
    categoryName?: string;    // optional – same as `keyword` but kept for clarity
    categoryIcon?: string;    // optional – the icon name you want to show on the list header
    isSubcategory?: boolean; 
  };
  ResourceDetail: { resourceId: string };
};

export type FavoritesStackParamList = {
  FavoritesMain: undefined;
  ResourceDetail: { resourceId: string };
};

/* --------------------------------------------------------------
   2️⃣  Stack navigators (typed)
   -------------------------------------------------------------- */
const HomeStack = createStackNavigator<HomeStackParamList>();
const FavoritesStack = createStackNavigator<FavoritesStackParamList>();

/* --------------------------------------------------------------
   3️⃣  Home stack – contains Home, list, and detail screens
   -------------------------------------------------------------- */
function HomeStackNavigator() {
  return (
    <HomeStack.Navigator
      screenOptions={{ headerShown: false } as StackNavigationOptions}
    >
      <HomeStack.Screen name="HomeMain" component={HomeScreen} />
      {/* <<< NEW – the screen that was missing */}
      <HomeStack.Screen name="ResourceList" component={ResourceListScreen} />
      <HomeStack.Screen name="ResourceDetail" component={ResourceDetailScreen} />
    </HomeStack.Navigator>
  );
}

/* --------------------------------------------------------------
   4️⃣  Favorites stack – contains Favorites and detail screens
   -------------------------------------------------------------- */
function FavoritesStackNavigator() {
  return (
    <FavoritesStack.Navigator
      screenOptions={{ headerShown: false } as StackNavigationOptions}
    >
      <FavoritesStack.Screen name="FavoritesMain" component={FavoritesScreen} />
      <FavoritesStack.Screen
        name="ResourceDetail"
        component={ResourceDetailScreen}
      />
    </FavoritesStack.Navigator>
  );
}

/* --------------------------------------------------------------
   5️⃣  Bottom‑tab navigator (unchanged visual logic)
   -------------------------------------------------------------- */
export default function AppNavigator() {
  return (
    <NavigationContainer>
      <HomeStack.Navigator screenOptions={{ headerShown: false }}>
        <HomeStack.Screen name="HomeMain" component={HomeScreen} />
        <HomeStack.Screen name="ResourceList" component={ResourceListScreen} />
        <HomeStack.Screen name="ResourceDetail" component={ResourceDetailScreen} />
        </HomeStack.Navigator>
    </NavigationContainer>
  );
}

/* --------------------------------------------------------------
   6️⃣  Placeholder Call screen (no UI needed – just a dial action)
   -------------------------------------------------------------- */
function CallScreen() {
  // The actual dialing is handled in the `tabPress` listener above.
  // Returning null means nothing is rendered when the tab is selected.
  return null;
}