import { ref, set } from "@react-native-firebase/database";
import { AdminProductDetailScreen } from "./admin-product-detail.screen";
import { saveProduct } from "../../../../../firebase";
import { Alert } from "react-native";
export const AdminProductDetailContainer = ({ navigation, route }: any) => {
  const { product } = route.params;
  // const handleSave = (updatedProduct: any) => {
  //   // Logika untuk menyimpan perubahan
  //   console.log("Product saved:", updatedProduct);
  //   navigation.goBack(); // Kembali ke halaman sebelumnya setelah menyimpan
  // };
  const handleSave = async (updatedProduct: any) => {
    // Panggil fungsi dari firebase.js
    const result = await saveProduct(updatedProduct);

    if (result.success) {
      console.log("Produk berhasil disimpan!");
      navigation.goBack();
    } else {
      console.log("Gagal menyimpan:", result.error);
      Alert.alert("Error", "Gagal menyimpan produk");
    }
  };

  const handleCancel = () => {
    navigation.goBack(); // Kembali ke halaman sebelumnya tanpa menyimpan
  };
  return (
    <AdminProductDetailScreen
      product={product}
      onSave={handleSave}
      onCancel={handleCancel}
    />
  );
};
