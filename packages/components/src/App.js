// packages/components/src/App.js
import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import AppNavigator from './AppNavigator';

export default function App() {
  return (
    <SafeAreaView style={styles.safe}>
      <AppNavigator />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f2f2f2' },
});
