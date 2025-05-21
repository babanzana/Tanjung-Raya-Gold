import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  RefreshControl,
} from "react-native";
import {
  Text,
  Card,
  Button,
  Modal,
  PaperProvider,
  Menu,
  Divider,
  FAB,
  ActivityIndicator,
  Chip,
} from "react-native-paper";
import { DUMMY_TRANSACTION } from "../../../../dummy";
import {
  getAllTransactionHistory,
  updateTransactionStatusAdmin,
  getOfflineTransactions,
} from "../../../../../firebase";

export const AdminTransactionsScreen = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [selectedTransaction, setSelectedTransaction] = useState<any | null>(
    null
  );
  const [detailVisible, setDetailVisible] = useState(false);
  const [imageVisible, setImageVisible] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all"); // "all", "online", "offline"

  // Fungsi untuk mengambil data transaksi (online dan offline)
  const fetchTransactions = async () => {
    setLoading(true);

    try {
      // Ambil transaksi online (dari users)
      const onlineResult = await getAllTransactionHistory();

      // Ambil transaksi offline
      const offlineData = await getOfflineTransactions();

      // Format transaksi offline untuk konsistensi dengan transaksi online
      const formattedOfflineData = offlineData.map((transaction) => ({
        ...transaction,
        transactionType: "offline", // Menambahkan tanda untuk membedakan tipe transaksi
      }));

      // Format transaksi online dengan tanda
      const formattedOnlineData = onlineResult.success
        ? (onlineResult.data || []).map((transaction) => ({
            ...transaction,
            transactionType: "online", // Menambahkan tanda untuk membedakan tipe transaksi
          }))
        : [];

      // Gabungkan kedua jenis transaksi
      const allTransactions = [...formattedOnlineData, ...formattedOfflineData];

      // Urutkan transaksi berdasarkan tanggal (terbaru dulu)
      const sortedTransactions = allTransactions.sort((a, b) => {
        return new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime();
      });

      setTransactions(sortedTransactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      Alert.alert("Error", "Gagal memuat transaksi");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fungsi untuk mendapatkan transaksi yang difilter
  const getFilteredTransactions = () => {
    if (activeFilter === "all") return transactions;
    return transactions.filter((t) => t.transactionType === activeFilter);
  };

  // Fungsi refresh dengan pull-to-refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchTransactions();
  }, []);

  // Ambil transaksi dari Firebase saat komponen dimuat
  useEffect(() => {
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

  // Fungsi untuk mengupdate status transaksi
  // Define a type for the result of updateTransactionStatusAdmin
  type UpdateTransactionStatusResult = {
    success: boolean;
    error?: string;
    [key: string]: any;
  };

  const updateStatus = async (newStatus: string) => {
    if (!selectedTransaction) return;

    setUpdatingStatus(true);

    try {
      // Panggil fungsi updateTransactionStatusAdmin dari Firebase
      const result: any = await updateTransactionStatusAdmin(
        selectedTransaction.id,
        newStatus
      );

      if (result?.success) {
        // Update state lokal jika berhasil
        const updatedTransactions = transactions.map((t) =>
          t.id === selectedTransaction.id ? { ...t, status: newStatus } : t
        );

        setTransactions(updatedTransactions);
        setSelectedTransaction({ ...selectedTransaction, status: newStatus });

        // Tampilkan notifikasi sukses
        Alert.alert(
          "Sukses",
          `Status transaksi berhasil diubah menjadi ${newStatus}`
        );
      } else {
        // Tampilkan pesan error jika gagal
        Alert.alert(
          "Error",
          result?.error || "Gagal mengubah status transaksi"
        );
      }
    } catch (error) {
      console.error("Error updating transaction status:", error);
      Alert.alert("Error", "Terjadi kesalahan saat mengubah status");
    } finally {
      setUpdatingStatus(false);
      setMenuVisible(false);
    }
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

  const getTransactionTypeLabel = (type: string) => {
    return type === "offline" ? "Offline" : "Online";
  };

  const getTransactionTypeColor = (type: string) => {
    return type === "offline" ? "#FF9800" : "#03A9F4";
  };

  return (
    <PaperProvider>
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity onPress={() => setActiveFilter("all")}>
            <Chip
              selected={activeFilter === "all"}
              style={[
                styles.filterChip,
                activeFilter === "all" && styles.activeFilterChip,
              ]}
              textStyle={activeFilter === "all" ? styles.activeFilterText : {}}
            >
              Semua
            </Chip>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setActiveFilter("online")}>
            <Chip
              selected={activeFilter === "online"}
              style={[
                styles.filterChip,
                activeFilter === "online" && styles.activeFilterChip,
              ]}
              textStyle={
                activeFilter === "online" ? styles.activeFilterText : {}
              }
            >
              Online
            </Chip>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setActiveFilter("offline")}>
            <Chip
              selected={activeFilter === "offline"}
              style={[
                styles.filterChip,
                activeFilter === "offline" && styles.activeFilterChip,
              ]}
              textStyle={
                activeFilter === "offline" ? styles.activeFilterText : {}
              }
            >
              Offline
            </Chip>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4CAF50" />
            <Text style={styles.loadingText}>Memuat transaksi...</Text>
          </View>
        ) : (
          getFilteredTransactions().map((transaction) => (
            <TouchableOpacity
              key={transaction.id}
              onPress={() => showDetailModal(transaction)}
            >
              <Card style={styles.card}>
                <Card.Content>
                  <View style={styles.cardHeader}>
                    <View style={styles.headingContainer}>
                      <Text variant="titleMedium">{transaction.nama}</Text>
                      <Chip
                        style={[
                          styles.typeChip,
                          {
                            backgroundColor: getTransactionTypeColor(
                              transaction.transactionType
                            ),
                          },
                        ]}
                        textStyle={styles.typeChipText}
                      >
                        {getTransactionTypeLabel(transaction.transactionType)}
                      </Chip>
                    </View>
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
                    <Text variant="bodyMedium">
                      {transaction.items ? transaction.items.length : 0} item
                    </Text>
                    <Text variant="titleSmall" style={styles.total}>
                      {formatCurrency(transaction.total)}
                    </Text>
                  </View>

                  <Text variant="bodyMedium">
                    {transaction.metodePembayaran || "Tunai"}
                  </Text>
                </Card.Content>
              </Card>
            </TouchableOpacity>
          ))
        )}

        {getFilteredTransactions().length === 0 && !loading && (
          <View style={styles.emptyState}>
            <Text>
              Tidak ada transaksi {activeFilter !== "all" ? activeFilter : ""}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* FAB untuk refresh list */}
      <FAB
        style={styles.fab}
        icon="refresh"
        onPress={onRefresh}
        loading={refreshing}
      />

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
              subtitle={`Oleh: ${
                selectedTransaction.nama
              } (${getTransactionTypeLabel(
                selectedTransaction.transactionType
              )})`}
              subtitleStyle={styles.modalSubtitle}
            />

            {/* Status Button di atas - Tombol dipindah ke atas setelah header */}
            <View style={styles.topActionButtons}>
              <Menu
                visible={menuVisible}
                onDismiss={() => setMenuVisible(false)}
                anchor={
                  <Button
                    mode="contained"
                    icon="cog"
                    onPress={() => setMenuVisible(true)}
                    style={styles.statusButton}
                    loading={updatingStatus}
                    disabled={updatingStatus}
                  >
                    {updatingStatus ? "Mengubah..." : "Ubah Status"}
                  </Button>
                }
                contentStyle={styles.menuContent}
              >
                <Menu.Item
                  leadingIcon="credit-card-check"
                  onPress={() => updateStatus("Menunggu Pembayaran")}
                  title="Menunggu Pembayaran"
                  disabled={
                    selectedTransaction.status === "Menunggu Pembayaran" ||
                    updatingStatus
                  }
                />
                <Menu.Item
                  leadingIcon="shopping"
                  onPress={() => updateStatus("Diproses")}
                  title="Diproses"
                  disabled={
                    selectedTransaction.status === "Diproses" || updatingStatus
                  }
                />
                <Menu.Item
                  leadingIcon="truck"
                  onPress={() => updateStatus("Dikirim")}
                  title="Dikirim"
                  disabled={
                    selectedTransaction.status === "Dikirim" || updatingStatus
                  }
                />
                <Menu.Item
                  leadingIcon="check"
                  onPress={() => updateStatus("Selesai")}
                  title="Selesai"
                  disabled={
                    selectedTransaction.status === "Selesai" || updatingStatus
                  }
                />
                <Menu.Item
                  leadingIcon="close"
                  onPress={() => updateStatus("Dibatalkan")}
                  title="Dibatalkan"
                  disabled={
                    selectedTransaction.status === "Dibatalkan" ||
                    updatingStatus
                  }
                />
              </Menu>

              {selectedTransaction.buktiPembayaran && (
                <Button
                  mode="contained"
                  icon="file-image"
                  onPress={showImageModal}
                  style={styles.actionButton}
                >
                  Lihat Bukti
                </Button>
              )}
            </View>

            <ScrollView style={styles.modalScrollView}>
              <Card.Content style={styles.modalContent}>
                <View style={styles.detailSection}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Tipe Transaksi:</Text>
                    <Chip
                      style={[
                        styles.typeChipDetail,
                        {
                          backgroundColor: getTransactionTypeColor(
                            selectedTransaction.transactionType
                          ),
                        },
                      ]}
                      textStyle={styles.typeChipTextDetail}
                    >
                      {getTransactionTypeLabel(
                        selectedTransaction.transactionType
                      )}
                    </Chip>
                  </View>

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
                      {selectedTransaction.metodePembayaran || "Tunai"}
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

                {selectedTransaction.items &&
                  selectedTransaction.items.map((item: any, index: number) => {
                    // Pastikan imageUrl ada sebelum memanggil split
                    const imageUrl = item?.image; // Ambil URL gambar dari produk yang diedit

                    // Periksa apakah imageUrl ada sebelum mencoba melakukan split
                    const fileId =
                      imageUrl && typeof imageUrl === "string"
                        ? imageUrl.split("/file/d/")[1]?.split("/")[0]
                        : null;

                    // Format ulang URL jika fileId ada
                    const displayUrl = fileId
                      ? `https://drive.google.com/uc?export=view&id=${fileId}`
                      : null;
                    return (
                      <View
                        key={item.id || `item-${index}`}
                        style={styles.itemCard}
                      >
                        {displayUrl || item?.image ? (
                          <Image
                            source={{ uri: displayUrl || item?.image }}
                            style={styles.itemImage}
                          />
                        ) : (
                          <View
                            style={[
                              styles.itemImage,
                              styles.itemImagePlaceholder,
                            ]}
                          >
                            <Text style={styles.itemImagePlaceholderText}>
                              No Image
                            </Text>
                          </View>
                        )}
                        <View style={styles.itemInfo}>
                          <Text style={styles.itemName}>{item.nama}</Text>
                          <View style={styles.itemPriceRow}>
                            <Text style={styles.itemPrice}>
                              {item.qty} × {formatCurrency(item.harga)}
                            </Text>
                            <Text style={styles.itemTotal}>
                              {formatCurrency(
                                item.totalHarga || item.qty * item.harga
                              )}
                            </Text>
                          </View>
                        </View>
                      </View>
                    );
                  })}
              </Card.Content>
            </ScrollView>
            <Card.Actions style={styles.bottomActionButtons}>
              <Button
                mode="outlined"
                onPress={hideDetailModal}
                style={styles.closeButton}
              >
                Tutup
              </Button>
            </Card.Actions>
          </Card>
        )}
      </Modal>

      <Modal
        visible={imageVisible}
        onDismiss={hideImageModal}
        contentContainerStyle={styles.imageModalContainer}
      >
        {selectedTransaction && selectedTransaction.buktiPembayaran && (
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
    minHeight: "100%",
  },
  card: {
    marginBottom: 16,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    alignItems: "center",
  },
  headingContainer: {
    flexDirection: "column",
    gap: 4,
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
  filterContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  filterChip: {
    marginRight: 8,
    backgroundColor: "#f5f5f5",
  },
  activeFilterChip: {
    backgroundColor: "#4CAF50",
  },
  activeFilterText: {
    color: "white",
  },
  typeChip: {
    height: 30,
    alignSelf: "flex-start",
    marginTop: 4,
  },
  typeChipText: {
    fontSize: 10,
    color: "white",
  },
  typeChipDetail: {
    height: 28,
  },
  typeChipTextDetail: {
    color: "white",
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
    maxHeight: "65%", // Dikurangi untuk memberikan ruang untuk tombol di atas
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
    maxWidth: "60%",
    textAlign: "right",
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
  itemImagePlaceholder: {
    backgroundColor: "#e0e0e0",
    justifyContent: "center",
    alignItems: "center",
  },
  itemImagePlaceholderText: {
    fontSize: 10,
    color: "#666",
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
  // Tombol aksi di bagian bawah
  bottomActionButtons: {
    flexDirection: "row",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  // Tombol aksi di bagian atas
  topActionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  closeButton: {
    borderColor: "#666",
    flex: 1,
    maxWidth: "50%",
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
    maxHeight: 250,
    overflow: "scroll",
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
  // FAB untuk refresh
  fab: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: "#4CAF50",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  loadingText: {
    marginTop: 12,
    color: "#666",
  },
});

export default AdminTransactionsScreen;
