// AppNavigator.js
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import About from './About';
import Results from './Results';
import ListingDetail from './ListingDetail';
import SetLocation from './SetLocation';

const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator initialRouteName="Results">
      <Stack.Screen name="Results" component={Results} />
      <Stack.Screen name="ListingDetail" component={ListingDetail} />
      <Stack.Screen name="SetLocation" component={SetLocation} />
      <Stack.Screen name="About" component={About} />
    </Stack.Navigator>
  );
}
