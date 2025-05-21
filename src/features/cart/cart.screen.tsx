import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Button,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { formatPrice } from "../../utils";
import {
  auth,
  getCartItems,
  removeFromCart,
  updateCartItemQuantity,
} from "../../../firebase";

export const CartScreen = ({ navigation }: any) => {
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Fetch cart items from Firebase
  const fetchCartItems = async () => {
    if (!auth.currentUser) {
      navigation.navigate("Auth");
      return;
    }

    setLoading(true);
    try {
      const items = await getCartItems(auth.currentUser.uid);
      setCartItems(items);
    } catch (error) {
      console.error("Error fetching cart items:", error);
      Alert.alert("Error", "Gagal memuat keranjang belanja");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", fetchCartItems);
    return unsubscribe;
  }, [navigation]);

  // Update quantity in Firebase
  const handleUpdateQuantity = async (id: string, newQuantity: number) => {
    if (!auth.currentUser) return;

    setUpdating(true);
    try {
      await updateCartItemQuantity(auth.currentUser.uid, id, newQuantity);
      await fetchCartItems(); // Refresh cart items
    } catch (error) {
      console.error("Error updating quantity:", error);
      Alert.alert("Error", "Gagal memperbarui jumlah produk");
    } finally {
      setUpdating(false);
    }
  };

  // Remove item from cart in Firebase
  const handleRemoveItem = async (id: string) => {
    if (!auth.currentUser) return;

    setUpdating(true);
    try {
      await removeFromCart(auth.currentUser.uid, id);
      await fetchCartItems(); // Refresh cart items
    } catch (error) {
      console.error("Error removing item:", error);
      Alert.alert("Error", "Gagal menghapus produk dari keranjang");
    } finally {
      setUpdating(false);
    }
  };

  // Calculate total price
  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  // Render cart item
  const renderItem = ({ item }: any) => {
    const imageUrl = item.image;
    const fileId = imageUrl
      ? imageUrl.split("/file/d/")[1]?.split("/")[0]
      : null;

    const displayUrl = fileId
      ? `https://drive.google.com/uc?export=view&id=${fileId}`
      : null;
    return (
      <View style={styles.cartItem}>
        {displayUrl || item.image ? (
          <Image
            source={{ uri: item.image }}
            style={styles.itemImage}
            resizeMode="contain"
          />
        ) : (
          <Image
            source={require("../../../assets/no_image.png")}
            style={styles.itemImage}
          />
        )}
        <View style={styles.itemDetails}>
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.itemPrice}>{formatPrice(item.price)}</Text>

          <View style={styles.quantityContainer}>
            <TouchableOpacity
              style={[
                styles.quantityButton,
                item.quantity <= 1 && styles.disabledButton,
              ]}
              onPress={() => handleUpdateQuantity(item.id, item.quantity - 1)}
              disabled={item.quantity <= 1 || updating}
            >
              <Text style={styles.quantityText}>-</Text>
            </TouchableOpacity>

            {updating ? (
              <ActivityIndicator size="small" color="#555" />
            ) : (
              <Text style={styles.quantity}>{item.quantity}</Text>
            )}

            <TouchableOpacity
              style={[
                styles.quantityButton,
                item.quantity >= item.stock && styles.disabledButton,
              ]}
              onPress={() => handleUpdateQuantity(item.id, item.quantity + 1)}
              disabled={item.quantity >= item.stock || updating}
            >
              <Text style={styles.quantityText}>+</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.subtotal}>
            Subtotal: {formatPrice(item.price * item.quantity)}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => handleRemoveItem(item.id)}
          disabled={updating}
        >
          <Text style={styles.removeText}>×</Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFD700" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {cartItems.length > 0 ? (
        <>
          <FlatList
            data={cartItems}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            refreshing={loading}
            onRefresh={fetchCartItems}
          />

          <View style={styles.summaryContainer}>
            <Text style={styles.totalText}>Total Belanja:</Text>
            <Text style={styles.totalAmount}>
              {formatPrice(calculateTotal())}
            </Text>

            <Button
              title={updating ? "Memproses..." : "Proses Checkout"}
              onPress={() =>
                navigation.navigate("Checkout", {
                  total: calculateTotal(),
                  cartItems: cartItems,
                })
              }
              color="#FFD700"
              disabled={updating}
            />
          </View>
        </>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Keranjang Belanja Kosong</Text>
          <Text style={styles.emptySubtext}>
            Tambahkan produk emas favorit Anda
          </Text>
          <Button
            title="Lihat Produk"
            onPress={() => navigation.navigate("HomeStack", { screen: "Home" })}
            color="#FFD700"
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    paddingBottom: 20,
  },
  cartItem: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 8,
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  itemImage: {
    width: 70,
    height: 70,
    borderRadius: 4,
  },
  itemDetails: {
    flex: 1,
    marginLeft: 12,
  },
  itemName: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#333",
  },
  itemPrice: {
    color: "#888",
    marginTop: 4,
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  quantityButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  disabledButton: {
    opacity: 0.5,
  },
  quantityText: {
    fontSize: 18,
    color: "#555",
  },
  quantity: {
    marginHorizontal: 12,
    fontSize: 16,
  },
  subtotal: {
    marginTop: 8,
    fontWeight: "bold",
    color: "#333",
  },
  removeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#ffecec",
    justifyContent: "center",
    alignItems: "center",
  },
  removeText: {
    color: "#ff6b6b",
    fontSize: 20,
    lineHeight: 20,
  },
  summaryContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    backgroundColor: "#fff",
  },
  totalText: {
    fontSize: 16,
    color: "#666",
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginVertical: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: "#888",
    fontWeight: "bold",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#aaa",
    marginBottom: 20,
  },
});
