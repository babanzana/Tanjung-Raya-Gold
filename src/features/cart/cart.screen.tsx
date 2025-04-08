import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Button,
  Image,
} from "react-native";

export const CartScreen = ({ navigation, route }: any) => {
  // Data cart dengan contoh produk emas batangan 1 gram
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: "Emas Batangan 1 Gram",
      price: 985000,
      quantity: 1,
      image:
        "https://www.logammulia.com/uploads/ngc_master_item/5cdcae8ad46b6_20190516072754-2.jpg",
      category: "Batangan",
      stock: 15,
    },
    {
      id: 8,
      name: "Emas Koin 0.2 Gram",
      category: "Koin",
      price: 500000,
      quantity: 1,
      stock: 25,
      rating: 4.6,
      image:
        "https://www.static-src.com/wcsstore/Indraprastha/images/catalog/full//catalog-image/108/MTA-150699626/idn_bulion_citraperkasa_idn_bulion_angpao_naga_koin_emas_logam_mulia_-0-2_g_-_24k_-_999-9_gold-_full09_isgvag1j.jpg",
      description:
        "Koin emas setengah gram dengan gambar khusus edisi terbatas.",
    },
    {
      id: 9,
      name: "Emas Koin 0.5 Gram",
      category: "Koin",
      price: 990000,
      quantity: 3,
      stock: 18,
      rating: 4.7,
      image:
        "https://images.tokopedia.net/img/cache/700/VqbcmM/2021/2/13/04829d0c-a545-40c7-a88d-7f688b136c51.jpg",
      description:
        "Koin emas 1 gram dengan kemasan eksklusif. Nilai investasi yang stabil.",
    },
  ]);

  // Hitung total harga
  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  // Render item cart
  const renderItem = ({ item }: any) => (
    <View style={styles.cartItem}>
      <Image
        source={{ uri: item.image }}
        style={styles.itemImage}
        resizeMode="contain"
      />
      <View style={styles.itemDetails}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemPrice}>
          Rp {item.price.toLocaleString("id-ID")}
        </Text>
        <View style={styles.quantityContainer}>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => updateQuantity(item.id, item.quantity - 1)}
            disabled={item.quantity <= 1}
          >
            <Text style={styles.quantityText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.quantity}>{item.quantity}</Text>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => updateQuantity(item.id, item.quantity + 1)}
            disabled={item.quantity >= item.stock}
          >
            <Text style={styles.quantityText}>+</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.subtotal}>
          Subtotal: Rp {(item.price * item.quantity).toLocaleString("id-ID")}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => removeFromCart(item.id)}
      >
        <Text style={styles.removeText}>×</Text>
      </TouchableOpacity>
    </View>
  );

  // Update quantity
  const updateQuantity = (id: any, newQuantity: any) => {
    setCartItems(
      cartItems.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity: Math.max(1, Math.min(newQuantity, item.stock)),
            }
          : item
      )
    );
  };

  // Hapus item dari cart
  const removeFromCart = (id: any) => {
    setCartItems(cartItems.filter((item) => item.id !== id));
  };

  return (
    <View style={styles.container}>
      {cartItems.length > 0 ? (
        <>
          <FlatList
            data={cartItems}
            renderItem={renderItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContent}
          />
          <View style={styles.summaryContainer}>
            <Text style={styles.totalText}>Total Belanja:</Text>
            <Text style={styles.totalAmount}>
              Rp {calculateTotal().toLocaleString("id-ID")}
            </Text>
            <Button
              title="Proses Checkout"
              onPress={() =>
                navigation.navigate("Checkout", { total: calculateTotal() })
              }
              color="#FFD700" // Warna emas
            />
          </View>
        </>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Keranjang Belanja Kosong</Text>
          <Text style={styles.emptySubtext}>
            Tambahkan produk emas favorit Anda
          </Text>
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
  },
  emptyText: {
    fontSize: 18,
    color: "#888",
    fontWeight: "bold",
  },
  emptySubtext: {
    fontSize: 14,
    color: "#aaa",
    marginTop: 8,
  },
});
