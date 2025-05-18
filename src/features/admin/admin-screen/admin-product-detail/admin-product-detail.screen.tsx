import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";

export const AdminProductDetailScreen = ({
  product,
  onSave,
  onCancel,
  isLoading,
  isNewProduct,
}: any) => {
  // Default values untuk product baru
  const defaultProduct = {
    name: "",
    category: "",
    price: "",
    stock: "",
    image: "",
    description: "",
  };

  // Inisialisasi state dengan nilai default jika product baru, atau nilai produk yang ada jika edit
  const [editedProduct, setEditedProduct] = useState<any>(
    isNewProduct
      ? defaultProduct
      : {
          ...product,
          // Konversi nilai numerik ke string untuk TextInput
          price: product.price?.toString() || "",
          stock: product.stock?.toString() || "",
        }
  );

  const handleChange = (field: string, value: string | number) => {
    setEditedProduct((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = () => {
    onSave(editedProduct);
  };

  // Render image jika ada
  const renderImage = () => {
    if (!editedProduct.image) return null;

    const imageUrl = editedProduct.image;
    const fileId = imageUrl
      ? imageUrl.split("/file/d/")[1]?.split("/")[0]
      : null;

    const displayUrl = fileId
      ? `https://drive.google.com/uc?export=view&id=${fileId}`
      : null;

    return (
      <Image
        source={{ uri: displayUrl || editedProduct.image }}
        style={styles.productImage}
        resizeMode="contain"
      />
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView style={styles.container}>

        {renderImage()}

        <View style={styles.formGroup}>
          <Text style={styles.label}>
            Product Name<Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            value={editedProduct.name}
            onChangeText={(text) => handleChange("name", text)}
            placeholder="Enter product name"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>
            Category<Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            value={editedProduct.category}
            onChangeText={(text) => handleChange("category", text)}
            placeholder="Enter category"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>
            Price (IDR)<Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            value={editedProduct.price}
            onChangeText={(text) => handleChange("price", text)}
            placeholder="Enter price"
            keyboardType="numeric"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>
            Stock<Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            value={editedProduct.stock}
            onChangeText={(text) => handleChange("stock", text)}
            placeholder="Enter stock quantity"
            keyboardType="numeric"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Image URL</Text>
          <TextInput
            style={styles.input}
            value={editedProduct.image}
            onChangeText={(text) => handleChange("image", text)}
            placeholder="Enter image URL"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.multilineInput]}
            value={editedProduct.description}
            onChangeText={(text) => handleChange("description", text)}
            placeholder="Enter product description"
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.saveButton, isLoading && styles.disabledButton]}
            onPress={handleSave}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text style={styles.buttonText}>
                {isNewProduct ? "Add Product" : "Save Changes"}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: "#f5f5f5",
  },
  header: {
    marginVertical: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  productImage: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    marginBottom: 20,
    backgroundColor: "#eee",
  },
  formGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: "#555",
  },
  required: {
    color: "red",
    fontSize: 16,
  },
  input: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  multilineInput: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    marginBottom: 30,
  },
  saveButton: {
    backgroundColor: "#007bff",
    padding: 15,
    borderRadius: 8,
    flex: 1,
    marginLeft: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    backgroundColor: "#dc3545",
    padding: 15,
    borderRadius: 8,
    flex: 1,
    marginRight: 10,
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: "#7cadf2",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
