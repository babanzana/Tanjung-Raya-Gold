export const DUMMY_USERS = [
  {
    users: [
      {
        id: 1,
        nama: "Sinta Azzahra",
        username: "sinta_azzahra",
        password: "password123",
        email: "sinta.azzahra@example.com",
        roles: "user",
        alamat: "Jl. Melati No. 10, Bogor",
        imageUrl:
          "https://static.vecteezy.com/system/resources/thumbnails/007/209/020/small_2x/close-up-shot-of-happy-dark-skinned-afro-american-woman-laughs-positively-being-in-good-mood-dressed-in-black-casual-clothes-isolated-on-grey-background-human-emotions-and-feeligs-concept-photo.jpg",
      },
      {
        id: 2,
        nama: "Dodi Kurniawan",
        username: "dodi_kurniawan",
        password: "password456",
        email: "dodi.kurniawan@example.com",
        roles: "user",
        alamat: "Jl. Anggrek No. 15, Jakarta",
        imageUrl:
          "https://t3.ftcdn.net/jpg/01/86/34/08/360_F_186340800_qlgVLkKLVy19r6SEL7RnniP1Yz6dmq8T.jpg",
      },
      {
        id: 3,
        nama: "Admin Satu",
        username: "admin1",
        password: "adminpass1",
        email: "admin1@example.com",
        roles: "admin",
        alamat: "Jl. Mawar No. 20, Bandung",
        imageUrl:
          "data:image/png;base64,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",
      },
      {
        id: 4,
        nama: "Rina Putri",
        username: "rina_putri",
        password: "password789",
        email: "rina.putri@example.com",
        roles: "user",
        alamat: "Jl. Kenanga No. 5, Depok",
        imageUrl:
          "data:image/png;base64,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",
      },
      {
        id: 5,
        nama: "Admin Dua",
        username: "admin2",
        password: "adminpass2",
        email: "admin2@example.com",
        roles: "admin",
        alamat: "Jl. Dahlia No. 25, Surabaya",
        imageUrl:
          "data:image/png;base64,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",
      },
    ],
  },
];

export const DUMMY_PRODUCTS = [
  {
    id: 1,
    name: "Emas Batangan 1 Gram",
    category: "Batangan",
    price: 985000,
    stock: 15,
    rating: 4.8,
    image:
      "https://www.logammulia.com/uploads/ngc_master_item/5cdcae8ad46b6_20190516072754-2.jpg",
    description:
      "Emas batangan murni 24 karat dengan berat 1 gram. Produk resmi dari PT Antam.",
  },
  {
    id: 2,
    name: "Emas Batangan 5 Gram",
    category: "Batangan",
    price: 4925000,
    stock: 8,
    rating: 4.9,
    image:
      "https://id-test-11.slatic.net/p/1b54e51d9dd5f7e02d6567192bc0f19e.jpg",
    description:
      "Emas batangan murni 24 karat dengan berat 5 gram. Dilengkapi sertifikat keaslian.",
  },
  {
    id: 3,
    name: "Emas Batangan 10 Gram",
    category: "Batangan",
    price: 9850000,
    stock: 5,
    rating: 5.0,
    image:
      "https://www.static-src.com/wcsstore/Indraprastha/images/catalog/full//108/MTA-7797816/antam_logam_mulia_10_gram_-_lm_antam_-_emas_batangan_kepingan_10_gram_full04_ljmxa0kq.jpg",
    description:
      "Emas batangan ukuran 10 gram dengan kemasan eksklusif. Cocok untuk investasi jangka panjang.",
  },
  {
    id: 4,
    name: "Kalung Emas 18K",
    category: "Perhiasan",
    price: 3500000,
    stock: 12,
    rating: 4.5,
    image:
      "https://images.tokopedia.net/img/cache/500-square/VqbcmM/2023/1/3/b7696a69-2c1d-4ce2-919e-a58f6d1594de.jpg",
    description: "Kalung emas 18 karat dengan desain modern dan elegan.",
  },
  {
    id: 5,
    name: "Cincin Emas Timbang",
    category: "Perhiasan",
    price: 2500000,
    stock: 20,
    rating: 4.3,
    image:
      "https://ae01.alicdn.com/kf/S4fd67873da7642e1a64984397b4091a9r.jpg_640x640q90.jpg",
    description:
      "Cincin emas timbang dengan berbagai ukuran tersedia. Bisa custom desain.",
  },
  {
    id: 6,
    name: "Gelang Emas 22K",
    category: "Perhiasan",
    price: 4200000,
    stock: 7,
    rating: 4.7,
    image: "https://ae01.alicdn.com/kf/Se091cd8131e2478d8458ac482c4f596aU.jpg",
    description:
      "Gelang emas 22 karat dengan ukiran tradisional. Berat sekitar 8 gram.",
  },
  {
    id: 7,
    name: "Liontin Emas",
    category: "Perhiasan",
    price: 1800000,
    stock: 14,
    rating: 4.2,
    image:
      "https://tokoperhiasan.co.id/assets/front/images/product/thumb/Liontin-emas-bentuk-hati-aksen-segtiga-mata-cubic-zirconia.webp",
    description:
      "Liontin emas dengan pilihan motif yang beragam. Berat sekitar 3 gram.",
  },
  {
    id: 8,
    name: "Emas Koin 0.2 Gram",
    category: "Koin",
    price: 500000,
    stock: 25,
    rating: 4.6,
    image:
      "https://www.static-src.com/wcsstore/Indraprastha/images/catalog/full//catalog-image/108/MTA-150699626/idn_bulion_citraperkasa_idn_bulion_angpao_naga_koin_emas_logam_mulia_-0-2_g_-_24k_-_999-9_gold-_full09_isgvag1j.jpg",
    description: "Koin emas setengah gram dengan gambar khusus edisi terbatas.",
  },
  {
    id: 9,
    name: "Emas Koin 0.5 Gram",
    category: "Koin",
    price: 990000,
    stock: 18,
    rating: 4.7,
    image:
      "https://images.tokopedia.net/img/cache/700/VqbcmM/2021/2/13/04829d0c-a545-40c7-a88d-7f688b136c51.jpg",
    description:
      "Koin emas 1 gram dengan kemasan eksklusif. Nilai investasi yang stabil.",
  },
  {
    id: 10,
    name: "Emas Koin 2 Gram",
    category: "Koin",
    price: 2475000,
    stock: 9,
    rating: 4.9,
    image:
      "https://www.static-src.com/wcsstore/Indraprastha/images/catalog/full//104/MTA-8727917/annacraft_annacraft_idn_monas_koin_emas_logam_mulia_-2-0_g_-_999-9-_fine_gold-_jabodetabek_full01_kh5h1dux.jpg",
    description:
      "Koin emas 2.5 gram dengan sertifikat keaslian. Cocok untuk hadiah.",
  },
];

export const DUMMY_CARTITEMS = [
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
    rating: 4.6,
    image:
      "https://www.static-src.com/wcsstore/Indraprastha/images/catalog/full//catalog-image/108/MTA-150699626/idn_bulion_citraperkasa_idn_bulion_angpao_naga_koin_emas_logam_mulia_-0-2_g_-_24k_-_999-9_gold-_full09_isgvag1j.jpg",
    description: "Koin emas setengah gram dengan gambar khusus edisi terbatas.",
  },
  {
    id: 9,
    name: "Emas Koin 0.5 Gram",
    category: "Koin",
    price: 990000,
    quantity: 3,
    stock: 18,
    rating: 4.7,
    image:
      "https://images.tokopedia.net/img/cache/700/VqbcmM/2021/2/13/04829d0c-a545-40c7-a88d-7f688b136c51.jpg",
    description:
      "Koin emas 1 gram dengan kemasan eksklusif. Nilai investasi yang stabil.",
  },
];

export const DUMMY_TRANSACTION = [
  {
    id: 1,
    tanggal: "2025-04-10T12:00:00Z",
    nama: "John Doe",
    alamat: "Jl. Sudirman Kav. 21, Jakarta",
    items: [
      {
        id: 1,
        nama: "Emas Batangan 1 Gram",
        harga: 985000,
        qty: 2,
        totalHarga: 1970000,
        image:
          "https://www.logammulia.com/uploads/ngc_master_item/5cdcae8ad46b6_20190516072754-2.jpg",
      },
      {
        id: 4,
        nama: "Kalung Emas 18K",
        harga: 3500000,
        qty: 1,
        totalHarga: 3500000,
        image:
          "https://images.tokopedia.net/img/cache/500-square/VqbcmM/2023/1/3/b7696a69-2c1d-4ce2-919e-a58f6d1594de.jpg",
      },
    ],
    total: 5470000,
    status: "Selesai",
    metodePembayaran: "Transfer Bank",
    buktiPembayaran:
      "https://mediakonsumen.com/files/2024/10/Screenshot_20240920-030802-3.jpg",
  },
  {
    id: 2,
    tanggal: "2025-04-11T15:30:00Z",
    nama: "Jane Smith",
    alamat: "Jl. Sudirman Kav. 21, Jakarta",
    items: [
      {
        id: 2,
        nama: "Emas Batangan 5 Gram",
        harga: 4925000,
        qty: 1,
        totalHarga: 4925000,
        image:
          "https://id-test-11.slatic.net/p/1b54e51d9dd5f7e02d6567192bc0f19e.jpg",
      },
      {
        id: 6,
        nama: "Gelang Emas 22K",
        harga: 4200000,
        qty: 1,
        totalHarga: 4200000,
        image:
          "https://ae01.alicdn.com/kf/Se091cd8131e2478d8458ac482c4f596aU.jpg",
      },
    ],
    total: 9125000,
    status: "Selesai",
    metodePembayaran: "Kartu Kredit",
    buktiPembayaran:
      "https://mediakonsumen.com/files/2024/10/Screenshot_20240920-030802-3.jpg",
  },
  {
    id: 3,
    tanggal: "2025-04-12T10:45:00Z",
    nama: "Michael Johnson",
    alamat: "Jl. Sudirman Kav. 21, Jakarta",
    items: [
      {
        id: 8,
        nama: "Emas Koin 0.2 Gram",
        harga: 500000,
        qty: 5,
        totalHarga: 2500000,
        image:
          "https://www.static-src.com/wcsstore/Indraprastha/images/catalog/full//catalog-image/108/MTA-150699626/idn_bulion_citraperkasa_idn_bulion_angpao_naga_koin_emas_logam_mulia_-0-2_g_-_24k_-_999-9_gold-_full09_isgvag1j.jpg",
      },
    ],
    total: 2500000,
    status: "Selesai",
    metodePembayaran: "Tunai",
    buktiPembayaran:
      "https://mediakonsumen.com/files/2024/10/Screenshot_20240920-030802-3.jpg",
  },
  {
    id: 4,
    tanggal: "2025-04-13T14:00:00Z",
    nama: "Alice Williams",
    alamat: "Jl. Sudirman Kav. 21, Jakarta",
    items: [
      {
        id: 9,
        nama: "Emas Koin 0.5 Gram",
        harga: 990000,
        qty: 3,
        totalHarga: 2970000,
        image:
          "https://images.tokopedia.net/img/cache/700/VqbcmM/2021/2/13/04829d0c-a545-40c7-a88d-7f688b136c51.jpg",
      },
      {
        id: 7,
        nama: "Liontin Emas",
        harga: 1800000,
        qty: 2,
        totalHarga: 3600000,
        image:
          "https://tokoperhiasan.co.id/assets/front/images/product/thumb/Liontin-emas-bentuk-hati-aksen-segtiga-mata-cubic-zirconia.webp",
      },
    ],
    total: 6570000,
    status: "Selesai",
    metodePembayaran: "Kartu Debit",
    buktiPembayaran:
      "https://mediakonsumen.com/files/2024/10/Screenshot_20240920-030802-3.jpg",
  },
];

export const DUMMY_WHISHLIST = [
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
];

// ====

// export const DUMMY_TRANSACTION = [
//   {
//     id: 1,
//     tanggal: "2025-04-10T12:00:00Z",
//     nama: "John Doe",
//     alamat: "Jl. Merdeka No. 12, Jakarta",
//     items: [
//       {
//         id: 1,
//         nama: "Emas Batangan 1 Gram",
//         harga: 985000,
//         qty: 2,
//         totalHarga: 1970000,
//         image:
//           "https://www.logammulia.com/uploads/ngc_master_item/5cdcae8ad46b6_20190516072754-2.jpg",
//       },
//       {
//         id: 4,
//         nama: "Kalung Emas 18K",
//         harga: 3500000,
//         qty: 1,
//         totalHarga: 3500000,
//         image:
//           "https://images.tokopedia.net/img/cache/500-square/VqbcmM/2023/1/3/b7696a69-2c1d-4ce2-919e-a58f6d1594de.jpg",
//       },
//     ],
//     total: 5470000,
//     status: "Selesai",
//     metodePembayaran: "Transfer Bank",
//     buktiPembayaran: "https://example.com/bukti1.jpg",
//   },
//   {
//     id: 2,
//     tanggal: "2025-04-11T15:30:00Z",
//     nama: "Jane Smith",
//     alamat: "Jl. Sudirman Kav. 21, Jakarta",
//     items: [
//       {
//         id: 2,
//         nama: "Emas Batangan 5 Gram",
//         harga: 4925000,
//         qty: 1,
//         totalHarga: 4925000,
//         image:
//           "https://id-test-11.slatic.net/p/1b54e51d9dd5f7e02d6567192bc0f19e.jpg",
//       },
//       {
//         id: 6,
//         nama: "Gelang Emas 22K",
//         harga: 4200000,
//         qty: 1,
//         totalHarga: 4200000,
//         image:
//           "https://ae01.alicdn.com/kf/Se091cd8131e2478d8458ac482c4f596aU.jpg",
//       },
//     ],
//     total: 9125000,
//     status: "Proses",
//     metodePembayaran: "Kartu Kredit",
//     buktiPembayaran: "https://example.com/bukti2.jpg",
//   },
//   {
//     id: 3,
//     tanggal: "2025-04-12T10:45:00Z",
//     nama: "Michael Johnson",
//     alamat: "Jl. Thamrin No. 8, Jakarta",
//     items: [
//       {
//         id: 8,
//         nama: "Emas Koin 0.2 Gram",
//         harga: 500000,
//         qty: 5,
//         totalHarga: 2500000,
//         image:
//           "https://www.static-src.com/wcsstore/Indraprastha/images/catalog/full//catalog-image/108/MTA-150699626/idn_bulion_citraperkasa_idn_bulion_angpao_naga_koin_emas_logam_mulia_-0-2_g_-_24k_-_999-9_gold-_full09_isgvag1j.jpg",
//       },
//     ],
//     total: 2500000,
//     status: "Dibatalkan",
//     metodePembayaran: "Tunai",
//     buktiPembayaran: "https://example.com/bukti3.jpg",
//   },
//   {
//     id: 4,
//     tanggal: "2025-04-13T14:00:00Z",
//     nama: "Alice Williams",
//     alamat: "Jl. Gatot Subroto No. 27, Jakarta",
//     items: [
//       {
//         id: 9,
//         nama: "Emas Koin 0.5 Gram",
//         harga: 990000,
//         qty: 3,
//         totalHarga: 2970000,
//         image:
//           "https://images.tokopedia.net/img/cache/700/VqbcmM/2021/2/13/04829d0c-a545-40c7-a88d-7f688b136c51.jpg",
//       },
//       {
//         id: 7,
//         nama: "Liontin Emas",
//         harga: 1800000,
//         qty: 2,
//         totalHarga: 3600000,
//         image:
//           "https://tokoperhiasan.co.id/assets/front/images/product/thumb/Liontin-emas-bentuk-hati-aksen-segtiga-mata-cubic-zirconia.webp",
//       },
//     ],
//     total: 6570000,
//     status: "Menunggu Pembayaran",
//     metodePembayaran: "Kartu Debit",
//     buktiPembayaran: "https://example.com/bukti4.jpg",
//   },
// ];