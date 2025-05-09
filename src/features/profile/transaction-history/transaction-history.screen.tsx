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

export const TransactionHistoryScreen = ({ route, navigation }: any) => {
  const [transactions, setTransactions] = useState<any[]>([]);
  // console.log("🚀 ~ TransactionHistoryScreen ~ transactions:", transactions);
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
      Alert.alert(
        "No Transaction History",
        "Silahkan berbelanja terlebih dahulu.",
        [
          {
            text: "Belanja Sekarang",
            onPress: () => navigation.navigate("HomeStack", { screen: "Home" }),
          },
        ],
        { cancelable: false }
      );
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
    const formattedDate = new Date(item.tanggal).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    return (
      <TouchableOpacity
        style={styles.transactionItem}
        onPress={() => setSelectedTransaction(item)}
      >
        <View style={styles.transactionHeader}>
          <Text style={styles.transactionDate}>{formattedDate}</Text>
          <Text
            style={[
              styles.transactionStatus,
              item.status === "Pending"
                ? styles.statusPending
                : item.status === "Completed"
                ? styles.statusCompleted
                : styles.statusCancelled,
            ]}
          >
            {item.status}
          </Text>
        </View>

        {/* Display first product as the main item */}
        {item.items.length > 0 && (
          <View style={styles.productContainer}>
            {/* Ambil gambar produk pertama */}
            {(() => {
              const imageUrl = item.items[0]?.image; // Ambil URL gambar dari produk pertama

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
                  source={{ uri: displayUrl || item.items[0]?.image }} // Gunakan displayUrl jika ada, atau fallback ke item.items[0].image
                  style={styles.productImage}
                />
              );
            })()}

            <View style={styles.productInfo}>
              <Text style={styles.productName}>{item.items[0]?.nama}</Text>
              <Text style={styles.productPrice}>
                {formatPrice(item.items[0]?.harga)} x {item.items[0]?.qty}
              </Text>
              {item.items.length > 1 && (
                <Text style={styles.additionalItems}>
                  +{item.items.length - 1} item lainnya
                </Text>
              )}
            </View>
          </View>
        )}

        <View style={styles.transactionFooter}>
          <Text style={styles.paymentMethod}>
            <MaterialIcons name="payment" size={16} color="#666" />{" "}
            {item.metodePembayaran}
          </Text>
          <Text style={styles.totalText}>Total: {formatPrice(item.total)}</Text>
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
  }) => {
    if (!selectedTransaction) return null;

    const formattedDate = new Date(
      selectedTransaction.tanggal
    ).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    return (
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
                <Text style={styles.detailLabel}>ID Transaksi</Text>
                <Text style={styles.detailValue}>{selectedTransaction.id}</Text>
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>Tanggal</Text>
                <Text style={styles.detailValue}>{formattedDate}</Text>
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>Status</Text>
                <Text
                  style={[
                    styles.detailValue,
                    selectedTransaction.status === "Pending"
                      ? styles.statusPending
                      : selectedTransaction.status === "Completed"
                      ? styles.statusCompleted
                      : styles.statusCancelled,
                  ]}
                >
                  {selectedTransaction.status}
                </Text>
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>Nama Pembeli</Text>
                <Text style={styles.detailValue}>
                  {selectedTransaction.nama}
                </Text>
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>Metode Pembayaran</Text>
                <Text style={styles.detailValue}>
                  {selectedTransaction.metodePembayaran}
                </Text>
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>Alamat Pengiriman</Text>
                <Text style={styles.detailValue}>
                  {selectedTransaction.alamat}
                </Text>
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>Catatan</Text>
                <Text style={styles.detailValue}>
                  {selectedTransaction.notes || "-"}
                </Text>
              </View>

              <Text style={styles.itemsTitle}>
                Item yang Dibeli ({selectedTransaction.items.length})
              </Text>
              {selectedTransaction.items.map((item: any) => {
                // Pastikan imageUrl ada sebelum memanggil split
                const imageUrl = item?.image; // Ambil URL gambar dari produk

                // Periksa apakah imageUrl ada sebelum mencoba melakukan split
                const fileId = imageUrl
                  ? imageUrl.split("/file/d/")[1]?.split("/")[0]
                  : null;

                // Format ulang URL jika fileId ada
                const displayUrl = fileId
                  ? `https://drive.google.com/uc?export=view&id=${fileId}`
                  : imageUrl; // Fallback ke URL asli jika bukan Google Drive

                return (
                  <View key={item.id} style={styles.detailItem}>
                    <Image
                      source={{
                        uri: displayUrl || "https://via.placeholder.com/150",
                      }} // Fallback image jika URL tidak valid
                      style={styles.detailImage}
                      onError={(e) =>
                        console.log("Error loading image:", e.nativeEvent.error)
                      }
                    />
                    <View style={styles.detailItemInfo}>
                      <Text style={styles.detailItemName}>{item.nama}</Text>
                      <Text style={styles.detailItemCategory}>
                        {item.category}
                      </Text>
                      <Text style={styles.detailItemPrice}>
                        {formatPrice(item.harga)} x {item.qty}
                      </Text>
                    </View>
                    <Text style={styles.detailItemTotal}>
                      {formatPrice(item.totalHarga)}
                    </Text>
                  </View>
                );
              })}

              {selectedTransaction.buktiPembayaran && (
                <>
                  <Text style={styles.itemsTitle}>Bukti Pembayaran</Text>
                  <TouchableOpacity
                    onPress={() =>
                      onShowFullImage(selectedTransaction.buktiPembayaran)
                    }
                  >
                    <Image
                      source={{ uri: selectedTransaction.buktiPembayaran }}
                      style={styles.paymentProof}
                      resizeMode="contain"
                    />
                  </TouchableOpacity>
                </>
              )}

              <View style={styles.totalContainer}>
                <Text style={styles.grandTotalLabel}>Total Pembayaran</Text>
                <Text style={styles.grandTotal}>
                  {formatPrice(selectedTransaction.total)}
                </Text>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

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
  }, // ... style yang sudah ada
  alertContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 20,
  },
  alertContent: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    width: "80%",
    alignItems: "center",
  },
  // Perubahan pada empty text untuk alert
  emptyText: {
    fontSize: 16,
    color: "#ff4444", // Warna merah untuk error
    marginBottom: 20,
    textAlign: "center",
  },
  // Style tombol untuk alert
  shopButton: {
    backgroundColor: "#FFD700",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  shopButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
  additionalItems: {
    fontSize: 12,
    color: "#666",
    marginTop: 3,
  },
  detailItemCategory: {
    fontSize: 12,
    color: "#888",
    marginBottom: 3,
  },
});
