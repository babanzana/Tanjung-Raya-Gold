import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  StyleSheet,
  Dimensions,
} from "react-native";
import { DUMMY_PRODUCTS } from "../../../../dummy";
import { saveTransaction } from "../../../../../firebase";
const { height } = Dimensions.get("window");

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  rating: number;
  image: string;
  description: string;
}

interface SelectedProduct {
  id: number;
  nama: string;
  harga: number;
  qty: number;
  totalHarga: number;
  image: string;
}

export const PenjualanOfflineScreen = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>(
    []
  );
  const [customerName, setCustomerName] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Tunai");
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Load products from dummy data
    setProducts(DUMMY_PRODUCTS);
    setFilteredProducts(DUMMY_PRODUCTS);
  }, []);

  useEffect(() => {
    const results = products.filter(
      (product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProducts(results);
  }, [searchTerm, products]);

  const handleAddProduct = (product: Product) => {
    if (product.stock <= 0) {
      Alert.alert("Error", "Stok produk tidak tersedia!");
      return;
    }

    const existingProductIndex = selectedProducts.findIndex(
      (p) => p.id === product.id
    );

    if (existingProductIndex >= 0) {
      const updatedProducts = [...selectedProducts];
      updatedProducts[existingProductIndex].qty += 1;
      updatedProducts[existingProductIndex].totalHarga =
        updatedProducts[existingProductIndex].qty * product.price;
      setSelectedProducts(updatedProducts);
    } else {
      setSelectedProducts([
        ...selectedProducts,
        {
          id: product.id,
          nama: product.name,
          harga: product.price,
          qty: 1,
          totalHarga: product.price,
          image: product.image,
        },
      ]);
    }

    // Update stock in products list
    const updatedProducts = products.map((p) =>
      p.id === product.id ? { ...p, stock: p.stock - 1 } : p
    );
    setProducts(updatedProducts);
  };

  const handleRemoveProduct = (productId: number) => {
    const productToRemove = selectedProducts.find((p) => p.id === productId);
    const updatedSelectedProducts = selectedProducts.filter(
      (p) => p.id !== productId
    );
    setSelectedProducts(updatedSelectedProducts);

    // Restore stock in products list
    if (productToRemove) {
      const updatedProducts = products.map((p) =>
        p.id === productId ? { ...p, stock: p.stock + productToRemove.qty } : p
      );
      setProducts(updatedProducts);
    }
  };

  const handleQuantityChange = (productId: number, newQty: number) => {
    if (newQty < 1) return;

    const productIndex = selectedProducts.findIndex((p) => p.id === productId);
    const product = selectedProducts[productIndex];
    const originalProduct = products.find((p) => p.id === productId);

    const qtyDifference = newQty - product.qty;

    if (!originalProduct || originalProduct.stock - qtyDifference < 0) {
      Alert.alert("Stok tidak mencukupi!");
      return;
    }

    const updatedSelectedProducts = [...selectedProducts];
    updatedSelectedProducts[productIndex] = {
      ...product,
      qty: newQty,
      totalHarga: newQty * product.harga,
    };
    setSelectedProducts(updatedSelectedProducts);

    // Update stock in products list
    const updatedProducts = products.map((p) =>
      p.id === productId ? { ...p, stock: p.stock - qtyDifference } : p
    );
    setProducts(updatedProducts);
  };

  const calculateTotal = () => {
    return selectedProducts.reduce(
      (sum, product) => sum + product.totalHarga,
      0
    );
  };

  const handleSubmit = async () => {
    if (selectedProducts.length === 0) {
      Alert.alert("Error", "Tambahkan minimal 1 produk!");
      return;
    }

    if (!customerName) {
      Alert.alert("Error", "Nama pelanggan harus diisi!");
      return;
    }

    setIsLoading(true);

    try {
      // Prepare transaction data
      const newTransaction = {
        tanggal: new Date().toISOString(),
        nama: customerName,
        alamat: customerAddress || "-",
        items: selectedProducts,
        total: calculateTotal(),
        status: "Selesai",
        metodePembayaran: paymentMethod,
        buktiPembayaran: "",
        type: "offline",
        createdAt: Date.now(),
      };

      // Save transaction to Firebase
      await saveTransaction(newTransaction);

      Alert.alert("Sukses", "Transaksi offline berhasil disimpan!");

      // Reset form
      setSelectedProducts([]);
      setCustomerName("");
      setCustomerAddress("");
      setPaymentMethod("Tunai");
    } catch (error) {
      console.error("Error saving transaction:", error);
      Alert.alert("Error", "Gagal menyimpan transaksi. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.contentContainer}>
          {/* Product Selection */}
          <View style={styles.productSelection}>
            <Text style={styles.sectionHeader}>Pilih Produk</Text>

            <TextInput
              style={styles.searchInput}
              placeholder="Cari produk..."
              value={searchTerm}
              onChangeText={setSearchTerm}
            />

            {/* Fixed height for product list with ScrollView */}
            <View style={styles.productListContainer}>
              <ScrollView style={styles.productList} nestedScrollEnabled={true}>
                {filteredProducts.map((product) => (
                  <View key={product.id} style={styles.productItem}>
                    <Image
                      source={{ uri: product.image }}
                      style={styles.productImage}
                    />
                    <View style={styles.productInfo}>
                      <Text style={styles.productName}>{product.name}</Text>
                      <Text style={styles.productCategory}>
                        {product.category}
                      </Text>
                      <Text style={styles.productPrice}>
                        Rp {product.price.toLocaleString("id-ID")}
                      </Text>
                      <Text
                        style={[
                          styles.productStock,
                          product.stock <= 0 && styles.outOfStock,
                        ]}
                      >
                        Stok: {product.stock}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleAddProduct(product)}
                      disabled={product.stock <= 0}
                      style={[
                        styles.addButton,
                        product.stock <= 0 && styles.disabledButton,
                      ]}
                    >
                      <Text style={styles.buttonText}>Tambah</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            </View>
          </View>

          {/* Transaction Summary */}
          <View style={styles.transactionSummary}>
            <Text style={styles.sectionHeader}>Ringkasan Transaksi</Text>

            <View>
              <Text style={styles.label}>Nama Pelanggan</Text>
              <TextInput
                style={styles.input}
                value={customerName}
                onChangeText={setCustomerName}
                placeholder="Masukkan nama pelanggan"
              />

              <Text style={styles.label}>Alamat (Opsional)</Text>
              <TextInput
                style={styles.input}
                value={customerAddress}
                onChangeText={setCustomerAddress}
                placeholder="Masukkan alamat (opsional)"
                multiline={true}
                numberOfLines={2}
              />

              <Text style={styles.label}>Metode Pembayaran</Text>
              <View style={styles.pickerContainer}>
                <TouchableOpacity
                  style={[
                    styles.paymentOption,
                    paymentMethod === "Tunai" && styles.selectedPayment,
                  ]}
                  onPress={() => setPaymentMethod("Tunai")}
                >
                  <Text>Tunai</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.paymentOption,
                    paymentMethod === "Transfer Bank" && styles.selectedPayment,
                  ]}
                  onPress={() => setPaymentMethod("Transfer Bank")}
                >
                  <Text>Transfer Bank</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.paymentOption,
                    paymentMethod === "Kartu Debit" && styles.selectedPayment,
                  ]}
                  onPress={() => setPaymentMethod("Kartu Debit")}
                >
                  <Text>Kartu Debit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.paymentOption,
                    paymentMethod === "Kartu Kredit" && styles.selectedPayment,
                  ]}
                  onPress={() => setPaymentMethod("Kartu Kredit")}
                >
                  <Text>Kartu Kredit</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.label}>Produk Dibeli</Text>
              {selectedProducts.length === 0 ? (
                <Text style={styles.emptyText}>Belum ada produk dipilih</Text>
              ) : (
                <View style={styles.selectedProductsContainer}>
                  <ScrollView
                    style={styles.selectedProductsList}
                    nestedScrollEnabled={true}
                  >
                    {selectedProducts.map((item) => (
                      <View key={item.id} style={styles.selectedProductItem}>
                        <Image
                          source={{ uri: item.image }}
                          style={styles.selectedProductImage}
                        />
                        <View style={styles.selectedProductInfo}>
                          <Text style={styles.selectedProductName}>
                            {item.nama}
                          </Text>
                          <View style={styles.quantityControl}>
                            <TouchableOpacity
                              onPress={() =>
                                handleQuantityChange(item.id, item.qty - 1)
                              }
                              style={styles.quantityButton}
                            >
                              <Text>-</Text>
                            </TouchableOpacity>
                            <Text style={styles.quantityText}>{item.qty}</Text>
                            <TouchableOpacity
                              onPress={() =>
                                handleQuantityChange(item.id, item.qty + 1)
                              }
                              style={styles.quantityButton}
                            >
                              <Text>+</Text>
                            </TouchableOpacity>
                            <Text style={styles.selectedProductPrice}>
                              Rp {item.totalHarga.toLocaleString("id-ID")}
                            </Text>
                          </View>
                        </View>
                        <TouchableOpacity
                          onPress={() => handleRemoveProduct(item.id)}
                          style={styles.deleteButton}
                        >
                          <Text style={styles.deleteButtonText}>×</Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                  </ScrollView>
                </View>
              )}

              <View style={styles.totalContainer}>
                <Text style={styles.totalLabel}>Total:</Text>
                <Text style={styles.totalAmount}>
                  Rp {calculateTotal().toLocaleString("id-ID")}
                </Text>
              </View>

              <TouchableOpacity
                style={[
                  styles.submitButton,
                  isLoading && styles.disabledButton,
                ]}
                onPress={handleSubmit}
                disabled={isLoading}
              >
                <Text style={styles.submitButtonText}>
                  {isLoading ? "Menyimpan..." : "Simpan Transaksi"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 16,
  },
  contentContainer: {
    flex: 1,
    flexDirection: "column",
  },
  productSelection: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  transactionSummary: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 16,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#333",
  },
  searchInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 4,
    padding: 10,
    marginBottom: 12,
  },
  productListContainer: {
    height: height * 0.35, // Use 35% of screen height
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 8,
  },
  productList: {
    flex: 1,
  },
  productItem: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    padding: 10,
  },
  productImage: {
    width: 64,
    height: 64,
    borderRadius: 4,
    marginRight: 8,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontWeight: "500",
    fontSize: 14,
  },
  productCategory: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  productPrice: {
    fontWeight: "bold",
    marginTop: 2,
    color: "#2980b9",
  },
  productStock: {
    fontSize: 12,
    marginTop: 2,
  },
  outOfStock: {
    color: "#e74c3c",
  },
  addButton: {
    backgroundColor: "#3498db",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  disabledButton: {
    backgroundColor: "#95a5a6",
  },
  buttonText: {
    color: "white",
    fontWeight: "500",
  },
  label: {
    fontWeight: "500",
    marginBottom: 4,
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 4,
    padding: 10,
    marginBottom: 12,
  },
  pickerContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 12,
  },
  paymentOption: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 4,
    padding: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedPayment: {
    backgroundColor: "#e3f2fd",
    borderColor: "#3498db",
  },
  emptyText: {
    color: "#999",
    fontStyle: "italic",
    marginBottom: 12,
    paddingVertical: 8,
  },
  selectedProductsContainer: {
    height: 150,
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 8,
    marginBottom: 12,
  },
  selectedProductsList: {
    flex: 1,
  },
  selectedProductItem: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    padding: 8,
  },
  selectedProductImage: {
    width: 48,
    height: 48,
    borderRadius: 4,
    marginRight: 8,
  },
  selectedProductInfo: {
    flex: 1,
  },
  selectedProductName: {
    fontWeight: "500",
    fontSize: 14,
  },
  quantityControl: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  quantityButton: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 4,
    width: 28,
    height: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  quantityText: {
    marginHorizontal: 8,
    minWidth: 20,
    textAlign: "center",
  },
  selectedProductPrice: {
    marginLeft: "auto",
    fontWeight: "bold",
    color: "#2980b9",
  },
  deleteButton: {
    marginLeft: 8,
    width: 28,
    height: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  deleteButtonText: {
    fontSize: 18,
    color: "#e74c3c",
  },
  totalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 12,
    marginBottom: 16,
  },
  totalLabel: {
    fontWeight: "bold",
    fontSize: 16,
  },
  totalAmount: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#2980b9",
  },
  submitButton: {
    backgroundColor: "#2ecc71",
    padding: 12,
    borderRadius: 4,
    alignItems: "center",
  },
  submitButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});
