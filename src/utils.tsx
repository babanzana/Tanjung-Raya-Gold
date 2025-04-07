// Fungsi formatPrice harus didefinisikan di luar komponen jika digunakan di kedua screen
export function formatPrice(price: any) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);
}
