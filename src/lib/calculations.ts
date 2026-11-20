/* Fungsi perhitungan statistik dashboard, realisasi target SKP, filter aktivitas, dan rekap laporan */

import { REPORT_DEFAULT_CLOSING } from '../config';
import {
  Activity,
  ActivityAttachment,
  ActivityPriority,
  ActivityStatus,
  MonthlyReport,
  MonthlyReportActivityRow,
  MonthlyReportContent,
  MonthlyReportOutputSummary,
  MonthlyReportTargetRow,
  PerformanceTarget,
  Profile,
} from '../types';
import {
  addDaysISO,
  formatBulanTahun,
  formatDesimal,
  formatTanggalIndonesia,
  formatTanggalSingkat,
} from './format';

export interface ActivityFilters {
  keyword: string;
  dateFrom: string;
  dateTo: string;
  monthYear: string; // format: '' atau 'YYYY-MM'
  category: string;
  targetId: string;
  status: '' | ActivityStatus;
  priority: '' | ActivityPriority;
  hasAttachment: 'all' | 'yes' | 'no';
}

export interface TargetRealization {
  linkedCount: number;
  completedCount: number;
  recordedOutputSum: number;
  recordedUnitsCount: number;
  progressPercent: number | null;
  displayText: string;
}

export function getEligibleTargetsForDate(
  targets: PerformanceTarget[],
  activityDate: string
): PerformanceTarget[] {
  return targets.filter((t) => {
    if (t.status !== 'Aktif') return false;
    if (!activityDate) return true;
    return t.period_start <= activityDate && activityDate <= t.period_end;
  });
}

export function isTargetActiveForDate(
  target: PerformanceTarget,
  activityDate: string
): boolean {
  return (
    target.status === 'Aktif' &&
    (!activityDate ||
      (target.period_start <= activityDate && activityDate <= target.period_end))
  );
}

export function calculateTargetRealization(
  target: PerformanceTarget,
  activities: Activity[]
): TargetRealization {
  const linked = activities.filter((a) => a.target_id === target.id);
  const completed = linked.filter((a) => a.status === 'Selesai');

  let recordedOutputSum = 0;
  let recordedUnitsCount = 0;

  for (const act of completed) {
    if (act.output_quantity !== null && !Number.isNaN(act.output_quantity)) {
      recordedOutputSum += act.output_quantity;
      recordedUnitsCount += 1;
    }
  }

  let progressPercent: number | null = null;
  let displayText = `${completed.length} aktivitas selesai`;

  if (target.target_value !== null && target.target_value > 0) {
    const basisValue =
      recordedUnitsCount > 0 ? recordedOutputSum : completed.length;
    progressPercent = Math.min(
      100,
      Math.round((basisValue / target.target_value) * 100)
    );
    const unitLabel = target.unit ? ` ${target.unit}` : '';
    displayText = `${formatDesimal(basisValue)} / ${formatDesimal(target.target_value)}${unitLabel}`;
  } else if (recordedUnitsCount > 0) {
    const unitLabel = target.unit ? ` ${target.unit}` : '';
    displayText = `${formatDesimal(recordedOutputSum)}${unitLabel} (${completed.length} selesai)`;
  }

  return {
    linkedCount: linked.length,
    completedCount: completed.length,
    recordedOutputSum,
    recordedUnitsCount,
    progressPercent,
    displayText,
  };
}

export function filterActivities(
  activities: Activity[],
  attachments: ActivityAttachment[],
  filters: ActivityFilters
): Activity[] {
  const kw = filters.keyword.trim().toLowerCase();
  const attachmentSet = new Set(attachments.map((att) => att.activity_id));

  return activities
    .filter((act) => {
      if (kw) {
        const haystack = [
          act.title,
          act.description,
          act.output_description,
          act.category,
          act.tags.join(' '),
        ]
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(kw)) return false;
      }

      if (filters.dateFrom && act.activity_date < filters.dateFrom) return false;
      if (filters.dateTo && act.activity_date > filters.dateTo) return false;

      if (filters.monthYear) {
        if (!act.activity_date.startsWith(filters.monthYear)) return false;
      }

      if (filters.category && act.category !== filters.category) return false;

      if (filters.targetId === '__none__') {
        if (act.target_id !== null) return false;
      } else if (filters.targetId && act.target_id !== filters.targetId) {
        return false;
      }

      if (filters.status && act.status !== filters.status) return false;
      if (filters.priority && act.priority !== filters.priority) return false;

      if (filters.hasAttachment === 'yes' && !attachmentSet.has(act.id)) {
        return false;
      }
      if (filters.hasAttachment === 'no' && attachmentSet.has(act.id)) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      if (a.activity_date !== b.activity_date) {
        return b.activity_date.localeCompare(a.activity_date);
      }
      return b.created_at.localeCompare(a.created_at);
    });
}

export function calculateDashboardStats(
  activities: Activity[],
  targets: PerformanceTarget[],
  reports: MonthlyReport[],
  todayISO: string
) {
  const monthPrefix = todayISO.slice(0, 7);
  const [yearNum, monthNum] = monthPrefix.split('-').map(Number);

  const todayCount = activities.filter(
    (a) => a.activity_date === todayISO
  ).length;

  const monthActivities = activities.filter((a) =>
    a.activity_date.startsWith(monthPrefix)
  );
  const monthCount = monthActivities.length;

  const activeTargetsCount = targets.filter((t) => t.status === 'Aktif').length;

  const currentReport = reports.find(
    (r) => r.month === monthNum && r.year === yearNum
  );
  const reportStatusLabel = currentReport ? currentReport.status : 'Belum dibuat';

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const dateISO = addDaysISO(todayISO, i - 6);
    const count = activities.filter((a) => a.activity_date === dateISO).length;
    const completed = activities.filter(
      (a) => a.activity_date === dateISO && a.status === 'Selesai'
    ).length;
    return {
      dateISO,
      label: formatTanggalSingkat(dateISO),
      jumlah: count,
      selesai: completed,
    };
  });

  const categoryMap = new Map<string, number>();
  for (const act of monthActivities) {
    categoryMap.set(act.category, (categoryMap.get(act.category) ?? 0) + 1);
  }
  const categorySeries = Array.from(categoryMap.entries())
    .map(([kategori, jumlah]) => ({
      kategori: kategori.length > 22 ? `${kategori.slice(0, 20)}…` : kategori,
      kategoriLengkap: kategori,
      jumlah,
    }))
    .sort((a, b) => b.jumlah - a.jumlah);

  const recentActivities = [...activities]
    .sort((a, b) => {
      if (a.activity_date !== b.activity_date) {
        return b.activity_date.localeCompare(a.activity_date);
      }
      return b.created_at.localeCompare(a.created_at);
    })
    .slice(0, 5);

  return {
    todayCount,
    monthCount,
    activeTargetsCount,
    reportStatusLabel,
    last7Days,
    categorySeries,
    recentActivities,
  };
}

export function getWeekBoundsISO(dateISO: string): {
  weekStart: string;
  weekEnd: string;
} {
  const [y, m, d] = dateISO.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  const day = dt.getDay(); // 0=Min, 1=Sen ... 6=Sab
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const weekStart = addDaysISO(dateISO, diffToMonday);
  const weekEnd = addDaysISO(weekStart, 6);
  return { weekStart, weekEnd };
}

export function calculateWeeklyRecap(
  activities: Activity[],
  targets: PerformanceTarget[],
  weekStart: string,
  weekEnd: string
) {
  const weekActivities = activities
    .filter(
      (a) => a.activity_date >= weekStart && a.activity_date <= weekEnd
    )
    .sort((a, b) => {
      if (a.activity_date !== b.activity_date) {
        return b.activity_date.localeCompare(a.activity_date);
      }
      return b.created_at.localeCompare(a.created_at);
    });

  const total = weekActivities.length;
  const completed = weekActivities.filter((a) => a.status === 'Selesai').length;
  const pending = total - completed;

  const byCategoryMap = new Map<string, number>();
  const byTargetMap = new Map<string, number>();
  const targetLookup = new Map(targets.map((t) => [t.id, t.title]));

  for (const act of weekActivities) {
    byCategoryMap.set(act.category, (byCategoryMap.get(act.category) ?? 0) + 1);
    const targetName = act.target_id
      ? targetLookup.get(act.target_id) ?? 'Target tidak ditemukan'
      : 'Belum ditautkan ke target';
    byTargetMap.set(targetName, (byTargetMap.get(targetName) ?? 0) + 1);
  }

  return {
    total,
    completed,
    pending,
    activities: weekActivities,
    byCategory: Array.from(byCategoryMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count),
    byTarget: Array.from(byTargetMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count),
  };
}

export function buildMonthlyReportContent(
  profile: Profile,
  allActivities: Activity[],
  allTargets: PerformanceTarget[],
  month: number,
  year: number,
  executiveSummary: string
): MonthlyReportContent {
  const monthPrefix = `${year}-${String(month).padStart(2, '0')}`;
  const periodActivities = allActivities
    .filter((a) => a.activity_date.startsWith(monthPrefix))
    .sort((a, b) => a.activity_date.localeCompare(b.activity_date));

  const targetMap = new Map(allTargets.map((t) => [t.id, t]));

  const activity_rows: MonthlyReportActivityRow[] = periodActivities.map(
    (act) => {
      const hasOutput =
        Boolean(act.output_description.trim()) || act.output_quantity !== null;
      const qtyPart =
        act.output_quantity !== null
          ? `${formatDesimal(act.output_quantity)}${act.output_unit ? ` ${act.output_unit}` : ''}`
          : '';
      const outputText = hasOutput
        ? [act.output_description.trim(), qtyPart ? `(${qtyPart})` : '']
            .filter(Boolean)
            .join(' ')
        : 'Belum ada output tercatat';

      return {
        activity_id: act.id,
        activity_date: act.activity_date,
        title: act.title,
        output_text: outputText,
        has_output: hasOutput,
        target_title: act.target_id
          ? targetMap.get(act.target_id)?.title ?? '-'
          : 'Tidak tertaut target',
      };
    }
  );

  const periodStart = `${monthPrefix}-01`;
  const periodEnd = `${monthPrefix}-31`;
  const relevantTargets = allTargets.filter(
    (t) =>
      (t.period_start <= periodEnd && t.period_end >= periodStart) ||
      periodActivities.some((a) => a.target_id === t.id)
  );

  const target_rows: MonthlyReportTargetRow[] = relevantTargets.map((target) => {
    const realization = calculateTargetRealization(target, periodActivities);
    const targetDisplay =
      target.target_value !== null
        ? `${formatDesimal(target.target_value)}${target.unit ? ` ${target.unit}` : ''}`
        : target.unit || 'Sesuai indikator';
    return {
      target_id: target.id,
      title: target.title,
      indicator: target.indicator,
      target_display: targetDisplay,
      realization_display: realization.displayText,
      supporting_count: realization.linkedCount,
    };
  });

  const outputRecapMap = new Map<
    string,
    { total_quantity: number; activity_count: number }
  >();
  for (const act of periodActivities) {
    if (act.output_quantity !== null && !Number.isNaN(act.output_quantity)) {
      const unitKey = act.output_unit.trim() || 'Item';
      const prev = outputRecapMap.get(unitKey) ?? {
        total_quantity: 0,
        activity_count: 0,
      };
      outputRecapMap.set(unitKey, {
        total_quantity: prev.total_quantity + act.output_quantity,
        activity_count: prev.activity_count + 1,
      });
    }
  }
  const output_recap: MonthlyReportOutputSummary[] = Array.from(
    outputRecapMap.entries()
  ).map(([unit, stats]) => ({
    unit,
    total_quantity: stats.total_quantity,
    activity_count: stats.activity_count,
  }));

  const challengeLines = periodActivities
    .filter((a) => a.challenges.trim() || a.follow_up.trim())
    .map((a) => {
      const tgl = formatTanggalIndonesia(a.activity_date);
      const kendala = a.challenges.trim() || 'Tidak ada kendala khusus';
      const tindak = a.follow_up.trim() || 'Belum dicatat';
      return `- ${tgl} (${a.title}): Kendala: ${kendala}. Tindak lanjut: ${tindak}.`;
    });

  const challenges_and_followup =
    challengeLines.length > 0
      ? challengeLines.join('\n')
      : 'Belum ada kendala yang dicatat oleh pegawai pada periode laporan ini.';

  return {
    header: {
      full_name: profile.full_name,
      nip: profile.nip,
      job_title: profile.job_title,
      unit_name: profile.unit_name,
      period_label: formatBulanTahun(month, year),
    },
    executive_summary: executiveSummary,
    activity_rows,
    target_rows,
    output_recap,
    challenges_and_followup,
    closing_note: REPORT_DEFAULT_CLOSING,
  };
}
