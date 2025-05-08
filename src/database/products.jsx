// import { ref, get } from "@firebase/database";
// import { db } from "../../firebase";

// // Fungsi untuk membaca produk berdasarkan ID
// export const getProductById = (productId) => {
//   const productRef = ref(db, "products/" + productId);
//   get(productRef)
//     .then((snapshot) => {
//       if (snapshot.exists()) {
//         console.log("Product data:", snapshot.val());
//       } else {
//         console.log("No product found with ID:", productId);
//       }
//     })
//     .catch((error) => {
//       console.error("Error getting product:", error);
//     });
// };

// // Fungsi untuk membaca semua produk
// export const getAllProducts = async () => {
//   const productsRef = ref(db, "products/");
//   try {
//     const snapshot = await get(productsRef); // Menunggu hasil pengambilan data
//     if (snapshot.exists()) {
//       return snapshot.val(); // Mengembalikan data produk jika ada
//     } else {
//       console.log("No products found");
//       return []; // Mengembalikan array kosong jika tidak ada data produk
//     }
//   } catch (error) {
//     console.error("Error getting products:", error);
//     return []; // Mengembalikan array kosong jika terjadi error
//   }
// };
