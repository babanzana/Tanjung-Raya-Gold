import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
} from "react-native";
import { formatPrice } from "../../../utils";

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  image: string;
  category: string;
  quantity: number;
}

export const WishlistScreen = ({ route, navigation }: any) => {
  // Data dummy produk emas
  const [wishlist, setWishlist] = useState<Product[]>([
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
      image:
        "https://www.static-src.com/wcsstore/Indraprastha/images/catalog/full//catalog-image/108/MTA-150699626/idn_bulion_citraperkasa_idn_bulion_angpao_naga_koin_emas_logam_mulia_-0-2_g_-_24k_-_999-9_gold-_full09_isgvag1j.jpg",
    },
    {
      id: 9,
      name: "Emas Koin 0.5 Gram",
      category: "Koin",
      price: 990000,
      quantity: 3,
      stock: 18,
      image:
        "https://images.tokopedia.net/img/cache/700/VqbcmM/2021/2/13/04829d0c-a545-40c7-a88d-7f688b136c51.jpg",
    },
  ]);

  const removeFromWishlist = (id: number) => {
    setWishlist((prev) => prev.filter((item) => item.id !== id));
  };

  // Hitung total harga semua item di wishlist
  const totalPrice = wishlist.reduce((sum: number, item: Product) => {
    return sum + item.price * item.quantity;
  }, 0);

  const renderItem = ({ item }: { item: Product }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.image }} style={styles.image} />
      <View style={styles.details}>
        <Text style={styles.category}>{item.category}</Text>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.price}>
          Rp {item.price.toLocaleString("id-ID")}
        </Text>
        <View style={styles.stockContainer}>
          <Text style={styles.stock}>Stok: {item.stock}</Text>
          <Text style={styles.quantity}>Qty: {item.quantity}</Text>
        </View>
        <Text style={styles.totalPrice}>
          Total: Rp {(item.price * item.quantity).toLocaleString("id-ID")}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => removeFromWishlist(item.id)}
      >
        <Text style={styles.removeIcon}>×</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {wishlist.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Belum ada item di wishlist</Text>
        </View>
      ) : (
        <View style={styles.container}>
          <FlatList
            data={wishlist}
            renderItem={renderItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.list}
          />
          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>Total Wishlist:</Text>
            <Text style={styles.totalAmount}>{formatPrice(totalPrice)}</Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    fontSize: 22,
    fontWeight: "700",
    color: "#c9a227",
    textAlign: "center",
    padding: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    margin: 8,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 15,
  },
  details: {
    flex: 1,
    justifyContent: "center",
  },
  category: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 6,
  },
  price: {
    fontSize: 14,
    color: "#c9a227",
    fontWeight: "700",
    marginBottom: 4,
  },
  stockContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  stock: {
    fontSize: 12,
    color: "#666",
  },
  quantity: {
    fontSize: 12,
    color: "#666",
  },
  removeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#e0e0e0",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
  },
  removeIcon: {
    color: "#ff4444",
    fontSize: 24,
    lineHeight: 24,
    fontWeight: "300",
  },
  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
  },
  list: {
    paddingBottom: 20,
  },
  totalPrice: {
    fontSize: 14,
    color: "#333",
    fontWeight: "bold",
    marginTop: 8,
  },
  totalContainer: {
    backgroundColor: "#fff",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "bold",
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFD700",
  },
});
