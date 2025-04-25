import React, { useState } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import { Text, TextInput, Button } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

interface Customer {
  id: number;
  nama: string;
  username: string;
  email: string;
  nohp: string; // Changed from roles to nohp
  alamat: string;
  imageUrl: string;
}

export const AdminCustomersDetailScreen = ({
  navigation,
  route,
  customer,
}: any) => {
  const [editedCustomer, setEditedCustomer] = useState<Customer>(customer);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (field: keyof Customer, value: string) => {
    setEditedCustomer((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = () => {
    setIsLoading(true);
    // Simpan perubahan ke API atau state management
    console.log("Customer updated:", editedCustomer);

    // Simulasi proses async
    setTimeout(() => {
      setIsLoading(false);
      Alert.alert("Success", "Customer updated successfully");
      navigation.goBack();
    }, 1500);
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Customer",
      "Are you sure you want to delete this customer?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: () => {
            console.log("Customer deleted:", editedCustomer.id);
            navigation.goBack();
          },
          style: "destructive",
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text variant="headlineMedium" style={styles.title}>
            Edit Customer
          </Text>
        </View>

        <View style={styles.avatarContainer}>
          <Image
            source={{ uri: editedCustomer.imageUrl }}
            style={styles.avatar}
          />
          <TouchableOpacity style={styles.changePhotoButton}>
            <Text style={styles.changePhotoText}>Change Photo</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            mode="outlined"
            value={editedCustomer.nama}
            onChangeText={(text) => handleChange("nama", text)}
            style={styles.input}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Username</Text>
          <TextInput
            mode="outlined"
            value={editedCustomer.username}
            onChangeText={(text) => handleChange("username", text)}
            style={styles.input}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            mode="outlined"
            value={editedCustomer.email}
            onChangeText={(text) => handleChange("email", text)}
            keyboardType="email-address"
            style={styles.input}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            mode="outlined"
            value={editedCustomer.nohp}
            onChangeText={(text) => handleChange("nohp", text)}
            keyboardType="phone-pad"
            style={styles.input}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Address</Text>
          <TextInput
            mode="outlined"
            value={editedCustomer.alamat}
            onChangeText={(text) => handleChange("alamat", text)}
            multiline
            numberOfLines={3}
            style={[styles.input, styles.multilineInput]}
          />
        </View>

        <View style={styles.buttonGroup}>
          <Button
            mode="contained"
            onPress={handleSave}
            loading={isLoading}
            style={styles.saveButton}
          >
            Save Changes
          </Button>

          <Button
            mode="outlined"
            onPress={() => navigation.goBack()}
            style={styles.cancelButton}
          >
            Cancel
          </Button>

          <Button
            mode="contained-tonal"
            onPress={handleDelete}
            style={styles.deleteButton}
            textColor="#dc3545"
          >
            Delete Customer
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontWeight: "bold",
    textAlign: "center",
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 12,
    backgroundColor: "#e0e0e0",
  },
  changePhotoButton: {
    padding: 8,
  },
  changePhotoText: {
    color: "#007bff",
    fontWeight: "500",
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
    fontSize: 14,
    color: "#555",
  },
  input: {
    backgroundColor: "white",
  },
  multilineInput: {
    minHeight: 80,
  },
  buttonGroup: {
    marginTop: 24,
    gap: 12,
  },
  saveButton: {
    backgroundColor: "#28a745",
    paddingVertical: 8,
  },
  cancelButton: {
    borderColor: "#6c757d",
    paddingVertical: 8,
  },
  deleteButton: {
    backgroundColor: "transparent",
    borderColor: "#dc3545",
    borderWidth: 1,
    paddingVertical: 8,
    marginTop: 16,
  },
});