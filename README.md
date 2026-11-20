# JEJAK KINERJA AI — Asisten Aktivitas Harian & SKP ASN

Prototipe aplikasi web responsif untuk membantu Aparatur Sipil Negara (ASN) mencatat aktivitas harian, mengelola target kinerja (SKP) pribadi, meninjau rekap mingguan, dan menyusun serta mengekspor draft laporan kinerja bulanan.

## Cara Menjalankan Aplikasi

1. Pasang dependensi:
   ```bash
   npm install
   ```
2. Jalankan mode pengembangan:
   ```bash
   npm run dev
   ```
3. Bangun berkas produksi (output di folder `dist`):
   ```bash
   npm run build
   ```

## Konfigurasi Lingkungan

Aplikasi berjalan sepenuhnya di sisi browser tanpa server backend maupun panggilan API eksternal. Variabel pada `.env.example` (`GEMINI_API_KEY`, `APP_URL`) tidak dibutuhkan oleh klien saat runtime dan tidak ada kredensial yang disimpan di dalam kode.

## Akun Demo ASN

Pada tahap MVP ini hanya peran **ASN / Pegawai** yang tersedia. Dua akun demo dengan data terisolasi disediakan di layar masuk:

1. **Rizky Pratama, S.Kom.** (`rizky.pratama@instansi.go.id` / NIP `199204152019031004`) — Kata sandi demo: `asn-demo-2026`
2. **Siti Rahmawati, S.Stat.** (`siti.rahmawati@instansi.go.id` / NIP `199508212020122008`) — Kata sandi demo: `asn-demo-2026`

## Keterbatasan Prototipe

- Data disimpan lokal di browser pada satu kunci `localStorage` (`jejak_kinerja_ai_state_v1`) sehingga tidak tersinkronisasi lintas perangkat.
- Peran **Atasan / Pejabat Penilai** dan **Admin** (review, komentar, persetujuan laporan, dan pemantauan lintas pegawai) belum diaktifkan pada MVP.
- Status **Final (Personal)** pada laporan bulanan menandakan dokumen siap diunduh oleh pegawai, bukan pengesahan resmi pejabat penilai.
- Asisten penulisan AI berjalan secara lokal berbasis aturan faktual dari catatan pegawai tanpa panggilan LLM eksternal dan tanpa mengarang angka atau capaian.
