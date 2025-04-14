import { AdminProductDetailScreen } from "./admin-product-detail.screen";

export const AdminProductDetailContainer = ({ navigation, route }: any) => {
  const { product } = route.params;
  const handleSave = (updatedProduct: any) => {
    // Logika untuk menyimpan perubahan
    console.log("Product saved:", updatedProduct);
    navigation.goBack(); // Kembali ke halaman sebelumnya setelah menyimpan
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
