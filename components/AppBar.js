import { View, Text, StyleSheet } from 'react-native';

export default function AppBar({ title }) {
  return (
    <View style={styles.bar}>
      <Text style={styles.text}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { height: 56, justifyContent: 'center', backgroundColor: '#006FBF', paddingHorizontal: 16 },
  text: { color: '#fff', fontSize: 20, fontWeight: '600' },
});
