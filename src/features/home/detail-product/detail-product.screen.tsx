import {
  SafeAreaView,
  View,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { Text, Chip, Button } from "react-native-paper";
import { useState } from "react";
import { formatPrice } from "../../../utils";

export const ProductDetailScreen = ({ route, navigation }: any) => {
  const { product } = route.params;

  return (
    <SafeAreaView style={styles.container}>
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
          <Text style={styles.detailStock}>Stok tersedia: {product.stock}</Text>

          <Text style={styles.detailDescription}>{product.description}</Text>

          <View style={styles.buttonGroup}>
            <Button
              mode="contained"
              style={styles.addButton}
              onPress={() => console.log("Added to cart")}
            >
              Tambah ke Keranjang
            </Button>
            <Button
              mode="outlined"
              style={styles.wishlistButton}
              onPress={() => console.log("Added to wishlist")}
            >
              Wishlist
            </Button>
          </View>
        </View>
      </View>
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
  addButton: {
    flex: 1,
    marginRight: 10,
    backgroundColor: "#d4af37",
  },
  wishlistButton: {
    flex: 1,
    borderColor: "#d4af37",
  },
});
