import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Dimensions } from "react-native";
import { PieChart, BarChart } from "react-native-chart-kit";
import { DUMMY_TRANSACTION } from "../../../../dummy";
import { Button, TextInput as PaperTextInput } from "react-native-paper";
import { DatePickerModal } from "react-native-paper-dates";

export const AdminDashboardScreen = () => {
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [filteredData, setFilteredData] = useState(DUMMY_TRANSACTION);

  // State for date picker visibility
  const [openStartDatePicker, setOpenStartDatePicker] = useState(false);
  const [openEndDatePicker, setOpenEndDatePicker] = useState(false);

  const filterDataByDate = () => {
    if (!startDate || !endDate) return;

    const filtered = DUMMY_TRANSACTION.filter((item) => {
      const transactionDate = new Date(item.tanggal);
      return transactionDate >= startDate && transactionDate <= endDate;
    });
    setFilteredData(filtered);
  };

  const formatDate = (date?: Date) => {
    if (!date) return "";
    return date.toISOString().split("T")[0]; // Format: YYYY-MM-DD
  };

  const calculateTotalPaymentMethod = () => {
    const paymentMethods: {
      [key in
        | "Transfer Bank"
        | "Kartu Kredit"
        | "Tunai"
        | "Kartu Debit"]: number;
    } = {
      "Transfer Bank": 0,
      "Kartu Kredit": 0,
      Tunai: 0,
      "Kartu Debit": 0,
    };

    filteredData.forEach((transaction) => {
      const method =
        transaction.metodePembayaran as keyof typeof paymentMethods;
      paymentMethods[method] += transaction.total;
    });

    return paymentMethods;
  };

  const calculateTotalSales = () => {
    return filteredData.reduce(
      (total, transaction) => total + transaction.total,
      0
    );
  };

  const pieChartData = () => {
    const paymentMethods = calculateTotalPaymentMethod();
    return [
      {
        name: "Transfer Bank",
        population: paymentMethods["Transfer Bank"],
        color: "blue",
        legendFontColor: "black",
        legendFontSize: 15,
      },
      {
        name: "Tunai",
        population: paymentMethods["Tunai"],
        color: "red",
        legendFontColor: "black",
        legendFontSize: 15,
      },
      {
        name: "Debit",
        population: paymentMethods["Kartu Debit"],
        color: "orange",
        legendFontColor: "black",
        legendFontSize: 15,
      },
    ];
  };

  const barChartData = () => {
    return {
      labels: ["Transaksi"],
      datasets: [
        {
          data: [calculateTotalSales()],
        },
      ],
    };
  };

  return (
    <View style={styles.mainContainer}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={true}
      >
        <View style={styles.dateInputContainer}>
          <PaperTextInput
            style={styles.input}
            label="Tanggal Awal"
            mode="outlined"
            value={formatDate(startDate)}
            onFocus={() => setOpenStartDatePicker(true)}
            showSoftInputOnFocus={false}
            right={
              <PaperTextInput.Icon
                icon="calendar"
                onPress={() => setOpenStartDatePicker(true)}
              />
            }
          />

          <DatePickerModal
            locale="id"
            mode="single"
            visible={openStartDatePicker}
            onDismiss={() => setOpenStartDatePicker(false)}
            date={startDate}
            onConfirm={(params: any) => {
              setOpenStartDatePicker(false);
              setStartDate(params.date);
            }}
            label="Pilih Tanggal Awal"
            saveLabel="Pilih"
          />

          <PaperTextInput
            style={styles.input}
            label="Tanggal Akhir"
            mode="outlined"
            value={formatDate(endDate)}
            onFocus={() => setOpenEndDatePicker(true)}
            showSoftInputOnFocus={false}
            right={
              <PaperTextInput.Icon
                icon="calendar"
                onPress={() => setOpenEndDatePicker(true)}
              />
            }
          />

          <DatePickerModal
            locale="id"
            mode="single"
            visible={openEndDatePicker}
            onDismiss={() => setOpenEndDatePicker(false)}
            date={endDate}
            onConfirm={(params: any) => {
              setOpenEndDatePicker(false);
              setEndDate(params.date);
            }}
            label="Pilih Tanggal Akhir"
            saveLabel="Pilih"
          />

          <Button
            mode="contained"
            onPress={filterDataByDate}
            disabled={!startDate || !endDate}
            style={styles.filterButton}
          >
            Filter
          </Button>
        </View>

        <Text style={styles.chartTitle}>Chart Pembayaran</Text>
        <PieChart
          data={pieChartData()}
          width={300}
          height={200}
          chartConfig={{
            backgroundColor: "#e26a00",
            backgroundGradientFrom: "#fb8c00",
            backgroundGradientTo: "#ffa726",
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            style: {
              borderRadius: 16,
            },
          }}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="15"
        />

        <Text style={styles.chartTitle}>Total Penjualan</Text>
        <BarChart
          data={barChartData()}
          width={Dimensions.get("window").width - 40} // Lebih responsive
          height={220}
          chartConfig={{
            backgroundColor: "#1cc910",
            backgroundGradientFrom: "#1cc910",
            backgroundGradientTo: "#1cc910",
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            style: {
              borderRadius: 16,
            },
            propsForLabels: {
              dx: 10, // Menambah padding kiri untuk label
            },
          }}
          fromZero={true}
          yAxisLabel="Rp"
          yAxisSuffix=" IDR"
          withCustomBarColorFromData={true}
          flatColor={true}
          showBarTops={false}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#f5f5f5", // optional
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 32, // Memberi ruang di bagian bawah
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  dateInputContainer: {
    marginBottom: 20,
  },
  input: {
    marginBottom: 10,
    backgroundColor: "white",
  },
  chartContainer: {
    marginBottom: 30, // Jarak antar chart
    backgroundColor: "white",
    borderRadius: 10,
    padding: 15,
    elevation: 3, // Shadow untuk Android
    shadowColor: "#000", // Shadow untuk iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  filterButton: {
    marginTop: 10,
  },
});
