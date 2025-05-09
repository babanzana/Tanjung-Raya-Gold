import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { formatPrice } from "../../../utils";
import {
  getUserWishlist,
  removeFromWishlistFirebase,
} from "../../../../firebase";

export const WishlistScreen = ({ route, navigation }: any) => {
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<null | string>(null);
  const [refreshing, setRefreshing] = useState(false); // State untuk refresh control

  // Fungsi untuk memuat wishlist
  const loadWishlist = async () => {
    try {
      const items = await getUserWishlist();
      setWishlist(items);
      setError(null);
    } catch (err) {
      console.error("Failed to load wishlist:", err);
      setError("Gagal memuat wishlist. Silakan coba lagi.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Load wishlist saat komponen mount
  useEffect(() => {
    loadWishlist();
  }, []);

  // Handle refresh saat di tarik ke bawah
  const onRefresh = () => {
    setRefreshing(true);
    loadWishlist();
  };

  // Load wishlist dari Firebase saat komponen mount
  useEffect(() => {
    const loadWishlist = async () => {
      try {
        const items = await getUserWishlist();
        setWishlist(items);
        setError(null);
      } catch (err) {
        console.error("Failed to load wishlist:", err);
        setError("Gagal memuat wishlist. Silakan coba lagi.");
      } finally {
        setLoading(false);
      }
    };

    loadWishlist();
  }, []);

  // Handle remove item dari wishlist
  const removeFromWishlist = async (id: string) => {
    try {
      setWishlist((prev: any) => prev.filter((item: any) => item.id !== id));
      await removeFromWishlistFirebase(id);
    } catch (err) {
      console.error("Failed to remove item:", err);
      setError("Gagal menghapus item. Silakan coba lagi.");
      // Rollback UI jika gagal
      const items = await getUserWishlist();
      setWishlist(items);
    }
  };

  const totalPrice = wishlist.reduce((sum: any, item: any) => {
    return sum + item.price * item.quantity;
  }, 0);

  const renderItem = ({ item }: any) => {
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
      <View style={styles.card}>
        <Image
          source={{ uri: displayUrl || item.image }}
          style={styles.image}
        />
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
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#FFD700" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => navigation.replace("Wishlist")}
        >
          <Text style={styles.retryButtonText}>Coba Lagi</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {wishlist.length === 0 ? (
        <View style={[styles.empty, styles.center]}>
          <Text style={styles.emptyText}>Belum ada item di wishlist</Text>
          <TouchableOpacity
            style={styles.shopButton}
            onPress={() => navigation.navigate("HomeStack", { screen: "Home" })}
          >
            <Text style={styles.shopButtonText}>Belanja Sekarang</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.container}>
          <FlatList
            data={wishlist}
            renderItem={renderItem}
            keyExtractor={(item: any) => item.id}
            contentContainerStyle={styles.list}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={["#FFD700"]} // Warna animasi refresh (opsional)
                tintColor="#FFD700" // Warna ikon refresh (iOS)
                title="Memuat..." // Teks yang ditampilkan (iOS)
                titleColor="#666" // Warna teks (iOS)
              />
            }
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
  center: {
    justifyContent: "center",
    alignItems: "center",
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
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
    marginBottom: 20,
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
  errorText: {
    fontSize: 16,
    color: "#ff4444",
    marginBottom: 20,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#FFD700",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  shopButton: {
    backgroundColor: "#FFD700",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  shopButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
