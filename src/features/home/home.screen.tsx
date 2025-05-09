import {
  SafeAreaView,
  View,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Text, Chip, Button } from "react-native-paper";
import { useState, useEffect } from "react";
import { formatPrice } from "../../utils";
import { getAllProducts } from "../../../firebase";

const categories = ["Semua", "Batangan", "Perhiasan", "Koin"];

export const HomeScreen = ({ navigation }: any) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [priceRange, setPriceRange] = useState([0, 10000000]);
  const [products, setProducts] = useState<any[]>([]); // Menyimpan produk
  const [loading, setLoading] = useState(true); // Menyimpan status loading
  const [refreshing, setRefreshing] = useState(false); // Menyimpan status refresh

  // Ambil data produk dari Firebase
  const fetchProducts = async () => {
    setLoading(true);
    const allProducts = await getAllProducts(); // Mengambil produk dari Firebase
    setProducts(allProducts); // Set data produk ke state
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts(); // Ambil data produk ketika komponen pertama kali dimuat
  }, []);

  const filteredProducts = products.filter((product) => {
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

  const handleProductPress = (product: any) => {
    // Navigasi ke halaman detail produk
    navigation.navigate("ProductDetail", { product });
  };

  const renderProductItem = ({ item }: { item: any }) => {
    // Pastikan imageUrl ada sebelum memanggil split
    const imageUrl = item?.image; // Ambil URL gambar dari produk

    // Periksa apakah imageUrl ada sebelum mencoba melakukan split
    const fileId = imageUrl
      ? imageUrl.split("/file/d/")[1]?.split("/")[0]
      : null;

    // Format ulang URL jika fileId ada
    const displayUrl = fileId
      ? `https://drive.google.com/uc?export=view&id=${fileId}`
      : null;
    return (
      <TouchableOpacity
        style={[
          styles.productCard,
          item.stock === 0 && styles.outOfStock, // Ubah tampilan jika stok 0
        ]}
        onPress={() => handleProductPress(item)}
        disabled={item.stock === 0} // Nonaktifkan klik jika stok 0
      >
        <Image
          source={
            item.stock === 0
              ? require("./../../../assets/sold.png")
              : { uri: displayUrl || item.image }
          }
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
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const onRefresh = async () => {
    setRefreshing(true); // Menandakan bahwa refresh sedang berjalan
    await fetchProducts(); // Ambil produk lagi dari Firebase
    setRefreshing(false); // Menandakan bahwa refresh selesai
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
      {loading ? (
        <ActivityIndicator size="large" color="#FFD700" />
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          contentContainerStyle={styles.listContainer}
          renderItem={renderProductItem}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
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
  // Gaya untuk produk yang stoknya habis (abu-abu)
  outOfStock: {
    backgroundColor: "#e0e0e0",
  },
});
