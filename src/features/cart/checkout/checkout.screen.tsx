import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { MaterialIcons } from "@expo/vector-icons";

const CheckoutScreen = ({ route, navigation }: any) => {
  const { total } = route.params;
  const [paymentMethod, setPaymentMethod] = useState("transfer");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentProof, setPaymentProof] = useState<{ uri: string } | null>(null);
  const [uploading, setUploading] = useState(false);

  const paymentMethods = [
    {
      id: "transfer",
      name: "Transfer Bank",
      details: {
        banks: [
          {
            name: "BCA",
            logo: require("./../../../../assets/logo-bca.png"), // Ganti dengan path logo BCA
            accountNumber: "1234567890",
            accountName: "TANJUNG RAYA GOLD",
          },
          {
            name: "Mandiri",
            logo: require("./../../../../assets/logo-mandiri.png"), // Ganti dengan path logo Mandiri
            accountNumber: "0987654321",
            accountName: "TANJUNG RAYA GOLD",
          },
        ],
      },
    },
    {
      id: "cod",
      name: "Bayar di Tempat (COD)",
      details: {
        description: "Bayar ketika barang sudah diterima",
      },
    },
  ];

  const pickImage = async () => {
    // Request permission
    if (Platform.OS !== "web") {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Izin diperlukan",
          "Kami membutuhkan izin untuk mengakses galeri Anda"
        );
        return;
      }
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled) {
      setPaymentProof(result.assets[0]);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Izin diperlukan",
        "Kami membutuhkan izin untuk mengakses kamera Anda"
      );
      return;
    }

    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled) {
      setPaymentProof(result.assets[0]);
    }
  };

  const handleCheckout = () => {
    if (paymentMethod === "transfer" && !paymentProof) {
      Alert.alert(
        "Bukti Transfer Diperlukan",
        "Silakan upload bukti transfer terlebih dahulu",
        [{ text: "OK" }]
      );
      return;
    }

    navigation.navigate("OrderConfirmation", {
      orderDetails: {
        total,
        paymentMethod:
          paymentMethods.find((m) => m.id === paymentMethod)?.name || "Unknown",
        address,
        notes,
        paymentProof: paymentMethod === "transfer" ? paymentProof : null,
      },
    });
  };

  const renderPaymentDetails = () => {
    const method = paymentMethods.find((m) => m.id === paymentMethod);

    if (!method) return null;

    switch (method.id) {
      case "transfer":
        return (
          <View style={styles.paymentDetails}>
            <Text style={styles.detailsTitle}>Transfer ke Rekening:</Text>
            {method?.details?.banks?.map((bank, index) => (
              <View key={index} style={styles.bankContainer}>
                <Image source={bank.logo} style={styles.bankLogo} />
                <View style={styles.bankDetails}>
                  <Text style={styles.bankName}>{bank.name}</Text>
                  <Text style={styles.accountNumber}>{bank.accountNumber}</Text>
                  <Text style={styles.accountName}>a.n {bank.accountName}</Text>
                </View>
              </View>
            ))}

            {/* Bagian Upload Bukti Transfer */}
            <Text style={[styles.detailsTitle, { marginTop: 20 }]}>
              Upload Bukti Transfer
            </Text>
            <Text style={styles.uploadHint}>
              Pastikan bukti transfer jelas terlihat nominal, nomor rekening,
              dan nama pengirim
            </Text>

            {paymentProof ? (
              <View style={styles.proofContainer}>
                <Image
                  source={{ uri: paymentProof.uri }}
                  style={styles.proofImage}
                />
                <TouchableOpacity
                  style={styles.changeProofButton}
                  onPress={pickImage}
                >
                  <Text style={styles.changeProofText}>Ganti Foto</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.uploadOptions}>
                <TouchableOpacity
                  style={styles.uploadButton}
                  onPress={pickImage}
                >
                  <MaterialIcons
                    name="photo-library"
                    size={24}
                    color="#FFD700"
                  />
                  <Text style={styles.uploadButtonText}>Pilih dari Galeri</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.uploadButton}
                  onPress={takePhoto}
                >
                  <MaterialIcons
                    name="photo-camera"
                    size={24}
                    color="#FFD700"
                  />
                  <Text style={styles.uploadButtonText}>Ambil Foto</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        );
      case "cod":
        return (
          <View style={styles.paymentDetails}>
            <Text style={styles.detailsDescription}>
              {method.details.description}
            </Text>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Metode Pembayaran</Text>
        {paymentMethods.map((method) => (
          <React.Fragment key={method.id}>
            <TouchableOpacity
              style={[
                styles.option,
                paymentMethod === method.id && styles.selectedOption,
              ]}
              onPress={() => setPaymentMethod(method.id)}
            >
              <Text
                style={
                  paymentMethod === method.id
                    ? styles.selectedOptionText
                    : styles.optionText
                }
              >
                {method.name}
              </Text>
            </TouchableOpacity>
            {paymentMethod === method.id && renderPaymentDetails()}
          </React.Fragment>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Alamat Pengiriman</Text>
        <TextInput
          style={styles.input}
          placeholder="Masukkan alamat lengkap"
          multiline
          numberOfLines={4}
          value={address}
          onChangeText={setAddress}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Catatan (Opsional)</Text>
        <TextInput
          style={styles.input}
          placeholder="Contoh: Packing rapat"
          value={notes}
          onChangeText={setNotes}
        />
      </View>

      <View style={styles.summary}>
        <Text style={styles.summaryText}>Total Pembayaran:</Text>
        <Text style={styles.totalAmount}>
          Rp {total.toLocaleString("id-ID")}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.checkoutButton}
        onPress={handleCheckout}
        disabled={!address && paymentMethod !== "cod"}
      >
        <Text style={styles.checkoutButtonText}>Konfirmasi Pesanan</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
    padding: 16,
  },
  section: {
    marginBottom: 24,
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#333",
  },
  option: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  selectedOption: {
    backgroundColor: "#fff8e1",
  },
  optionText: {
    fontSize: 15,
    color: "#555",
  },
  selectedOptionText: {
    fontSize: 15,
    color: "#FFD700",
    fontWeight: "bold",
  },
  paymentDetails: {
    padding: 12,
    backgroundColor: "#fafafa",
    borderRadius: 8,
    marginTop: 8,
  },
  detailsTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 10,
    color: "#555",
  },
  detailsDescription: {
    fontSize: 14,
    color: "#666",
    fontStyle: "italic",
  },
  bankContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#eee",
  },
  bankLogo: {
    width: 50,
    height: 30,
    resizeMode: "contain",
    marginRight: 15,
  },
  bankDetails: {
    flex: 1,
  },
  bankName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  accountNumber: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#007bff",
    marginVertical: 3,
  },
  accountName: {
    fontSize: 13,
    color: "#666",
  },
  walletContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#eee",
  },
  walletLogo: {
    width: 50,
    height: 50,
    resizeMode: "contain",
    marginRight: 15,
  },
  walletDetails: {
    flex: 1,
  },
  walletName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  walletNumber: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#007bff",
    marginTop: 3,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 4,
    padding: 12,
    fontSize: 15,
    minHeight: 100,
    textAlignVertical: "top",
  },
  summary: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    alignItems: "center",
  },
  summaryText: {
    fontSize: 16,
    color: "#666",
  },
  totalAmount: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginTop: 8,
  },
  checkoutButton: {
    backgroundColor: "#FFD700",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginBottom: 32,
  },
  checkoutButtonText: {
    color: "#333",
    fontSize: 16,
    fontWeight: "bold",
  },
  uploadHint: {
    fontSize: 13,
    color: "#666",
    marginBottom: 15,
    lineHeight: 18,
  },
  uploadOptions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  uploadButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FFD700",
    marginHorizontal: 5,
  },
  uploadButtonText: {
    marginTop: 8,
    color: "#333",
    fontSize: 14,
    fontWeight: "500",
  },
  proofContainer: {
    alignItems: "center",
    marginTop: 10,
  },
  proofImage: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    marginBottom: 10,
    resizeMode: "contain",
    backgroundColor: "#f0f0f0",
  },
  changeProofButton: {
    padding: 10,
  },
  changeProofText: {
    color: "#FFD700",
    fontWeight: "bold",
  },
});

export default CheckoutScreen;
