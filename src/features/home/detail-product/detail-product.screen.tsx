import {
  SafeAreaView,
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { Text, Button } from "react-native-paper";
import { useState } from "react";
import { formatPrice } from "../../../utils";
import {
  addToCart,
  auth,
  db,
  getCartItems,
  updateCartItemQuantity,
} from "../../../../firebase";
import { ref, set } from "@react-native-firebase/database";

export const ProductDetailScreen = ({ route, navigation }: any) => {
  const { product } = route.params;
  const [quantity, setQuantity] = useState(1);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const totalPrice = product.price * quantity;

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const increaseQuantity = () => {
    if (quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };

  const handleAddToCart = async () => {
    if (!auth.currentUser) {
      navigation.navigate("Auth");
      return;
    }

    setIsLoading(true);
    try {
      const cartItems = await getCartItems(auth.currentUser.uid);
      const existingItem = cartItems.find((item) => item.id === product.id);

      if (existingItem) {
        // Jika barang sudah ada di keranjang, tampilkan alert
        Alert.alert(
          "Item Sudah Ada di Keranjang",
          `${product.name} sudah ada di keranjang dengan jumlah ${existingItem.quantity}.`,
          [
            {
              text: "Lihat Keranjang",
              onPress: () =>
                navigation.navigate("CartStack", { screen: "Cart" }),
            },
            {
              text: "Batal",
              style: "cancel",
            },
          ]
        );
      } else {
        // Jika barang belum ada di keranjang, tambahkan ke keranjang
        const result = await addToCart(auth.currentUser.uid, product, quantity);
        if (result.success) {
          Alert.alert(
            "Berhasil",
            `${product.name} telah ditambahkan ke keranjang`,
            [
              {
                text: "Lihat Keranjang",
                onPress: () =>
                  navigation.navigate("CartStack", { screen: "Cart" }),
              },
              {
                text: "Lanjut Belanja",
                style: "cancel",
              },
            ]
          );
        }
      }
    } catch (error) {
      // console.error("Error:", error);
      // Alert.alert("Error", "Terjadi kesalahan saat memproses permintaan");
    } finally {
      setIsLoading(false);
    }
  };

  // const handleAddToCart = async () => {
  //   if (!auth.currentUser) {
  //     navigation.navigate("Auth");
  //     return;
  //   }

  //   setIsLoading(true);
  //   try {
  //     const cartItems = await getCartItems(auth.currentUser.uid);
  //     const existingItem = cartItems.find((item) => item.id === product.id);

  //     if (existingItem) {
  //       // Item sudah ada di keranjang
  //       Alert.alert(
  //         "Item Sudah Ada di Keranjang",
  //         `${product.name} sudah ada di keranjang dengan jumlah ${existingItem.quantity}.`,
  //         [
  //           {
  //             text: "Lihat Keranjang",
  //             onPress: () =>
  //               navigation.navigate("CartStack", { screen: "Cart" }),
  //           },
  //           // {
  //           //   text: "Tambahkan Lagi",
  //           //   onPress: async () => {
  //           //     try {
  //           //       const newQuantity = existingItem.quantity + quantity;
  //           //       await set(
  //           //         ref(db, `users/${auth.currentUser.uid}/cart/${product.id}`),
  //           //         {
  //           //           ...existingItem,
  //           //           quantity: newQuantity,
  //           //           updatedAt: Date.now(),
  //           //         }
  //           //       );
  //           //       Alert.alert(
  //           //         "Berhasil",
  //           //         `Jumlah ${product.name} di keranjang telah diperbarui menjadi ${newQuantity}`,
  //           //         [
  //           //           {
  //           //             text: "Lihat Keranjang",
  //           //             onPress: () =>
  //           //               navigation.navigate("CartStack", { screen: "Cart" }),
  //           //           },
  //           //           {
  //           //             text: "OK",
  //           //             style: "cancel",
  //           //           },
  //           //         ]
  //           //       );
  //           //     } catch (error) {
  //           //       console.error("Error updating cart item:", error);
  //           //       Alert.alert(
  //           //         "Error",
  //           //         "Gagal memperbarui jumlah item di keranjang"
  //           //       );
  //           //     }
  //           //   },
  //           // },
  //           {
  //             text: "Batal",
  //             style: "cancel",
  //           },
  //         ]
  //       );
  //     } else {
  //       // Item baru, tambahkan ke keranjang
  //       const cartItem = {
  //         ...product,
  //         quantity: quantity,
  //         createdAt: Date.now(),
  //         updatedAt: Date.now(),
  //       };

  //       await set(
  //         ref(db, `users/${auth.currentUser.uid}/cart/${product.id}`),
  //         cartItem
  //       );

  //       Alert.alert(
  //         "Berhasil",
  //         `${product.name} telah ditambahkan ke keranjang`,
  //         [
  //           {
  //             text: "Lihat Keranjang",
  //             onPress: () =>
  //               navigation.navigate("CartStack", { screen: "Cart" }),
  //           },
  //           {
  //             text: "Lanjut Belanja",
  //             style: "cancel",
  //           },
  //         ]
  //       );
  //     }
  //   } catch (error) {
  //     console.error("Error:", error);
  //     Alert.alert("Error", "Terjadi kesalahan saat memproses permintaan");
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const handleWishlist = () => {
    setIsInWishlist(!isInWishlist);
    Alert.alert(
      isInWishlist ? "Dihapus dari Wishlist" : "Ditambahkan ke Wishlist",
      isInWishlist
        ? `${product.name} dihapus dari wishlist`
        : `${product.name} ditambahkan ke wishlist`
    );
  };

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
                  style={[
                    styles.quantityButton,
                    quantity <= 1 && styles.disabledButton,
                  ]}
                  onPress={decreaseQuantity}
                  disabled={quantity <= 1}
                >
                  <Text style={styles.quantityButtonText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.quantityValue}>{quantity}</Text>
                <TouchableOpacity
                  style={[
                    styles.quantityButton,
                    quantity >= product.stock && styles.disabledButton,
                  ]}
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
                loading={isLoading}
                disabled={isLoading}
              >
                {isLoading
                  ? "Memproses..."
                  : `Tambah ke Keranjang (${quantity})`}
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
  },
  scrollContainer: {
    paddingBottom: 20,
  },
  detailContainer: {
    padding: 16,
  },
  detailImage: {
    width: "100%",
    height: 300,
    borderRadius: 8,
    marginBottom: 16,
  },
  detailContent: {
    paddingHorizontal: 8,
  },
  detailName: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 8,
  },
  detailCategory: {
    fontSize: 16,
    color: "#666",
    marginBottom: 12,
  },
  detailPrice: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2e7d32",
    marginBottom: 8,
  },
  detailStock: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
  },
  detailDescription: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  quantityLabel: {
    fontSize: 16,
    fontWeight: "500",
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
  },
  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  disabledButton: {
    opacity: 0.5,
  },
  quantityButtonText: {
    fontSize: 20,
    fontWeight: "bold",
  },
  quantityValue: {
    fontSize: 18,
    marginHorizontal: 16,
    minWidth: 30,
    textAlign: "center",
  },
  totalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "500",
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2e7d32",
  },
  verticalButtonGroup: {
    marginTop: 16,
  },
  addButton: {
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: "#2e7d32",
  },
  buttonLabel: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  wishlistButton: {
    paddingVertical: 8,
    borderRadius: 8,
    borderColor: "#2e7d32",
  },
  wishlistButtonActive: {
    backgroundColor: "#f8f8f8",
  },
  wishlistButtonLabel: {
    color: "#2e7d32",
    fontSize: 16,
  },
  wishlistButtonActiveLabel: {
    color: "#d32f2f",
  },
});
