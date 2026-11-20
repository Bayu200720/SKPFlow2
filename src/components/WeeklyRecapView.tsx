/* Halaman Rekap Mingguan: statistik minggu terpilih, rincian per kategori/target, timeline, dan ringkasan yang dapat diedit */

import { useEffect, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Save,
  Wand2,
} from 'lucide-react';
import { generateWeeklySummaryText } from '../lib/aiAssistant';
import { calculateWeeklyRecap, getWeekBoundsISO } from '../lib/calculations';
import {
  addDaysISO,
  formatBulat,
  formatTanggalIndonesia,
  getTodayISO,
} from '../lib/format';
import { Activity, PerformanceTarget, WeeklyRecapNote } from '../types';
import { ActivityStatusBadge } from './StatusBadge';

interface WeeklyRecapViewProps {
  activities: Activity[];
  targets: PerformanceTarget[];
  savedRecaps: WeeklyRecapNote[];
  onSaveRecap: (weekStart: string, weekEnd: string, summary: string) => void;
}

export function WeeklyRecapView({
  activities,
  targets,
  savedRecaps,
  onSaveRecap,
}: WeeklyRecapViewProps) {
  const [anchorDate, setAnchorDate] = useState(getTodayISO());
  const { weekStart, weekEnd } = getWeekBoundsISO(anchorDate);
  const recap = calculateWeeklyRecap(activities, targets, weekStart, weekEnd);

  const savedForWeek = savedRecaps.find(
    (r) => r.week_start === weekStart && r.week_end === weekEnd
  );

  const [summaryText, setSummaryText] = useState('');

  useEffect(() => {
    if (savedForWeek) {
      setSummaryText(savedForWeek.summary);
    } else {
      setSummaryText(
        generateWeeklySummaryText(recap.activities, targets, weekStart, weekEnd)
      );
    }
  }, [weekStart, weekEnd, savedForWeek?.summary, activities.length]);

  function handleGenerateSummary() {
    setSummaryText(
      generateWeeklySummaryText(recap.activities, targets, weekStart, weekEnd)
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-neutral-900">
            Rekap Mingguan
          </h2>
          <p className="mt-1 text-sm text-neutral-600">
            Periode {formatTanggalIndonesia(weekStart)} –{' '}
            {formatTanggalIndonesia(weekEnd)}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setAnchorDate(addDaysISO(weekStart, -7))}
            className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-xl border border-neutral-200 bg-white px-3 text-sm font-medium text-neutral-900 hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700"
            aria-label="Minggu sebelumnya"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <input
            type="date"
            value={anchorDate}
            onChange={(e) => {
              if (e.target.value) setAnchorDate(e.target.value);
            }}
            aria-label="Pilih tanggal dalam minggu"
            className="min-h-[44px] rounded-xl border border-neutral-200 bg-white px-3 py-2 text-base text-neutral-900"
          />
          <button
            type="button"
            onClick={() => setAnchorDate(addDaysISO(weekStart, 7))}
            className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-xl border border-neutral-200 bg-white px-3 text-sm font-medium text-neutral-900 hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700"
            aria-label="Minggu berikutnya"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Ringkasan Angka Mingguan */}
      <section className="grid grid-cols-3 gap-4">
        <div className="rounded-2xl bg-white border border-neutral-200 p-4 sm:p-6">
          <p className="text-sm text-neutral-600">Total Aktivitas</p>
          <p className="mt-2 text-3xl font-semibold text-neutral-900 tabular-nums">
            {formatBulat(recap.total)}
          </p>
        </div>
        <div className="rounded-2xl bg-white border border-neutral-200 p-4 sm:p-6">
          <p className="text-sm text-neutral-600">Selesai</p>
          <p className="mt-2 text-3xl font-semibold text-emerald-800 tabular-nums">
            {formatBulat(recap.completed)}
          </p>
        </div>
        <div className="rounded-2xl bg-white border border-neutral-200 p-4 sm:p-6">
          <p className="text-sm text-neutral-600">Belum Selesai</p>
          <p className="mt-2 text-3xl font-semibold text-amber-800 tabular-nums">
            {formatBulat(recap.pending)}
          </p>
        </div>
      </section>

      {/* Distribusi per Kategori & per Target */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl bg-white border border-neutral-200 p-6 space-y-3">
          <h3 className="text-lg font-semibold text-neutral-900">
            Aktivitas per Kategori
          </h3>
          {recap.byCategory.length === 0 ? (
            <p className="text-sm text-neutral-600">
              Belum ada aktivitas pada minggu ini.
            </p>
          ) : (
            <ul className="divide-y divide-neutral-200">
              {recap.byCategory.map((item) => (
                <li
                  key={item.name}
                  className="py-2.5 flex items-center justify-between gap-4 text-sm"
                >
                  <span className="text-neutral-900">{item.name}</span>
                  <span className="font-semibold text-neutral-900 tabular-nums">
                    {formatBulat(item.count)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-2xl bg-white border border-neutral-200 p-6 space-y-3">
          <h3 className="text-lg font-semibold text-neutral-900">
            Aktivitas per Target
          </h3>
          {recap.byTarget.length === 0 ? (
            <p className="text-sm text-neutral-600">
              Belum ada aktivitas pada minggu ini.
            </p>
          ) : (
            <ul className="divide-y divide-neutral-200">
              {recap.byTarget.map((item) => (
                <li
                  key={item.name}
                  className="py-2.5 flex items-center justify-between gap-4 text-sm"
                >
                  <span className="text-neutral-900">{item.name}</span>
                  <span className="font-semibold text-neutral-900 tabular-nums">
                    {formatBulat(item.count)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Ringkasan Mingguan yang Dapat Diedit */}
      <section className="rounded-2xl bg-white border border-neutral-200 p-6 space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-neutral-900">
              Ringkasan Mingguan
            </h3>
            <p className="text-xs text-neutral-600">
              Disusun dari aktivitas minggu ini; Anda dapat menyunting dan menyimpannya.
            </p>
          </div>
          <button
            type="button"
            onClick={handleGenerateSummary}
            className="min-h-[44px] inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3.5 py-2 text-sm font-medium text-neutral-900 hover:bg-neutral-50 whitespace-nowrap self-start"
          >
            <Wand2 className="h-4 w-4" aria-hidden="true" />
            <span>Susun Ulang</span>
          </button>
        </div>

        <textarea
          rows={4}
          value={summaryText}
          onChange={(e) => setSummaryText(e.target.value)}
          aria-label="Teks ringkasan mingguan"
          className="w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-base text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700"
        />

        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => onSaveRecap(weekStart, weekEnd, summaryText)}
            className="min-h-[44px] inline-flex items-center gap-2 rounded-xl bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2"
          >
            <Save className="h-4 w-4" aria-hidden="true" />
            <span>Simpan Ringkasan</span>
          </button>
        </div>
      </section>

      {/* Timeline Aktivitas Minggu Ini */}
      <section className="rounded-2xl bg-white border border-neutral-200 p-6 space-y-4">
        <h3 className="text-lg font-semibold text-neutral-900">
          Timeline Aktivitas
        </h3>
        {recap.activities.length === 0 ? (
          <p className="text-sm text-neutral-600">
            Belum ada aktivitas tercatat pada rentang minggu ini.
          </p>
        ) : (
          <ol className="divide-y divide-neutral-200">
            {recap.activities.map((act) => (
              <li
                key={act.id}
                className="py-3.5 first:pt-0 last:pb-0 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="space-y-1">
                  <p className="text-sm font-medium text-neutral-900">
                    {act.title}
                  </p>
                  <p className="text-xs text-neutral-600">
                    {formatTanggalIndonesia(act.activity_date)} · {act.category}
                    {act.output_description
                      ? ` · Output: ${act.output_description}`
                      : ''}
                  </p>
                </div>
                <ActivityStatusBadge status={act.status} />
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}
