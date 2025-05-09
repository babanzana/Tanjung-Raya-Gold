// edit-product.screen.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

export const AdminProductDetailScreen = ({
  product,
  onSave,
  onCancel,
}: any) => {
  const [editedProduct, setEditedProduct] = useState<any>({ ...product });

  const handleChange = (field: keyof any, value: string | number) => {
    setEditedProduct((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = () => {
    onSave(editedProduct);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView style={styles.container}>
        {editedProduct.image &&
          (() => {
            // Pastikan imageUrl ada sebelum memanggil split
            const imageUrl = editedProduct?.image; // Ambil URL gambar dari produk yang diedit

            // Periksa apakah imageUrl ada sebelum mencoba melakukan split
            const fileId = imageUrl
              ? imageUrl.split("/file/d/")[1]?.split("/")[0]
              : null;

            // Format ulang URL jika fileId ada
            const displayUrl = fileId
              ? `https://drive.google.com/uc?export=view&id=${fileId}`
              : null;

            return (
              <Image
                source={{ uri: displayUrl || editedProduct?.image }} // Gunakan displayUrl jika ada, atau fallback ke editedProduct.image
                style={styles.productImage}
                resizeMode="contain"
              />
            );
          })()}

        <View style={styles.formGroup}>
          <Text style={styles.label}>Product Name</Text>
          <TextInput
            style={styles.input}
            value={editedProduct.name}
            onChangeText={(text) => handleChange("name", text)}
            placeholder="Enter product name"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Category</Text>
          <TextInput
            style={styles.input}
            value={editedProduct.category}
            onChangeText={(text) => handleChange("category", text)}
            placeholder="Enter category"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Price (IDR)</Text>
          <TextInput
            style={styles.input}
            value={editedProduct.price.toString()}
            onChangeText={(text) => handleChange("price", Number(text) || 0)}
            placeholder="Enter price"
            keyboardType="numeric"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Stock</Text>
          <TextInput
            style={styles.input}
            value={editedProduct.stock.toString()}
            onChangeText={(text) => handleChange("stock", Number(text) || 0)}
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
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.buttonText}>Save Changes</Text>
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
    marginBottom: 20,
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
    marginTop: 15,
    marginBottom: 20,
    resizeMode: "contain",
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
  },
  saveButton: {
    backgroundColor: "#007bff",
    padding: 15,
    borderRadius: 8,
    flex: 1,
    marginLeft: 10,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#dc3545",
    padding: 15,
    borderRadius: 8,
    flex: 1,
    marginRight: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
