/* Fungsi validasi formulir, penguraian angka desimal (koma/titik), dan validasi berkas bukti dukung */

import {
  ALLOWED_ATTACHMENT_EXTENSIONS,
  ALLOWED_ATTACHMENT_MIME_TYPES,
  MAX_ATTACHMENT_SIZE_BYTES,
} from '../config';

export interface ValidationErrors {
  [field: string]: string;
}

export function parseDecimalInput(raw: string): number | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const normalized = trimmed.replace(',', '.');
  if (!/^-?\d+(\.\d+)?$/.test(normalized)) return Number.NaN;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

export function parseIntegerInput(raw: string): number | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  if (!/^\d+$/.test(trimmed)) return Number.NaN;
  const parsed = Number.parseInt(trimmed, 10);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

export function validateActivityForm(input: {
  activity_date: string;
  title: string;
  output_quantity_raw: string;
  duration_minutes_raw: string;
}): ValidationErrors {
  const errors: ValidationErrors = {};

  if (!input.activity_date.trim()) {
    errors.activity_date =
      'Pilih tanggal pelaksanaan aktivitas, misalnya 19 November 2026.';
  }

  if (!input.title.trim()) {
    errors.title =
      'Isi judul aktivitas terlebih dahulu, misalnya Pemeliharaan database SIMOPPA.';
  } else if (input.title.trim().length < 3) {
    errors.title =
      'Judul aktivitas minimal 3 karakter, misalnya Rapat koordinasi.';
  }

  if (input.output_quantity_raw.trim()) {
    const qty = parseDecimalInput(input.output_quantity_raw);
    if (qty === null || Number.isNaN(qty) || qty < 0) {
      errors.output_quantity =
        'Masukkan jumlah output berupa angka nol atau lebih, misalnya 2 atau 1,5.';
    }
  }

  if (input.duration_minutes_raw.trim()) {
    const dur = parseIntegerInput(input.duration_minutes_raw);
    if (dur === null || Number.isNaN(dur) || dur <= 0 || dur > 1440) {
      errors.duration_minutes =
        'Masukkan durasi dalam menit antara 1 sampai 1440, misalnya 90.';
    }
  }

  return errors;
}

export function validateTargetForm(input: {
  title: string;
  indicator: string;
  target_value_raw: string;
  period_start: string;
  period_end: string;
}): ValidationErrors {
  const errors: ValidationErrors = {};

  if (!input.title.trim()) {
    errors.title =
      'Isi nama target kinerja terlebih dahulu, misalnya Pengelolaan layanan TI.';
  }

  if (!input.indicator.trim()) {
    errors.indicator =
      'Isi indikator keberhasilan target, misalnya Persentase penyelesaian tiket layanan.';
  }

  if (input.target_value_raw.trim()) {
    const val = parseDecimalInput(input.target_value_raw);
    if (val === null || Number.isNaN(val) || val <= 0) {
      errors.target_value =
        'Masukkan nilai target lebih dari nol, misalnya 12 atau 95,5.';
    }
  }

  if (!input.period_start.trim()) {
    errors.period_start =
      'Pilih tanggal mulai periode target, misalnya 1 Januari 2026.';
  }

  if (!input.period_end.trim()) {
    errors.period_end =
      'Pilih tanggal selesai periode target, misalnya 31 Desember 2026.';
  } else if (
    input.period_start.trim() &&
    input.period_end.trim() < input.period_start.trim()
  ) {
    errors.period_end =
      'Tanggal selesai tidak boleh lebih awal dari tanggal mulai periode.';
  }

  return errors;
}

export function validateProfileForm(input: {
  full_name: string;
  nip: string;
  job_title: string;
  unit_name: string;
}): ValidationErrors {
  const errors: ValidationErrors = {};

  if (!input.full_name.trim()) {
    errors.full_name =
      'Isi nama lengkap Anda, misalnya Rizky Pratama, S.Kom.';
  }

  const nipClean = input.nip.trim().replace(/\s+/g, '');
  if (!nipClean || !/^\d{8,18}$/.test(nipClean)) {
    errors.nip =
      'Masukkan NIP berupa 8 sampai 18 digit angka, misalnya 199204152019031004.';
  }

  if (!input.job_title.trim()) {
    errors.job_title =
      'Isi jabatan saat ini, misalnya Pranata Komputer Ahli Pertama.';
  }

  if (!input.unit_name.trim()) {
    errors.unit_name =
      'Isi nama unit kerja Anda, misalnya Bidang Layanan Teknologi Informasi.';
  }

  return errors;
}

export function validateAttachmentFile(file: File): string | null {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
  const validExt = ALLOWED_ATTACHMENT_EXTENSIONS.includes(ext);
  const validMime =
    !file.type || ALLOWED_ATTACHMENT_MIME_TYPES.includes(file.type);

  if (!validExt || !validMime) {
    return 'Format berkas tidak didukung; gunakan PDF, JPG, PNG, DOC, DOCX, XLS, atau XLSX.';
  }

  if (file.size > MAX_ATTACHMENT_SIZE_BYTES) {
    return 'Ukuran berkas melebihi 5 MB; pilih berkas yang lebih kecil.';
  }

  return null;
}

export function focusFirstError(
  errors: ValidationErrors,
  fieldRefs: Record<string, HTMLElement | null>
): void {
  const firstKey = Object.keys(errors)[0];
  if (!firstKey) return;
  const el = fieldRefs[firstKey];
  if (el && typeof el.focus === 'function') {
    el.focus();
  }
}
