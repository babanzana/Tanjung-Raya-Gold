import React, { useState } from "react";
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
} from "react-native-paper";
// import DateTimePicker from 'expo-date-picker';
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";
import XLSX from "xlsx";
import { DUMMY_TRANSACTION } from "../../../../dummy";

export const AdminReportScreen = () => {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);

  // Format tanggal untuk tampilan
  const formatDateDisplay = (date: Date | null) => {
    if (!date) return "Pilih Tanggal";
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Handler untuk date picker
  const handleStartDateChange = (date: Date) => {
    setStartDate(date);
    setShowStartDatePicker(false);
  };

  const handleEndDateChange = (date: Date) => {
    setEndDate(date);
    setShowEndDatePicker(false);
  };

  // Filter transaksi berdasarkan rentang tanggal
  const filteredTransactions = DUMMY_TRANSACTION.filter((transaction) => {
    const transactionDate = new Date(transaction.tanggal);
    if (startDate && transactionDate < startDate) return false;
    if (endDate && transactionDate > endDate) return false;
    return true;
  });

  // Hitung statistik
  const totalTransactions = filteredTransactions.length;
  const totalRevenue = filteredTransactions.reduce(
    (sum, transaction) => sum + transaction.total,
    0
  );
  const avgTransaction =
    totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

  // Format mata uang
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Export ke PDF
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
                ${filteredTransactions
                  .map(
                    (transaction) => `
                  <tr>
                    <td>${transaction.id}</td>
                    <td>${new Date(transaction.tanggal).toLocaleDateString(
                      "id-ID"
                    )}</td>
                    <td>${transaction.nama}</td>
                    <td>${transaction.items
                      .map((item) => item.nama)
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

  // Export ke Excel
  const exportToExcel = async () => {
    try {
      // Prepare data
      const worksheetData = [
        ["ID", "Tanggal", "Nama", "Items", "Total", "Status"],
        ...filteredTransactions.map((transaction) => [
          transaction.id,
          new Date(transaction.tanggal).toLocaleDateString("id-ID"),
          transaction.nama,
          transaction.items.map((item) => item.nama).join(", "),
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
      <Text variant="titleLarge" style={styles.title}>
        Laporan Transaksi
      </Text>

      {/* Filter Section */}
      <Card style={styles.filterCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Filter Tanggal</Text>
          <View style={styles.dateFilterContainer}>
            <View style={styles.dateInputContainer}>
              <Text style={styles.dateLabel}>Dari:</Text>
              <Button
                mode="outlined"
                onPress={() => setShowStartDatePicker(true)}
                icon="calendar"
              >
                {formatDateDisplay(startDate)}
              </Button>
              {/* {showStartDatePicker && (
                <DateTimePicker
                  value={startDate || new Date()}
                  onChange={handleStartDateChange}
                  onCancel={() => setShowStartDatePicker(false)}
                />
              )} */}
            </View>

            <View style={styles.dateInputContainer}>
              <Text style={styles.dateLabel}>Sampai:</Text>
              <Button
                mode="outlined"
                onPress={() => setShowEndDatePicker(true)}
                icon="calendar"
              >
                {formatDateDisplay(endDate)}
              </Button>
              {/* {showEndDatePicker && (
                <DateTimePicker
                  value={endDate || new Date()}
                  onChange={handleEndDateChange}
                  onCancel={() => setShowEndDatePicker(false)}
                  minimumDate={startDate || undefined}
                />
              )} */}
            </View>
          </View>
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
        Daftar Transaksi ({filteredTransactions.length})
      </Text>

      {filteredTransactions.length === 0 ? (
        <Text style={styles.emptyText}>
          Tidak ada transaksi pada periode ini
        </Text>
      ) : (
        filteredTransactions.map((transaction) => (
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
    </ScrollView>
  );
};

// Helper function untuk warna status
const getStatusColor = (status: string) => {
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
  title: {
    marginBottom: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  filterCard: {
    marginBottom: 16,
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
  dateFilterContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  dateInputContainer: {
    flex: 1,
    marginRight: 8,
  },
  dateLabel: {
    marginBottom: 4,
    fontSize: 14,
    color: "#666",
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
});

export default AdminReportScreen;