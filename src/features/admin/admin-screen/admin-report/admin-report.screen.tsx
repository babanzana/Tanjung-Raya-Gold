import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
} from "react-native";
import {
  Text,
  Card,
  Button,
  DataTable,
  Divider,
  Menu,
  Portal,
  Modal,
} from "react-native-paper";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";
import XLSX from "xlsx"; // Adjust path as needed
import { getTransactionsByDateRange } from "../../../../../firebase";

export const AdminReportScreen = () => {
  // State for date filters
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  // State for modal visibility
  const [startDateModalVisible, setStartDateModalVisible] = useState(false);
  const [endDateModalVisible, setEndDateModalVisible] = useState(false);

  // State for temporary date selection
  const [tempYear, setTempYear] = useState(new Date().getFullYear());
  const [tempMonth, setTempMonth] = useState(new Date().getMonth() + 1);
  const [tempDay, setTempDay] = useState(new Date().getDate());
  const [currentDateType, setCurrentDateType] = useState(null); // "start" or "end"

  // State for export menu
  const [menuVisible, setMenuVisible] = useState(false);

  // State for data
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Helper functions for date generation
  const generateYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear - 5; i <= currentYear + 1; i++) {
      years.push(i);
    }
    return years;
  };

  const generateMonths = () => {
    return Array.from({ length: 12 }, (_, i) => i + 1);
  };

  const generateDays = () => {
    // Get days in the selected month
    const daysInMonth = new Date(tempYear, tempMonth, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) => i + 1);
  };

  // Format date for display
  const formatDateDisplay = (date: any) => {
    if (!date) return "Pilih Tanggal";
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Open date picker modal
  const openDateModal = (dateType: any) => {
    setCurrentDateType(dateType);

    // Set initial temp values based on current selection or default to today
    const currentDate = dateType === "start" ? startDate : endDate;
    if (currentDate) {
      setTempYear(currentDate.getFullYear());
      setTempMonth(currentDate.getMonth() + 1);
      setTempDay(currentDate.getDate());
    } else {
      const today = new Date();
      setTempYear(today.getFullYear());
      setTempMonth(today.getMonth() + 1);
      setTempDay(today.getDate());
    }

    // Show the appropriate modal
    if (dateType === "start") {
      setStartDateModalVisible(true);
    } else {
      setEndDateModalVisible(true);
    }
  };

  // Save the selected date
  const saveSelectedDate = () => {
    const selectedDate = new Date(tempYear, tempMonth - 1, tempDay);

    if (currentDateType === "start") {
      setStartDate(selectedDate);
      setStartDateModalVisible(false);
    } else {
      setEndDate(selectedDate);
      setEndDateModalVisible(false);
    }
  };

  // Fetch dashboard data based on date range
  const fetchTransactionData = async () => {
    if (!startDate || !endDate) {
      Alert.alert("Error", "Pilih rentang tanggal terlebih dahulu");
      return;
    }

    try {
      setLoading(true);

      // Convert dates to timestamps for Firebase query
      const startTimestamp = startDate.getTime();
      const endTimestamp = endDate.getTime() + (24 * 60 * 60 * 1000 - 1); // End of the day

      const result = await getTransactionsByDateRange(
        startTimestamp,
        endTimestamp
      );
      setTransactions(result);
    } catch (error) {
      console.error("Error fetching transaction data:", error);
      Alert.alert(
        "Error",
        "Terjadi kesalahan saat mengambil data: " +
          (error instanceof Error ? error.message : String(error))
      );
    } finally {
      setLoading(false);
    }
  };

  // Format currency
  const formatCurrency = (amount: any) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Calculate statistics
  const totalTransactions = transactions.length;
  const totalRevenue = transactions.reduce(
    (sum, transaction) => sum + transaction.total,
    0
  );
  const avgTransaction =
    totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

  // Export to PDF
  const exportToPDF = async () => {
    try {
      const html = `
        <html>
          <head>
            <style>
              body { font-family: Arial; padding: 20px; }
              h1 { color: #333; text-align: center; }
              table { width: 100%; border-collapse: collapse; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; }
              .summary { margin-bottom: 20px; }
            </style>
          </head>
          <body>
            <h1>Laporan Transaksi</h1>
            <div class="summary">
              <p>Periode: ${
                startDate ? formatDateDisplay(startDate) : "Semua"
              } - ${endDate ? formatDateDisplay(endDate) : "Semua"}</p>
              <p>Total Transaksi: ${totalTransactions}</p>
              <p>Total Pendapatan: ${formatCurrency(totalRevenue)}</p>
              <p>Rata-rata Transaksi: ${formatCurrency(avgTransaction)}</p>
            </div>
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tanggal</th>
                  <th>Nama</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${transactions
                  .map(
                    (transaction) => `
                  <tr>
                    <td>${transaction.id}</td>
                    <td>${new Date(transaction.tanggal).toLocaleDateString(
                      "id-ID"
                    )}</td>
                    <td>${transaction.nama}</td>
                    <td>${transaction.items
                      .map((item: any) => item.nama)
                      .join(", ")}</td>
                    <td>${formatCurrency(transaction.total)}</td>
                    <td>${transaction.status}</td>
                  </tr>
                `
                  )
                  .join("")}
              </tbody>
            </table>
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri, {
        mimeType: "application/pdf",
        dialogTitle: "Export Laporan PDF",
        UTI: "com.adobe.pdf",
      });
    } catch (error) {
      Alert.alert("Error", "Gagal membuat PDF: " + error);
    }
  };

  // Export to Excel
  const exportToExcel = async () => {
    try {
      // Prepare data
      const worksheetData = [
        ["ID", "Tanggal", "Nama", "Items", "Total", "Status"],
        ...transactions.map((transaction) => [
          transaction.id,
          new Date(transaction.tanggal).toLocaleDateString("id-ID"),
          transaction.nama,
          transaction.items.map((item: any) => item.nama).join(", "),
          transaction.total,
          transaction.status,
        ]),
      ];

      // Create workbook
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
      XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan");

      // Generate file
      const excelBase64 = XLSX.write(workbook, {
        type: "base64",
        bookType: "xlsx",
      });

      // Save file
      const uri = FileSystem.cacheDirectory + "laporan-transaksi.xlsx";
      await FileSystem.writeAsStringAsync(uri, excelBase64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Share file
      await Sharing.shareAsync(uri, {
        mimeType:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        dialogTitle: "Export Laporan Excel",
      });
    } catch (error) {
      Alert.alert("Error", "Gagal membuat Excel: " + error);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Filter Section */}
      <Card style={styles.card}>
        <Card.Title title="Filter Laporan" />
        <Card.Content>
          <View style={styles.datePickerContainer}>
            <Text style={styles.datePickerLabel}>Dari Tanggal</Text>
            <Button
              mode="outlined"
              onPress={() => openDateModal("start")}
              icon="calendar"
              style={styles.dateButton}
              contentStyle={styles.dateButtonContent}
            >
              {formatDateDisplay(startDate)}
            </Button>
          </View>

          <View style={styles.datePickerContainer}>
            <Text style={styles.datePickerLabel}>Sampai Tanggal</Text>
            <Button
              mode="outlined"
              onPress={() => openDateModal("end")}
              icon="calendar"
              style={styles.dateButton}
              contentStyle={styles.dateButtonContent}
            >
              {formatDateDisplay(endDate)}
            </Button>
          </View>

          <Button
            mode="contained"
            onPress={fetchTransactionData}
            style={styles.filterButton}
            disabled={loading}
          >
            {loading ? "Memuat..." : "Tampilkan Laporan"}
          </Button>
        </Card.Content>
      </Card>

      {/* Summary Section */}
      <Card style={styles.summaryCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Ringkasan</Text>
          <DataTable>
            <DataTable.Row>
              <DataTable.Cell>Total Transaksi</DataTable.Cell>
              <DataTable.Cell numeric>{totalTransactions}</DataTable.Cell>
            </DataTable.Row>
            <DataTable.Row>
              <DataTable.Cell>Total Pendapatan</DataTable.Cell>
              <DataTable.Cell numeric>
                {formatCurrency(totalRevenue)}
              </DataTable.Cell>
            </DataTable.Row>
            <DataTable.Row>
              <DataTable.Cell>Rata-rata Transaksi</DataTable.Cell>
              <DataTable.Cell numeric>
                {formatCurrency(avgTransaction)}
              </DataTable.Cell>
            </DataTable.Row>
          </DataTable>
        </Card.Content>
      </Card>

      {/* Export Button */}
      <Menu
        visible={menuVisible}
        onDismiss={() => setMenuVisible(false)}
        anchor={
          <Button
            mode="contained"
            onPress={() => setMenuVisible(true)}
            style={styles.exportButton}
            icon="file-export"
            disabled={transactions.length === 0}
          >
            Export Laporan
          </Button>
        }
      >
        <Menu.Item
          leadingIcon="file-pdf-box"
          onPress={() => {
            setMenuVisible(false);
            exportToPDF();
          }}
          title="Export ke PDF"
        />
        <Menu.Item
          leadingIcon="file-excel-box"
          onPress={() => {
            setMenuVisible(false);
            exportToExcel();
          }}
          title="Export ke Excel"
        />
      </Menu>

      {/* Transactions List */}
      <Text style={[styles.sectionTitle, { marginTop: 16 }]}>
        Daftar Transaksi ({transactions.length})
      </Text>

      {transactions.length === 0 ? (
        <Text style={styles.emptyText}>
          {loading ? "Memuat data..." : "Tidak ada transaksi pada periode ini"}
        </Text>
      ) : (
        transactions.map((transaction) => (
          <Card key={transaction.id} style={styles.transactionCard}>
            <Card.Content>
              <View style={styles.transactionHeader}>
                <Text variant="titleSmall">ID: {transaction.id}</Text>
                <Text variant="titleSmall" style={styles.transactionDate}>
                  {new Date(transaction.tanggal).toLocaleDateString("id-ID", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              </View>

              <Text variant="bodyMedium" style={styles.customerName}>
                {transaction.nama}
              </Text>

              <View style={styles.transactionDetails}>
                <View>
                  <Text variant="bodySmall">
                    Items: {transaction.items.length}
                  </Text>
                  <Text variant="bodySmall">
                    {transaction.metodePembayaran}
                  </Text>
                </View>
                <Text variant="titleMedium" style={styles.transactionTotal}>
                  {formatCurrency(transaction.total)}
                </Text>
              </View>

              <View style={styles.statusContainer}>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(transaction.status) },
                  ]}
                >
                  <Text style={styles.statusText}>{transaction.status}</Text>
                </View>
              </View>
            </Card.Content>
          </Card>
        ))
      )}

      {/* Modal untuk pemilihan tanggal - Tanggal Awal */}
      <Portal>
        <Modal
          visible={startDateModalVisible}
          onDismiss={() => setStartDateModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Card style={styles.modalCard}>
            <Card.Title title="Pilih Tanggal Awal" />
            <Card.Content>
              <View style={styles.dateInputRow}>
                <View style={styles.dateInputContainer}>
                  <Text style={styles.dateInputLabel}>Tahun</Text>
                  <View style={styles.pickerContainer}>
                    <ScrollView style={styles.picker}>
                      {generateYears().map((year) => (
                        <TouchableOpacity
                          key={year}
                          style={[
                            styles.pickerItem,
                            tempYear === year && styles.selectedPickerItem,
                          ]}
                          onPress={() => setTempYear(year)}
                        >
                          <Text
                            style={[
                              styles.pickerItemText,
                              tempYear === year &&
                                styles.selectedPickerItemText,
                            ]}
                          >
                            {year}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                </View>

                <View style={styles.dateInputContainer}>
                  <Text style={styles.dateInputLabel}>Bulan</Text>
                  <View style={styles.pickerContainer}>
                    <ScrollView style={styles.picker}>
                      {generateMonths().map((month) => (
                        <TouchableOpacity
                          key={month}
                          style={[
                            styles.pickerItem,
                            tempMonth === month && styles.selectedPickerItem,
                          ]}
                          onPress={() => setTempMonth(month)}
                        >
                          <Text
                            style={[
                              styles.pickerItemText,
                              tempMonth === month &&
                                styles.selectedPickerItemText,
                            ]}
                          >
                            {month}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                </View>

                <View style={styles.dateInputContainer}>
                  <Text style={styles.dateInputLabel}>Tanggal</Text>
                  <View style={styles.pickerContainer}>
                    <ScrollView style={styles.picker}>
                      {generateDays().map((day) => (
                        <TouchableOpacity
                          key={day}
                          style={[
                            styles.pickerItem,
                            tempDay === day && styles.selectedPickerItem,
                          ]}
                          onPress={() => setTempDay(day)}
                        >
                          <Text
                            style={[
                              styles.pickerItemText,
                              tempDay === day && styles.selectedPickerItemText,
                            ]}
                          >
                            {day}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                </View>
              </View>

              <View style={styles.modalButtonContainer}>
                <Button
                  mode="outlined"
                  onPress={() => setStartDateModalVisible(false)}
                  style={styles.modalButton}
                >
                  Batal
                </Button>
                <Button
                  mode="contained"
                  onPress={saveSelectedDate}
                  style={styles.modalButton}
                >
                  Pilih
                </Button>
              </View>
            </Card.Content>
          </Card>
        </Modal>
      </Portal>

      {/* Modal untuk pemilihan tanggal - Tanggal Akhir */}
      <Portal>
        <Modal
          visible={endDateModalVisible}
          onDismiss={() => setEndDateModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Card style={styles.modalCard}>
            <Card.Title title="Pilih Tanggal Akhir" />
            <Card.Content>
              <View style={styles.dateInputRow}>
                <View style={styles.dateInputContainer}>
                  <Text style={styles.dateInputLabel}>Tahun</Text>
                  <View style={styles.pickerContainer}>
                    <ScrollView style={styles.picker}>
                      {generateYears().map((year) => (
                        <TouchableOpacity
                          key={year}
                          style={[
                            styles.pickerItem,
                            tempYear === year && styles.selectedPickerItem,
                          ]}
                          onPress={() => setTempYear(year)}
                        >
                          <Text
                            style={[
                              styles.pickerItemText,
                              tempYear === year &&
                                styles.selectedPickerItemText,
                            ]}
                          >
                            {year}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                </View>

                <View style={styles.dateInputContainer}>
                  <Text style={styles.dateInputLabel}>Bulan</Text>
                  <View style={styles.pickerContainer}>
                    <ScrollView style={styles.picker}>
                      {generateMonths().map((month) => (
                        <TouchableOpacity
                          key={month}
                          style={[
                            styles.pickerItem,
                            tempMonth === month && styles.selectedPickerItem,
                          ]}
                          onPress={() => setTempMonth(month)}
                        >
                          <Text
                            style={[
                              styles.pickerItemText,
                              tempMonth === month &&
                                styles.selectedPickerItemText,
                            ]}
                          >
                            {month}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                </View>

                <View style={styles.dateInputContainer}>
                  <Text style={styles.dateInputLabel}>Tanggal</Text>
                  <View style={styles.pickerContainer}>
                    <ScrollView style={styles.picker}>
                      {generateDays().map((day) => (
                        <TouchableOpacity
                          key={day}
                          style={[
                            styles.pickerItem,
                            tempDay === day && styles.selectedPickerItem,
                          ]}
                          onPress={() => setTempDay(day)}
                        >
                          <Text
                            style={[
                              styles.pickerItemText,
                              tempDay === day && styles.selectedPickerItemText,
                            ]}
                          >
                            {day}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                </View>
              </View>

              <View style={styles.modalButtonContainer}>
                <Button
                  mode="outlined"
                  onPress={() => setEndDateModalVisible(false)}
                  style={styles.modalButton}
                >
                  Batal
                </Button>
                <Button
                  mode="contained"
                  onPress={saveSelectedDate}
                  style={styles.modalButton}
                >
                  Pilih
                </Button>
              </View>
            </Card.Content>
          </Card>
        </Modal>
      </Portal>
    </ScrollView>
  );
};

// Helper function untuk warna status
const getStatusColor = (status: any) => {
  switch (status) {
    case "Selesai":
      return "#4CAF50";
    case "Diproses":
      return "#2196F3";
    case "Dikirim":
      return "#9C27B0";
    case "Menunggu Pembayaran":
      return "#FF9800";
    case "Dibatalkan":
      return "#F44336";
    default:
      return "#607D8B";
  }
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    marginBottom: 16,
  },
  datePickerContainer: {
    marginBottom: 16,
  },
  datePickerLabel: {
    marginBottom: 8,
    fontSize: 14,
    color: "#666",
  },
  dateButton: {
    width: "100%",
  },
  dateButtonContent: {
    justifyContent: "flex-start",
  },
  filterButton: {
    marginTop: 8,
  },
  summaryCard: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#333",
  },
  exportButton: {
    marginBottom: 16,
  },
  emptyText: {
    textAlign: "center",
    marginVertical: 16,
    color: "#666",
  },
  transactionCard: {
    marginBottom: 12,
  },
  transactionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  transactionDate: {
    color: "#666",
  },
  customerName: {
    fontWeight: "bold",
    marginBottom: 8,
  },
  transactionDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  transactionTotal: {
    fontWeight: "bold",
    color: "#FFD700",
  },
  statusContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  // Modal styles
  modalContainer: {
    padding: 20,
  },
  modalCard: {
    width: "100%",
  },
  dateInputRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dateInputContainer: {
    flex: 1,
    marginHorizontal: 4,
  },
  dateInputLabel: {
    marginBottom: 8,
    textAlign: "center",
    fontWeight: "bold",
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 4,
    height: 150,
    overflow: "hidden",
  },
  picker: {
    flex: 1,
  },
  pickerItem: {
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  selectedPickerItem: {
    backgroundColor: "#E8F5E9",
  },
  pickerItemText: {
    fontSize: 16,
  },
  selectedPickerItemText: {
    fontWeight: "bold",
    color: "#4CAF50",
  },
  modalButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 20,
  },
  modalButton: {
    width: "40%",
  },
});

export default AdminReportScreen;
