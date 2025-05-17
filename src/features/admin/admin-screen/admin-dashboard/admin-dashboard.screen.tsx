import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { PieChart, BarChart, LineChart } from "react-native-chart-kit";
import { Button, Card, useTheme, Modal, Portal } from "react-native-paper";
import { format, subDays } from "date-fns";
import { id } from "date-fns/locale";
import { db } from "../../../../../firebase";
import { ref, get } from "@firebase/database";

// Impor fungsi dashboard yang ditingkatkan
const formatCurrency = (amount: any) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

// Fungsi untuk menghitung statistik dashboard
const calculateDashboardStats = (transactions: any) => {
  // Total penjualan
  const totalSales = transactions.reduce(
    (sum: any, transaction: any) => sum + (transaction.total || 0),
    0
  );

  // Total transaksi
  const totalTransactions = transactions.length;

  // Statistik metode pembayaran
  const paymentMethodStats = {
    "Transfer Bank": 0,
    "Kartu Kredit": 0,
    Tunai: 0,
    "Kartu Debit": 0,
    Other: 0, // Penampung untuk metode yang tidak dikenal
  };

  transactions.forEach((transaction: any) => {
    // Menangani perbedaan nama properti
    const method =
      transaction.metodePembayaran || transaction.paymentMethod || "Other";

    if (paymentMethodStats.hasOwnProperty(method)) {
      paymentMethodStats[method as keyof typeof paymentMethodStats] +=
        transaction.total || 0;
    } else {
      paymentMethodStats["Other"] += transaction.total || 0;
    }
  });

  // Menghitung nilai rata-rata transaksi
  const averageTransactionValue =
    totalTransactions > 0 ? totalSales / totalTransactions : 0;

  // Transaksi berdasarkan tanggal
  const transactionsByDate: {
    [date: string]: { count: number; total: number };
  } = {};
  transactions.forEach((transaction: any) => {
    // Ekstrak tanggal dari berbagai bidang
    let dateStr;
    if (transaction.tanggal) {
      dateStr = new Date(
        typeof transaction.tanggal === "string"
          ? transaction.tanggal
          : transaction.tanggal
      )
        .toISOString()
        .split("T")[0];
    } else if (transaction.createdAt) {
      dateStr = new Date(transaction.createdAt).toISOString().split("T")[0];
    } else {
      // Gunakan tanggal saat ini sebagai fallback untuk integritas data
      dateStr = new Date().toISOString().split("T")[0];
    }

    if (!transactionsByDate[dateStr]) {
      transactionsByDate[dateStr] = {
        count: 0,
        total: 0,
      };
    }
    transactionsByDate[dateStr].count += 1;
    transactionsByDate[dateStr].total += transaction.total || 0;
  });

  // Distribusi kategori produk
  const categoryStats: {
    [category: string]: {
      totalSold: number;
      totalRevenue: number;
    };
  } = {};
  transactions.forEach((transaction: any) => {
    const items = transaction.items || transaction.products || [];
    if (Array.isArray(items)) {
      items.forEach((item) => {
        const category = item.category || item.kategori || "Tidak Terkategori";
        if (!categoryStats[category]) {
          categoryStats[category] = {
            totalSold: 0,
            totalRevenue: 0,
          };
        }
        categoryStats[category].totalSold += item.qty || item.quantity || 1;
        categoryStats[category].totalRevenue +=
          item.totalHarga ||
          item.price * (item.qty || item.quantity || 1) ||
          item.harga * (item.qty || item.quantity || 1) ||
          0;
      });
    }
  });

  // Konversi objek tanggal ke array untuk pembuatan grafik yang lebih mudah
  const salesByDateArray = Object.keys(transactionsByDate)
    .map((date) => ({
      date,
      count: transactionsByDate[date].count,
      total: transactionsByDate[date].total,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return {
    totalSales,
    totalTransactions,
    averageTransactionValue,
    paymentMethodStats,
    transactionsByDate,
    salesByDateArray,
    categoryStats,
  };
};

// Fungsi untuk mendapatkan data dashboard
const getDashboardData = async (startDate: any, endDate: any) => {
  try {
    // Konversi tanggal ke timestamp untuk perbandingan
    const startTimestamp = new Date(startDate).setHours(0, 0, 0, 0);
    const endTimestamp = new Date(endDate).setHours(23, 59, 59, 999);

    // Dapatkan semua transaksi dari semua pengguna (karena transaksi disimpan per pengguna)
    const usersRef = ref(db, "users");
    const usersSnapshot = await get(usersRef);

    // Juga coba dari lokasi alternatif dalam database
    const transactionsRef = ref(db, "transactions");
    const transactionsSnapshot = await get(transactionsRef);

    const allTransactions = [];

    // Proses data dari struktur users (jika ada)
    if (usersSnapshot.exists()) {
      const users = usersSnapshot.val();

      for (const userId in users) {
        if (users[userId].transactions) {
          const userTransactions = users[userId].transactions;
          for (const transactionId in userTransactions) {
            const transaction = userTransactions[transactionId];

            // Hanya sertakan transaksi dalam rentang tanggal
            // Tangani format tanggal yang berbeda (string ISO atau timestamp)
            let transactionTimestamp;
            if (transaction.createdAt) {
              // Jika createdAt ada, gunakan langsung (sudah berupa timestamp)
              transactionTimestamp = transaction.createdAt;
            } else {
              // Jika tidak, gunakan tanggal dan konversi jika itu string ISO
              transactionTimestamp =
                typeof transaction.tanggal === "string"
                  ? new Date(transaction.tanggal).getTime()
                  : transaction.tanggal;
            }

            if (
              transactionTimestamp >= startTimestamp &&
              transactionTimestamp <= endTimestamp
            ) {
              allTransactions.push({
                id: transactionId,
                userId: userId,
                ...transaction,
              });
            }
          }
        }
      }
    }

    // Proses data dari struktur transactions langsung (jika ada)
    if (transactionsSnapshot.exists()) {
      const transactions = transactionsSnapshot.val();

      for (const transactionId in transactions) {
        const transaction = transactions[transactionId];

        // Hanya sertakan transaksi dalam rentang tanggal
        let transactionTimestamp;
        if (transaction.createdAt) {
          transactionTimestamp = transaction.createdAt;
        } else {
          transactionTimestamp =
            typeof transaction.tanggal === "string"
              ? new Date(transaction.tanggal).getTime()
              : transaction.tanggal;
        }

        if (
          transactionTimestamp >= startTimestamp &&
          transactionTimestamp <= endTimestamp
        ) {
          allTransactions.push({
            id: transactionId,
            ...transaction,
          });
        }
      }
    }

    // Urutkan transaksi berdasarkan tanggal (terbaru lebih dulu)
    const sortedTransactions = allTransactions.sort((a, b) => {
      const aTime =
        a.createdAt ||
        (typeof a.tanggal === "string"
          ? new Date(a.tanggal).getTime()
          : a.tanggal);
      const bTime =
        b.createdAt ||
        (typeof b.tanggal === "string"
          ? new Date(b.tanggal).getTime()
          : b.tanggal);
      return bTime - aTime;
    });

    return {
      success: true,
      data: sortedTransactions,
      stats: calculateDashboardStats(sortedTransactions),
      count: sortedTransactions.length,
      dateRange: {
        start: new Date(startDate).toISOString(),
        end: new Date(endDate).toISOString(),
      },
    };
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return {
      success: false,
      error:
        typeof error === "object" && error !== null && "message" in error
          ? (error as { message: string }).message
          : "Terjadi kesalahan saat mengambil data",
      data: [],
      stats: {
        totalSales: 0,
        totalTransactions: 0,
        averageTransactionValue: 0,
        paymentMethodStats: {
          "Transfer Bank": 0,
          "Kartu Kredit": 0,
          Tunai: 0,
          "Kartu Debit": 0,
          Other: 0,
        },
        transactionsByDate: {},
        salesByDateArray: [],
        categoryStats: {},
      },
    };
  }
};

type PaymentMethodStats = {
  "Transfer Bank": number;
  "Kartu Kredit": number;
  Tunai: number;
  "Kartu Debit": number;
  Other: number;
};

type SalesByDate = {
  date: string;
  count: number;
  total: number;
};

type CategoryStats = {
  [category: string]: {
    totalSold: number;
    totalRevenue: number;
  };
};

type DashboardStats = {
  totalSales: number;
  totalTransactions: number;
  averageTransactionValue: number;
  paymentMethodStats: PaymentMethodStats;
  salesByDateArray: SalesByDate[];
  categoryStats: CategoryStats;
};

export const AdminDashboardScreen = () => {
  const theme = useTheme();

  // State untuk tanggal
  const [startDate, setStartDate] = useState(subDays(new Date(), 30)); // Default: 30 hari terakhir
  const [endDate, setEndDate] = useState(new Date());

  // State untuk modal tanggal
  const [startDateModalVisible, setStartDateModalVisible] = useState(false);
  const [endDateModalVisible, setEndDateModalVisible] = useState(false);

  // State untuk pilihan tanggal di modal
  const [tempYear, setTempYear] = useState(new Date().getFullYear());
  const [tempMonth, setTempMonth] = useState(new Date().getMonth() + 1);
  const [tempDay, setTempDay] = useState(new Date().getDate());
  const [activeDateType, setActiveDateType] = useState("start");

  // State untuk data dan loading
  const [transactions, setTransactions] = useState<any[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalSales: 0,
    totalTransactions: 0,
    averageTransactionValue: 0,
    paymentMethodStats: {
      "Transfer Bank": 0,
      "Kartu Kredit": 0,
      Tunai: 0,
      "Kartu Debit": 0,
      Other: 0,
    },
    salesByDateArray: [],
    categoryStats: {},
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Memuat data awal
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Fungsi untuk mengambil data dashboard
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Gunakan fungsi getDashboardData yang telah ditingkatkan
      const result = await getDashboardData(startDate, endDate);

      if (result.success) {
        setTransactions(result.data);
        setDashboardStats(result.stats);
      } else {
        setError(result.error || "Gagal mengambil data");
        setTransactions([]);
      }
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError("Error mengambil data. Silakan coba lagi.");
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  // Fungsi untuk membuka modal tanggal dengan nilai yang benar
  const openDateModal = (dateType: any) => {
    const date = dateType === "start" ? startDate : endDate;
    setTempYear(date.getFullYear());
    setTempMonth(date.getMonth() + 1); // Bulan JavaScript dimulai dari 0
    setTempDay(date.getDate());
    setActiveDateType(dateType);

    if (dateType === "start") {
      setStartDateModalVisible(true);
    } else {
      setEndDateModalVisible(true);
    }
  };

  // Fungsi untuk menyimpan tanggal yang dipilih
  const saveSelectedDate = () => {
    try {
      const newDate = new Date(tempYear, tempMonth - 1, tempDay);

      // Validasi
      if (activeDateType === "start" && newDate > endDate) {
        alert("Tanggal mulai tidak boleh lebih dari tanggal akhir");
        return;
      }

      if (activeDateType === "end" && newDate < startDate) {
        alert("Tanggal akhir tidak boleh kurang dari tanggal mulai");
        return;
      }

      if (activeDateType === "start") {
        setStartDate(newDate);
        setStartDateModalVisible(false);
      } else {
        setEndDate(newDate);
        setEndDateModalVisible(false);
      }
    } catch (e) {
      alert("Format tanggal tidak valid");
    }
  };

  // Menghasilkan array untuk dropdown tahun, bulan, hari
  const generateYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear - 5; i <= currentYear; i++) {
      years.push(i);
    }
    return years;
  };

  const generateMonths = () => {
    return Array.from({ length: 12 }, (_, i) => i + 1);
  };

  const generateDays = () => {
    // Mendapatkan jumlah hari dalam bulan yang dipilih
    const daysInMonth = new Date(tempYear, tempMonth, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) => i + 1);
  };

  // Menyiapkan data untuk grafik pie
  const pieChartData = () => {
    const colors = [
      theme.colors.primary,
      theme.colors.error,
      theme.colors.secondary,
      theme.colors.tertiary,
      "#7986CB",
    ];

    // Filter nilai nol
    const filteredData = Object.entries(dashboardStats.paymentMethodStats)
      .filter(([_, value]) => value > 0)
      .map(([name, value], index) => ({
        name,
        population: value,
        color: colors[index % colors.length],
        legendFontColor: theme.colors.onSurface,
        legendFontSize: 12,
      }));

    return filteredData.length > 0
      ? filteredData
      : [
          {
            name: "Tidak ada data",
            population: 1,
            color: "#CCCCCC",
            legendFontColor: theme.colors.onSurface,
            legendFontSize: 12,
          },
        ];
  };

  // Menyiapkan data untuk grafik batang
  const barChartData = () => {
    return {
      labels: ["Total Penjualan"],
      datasets: [
        {
          data: [dashboardStats.totalSales > 0 ? dashboardStats.totalSales : 0],
        },
      ],
    };
  };

  // Menyiapkan data untuk grafik garis (penjualan per tanggal)
  const lineChartData = () => {
    // Ambil maksimal 7 titik data terbaru untuk grafik yang lebih jelas
    const recentSalesData = [...dashboardStats.salesByDateArray].slice(-7);

    return {
      labels: recentSalesData.map((item) => {
        // Format tanggal untuk tampilan lebih pendek (mm/dd)
        const date = new Date(item.date);
        return `${date.getDate()}/${date.getMonth() + 1}`;
      }),
      datasets: [
        {
          data: recentSalesData.map((item) => item.total),
          color: (opacity = 1) => `rgba(71, 136, 255, ${opacity})`,
          strokeWidth: 2,
        },
      ],
      legend: ["Penjualan Harian"],
    };
  };

  // Format tanggal untuk tampilan
  const formatDateDisplay = (date: any) => {
    return format(date, "dd MMMM yyyy", { locale: id });
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
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
              onPress={fetchDashboardData}
              style={styles.filterButton}
              disabled={loading}
            >
              {loading ? "Memuat..." : "Tampilkan Laporan"}
            </Button>
          </Card.Content>
        </Card>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loadingText}>Memuat data...</Text>
          </View>
        ) : error ? (
          <Card style={[styles.card, styles.errorCard]}>
            <Card.Content>
              <Text style={styles.errorText}>{error}</Text>
              <Button
                mode="contained"
                onPress={fetchDashboardData}
                style={styles.retryButton}
              >
                Coba Lagi
              </Button>
            </Card.Content>
          </Card>
        ) : (
          <>
            <Card style={styles.card}>
              <Card.Title title="Ringkasan" />
              <Card.Content>
                <View style={styles.summaryContainer}>
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryLabel}>Total Penjualan</Text>
                    <Text style={styles.summaryValue}>
                      {formatCurrency(dashboardStats.totalSales)}
                    </Text>
                  </View>
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryLabel}>Jumlah Transaksi</Text>
                    <Text style={styles.summaryValue}>
                      {dashboardStats.totalTransactions}
                    </Text>
                  </View>
                </View>
                <View style={[styles.summaryContainer, { marginTop: 8 }]}>
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryLabel}>Rata-rata Transaksi</Text>
                    <Text style={styles.summaryValue}>
                      {formatCurrency(dashboardStats.averageTransactionValue)}
                    </Text>
                  </View>
                </View>
              </Card.Content>
            </Card>

            {dashboardStats.salesByDateArray.length > 1 && (
              <Card style={styles.card}>
                <Card.Title title="Penjualan Harian" />
                <Card.Content style={styles.chartContainer}>
                  <LineChart
                    data={lineChartData()}
                    width={Dimensions.get("window").width - 60}
                    height={220}
                    chartConfig={{
                      backgroundColor: theme.colors.primary,
                      backgroundGradientFrom: theme.colors.primary,
                      backgroundGradientTo: theme.colors.secondary,
                      decimalPlaces: 0,
                      color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                      labelColor: (opacity = 1) =>
                        `rgba(255, 255, 255, ${opacity})`,
                      style: {
                        borderRadius: 16,
                      },
                      propsForDots: {
                        r: "6",
                        strokeWidth: "2",
                        stroke: "#FFFFFF",
                      },
                    }}
                    bezier
                    style={{
                      marginVertical: 8,
                      borderRadius: 16,
                    }}
                  />
                </Card.Content>
              </Card>
            )}

            <Card style={styles.card}>
              <Card.Title title="Metode Pembayaran" />
              <Card.Content style={styles.chartContainer}>
                <PieChart
                  data={pieChartData()}
                  width={Dimensions.get("window").width - 60}
                  height={220}
                  chartConfig={{
                    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  }}
                  accessor="population"
                  backgroundColor="transparent"
                  paddingLeft="15"
                  absolute={false}
                />
              </Card.Content>
            </Card>

            <Card style={styles.card}>
              <Card.Title title="Total Penjualan" />
              <Card.Content style={styles.chartContainer}>
                <BarChart
                  data={barChartData()}
                  width={Dimensions.get("window").width - 60}
                  height={220}
                  chartConfig={{
                    backgroundColor: theme.colors.primary,
                    backgroundGradientFrom: theme.colors.primary,
                    backgroundGradientTo: theme.colors.secondary,
                    decimalPlaces: 0,
                    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                    labelColor: (opacity = 1) =>
                      `rgba(255, 255, 255, ${opacity})`,
                    style: {
                      borderRadius: 16,
                    },
                  }}
                  fromZero
                  yAxisLabel="Rp"
                  yAxisSuffix=""
                  verticalLabelRotation={30}
                />
              </Card.Content>
            </Card>

            <Card style={styles.card}>
              <Card.Title title="Detail Metode Pembayaran" />
              <Card.Content>
                {Object.entries(dashboardStats.paymentMethodStats)
                  .filter(([_, total]) => total > 0)
                  .map(([method, total]) => (
                    <View key={method} style={styles.detailItem}>
                      <Text style={styles.detailLabel}>{method}</Text>
                      <Text style={styles.detailValue}>
                        {formatCurrency(total)}
                      </Text>
                    </View>
                  ))}
              </Card.Content>
            </Card>

            {Object.keys(dashboardStats.categoryStats).length > 0 && (
              <Card style={styles.card}>
                <Card.Title title="Kategori Produk" />
                <Card.Content>
                  {Object.entries(dashboardStats.categoryStats).map(
                    ([category, stats]) => (
                      <View key={category} style={styles.detailItem}>
                        <Text style={styles.detailLabel}>{category}</Text>
                        <View style={styles.categoryDetails}>
                          <Text style={styles.categoryText}>
                            {stats.totalSold} unit
                          </Text>
                          <Text style={styles.detailValue}>
                            {formatCurrency(stats.totalRevenue)}
                          </Text>
                        </View>
                      </View>
                    )
                  )}
                </Card.Content>
              </Card>
            )}
          </>
        )}
      </ScrollView>

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

      {/* Modal for date selection - End Date */}
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f7",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 4,
  },
  datePickerContainer: {
    marginBottom: 16,
  },
  datePickerLabel: {
    fontSize: 14,
    marginBottom: 4,
    fontWeight: "500",
  },
  dateButton: {
    width: "100%",
    borderRadius: 8,
  },
  dateButtonContent: {
    height: 50,
    justifyContent: "flex-start",
  },
  filterButton: {
    borderRadius: 8,
    height: 50,
    justifyContent: "center",
    marginTop: 8,
  },
  loadingContainer: {
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 8,
    fontSize: 16,
  },
  errorCard: {
    backgroundColor: "#FEECEC",
  },
  errorText: {
    color: "#D32F2F",
    marginBottom: 16,
    textAlign: "center",
  },
  retryButton: {
    borderRadius: 8,
  },
  summaryContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  summaryItem: {
    flex: 1,
    backgroundColor: "#F9F9F9",
    borderRadius: 8,
    padding: 16,
    marginHorizontal: 4,
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: "bold",
  },
  chartContainer: {
    alignItems: "center",
    marginVertical: 8,
  },
  detailItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  detailLabel: {
    fontSize: 16,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: "bold",
  },
  categoryDetails: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flex: 1,
  },
  modalContainer: {
    padding: 16,
  },
  modalCard: {
    borderRadius: 12,
  },
  dateInputRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  dateInputContainer: {
    flex: 1,
    marginHorizontal: 4,
  },
  dateInputLabel: {
    fontSize: 14,
    marginBottom: 4,
    textAlign: "center",
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#DDDDDD",
    borderRadius: 8,
    height: 120,
    overflow: "hidden",
  },
  picker: {
    flex: 1,
  },
  pickerItem: {
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  selectedPickerItem: {
    backgroundColor: "#E3F2FD",
  },
  pickerItemText: {
    fontSize: 16,
  },
  selectedPickerItemText: {
    fontWeight: "bold",
    color: "#2196F3",
  },
  categoryText: {
    fontSize: 16,
    marginRight: 8,
    color: "#333",
  },
  modalButtonContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 16,
  },
  modalButton: {
    marginLeft: 8,
  },
});
