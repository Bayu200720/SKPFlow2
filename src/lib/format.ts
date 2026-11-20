/* Fungsi pemformatan tanggal, waktu, angka, desimal, dan nama berkas berbahasa Indonesia */

const BULAN_INDONESIA = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

const HARI_SINGKAT = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

export function getTodayISO(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function addDaysISO(dateISO: string, offsetDays: number): string {
  const [y, m, d] = dateISO.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + offsetDays);
  const year = dt.getFullYear();
  const month = String(dt.getMonth() + 1).padStart(2, '0');
  const day = String(dt.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getCurrentMonthYear(): { month: number; year: number } {
  const now = new Date();
  return {
    month: now.getMonth() + 1,
    year: now.getFullYear(),
  };
}

export function formatTanggalIndonesia(dateStr: string): string {
  if (!dateStr) return '-';
  const clean = dateStr.slice(0, 10);
  const parts = clean.split('-').map(Number);
  if (parts.length !== 3 || parts.some(Number.isNaN)) return dateStr;
  const [year, month, day] = parts;
  const monthName = BULAN_INDONESIA[month - 1] ?? '';
  return `${day} ${monthName} ${year}`;
}

export function formatTanggalSingkat(dateStr: string): string {
  if (!dateStr) return '-';
  const clean = dateStr.slice(0, 10);
  const parts = clean.split('-').map(Number);
  if (parts.length !== 3 || parts.some(Number.isNaN)) return dateStr;
  const [year, month, day] = parts;
  const dt = new Date(year, month - 1, day);
  const hari = HARI_SINGKAT[dt.getDay()] ?? '';
  return `${hari}, ${day}/${String(month).padStart(2, '0')}`;
}

export function formatBulanTahun(month: number, year: number): string {
  const name = BULAN_INDONESIA[month - 1] ?? '';
  return `${name} ${year}`;
}

export function formatWaktuIndonesia(isoTimestamp: string): string {
  if (!isoTimestamp) return '-';
  const dt = new Date(isoTimestamp);
  if (Number.isNaN(dt.getTime())) return isoTimestamp;
  const datePart = `${dt.getDate()} ${BULAN_INDONESIA[dt.getMonth()]} ${dt.getFullYear()}`;
  const hours = String(dt.getHours()).padStart(2, '0');
  const minutes = String(dt.getMinutes()).padStart(2, '0');
  return `${datePart}, ${hours}.${minutes} WIB`;
}

export function formatBulat(value: number): string {
  return Math.round(value)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export function formatDesimal(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '-';
  const rounded = Math.round(value * 100) / 100;
  const [intPart, decPart] = rounded.toString().split('.');
  const intFormatted = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  if (!decPart) return intFormatted;
  return `${intFormatted},${decPart}`;
}

export function formatDurasi(minutes: number | null | undefined): string {
  if (minutes === null || minutes === undefined || minutes <= 0) return '-';
  if (minutes < 60) return `${formatBulat(minutes)} menit`;
  const jam = Math.floor(minutes / 60);
  const sisa = minutes % 60;
  if (sisa === 0) return `${jam} jam`;
  return `${jam} jam ${sisa} menit`;
}

export function formatUkuranBerkas(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${formatDesimal(bytes / 1024)} KB`;
  return `${formatDesimal(bytes / (1024 * 1024))} MB`;
}

export function getMonthOptions(): { value: number; label: string }[] {
  return BULAN_INDONESIA.map((label, idx) => ({ value: idx + 1, label }));
}

export function buildExportFileName(
  fullName: string,
  month: number,
  year: number,
  ext: 'pdf' | 'docx' | 'xlsx'
): string {
  const cleanName = fullName
    .split(',')[0]
    .trim()
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .replace(/\s+/g, '_');
  const monthStr = String(month).padStart(2, '0');
  return `Laporan_Kinerja_Bulanan_${cleanName || 'ASN'}_${year}-${monthStr}.${ext}`;
}
