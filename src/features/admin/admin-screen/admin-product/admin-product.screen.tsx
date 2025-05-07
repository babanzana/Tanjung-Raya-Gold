// admin-product.screen.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  FlatList,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from "react-native";
import { DUMMY_PRODUCTS } from "../../../../dummy";
import { getAllProducts } from "../../../../database/products";
import { addInitialProducts } from "../../../../../firebase";
import { ActivityIndicator } from "react-native-paper";

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  image: string;
  description: string;
}

export const AdminProductScreen = ({ navigation }: any) => {
  const [products, setProducts] = useState<any[]>();
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [sortBy, setSortBy] = useState<string>("name");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const categories = ["All", ...new Set(DUMMY_PRODUCTS.map((p) => p.category))];

  const filteredProducts = products?.filter((product) => {
    const matchesCategory =
      selectedCategory === "All" || product.category === selectedCategory;
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const sortedProducts = [...(filteredProducts || [])].sort((a, b) => {
    if (sortBy === "name") return a.name.localeCompare(b.name);
    if (sortBy === "price") return a.price - b.price;
    if (sortBy === "stock") return a.stock - b.stock;
    return 0;
  });

  const [isLoading, setIsLoading] = useState<boolean>(true); // State untuk menandakan loading

  useEffect(() => {
    // Panggil getAllProducts dan simpan data produk ke dalam state
    const fetchProducts = async () => {
      try {
        // addInitialProducts(); // Tambahkan data awal jika belum ada
        const productsData = await getAllProducts(); // Ambil data produk
        console.log("🚀 ~ fetchProducts ~ productsData:", productsData);

        if (productsData) {
          setProducts(productsData); // Simpan data produk ke dalam state
        } else {
          console.error("Failed to fetch products: Invalid data format");
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setIsLoading(false); // Set isLoading menjadi false setelah proses pengambilan data selesai
      }
    };

    fetchProducts(); // Panggil fungsi untuk mengambil data produk saat komponen pertama kali dimuat
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const renderProductItem = ({ item }: { item: Product }) => (
    <View style={styles.productCard}>
      <Image source={{ uri: item.image }} style={styles.productImage} />
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productCategory}>{item.category}</Text>
        <Text style={styles.productPrice}>{formatPrice(item.price)}</Text>
        <Text style={styles.productStock}>Stock: {item.stock}</Text>
      </View>
      <View style={styles.productActions}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() =>
            navigation.navigate("AdminProductEdit", { product: item })
          }
        >
          <Text style={styles.buttonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteButton}>
          <Text style={styles.buttonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search products..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Category Filter */}
      <View style={styles.filterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
          // refreshControl={}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryButton,
                selectedCategory === category && styles.selectedCategoryButton,
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text
                style={[
                  styles.categoryButtonText,
                  selectedCategory === category &&
                    styles.selectedCategoryButtonText,
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Sort Options */}
        <View style={styles.sortContainer}>
          <Text style={styles.sortLabel}>Sorted By:</Text>
          <View style={styles.sortButtonsContainer}>
            <TouchableOpacity
              style={[
                styles.sortButton,
                sortBy === "name" && styles.activeSortButton,
              ]}
              onPress={() => setSortBy("name")}
            >
              <Text
                style={
                  sortBy === "name"
                    ? styles.activeSortText
                    : styles.inactiveSortText
                }
              >
                Name
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.sortButton,
                sortBy === "price" && styles.activeSortButton,
              ]}
              onPress={() => setSortBy("price")}
            >
              <Text
                style={
                  sortBy === "price"
                    ? styles.activeSortText
                    : styles.inactiveSortText
                }
              >
                Price
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.sortButton,
                sortBy === "stock" && styles.activeSortButton,
              ]}
              onPress={() => setSortBy("stock")}
            >
              <Text
                style={
                  sortBy === "stock"
                    ? styles.activeSortText
                    : styles.inactiveSortText
                }
              >
                Stock
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Product List */}
      {!isLoading ? (
        <FlatList
          data={sortedProducts}
          renderItem={renderProductItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.productList}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No products found</Text>
          }
        />
      ) : (
        <ActivityIndicator size="large" color="#0000ff" />
      )}

      {/* Add Product Button */}
      <TouchableOpacity
        // onPress={() => navigation.navigate("AdminProductEdit")}
        style={styles.addButton}
      >
        <Text style={styles.addButtonText}>+ Add New Product</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 16,
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchInput: {
    backgroundColor: "white",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  filterContainer: {
    marginBottom: 16,
  },
  categoryScroll: {
    paddingVertical: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#e0e0e0",
    marginRight: 8,
  },
  selectedCategoryButton: {
    backgroundColor: "#007bff",
  },
  categoryButtonText: {
    color: "#333",
  },
  selectedCategoryButtonText: {
    color: "white",
  },
  sortContainer: {
    marginTop: 12,
  },
  sortLabel: {
    marginBottom: 8,
    color: "#666",
    fontSize: 14,
  },
  sortButtonsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  sortButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#e0e0e0",
  },
  activeSortButton: {
    backgroundColor: "#007bff",
  },
  activeSortText: {
    color: "white",
    fontWeight: "500",
  },
  inactiveSortText: {
    color: "#666",
  },
  productList: {
    paddingBottom: 80,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 20,
    color: "#666",
  },
  productCard: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    flexDirection: "row",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 4,
    marginRight: 12,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  productCategory: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#007bff",
    marginBottom: 4,
  },
  productStock: {
    fontSize: 12,
    color: "#666",
  },
  productActions: {
    justifyContent: "space-between",
  },
  editButton: {
    backgroundColor: "#28a745",
    padding: 6,
    borderRadius: 4,
    marginBottom: 4,
  },
  deleteButton: {
    backgroundColor: "#dc3545",
    padding: 6,
    borderRadius: 4,
  },
  buttonText: {
    color: "white",
    fontSize: 12,
    textAlign: "center",
  },
  addButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#007bff",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  addButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});
