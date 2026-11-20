/* Konfigurasi bisnis, kategori aktivitas, aturan lampiran, dan data akun demo ASN */

import { ActivityPriority, ActivityStatus, Unit } from './types';

export const APP_STORAGE_KEY = 'jejak_kinerja_ai_state_v1';
export const APP_STATE_VERSION = 1;

export const APP_INFO = {
  name: 'Jejak Kinerja AI',
  tagline: 'Catat hari ini, susun kinerja tanpa repot.',
  timeZoneLabel: 'WIB',
};

export const ACTIVITY_CATEGORIES: string[] = [
  'Pengelolaan Layanan TI',
  'Pemeliharaan Sistem & Database',
  'Pengolahan & Validasi Data',
  'Pengembangan Aplikasi',
  'Koordinasi & Rapat',
  'Dokumentasi & Pelaporan',
  'Dukungan Teknis Pengguna',
];

export const ACTIVITY_STATUSES: ActivityStatus[] = [
  'Belum dimulai',
  'Sedang dikerjakan',
  'Selesai',
];

export const ACTIVITY_PRIORITIES: ActivityPriority[] = [
  'Rendah',
  'Sedang',
  'Tinggi',
];

export const OUTPUT_UNITS_SUGGESTIONS: string[] = [
  'Dokumen',
  'Laporan',
  'Tiket',
  'Sistem',
  'Dataset',
  'Kegiatan',
  'Rilis',
  'Modul',
];

export const ALLOWED_ATTACHMENT_EXTENSIONS = [
  'pdf',
  'jpg',
  'jpeg',
  'png',
  'doc',
  'docx',
  'xls',
  'xlsx',
];

export const ALLOWED_ATTACHMENT_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

export const MAX_ATTACHMENT_SIZE_BYTES = 5 * 1024 * 1024;

export const REPORT_DEFAULT_CLOSING =
  'Demikian laporan aktivitas kerja bulanan ini disusun berdasarkan catatan pekerjaan harian dan realisasi output yang terdokumentasi sebagai bahan evaluasi kinerja mandiri.';

export const DEMO_UNITS: Unit[] = [
  {
    id: 'unit-ti-01',
    name: 'Bidang Layanan Teknologi Informasi',
    parent_unit_id: null,
  },
  {
    id: 'unit-data-02',
    name: 'Bidang Pengelolaan Data dan Statistik',
    parent_unit_id: null,
  },
];

export const DEMO_ACCOUNTS_METADATA = [
  {
    user_id: 'asn-user-01',
    email: 'rizky.pratama@instansi.go.id',
    nip: '199204152019031004',
    demo_password: 'asn-demo-2026',
    full_name: 'Rizky Pratama, S.Kom.',
    job_title: 'Pranata Komputer Ahli Pertama',
    unit_id: 'unit-ti-01',
    unit_name: 'Bidang Layanan Teknologi Informasi',
    supervisor_name: 'Dra. Ratna Kusuma, M.Si. (Atasan Langsung)',
  },
  {
    user_id: 'asn-user-02',
    email: 'siti.rahmawati@instansi.go.id',
    nip: '199508212020122008',
    demo_password: 'asn-demo-2026',
    full_name: 'Siti Rahmawati, S.Stat.',
    job_title: 'Statistisi Ahli Pertama',
    unit_id: 'unit-data-02',
    unit_name: 'Bidang Pengelolaan Data dan Statistik',
    supervisor_name: 'Hendra Wijaya, M.Stat. (Atasan Langsung)',
  },
];
