/* Lapisan akses data browser (satu kunci localStorage) dengan isolasi data per akun ASN, seed realistis, dan pencatatan audit log */

import {
  APP_STATE_VERSION,
  APP_STORAGE_KEY,
  DEMO_ACCOUNTS_METADATA,
  DEMO_UNITS,
} from '../config';
import {
  Activity,
  ActivityAttachment,
  AppState,
  AuditLog,
  MonthlyReport,
  PerformanceTarget,
  PersonalNotification,
  Profile,
  WeeklyRecapNote,
} from '../types';
import { addDaysISO, getTodayISO } from './format';

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 8);
  return `${prefix}-${Date.now()}-${rand}`;
}

export function buildSeedState(): AppState {
  const today = getTodayISO();
  const currentYear = Number(today.slice(0, 4));
  const yearStart = `${currentYear}-01-01`;
  const yearEnd = `${currentYear}-12-31`;
  const nowISO = new Date().toISOString();

  const profiles: Profile[] = DEMO_ACCOUNTS_METADATA.map((acc) => ({
    id: `prof-${acc.user_id}`,
    user_id: acc.user_id,
    email: acc.email,
    demo_password: acc.demo_password,
    full_name: acc.full_name,
    nip: acc.nip,
    job_title: acc.job_title,
    unit_id: acc.unit_id,
    unit_name: acc.unit_name,
    supervisor_name: acc.supervisor_name,
    role: 'employee',
    created_at: nowISO,
  }));

  const targets: PerformanceTarget[] = [
    {
      id: 'tgt-01',
      user_id: 'asn-user-01',
      title: 'Pengelolaan layanan TI',
      description: 'Menjaga keandalan sistem layanan internal, basis data, dan infrastruktur server.',
      indicator: 'Jumlah pemeliharaan dan monitoring layanan TI yang terselesaikan',
      target_value: 24,
      unit: 'Kegiatan',
      period_start: yearStart,
      period_end: yearEnd,
      status: 'Aktif',
      created_at: nowISO,
    },
    {
      id: 'tgt-02',
      user_id: 'asn-user-01',
      title: 'Pengembangan aplikasi dan dashboard',
      description: 'Merancang dan memperbarui modul aplikasi serta dashboard pemantauan.',
      indicator: 'Jumlah rilis modul/fitur aplikasi yang diselesaikan',
      target_value: 6,
      unit: 'Modul',
      period_start: yearStart,
      period_end: yearEnd,
      status: 'Aktif',
      created_at: nowISO,
    },
    {
      id: 'tgt-03',
      user_id: 'asn-user-01',
      title: 'Dokumentasi dan pelaporan',
      description: 'Menyusun dokumentasi teknis sistem informasi dan laporan monitoring berkala.',
      indicator: 'Jumlah dokumen dan laporan teknis yang diterbitkan',
      target_value: 12,
      unit: 'Laporan',
      period_start: yearStart,
      period_end: yearEnd,
      status: 'Aktif',
      created_at: nowISO,
    },
    {
      id: 'tgt-04',
      user_id: 'asn-user-02',
      title: 'Pengolahan data',
      description: 'Melakukan pembersihan, validasi, dan integrasi dataset statistik sektoral.',
      indicator: 'Jumlah dataset tervalidasi sesuai standar mutu',
      target_value: 15,
      unit: 'Dataset',
      period_start: yearStart,
      period_end: yearEnd,
      status: 'Aktif',
      created_at: nowISO,
    },
    {
      id: 'tgt-05',
      user_id: 'asn-user-02',
      title: 'Dukungan teknis',
      description: 'Memberikan asistensi pengolahan data dan penyusunan publikasi indikator daerah.',
      indicator: 'Jumlah layanan konsultasi data yang ditindaklanjuti',
      target_value: 20,
      unit: 'Tiket',
      period_start: yearStart,
      period_end: yearEnd,
      status: 'Aktif',
      created_at: nowISO,
    },
  ];

  const activities: Activity[] = [
    {
      id: 'act-01',
      user_id: 'asn-user-01',
      target_id: 'tgt-01',
      activity_date: today,
      title: 'Pemeliharaan aplikasi SIMOPPA',
      description: 'Melaksanakan pemeliharaan rutin modul autentikasi dan pengecekan log aplikasi SIMOPPA.',
      category: 'Pemeliharaan Sistem & Database',
      output_description: 'Log pemeliharaan aplikasi SIMOPPA berjalan normal',
      output_quantity: 1,
      output_unit: 'Laporan',
      duration_minutes: 90,
      status: 'Selesai',
      priority: 'Tinggi',
      tags: ['simoppa', 'pemeliharaan'],
      challenges: '',
      follow_up: 'Pemantauan lanjutan pada jadwal pembaruan berikutnya.',
      created_at: nowISO,
      updated_at: nowISO,
    },
    {
      id: 'act-02',
      user_id: 'asn-user-01',
      target_id: 'tgt-01',
      activity_date: today,
      title: 'Backup database aplikasi',
      description: 'Melakukan pencadangan basis data produksi serta verifikasi integritas berkas cadangan harian.',
      category: 'Pemeliharaan Sistem & Database',
      output_description: 'Arsip cadangan database harian terverifikasi',
      output_quantity: 2,
      output_unit: 'Sistem',
      duration_minutes: 45,
      status: 'Selesai',
      priority: 'Tinggi',
      tags: ['backup', 'database'],
      challenges: '',
      follow_up: '',
      created_at: nowISO,
      updated_at: nowISO,
    },
    {
      id: 'act-03',
      user_id: 'asn-user-01',
      target_id: 'tgt-01',
      activity_date: addDaysISO(today, -1),
      title: 'Pemeriksaan performa database PostgreSQL',
      description: 'Menganalisis kueri lambat dan penggunaan indeks pada database PostgreSQL layanan internal.',
      category: 'Pemeliharaan Sistem & Database',
      output_description: 'Catatan optimasi indeks kueri PostgreSQL',
      output_quantity: 1,
      output_unit: 'Dokumen',
      duration_minutes: 120,
      status: 'Selesai',
      priority: 'Sedang',
      tags: ['postgresql', 'performa'],
      challenges: 'Lonjakan beban baca pada jam pelaporan pukul 10.00 WIB.',
      follow_up: 'Penambahan indeks komposit pada tabel transaksi.',
      created_at: nowISO,
      updated_at: nowISO,
    },
    {
      id: 'act-04',
      user_id: 'asn-user-01',
      target_id: 'tgt-02',
      activity_date: addDaysISO(today, -2),
      title: 'Pengembangan dashboard monitoring',
      description: 'Menyusun komponen grafik ringkasan ketersediaan layanan untuk dashboard monitoring unit kerja.',
      category: 'Pengembangan Aplikasi',
      output_description: 'Modul visualisasi tren layanan TI',
      output_quantity: 1,
      output_unit: 'Modul',
      duration_minutes: 180,
      status: 'Sedang dikerjakan',
      priority: 'Sedang',
      tags: ['dashboard', 'monitoring'],
      challenges: 'Menunggu penyesuaian format data dari tim jaringan.',
      follow_up: 'Uji integrasi data pada akhir pekan ini.',
      created_at: nowISO,
      updated_at: nowISO,
    },
    {
      id: 'act-05',
      user_id: 'asn-user-01',
      target_id: 'tgt-01',
      activity_date: addDaysISO(today, -3),
      title: 'Koordinasi teknis infrastruktur server',
      description: 'Rapat koordinasi bersama tim infrastruktur terkait jadwal pembaruan keamanan sistem operasi server.',
      category: 'Koordinasi & Rapat',
      output_description: 'Notulen jadwal pembaruan keamanan server',
      output_quantity: 1,
      output_unit: 'Dokumen',
      duration_minutes: 60,
      status: 'Selesai',
      priority: 'Sedang',
      tags: ['server', 'koordinasi'],
      challenges: '',
      follow_up: '',
      created_at: nowISO,
      updated_at: nowISO,
    },
    {
      id: 'act-06',
      user_id: 'asn-user-01',
      target_id: 'tgt-03',
      activity_date: addDaysISO(today, -4),
      title: 'Penyusunan laporan monitoring layanan TI',
      description: 'Menghimpun data ketersediaan aplikasi dan menyusun draf laporan monitoring layanan TI mingguan.',
      category: 'Dokumentasi & Pelaporan',
      output_description: 'Draf laporan monitoring layanan TI',
      output_quantity: 1,
      output_unit: 'Laporan',
      duration_minutes: 90,
      status: 'Selesai',
      priority: 'Sedang',
      tags: ['laporan', 'monitoring'],
      challenges: '',
      follow_up: '',
      created_at: nowISO,
      updated_at: nowISO,
    },
    {
      id: 'act-07',
      user_id: 'asn-user-01',
      target_id: 'tgt-01',
      activity_date: addDaysISO(today, -5),
      title: 'Troubleshooting jaringan',
      description: 'Menangani gangguan konektivitas VPN pada ruang kerja bidang layanan dan memulihkan akses aplikasi.',
      category: 'Dukungan Teknis Pengguna',
      output_description: 'Tiket gangguan konektivitas VPN terselesaikan',
      output_quantity: 3,
      output_unit: 'Tiket',
      duration_minutes: 75,
      status: 'Selesai',
      priority: 'Tinggi',
      tags: ['jaringan', 'vpn'],
      challenges: 'Sertifikat klien VPN kadaluarsa pada beberapa perangkat.',
      follow_up: 'Pembaruan panduan perpanjangan sertifikat untuk pegawai.',
      created_at: nowISO,
      updated_at: nowISO,
    },
    {
      id: 'act-08',
      user_id: 'asn-user-01',
      target_id: 'tgt-03',
      activity_date: addDaysISO(today, -6),
      title: 'Dokumentasi sistem informasi',
      description: 'Memperbarui dokumentasi alur pemulihan sistem dan daftar kontak penanggung jawab aplikasi.',
      category: 'Dokumentasi & Pelaporan',
      output_description: 'Dokumen SOP pemulihan sistem informasi',
      output_quantity: 1,
      output_unit: 'Dokumen',
      duration_minutes: 110,
      status: 'Selesai',
      priority: 'Rendah',
      tags: ['dokumentasi', 'sop'],
      challenges: '',
      follow_up: '',
      created_at: nowISO,
      updated_at: nowISO,
    },
    {
      id: 'act-09',
      user_id: 'asn-user-02',
      target_id: 'tgt-04',
      activity_date: today,
      title: 'Pengolahan dan validasi data',
      description: 'Melakukan validasi silang dataset statistik sektoral triwulan berjalan dan memeriksa nilai pencilan.',
      category: 'Pengolahan & Validasi Data',
      output_description: 'Dataset statistik sektoral tervalidasi',
      output_quantity: 2,
      output_unit: 'Dataset',
      duration_minutes: 120,
      status: 'Selesai',
      priority: 'Tinggi',
      tags: ['validasi', 'statistik'],
      challenges: 'Format kode wilayah pada dua berkas sumber belum seragam.',
      follow_up: 'Konfirmasi pemetaan kode wilayah dengan operator data.',
      created_at: nowISO,
      updated_at: nowISO,
    },
    {
      id: 'act-10',
      user_id: 'asn-user-02',
      target_id: 'tgt-05',
      activity_date: addDaysISO(today, -1),
      title: 'Rapat koordinasi standar metadata',
      description: 'Mengikuti rapat koordinasi penyelarasan metadata indikator kinerja antarbidang.',
      category: 'Koordinasi & Rapat',
      output_description: 'Kesepakatan format metadata indikator',
      output_quantity: 1,
      output_unit: 'Dokumen',
      duration_minutes: 90,
      status: 'Selesai',
      priority: 'Sedang',
      tags: ['rapat', 'metadata'],
      challenges: '',
      follow_up: '',
      created_at: nowISO,
      updated_at: nowISO,
    },
  ];

  const notifications: PersonalNotification[] = [
    {
      id: 'notif-01',
      user_id: 'asn-user-01',
      title: 'Pengingat Rekap Mingguan',
      message: 'Tinjau catatan aktivitas minggu ini sebelum menyusun ringkasan mingguan.',
      read_at: null,
      created_at: nowISO,
    },
    {
      id: 'notif-02',
      user_id: 'asn-user-02',
      title: 'Validasi Data Bulan Berjalan',
      message: 'Pastikan seluruh output dataset telah dicatat pada aktivitas harian.',
      read_at: null,
      created_at: nowISO,
    },
  ];

  const audit_logs: AuditLog[] = [
    {
      id: 'audit-seed-01',
      user_id: 'asn-user-01',
      action: 'seed_initialized',
      entity_type: 'system',
      entity_id: 'asn-user-01',
      metadata: { keterangan: 'Data demo awal ASN disiapkan' },
      created_at: nowISO,
    },
  ];

  return {
    version: APP_STATE_VERSION,
    current_user_id: null,
    units: DEMO_UNITS,
    profiles,
    performance_targets: targets,
    activities,
    activity_attachments: [],
    monthly_reports: [],
    weekly_recaps: [],
    notifications,
    audit_logs,
  };
}

export function loadAppState(): AppState {
  try {
    const raw = window.localStorage.getItem(APP_STORAGE_KEY);
    if (!raw) {
      const seed = buildSeedState();
      saveAppState(seed);
      return seed;
    }
    const parsed = JSON.parse(raw) as Partial<AppState>;
    if (
      !parsed ||
      typeof parsed !== 'object' ||
      !Array.isArray(parsed.profiles) ||
      !Array.isArray(parsed.activities) ||
      !Array.isArray(parsed.performance_targets)
    ) {
      const seed = buildSeedState();
      saveAppState(seed);
      return seed;
    }
    return {
      version: parsed.version ?? APP_STATE_VERSION,
      current_user_id: parsed.current_user_id ?? null,
      units: Array.isArray(parsed.units) ? parsed.units : DEMO_UNITS,
      profiles: parsed.profiles,
      performance_targets: parsed.performance_targets,
      activities: parsed.activities,
      activity_attachments: Array.isArray(parsed.activity_attachments)
        ? parsed.activity_attachments
        : [],
      monthly_reports: Array.isArray(parsed.monthly_reports)
        ? parsed.monthly_reports
        : [],
      weekly_recaps: Array.isArray(parsed.weekly_recaps)
        ? parsed.weekly_recaps
        : [],
      notifications: Array.isArray(parsed.notifications)
        ? parsed.notifications
        : [],
      audit_logs: Array.isArray(parsed.audit_logs) ? parsed.audit_logs : [],
    };
  } catch {
    const seed = buildSeedState();
    saveAppState(seed);
    return seed;
  }
}

export function saveAppState(state: AppState): void {
  try {
    window.localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Abaikan error kuota penuh secara aman agar aplikasi tidak crash
  }
}

export function appendAuditLog(
  state: AppState,
  userId: string,
  action: string,
  entityType: string,
  entityId: string,
  metadata: Record<string, string | number | boolean | null> = {}
): AppState {
  const newLog: AuditLog = {
    id: createId('audit'),
    user_id: userId,
    action,
    entity_type: entityType,
    entity_id: entityId,
    metadata,
    created_at: new Date().toISOString(),
  };
  return {
    ...state,
    audit_logs: [newLog, ...state.audit_logs].slice(0, 200),
  };
}

export function getUserScopedData(state: AppState, userId: string) {
  const profile = state.profiles.find((p) => p.user_id === userId) ?? null;
  const targets = state.performance_targets.filter((t) => t.user_id === userId);
  const activities = state.activities.filter((a) => a.user_id === userId);
  const attachments = state.activity_attachments.filter(
    (att) => att.user_id === userId
  );
  const reports = state.monthly_reports.filter((r) => r.user_id === userId);
  const weeklyRecaps = state.weekly_recaps.filter((w) => w.user_id === userId);
  const notifications = state.notifications.filter((n) => n.user_id === userId);
  const auditLogs = state.audit_logs.filter((l) => l.user_id === userId);

  return {
    profile,
    targets,
    activities,
    attachments,
    reports,
    weeklyRecaps,
    notifications,
    auditLogs,
  };
}

export function authenticateAsn(
  state: AppState,
  identifier: string,
  password: string
): { profile: Profile | null; nextState: AppState; error: string | null } {
  const cleanId = identifier.trim().toLowerCase();
  const cleanPass = password.trim();

  if (!cleanId || !cleanPass) {
    return {
      profile: null,
      nextState: state,
      error:
        'Masukkan email atau NIP beserta kata sandi demo ASN untuk masuk.',
    };
  }

  const matched = state.profiles.find(
    (p) =>
      p.role === 'employee' &&
      (p.email.toLowerCase() === cleanId || p.nip === cleanId)
  );

  if (!matched || matched.demo_password !== cleanPass) {
    return {
      profile: null,
      nextState: state,
      error:
        'Email/NIP atau kata sandi demo ASN tidak sesuai; gunakan tombol isi akun demo di bawah.',
    };
  }

  const withUser: AppState = {
    ...state,
    current_user_id: matched.user_id,
  };
  const nextState = appendAuditLog(
    withUser,
    matched.user_id,
    'login',
    'auth',
    matched.user_id,
    { email: matched.email }
  );
  saveAppState(nextState);
  return { profile: matched, nextState, error: null };
}

export function logoutAsn(state: AppState): AppState {
  if (!state.current_user_id) return state;
  const userId = state.current_user_id;
  const logged = appendAuditLog(state, userId, 'logout', 'auth', userId);
  const nextState: AppState = {
    ...logged,
    current_user_id: null,
  };
  saveAppState(nextState);
  return nextState;
}

export function saveWeeklyRecapNote(
  state: AppState,
  userId: string,
  weekStart: string,
  weekEnd: string,
  summary: string
): AppState {
  const now = new Date().toISOString();
  const existing = state.weekly_recaps.find(
    (w) =>
      w.user_id === userId &&
      w.week_start === weekStart &&
      w.week_end === weekEnd
  );

  let weekly_recaps: WeeklyRecapNote[];
  let entityId: string;
  if (existing) {
    entityId = existing.id;
    weekly_recaps = state.weekly_recaps.map((w) =>
      w.id === existing.id ? { ...w, summary, updated_at: now } : w
    );
  } else {
    entityId = createId('week');
    weekly_recaps = [
      {
        id: entityId,
        user_id: userId,
        week_start: weekStart,
        week_end: weekEnd,
        summary,
        updated_at: now,
      },
      ...state.weekly_recaps,
    ];
  }

  const next = appendAuditLog(
    { ...state, weekly_recaps },
    userId,
    'save_weekly_recap',
    'weekly_recap',
    entityId,
    { week_start: weekStart, week_end: weekEnd }
  );
  saveAppState(next);
  return next;
}

export function upsertMonthlyReport(
  state: AppState,
  report: MonthlyReport
): AppState {
  const exists = state.monthly_reports.some(
    (r) => r.id === report.id && r.user_id === report.user_id
  );
  const monthly_reports = exists
    ? state.monthly_reports.map((r) => (r.id === report.id ? report : r))
    : [report, ...state.monthly_reports];

  const next = appendAuditLog(
    { ...state, monthly_reports },
    report.user_id,
    exists ? 'update_report' : 'generate_report',
    'monthly_report',
    report.id,
    { month: report.month, year: report.year, status: report.status }
  );
  saveAppState(next);
  return next;
}
