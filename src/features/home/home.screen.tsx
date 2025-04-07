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
    image: "https://via.placeholder.com/150/FFD700/000000?text=Emas+1Gram",
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
    image: "https://via.placeholder.com/150/FFD700/000000?text=Emas+5Gram",
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
    image: "https://via.placeholder.com/150/FFD700/000000?text=Emas+10Gram",
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
    image: "https://via.placeholder.com/150/FFD700/000000?text=Kalung+Emas",
    description: "Kalung emas 18 karat dengan desain modern dan elegan.",
  },
  {
    id: 5,
    name: "Cincin Emas Timbang",
    category: "Perhiasan",
    price: 2500000,
    stock: 20,
    rating: 4.3,
    image: "https://via.placeholder.com/150/FFD700/000000?text=Cincin+Emas",
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
    image: "https://via.placeholder.com/150/FFD700/000000?text=Gelang+Emas",
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
    image: "https://via.placeholder.com/150/FFD700/000000?text=Liontin+Emas",
    description:
      "Liontin emas dengan pilihan motif yang beragam. Berat sekitar 3 gram.",
  },
  {
    id: 8,
    name: "Emas Koin 1/2 Gram",
    category: "Koin",
    price: 500000,
    stock: 25,
    rating: 4.6,
    image: "https://via.placeholder.com/150/FFD700/000000?text=Koin+Emas",
    description: "Koin emas setengah gram dengan gambar khusus edisi terbatas.",
  },
  {
    id: 9,
    name: "Emas Koin 1 Gram",
    category: "Koin",
    price: 990000,
    stock: 18,
    rating: 4.7,
    image: "https://via.placeholder.com/150/FFD700/000000?text=Koin+1Gram",
    description:
      "Koin emas 1 gram dengan kemasan eksklusif. Nilai investasi yang stabil.",
  },
  {
    id: 10,
    name: "Emas Koin 2.5 Gram",
    category: "Koin",
    price: 2475000,
    stock: 9,
    rating: 4.9,
    image: "https://via.placeholder.com/150/FFD700/000000?text=Koin+2.5Gram",
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
