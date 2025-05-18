// admin-product-detail.container.tsx
import React, { useState } from "react";
import { AdminProductDetailScreen } from "./admin-product-detail.screen";
import { saveProduct } from "../../../../../firebase";
import { Alert } from "react-native";

export const AdminProductDetailContainer = ({ navigation, route }: any) => {
  const [isLoading, setIsLoading] = useState(false);

  // Dapatkan data produk dari params, jika kosong berarti Add New
  const { product = {} } = route.params || {};

  // Jika tidak ada ID, ini adalah produk baru
  const isNewProduct = !product.id;

  const handleSave = async (updatedProduct: any) => {
    // Validasi sebelum menyimpan
    if (!updatedProduct.name || !updatedProduct.category) {
      Alert.alert("Validation Error", "Name and category are required fields");
      return;
    }

    if (isNaN(updatedProduct.price) || updatedProduct.price <= 0) {
      Alert.alert(
        "Validation Error",
        "Price must be a valid number greater than 0"
      );
      return;
    }

    if (isNaN(updatedProduct.stock) || updatedProduct.stock < 0) {
      Alert.alert(
        "Validation Error",
        "Stock must be a valid non-negative number"
      );
      return;
    }

    try {
      setIsLoading(true);

      // Pastikan nilai price dan stock adalah numeric
      const preparedProduct = {
        ...updatedProduct,
        price: Number(updatedProduct.price),
        stock: Number(updatedProduct.stock),
      };

      const result = await saveProduct(preparedProduct);

      if (result.success) {
        Alert.alert(
          "Success",
          isNewProduct
            ? "Product added successfully!"
            : "Product updated successfully!"
        );
        navigation.goBack();
      } else {
        console.log("Gagal menyimpan:", result.error);
        Alert.alert("Error", result.error || "Failed to save product");
      }
    } catch (error) {
      console.error("Error saving product:", error);
      Alert.alert(
        "Error",
        "An unexpected error occurred while saving the product"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    // Konfirmasi jika pengguna ingin membatalkan
    if (isNewProduct) {
      Alert.alert(
        "Cancel Adding Product",
        "Are you sure you want to cancel? All entered data will be lost.",
        [
          { text: "No", style: "cancel" },
          { text: "Yes", onPress: () => navigation.goBack() },
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  return (
    <AdminProductDetailScreen
      product={product}
      onSave={handleSave}
      onCancel={handleCancel}
      isLoading={isLoading}
      isNewProduct={isNewProduct}
    />
  );
};
