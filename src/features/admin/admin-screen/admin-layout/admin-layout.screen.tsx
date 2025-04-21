import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { logoutUser } from "../../../../../firebase";

export const AdminLayoutScreen = ({ navigation }: any) => {
  const menuItems = [
    {
      title: "Kelola Customer",
      icon: "people",
      color: "#4CAF50",
      onPress: () => navigation.navigate("Customers"),
    },
    {
      title: "Buat Laporan",
      icon: "document-text",
      color: "#2196F3",
      onPress: () => navigation.navigate("Reports"),
    },
    {
      title: "Logout",
      icon: "log-out",
      color: "#F44336",
      onPress: () =>
        Alert.alert(
          "Konfirmasi Logout",
          "Yakin ingin keluar dari akun admin?",
          [
            { text: "Batal", style: "cancel" },
            { text: "Keluar", onPress: () => logoutUser() },
          ]
        ),
    },
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.menuContainer}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.menuCard, { backgroundColor: item.color }]}
            onPress={item.onPress}
          >
            <View style={styles.cardContent}>
              <Ionicons
                name={item.icon as keyof typeof Ionicons.glyphMap}
                size={32}
                color="white"
              />
              <Text style={styles.menuText}>{item.title}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: "#f5f5f5",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginVertical: 20,
    textAlign: "center",
    color: "#333",
  },
  menuContainer: {
    width: "100%",
  },
  menuCard: {
    width: "100%",
    height: 80,
    borderRadius: 8,
    marginBottom: 16,
    justifyContent: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    gap: 16,
  },
  menuText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
});
