import { AdminCustomersDetailScreen } from "./admin-customers-detail.screen";

export const AdminCustomersDetailContainer = ({ navigation, route }: any) => {
  const { customer } = route.params;
  const handleSave = (updatedCustomer: any) => {
    // Logika untuk menyimpan perubahan
    console.log("Customer saved:", updatedCustomer);
    navigation.goBack(); // Kembali ke halaman sebelumnya setelah menyimpan
  };

  const handleCancel = () => {
    navigation.goBack(); // Kembali ke halaman sebelumnya tanpa menyimpan
  };
  return (
    <AdminCustomersDetailScreen
      customer={customer}
      onSave={handleSave}
      onCancel={handleCancel}
    />
  );
};
