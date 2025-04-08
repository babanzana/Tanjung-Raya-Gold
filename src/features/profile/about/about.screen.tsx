import React from "react";
import { View, ScrollView, StyleSheet, Image, Text } from "react-native";

export const AboutScreen = ({ route, navigation }: any) => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <View style={styles.aboutCard}>
          <Image
            source={require("./../../../../assets/logo.png")}
            style={styles.profileImage}
          />
          <Text style={styles.name}>Kevin</Text>
          <Text style={styles.detail}>NPM: 19412436</Text>
          <Text style={styles.detail}>Prodi: Sistem Informasi</Text>
          <Text style={styles.detail}>Fakultas: Ilmu Teknologi Informasi</Text>
          <Text style={styles.detail}>Universitas Widya Dharma Pontianak</Text>
          <Text style={styles.detail}>Versi Aplikasi: 1.0.0</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#333",
  },
  aboutCard: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileImage: {
    width: 170,
    height: 160,
    borderRadius: 60,
    marginBottom: 16,
    borderWidth: 3,
    borderColor: "#FFD700",
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#333",
  },
  detail: {
    fontSize: 14,
    marginBottom: 6,
    color: "#666",
    textAlign: "center",
  },
  faqHeader: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#FFD700",
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  faqAnswer: {
    backgroundColor: "#f9f9f9",
    padding: 16,
    fontSize: 14,
    color: "#555",
    lineHeight: 20,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
});
