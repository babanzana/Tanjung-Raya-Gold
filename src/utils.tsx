export function formatPrice(price: any) {
  console.log("Received price:", price); // Log nilai price
  const parsedPrice = parseFloat(price);
  if (isNaN(parsedPrice)) {
    return "Rp 0";
  }

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(parsedPrice);
}
