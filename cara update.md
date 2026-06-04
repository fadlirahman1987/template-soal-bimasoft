# Panduan Cara Memperbarui (Update) Aplikasi Desktop Bimasoft

Dokumen ini menjelaskan langkah-langkah bagi pengembang untuk merilis versi terbaru (update) aplikasi sehingga pengguna yang sudah menginstal versi sebelumnya otomatis menerima pembaruan secara instan.

---

## Langkah 1: Naikkan Versi di Kode Sumber
1. Buka berkas `package.json` di proyek Anda.
2. Cari properti `"version"` (biasanya di baris ke-3) dan ubah nilainya ke versi baru yang lebih tinggi (misalnya, jika versi lama adalah `"1.0.0"`, ubah menjadi `"1.1.0"`):
   ```json
   "version": "1.1.0",
   ```
3. *(Opsional)* Jika Anda ingin mengubah catatan versi atau judul versi pada jendela modal **Tentang Aplikasi**, silakan edit teks versi di berkas `src/App.jsx`.

---

## Langkah 2: Bangun (Build) Paket Desktop Baru
Buka terminal/command prompt pada direktori proyek Anda, lalu jalankan perintah berikut:
```bash
npm run electron:build
```
Perintah ini akan secara otomatis mengompilasi ulang kode web Anda dan menghasilkan berkas pembaruan di dalam folder **`dist-desktop/`**:
- 📂 **`Generator Template Soal Bimasoft Setup 1.1.0.exe`** (Installer baru versi 1.1.0)
- 📄 **`latest.yml`** (Metadata versi baru yang berisi info rilis dan tanda tangan digital keamanan SHA-512)

---

## Langkah 3: Unggah Pembaruan ke GitHub Releases
1. Buka repositori GitHub Anda di browser:
   `https://github.com/fadlirahman1987/template-soal-bimasoft`
2. Di sebelah kanan halaman repositori, klik **"Releases"** (atau buka langsung `https://github.com/fadlirahman1987/template-soal-bimasoft/releases`).
3. Klik tombol **"Draft a new release"** (atau **"Create a new release"**).
4. Pada tombol **"Choose a tag"**, ketik versi rilis baru Anda dengan awalan huruf `v` (contoh: **`v1.1.0`**), lalu klik *Create new tag*.
5. Isi kolom **"Release title"** dengan nama pembaruan Anda (contoh: `Rilis Pembaruan v1.1.0`).
6. Tulis deskripsi singkat pembaruan di kolom *Describe this release* (misal: perbaikan bug atau penambahan fitur baru).
7. Pada bagian seret berkas (**"Attach binaries by dropping them here..."**), unggah **dua berkas** berikut dari folder `/dist-desktop/` lokal Anda:
   - 📂 `Generator Template Soal Bimasoft Setup 1.1.0.exe`
   - 📄 `latest.yml`
   *(Catatan: Jangan lupa mengunggah `latest.yml`, karena berkas tersebut adalah kunci agar sistem pembaruan otomatis di komputer pengguna dapat mendeteksi rilis ini).*
8. Klik tombol **"Publish release"** di bagian paling bawah untuk memublikasikan pembaruan Anda.

---

## Langkah 4: Cara Kerja Pembaruan di Pengguna
Setelah rilis dipublikasikan di GitHub:
1. Ketika pengguna membuka aplikasi desktop versi lama (`1.0.0`) di komputer mereka, aplikasi secara otomatis membaca berkas `latest.yml` yang baru Anda unggah ke GitHub.
2. Aplikasi akan mengunduh berkas installer `v1.1.0` secara diam-diam di latar belakang (*silent download*).
3. Setelah pengunduhan selesai, notifikasi Windows akan memberitahukan pengguna bahwa update siap dipasang.
4. Ketika pengguna menutup aplikasi dan membukanya kembali, aplikasi mereka sudah otomatis diperbarui ke versi `1.1.0` tanpa perlu mengunduh apa pun lagi secara manual dari web.
