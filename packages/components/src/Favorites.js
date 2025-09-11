// packages/components/src/Favorites.js
import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';

export default function Favorites({ items, onSelect }) {
  return (
    <FlatList
      data={items}
      keyExtractor={i => i.id}
      renderItem={({ item }) => (
        <TouchableOpacity onPress={() => onSelect(item.id)} style={styles.item}>
          <Text style={styles.text}>{item.name}</Text>
        </TouchableOpacity>
      )}
      ListEmptyComponent={<Text style={styles.empty}>No favorites yet</Text>}
    />
  );
}

const styles = StyleSheet.create({
  item: { padding: 12, borderBottomWidth: 1, borderColor: '#ddd' },
  text: { fontSize: 16 },
  empty: { padding: 16, textAlign: 'center', color: '#666' },
});
