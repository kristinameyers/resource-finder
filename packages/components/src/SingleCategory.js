// packages/components/src/SingleCategory.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function SingleCategory({ category, onPress }) {
  return (
    <TouchableOpacity style={styles.container} onPress={() => onPress(category.id)}>
      <Text style={styles.text}>{category.name}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#fafafa', margin: 8, borderRadius: 4 },
  text: { fontSize: 16, color: '#333' },
});
