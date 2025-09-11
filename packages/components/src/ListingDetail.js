// packages/components/src/ListingDetail.js
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

export default function ListingDetail({ listing }) {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{listing.name}</Text>
      <Text style={styles.desc}>{listing.description}</Text>
      {/* render other fields */}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  desc: { fontSize: 16, color: '#333', marginBottom: 12 },
});
