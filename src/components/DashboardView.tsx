/* Halaman Dashboard personal ASN: ringkasan statistik, grafik 7 hari dan kategori, serta aktivitas terbaru */

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  ArrowRight,
  ClipboardPlus,
  FileText,
  Plus,
} from 'lucide-react';
import {
  calculateDashboardStats,
} from '../lib/calculations';
import {
  formatBulat,
  formatBulanTahun,
  formatTanggalIndonesia,
  getCurrentMonthYear,
  getTodayISO,
} from '../lib/format';
import {
  Activity,
  NavSection,
  PerformanceTarget,
  Profile,
  MonthlyReport,
} from '../types';
import { ActivityStatusBadge, ReportStatusBadge } from './StatusBadge';

interface DashboardViewProps {
  profile: Profile;
  activities: Activity[];
  targets: PerformanceTarget[];
  reports: MonthlyReport[];
  onNavigate: (section: NavSection) => void;
  onOpenQuickAdd: () => void;
  onOpenNewActivity: () => void;
}

export function DashboardView({
  profile,
  activities,
  targets,
  reports,
  onNavigate,
  onOpenQuickAdd,
  onOpenNewActivity,
}: DashboardViewProps) {
  const todayISO = getTodayISO();
  const { month, year } = getCurrentMonthYear();
  const stats = calculateDashboardStats(activities, targets, reports, todayISO);
  const targetMap = new Map(targets.map((t) => [t.id, t.title]));

  return (
    <div className="space-y-6">
      {/* Sapaan, tanggal, dan pintasan cepat */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-neutral-900">
            Selamat beraktivitas, {profile.full_name.split(',')[0]}
          </h2>
          <p className="mt-1 text-sm text-neutral-600">
            {formatTanggalIndonesia(todayISO)} · {profile.job_title}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onOpenQuickAdd}
            className="min-h-[44px] inline-flex items-center gap-2 rounded-xl bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2 whitespace-nowrap"
          >
            <Plus className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>Catat Cepat</span>
          </button>
          <button
            type="button"
            onClick={onOpenNewActivity}
            className="min-h-[44px] inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-900 hover:bg-neutral-100 transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 whitespace-nowrap"
          >
            <ClipboardPlus className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>Form Lengkap</span>
          </button>
        </div>
      </div>

      {/* 4 Kartu Statistik Utama */}
      <section
        className="grid grid-cols-2 gap-4 lg:grid-cols-4"
        aria-label="Ringkasan kinerja"
      >
        <div className="rounded-2xl bg-white border border-neutral-200 p-4 lg:p-6">
          <p className="text-sm text-neutral-600">Aktivitas Hari Ini</p>
          <p className="mt-2 text-3xl font-semibold text-neutral-900 tabular-nums">
            {formatBulat(stats.todayCount)}
          </p>
          <p className="mt-1 text-xs text-neutral-500">Tercatat hari ini</p>
        </div>

        <div className="rounded-2xl bg-white border border-neutral-200 p-4 lg:p-6">
          <p className="text-sm text-neutral-600">Bulan Berjalan</p>
          <p className="mt-2 text-3xl font-semibold text-neutral-900 tabular-nums">
            {formatBulat(stats.monthCount)}
          </p>
          <p className="mt-1 text-xs text-neutral-500">
            {formatBulanTahun(month, year)}
          </p>
        </div>

        <div className="rounded-2xl bg-white border border-neutral-200 p-4 lg:p-6">
          <p className="text-sm text-neutral-600">Target Kinerja Aktif</p>
          <p className="mt-2 text-3xl font-semibold text-neutral-900 tabular-nums">
            {formatBulat(stats.activeTargetsCount)}
          </p>
          <button
            type="button"
            onClick={() => onNavigate('targets')}
            className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-blue-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 rounded"
          >
            <span>Kelola target</span>
          </button>
        </div>

        <div className="rounded-2xl bg-white border border-neutral-200 p-4 lg:p-6">
          <p className="text-sm text-neutral-600">Laporan Bulan Ini</p>
          <div className="mt-3">
            <ReportStatusBadge
              status={
                stats.reportStatusLabel as 'Draft' | 'Final' | 'Belum dibuat'
              }
            />
          </div>
          <button
            type="button"
            onClick={() => onNavigate('monthly')}
            className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-blue-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 rounded"
          >
            <FileText className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Buka laporan</span>
          </button>
        </div>
      </section>

      {/* Grafik 7 Hari Terakhir dan Grafik per Kategori */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl bg-white border border-neutral-200 p-6">
          <div className="flex items-center justify-between gap-2 mb-4">
            <div>
              <h3 className="text-lg font-semibold text-neutral-900">
                Aktivitas 7 Hari Terakhir
              </h3>
              <p className="text-xs text-neutral-600">
                Jumlah aktivitas harian tercatat
              </p>
            </div>
          </div>

          {activities.length === 0 ? (
            <div className="h-56 flex flex-col items-center justify-center text-center text-sm text-neutral-600">
              <p>Belum ada aktivitas tercatat dalam 7 hari terakhir.</p>
            </div>
          ) : (
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={stats.last7Days}
                  margin={{ top: 8, right: 8, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 11, fill: '#525252' }}
                    axisLine={{ stroke: '#d4d4d4' }}
                    tickLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 11, fill: '#525252' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    formatter={(value) => [`${value ?? 0} aktivitas`, 'Total']}
                    contentStyle={{
                      borderRadius: '12px',
                      borderColor: '#e5e5e5',
                      fontSize: '12px',
                    }}
                  />
                  <Bar
                    dataKey="jumlah"
                    name="Aktivitas"
                    fill="#1d4ed8"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="rounded-2xl bg-white border border-neutral-200 p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-neutral-900">
              Aktivitas per Kategori
            </h3>
            <p className="text-xs text-neutral-600">
              Distribusi pada {formatBulanTahun(month, year)}
            </p>
          </div>

          {stats.categorySeries.length === 0 ? (
            <div className="h-56 flex flex-col items-center justify-center text-center text-sm text-neutral-600">
              <p>Belum ada aktivitas pada bulan berjalan.</p>
            </div>
          ) : (
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={stats.categorySeries}
                  layout="vertical"
                  margin={{ top: 4, right: 16, left: 8, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                  <XAxis
                    type="number"
                    allowDecimals={false}
                    tick={{ fontSize: 11, fill: '#525252' }}
                    axisLine={{ stroke: '#d4d4d4' }}
                    tickLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="kategori"
                    width={130}
                    tick={{ fontSize: 11, fill: '#525252' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    formatter={(value) => [`${value ?? 0} aktivitas`, 'Jumlah']}
                    labelFormatter={(_, payload) =>
                      payload?.[0]?.payload?.kategoriLengkap ?? ''
                    }
                    contentStyle={{
                      borderRadius: '12px',
                      borderColor: '#e5e5e5',
                      fontSize: '12px',
                    }}
                  />
                  <Bar
                    dataKey="jumlah"
                    name="Jumlah"
                    fill="#1d4ed8"
                    radius={[0, 6, 6, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </section>

      {/* Daftar Aktivitas Terbaru */}
      <section className="rounded-2xl bg-white border border-neutral-200 p-6">
        <div className="flex items-center justify-between gap-4 mb-4">
          <h3 className="text-lg font-semibold text-neutral-900">
            Aktivitas Terbaru
          </h3>
          <button
            type="button"
            onClick={() => onNavigate('worklog')}
            className="min-h-[44px] inline-flex items-center gap-1.5 text-sm font-medium text-blue-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 rounded px-2 whitespace-nowrap"
          >
            <span>Lihat semua</span>
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        {stats.recentActivities.length === 0 ? (
          <div className="py-8 text-center space-y-3">
            <p className="text-sm text-neutral-600">
              Belum ada aktivitas yang dicatat. Mulai dengan mencatat pekerjaan hari ini.
            </p>
            <button
              type="button"
              onClick={onOpenQuickAdd}
              className="min-h-[44px] inline-flex items-center gap-2 rounded-xl bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              <span>Catat Aktivitas Pertama</span>
            </button>
          </div>
        ) : (
          <ul className="divide-y divide-neutral-200">
            {stats.recentActivities.map((act) => (
              <li
                key={act.id}
                className="py-3.5 first:pt-0 last:pb-0 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0 space-y-1">
                  <p className="text-sm font-medium text-neutral-900">
                    {act.title}
                  </p>
                  <p className="text-xs text-neutral-600">
                    {formatTanggalIndonesia(act.activity_date)} · {act.category}
                    {act.target_id && targetMap.has(act.target_id)
                      ? ` · ${targetMap.get(act.target_id)}`
                      : ''}
                  </p>
                </div>
                <div className="shrink-0">
                  <ActivityStatusBadge status={act.status} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
