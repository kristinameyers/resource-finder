import React from 'react';
import { View, Text, Card } from 'tamagui';

interface LocationDisplayProps {
  location: any;
}

export function LocationDisplay({ location }: LocationDisplayProps) {
  if (!location) {
    return (
      <Card backgroundColor="white" borderRadius={8} padding={15} elevation={5}>
        <Text fontSize={16} color="#333" marginBottom={5} fontWeight="500" fontFamily="$body">
          📍 Location
        </Text>
        <Text fontSize={14} color="#666" fontFamily="$body">
          Getting your location...
        </Text>
      </Card>
    );
  }

  return (
    <Card backgroundColor="white" borderRadius={8} padding={15} elevation={5}>
      <Text fontSize={16} color="#333" marginBottom={5} fontWeight="500" fontFamily="$body">
        📍 Your Location
      </Text>
      <Text fontSize={14} color="#666" fontFamily="$body">
        {location.coords.latitude.toFixed(4)}, {location.coords.longitude.toFixed(4)}
      </Text>
    </Card>
  );
}

// Styles removed - now using Tamagui components