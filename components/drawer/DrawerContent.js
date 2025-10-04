// components/drawer/DrawerContent.js
import { View, Text, StyleSheet } from 'react-native';
import { DrawerItemList } from '@react-navigation/drawer';

export default function DrawerContent(props) {
  // Defensive: DrawerItemList expects navigation prop; avoid error if missing
  if (!props.navigation) {
    return (
      <View style={styles.container}>
        <Text style={styles.header}>Menu</Text>
        <Text style={{ marginLeft: 16 }}>Navigation unavailable.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Menu</Text>
      <DrawerItemList {...props} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 40 },
  header: { fontSize: 28, fontWeight: 'bold', marginLeft: 16, marginBottom: 16 },
});
