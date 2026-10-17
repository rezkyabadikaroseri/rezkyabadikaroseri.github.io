/* ==========================================================================
   DATA KATALOG — CV. Rezky Abadi Karoseri
   --------------------------------------------------------------------------
   Semua harga, spesifikasi, warna, dan kontak di situs diambil dari file ini.
   Untuk mengubah harga: cukup ganti angka di bagian "harga" (tanpa titik),
   simpan, lalu upload ulang file ini ke GitHub. Halaman ikut berubah otomatis.
   ========================================================================== */

window.KATALOG = {
  diperbarui: "Oktober 2026",

  kontak: {
    nama: "Mr. Aziz",
    whatsapp: "628114091168",          // format internasional, tanpa + dan tanpa 0 di depan
    whatsappTampil: "0811-4091-168",
    email: "cv.rezkyabadikaroseri@gmail.com",
    alamat: "Jl. Carawali, Temmapaduae, Kec. Marusu, Kabupaten Maros, Sulawesi Selatan 90552",
    peta: "https://www.google.com/maps/search/?api=1&query=Jl.+Carawali+Temmapaduae+Marusu+Maros+Sulawesi+Selatan"
  },

  ketentuan: {
    dpPersen: 50,
    pengerjaan: "± 3 minggu per unit",
    sparepart: "HJBridge"
  },

  paket: [
    { id: "velg",       nama: "Sampai Velg",    ket: "Rangka lengkap + velg, tanpa ban" },
    { id: "vulkanisir", nama: "Ban Vulkanisir", ket: "Sudah termasuk ban vulkanisir" },
    { id: "asli",       nama: "Ban Asli",       ket: "Sudah termasuk ban asli baru" }
  ],

  produk: [
    {
      id: "20-rangka",
      nama: "Trailer 20 Feet Rangka",
      ukuran: 20,
      tipe: "Rangka",
      deskripsi: "Rangka besi terbuka untuk kontainer 20 feet. Ringan, efisien, tetap kokoh menahan beban jalan.",
      gambar: "assets/img/20ft-rangka",
      harga: { velg: 163500000, vulkanisir: 181600000, asli: 201750000 },
      spek: {
        frame: "IWF 450 mm",
        cross: "IWF 150/200 mm",
        side: null,
        dudukan: "IWF 200 mm",
        floor: null,
        twistlock: "4 pcs",
        kingpin: "Standar 2\"",
        landing: "Standard cup 28T",
        rem: "Chamber double",
        suspensi: "2 axle, 90 mm",
        axle: "14T, 2 buah",
        sideguard: "Kanan & kiri",
        spakbor: "Kanan & kiri",
        velg: "10 lubang, 9 pcs*"
      }
    },
    {
      id: "20-plat",
      nama: "Trailer 20 Feet Plat",
      ukuran: 20,
      tipe: "Plat",
      deskripsi: "Lantai pelat bordes penuh 20 feet, siap membawa muatan curah maupun kontainer.",
      gambar: "assets/img/20ft-plat",
      harga: { velg: 180500000, vulkanisir: 198600000, asli: 218750000 },
      spek: {
        frame: "IWF 450 mm",
        cross: "IWF 150/200 mm",
        side: "IWF 200 mm",
        dudukan: "IWF 200 mm",
        floor: "Plat bordes 4 mm",
        twistlock: "4 pcs",
        kingpin: "Standar 2\"",
        landing: "Standard cup 28T",
        rem: "Chamber double",
        suspensi: "2 axle, 90 mm",
        axle: "14T, 2 buah",
        sideguard: "Kanan & kiri",
        spakbor: "Kanan & kiri",
        velg: "10 lubang, 9 pcs*"
      }
    },
    {
      id: "40-rangka",
      nama: "Trailer 40 Feet Rangka",
      ukuran: 40,
      tipe: "Rangka",
      deskripsi: "Rangka panjang untuk kontainer 40 feet dengan 3 sumbu roda agar beban lebih merata.",
      gambar: "assets/img/40ft-rangka",
      harga: { velg: 225500000, vulkanisir: 251650000, asli: 280750000 },
      spek: {
        frame: "IWF 450 mm",
        cross: "IWF 150/200 mm",
        side: "IWF 200 mm",
        dudukan: "IWF 200 mm",
        floor: null,
        twistlock: "4 pcs",
        kingpin: "Standar 2\"",
        landing: "Standard cup 28T",
        rem: "Chamber double",
        suspensi: "3 axle, 90 mm",
        axle: "14T, 3 buah",
        sideguard: "Kanan & kiri",
        spakbor: "Kanan & kiri",
        velg: "10 lubang, 13 pcs*"
      }
    },
    {
      id: "40-plat",
      nama: "Trailer 40 Feet Plat",
      ukuran: 40,
      tipe: "Plat",
      deskripsi: "Lantai pelat bordes penuh 40 feet dengan 3 sumbu roda, untuk muatan panjang dan berat.",
      gambar: "assets/img/40ft-plat",
      harga: { velg: 262500000, vulkanisir: 288650000, asli: 317750000 },
      spek: {
        frame: "IWF 450 mm",
        cross: "IWF 150/200 mm",
        side: "IWF 200 mm",
        dudukan: "IWF 200 mm",
        floor: "Plat bordes 4 mm",
        twistlock: "4 pcs",
        kingpin: "Standar 2\"",
        landing: "Standard cup 28T",
        rem: "Chamber double",
        suspensi: "3 axle, 90 mm",
        axle: "14T, 3 buah",
        sideguard: "Kanan & kiri",
        spakbor: "Kanan & kiri",
        velg: "10 lubang, 13 pcs*"
      }
    }
  ],

  // Urutan & nama baris spesifikasi
  labelSpek: [
    ["frame", "Frame utama"],
    ["cross", "Cross member"],
    ["side", "Side member"],
    ["dudukan", "Dudukan twist lock"],
    ["floor", "Lantai (floor)"],
    ["twistlock", "Twist lock"],
    ["kingpin", "Kingpin"],
    ["landing", "Landing gear"],
    ["rem", "Pengereman"],
    ["suspensi", "Suspensi"],
    ["axle", "Axle"],
    ["sideguard", "Side guard"],
    ["spakbor", "Spakbor"],
    ["velg", "Velg baru"]
  ],
  catatanVelg: "*Jumlah velg sudah termasuk 1 untuk ban serep.",

  warna: [
    { id: "pink-fuchsia", nama: "Pink Fuchsia", hex: "#bf0360" },
    { id: "pink-dusty",   nama: "Pink Dusty",   hex: "#c3657c" },
    { id: "merah",        nama: "Merah",        hex: "#ca0211" },
    { id: "oranye",       nama: "Oranye",       hex: "#ec4702" },
    { id: "kuning",       nama: "Kuning",       hex: "#e79f05" },
    { id: "hijau-lime",   nama: "Hijau Lime",   hex: "#6bb725" },
    { id: "hijau-daun",   nama: "Hijau Daun",   hex: "#068140" },
    { id: "hijau-botol",  nama: "Hijau Botol",  hex: "#04553f" },
    { id: "hijau-mint",   nama: "Hijau Mint",   hex: "#33b89a" },
    { id: "hijau-toska",  nama: "Hijau Toska",  hex: "#01787c" },
    { id: "biru-langit",  nama: "Biru Langit",  hex: "#3fa2da" },
    { id: "biru-royal",   nama: "Biru Royal",   hex: "#026bcd" },
    { id: "biru-dongker", nama: "Biru Dongker", hex: "#192f60" },
    { id: "putih",        nama: "Putih",        hex: "#e4e6ea" }
  ]
};
