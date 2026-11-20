# DESIGN.md — JEJAK KINERJA AI

Dokumen keputusan desain dan token visual aplikasi sesuai pilihan pengguna.

## Keputusan Desain Pengguna

| Keputusan | Pilihan Terkonfirmasi |
| :--- | :--- |
| Kesan visual | Formal dan tenang |
| Tipografi | IBM Plex Sans (`@fontsource/ibm-plex-sans`, ketebalan 400, 500, 600) |
| Warna aksen | Biru (`blue-700`, hover `blue-800`, latar terpilih `blue-50`) |
| Sapaan pengguna | Anda (formal kedinasan ASN) |
| Susunan navigasi | Sidebar + Topbar pada desktop; Topbar ringkas + bar aksi menempel di bawah layar pada mobile |
| Posisi aksi utama | Bar aksi menempel di bawah layar (akses cepat tambah aktivitas dalam jangkauan ibu jari) |
| Gambar | Ikon fungsional `lucide-react` tanpa gambar dekoratif |

## Token Visual & Aturan Tata Letak

- **Permukaan**: Latar halaman `bg-neutral-50`, kartu dan panel `bg-white`, batas pemisah `border-neutral-200` (tanpa kartu di dalam kartu dan tanpa garis tepi kiri tebal berwarna).
- **Sudut**: Kartu dan panel `rounded-2xl`, tombol dan kolom isian `rounded-xl`.
- **Teks & Angka**: Teks utama `text-neutral-900`, teks pendukung `text-neutral-600`, placeholder `text-neutral-500`, seluruh angka dan tabel menggunakan `tabular-nums`.
- **Metadata**: Ditampilkan sebagai teks bersih tanpa kotak pil dengan pemisah titik tengah (`·`).
- **Status Semantik**: Selalu memadukan warna `-50`/`-800` dengan label teks dan ikon eksplisit (hijau berhasil/selesai, amber proses/peringatan, merah gagal/prioritas tinggi, netral informasi/draft).
- **Aksesibilitas & Mobile**: Dirancang dari lebar `360px`, area sentuh minimal `44 × 44 px`, ukuran teks input minimal `16px`, dan tinggi gabungan elemen menempel pada mobile maksimal `15%` tinggi layar.
