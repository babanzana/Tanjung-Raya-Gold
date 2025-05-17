// Firebase.js
import { getApp, getApps, initializeApp } from "@firebase/app";
import {
  getDatabase,
  ref,
  set,
  get,
  update,
  push,
  remove,
  query,
  orderByChild,
  startAt,
  endAt,
} from "@firebase/database";
import {
  getAuth,
  initializeAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  getReactNativePersistence,
} from "@firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
// import { DUMMY_PRODUCTS } from "./src/dummy";

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyDGuOVia0SMTQ0L7s_zaW2dx3WYEQ5vS5I",
  authDomain: "tanjung-raya-5af26.firebaseapp.com",
  databaseURL:
    "https://tanjung-raya-5af26-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "tanjung-raya-5af26",
  storageBucket: "tanjung-raya-5af26.appspot.com",
  messagingSenderId: "717343338971",
  appId: "1:717343338971:web:524e5f3e55d200d4b9f7fe",
  measurementId: "G-SGDLKS5TPF",
};

// Initialize Firebase App
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

// Initialize Firebase Auth with persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

// Initialize Database
const db = getDatabase(app);

// Exporting firebase services (auth and db)
export { db, auth };

// Firebase Helper Functions
export const getCurrentUser = () => {
  return auth.currentUser;
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    return { success: false, error: "Logout failed" };
  }
};

export const registerUser = async (fullName, email, phoneNumber, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    await set(ref(db, "users/" + userCredential.user.uid), {
      fullName,
      email,
      phoneNumber,
      createdAt: new Date().toISOString(),
    });
    return { success: true, user: userCredential.user };
  } catch (error) {
    let errorMessage = "Registration failed";
    switch (error.code) {
      case "auth/email-already-in-use":
        errorMessage = "Email is already in use";
        break;
      case "auth/invalid-email":
        errorMessage = "Invalid email format";
        break;
      case "auth/weak-password":
        errorMessage = "Password should be at least 6 characters";
        break;
      default:
        errorMessage = "An error occurred";
        break;
    }
    return { success: false, error: errorMessage };
  }
};

export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    return { success: true, user: userCredential.user };
  } catch (error) {
    let errorMessage = "Login failed";
    switch (error.code) {
      case "auth/invalid-email":
        errorMessage = "Invalid email format";
        break;
      case "auth/user-not-found":
      case "auth/wrong-password":
        errorMessage = "Invalid email or password";
        break;
      case "auth/too-many-requests":
        errorMessage =
          "Too many failed attempts. Account temporarily disabled.";
        break;
      default:
        errorMessage = "An error occurred";
        break;
    }
    return { success: false, error: errorMessage };
  }
};

export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error) {
    let errorMessage = "Failed to send reset email";
    switch (error.code) {
      case "auth/invalid-email":
        errorMessage = "Invalid email format";
        break;
      case "auth/user-not-found":
        errorMessage = "No account found with this email";
        break;
      default:
        errorMessage = "An error occurred";
        break;
    }
    return { success: false, error: errorMessage };
  }
};

// Function to save product data
export const saveProduct = async (product) => {
  try {
    const productRef = ref(db, `products/${product.id}`);
    await set(productRef, product);
    return { success: true };
  } catch (error) {
    console.error("Firebase save error:", error);
    return { success: false, error };
  }
};

// Function to retrieve user data
export const getUserData = async (userId) => {
  try {
    const userRef = ref(db, `users/${userId}`);
    const snapshot = await get(userRef);

    if (snapshot.exists()) {
      return { success: true, data: snapshot.val() };
    } else {
      return { success: false, error: "User data not found" };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const addInitialProducts = () => {
  const productsRef = ref(db, "products");

  DUMMY_PRODUCTS.forEach((product) => {
    set(ref(db, "products/" + product.id), product)
      .then(() => {
        console.log("Product added:", product.name);
      })
      .catch((error) => {
        console.error("Error adding product:", error);
      });
  });
};

// Fungsi untuk membaca produk berdasarkan ID
export const getProductById = (productId) => {
  const productRef = ref(db, "products/" + productId);
  get(productRef)
    .then((snapshot) => {
      if (snapshot.exists()) {
        console.log("Product data:", snapshot.val());
      } else {
        console.log("No product found with ID:", productId);
      }
    })
    .catch((error) => {
      console.error("Error getting product:", error);
    });
};

// Fungsi untuk membaca semua produk
export const getAllProducts = async () => {
  const productsRef = ref(db, "products/");
  try {
    const snapshot = await get(productsRef); // Menunggu hasil pengambilan data
    if (snapshot.exists()) {
      return snapshot.val(); // Mengembalikan data produk jika ada
    } else {
      console.log("No products found");
      return []; // Mengembalikan array kosong jika tidak ada data produk
    }
  } catch (error) {
    console.error("Error getting products:", error);
    return []; // Mengembalikan array kosong jika terjadi error
  }
};

// Add Item To Cart
// import { ref, set, get, update } from "@firebase/database";

/**
 * Menambahkan item ke keranjang atau menambah quantity jika sudah ada
 * @param {string} userId - ID user yang memiliki keranjang
 * @param {object} product - Produk yang akan ditambahkan
 * @param {number} quantity - Jumlah yang akan ditambahkan (default 1)
 */
export const addToCart = async (userId, product, quantity = 1) => {
  try {
    // Referensi ke cart item di database
    const cartItemRef = ref(db, `users/${userId}/cart/${product.id}`);

    // Cek apakah item sudah ada di keranjang
    const snapshot = await get(cartItemRef);

    if (snapshot.exists()) {
      // Jika item sudah ada, update quantity
      const currentItem = snapshot.val();
      const newQuantity = currentItem.quantity + quantity;

      // Pastikan tidak melebihi stok
      const updatedQuantity = Math.min(newQuantity, product.stock);

      await update(cartItemRef, {
        quantity: updatedQuantity,
        updatedAt: Date.now(),
      });
    } else {
      // Jika item belum ada, buat baru
      const cartItem = {
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: Math.min(quantity, product.stock), // Pastikan tidak melebihi stok
        image: product.image,
        category: product.category,
        stock: product.stock,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      await set(cartItemRef, cartItem);
    }

    return { success: true };
  } catch (error) {
    console.error("Error adding to cart:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Mendapatkan semua item di keranjang user
 * @param {string} userId - ID user
 */
export const getCartItems = async (userId) => {
  try {
    const cartRef = ref(db, `users/${userId}/cart`);
    const snapshot = await get(cartRef);

    if (snapshot.exists()) {
      return Object.values(snapshot.val());
    }

    return [];
  } catch (error) {
    console.error("Error getting cart items:", error);
    return [];
  }
};

/**
 * Mengupdate quantity item di keranjang
 * @param {string} userId - ID user
 * @param {string} itemId - ID item
 * @param {number} newQuantity - Quantity baru
 */
export const updateCartItemQuantity = async (userId, itemId, newQuantity) => {
  try {
    const cartItemRef = ref(db, `users/${userId}/cart/${itemId}`);
    const snapshot = await get(cartItemRef);

    if (snapshot.exists()) {
      const item = snapshot.val();
      // Pastikan quantity tidak melebihi stok dan minimal 1
      const validatedQuantity = Math.max(1, Math.min(newQuantity, item.stock));

      await update(cartItemRef, {
        quantity: validatedQuantity,
        updatedAt: Date.now(),
      });

      return { success: true };
    }

    return { success: false, error: "Item not found in cart" };
  } catch (error) {
    console.error("Error updating cart item:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Menghapus item dari keranjang
 * @param {string} userId - ID user
 * @param {string} itemId - ID item
 */
export const removeFromCart = async (userId, itemId) => {
  try {
    const cartItemRef = ref(db, `users/${userId}/cart/${itemId}`);
    await set(cartItemRef, null);
    return { success: true };
  } catch (error) {
    console.error("Error removing from cart:", error);
    return { success: false, error: error.message };
  }
};

export const updateProductStock = async (productId, quantityPurchased) => {
  try {
    const productRef = ref(db, `products/${productId}`);
    const snapshot = await get(productRef);

    if (snapshot.exists()) {
      const product = snapshot.val();
      const updatedStock = Math.max(0, product.stock - quantityPurchased); // Prevent stock from going negative

      await update(productRef, { stock: updatedStock });
      return { success: true };
    } else {
      return { success: false, error: "Product not found" };
    }
  } catch (error) {
    console.error("Error updating product stock:", error);
    return { success: false, error: error.message };
  }
};

export const addTransactionHistory = async (userId, transactionDetails) => {
  try {
    const transactionRef = ref(db, `users/${userId}/transactions`);
    const newTransactionRef = push(transactionRef);

    // Format products to match dummy structure
    const formattedItems = transactionDetails.products.map((product) => ({
      id: product.id,
      nama: product.name,
      harga: product.price,
      qty: product.quantity,
      totalHarga: product.price * product.quantity,
      image: product.image,
      category: product.category, // Added category to match your cartItems structure
    }));

    const transactionData = {
      id: newTransactionRef.key,
      tanggal: new Date().toISOString(),
      nama: transactionDetails.customerName,
      alamat: transactionDetails.address,
      items: formattedItems,
      total: transactionDetails.total,
      status: "Pending", // Default status
      metodePembayaran: transactionDetails.paymentMethod,
      buktiPembayaran: transactionDetails.paymentProof,
      notes: transactionDetails.notes || "",
      createdAt: Date.now(), // Added timestamp for sorting
    };

    await set(newTransactionRef, transactionData);

    // Clear user's cart
    const cartRef = ref(db, `users/${userId}/cart`);
    await set(cartRef, {});

    return {
      success: true,
      transactionId: newTransactionRef.key,
      transactionData: transactionData,
    };
  } catch (error) {
    console.error("Error in transaction process:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Firebase.js

export const getTransactionHistory = async (userId) => {
  try {
    const transactionsRef = ref(db, `users/${userId}/transactions`);
    const snapshot = await get(transactionsRef);

    if (snapshot.exists()) {
      const transactions = snapshot.val();
      // Convert object to array if needed
      const transactionsArray = Object.keys(transactions).map((key) => ({
        id: key,
        ...transactions[key],
      }));
      return { success: true, data: transactionsArray };
    } else {
      return { success: false, error: "No transactions found" };
    }
  } catch (error) {
    console.error("Error getting transaction history:", error);
    return { success: false, error: error.message };
  }
};

// Ambil semua transaksi yang diurutkan berdasarkan tanggal
export const getAllTransactionHistory = async () => {
  try {
    const transactionsRef = ref(db, "transactions");
    const snapshot = await get(query(transactionsRef, orderByChild("tanggal")));

    if (!snapshot.exists()) {
      // Coba path alternatif jika data tidak ditemukan
      const usersRef = ref(db, "users");
      const usersSnapshot = await get(usersRef);

      if (!usersSnapshot.exists()) {
        return { success: false, error: "No transactions found" };
      }

      // Kumpulkan semua transaksi dari semua user
      const allTransactions = [];
      const users = usersSnapshot.val();

      for (const userId in users) {
        if (users[userId].transactions) {
          const userTransactions = users[userId].transactions;
          for (const transactionId in userTransactions) {
            allTransactions.push({
              id: transactionId,
              userId: userId, // Tambahkan userId untuk referensi
              ...userTransactions[transactionId],
            });
          }
        }
      }

      // Urutkan berdasarkan tanggal (terbaru pertama)
      const sortedTransactions = allTransactions.sort(
        (a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime()
      );

      return {
        success: true,
        data: sortedTransactions,
        message: `Found ${sortedTransactions.length} transactions from users data`,
      };
    }

    // Jika data ditemukan di root /transactions
    const transactions = snapshot.val();
    const transactionsArray = Object.keys(transactions)
      .map((key) => ({
        id: key,
        ...transactions[key],
      }))
      .reverse();

    return { success: true, data: transactionsArray };
  } catch (error) {
    console.error("Error getting transaction history:", error);
    return {
      success: false,
      error: error.message,
      fullError: error, // Untuk debugging
    };
  }
};

// Mendapatkan referensi wishlist user
const getUserWishlistRef = () => {
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error("User not authenticated");
  return ref(db, `wishlists/${userId}`);
};

// Mendapatkan referensi item spesifik dalam wishlist
const getWishlistItemRef = (itemId) => {
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error("User not authenticated");
  return ref(db, `wishlists/${userId}/${itemId}`);
};

// Menambahkan item ke wishlist
export const addToWishlist = async (product) => {
  try {
    const wishlistRef = getUserWishlistRef();
    const newItemRef = push(wishlistRef);

    const newItem = {
      ...product,
      id: newItemRef.key,
      addedAt: Date.now(),
    };

    await set(newItemRef, newItem);
    return newItem;
  } catch (error) {
    console.error("Error adding to wishlist:", error);
    throw error;
  }
};

// Mengupdate item di wishlist
export const updateWishlistItem = async (itemId, updates) => {
  try {
    const itemRef = getWishlistItemRef(itemId);
    await update(itemRef, updates);
  } catch (error) {
    console.error("Error updating wishlist item:", error);
    throw error;
  }
};

// Menghapus item dari wishlist
export const removeFromWishlistFirebase = async (itemId) => {
  try {
    const itemRef = getWishlistItemRef(itemId);
    await remove(itemRef);
  } catch (error) {
    console.error("Error removing from wishlist:", error);
    throw error;
  }
};

// Mendapatkan semua item wishlist user
export const getUserWishlist = async () => {
  try {
    const wishlistRef = getUserWishlistRef();
    const snapshot = await get(wishlistRef);

    if (snapshot.exists()) {
      const wishlistData = snapshot.val();
      return Object.keys(wishlistData).map((key) => ({
        ...wishlistData[key],
        id: key,
      }));
    }

    return [];
  } catch (error) {
    console.error("Error getting wishlist:", error);
    throw error;
  }
};

// Memeriksa apakah produk sudah ada di wishlist
export const isProductInWishlist = async (productId) => {
  try {
    const wishlist = await getUserWishlist();
    return wishlist.some((item) => item.productId === productId);
  } catch (error) {
    console.error("Error checking wishlist:", error);
    throw error;
  }
};

// Updated Dashboard Data Function
export const getDashboardData = async (startDate, endDate) => {
  try {
    // Convert dates to timestamps for comparison
    const startTimestamp = new Date(startDate).getTime();
    const endTimestamp = new Date(endDate).getTime();

    // Get all transactions from all users (since transactions are stored per user)
    const usersRef = ref(db, "users");
    const usersSnapshot = await get(usersRef);

    if (!usersSnapshot.exists()) {
      return {
        success: true,
        data: [],
        stats: getEmptyStats(),
        message: "No user data found",
      };
    }

    // Collect all transactions from all users
    const allTransactions = [];
    const users = usersSnapshot.val();

    for (const userId in users) {
      if (users[userId].transactions) {
        const userTransactions = users[userId].transactions;
        for (const transactionId in userTransactions) {
          const transaction = userTransactions[transactionId];

          // Only include transactions within date range
          // Handle different date formats (ISO string or timestamp)
          let transactionTimestamp;
          if (transaction.createdAt) {
            // If createdAt exists, use it directly (it's already a timestamp)
            transactionTimestamp = transaction.createdAt;
          } else {
            // Otherwise use tanggal and convert if it's an ISO string
            transactionTimestamp =
              typeof transaction.tanggal === "string"
                ? new Date(transaction.tanggal).getTime()
                : transaction.tanggal;
          }

          if (
            transactionTimestamp >= startTimestamp &&
            transactionTimestamp <= endTimestamp
          ) {
            allTransactions.push({
              id: transactionId,
              userId: userId,
              ...transaction,
            });
          }
        }
      }
    }

    // Sort transactions by date (newest first)
    const sortedTransactions = allTransactions.sort((a, b) => {
      const aTime = a.createdAt || new Date(a.tanggal).getTime();
      const bTime = b.createdAt || new Date(b.tanggal).getTime();
      return bTime - aTime;
    });

    return {
      success: true,
      data: sortedTransactions,
      stats: calculateDashboardStats(sortedTransactions),
      count: sortedTransactions.length,
      dateRange: {
        start: new Date(startDate).toISOString(),
        end: new Date(endDate).toISOString(),
      },
    };
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return {
      success: false,
      error: error.message || "Terjadi kesalahan saat mengambil data",
      data: [],
      stats: getEmptyStats(),
    };
  }
};

// Enhanced calculateDashboardStats function for better insights
const calculateDashboardStats = (transactions) => {
  // Total sales
  const totalSales = transactions.reduce(
    (sum, transaction) => sum + (transaction.total || 0),
    0
  );

  // Total transactions
  const totalTransactions = transactions.length;

  // Payment method statistics - handle both metodePembayaran and paymentMethod
  const paymentMethodStats = {
    "Transfer Bank": 0,
    "Kartu Kredit": 0,
    Tunai: 0,
    "Kartu Debit": 0,
    Other: 0, // Catch-all for unrecognized methods
  };

  transactions.forEach((transaction) => {
    // Handle different property names
    const method =
      transaction.metodePembayaran || transaction.paymentMethod || "Other";

    if (paymentMethodStats.hasOwnProperty(method)) {
      paymentMethodStats[method] += transaction.total || 0;
    } else {
      paymentMethodStats["Other"] += transaction.total || 0;
    }
  });

  // Calculate average transaction value
  const averageTransactionValue =
    totalTransactions > 0 ? totalSales / totalTransactions : 0;

  // Transactions by date - improved to handle various date formats
  const transactionsByDate = {};
  transactions.forEach((transaction) => {
    // Try to extract date from different fields
    let dateStr;
    if (transaction.tanggal) {
      dateStr = new Date(transaction.tanggal).toISOString().split("T")[0];
    } else if (transaction.createdAt) {
      dateStr = new Date(transaction.createdAt).toISOString().split("T")[0];
    } else {
      // Use current date as fallback for data integrity
      dateStr = new Date().toISOString().split("T")[0];
    }

    if (!transactionsByDate[dateStr]) {
      transactionsByDate[dateStr] = {
        count: 0,
        total: 0,
      };
    }
    transactionsByDate[dateStr].count += 1;
    transactionsByDate[dateStr].total += transaction.total || 0;
  });

  // Calculate product categories distribution
  const categoryStats = {};
  transactions.forEach((transaction) => {
    const items = transaction.items || transaction.products || [];
    if (Array.isArray(items)) {
      items.forEach((item) => {
        const category = item.category || "Uncategorized";
        if (!categoryStats[category]) {
          categoryStats[category] = {
            totalSold: 0,
            totalRevenue: 0,
          };
        }
        categoryStats[category].totalSold += item.qty || item.quantity || 1;
        categoryStats[category].totalRevenue +=
          item.totalHarga || item.price * (item.qty || item.quantity || 1) || 0;
      });
    }
  });

  // Convert dates object to array for easier charting
  const salesByDateArray = Object.keys(transactionsByDate)
    .map((date) => ({
      date,
      count: transactionsByDate[date].count,
      total: transactionsByDate[date].total,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return {
    totalSales,
    totalTransactions,
    averageTransactionValue,
    paymentMethodStats,
    transactionsByDate,
    salesByDateArray,
    categoryStats,
  };
};

// Improved Top Products function with sales data from transactions
export const getTopProducts = async (limit = 5) => {
  try {
    // First get all transactions to calculate product sales
    const transactionsResult = await getAllTransactionHistory();

    if (!transactionsResult.success) {
      throw new Error(transactionsResult.error);
    }

    // Calculate product sales from transactions
    const productSales = {};
    transactionsResult.data.forEach((transaction) => {
      // Handle both "items" and "products" keys since your code has both
      const items = transaction.items || transaction.products || [];

      if (Array.isArray(items)) {
        items.forEach((item) => {
          // Handle different property names in items
          const productId = item.id || item.productId;
          const productName = item.nama || item.name;
          const quantity = item.qty || item.quantity || 1;
          const price = item.harga || item.price || 0;
          const totalPrice = item.totalHarga || price * quantity;

          if (!productId) return; // Skip items without ID

          if (!productSales[productId]) {
            productSales[productId] = {
              id: productId,
              name: productName,
              totalSold: 0,
              totalRevenue: 0,
              transactions: 0,
            };
          }

          productSales[productId].totalSold += quantity;
          productSales[productId].totalRevenue += totalPrice;
          productSales[productId].transactions += 1;
        });
      }
    });

    // Convert to array and sort by quantity sold
    const sortedProducts = Object.values(productSales).sort(
      (a, b) => b.totalSold - a.totalSold
    );

    // Get additional product details if needed
    const productsRef = ref(db, "products");
    const productsSnapshot = await get(productsRef);

    if (productsSnapshot.exists()) {
      const productsData = productsSnapshot.val();

      // Enhance product sales data with additional product details
      sortedProducts.forEach((product) => {
        if (productsData[product.id]) {
          product.image = productsData[product.id].image;
          product.price = productsData[product.id].price;
          product.category = productsData[product.id].category;
          product.stock = productsData[product.id].stock;
          product.avgPricePerItem = product.totalRevenue / product.totalSold;
        }
      });
    }

    // Include current product data for those without sales
    if (productsSnapshot.exists() && sortedProducts.length < limit) {
      const productsData = productsSnapshot.val();
      const productIds = sortedProducts.map((p) => p.id);

      // Add products without sales
      Object.keys(productsData).forEach((productId) => {
        if (!productIds.includes(productId)) {
          sortedProducts.push({
            id: productId,
            name: productsData[productId].name,
            totalSold: 0,
            totalRevenue: 0,
            transactions: 0,
            image: productsData[productId].image,
            price: productsData[productId].price,
            category: productsData[productId].category,
            stock: productsData[productId].stock,
          });
        }
      });
    }

    return {
      success: true,
      data: sortedProducts.slice(0, limit),
      totalProducts: sortedProducts.length,
    };
  } catch (error) {
    console.error("Error fetching top products:", error);
    return {
      success: false,
      error: error.message || "Error fetching top products",
      data: [],
    };
  }
};
