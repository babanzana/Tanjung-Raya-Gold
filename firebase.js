// Firebase.js
import { getApp, getApps, initializeApp } from "@firebase/app";
import { getDatabase, ref, set, get } from "@firebase/database";
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

// Fungsi untuk mendapatkan current user
export const getCurrentUser = () => {
  return auth.currentUser;
};

// Fungsi untuk logout
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
    if (error.code === "auth/email-already-in-use") {
      errorMessage = "Email is already in use";
    } else if (error.code === "auth/invalid-email") {
      errorMessage = "Invalid email format";
    } else if (error.code === "auth/weak-password") {
      errorMessage = "Password should be at least 6 characters";
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
    if (error.code === "auth/invalid-email") {
      errorMessage = "Invalid email format";
    } else if (
      error.code === "auth/user-not-found" ||
      error.code === "auth/wrong-password"
    ) {
      errorMessage = "Invalid email or password";
    } else if (error.code === "auth/too-many-requests") {
      errorMessage = "Too many failed attempts. Account temporarily disabled.";
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
    if (error.code === "auth/invalid-email") {
      errorMessage = "Invalid email format";
    } else if (error.code === "auth/user-not-found") {
      errorMessage = "No account found with this email";
    }
    return { success: false, error: errorMessage };
  }
};

// Fungsi untuk menambahkan produk awal
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

// Ekspor auth dan db
export { db, auth };

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