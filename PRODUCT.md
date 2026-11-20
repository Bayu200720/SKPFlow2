# PRODUCT.md — JEJAK KINERJA AI

Aplikasi web satu halaman untuk membantu Aparatur Sipil Negara (ASN) mencatat aktivitas harian, mengelola target kinerja (SKP) pribadi, meninjau rekap mingguan, dan menyusun serta mengekspor draft laporan bulanan.

## Daftar Fitur MVP

| Kode | Nama Fitur | Prioritas | Ketergantungan | Status |
| :--- | :--- | :--- | :--- | :--- |
| FR-01 | Autentikasi dan Profil ASN (tanpa login Atasan/Admin) | P0 | Fondasi Data | Selesai |
| FR-02 | Dashboard Personal ASN & Grafik Aktivitas | P0 | FR-01, FR-03, FR-05 | Selesai |
| FR-03 | Daily Worklog (CRUD, Detail, Timeline) | P0 | FR-01, FR-05 | Selesai |
| FR-04 | Quick Add (Input Alami & Preview Pemisahan) | P0 | FR-03, FR-06 | Selesai |
| FR-05 | Pengelolaan Target Kinerja (SKP Mandiri) | P0 | FR-01 | Selesai |
| FR-06 | AI Writing Assistant (Mode Lokal Faktual) | P1 | FR-03, FR-05 | Selesai |
| FR-07 | Rekap Mingguan & Ringkasan | P0 | FR-03, FR-05, FR-06 | Selesai |
| FR-08 | Laporan Bulanan Terstruktur & Editor | P0 | FR-01, FR-03, FR-05, FR-06 | Selesai |
| FR-09 | Ekspor Dokumen (PDF, DOCX, XLSX) | P0 | FR-08 | Selesai |
| FR-10 | Bukti Dukung / Lampiran Aktivitas | P1 | FR-03 | Selesai |
| FR-11 | Status dan Penyimpanan Laporan Personal (Draft / Final) | P0 | FR-08 | Selesai |
| FR-12 | Pencarian & Filter Multi-Kriteria | P0 | FR-03 | Selesai |
| FR-13 | Konfigurasi Personal (Kategori & Template) | P0 | Fondasi Data | Selesai |
| FR-14 | Audit Log & Notifikasi Personal | P1 | FR-01 | Selesai |

## Catatan Ruang Lingkup & Batasan

- **Peran Tunggal MVP**: Hanya akun ASN yang dapat masuk. Alur login, review, komentar, dan persetujuan Atasan/Pejabat Penilai serta Admin ditunda ke fase berikutnya.
- **Penyimpanan Browser**: Seluruh data disimpan pada satu kunci `localStorage` (`jejak_kinerja_ai_state_v1`) dengan isolasi data per `user_id` ASN dan data contoh (seed) realistis untuk demonstrasi.
- **Asisten AI Faktual Lokal**: Perapihan narasi, pemecahan kalimat alami, rekomendasi target, dan penyusunan ringkasan berjalan di browser berbasis aturan/templat terstruktur tanpa panggilan API eksternal maupun mengarang angka/fakta.
