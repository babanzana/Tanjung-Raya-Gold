import {
  SafeAreaView,
  View,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from "react-native";
import { Text, Chip, Button } from "react-native-paper";
import { useState } from "react";
import { formatPrice } from "../../../utils";

export const ProductDetailScreen = ({ route, navigation }: any) => {
  const { product } = route.params;
  const [quantity, setQuantity] = useState(1);
  const [isInWishlist, setIsInWishlist] = useState(false);

  const handleAddToCart = () => {
    console.log(`Added ${quantity} items to cart`);
    // Tambahkan logika untuk menambahkan ke keranjang
  };

  const handleWishlist = () => {
    setIsInWishlist(!isInWishlist);
    console.log(isInWishlist ? "Removed from wishlist" : "Added to wishlist");
  };

  const increaseQuantity = () => {
    setQuantity((prev) => Math.min(prev + 1, product.stock));
  };

  const decreaseQuantity = () => {
    setQuantity((prev) => Math.max(prev - 1, 1));
  };

  const totalPrice = product.price * quantity;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.detailContainer}>
          <Image
            source={{ uri: product.image }}
            style={styles.detailImage}
            resizeMode="contain"
          />

          <View style={styles.detailContent}>
            <Text style={styles.detailName}>{product.name}</Text>
            <Text style={styles.detailCategory}>
              Kategori: {product.category}
            </Text>

            <View style={styles.detailRating}>
              <Text>⭐ {product.rating}</Text>
            </View>

            <Text style={styles.detailPrice}>{formatPrice(product.price)}</Text>
            <Text style={styles.detailStock}>
              Stok tersedia: {product.stock}
            </Text>

            <Text style={styles.detailDescription}>{product.description}</Text>

            {/* Quantity Selector */}
            <View style={styles.quantityContainer}>
              <Text style={styles.quantityLabel}>Jumlah:</Text>
              <View style={styles.quantityControls}>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={decreaseQuantity}
                  disabled={quantity <= 1}
                >
                  <Text style={styles.quantityButtonText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.quantityValue}>{quantity}</Text>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={increaseQuantity}
                  disabled={quantity >= product.stock}
                >
                  <Text style={styles.quantityButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Total Price */}
            <View style={styles.totalContainer}>
              <Text style={styles.totalLabel}>Total:</Text>
              <Text style={styles.totalPrice}>{formatPrice(totalPrice)}</Text>
            </View>

            {/* Vertical Button Group */}
            <View style={styles.verticalButtonGroup}>
              <Button
                mode="contained"
                style={styles.addButton}
                labelStyle={styles.buttonLabel}
                onPress={handleAddToCart}
              >
                Tambah ke Keranjang ({quantity})
              </Button>
              <Button
                mode="outlined"
                style={[
                  styles.wishlistButton,
                  isInWishlist && styles.wishlistButtonActive,
                ]}
                labelStyle={[
                  styles.wishlistButtonLabel,
                  isInWishlist && styles.wishlistButtonActiveLabel,
                ]}
                onPress={handleWishlist}
              >
                {isInWishlist ? "Hapus dari Wishlist" : "Tambahkan ke Wishlist"}
              </Button>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 10,
  },
  scrollContainer: {
    padding: 15,
    paddingBottom: 100, // Untuk memberi ruang bagi fixed buttons
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
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 20,
    paddingHorizontal: 10,
  },
  quantityLabel: {
    fontSize: 16,
    fontWeight: "bold",
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#d4af37",
    borderRadius: 8,
  },
  quantityButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f8f8",
  },
  quantityButtonText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#d4af37",
  },
  quantityValue: {
    width: 50,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
  },
  totalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "bold",
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2e7d32",
  },
  verticalButtonGroup: {
    marginTop: 20,
    gap: 12, // Memberi jarak antara tombol
  },
  addButton: {
    borderRadius: 8,
    backgroundColor: "#d4af37",
    paddingVertical: 8,
    elevation: 3, // Shadow untuk Android
    shadowColor: "#000", // Shadow untuk iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  wishlistButton: {
    borderRadius: 8,
    borderColor: "#d4af37",
    paddingVertical: 8,
    backgroundColor: "transparent",
  },
  wishlistButtonActive: {
    backgroundColor: "#fff8e1",
    borderColor: "#d4af37",
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff", // Untuk tombol utama
  },
  wishlistButtonLabel: {
    color: "#d4af37", // Untuk tombol outlined
  },
  wishlistButtonActiveLabel: {
    color: "#b8860b", // Untuk tombol active
  },
});
