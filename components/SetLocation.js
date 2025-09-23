import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet } from 'react-native';

export default function SetLocation({ onSubmit }) {
  const [loc, setLoc] = useState('');
  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Enter your zip or city"
        value={loc}
        onChangeText={setLoc}
        style={styles.input}
      />
      <Button title="Set Location" onPress={() => onSubmit(loc)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#fff' },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 8, marginBottom: 12 },
});
