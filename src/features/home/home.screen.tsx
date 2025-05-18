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
  Alert,
} from "react-native";
import { Text, Chip, Button } from "react-native-paper";
import { useState, useEffect, useCallback } from "react";
import { formatPrice } from "../../utils";
import { getAllProducts } from "../../../firebase";

const categories = ["Semua", "Batangan", "Perhiasan", "Koin"];

export const HomeScreen = ({ navigation }: any) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [priceRange, setPriceRange] = useState([0, 10000000]);
  const [products, setProducts] = useState<any[]>([]); // Initialize with empty array
  const [loading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch products from Firebase
  const fetchProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      const productsData = await getAllProducts();

      if (productsData) {
        // Handle Firebase object format (convert object to array)
        if (typeof productsData === "object" && !Array.isArray(productsData)) {
          const productsArray = Object.entries(productsData).map(
            ([key, value]) => {
              // If the key is already stored in the object as id, use that
              // Otherwise, use the Firebase key as id
              const v = value as any;
              return {
                id: v && typeof v === "object" && v.id ? v.id : key,
                ...(v && typeof v === "object" ? v : {}),
              };
            }
          );
          setProducts(productsArray);
        } else {
          // If already an array, use as is
          setProducts(Array.isArray(productsData) ? productsData : []);
        }
      } else {
        console.error("Failed to fetch products: Invalid data format");
        setProducts([]); // Set empty array as fallback
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      Alert.alert("Error", "Failed to load products. Please try again.");
      setProducts([]); // Set empty array on error
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts(); // Fetch products when component first loads
  }, [fetchProducts]);

  // Make sure products exists before filtering
  const filteredProducts = products.filter((product) => {
    // Filter based on search
    const matchesSearch = product?.name
      ?.toLowerCase()
      ?.includes(searchQuery.toLowerCase()) || false;

    // Filter based on category
    const matchesCategory =
      selectedCategory === "Semua" || product?.category === selectedCategory;

    // Filter based on price
    const matchesPrice =
      product?.price >= priceRange[0] && product?.price <= priceRange[1];

    return matchesSearch && matchesCategory && matchesPrice;
  });

  const handleProductPress = (product: any) => {
    // Navigate to product detail page
    navigation.navigate("ProductDetail", { product });
  };

  const renderProductItem = ({ item }: { item: any }) => {
    // Make sure imageUrl exists before calling split
    const imageUrl = item?.image;

    // Check if imageUrl exists before trying to split
    const fileId = imageUrl
      ? imageUrl.split("/file/d/")[1]?.split("/")[0]
      : null;

    // Reformat URL if fileId exists
    const displayUrl = fileId
      ? `https://drive.google.com/uc?export=view&id=${fileId}`
      : null;
    return (
      <TouchableOpacity
        style={[
          styles.productCard,
          item.stock === 0 && styles.outOfStock, // Change appearance if stock is 0
        ]}
        onPress={() => handleProductPress(item)}
        disabled={item.stock === 0} // Disable click if stock is 0
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
    setRefreshing(true);
    await fetchProducts();
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

      {/* Category Filter */}
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

      {/* Product List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFD700" />
        </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  // Style for out-of-stock products (gray)
  outOfStock: {
    backgroundColor: "#e0e0e0",
  },
});