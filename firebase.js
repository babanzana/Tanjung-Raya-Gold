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
