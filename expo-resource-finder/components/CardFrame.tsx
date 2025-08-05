import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';

interface CardFrameProps {
  children: React.ReactNode;
}

const CardFrame: React.FC<CardFrameProps> = ({ children }) => (
  <View style={styles.frame}>
    {children}
  </View>
);

const styles = StyleSheet.create({
  frame: {
    width: 140, // adjust as needed
    height: 140, // adjust as needed
    borderRadius: 32,
    backgroundColor: '#256BAE', // Use the screenshot's base blue
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.25)', // semi-transparent border/glow
    alignItems: 'center',
    justifyContent: 'center',
    margin: 12,

    // Shadow for depth (iOS)
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,

    // Shadow for depth (Android)
    elevation: 6,
  },
});

export default CardFrame;