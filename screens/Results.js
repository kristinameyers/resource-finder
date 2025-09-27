import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';

export default function Results({ results, onSelect }) {
  return (
    <FlatList
      data={results}
      keyExtractor={i => i.id}
      renderItem={({ item }) => (
        <TouchableOpacity onPress={() => onSelect(item.id)} style={styles.item}>
          <Text style={styles.text}>{item.name}</Text>
        </TouchableOpacity>
      )}
    />
  );
}

const styles = StyleSheet.create({
  item: { padding: 12, borderBottomWidth: 1, borderColor: '#eee' },
  text: { fontSize: 16 },
});
