import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ScrollView,
  Modal,
  RefreshControl,
  Alert,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { formatPrice } from "../../../utils"; // Import fungsi getTransactionHistory dari firebase
import { auth, getTransactionHistory } from "../../../../firebase";

export const TransactionHistoryScreen = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  console.log("🚀 ~ TransactionHistoryScreen ~ transactions:", transactions);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showFullImage, setShowFullImage] = useState(false);
  const [fullImageUri, setFullImageUri] = useState("");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Fungsi untuk mengambil riwayat transaksi
  const fetchTransactionHistory = async () => {
    if (!auth.currentUser) {
      Alert.alert("Error", "Anda harus login terlebih dahulu.");
      return;
    }

    setLoading(true);
    const result = await getTransactionHistory(auth.currentUser.uid);
    if (result.success) {
      setTransactions(result.data || []);
    } else {
      Alert.alert("Error", result.error || "Gagal memuat riwayat transaksi");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTransactionHistory();
  }, []);

  const handleShowFullImage = (uri: string) => {
    setFullImageUri(uri);
    setShowFullImage(true);
  };

  const renderTransactionItem = ({ item }: { item: any }) => {
    // Pastikan price adalah angka
    const totalPrice = parseFloat(item.total);
    if (isNaN(totalPrice)) {
      return <Text>Invalid Price</Text>; // Tampilkan pesan jika harga tidak valid
    }

    return (
      <TouchableOpacity
        style={styles.transactionItem}
        onPress={() => setSelectedTransaction(item)}
      >
        <View style={styles.transactionHeader}>
          <Text style={styles.transactionDate}>{item.date}</Text>
          <Text style={styles.transactionStatus}>{item.status}</Text>
        </View>

        <View style={styles.productContainer}>
          <Image source={{ uri: item.image }} style={styles.productImage} />
          <View style={styles.productInfo}>
            <Text style={styles.productName}>{item.name}</Text>
            <Text style={styles.productPrice}>{formatPrice(totalPrice)}</Text>
            <Text style={styles.productQuantity}>Qty: {item.quantity}</Text>
          </View>
        </View>

        <View style={styles.transactionFooter}>
          <Text style={styles.paymentMethod}>
            <MaterialIcons name="payment" size={16} color="#666" />{" "}
            {item.paymentMethod}
          </Text>
          <Text style={styles.totalText}>
            Total: {formatPrice(item.price * item.quantity)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const TransactionDetailModal = ({
    selectedTransaction,
    onClose,
    onShowFullImage,
  }: {
    selectedTransaction: any;
    onClose: () => void;
    onShowFullImage: (uri: string) => void;
  }) => (
    <Modal
      visible={!!selectedTransaction}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Detail Transaksi</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <MaterialIcons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.detailSection}>
              <Text style={styles.detailLabel}>Tanggal</Text>
              <Text style={styles.detailValue}>
                {selectedTransaction?.date}
              </Text>
            </View>

            <View style={styles.detailSection}>
              <Text style={styles.detailLabel}>Status</Text>
              <Text
                style={[
                  styles.detailValue,
                  styles[
                    `status${
                      selectedTransaction?.status as
                        | "Completed"
                        | "Pending"
                        | "Cancelled"
                    }`
                  ],
                ]}
              >
                {selectedTransaction?.status}
              </Text>
            </View>

            <View style={styles.detailSection}>
              <Text style={styles.detailLabel}>Metode Pembayaran</Text>
              <Text style={styles.detailValue}>
                {selectedTransaction?.paymentMethod}
              </Text>
            </View>

            <View style={styles.detailSection}>
              <Text style={styles.detailLabel}>Alamat Pengiriman</Text>
              <Text style={styles.detailValue}>
                {selectedTransaction?.shippingAddress}
              </Text>
            </View>

            <Text style={styles.itemsTitle}>Item yang Dibeli</Text>
            {transactions
              .filter((t: any) => t.date === selectedTransaction?.date)
              .map((item: any) => (
                <View key={item.id} style={styles.detailItem}>
                  <Image
                    source={{ uri: item.image }}
                    style={styles.detailImage}
                  />
                  <View style={styles.detailItemInfo}>
                    <Text style={styles.detailItemName}>{item.name}</Text>
                    <Text style={styles.detailItemPrice}>
                      {formatPrice(item.price)} x {item.quantity}
                    </Text>
                  </View>
                  <Text style={styles.detailItemTotal}>
                    {formatPrice(item.price * item.quantity)}
                  </Text>
                </View>
              ))}

            {selectedTransaction?.paymentProof && (
              <>
                <Text style={styles.itemsTitle}>Bukti Pembayaran</Text>
                <TouchableOpacity
                  onPress={() =>
                    onShowFullImage(selectedTransaction.paymentProof)
                  }
                >
                  <Image
                    source={{ uri: selectedTransaction.paymentProof }}
                    style={styles.paymentProof}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              </>
            )}

            <View style={styles.totalContainer}>
              <Text style={styles.grandTotalLabel}>Total Pembayaran</Text>
              <Text style={styles.grandTotal}>
                {formatPrice(
                  transactions
                    .filter((t: any) => t.date === selectedTransaction?.date)
                    .reduce(
                      (sum: any, item: any) => sum + item.price * item.quantity,
                      0
                    )
                )}
              </Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTransactionHistory();
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={transactions}
        renderItem={renderTransactionItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />

      <TransactionDetailModal
        selectedTransaction={selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
        onShowFullImage={handleShowFullImage}
      />

      {/* Modal Gambar Full Screen */}
      <Modal visible={showFullImage} transparent={true}>
        <View style={styles.fullImageContainer}>
          <TouchableOpacity
            style={styles.closeFullImageButton}
            onPress={() => setShowFullImage(false)}
          >
            <MaterialIcons name="close" size={30} color="#fff" />
          </TouchableOpacity>
          <Image
            source={{ uri: fullImageUri }}
            style={styles.fullImage}
            resizeMode="contain"
          />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    padding: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  listContainer: {
    paddingBottom: 20,
  },
  transactionItem: {
    backgroundColor: "#fff",
    marginBottom: 10,
    padding: 15,
    borderRadius: 8,
    marginHorizontal: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  transactionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  transactionDate: {
    fontSize: 14,
    color: "#666",
  },
  transactionStatus: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#4CAF50",
  },
  productContainer: {
    flexDirection: "row",
    marginBottom: 10,
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 15,
  },
  productInfo: {
    flex: 1,
    justifyContent: "center",
  },
  productName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 5,
  },
  productPrice: {
    fontSize: 14,
    color: "#666",
    marginBottom: 3,
  },
  productQuantity: {
    fontSize: 14,
    color: "#666",
  },
  transactionFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 10,
  },
  paymentMethod: {
    fontSize: 14,
    color: "#666",
  },
  totalText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
    paddingBottom: 20,
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderRadius: 10,
    maxHeight: "80%",
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  closeButton: {
    padding: 5,
  },
  modalContent: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  detailSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
    marginTop: 10,
  },
  detailLabel: {
    fontSize: 15,
    color: "#666",
    flex: 1,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: "500",
    color: "#333",
    flex: 1,
    textAlign: "right",
  },
  statusCompleted: {
    color: "#4CAF50",
  },
  statusPending: {
    color: "#FFC107",
  },
  statusCancelled: {
    color: "#F44336",
  },
  itemsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
    color: "#333",
  },
  detailItem: {
    flexDirection: "row",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    alignItems: "center",
  },
  detailImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 15,
  },
  detailItemInfo: {
    flex: 1,
  },
  detailItemName: {
    fontSize: 15,
    marginBottom: 5,
  },
  detailItemPrice: {
    fontSize: 14,
    color: "#666",
  },
  detailItemTotal: {
    fontSize: 15,
    fontWeight: "bold",
  },
  paymentProof: {
    width: "100%",
    height: 300,
    borderRadius: 8,
    marginVertical: 10,
  },
  totalContainer: {
    marginTop: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  grandTotalLabel: {
    fontSize: 17,
    fontWeight: "bold",
  },
  grandTotal: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFD700",
  },
  fullImageContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  fullImage: {
    width: "100%",
    height: "80%",
    resizeMode: "contain",
  },
  closeFullImageButton: {
    position: "absolute",
    top: 40,
    right: 20,
    zIndex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 20,
    padding: 5,
  },
});
