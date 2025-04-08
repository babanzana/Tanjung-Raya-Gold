import React from "react";
import { View, ScrollView, StyleSheet, Image, Text } from "react-native";
import {
  Collapse,
  CollapseHeader,
  CollapseBody,
} from "accordion-collapse-react-native";

export const FAQScreen = ({ route, navigation }: any) => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>FAQ Toko Emas</Text>

        <Collapse>
          <CollapseHeader>
            <View style={styles.faqHeader}>
              <Text style={styles.faqQuestion}>
                1. Bagaimana cara membeli emas di aplikasi ini?
              </Text>
            </View>
          </CollapseHeader>
          <CollapseBody>
            <Text style={styles.faqAnswer}>
              Anda dapat membeli emas dengan cara memilih produk emas yang
              diinginkan, lalu klik tombol "Beli". Setelah itu, ikuti proses
              checkout hingga pembayaran selesai.
            </Text>
          </CollapseBody>
        </Collapse>

        <Collapse>
          <CollapseHeader>
            <View style={styles.faqHeader}>
              <Text style={styles.faqQuestion}>
                2. Apa saja metode pembayaran yang tersedia?
              </Text>
            </View>
          </CollapseHeader>
          <CollapseBody>
            <Text style={styles.faqAnswer}>
              Kami menerima berbagai metode pembayaran termasuk transfer bank,
              e-wallet (OVO, GoPay, Dana), dan pembayaran via tunai.
            </Text>
          </CollapseBody>
        </Collapse>

        <Collapse>
          <CollapseHeader>
            <View style={styles.faqHeader}>
              <Text style={styles.faqQuestion}>
                3. Bagaimana sistem pengiriman emas yang dibeli?
              </Text>
            </View>
          </CollapseHeader>
          <CollapseBody>
            <Text style={styles.faqAnswer}>
              Emas yang dibeli akan dikirimkan via kurir khusus dengan sistem
              asuransi. Anda akan mendapatkan nomor resi untuk melacak
              pengiriman. Kami juga menyediakan opsi penyimpanan di safe deposit
              box mitra kami.
            </Text>
          </CollapseBody>
        </Collapse>

        <Collapse>
          <CollapseHeader>
            <View style={styles.faqHeader}>
              <Text style={styles.faqQuestion}>
                4. Apakah emas yang dijual sudah bersertifikat?
              </Text>
            </View>
          </CollapseHeader>
          <CollapseBody>
            <Text style={styles.faqAnswer}>
              Ya, semua produk emas yang kami jual sudah bersertifikat resmi
              dari PT Antam atau Logam Mulia dengan garansi keaslian 100%.
            </Text>
          </CollapseBody>
        </Collapse>

        <Collapse>
          <CollapseHeader>
            <View style={styles.faqHeader}>
              <Text style={styles.faqQuestion}>
                5. Bagaimana jika ingin menjual kembali emas?
              </Text>
            </View>
          </CollapseHeader>
          <CollapseBody>
            <Text style={styles.faqAnswer}>
              Kami menyediakan layanan buyback (pembelian kembali) dengan harga
              kompetitif. Anda bisa membawa emas ke outlet kami atau menggunakan
              layanan penjemputan khusus.
            </Text>
          </CollapseBody>
        </Collapse>

        <Collapse>
          <CollapseHeader>
            <View style={styles.faqHeader}>
              <Text style={styles.faqQuestion}>
                6. Apa keuntungan membeli emas secara online?
              </Text>
            </View>
          </CollapseHeader>
          <CollapseBody>
            <Text style={styles.faqAnswer}>
              Keuntungannya antara lain: harga lebih kompetitif, proses lebih
              mudah, bisa membandingkan harga berbagai produk, dan tidak perlu
              repot datang ke toko fisik.
            </Text>
          </CollapseBody>
        </Collapse>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#333",
  },
  aboutCard: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
    borderWidth: 3,
    borderColor: "#FFD700",
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#333",
  },
  detail: {
    fontSize: 14,
    marginBottom: 6,
    color: "#666",
    textAlign: "center",
  },
  faqHeader: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#FFD700",
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  faqAnswer: {
    backgroundColor: "#f9f9f9",
    padding: 16,
    fontSize: 14,
    color: "#555",
    lineHeight: 20,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
});
