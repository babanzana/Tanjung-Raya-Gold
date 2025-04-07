import { StyleSheet, View, SafeAreaView } from "react-native";
import { Text } from "react-native-paper";

export const CartScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Welcome to the Cart Screen</Text>
        <Text variant="bodyMedium">Cart Screen</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1, // Ini yang paling penting!
    backgroundColor: "#fff", // Tambahkan warna background
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
});
