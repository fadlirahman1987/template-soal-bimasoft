# 🖼️ PANDUAN: Cara Menambahkan Gambar di Soal

Aplikasi sudah diupdate untuk mendukung gambar dalam soal ujian!

---

## ✨ Fitur Baru

- 📸 Upload gambar per soal (JPG/PNG)
- 🔄 Gambar otomatis di-embed ke dalam file .docm
- 🖼️ Gambar ditampilkan di atas teks pertanyaan
- ✅ Support multiple soal dengan gambar berbeda

---

## 📝 Cara Menggunakan

### Langkah-langkah:

1. **Isi teks pertanyaan** (seperti biasa)

2. **Klik bagian "🖼️ Gambar Pertanyaan"**
   - Di bawah field teks pertanyaan
   - Klik area yang bertulisan "📁 Klik untuk upload gambar..."

3. **Pilih gambar dari komputer**
   - Format: PNG atau JPG
   - Ukuran: Tidak dibatasi (tapi sebaiknya < 5MB)
   - Rekomendasi: Minimal 800x600 pixel untuk kualitas terbaik

4. **Gambar akan tampil di preview** dengan status "✓ filename.jpg"

5. **Isi pilihan jawaban** (seperti biasa)

6. **Generate file .docm** seperti biasa
   - Gambar otomatis ter-embed dalam file

7. **Upload ke Bimasoft** - Selesai!

---

## 💡 Contoh Kasus

### Contoh 1: Soal Matematika dengan Grafik
```
Teks: "Perhatikan grafik berikut:"
Gambar: [grafik parabola.jpg]
Opsi: A) y = x²
      B) y = -x²
      C) y = 2x²
      D) y = x/2
      E) y = 2x
```

### Contoh 2: Soal Biologi dengan Diagram
```
Teks: "Bagian yang ditandai X adalah..."
Gambar: [diagram sel.png]
Opsi: A) Mitokondria
      B) Inti sel
      C) Ribosom
      D) Vakuola
      E) Retikulum endoplasma
```

### Contoh 3: Soal IPA Sosial dengan Peta
```
Teks: "Pulau yang ditunjukkan pada peta adalah..."
Gambar: [peta pulau.jpg]
Opsi: A) Kalimantan
      B) Sulawesi
      C) Papua
      D) Maluku
      E) Nusa Tenggara
```

---

## ⚙️ Spesifikasi Teknis

### Format File yang Didukung
- ✅ PNG (.png)
- ✅ JPEG (.jpg, .jpeg)

### Ukuran Gambar dalam Dokumen
- Lebar: 4 inci (~10 cm)
- Tinggi: 3 inci (~7.6 cm)
- Aspek ratio tetap (tidak di-distort)

### Ukuran File Output
- Gambar ditambahkan ke dalam file .docm
- Ukuran file akan bertambah sesuai ukuran gambar
- Contoh: 5 soal + 5 gambar (JPG ~200KB masing-masing) = total file ~1.5-2 MB

---

## 🎨 Tips & Trik

### 1. Kualitas Gambar
- **Gunakan gambar berkualitas tinggi** (minimal 800x600)
- **Kurangi ukuran file** dengan compress (gunakan online tools jika perlu)
- **Format PNG** untuk gambar dengan transparansi
- **Format JPG** untuk foto atau gambar berwarna penuh

### 2. Persiapan Gambar
Sebelum upload, pastikan:
- ✓ Gambar sudah jelas dan terbaca
- ✓ Ukuran teks dalam gambar cukup besar (readable)
- ✓ Kontras cukup baik
- ✓ Tidak ada watermark yang tidak perlu

### 3. Nomer Soal
Sistem otomatis mengganti gambar berdasarkan urutan soal:
- Soal 1 → image1.jpg
- Soal 2 → image2.jpg
- Soal 3 → image3.jpg
- ...dst

### 4. Edit Gambar
Jika ingin mengganti gambar:
1. Klik tombol "✕" untuk menghapus
2. Upload gambar yang baru
3. Gambar lama akan otomatis diganti

---

## 🔍 Troubleshooting

### Error: "File gambar terlalu besar"
**Solusi**: Compress gambar terlebih dahulu
- Gunakan: https://imagecompressor.com/
- Atau gunakan Photoshop/Paint minimal compress 20-30%

### Gambar tidak muncul di file output
**Solusi**: 
1. Pastikan format file JPG atau PNG (bukan GIF, WEBP, dll)
2. Upload ulang gambar
3. Re-generate file

### Gambar muncul distorted (tertarik)
**Solusi**: 
- Gunakan gambar dengan aspek ratio mendekati 4:3
- Atau buat gambar baru dengan ukuran sesuai

### File .docm terlalu besar
**Solusi**:
- Compress semua gambar sebelum upload
- Atau kurangi resolusi gambar

---

## 📋 Checklist Sebelum Generate

- ☐ Teks pertanyaan sudah lengkap
- ☐ Gambar sudah di-upload (jika ada)
- ☐ Gambar sudah jelas dan readable
- ☐ 5 pilihan jawaban sudah diisi
- ☐ Kunci jawaban sudah dipilih
- ☐ Semua soal sudah selesai

---

## 🔧 Fitur Lanjutan (Opsional)

### Membuat Gambar Custom di Excel/PowerPoint
1. Buat gambar di Excel atau PowerPoint
2. Copy → Paste Special → Gambar
3. Klik kanan → Save as Picture
4. Upload ke aplikasi

### Membuat Diagram Online
Website untuk membuat diagram:
- **Lucidchart**: https://www.lucidchart.com/
- **Draw.io**: https://draw.io/
- **Canva**: https://www.canva.com/

---

## ✅ Verifikasi File Output

Setelah generate .docm:
1. Buka file di Microsoft Word
2. Pastikan gambar tampil dengan baik
3. Cek positioning (gambar harus di atas teks pertanyaan)
4. Pastikan semua soal dan gambar ter-upload

---

## 📞 Pertanyaan Sering Diajukan

**Q: Apakah bisa upload gambar lebih dari 1 per soal?**
A: Saat ini belum. Satu gambar per soal. Jika butuh lebih, gabungkan gambar menggunakan Paint/Photoshop.

**Q: Bisa ganti ukuran gambar?**
A: Belum ada pengaturan manual. Ukuran fixed 4" × 3". Edit PANDUAN ini jika perlu ubah.

**Q: Gambar bisa di-link eksternal?**
A: Tidak. Gambar harus di-embed (built-in) ke file .docm agar tidak bergantung internet.

**Q: Bisa hapus gambar setelah ter-upload?**
A: Ya! Klik tombol "✕" pada area gambar yang sudah ter-upload.

---

## 🎓 Keuntungan Menggunakan Gambar

✨ **Meningkatkan engagement** - Soal lebih menarik
✨ **Lebih jelas** - Diagram/grafik lebih mudah dipahami
✨ **Profesional** - Terlihat lebih polished
✨ **Sesuai standar** - Seperti soal ujian nasional

---

## 📢 Update Log

**v1.1 - Fitur Gambar Ditambahkan**
- ✅ Upload gambar per soal
- ✅ Support JPG & PNG
- ✅ Auto-embed ke file .docm
- ✅ Remove/replace gambar
- ✅ Preview nama file

---

**Enjoy membuat soal dengan gambar! 🎉**

Jika ada masalah, pastikan aplikasi sudah di-update ke versi terbaru.
