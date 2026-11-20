/* Asisten AI lokal berbasis aturan faktual: merapikan narasi dinas, memecah kalimat Quick Add, menyarankan kategori/target, dan merangkum periode */

import { ACTIVITY_CATEGORIES } from '../config';
import { Activity, PerformanceTarget, QuickAddItemDraft } from '../types';
import { getEligibleTargetsForDate } from './calculations';
import { formatBulanTahun, formatDesimal, formatTanggalIndonesia } from './format';

const CATEGORY_KEYWORDS: { category: string; keywords: string[] }[] = [
  {
    category: 'Pemeliharaan Sistem & Database',
    keywords: ['backup', 'database', 'postgresql', 'server', 'infrastruktur', 'jaringan', 'bug', 'error', 'pemeliharaan', 'maintenance', 'simoppa'],
  },
  {
    category: 'Pengembangan Aplikasi',
    keywords: ['kembang', 'pengembangan', 'fitur', 'modul', 'dashboard', 'aplikasi', 'login', 'ui', 'api', 'deploy'],
  },
  {
    category: 'Pengolahan & Validasi Data',
    keywords: ['data', 'validasi', 'olah', 'pengolahan', 'statistik', 'survei', 'rekap', 'excel', 'dataset', 'anomali'],
  },
  {
    category: 'Koordinasi & Rapat',
    keywords: ['rapat', 'koordinasi', 'diskusi', 'pertemuan', 'briefing', 'sosialisasi', 'konsultasi'],
  },
  {
    category: 'Dokumentasi & Pelaporan',
    keywords: ['laporan', 'dokumentasi', 'dokumen', 'notulen', 'sop', 'panduan', 'skp', 'pelaporan'],
  },
  {
    category: 'Dukungan Teknis Pengguna',
    keywords: ['tiket', 'helpdesk', 'dukungan', 'bantu', 'troubleshoot', 'troubleshooting', 'pengguna', 'akses', 'reset'],
  },
  {
    category: 'Pengelolaan Layanan TI',
    keywords: ['layanan', 'monitoring', 'pantau', 'evaluasi', 'keamanan', 'kinerja', 'sla'],
  },
];

const INFORMAL_REPLACEMENTS: [RegExp, string][] = [
  [/\bcek\b/gi, 'melakukan pemeriksaan'],
  [/\bmengecek\b/gi, 'melakukan pemeriksaan terhadap'],
  [/\bbenerin\b/gi, 'melakukan perbaikan pada'],
  [/\bmemperbaiki\b/gi, 'melaksanakan perbaikan'],
  [/\bbikin\b/gi, 'menyusun'],
  [/\bmembuat\b/gi, 'menyusun'],
  [/\bngolah\b/gi, 'melakukan pengolahan'],
  [/\bngerjain\b/gi, 'melaksanakan'],
  [/\bupdate\b/gi, 'melakukan pemutakhiran'],
  [/\bmeeting\b/gi, 'rapat koordinasi'],
  [/\bfollow up\b/gi, 'tindak lanjut'],
  [/\bbackup\b/gi, 'pencadangan'],
];

function capitalizeFirst(text: string): string {
  const clean = text.trim();
  if (!clean) return '';
  return clean.charAt(0).toUpperCase() + clean.slice(1);
}

export function suggestCategory(text: string): string {
  const lower = text.toLowerCase();
  let bestCategory = ACTIVITY_CATEGORIES[0];
  let bestScore = 0;

  for (const entry of CATEGORY_KEYWORDS) {
    let score = 0;
    for (const kw of entry.keywords) {
      if (lower.includes(kw)) score += 1;
    }
    if (score > bestScore) {
      bestScore = score;
      bestCategory = entry.category;
    }
  }

  return bestCategory;
}

export function suggestActiveTarget(
  text: string,
  activityDate: string,
  targets: PerformanceTarget[]
): { target_id: string | null; reason: string } {
  const eligible = getEligibleTargetsForDate(targets, activityDate);
  if (eligible.length === 0) {
    return {
      target_id: null,
      reason: 'Tidak ada target aktif pada tanggal tersebut',
    };
  }

  const tokens = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 4);

  let bestTarget: PerformanceTarget | null = null;
  let bestMatches = 0;

  for (const target of eligible) {
    const targetText = `${target.title} ${target.description} ${target.indicator}`.toLowerCase();
    let matches = 0;
    for (const token of tokens) {
      if (targetText.includes(token)) {
        matches += 1;
      }
    }
    if (matches > bestMatches) {
      bestMatches = matches;
      bestTarget = target;
    }
  }

  if (bestTarget && bestMatches > 0) {
    return {
      target_id: bestTarget.id,
      reason: `Sesuai kata kunci dengan target "${bestTarget.title}"`,
    };
  }

  return {
    target_id: null,
    reason: 'Pilih target secara manual bila sesuai SKP',
  };
}

export function formalizeActivityNarrative(input: {
  title: string;
  description: string;
  output_description: string;
}): { title: string; description: string } {
  let cleanTitle = input.title.trim();
  for (const [pattern, replacement] of INFORMAL_REPLACEMENTS) {
    cleanTitle = cleanTitle.replace(pattern, replacement);
  }
  cleanTitle = cleanTitle.replace(/\s+/g, ' ').trim();
  if (cleanTitle) {
    cleanTitle = capitalizeFirst(cleanTitle);
  }

  const baseDesc = input.description.trim() || input.title.trim();
  let formalDesc = baseDesc;
  for (const [pattern, replacement] of INFORMAL_REPLACEMENTS) {
    formalDesc = formalDesc.replace(pattern, replacement);
  }
  formalDesc = formalDesc.replace(/\s+/g, ' ').trim();

  if (formalDesc) {
    formalDesc = capitalizeFirst(formalDesc);
    if (!formalDesc.endsWith('.')) {
      formalDesc += '.';
    }
  }

  if (
    input.output_description.trim() &&
    !formalDesc
      .toLowerCase()
      .includes(input.output_description.trim().toLowerCase())
  ) {
    formalDesc += ` Hasil kegiatan yang tercatat berupa ${input.output_description.trim()}.`;
  }

  return {
    title: cleanTitle || input.title.trim(),
    description: formalDesc,
  };
}

function cleanClauseToTitle(clause: string): string {
  let text = clause
    .trim()
    .replace(/^(hari ini|tadi|kemarin|saya|kami|telah|sudah)\s+/i, '')
    .replace(/^(melakukan|melaksanakan|mengerjakan)\s+/i, '')
    .replace(/[.]+$/, '')
    .trim();

  if (!text) return '';
  return capitalizeFirst(text);
}

export function splitNaturalLanguageQuickAdd(
  rawText: string,
  activityDate: string,
  optionalOutput: string,
  targets: PerformanceTarget[]
): QuickAddItemDraft[] {
  const trimmed = rawText.trim();
  if (!trimmed) return [];

  const normalized = trimmed
    .replace(/\r?\n+/g, '; ')
    .replace(/\s+(?:lalu|kemudian|selanjutnya|serta)\s+/gi, '; ')
    .replace(/,\s*dan\s+/gi, '; ')
    .replace(/,\s+(?=(?:me|pe|di|ber|ter|cek|bikin|buat|rapat|koordinasi|backup|validasi|olah|susun|perbaiki))/gi, '; ');

  const clauses = normalized
    .split(';')
    .map((part) => part.trim())
    .filter((part) => part.length >= 3);

  const uniqueClauses = clauses.length > 0 ? clauses : [trimmed];

  return uniqueClauses.map((clause, index) => {
    const title = cleanClauseToTitle(clause) || capitalizeFirst(clause);
    const formalized = formalizeActivityNarrative({
      title,
      description: clause,
      output_description: uniqueClauses.length === 1 ? optionalOutput : '',
    });
    const category = suggestCategory(clause);
    const targetSuggestion = suggestActiveTarget(clause, activityDate, targets);

    return {
      id: `draft-${Date.now()}-${index}`,
      selected: true,
      activity_date: activityDate,
      title: formalized.title,
      description: formalized.description,
      category,
      target_id: targetSuggestion.target_id,
      recommended_target_reason: targetSuggestion.reason,
      output_description:
        uniqueClauses.length === 1 ? optionalOutput.trim() : '',
      output_quantity: null,
      output_unit: '',
      status: optionalOutput.trim() && uniqueClauses.length === 1
        ? 'Selesai'
        : 'Selesai',
    };
  });
}

export function generateWeeklySummaryText(
  activities: Activity[],
  targets: PerformanceTarget[],
  weekStart: string,
  weekEnd: string
): string {
  if (activities.length === 0) {
    return `Pada periode ${formatTanggalIndonesia(weekStart)} sampai ${formatTanggalIndonesia(weekEnd)}, belum terdapat aktivitas yang dicatat oleh pegawai.`;
  }

  const completed = activities.filter((a) => a.status === 'Selesai').length;
  const inProgress = activities.length - completed;
  const catCounts = new Map<string, number>();
  const targetLookup = new Map(targets.map((t) => [t.id, t.title]));
  const linkedTargetNames = new Set<string>();

  for (const act of activities) {
    catCounts.set(act.category, (catCounts.get(act.category) ?? 0) + 1);
    if (act.target_id && targetLookup.has(act.target_id)) {
      linkedTargetNames.add(targetLookup.get(act.target_id)!);
    }
  }

  const topCategories = Array.from(catCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([cat, count]) => `${cat} (${count} aktivitas)`)
    .join(', ');

  const targetSentence =
    linkedTargetNames.size > 0
      ? ` Aktivitas tersebut mendukung target kinerja: ${Array.from(linkedTargetNames).join('; ')}.`
      : ' Belum ada aktivitas yang ditautkan ke target kinerja pada minggu ini.';

  const recordedOutputs = activities.filter(
    (a) => a.output_description.trim() || a.output_quantity !== null
  ).length;

  return `Selama periode ${formatTanggalIndonesia(weekStart)} sampai ${formatTanggalIndonesia(weekEnd)}, tercatat sebanyak ${activities.length} aktivitas kerja dengan rincian ${completed} aktivitas berstatus selesai dan ${inProgress} aktivitas masih berjalan/belum dimulai. Fokus kegiatan meliputi ${topCategories}.${targetSentence} Sebanyak ${recordedOutputs} aktivitas telah dilengkapi catatan output atau hasil kerja.`;
}

export function generateMonthlyExecutiveSummary(
  activities: Activity[],
  targets: PerformanceTarget[],
  month: number,
  year: number
): string {
  const periodLabel = formatBulanTahun(month, year);
  if (activities.length === 0) {
    return `Pada periode ${periodLabel}, belum terdapat aktivitas harian yang tercatat pada sistem untuk dirangkum.`;
  }

  const completed = activities.filter((a) => a.status === 'Selesai').length;
  const withoutOutput = activities.filter(
    (a) => !a.output_description.trim() && a.output_quantity === null
  ).length;

  const catCounts = new Map<string, number>();
  const unitSums = new Map<string, number>();

  for (const act of activities) {
    catCounts.set(act.category, (catCounts.get(act.category) ?? 0) + 1);
    if (act.output_quantity !== null && !Number.isNaN(act.output_quantity)) {
      const unit = act.output_unit.trim() || 'Item';
      unitSums.set(unit, (unitSums.get(unit) ?? 0) + act.output_quantity);
    }
  }

  const topCategories = Array.from(catCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([cat, cnt]) => `${cat} (${cnt})`)
    .join(', ');

  const outputPart =
    unitSums.size > 0
      ? ` Rekap kuantitas output yang tercatat meliputi ${Array.from(
          unitSums.entries()
        )
          .map(([u, total]) => `${formatDesimal(total)} ${u}`)
          .join(', ')}.`
      : '';

  const linkedTargetsCount = new Set(
    activities.map((a) => a.target_id).filter(Boolean)
  ).size;

  const missingOutputNote =
    withoutOutput > 0
      ? ` Terdapat ${withoutOutput} aktivitas yang belum dilengkapi catatan output pada tabel rincian.`
      : '';

  return `Sepanjang bulan ${periodLabel}, pegawai melaksanakan ${activities.length} aktivitas harian yang terdokumentasi (${completed} aktivitas selesai) dan terkait dengan ${linkedTargetsCount} target kinerja dari ${targets.length} target yang dikelola. Kategori pekerjaan utama mencakup ${topCategories}.${outputPart}${missingOutputNote}`;
}
