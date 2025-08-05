import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface LocationDisplayProps {
  location: any;
}

export function LocationDisplay({ location }: LocationDisplayProps) {
  if (!location) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>📍 Location</Text>
        <Text style={styles.subtitle}>Getting your location...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📍 Your Location</Text>
      <Text style={styles.coordinates}>
        {location.coords.latitude.toFixed(4)}, {location.coords.longitude.toFixed(4)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontFamily: 'Roboto-Medium',
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  subtitle: {
    fontFamily: 'Roboto',
    fontSize: 14,
    color: '#666',
  },
  coordinates: {
    fontFamily: 'Roboto',
    fontSize: 14,
    color: '#666',
  },
});