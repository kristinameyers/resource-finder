// packages/components/src/DrawerButton.js
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';

export default function DrawerButton({ onPress }) {
  if (typeof onPress !== 'function') {
    // Defensive: Only render if valid handler; prevents silent errors
    return <View />;
  }

  return (
    <TouchableOpacity onPress={onPress} style={styles.btn} accessibilityRole="button" accessibilityLabel="Open navigation menu">
      <Text style={styles.text}>☰</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: { padding: 12 },
  text: { fontSize: 24 },
});
