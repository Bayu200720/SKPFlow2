# Product Requirements Document (PRD)

## JEJAK KINERJA AI --- Asisten Aktivitas Harian & SKP ASN

**Versi:** 1.1\
**Status:** Prototipe / Hackathon\
**Jenis Produk:** Responsive Web Application\
**Tagline:** *Catat hari ini, susun kinerja tanpa repot.*

------------------------------------------------------------------------

## 1. Ringkasan Produk

**JEJAK KINERJA AI** adalah aplikasi yang membantu Aparatur Sipil Negara (ASN)
mencatat pekerjaan sehari-hari, menghubungkan aktivitas dengan target
kinerja, menyimpan bukti dukung, serta menghasilkan rekap dan draft
laporan bulanan secara otomatis.

Aplikasi mengurangi beban mengingat dan merangkum pekerjaan di akhir
bulan. ASN cukup mencatat aktivitas secara rutin---termasuk melalui
input singkat atau bahasa sehari-hari---kemudian sistem membantu
merapikan narasi, mengelompokkan aktivitas, dan menyusun laporan
berdasarkan data yang benar-benar dicatat.

JEJAK KINERJA AI bukan pengganti sistem penilaian kinerja resmi. Laporan yang dihasilkan merupakan bahan/draft yang dapat ditinjau, diedit, dan disesuaikan oleh ASN sendiri. Review atasan direncanakan untuk fase berikutnya.

### 1.1 Problem Statement

ASN sering menghadapi kendala: - Aktivitas harian tersebar di rapat,
chat, dokumen, tiket, dan pekerjaan teknis. - Pekerjaan yang telah
dilakukan terlupakan ketika menyusun laporan bulanan. - Penyusunan
laporan memerlukan waktu karena harus mengumpulkan dan merapikan
catatan. - Aktivitas sulit ditelusuri ke target kinerja atau SKP. -
Bukti dukung pekerjaan tersebar dan tidak terorganisir. - Atasan
kesulitan memperoleh gambaran progres pekerjaan secara berkala.

### 1.2 Product Vision

Menjadi asisten pencatatan kinerja ASN yang praktis, sehingga aktivitas
harian terdokumentasi dengan baik dan dapat diolah menjadi laporan
kinerja yang konsisten, terukur, serta mudah ditinjau.

### 1.3 Product Goals

1.  Memudahkan pencatatan aktivitas harian dengan alur singkat.
2.  Mengurangi waktu penyusunan laporan bulanan.
3.  Menyediakan rekap aktivitas berdasarkan tanggal, kategori, target,
    dan output.
4.  Membantu menyusun narasi formal dengan AI tanpa mengarang fakta.
5.  Memberi ASN kendali untuk mengelola target kinerja sendiri dan memantau progres aktivitasnya.
6.  Mendukung akses nyaman dari desktop maupun smartphone.

------------------------------------------------------------------------

## 2. Target Pengguna dan Peran (Tahap Saat Ini)

### 2.1 ASN / Pegawai — Satu-satunya role login pada MVP

Pada versi prototipe/MVP ini, **hanya ASN yang dapat login dan menggunakan aplikasi**. Setiap akun mewakili seorang ASN dan data yang ditampilkan bersifat personal.

ASN dapat:
- Mengelola profil pribadi.
- Membuat, melihat, mengubah, dan menghapus aktivitas harian miliknya.
- Membuat, melihat, mengubah, dan mengarsipkan target kinerja/SKP miliknya sendiri.
- Menghubungkan aktivitas harian ke target yang dibuat sendiri.
- Mengunggah bukti dukung.
- Melihat rekap mingguan dan bulanan.
- Menghasilkan, mengedit, dan mengunduh laporan bulanan.
- Menyimpan laporan sebagai draft pribadi.

### 2.2 Role yang belum tersedia

Login Atasan/Pejabat Penilai dan Admin belum disediakan pada tahap ini. Fitur review, persetujuan, monitoring lintas pegawai, pengelolaan pengguna oleh admin, dan dashboard unit kerja ditunda ke fase pengembangan berikutnya. Struktur data boleh disiapkan agar pengembangan role tersebut nantinya tidak memerlukan perubahan besar, tetapi role tersebut tidak boleh muncul sebagai pilihan login atau fitur aktif dalam prototipe.

------------------------------------------------------------------------

## 3. Ruang Lingkup

### 3.1 In Scope (Prototipe/MVP)

- Login dan autentikasi ASN.
- Dashboard personal ASN.
- CRUD aktivitas harian.
- Input aktivitas cepat.
- Pengelolaan target kinerja/SKP oleh ASN sendiri.
- Menghubungkan aktivitas ke target kinerja milik ASN.
- Lampiran bukti dukung.
- Rekap mingguan.
- Generator laporan bulanan personal.
- Bantuan AI untuk perapihan narasi, ringkasan, dan rekomendasi pemetaan target.
- Preview, edit, dan export laporan.
- Data demo / seed data khusus ASN.
- Responsive desktop dan mobile.
- Isolasi data antar akun ASN (setiap ASN hanya melihat dan mengelola datanya sendiri).

### 3.2 Out of Scope (Tahap Prototipe)

- Login Atasan/Pejabat Penilai dan Admin.
- Review, komentar, revisi, dan persetujuan laporan oleh atasan.
- Dashboard monitoring lintas pegawai atau unit.
- Manajemen akun, role, dan hierarki oleh admin melalui UI.
- Integrasi langsung ke sistem e-Kinerja atau platform penilaian resmi.
- Penetapan otomatis nilai kinerja ASN.
- Penetapan target SKP formal oleh AI. AI hanya membantu menyusun/melengkapi draft target yang dikonfirmasi ASN.
- Tanda tangan elektronik tersertifikasi.
- Integrasi payroll atau kepegawaian nasional.
- Workflow birokrasi kompleks dan configurable sepenuhnya.
- Pengambilan data otomatis dari email, kalender, chat, atau sistem tiket (dapat dipertimbangkan fase berikutnya).

------------------------------------------------------------------------

## 4. Alur Pengguna Utama

### 4.1 Alur ASN

1.  ASN login.
2.  Melihat dashboard dan aktivitas terbaru.
3.  Menambahkan aktivitas harian melalui form ringkas atau input natural
    language.
4.  Memeriksa dan mengedit hasil perapihan AI jika digunakan.
5.  Memilih target kinerja yang terkait.
6.  Menambahkan output, jumlah, satuan, status, dan bukti dukung.
7.  Menyimpan aktivitas.
8.  Melihat rekap mingguan atau bulanan.
9.  Memilih periode laporan bulanan.
10. Generate draft laporan.
11. Meninjau dan mengedit laporan.
12. Mengunduh laporan atau menyimpan laporan sebagai draft pribadi.
13. ASN dapat menambah target kinerja sendiri melalui menu Target Kinerja, lalu menggunakan target tersebut saat mencatat aktivitas.

### 4.2 Alur Atasan

Alur login dan review atasan **belum termasuk prototipe tahap ini** dan disimpan sebagai rencana pengembangan lanjutan.

------------------------------------------------------------------------

## 5. Navigasi dan Struktur Aplikasi

### 5.1 Navigasi ASN

1.  Dashboard
2.  Aktivitas Harian
3.  Target Kinerja
4.  Rekap Mingguan
5.  Laporan Bulanan
6.  Profil

### 5.2 Navigasi Atasan dan Admin

Menu Atasan dan Admin belum ditampilkan atau diaktifkan pada prototipe saat ini. Navigasi hanya menampilkan menu ASN. Menu yang dibutuhkan pada fase berikutnya dapat ditambahkan setelah fitur multi-role disetujui.

Desktop menggunakan sidebar dan topbar. Mobile menggunakan bottom
navigation dan aksi tambah aktivitas yang mudah dijangkau.

------------------------------------------------------------------------

## 6. Persyaratan Fungsional

### FR-01 --- Autentikasi dan Profil

-   Pengguna dapat login dan logout.
-   Sistem menampilkan menu berdasarkan role.
-   Profil berisi nama, NIP, jabatan, unit kerja, dan atasan.
-   Pengguna hanya dapat mengakses data sesuai kewenangan.

**Acceptance criteria:** - Pengguna yang belum login tidak dapat membuka halaman privat. - Hanya akun ASN yang dapat login pada versi ini. - ASN hanya dapat membaca, membuat, mengubah, atau menghapus data miliknya sendiri. - Tidak tersedia role switching, login atasan, maupun login admin. - Akses data tetap dibatasi dan divalidasi di backend/database, bukan hanya disembunyikan di UI.

### FR-02 --- Dashboard

Dashboard menampilkan: - Sapaan dan tanggal. - Jumlah aktivitas hari
ini. - Jumlah aktivitas bulan berjalan. - Target kinerja aktif. - Status
laporan bulan berjalan. - Grafik aktivitas 7 hari terakhir. - Grafik
aktivitas per kategori. - Aktivitas terbaru. - Shortcut tambah
aktivitas.

**Acceptance criteria:** - Statistik sesuai data pengguna dan periode
aktif. - Grafik dan daftar aktivitas menyesuaikan data aktual. - Empty
state ditampilkan jika belum ada data.

### FR-03 --- Daily Worklog

Pengguna dapat membuat aktivitas dengan data: - Tanggal. - Judul. -
Deskripsi. - Kategori. - Target kinerja terkait (opsional). - Output
atau hasil. - Kuantitas output (opsional). - Satuan output (opsional). -
Durasi (opsional). - Status: Belum dimulai, Sedang dikerjakan,
Selesai. - Prioritas. - Tag. - Kendala (opsional). - Tindak lanjut
(opsional). - Bukti dukung (opsional).

Pengguna dapat melihat daftar/timeline, detail, mengedit, menghapus, dan
mencari aktivitas.

**Acceptance criteria:** - Aktivitas wajib memiliki tanggal dan judul. -
Validasi input tampil dengan jelas. - Perubahan tersimpan dan tercermin
di daftar. - ASN hanya mengubah aktivitas miliknya. - Aktivitas dapat
difilter berdasarkan tanggal, kategori, target, dan status.

### FR-04 --- Quick Add

Form input ringkas: - Apa yang dikerjakan? - Tanggal. - Hasil
(opsional).

Dapat menerima teks natural language, misalnya: \> Hari ini melakukan
backup database SIMOPPA, mengecek server, dan memperbaiki bug login
aplikasi.

AI boleh menyarankan pemisahan menjadi beberapa aktivitas. Sistem
menampilkan preview sebelum penyimpanan.

**Acceptance criteria:** - Pengguna dapat menyimpan catatan ringkas
tanpa melengkapi seluruh field detail. - Jika AI memecah teks menjadi
beberapa aktivitas, pengguna dapat mengedit, memilih, atau membatalkan
setiap item. - Tidak ada aktivitas hasil AI yang tersimpan tanpa
konfirmasi pengguna.

### FR-05 --- Pengelolaan Target Kinerja oleh ASN

ASN dapat membuat dan mengelola target kinerja/SKP secara mandiri tanpa input atau persetujuan admin/atasan pada prototipe. Form target mencakup:
- Nama target kinerja.
- Deskripsi target.
- Indikator keberhasilan.
- Nilai target (opsional, sesuai kebutuhan).
- Satuan (opsional).
- Periode mulai dan selesai.
- Status: Aktif atau Diarsipkan.

Aktivitas harian dapat ditautkan ke target milik ASN yang sedang login. Sistem menampilkan aktivitas terkait dan realisasi yang tercatat.

**Acceptance criteria:** - ASN dapat menambah, mengubah, dan mengarsipkan target miliknya. - Target otomatis terikat ke pemilik akun yang membuatnya. - ASN tidak dapat melihat atau mengubah target milik akun lain. - Target aktif dalam periode yang sesuai dapat dipilih saat membuat aktivitas. - Target yang diarsipkan atau di luar periode tidak disarankan untuk aktivitas baru. - AI hanya memberi rekomendasi mapping ke target yang sudah dibuat ASN; pengguna mengonfirmasi. - Realisasi hanya dihitung dari data yang tercatat, bukan asumsi AI.

### FR-06 --- AI Writing Assistant

Fungsi: - Merapikan kalimat menjadi bahasa formal kedinasan. - Menyusun
deskripsi aktivitas. - Merangkum aktivitas mingguan. - Menyusun
ringkasan bulanan. - Menyarankan kategori. - Menyarankan mapping ke
target yang sudah tersedia.

**Acceptance criteria:** - Output AI dapat diedit. - AI tidak menambah
fakta, kuantitas, output, tanggal, atau capaian yang tidak tersedia pada
data. - Sistem menyediakan fallback/mock mode saat layanan AI belum
dikonfigurasi. - AI hanya mengolah data yang pengguna berwenang akses.

### FR-07 --- Rekap Mingguan

Menampilkan: - Total aktivitas. - Aktivitas selesai dan belum selesai. -
Aktivitas per kategori. - Aktivitas per target. - Timeline. - Ringkasan
mingguan.

Pengguna dapat memilih minggu dan menghasilkan ringkasan yang bisa
diedit dan disimpan.

### FR-08 --- Laporan Bulanan

Pengguna memilih bulan dan tahun, lalu sistem mengumpulkan aktivitas
dalam periode tersebut.

Struktur laporan: 1. Identitas pegawai. 2. Periode laporan. 3. Ringkasan
eksekutif. 4. Rekap aktivitas harian. 5. Capaian per target kinerja. 6.
Rekap output. 7. Kendala dan tindak lanjut. 8. Penutup / catatan.

**Acceptance criteria:** - Data hanya berasal dari aktivitas pada
periode yang dipilih. - Aktivitas yang belum memiliki output ditandai,
bukan diisi secara otomatis. - Pengguna dapat mengedit setiap bagian
laporan. - Laporan dapat disimpan sebagai draft. - Generate ulang AI
tidak menghilangkan editan pengguna tanpa konfirmasi. - Laporan dapat
di-preview dan diekspor.

### FR-09 --- Export

Format: - PDF untuk dokumen laporan. - DOCX untuk dokumen yang dapat
diedit. - XLSX untuk rekap aktivitas.

**Acceptance criteria:** - Export mempertahankan format, tabel,
identitas, dan periode. - File memiliki nama yang jelas, misalnya
`Laporan_Kinerja_Bulanan_Nama_2026-11.pdf`. - Export tersedia dari
preview laporan.

### FR-10 --- Evidence / Attachment

File yang didukung: - PDF. - JPG/JPEG. - PNG. - DOC/DOCX. - XLS/XLSX.

Metadata file: - Nama. - Lokasi penyimpanan. - MIME type. - Ukuran. -
Pengunggah. - Tanggal upload. - Aktivitas terkait.

**Acceptance criteria:** - Validasi format dan ukuran. - File disimpan
di storage privat. - Akses file dikontrol sesuai role dan kepemilikan
aktivitas. - File dapat dilihat atau diunduh oleh pengguna yang berhak.

### FR-11 --- Status dan Penyimpanan Laporan (Personal)

Pada tahap ini, laporan hanya memiliki status personal: Draft dan Final/Siap Diunduh. Pengajuan, review, komentar, revisi oleh atasan, dan persetujuan belum tersedia. ASN dapat membuka kembali draft dan mengeditnya sebelum menandai laporan final atau mengunduh.

**Acceptance criteria:** - Laporan tersimpan terikat ke akun ASN. - ASN dapat mengedit draft miliknya. - Tidak ada proses review atau approval atasan di MVP. - Status Final tidak berarti laporan telah disahkan secara formal oleh pejabat penilai.

### FR-12 --- Search & Filter

Pencarian aktivitas berdasarkan keyword serta filter: - Rentang
tanggal. - Bulan/tahun. - Kategori. - Target. - Status. - Prioritas. -
Bukti dukung tersedia/tidak.

### FR-13 --- Konfigurasi Personal

Admin Management tidak tersedia di UI pada versi ini. Kategori aktivitas dan template laporan dapat menggunakan nilai konfigurasi/seed yang disediakan aplikasi. Target kinerja tidak menggunakan seed wajib: ASN dapat memasukkan target sendiri, dan target yang dibuat pengguna menjadi data personal.

### FR-14 --- Audit Log

Catat aktivitas penting: - Login/logout. - Pembuatan, perubahan,
penghapusan aktivitas. - Perubahan target. - Generate laporan. -
Pembuatan, perubahan, penghapusan aktivitas dan target. - Generate/export laporan. - Login/logout.

------------------------------------------------------------------------

## 7. Laporan Bulanan: Detail Format

### 7.1 Header

**LAPORAN AKTIVITAS KERJA BULANAN**

Periode: \[Bulan Tahun\]

Nama: \[Nama ASN\]\
NIP: \[NIP\]\
Jabatan: \[Jabatan\]\
Unit Kerja: \[Unit\]

### 7.2 Ringkasan Pelaksanaan Tugas

Narasi ringkasan dibuat dari aktivitas yang tercatat selama periode
laporan. Narasi harus faktual, formal, dan dapat diedit.

### 7.3 Tabel Aktivitas

  No   Tanggal   Kegiatan   Output / Hasil   Target Kinerja
  ---- --------- ---------- ---------------- ----------------

### 7.4 Capaian Target

  --------------------------------------------------------------------------
  Target Kinerja Indikator      Target         Realisasi      Aktivitas
                                               Tercatat       Pendukung
  -------------- -------------- -------------- -------------- --------------

  --------------------------------------------------------------------------

### 7.5 Kendala dan Tindak Lanjut

Tampilkan kendala dan tindak lanjut yang dicatat pegawai. Jika tidak
tersedia, tampilkan keterangan bahwa belum ada kendala yang dicatat.

### 7.6 Penutup

Narasi penutup standar yang dapat diedit pengguna.

------------------------------------------------------------------------

## 8. UI/UX Requirements

### 8.1 Design Principles

-   Professional dan modern.
-   Minimalis.
-   Prioritaskan produktivitas.
-   Mudah digunakan oleh berbagai tingkat literasi digital.
-   Mobile-first.
-   Konsisten dan accessible.
-   Meminimalkan jumlah klik untuk pencatatan.

### 8.2 Visual Direction

-   Background: putih / abu-abu sangat muda.
-   Primary: navy atau deep blue.
-   Accent: teal atau sky blue.
-   Font: Inter atau font sans-serif modern.
-   Card radius: 12--16px.
-   Border: subtle.
-   Shadow: lembut dan terbatas.
-   Icons: Lucide.
-   Spacing konsisten.
-   Hindari gradient berlebihan, dekorasi, dan dashboard terlalu padat.

### 8.3 Responsive Layout

**Desktop:** - Sidebar. - Topbar. - Konten utama dengan grid yang
proporsional.

**Mobile:** - Bottom navigation. - Tombol tambah aktivitas mudah
dijangkau. - Form bertahap atau ringkas. - Tidak ada horizontal
scrolling yang tidak diperlukan. - Target layar 360--430 px.

### 8.4 UI Components

-   Sidebar / bottom navigation.
-   Topbar.
-   Stat cards.
-   Activity card.
-   Timeline.
-   Progress bar.
-   Calendar.
-   Filter toolbar.
-   Search.
-   Modal / drawer.
-   Toast.
-   Empty state.
-   Skeleton loading.
-   Confirmation dialog.
-   Report preview/editor.

------------------------------------------------------------------------

## 9. Data Model

### 9.1 `profiles`

  Field           Type        Description
  --------------- ----------- -----------------------------
  id              UUID        Primary key
  user_id         UUID        Auth user reference
  full_name       Text        Nama
  nip             Text        NIP
  job_title       Text        Jabatan
  unit_id         UUID        Unit kerja
  supervisor_id   UUID        Atasan (opsional, untuk fase berikutnya)
  role            Enum        employee (role aktif pada MVP)
  created_at      Timestamp   Waktu dibuat

### 9.2 `units`

  Field            Type   Description
  ---------------- ------ -------------
  id               UUID   Primary key
  name             Text   Nama unit
  parent_unit_id   UUID   Parent unit

### 9.3 `performance_targets`

  Field          Type        Description
  -------------- ----------- ------------------
  id             UUID        Primary key
  user_id        UUID        Pemilik target
  title          Text        Nama target
  description    Text        Deskripsi
  indicator      Text        Indikator
  target_value   Numeric     Target kuantitas
  unit           Text        Satuan
  period_start   Date        Awal periode
  period_end     Date        Akhir periode
  status         Text        Status
  created_at     Timestamp   Waktu dibuat

### 9.4 `activities`

  Field                Type        Description
  -------------------- ----------- ---------------------------
  id                   UUID        Primary key
  user_id              UUID        Pemilik aktivitas
  target_id            UUID        Target terkait (nullable)
  activity_date        Date        Tanggal
  title                Text        Judul
  description          Text        Deskripsi
  category             Text        Kategori
  output_description   Text        Output
  output_quantity      Numeric     Jumlah output
  output_unit          Text        Satuan
  duration_minutes     Integer     Durasi
  status               Text        Status
  priority             Text        Prioritas
  tags                 JSONB       Tag
  challenges           Text        Kendala
  follow_up            Text        Tindak lanjut
  created_at           Timestamp   Waktu dibuat
  updated_at           Timestamp   Waktu diperbarui

### 9.5 `activity_attachments`

  Field         Type        Description
  ------------- ----------- --------------
  id            UUID        Primary key
  activity_id   UUID        Aktivitas
  file_name     Text        Nama file
  file_path     Text        Storage path
  mime_type     Text        MIME
  file_size     Integer     Ukuran
  uploaded_by   UUID        Pengunggah
  created_at    Timestamp   Waktu upload

### 9.6 `monthly_reports`

  Field            Type        Description
  ---------------- ----------- -------------------------
  id               UUID        Primary key
  user_id          UUID        Pemilik laporan
  month            Integer     Bulan
  year             Integer     Tahun
  summary          Text        Ringkasan
  report_content   JSONB       Isi laporan terstruktur
  status           Text        Status workflow
  submitted_at     Timestamp   Pengajuan
  approved_at      Timestamp   Persetujuan
  created_at       Timestamp   Waktu dibuat
  updated_at       Timestamp   Waktu diperbarui

### 9.7 `report_reviews` (Future Scope — belum digunakan pada MVP)

  Field         Type        Description
  ------------- ----------- ---------------
  id            UUID        Primary key
  report_id     UUID        Laporan
  reviewer_id   UUID        Reviewer
  comments      Text        Catatan
  status        Text        Status review
  created_at    Timestamp   Waktu review

### 9.8 `notifications`

  Field        Type        Description
  ------------ ----------- --------------
  id           UUID        Primary key
  user_id      UUID        Penerima
  title        Text        Judul
  message      Text        Isi
  read_at      Timestamp   Waktu dibaca
  created_at   Timestamp   Waktu dibuat

### 9.9 `audit_logs`

  Field         Type        Description
  ------------- ----------- -------------
  id            UUID        Primary key
  user_id       UUID        Pelaku
  action        Text        Aksi
  entity_type   Text        Jenis objek
  entity_id     UUID        ID objek
  metadata      JSONB       Detail
  created_at    Timestamp   Waktu aksi

------------------------------------------------------------------------

## 10. Security & Privacy

-   Gunakan autentikasi yang aman.
-   Terapkan Role-Based Access Control.
-   Terapkan Row Level Security (RLS) pada database.
-   ASN hanya dapat mengakses data miliknya.
-   Hanya ASN yang dapat login pada MVP.
-   Setiap ASN hanya dapat mengakses profil, target, aktivitas, lampiran, dan laporan miliknya.
-   Role Atasan dan Admin belum diaktifkan; aksesnya merupakan future scope.
-   Validasi seluruh input.
-   Batasi ukuran dan tipe file.
-   Simpan file evidence di private storage.
-   Gunakan signed URL untuk akses file.
-   Jangan menaruh API key pada frontend.
-   Terapkan audit log.
-   Minimalkan paparan data personal.
-   Gunakan environment variables untuk konfigurasi rahasia.

------------------------------------------------------------------------

## 11. Technology Stack

### Frontend

-   React
-   TypeScript
-   Vite
-   Tailwind CSS
-   Shadcn UI
-   Lucide Icons
-   Recharts

### Backend / Platform

-   Supabase
-   PostgreSQL
-   Supabase Auth
-   Supabase Storage atau S3-compatible object storage
-   Supabase RLS

### AI

-   Provider AI dengan API abstraction.
-   Structured output (JSON) untuk hasil yang dapat diedit.
-   Mock mode saat API tidak tersedia.
-   AI prompt harus mengutamakan grounded generation dari data
    aktivitas.

### Export

-   PDF.
-   DOCX.
-   XLSX.

------------------------------------------------------------------------

## 12. Prototype Seed Data

Gunakan data ASN dummy untuk demo. Jangan gunakan identitas asli.

Contoh aktivitas: - Pemeliharaan aplikasi SIMOPPA. - Pemeriksaan
performa database PostgreSQL. - Backup database aplikasi. - Koordinasi
teknis infrastruktur server. - Penyusunan laporan monitoring layanan
TI. - Pengolahan dan validasi data. - Pengembangan dashboard
monitoring. - Troubleshooting jaringan. - Rapat koordinasi. -
Dokumentasi sistem informasi.

Contoh target: - Pengelolaan layanan TI. - Pengembangan aplikasi dan
dashboard. - Pengelolaan data. - Dukungan teknis. - Dokumentasi dan
pelaporan.

------------------------------------------------------------------------

## 13. Non-Functional Requirements

### Performance

-   Halaman utama tampil cepat pada koneksi kantor maupun seluler.
-   Pencarian dan filter terasa responsif.
-   Proses generate laporan menampilkan loading/progress state.

### Reliability

-   Data tersimpan persisten.
-   Error ditampilkan dengan pesan yang jelas.
-   Pengguna tidak kehilangan input ketika terjadi error yang dapat
    dipulihkan.

### Accessibility

-   Kontras teks memadai.
-   Form memiliki label.
-   Navigasi dapat diakses dengan keyboard.
-   Status tidak hanya dibedakan dengan warna.

### Maintainability

-   Komponen UI reusable.
-   Pemisahan UI, data access, dan business logic.
-   Struktur kode konsisten.
-   Mock data dapat diganti backend tanpa rewrite UI.

------------------------------------------------------------------------

## 14. Acceptance Criteria MVP

MVP dianggap siap demo jika:

-   [ ] Login hanya tersedia untuk akun ASN.
-   [ ] Dashboard personal menampilkan data ASN yang login.
-   [ ] ASN dapat menambah, melihat, mengedit, dan menghapus aktivitas.
-   [ ] Quick Add dapat digunakan.
-   [ ] Aktivitas dapat dipetakan ke target.
-   [ ] Aktivitas dapat dicari dan difilter.
-   [ ] Bukti dukung dapat diunggah (atau mock upload pada demo).
-   [ ] Rekap mingguan dapat ditampilkan.
-   [ ] Laporan bulanan dapat dibuat dari data aktivitas.
-   [ ] Isi laporan dapat diedit.
-   [ ] Export laporan tersedia minimal PDF.
-   [ ] ASN dapat membuat, mengedit, dan mengarsipkan target kinerja sendiri.
-   [ ] Target kinerja yang dibuat ASN dapat dipilih/ditautkan ke aktivitas hariannya.
-   [ ] Tidak ada menu atau proses login Atasan/Admin pada MVP.
-   [ ] Layout responsif desktop dan mobile.
-   [ ] Empty state, loading state, error state, dan success state
    tersedia.
-   [ ] Data demo cukup realistis untuk presentasi.

------------------------------------------------------------------------

## 15. Demo Scenario

1.  Login sebagai ASN.
2.  Tinjau dashboard.
3.  Tambahkan aktivitas menggunakan kalimat natural.
4.  Periksa saran AI dan edit jika diperlukan.
5.  Hubungkan aktivitas dengan target kinerja.
6.  Tambahkan output dan bukti dukung.
7.  Lihat timeline aktivitas.
8.  Buka rekap mingguan.
9.  Generate laporan bulanan.
10. Edit ringkasan laporan.
11. Preview dan export PDF.
12. Pastikan target yang dibuat tampil pada daftar target milik ASN.
13. (Review atasan tidak didemonstrasikan karena belum termasuk MVP.)

------------------------------------------------------------------------

## 16. Prioritas Pengembangan

### P0 --- Wajib untuk demo

-   Autentikasi demo untuk ASN saja.
-   Dashboard.
-   CRUD aktivitas.
-   Quick Add.
-   Target kinerja.
-   Rekap aktivitas.
-   Generator laporan bulanan.
-   Edit laporan.
-   Preview laporan.
-   Export PDF.
-   Responsive UI.

### P1 --- Nilai tambah

-   AI perapihan narasi.
-   Upload bukti dukung.
-   Export DOCX/XLSX.
-   Notifikasi personal.

### P2 --- Pengembangan lanjutan

-   Integrasi sistem e-Kinerja.
-   Integrasi kalender dan sistem tiket.
-   Reminder pencatatan aktivitas.
-   Template laporan per jabatan.
-   Analitik tren kinerja.
-   Login Atasan dan Admin.
-   Review, komentar, revisi, dan persetujuan laporan.
-   Dashboard unit dan statistik lintas pegawai.
-   Admin panel untuk manajemen akun dan konfigurasi.

------------------------------------------------------------------------

## 17. Development Instructions untuk AI Coding Agent

Bangun aplikasi **JEJAK KINERJA AI** berdasarkan PRD ini.

Ketentuan: 1. Implementasikan aplikasi end-to-end, bukan sekadar UI
statis. 2. Gunakan komponen reusable dan desain konsisten. 3. Buat
halaman sesuai role. 4. Implementasikan seluruh alur MVP. 5. Gunakan
seed data yang realistis. 6. Jika Supabase belum dikonfigurasi, gunakan
mock backend dengan interface data layer yang mudah diganti. 7. Jangan
membuat tombol yang tidak berfungsi. 8. Setiap form memiliki validasi.
9. Tampilkan feedback untuk loading, error, success, dan empty state.
10. Pastikan desktop dan mobile sama-sama nyaman. 11. AI harus
menghasilkan narasi berdasarkan data sumber dan tidak mengarang capaian.
12. Laporan harus dapat diedit sebelum disimpan, diajukan, atau
diekspor. 13. Gunakan bahasa Indonesia untuk UI. 14. Gunakan format
tanggal Indonesia dan zona waktu yang konsisten. 15. Buat README berisi
cara menjalankan aplikasi, konfigurasi env, akun demo, dan keterbatasan
prototipe.

**Deliverable:** Prototipe JEJAK KINERJA AI yang dapat didemonstrasikan dari
login, input aktivitas, rekap, generate laporan bulanan, hingga generate laporan bulanan personal dan export.
