import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Text, TextInput, Button } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import {
  updateCustomer,
  deleteCustomer,
  createCustomer,
} from "../../../../../firebase";

interface Customer {
  id?: string;
  fullName: string;
  username?: string;
  email: string;
  phoneNumber: string;
  address?: string;
  imageUrl?: string;
  createdAt?: string;
  transactions?: any[];
}

export const AdminCustomersDetailScreen = ({ navigation, route }: any) => {
  // Check if we're in edit mode or create mode
  const isEditMode = route?.params?.customer ? true : false;

  // Initial customer state based on route params or empty for new customer
  const initialCustomerState: Customer = isEditMode
    ? {
        id: route.params.customer.id || "",
        fullName: route.params.customer.fullName || "",
        username: route.params.customer.username || "",
        email: route.params.customer.email || "",
        phoneNumber: route.params.customer.phoneNumber || "",
        address: route.params.customer.address || "",
        imageUrl: route.params.customer.imageUrl || "",
        createdAt: route.params.customer.createdAt || new Date().toISOString(),
        transactions: route.params.customer.transactions || [],
      }
    : {
        fullName: "",
        username: "",
        email: "",
        phoneNumber: "",
        address: "",
        imageUrl: "",
      };

  const [customer, setCustomer] = useState<Customer>(initialCustomerState);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleChange = (field: keyof Customer, value: string) => {
    setCustomer((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = (): boolean => {
    // Basic validation
    if (!customer.fullName.trim()) {
      Alert.alert("Validation Error", "Full name is required");
      return false;
    }

    if (!customer.email.trim()) {
      Alert.alert("Validation Error", "Email is required");
      return false;
    }

    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customer.email)) {
      Alert.alert("Validation Error", "Please enter a valid email address");
      return false;
    }

    if (!customer.phoneNumber.trim()) {
      Alert.alert("Validation Error", "Phone number is required");
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      if (isEditMode && customer.id) {
        // Update existing customer
        await updateCustomer(customer.id, {
          fullName: customer.fullName,
          username: customer.username,
          email: customer.email,
          phoneNumber: customer.phoneNumber,
          address: customer.address,
          imageUrl: customer.imageUrl,
        });
        Alert.alert("Success", "Customer updated successfully");
      } else {
        // Create new customer
        await createCustomer({
          fullName: customer.fullName,
          username: customer.username,
          email: customer.email,
          phoneNumber: customer.phoneNumber,
          address: customer.address,
          imageUrl: customer.imageUrl,
          createdAt: new Date().toISOString(),
          transactions: [],
        });
        Alert.alert("Success", "Customer created successfully");
      }
      navigation.goBack();
    } catch (error) {
      console.error("Failed to save customer:", error);
      Alert.alert(
        "Error",
        `Failed to ${
          isEditMode ? "update" : "create"
        } customer. Please try again.`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = () => {
    if (!isEditMode || !customer.id) return;

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
          style: "destructive",
          onPress: async () => {
            try {
              setIsLoading(true);
              await deleteCustomer(customer.id);
              Alert.alert("Success", "Customer deleted successfully");
              navigation.goBack();
            } catch (error) {
              console.error("Failed to delete customer:", error);
              Alert.alert(
                "Error",
                "Failed to delete customer. Please try again."
              );
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const pickImage = async () => {
    try {
      // Request permissions
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Camera roll permission is required to select an image."
        );
        return;
      }

      // Open image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled) {
        const imageUrl = result.assets[0].uri;
        setCustomer((prev) => ({
          ...prev,
          imageUrl: imageUrl,
        }));
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to select image. Please try again.");
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text variant="headlineMedium" style={styles.title}>
            {isEditMode ? "Edit Customer" : "Add New Customer"}
          </Text>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            mode="outlined"
            value={customer.fullName}
            onChangeText={(text) => handleChange("fullName", text)}
            style={styles.input}
            placeholder="Enter full name"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Username</Text>
          <TextInput
            mode="outlined"
            value={customer.username}
            onChangeText={(text) => handleChange("username", text)}
            style={styles.input}
            placeholder="Enter username"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            mode="outlined"
            value={customer.email}
            onChangeText={(text) => handleChange("email", text)}
            keyboardType="email-address"
            style={styles.input}
            placeholder="Enter email address"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            mode="outlined"
            value={customer.phoneNumber}
            onChangeText={(text) => handleChange("phoneNumber", text)}
            keyboardType="phone-pad"
            style={styles.input}
            placeholder="Enter phone number"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Address</Text>
          <TextInput
            mode="outlined"
            value={customer.address}
            onChangeText={(text) => handleChange("address", text)}
            multiline
            numberOfLines={3}
            style={[styles.input, styles.multilineInput]}
            placeholder="Enter address"
          />
        </View>

        <View style={styles.buttonGroup}>
          <Button
            mode="contained"
            onPress={handleSave}
            loading={isLoading}
            style={styles.saveButton}
            disabled={isLoading}
          >
            {isEditMode ? "Save Changes" : "Create Customer"}
          </Button>

          <Button
            mode="outlined"
            onPress={() => navigation.goBack()}
            style={styles.cancelButton}
            disabled={isLoading}
          >
            Cancel
          </Button>

          {isEditMode && (
            <Button
              mode="contained-tonal"
              onPress={handleDelete}
              style={styles.deleteButton}
              textColor="#dc3545"
              disabled={isLoading}
            >
              Delete Customer
            </Button>
          )}
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
