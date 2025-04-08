import {
  SafeAreaView,
  View,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { Text, Chip, Button } from "react-native-paper";
import { useState } from "react";
import { formatPrice } from "../../utils";

// Data Dummy Produk Emas
const goldProducts = [
  {
    id: 1,
    name: "Emas Batangan 1 Gram",
    category: "Batangan",
    price: 985000,
    stock: 15,
    rating: 4.8,
    image:
      "https://www.logammulia.com/uploads/ngc_master_item/5cdcae8ad46b6_20190516072754-2.jpg",
    description:
      "Emas batangan murni 24 karat dengan berat 1 gram. Produk resmi dari PT Antam.",
  },
  {
    id: 2,
    name: "Emas Batangan 5 Gram",
    category: "Batangan",
    price: 4925000,
    stock: 8,
    rating: 4.9,
    image:
      "https://id-test-11.slatic.net/p/1b54e51d9dd5f7e02d6567192bc0f19e.jpg",
    description:
      "Emas batangan murni 24 karat dengan berat 5 gram. Dilengkapi sertifikat keaslian.",
  },
  {
    id: 3,
    name: "Emas Batangan 10 Gram",
    category: "Batangan",
    price: 9850000,
    stock: 5,
    rating: 5.0,
    image:
      "https://www.static-src.com/wcsstore/Indraprastha/images/catalog/full//108/MTA-7797816/antam_logam_mulia_10_gram_-_lm_antam_-_emas_batangan_kepingan_10_gram_full04_ljmxa0kq.jpg",
    description:
      "Emas batangan ukuran 10 gram dengan kemasan eksklusif. Cocok untuk investasi jangka panjang.",
  },
  {
    id: 4,
    name: "Kalung Emas 18K",
    category: "Perhiasan",
    price: 3500000,
    stock: 12,
    rating: 4.5,
    image:
      "https://images.tokopedia.net/img/cache/500-square/VqbcmM/2023/1/3/b7696a69-2c1d-4ce2-919e-a58f6d1594de.jpg",
    description: "Kalung emas 18 karat dengan desain modern dan elegan.",
  },
  {
    id: 5,
    name: "Cincin Emas Timbang",
    category: "Perhiasan",
    price: 2500000,
    stock: 20,
    rating: 4.3,
    image:
      "https://ae01.alicdn.com/kf/S4fd67873da7642e1a64984397b4091a9r.jpg_640x640q90.jpg",
    description:
      "Cincin emas timbang dengan berbagai ukuran tersedia. Bisa custom desain.",
  },
  {
    id: 6,
    name: "Gelang Emas 22K",
    category: "Perhiasan",
    price: 4200000,
    stock: 7,
    rating: 4.7,
    image: "https://ae01.alicdn.com/kf/Se091cd8131e2478d8458ac482c4f596aU.jpg",
    description:
      "Gelang emas 22 karat dengan ukiran tradisional. Berat sekitar 8 gram.",
  },
  {
    id: 7,
    name: "Liontin Emas",
    category: "Perhiasan",
    price: 1800000,
    stock: 14,
    rating: 4.2,
    image:
      "https://tokoperhiasan.co.id/assets/front/images/product/thumb/Liontin-emas-bentuk-hati-aksen-segtiga-mata-cubic-zirconia.webp",
    description:
      "Liontin emas dengan pilihan motif yang beragam. Berat sekitar 3 gram.",
  },
  {
    id: 8,
    name: "Emas Koin 0.2 Gram",
    category: "Koin",
    price: 500000,
    stock: 25,
    rating: 4.6,
    image:
      "https://www.static-src.com/wcsstore/Indraprastha/images/catalog/full//catalog-image/108/MTA-150699626/idn_bulion_citraperkasa_idn_bulion_angpao_naga_koin_emas_logam_mulia_-0-2_g_-_24k_-_999-9_gold-_full09_isgvag1j.jpg",
    description: "Koin emas setengah gram dengan gambar khusus edisi terbatas.",
  },
  {
    id: 9,
    name: "Emas Koin 0.5 Gram",
    category: "Koin",
    price: 990000,
    stock: 18,
    rating: 4.7,
    image:
      "https://images.tokopedia.net/img/cache/700/VqbcmM/2021/2/13/04829d0c-a545-40c7-a88d-7f688b136c51.jpg",
    description:
      "Koin emas 1 gram dengan kemasan eksklusif. Nilai investasi yang stabil.",
  },
  {
    id: 10,
    name: "Emas Koin 2 Gram",
    category: "Koin",
    price: 2475000,
    stock: 9,
    rating: 4.9,
    image:
      "https://www.static-src.com/wcsstore/Indraprastha/images/catalog/full//104/MTA-8727917/annacraft_annacraft_idn_monas_koin_emas_logam_mulia_-2-0_g_-_999-9-_fine_gold-_jabodetabek_full01_kh5h1dux.jpg",
    description:
      "Koin emas 2.5 gram dengan sertifikat keaslian. Cocok untuk hadiah.",
  },
];

const categories = ["Semua", "Batangan", "Perhiasan", "Koin"];

export const HomeScreen = ({ navigation }: any) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [priceRange, setPriceRange] = useState([0, 10000000]);

  const filteredProducts = goldProducts.filter((product) => {
    // Filter berdasarkan pencarian
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    // Filter berdasarkan kategori
    const matchesCategory =
      selectedCategory === "Semua" || product.category === selectedCategory;

    // Filter berdasarkan harga
    const matchesPrice =
      product.price >= priceRange[0] && product.price <= priceRange[1];

    return matchesSearch && matchesCategory && matchesPrice;
  });

  const formatPrice = (price: any) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Cari produk emas..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Filter Kategori */}
      <View style={styles.filterContainer}>
        {categories.map((category) => (
          <Chip
            key={category}
            mode="outlined"
            selected={category === selectedCategory}
            onPress={() => setSelectedCategory(category)}
            style={styles.chip}
          >
            {category}
          </Chip>
        ))}
      </View>

      {/* Daftar Produk */}
      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.productCard}
            onPress={() =>
              navigation.navigate("ProductDetail", { product: item })
            }
          >
            <Image
              source={{ uri: item.image }}
              style={styles.productImage}
              resizeMode="contain"
            />
            <View style={styles.productInfo}>
              <Text style={styles.productName} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={styles.productPrice}>{formatPrice(item.price)}</Text>
              <View style={styles.productMeta}>
                <Text style={styles.productStock}>Stok: {item.stock}</Text>
                <Text style={styles.productRating}>⭐ {item.rating}</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 10,
  },
  searchContainer: {
    padding: 10,
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    marginBottom: 10,
  },
  searchInput: {
    backgroundColor: "#fff",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
    fontSize: 16,
  },
  filterContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 10,
  },
  chip: {
    margin: 4,
  },
  listContainer: {
    paddingBottom: 20,
  },
  productCard: {
    flex: 1,
    margin: 5,
    backgroundColor: "#f9f9f9",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    padding: 10,
    borderRadius: 10,
    overflow: "hidden",
    maxWidth: "48%",
  },
  productImage: {
    width: "100%",
    height: 120,
    backgroundColor: "#f0f0f0",
  },
  productInfo: {
    padding: 10,
  },
  productName: {
    fontWeight: "bold",
    fontSize: 14,
    marginBottom: 5,
  },
  productPrice: {
    color: "#2e7d32",
    fontWeight: "bold",
    fontSize: 16,
  },
  productMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 5,
  },
  productStock: {
    fontSize: 12,
    color: "#666",
  },
  productRating: {
    fontSize: 12,
    color: "#ff9800",
  },
  detailContainer: {
    flex: 1,
    padding: 15,
  },
  detailImage: {
    width: "100%",
    height: 250,
    marginBottom: 20,
  },
  detailContent: {
    flex: 1,
  },
  detailName: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 5,
  },
  detailCategory: {
    fontSize: 16,
    color: "#666",
    marginBottom: 10,
  },
  detailRating: {
    marginBottom: 10,
  },
  detailPrice: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#2e7d32",
    marginBottom: 5,
  },
  detailStock: {
    fontSize: 16,
    marginBottom: 15,
  },
  detailDescription: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
  },
  buttonGroup: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  addButton: {
    flex: 1,
    marginRight: 10,
    backgroundColor: "#d4af37",
  },
  wishlistButton: {
    flex: 1,
    borderColor: "#d4af37",
  },
});
