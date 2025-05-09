import React, { useEffect, useState } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import {
  Text,
  Card,
  Button,
  Modal,
  PaperProvider,
  Menu,
  Divider,
} from "react-native-paper";
import { DUMMY_TRANSACTION } from "../../../../dummy";
import {
  getAllTransactionHistory,
  getTransactionHistory,
} from "../../../../../firebase";

export const AdminTransactionsScreen = () => {
  const [transactions, setTransactions] = useState<any[]>(DUMMY_TRANSACTION);
  const [selectedTransaction, setSelectedTransaction] = useState<any | null>(
    null
  );
  const [detailVisible, setDetailVisible] = useState(false);
  const [imageVisible, setImageVisible] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  // Ambil transaksi dari Firebase saat komponen dimuat
  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      console.log("Fetching transactions...");

      const result = await getAllTransactionHistory();
      console.log("Transaction result:", result); // Debug hasil query

      if (result.success) {
        setTransactions(result.data || []);
      } else {
        console.error("Error fetching transactions:", result.error);
        console.error("Full error:", result.fullError); // Jika ada
        Alert.alert("Error", result.error || "Failed to load transactions");
      }

      setLoading(false);
    };

    fetchTransactions();
  }, []);

  const showDetailModal = (transaction: any) => {
    setSelectedTransaction(transaction);
    setDetailVisible(true);
  };

  const hideDetailModal = () => setDetailVisible(false);

  const showImageModal = () => {
    setImageVisible(true);
  };

  const hideImageModal = () => setImageVisible(false);

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString("id-ID", options);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const updateStatus = (newStatus: any["status"]) => {
    if (!selectedTransaction) return;

    const updatedTransactions = transactions.map((t) =>
      t.id === selectedTransaction.id ? { ...t, status: newStatus } : t
    );

    setTransactions(updatedTransactions);
    setSelectedTransaction({ ...selectedTransaction, status: newStatus });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Menunggu Pembayaran":
        return "#FFA500"; // Orange
      case "Diproses":
        return "#2196F3"; // Blue
      case "Dikirim":
        return "#9C27B0"; // Purple
      case "Selesai":
        return "#4CAF50"; // Green
      case "Dibatalkan":
        return "#F44336"; // Red
      default:
        return "#607D8B"; // Gray
    }
  };

  return (
    <PaperProvider>
      <ScrollView contentContainerStyle={styles.container}>
        {loading ? (
          <Text>Loading...</Text> // Menampilkan loading jika data masih diambil
        ) : (
          transactions.map((transaction) => (
            <TouchableOpacity
              key={transaction.id}
              onPress={() => showDetailModal(transaction)}
            >
              <Card style={styles.card}>
                <Card.Content>
                  <View style={styles.cardHeader}>
                    <Text variant="titleMedium">{transaction.nama}</Text>
                    <Text
                      style={[
                        styles.status,
                        { color: getStatusColor(transaction.status) },
                      ]}
                    >
                      {transaction.status}
                    </Text>
                  </View>

                  <Text variant="bodyMedium">
                    {formatDate(transaction.tanggal)}
                  </Text>

                  <View style={styles.cardFooter}>
                    <Text variant="bodyMedium">item</Text>
                    <Text variant="titleSmall" style={styles.total}>
                      {formatCurrency(transaction.total)}
                    </Text>
                  </View>

                  <Text variant="bodyMedium">
                    {transaction.metodePembayaran}
                  </Text>
                </Card.Content>
              </Card>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      <Modal
        visible={detailVisible}
        onDismiss={hideDetailModal}
        contentContainerStyle={styles.modalContainer}
      >
        {selectedTransaction && (
          <Card style={styles.modalCard}>
            <Card.Title
              title={`Transaksi #${selectedTransaction.id}`}
              titleStyle={styles.modalTitle}
              subtitle={`Oleh: ${selectedTransaction.nama}`}
              subtitleStyle={styles.modalSubtitle}
            />
            <ScrollView style={styles.modalScrollView}>
              <Card.Content style={styles.modalContent}>
                <View style={styles.detailSection}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Tanggal:</Text>
                    <Text style={styles.detailValue}>
                      {formatDate(selectedTransaction.tanggal)}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Status:</Text>
                    <View style={styles.statusBadge}>
                      <Text
                        style={[
                          styles.statusText,
                          {
                            color: getStatusColor(selectedTransaction.status),
                          },
                        ]}
                      >
                        {selectedTransaction.status}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Alamat:</Text>
                    <Text style={styles.detailValue}>
                      {selectedTransaction.alamat
                        ? selectedTransaction.alamat
                        : "Alamat tidak tersedia"}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Metode Pembayaran:</Text>
                    <Text style={styles.detailValue}>
                      {selectedTransaction.metodePembayaran}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Total:</Text>
                    <Text style={[styles.detailValue, styles.totalAmount]}>
                      {formatCurrency(selectedTransaction.total)}
                    </Text>
                  </View>
                </View>

                <Divider style={styles.divider} />

                <Text style={styles.sectionHeader}>Items:</Text>

                {selectedTransaction.items.map((item: any) => (
                  <View key={item.id} style={styles.itemCard}>
                    <Image
                      source={{ uri: item.image }}
                      style={styles.itemImage}
                    />
                    <View style={styles.itemInfo}>
                      <Text style={styles.itemName}>{item.nama}</Text>
                      <View style={styles.itemPriceRow}>
                        <Text style={styles.itemPrice}>
                          {item.qty} × {formatCurrency(item.harga)}
                        </Text>
                        <Text style={styles.itemTotal}>
                          {formatCurrency(item.totalHarga)}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
              </Card.Content>
            </ScrollView>
            <Card.Actions style={styles.actionButtons}>
              <Button
                mode="outlined"
                onPress={hideDetailModal}
                style={styles.closeButton}
              >
                Tutup
              </Button>

              {selectedTransaction.buktiPembayaran && (
                <Button
                  mode="contained"
                  icon="file-image"
                  onPress={showImageModal}
                  style={styles.actionButton}
                >
                  Lihat Bukti Pembayaran
                </Button>
              )}

              <Menu
                visible={menuVisible}
                onDismiss={() => setMenuVisible(false)}
                anchor={
                  <Button
                    mode="contained"
                    icon="cog"
                    onPress={() => setMenuVisible(true)}
                    style={styles.statusButton}
                  >
                    Ubah Status
                  </Button>
                }
                contentStyle={[
                  styles.menuContent,
                  {
                    maxHeight: 200,
                    overflow: "scroll",
                    marginBottom: 40,
                  },
                ]}
                anchorPosition="top"
              >
                <Menu.Item
                  leadingIcon="check"
                  onPress={() => {
                    updateStatus("Selesai");
                    setMenuVisible(false);
                  }}
                  title="Terima Pembayaran"
                  disabled={selectedTransaction.status === "Selesai"}
                />
                <Menu.Item
                  leadingIcon="truck"
                  onPress={() => {
                    updateStatus("Dikirim");
                    setMenuVisible(false);
                  }}
                  title="Tandai Dikirim"
                  disabled={
                    !["Diproses", "Menunggu Pembayaran"].includes(
                      selectedTransaction.status
                    )
                  }
                />
                <Menu.Item
                  leadingIcon="close"
                  onPress={() => {
                    updateStatus("Dibatalkan");
                    setMenuVisible(false);
                  }}
                  title="Batalkan Transaksi"
                  disabled={["Selesai", "Dibatalkan"].includes(
                    selectedTransaction.status
                  )}
                />
              </Menu>
            </Card.Actions>
          </Card>
        )}
      </Modal>

      <Modal
        visible={imageVisible}
        onDismiss={hideImageModal}
        contentContainerStyle={styles.imageModalContainer}
      >
        {selectedTransaction && (
          <View style={styles.imageModalContent}>
            <Button
              icon="close"
              onPress={hideImageModal}
              style={styles.closeImageButton}
              labelStyle={styles.closeButtonLabel}
            >
              Tutup
            </Button>
            <Image
              source={{ uri: selectedTransaction.buktiPembayaran }}
              style={styles.fullImage}
              resizeMode="contain"
            />
            <Text style={styles.imageCaption}>Bukti Pembayaran</Text>
          </View>
        )}
      </Modal>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 8,
  },
  status: {
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  total: {
    fontWeight: "bold",
    color: "#FFD700",
  },
  sectionTitle: {
    fontWeight: "bold",
    marginTop: 8,
    marginBottom: 12,
    fontSize: 16,
  },
  itemContainer: {
    flexDirection: "row",
    marginBottom: 12,
    alignItems: "center",
  },
  itemDetails: {
    flex: 1,
  },
  cardActions: {
    justifyContent: "space-between",
  },
  modalContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    justifyContent: "flex-start",
  },
  modalCard: {
    backgroundColor: "white",
    maxHeight: "90%",
    width: "100%",
  },
  modalScrollView: {
    maxHeight: "70%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#666",
  },
  modalContent: {
    paddingTop: 8,
  },
  detailSection: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: "#666",
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "500",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: "#f5f5f5",
  },
  statusText: {
    fontSize: 14,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFD700",
  },
  divider: {
    marginVertical: 16,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#333",
  },
  itemCard: {
    flexDirection: "row",
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
    justifyContent: "center",
  },
  itemName: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 4,
  },
  itemPriceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  itemPrice: {
    fontSize: 13,
    color: "#666",
  },
  itemTotal: {
    fontSize: 14,
    fontWeight: "bold",
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 8,
  },
  closeButton: {
    borderColor: "#666",
    flex: 1,
  },
  actionButton: {
    backgroundColor: "#2196F3",
    flex: 1,
  },
  statusButton: {
    backgroundColor: "#4CAF50",
    flex: 1,
  },
  menuContent: {
    backgroundColor: "white",
  },
  imageModalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.9)",
  },
  imageModalContent: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  fullImage: {
    width: "100%",
    height: "80%",
  },
  closeImageButton: {
    position: "absolute",
    top: 40,
    right: 20,
    zIndex: 1000,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  closeButtonLabel: {
    color: "white",
  },
  imageCaption: {
    color: "white",
    marginTop: 16,
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default AdminTransactionsScreen;
