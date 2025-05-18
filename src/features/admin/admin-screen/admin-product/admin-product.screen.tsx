import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  FlatList,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  RefreshControl,
  Alert,
} from "react-native";
import { getAllProducts, deleteProduct } from "../../../../../firebase";
import { ActivityIndicator } from "react-native-paper";
import { useIsFocused } from "@react-navigation/native";

export const AdminProductScreen = ({ navigation }: any) => {
  const [products, setProducts] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [sortBy, setSortBy] = useState<string>("name");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const isFocused = useIsFocused();

  const getUniqueCategories = useCallback(() => {
    // Fix: Check if products exists and is an array before using forEach
    if (!products || !Array.isArray(products) || products.length === 0)
      return ["All"];

    const categoriesSet = new Set();

    products.forEach((product) => {
      if (product.category) {
        categoriesSet.add(product.category);
      }
    });

    return ["All", ...Array.from(categoriesSet)] as string[];
  }, [products]);

  // Fix: Only call getUniqueCategories when products is available
  const categories = getUniqueCategories();

  const filteredProducts = products?.filter((product: any) => {
    const matchesCategory =
      selectedCategory === "All" || product.category === selectedCategory;
    const matchesSearch =
      product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const sortedProducts = [...(filteredProducts || [])].sort((a, b) => {
    if (sortBy === "name") return a.name?.localeCompare(b.name) || 0;
    if (sortBy === "price") return (a.price || 0) - (b.price || 0);
    if (sortBy === "stock") return (a.stock || 0) - (b.stock || 0);
    return 0;
  });

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

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    if (isFocused) {
      fetchProducts();
    }
  }, [isFocused, fetchProducts]);

  const handleAddProduct = () => {
    navigation.navigate("AdminProductEdit", { product: undefined });
  };

  const handleDeleteProduct = (productId: string, productName: string) => {
    Alert.alert(
      "Confirm Delete",
      `Are you sure you want to delete "${productName}"?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setIsLoading(true);
              const result = await deleteProduct(productId);

              if (result.success) {
                setProducts((prevProducts) =>
                  prevProducts.filter((product) => product.id !== productId)
                );
                Alert.alert("Success", "Product deleted successfully");
              } else {
                Alert.alert(
                  "Error",
                  result.error || "Failed to delete product"
                );
              }
            } catch (error) {
              console.error("Error deleting product:", error);
              Alert.alert(
                "Error",
                "Failed to delete product. Please try again."
              );
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const renderProductItem = ({ item }: { item: any }) => {
    const imageUrl = item?.image;

    const fileId = imageUrl
      ? imageUrl.split("/file/d/")[1]?.split("/")[0]
      : null;

    const displayUrl = fileId
      ? `https://drive.google.com/uc?export=view&id=${fileId}`
      : null;

    return (
      <View style={styles.productCard}>
        {displayUrl || item.image ? (
          <Image
            source={{ uri: displayUrl || item?.image }}
            style={styles.productImage}
          />
        ) : (
          <Image
            source={require("./../../../../../assets/no_image.png")}
            style={styles.productImage}
          />
        )}
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
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteProduct(item.id, item.name)}
          >
            <Text style={styles.buttonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Render sort buttons
  const renderSortButtons = () => {
    const sortOptions = [
      { key: "name", label: "Name" },
      { key: "price", label: "Price" },
      { key: "stock", label: "Stock" },
    ];

    return (
      <View style={styles.sortContainer}>
        <Text style={styles.sortLabel}>Sort by:</Text>
        <View style={styles.sortButtonsContainer}>
          {sortOptions.map((option) => (
            <TouchableOpacity
              key={option.key}
              style={[
                styles.sortButton,
                sortBy === option.key && styles.activeSortButton,
              ]}
              onPress={() => setSortBy(option.key)}
            >
              <Text
                style={
                  sortBy === option.key
                    ? styles.activeSortText
                    : styles.inactiveSortText
                }
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
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
      </View>

      {/* Sort Options */}
      {renderSortButtons()}

      {!isLoading ? (
        <FlatList
          data={sortedProducts}
          renderItem={renderProductItem}
          keyExtractor={(item) =>
            item.id ? item.id.toString() : Math.random().toString()
          }
          contentContainerStyle={styles.productList}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No products found</Text>
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#007bff"]}
            />
          }
        />
      ) : (
        <ActivityIndicator size="large" color="#0000ff" />
      )}

      <TouchableOpacity onPress={handleAddProduct} style={styles.addButton}>
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
    marginBottom: 12,
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
    marginRight: 8,
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
