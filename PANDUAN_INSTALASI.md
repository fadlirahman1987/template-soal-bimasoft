# 📝 Generator Template Soal Bimasoft
## Panduan Instalasi & Cara Menjalankan di PC

---

## 📋 PERSYARATAN

Sebelum memulai, pastikan Anda sudah install:

1. **Node.js** (versi 16 atau lebih tinggi)
   - Download dari: https://nodejs.org/
   - Pilih "LTS" (Long Term Support)
   - Install dengan default settings

2. **Git** (opsional, untuk clone repo)
   - Download dari: https://git-scm.com/

---

## 🚀 LANGKAH-LANGKAH INSTALASI

### Opsi A: Download File ZIP (TERMUDAH)

1. **Download folder project ini**
   - Unduh semua file dalam folder outputs ke komputer
   - Buat folder baru, misalnya: `C:\soal-bimasoft\` (Windows) atau `~/soal-bimasoft/` (Mac/Linux)
   - Ekstrak semua file ke dalam folder tersebut

2. **Buka Command Prompt/Terminal**
   - **Windows**: Tekan `Win + R`, ketik `cmd`, tekan Enter
   - **Mac**: Buka "Terminal" dari Applications > Utilities
   - **Linux**: Buka Terminal

3. **Navigasi ke folder project**
   ```bash
   cd C:\soal-bimasoft
   ```
   (Ganti path sesuai lokasi folder Anda)

4. **Install dependencies**
   ```bash
   npm install
   ```
   Tunggu sampai selesai (akan download beberapa paket)

5. **Jalankan aplikasi**
   ```bash
   npm run dev
   ```
   Setelah beberapa detik, browser otomatis membuka aplikasi di:
   ```
   http://localhost:5173
   ```

---

### Opsi B: Menggunakan Git

Jika Anda familiar dengan Git:

```bash
cd C:\Users\YourName\Documents
git clone <repo-url>
cd template-soal-bimasoft
npm install
npm run dev
```

---

## 📁 STRUKTUR FOLDER

Setelah download, folder Anda akan terlihat seperti ini:

```
soal-bimasoft/
├── src/
│   ├── App.jsx          ← Aplikasi utama
│   └── main.jsx         ← Entry point React
├── index.html           ← Halaman HTML
├── package.json         ← Konfigurasi npm
├── vite.config.js       ← Konfigurasi Vite
└── node_modules/        ← Dependencies (muncul setelah npm install)
```

---

## 💻 CARA MENGGUNAKAN APLIKASI

Setelah aplikasi terbuka di browser:

### 1️⃣ **Upload Template**
   - Klik tombol "📂 Klik untuk upload template..."
   - Pilih file `.docm` template Bimasoft asli Anda
   - Tunggu hingga status menunjukkan "✓ Template ... berhasil dimuat"

### 2️⃣ **Atur Judul**
   - Edit field "Judul Postingan (Post Title)" sesuai kebutuhan
   - Contoh: `HELITA EKONOMI KELAS 10 123-SMAN3TGR`

### 3️⃣ **Isi Soal Pertama**
   - Di sidebar kanan, Soal 1 sudah terpilih
   - Ketik pertanyaan di field "Teks Pertanyaan"
   - Isi 5 pilihan jawaban (A-E)
   - Klik lingkaran di samping jawaban yang benar untuk menjadi kunci jawaban

### 4️⃣ **Tambah Soal Tambahan** (Opsional)
   - Klik tombol "+ Tambah Soal" di sidebar
   - Isi soal dengan cara yang sama
   - Bisa menambah soal sebanyak yang diinginkan

### 5️⃣ **Generate File**
   - Setelah semua soal terisi, klik tombol biru:
     ```
     ⬇️ Generate & Download .docm
     ```
   - File `.docm` akan langsung diunduh ke folder Downloads Anda

### 6️⃣ **Upload ke Bimasoft**
   - Buka website Bimasoft Anda
   - Upload file `.docm` yang baru saja diunduh
   - Selesai! Soal sudah ter-upload dengan format yang benar

---

## ⚠️ TROUBLESHOOTING

### Error: "npm: command not found"
**Solusi**: Node.js belum terinstall dengan benar
- Unduh dari: https://nodejs.org/
- Restart komputer setelah install
- Buka Command Prompt baru

### Error: "Cannot find module"
**Solusi**: Dependencies belum ter-install
```bash
npm install
```

### Port 5173 sudah digunakan
**Solusi**: Ganti port dalam `vite.config.js`
```javascript
server: {
  port: 5174,  // Ubah 5173 menjadi 5174 (atau nomor lain)
  open: true
}
```

### Browser tidak auto-open
**Solusi**: Buka manual di browser:
```
http://localhost:5173
```

---

## 🔧 COMMAND YANG SERING DIGUNAKAN

```bash
# Jalankan aplikasi (development mode)
npm run dev

# Build untuk production
npm build

# Preview build
npm run preview

# Stop server
Ctrl + C (di Command Prompt)
```

---

## 📝 CATATAN PENTING

- **Jangan hapus folder `node_modules`** meski ukurannya besar. Ini folder untuk dependencies.
- **Simpan file template `.docm` asli** di tempat yang aman sebagai backup.
- **Browser yang didukung**: Chrome, Firefox, Edge, Safari (semua versi terbaru)
- **Ukuran file output**: Sekitar 1-2 MB per dokumen (normal untuk format .docm)

---

## 🆘 BANTUAN LEBIH LANJUT

Jika ada masalah:
1. Pastikan Node.js versi 16+: `node --version`
2. Cek npm terinstall: `npm --version`
3. Delete `node_modules` dan jalankan `npm install` lagi
4. Coba browser yang berbeda

---

## ✅ SELESAI!

Aplikasi siap digunakan. Enjoy membuat template soal! 🎉
