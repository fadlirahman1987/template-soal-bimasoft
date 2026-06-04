# Generator Template Soal Bimasoft

Aplikasi web interaktif untuk membuat file template soal ujian dalam format `.docm` yang kompatibel dengan platform Bimasoft.

## ✨ Fitur

- 📝 Editor soal dengan UI yang intuitif
- 🔤 Support 5 pilihan jawaban (A-E) per soal
- ✅ Pilihan kunci jawaban yang jelas
- 📊 Preview ringkas semua soal
- 💾 Export langsung ke format `.docm` (Bimasoft-compatible)
- 🎨 Dark theme yang nyaman untuk mata
- ⚡ Responsif dan cepat

## 🚀 Quick Start

1. Install Node.js dari https://nodejs.org/
2. Extract folder project
3. Buka Command Prompt/Terminal di folder project
4. Jalankan:
   ```bash
   npm install
   npm run dev
   ```
5. Browser akan otomatis membuka aplikasi
6. Upload template `.docm` asli
7. Isi soal dan klik Generate!

## 📖 Dokumentasi Lengkap

Lihat file `PANDUAN_INSTALASI.md` untuk panduan detail lengkap.

## 🛠️ Tech Stack

- **React** 18.2 - UI Framework
- **Vite** 5.0 - Build tool
- **JSZip** - DOCM file manipulation
- **CSS-in-JS** - Styling

## 📦 Struktur Project

```
src/
├── App.jsx      # Komponen utama aplikasi
└── main.jsx     # React entry point

index.html       # HTML root
package.json     # Dependencies
vite.config.js   # Vite config
```

## 💡 Cara Kerja

1. Upload file template `.docm` (Bimasoft original)
2. Aplikasi parse XML di dalam file
3. User isi data soal di UI
4. App rebuild table XML dengan soal-soal baru
5. Export sebagai file `.docm` baru
6. Upload ke Bimasoft

## 🎯 Format Output

- File: `.docm` (Word macro-enabled document)
- Kompatibel: Platform Bimasoft
- Struktur: Tabel 3 kolom (No | Opsi | Jawaban)
- Encoding: UTF-8
- Font: Times New Roman

## ⚖️ License
MIT License - Bebas digunakan

**Catatan**: File template `.docm` asli tidak akan dimodifikasi. Aplikasi membuat file baru dengan nama yang berbeda.
