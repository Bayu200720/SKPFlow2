/* Halaman Laporan Bulanan: penyusunan draft, penyuntingan 8 bagian terstruktur, pratinjau dokumen, dan ekspor PDF/DOCX/XLSX */

import { useEffect, useState } from 'react';
import {
  AlertCircle,
  Download,
  Eye,
  FileCheck2,
  FileEdit,
  Save,
  Wand2,
} from 'lucide-react';
import { generateMonthlyExecutiveSummary } from '../lib/aiAssistant';
import { buildMonthlyReportContent } from '../lib/calculations';
import {
  exportMonthlyReportDOCX,
  exportMonthlyReportPDF,
  exportMonthlyReportXLSX,
} from '../lib/exporters';
import {
  formatBulanTahun,
  formatDesimal,
  formatTanggalIndonesia,
  getCurrentMonthYear,
  getMonthOptions,
} from '../lib/format';
import {
  Activity,
  MonthlyReport,
  MonthlyReportContent,
  PerformanceTarget,
  Profile,
  ReportStatus,
} from '../types';
import { ConfirmDialog } from './ConfirmDialog';
import { ReportStatusBadge } from './StatusBadge';

interface MonthlyReportViewProps {
  profile: Profile;
  activities: Activity[];
  targets: PerformanceTarget[];
  reports: MonthlyReport[];
  onSaveReport: (report: MonthlyReport) => void;
  onLogExport: (report: MonthlyReport, format: 'PDF' | 'DOCX' | 'XLSX', fileName: string) => void;
  onNotify: (type: 'success' | 'error' | 'info', text: string) => void;
}

export function MonthlyReportView({
  profile,
  activities,
  targets,
  reports,
  onSaveReport,
  onLogExport,
  onNotify,
}: MonthlyReportViewProps) {
  const initialMY = getCurrentMonthYear();
  const [month, setMonth] = useState(initialMY.month);
  const [year, setYear] = useState(initialMY.year);
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');
  const [draftReport, setDraftReport] = useState<MonthlyReport | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExporting, setIsExporting] = useState<string | null>(null);
  const [confirmRegenerateOpen, setConfirmRegenerateOpen] = useState(false);

  const monthOptions = getMonthOptions();
  const yearOptions = [year - 1, year, year + 1];

  useEffect(() => {
    const existing = reports.find((r) => r.month === month && r.year === year);
    if (existing) {
      setDraftReport(existing);
    } else {
      setDraftReport(null);
    }
  }, [month, year, reports]);

  function buildFreshReport(existingId?: string): MonthlyReport {
    const monthPrefix = `${year}-${String(month).padStart(2, '0')}`;
    const periodActivities = activities.filter((a) =>
      a.activity_date.startsWith(monthPrefix)
    );
    const execSummary = generateMonthlyExecutiveSummary(
      periodActivities,
      targets,
      month,
      year
    );
    const content = buildMonthlyReportContent(
      profile,
      activities,
      targets,
      month,
      year,
      execSummary
    );
    const now = new Date().toISOString();

    return {
      id: existingId ?? `rep-${profile.user_id}-${year}-${month}`,
      user_id: profile.user_id,
      month,
      year,
      summary: execSummary,
      report_content: content,
      status: 'Draft',
      has_manual_edits: false,
      submitted_at: null,
      approved_at: null,
      created_at: now,
      updated_at: now,
    };
  }

  function runGenerate(forceFresh = false) {
    if (draftReport?.has_manual_edits && !forceFresh) {
      setConfirmRegenerateOpen(true);
      return;
    }
    setIsGenerating(true);
    window.setTimeout(() => {
      const fresh = buildFreshReport(draftReport?.id);
      setDraftReport(fresh);
      onSaveReport(fresh);
      setIsGenerating(false);
      onNotify(
        'success',
        `Draft laporan ${formatBulanTahun(month, year)} berhasil disusun.`
      );
    }, 150);
  }

  function updateContent(patch: Partial<MonthlyReportContent>) {
    setDraftReport((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        has_manual_edits: true,
        summary:
          patch.executive_summary !== undefined
            ? patch.executive_summary
            : prev.summary,
        report_content: {
          ...prev.report_content,
          ...patch,
        },
        updated_at: new Date().toISOString(),
      };
    });
  }

  function handleSaveWithStatus(nextStatus: ReportStatus) {
    if (!draftReport) return;
    const updated: MonthlyReport = {
      ...draftReport,
      status: nextStatus,
      updated_at: new Date().toISOString(),
    };
    setDraftReport(updated);
    onSaveReport(updated);
    onNotify(
      'success',
      nextStatus === 'Final'
        ? 'Laporan ditandai Final (siap diunduh).'
        : 'Draft laporan berhasil disimpan.'
    );
  }

  async function handleExport(format: 'PDF' | 'DOCX' | 'XLSX') {
    if (!draftReport) return;
    setIsExporting(format);
    try {
      let fileName = '';
      if (format === 'PDF') {
        fileName = exportMonthlyReportPDF(draftReport);
      } else if (format === 'DOCX') {
        fileName = await exportMonthlyReportDOCX(draftReport);
      } else {
        fileName = exportMonthlyReportXLSX(draftReport);
      }
      onLogExport(draftReport, format, fileName);
      onNotify('success', `Berkas ${fileName} berhasil diekspor.`);
    } catch {
      onNotify(
        'error',
        `Gagal mengekspor laporan ke ${format}; silakan coba lagi.`
      );
    } finally {
      setIsExporting(null);
    }
  }

  const periodPrefix = `${year}-${String(month).padStart(2, '0')}`;
  const periodActivityCount = activities.filter((a) =>
    a.activity_date.startsWith(periodPrefix)
  ).length;

  return (
    <div className="space-y-6">
      {/* Header & Pemilih Periode */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-neutral-900">
            Laporan Bulanan Personal
          </h2>
          <p className="mt-1 text-sm text-neutral-600">
            Susun, sunting, pratinjau, dan ekspor laporan kinerja bulanan Anda.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            aria-label="Pilih bulan laporan"
            className="min-h-[44px] rounded-xl border border-neutral-200 bg-white px-3 py-2 text-base text-neutral-900"
          >
            {monthOptions.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>

          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            aria-label="Pilih tahun laporan"
            className="min-h-[44px] rounded-xl border border-neutral-200 bg-white px-3 py-2 text-base text-neutral-900 tabular-nums"
          >
            {yearOptions.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>

          <button
            type="button"
            disabled={isGenerating}
            onClick={() => runGenerate(false)}
            className="min-h-[44px] inline-flex items-center gap-2 rounded-xl bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2 whitespace-nowrap"
          >
            <Wand2 className="h-4 w-4" aria-hidden="true" />
            <span>
              {isGenerating
                ? 'Menyusun…'
                : draftReport
                  ? 'Susun Ulang Narasi'
                  : 'Generate Draft Laporan'}
            </span>
          </button>
        </div>
      </div>

      {/* Peringatan ruang lingkup personal */}
      <div className="rounded-2xl bg-white border border-neutral-200 p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-2.5 text-sm text-neutral-700">
          <AlertCircle
            className="h-4 w-4 shrink-0 text-blue-700 mt-0.5"
            aria-hidden="true"
          />
          <p>
            Ditemukan{' '}
            <span className="font-semibold tabular-nums">
              {periodActivityCount}
            </span>{' '}
            aktivitas pada {formatBulanTahun(month, year)}. Status Final bersifat personal untuk siap unduh, bukan pengesahan pejabat penilai.
          </p>
        </div>
        {draftReport ? (
          <ReportStatusBadge status={draftReport.status} />
        ) : null}
      </div>

      {!draftReport ? (
        <div className="rounded-2xl bg-white border border-neutral-200 p-8 text-center space-y-4">
          <p className="text-sm text-neutral-600">
            Laporan untuk periode {formatBulanTahun(month, year)} belum disusun. Tekan tombol di bawah untuk menghimpun data aktivitas periode ini.
          </p>
          <button
            type="button"
            onClick={() => runGenerate(true)}
            className="min-h-[44px] inline-flex items-center gap-2 rounded-xl bg-blue-700 px-5 py-2 text-sm font-medium text-white hover:bg-blue-800"
          >
            <Wand2 className="h-4 w-4" aria-hidden="true" />
            <span>Generate Draft Laporan</span>
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Toolbar Mode Edit / Preview & Ekspor */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="inline-flex rounded-xl bg-neutral-200/70 p-1 gap-1 self-start">
              <button
                type="button"
                onClick={() => setViewMode('edit')}
                className={`min-h-[40px] inline-flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-sm font-medium whitespace-nowrap ${
                  viewMode === 'edit'
                    ? 'bg-white text-neutral-900 shadow-sm'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                <FileEdit className="h-4 w-4" aria-hidden="true" />
                <span>Edit Laporan</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('preview')}
                className={`min-h-[40px] inline-flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-sm font-medium whitespace-nowrap ${
                  viewMode === 'preview'
                    ? 'bg-white text-neutral-900 shadow-sm'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                <Eye className="h-4 w-4" aria-hidden="true" />
                <span>Pratinjau</span>
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                disabled={isExporting !== null}
                onClick={() => handleExport('PDF')}
                className="min-h-[44px] inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-3.5 py-2 text-sm font-medium text-neutral-900 hover:bg-neutral-50 whitespace-nowrap"
              >
                <Download className="h-4 w-4" aria-hidden="true" />
                <span>{isExporting === 'PDF' ? 'Mengekspor…' : 'PDF'}</span>
              </button>
              <button
                type="button"
                disabled={isExporting !== null}
                onClick={() => handleExport('DOCX')}
                className="min-h-[44px] inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-3.5 py-2 text-sm font-medium text-neutral-900 hover:bg-neutral-50 whitespace-nowrap"
              >
                <Download className="h-4 w-4" aria-hidden="true" />
                <span>{isExporting === 'DOCX' ? 'Mengekspor…' : 'DOCX'}</span>
              </button>
              <button
                type="button"
                disabled={isExporting !== null}
                onClick={() => handleExport('XLSX')}
                className="min-h-[44px] inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-3.5 py-2 text-sm font-medium text-neutral-900 hover:bg-neutral-50 whitespace-nowrap"
              >
                <Download className="h-4 w-4" aria-hidden="true" />
                <span>{isExporting === 'XLSX' ? 'Mengekspor…' : 'XLSX'}</span>
              </button>
            </div>
          </div>

          {viewMode === 'edit' ? (
            <div className="space-y-6">
              {/* 1 & 2. Identitas & Periode */}
              <section className="rounded-2xl bg-white border border-neutral-200 p-6 space-y-3">
                <h3 className="text-lg font-semibold text-neutral-900">
                  1. Identitas Pegawai &amp; Periode
                </h3>
                <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                  <p>
                    <span className="text-neutral-600">Periode:</span>{' '}
                    <span className="font-medium text-neutral-900">
                      {draftReport.report_content.header.period_label}
                    </span>
                  </p>
                  <p>
                    <span className="text-neutral-600">Nama:</span>{' '}
                    <span className="font-medium text-neutral-900">
                      {draftReport.report_content.header.full_name}
                    </span>
                  </p>
                  <p className="tabular-nums">
                    <span className="text-neutral-600">NIP:</span>{' '}
                    <span className="font-medium text-neutral-900">
                      {draftReport.report_content.header.nip}
                    </span>
                  </p>
                  <p>
                    <span className="text-neutral-600">Jabatan:</span>{' '}
                    <span className="font-medium text-neutral-900">
                      {draftReport.report_content.header.job_title}
                    </span>
                  </p>
                  <p className="sm:col-span-2">
                    <span className="text-neutral-600">Unit Kerja:</span>{' '}
                    <span className="font-medium text-neutral-900">
                      {draftReport.report_content.header.unit_name}
                    </span>
                  </p>
                </div>
              </section>

              {/* 3. Ringkasan Eksekutif */}
              <section className="rounded-2xl bg-white border border-neutral-200 p-6 space-y-3">
                <label
                  htmlFor="rep-summary"
                  className="block text-lg font-semibold text-neutral-900"
                >
                  2. Ringkasan Pelaksanaan Tugas
                </label>
                <textarea
                  id="rep-summary"
                  rows={4}
                  value={draftReport.report_content.executive_summary}
                  onChange={(e) =>
                    updateContent({ executive_summary: e.target.value })
                  }
                  className="w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-base text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700"
                />
              </section>

              {/* 4. Tabel Aktivitas Harian */}
              <section className="rounded-2xl bg-white border border-neutral-200 p-6 space-y-3">
                <h3 className="text-lg font-semibold text-neutral-900">
                  3. Rekap Aktivitas Harian
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-neutral-200 text-neutral-600">
                        <th className="py-2 pr-3 font-medium">No</th>
                        <th className="py-2 pr-3 font-medium">Tanggal</th>
                        <th className="py-2 pr-3 font-medium">Kegiatan</th>
                        <th className="py-2 pr-3 font-medium">Output / Hasil</th>
                        <th className="py-2 font-medium">Target Kinerja</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200">
                      {draftReport.report_content.activity_rows.length === 0 ? (
                        <tr>
                          <td
                            colSpan={5}
                            className="py-4 text-center text-neutral-600"
                          >
                            Tidak ada aktivitas pada periode ini.
                          </td>
                        </tr>
                      ) : (
                        draftReport.report_content.activity_rows.map(
                          (row, idx) => (
                            <tr key={row.activity_id}>
                              <td className="py-2.5 pr-3 tabular-nums">
                                {idx + 1}
                              </td>
                              <td className="py-2.5 pr-3 whitespace-nowrap">
                                {formatTanggalIndonesia(row.activity_date)}
                              </td>
                              <td className="py-2.5 pr-3 font-medium text-neutral-900">
                                {row.title}
                              </td>
                              <td className="py-2.5 pr-3">
                                {row.has_output ? (
                                  <span>{row.output_text}</span>
                                ) : (
                                  <span className="text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md text-xs font-medium">
                                    {row.output_text}
                                  </span>
                                )}
                              </td>
                              <td className="py-2.5 text-neutral-700">
                                {row.target_title}
                              </td>
                            </tr>
                          )
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* 5. Capaian Target Kinerja */}
              <section className="rounded-2xl bg-white border border-neutral-200 p-6 space-y-3">
                <h3 className="text-lg font-semibold text-neutral-900">
                  4. Capaian Target Kinerja
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-neutral-200 text-neutral-600">
                        <th className="py-2 pr-3 font-medium">Target Kinerja</th>
                        <th className="py-2 pr-3 font-medium">Indikator</th>
                        <th className="py-2 pr-3 font-medium">Target</th>
                        <th className="py-2 pr-3 font-medium">
                          Realisasi Tercatat
                        </th>
                        <th className="py-2 font-medium text-right">
                          Aktivitas
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200">
                      {draftReport.report_content.target_rows.length === 0 ? (
                        <tr>
                          <td
                            colSpan={5}
                            className="py-4 text-center text-neutral-600"
                          >
                            Belum ada target kinerja pada periode ini.
                          </td>
                        </tr>
                      ) : (
                        draftReport.report_content.target_rows.map((row) => (
                          <tr key={row.target_id}>
                            <td className="py-2.5 pr-3 font-medium text-neutral-900">
                              {row.title}
                            </td>
                            <td className="py-2.5 pr-3 text-neutral-700">
                              {row.indicator}
                            </td>
                            <td className="py-2.5 pr-3 tabular-nums">
                              {row.target_display}
                            </td>
                            <td className="py-2.5 pr-3 font-medium tabular-nums">
                              {row.realization_display}
                            </td>
                            <td className="py-2.5 text-right tabular-nums">
                              {row.supporting_count}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* 6. Rekap Output */}
              <section className="rounded-2xl bg-white border border-neutral-200 p-6 space-y-3">
                <h3 className="text-lg font-semibold text-neutral-900">
                  5. Rekap Output
                </h3>
                {draftReport.report_content.output_recap.length === 0 ? (
                  <p className="text-sm text-neutral-600">
                    Belum ada kuantitas output bernilai angka yang tercatat pada periode ini.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm border-collapse">
                      <thead>
                        <tr className="border-b border-neutral-200 text-neutral-600">
                          <th className="py-2 pr-3 font-medium">Satuan Output</th>
                          <th className="py-2 pr-3 font-medium text-right">
                            Total Kuantitas
                          </th>
                          <th className="py-2 font-medium text-right">
                            Jumlah Aktivitas
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-200">
                        {draftReport.report_content.output_recap.map((item) => (
                          <tr key={item.unit}>
                            <td className="py-2 pr-3 font-medium text-neutral-900">
                              {item.unit}
                            </td>
                            <td className="py-2 pr-3 text-right tabular-nums">
                              {formatDesimal(item.total_quantity)}
                            </td>
                            <td className="py-2 text-right tabular-nums">
                              {item.activity_count}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>

              {/* 7 & 8. Kendala & Penutup */}
              <section className="rounded-2xl bg-white border border-neutral-200 p-6 space-y-4">
                <div className="space-y-2">
                  <label
                    htmlFor="rep-challenges"
                    className="block text-lg font-semibold text-neutral-900"
                  >
                    6. Kendala dan Tindak Lanjut
                  </label>
                  <textarea
                    id="rep-challenges"
                    rows={4}
                    value={draftReport.report_content.challenges_and_followup}
                    onChange={(e) =>
                      updateContent({ challenges_and_followup: e.target.value })
                    }
                    className="w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-base text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700"
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="rep-closing"
                    className="block text-lg font-semibold text-neutral-900"
                  >
                    7. Penutup / Catatan
                  </label>
                  <textarea
                    id="rep-closing"
                    rows={3}
                    value={draftReport.report_content.closing_note}
                    onChange={(e) =>
                      updateContent({ closing_note: e.target.value })
                    }
                    className="w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-base text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700"
                  />
                </div>
              </section>

              <div className="flex flex-wrap justify-end gap-3">
                <button
                  type="button"
                  onClick={() => handleSaveWithStatus('Draft')}
                  className="min-h-[44px] inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-900 hover:bg-neutral-50"
                >
                  <Save className="h-4 w-4" aria-hidden="true" />
                  <span>Simpan Draft</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveWithStatus('Final')}
                  className="min-h-[44px] inline-flex items-center gap-2 rounded-xl bg-blue-700 px-5 py-2 text-sm font-medium text-white hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2"
                >
                  <FileCheck2 className="h-4 w-4" aria-hidden="true" />
                  <span>Tandai Siap Diunduh</span>
                </button>
              </div>
            </div>
          ) : (
            /* Pratinjau Dokumen Resmi Sesuai PRD Bagian 7 */
            <article className="rounded-2xl bg-white border border-neutral-200 p-6 sm:p-10 space-y-6">
              <div className="border-b border-neutral-200 pb-4 space-y-1">
                <h3 className="text-xl font-semibold text-neutral-900">
                  LAPORAN AKTIVITAS KERJA BULANAN
                </h3>
                <p className="text-sm text-neutral-600">
                  Periode: {draftReport.report_content.header.period_label}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-1.5 text-sm">
                <p>
                  <span className="inline-block w-28 text-neutral-600">Nama</span>:{' '}
                  <span className="font-medium text-neutral-900">
                    {draftReport.report_content.header.full_name}
                  </span>
                </p>
                <p className="tabular-nums">
                  <span className="inline-block w-28 text-neutral-600">NIP</span>:{' '}
                  {draftReport.report_content.header.nip}
                </p>
                <p>
                  <span className="inline-block w-28 text-neutral-600">
                    Jabatan
                  </span>
                  : {draftReport.report_content.header.job_title}
                </p>
                <p>
                  <span className="inline-block w-28 text-neutral-600">
                    Unit Kerja
                  </span>
                  : {draftReport.report_content.header.unit_name}
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="text-base font-semibold text-neutral-900">
                  Ringkasan Pelaksanaan Tugas
                </h4>
                <p className="text-sm text-neutral-800 leading-relaxed whitespace-pre-line">
                  {draftReport.report_content.executive_summary}
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="text-base font-semibold text-neutral-900">
                  Tabel Aktivitas
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border border-neutral-200 border-collapse">
                    <thead className="bg-neutral-50">
                      <tr className="border-b border-neutral-200">
                        <th className="p-2.5 border-r border-neutral-200 font-medium">
                          No
                        </th>
                        <th className="p-2.5 border-r border-neutral-200 font-medium">
                          Tanggal
                        </th>
                        <th className="p-2.5 border-r border-neutral-200 font-medium">
                          Kegiatan
                        </th>
                        <th className="p-2.5 border-r border-neutral-200 font-medium">
                          Output / Hasil
                        </th>
                        <th className="p-2.5 font-medium">Target Kinerja</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200">
                      {draftReport.report_content.activity_rows.map(
                        (row, idx) => (
                          <tr key={row.activity_id}>
                            <td className="p-2.5 border-r border-neutral-200 tabular-nums">
                              {idx + 1}
                            </td>
                            <td className="p-2.5 border-r border-neutral-200 whitespace-nowrap">
                              {formatTanggalIndonesia(row.activity_date)}
                            </td>
                            <td className="p-2.5 border-r border-neutral-200">
                              {row.title}
                            </td>
                            <td className="p-2.5 border-r border-neutral-200">
                              {row.output_text}
                            </td>
                            <td className="p-2.5">{row.target_title}</td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-base font-semibold text-neutral-900">
                  Capaian Target
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border border-neutral-200 border-collapse">
                    <thead className="bg-neutral-50">
                      <tr className="border-b border-neutral-200">
                        <th className="p-2.5 border-r border-neutral-200 font-medium">
                          Target Kinerja
                        </th>
                        <th className="p-2.5 border-r border-neutral-200 font-medium">
                          Indikator
                        </th>
                        <th className="p-2.5 border-r border-neutral-200 font-medium">
                          Target
                        </th>
                        <th className="p-2.5 border-r border-neutral-200 font-medium">
                          Realisasi Tercatat
                        </th>
                        <th className="p-2.5 font-medium text-right">
                          Aktivitas Pendukung
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200">
                      {draftReport.report_content.target_rows.map((row) => (
                        <tr key={row.target_id}>
                          <td className="p-2.5 border-r border-neutral-200">
                            {row.title}
                          </td>
                          <td className="p-2.5 border-r border-neutral-200">
                            {row.indicator}
                          </td>
                          <td className="p-2.5 border-r border-neutral-200 tabular-nums">
                            {row.target_display}
                          </td>
                          <td className="p-2.5 border-r border-neutral-200 tabular-nums">
                            {row.realization_display}
                          </td>
                          <td className="p-2.5 text-right tabular-nums">
                            {row.supporting_count}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-base font-semibold text-neutral-900">
                  Kendala dan Tindak Lanjut
                </h4>
                <p className="text-sm text-neutral-800 leading-relaxed whitespace-pre-line">
                  {draftReport.report_content.challenges_and_followup}
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="text-base font-semibold text-neutral-900">
                  Penutup
                </h4>
                <p className="text-sm text-neutral-800 leading-relaxed whitespace-pre-line">
                  {draftReport.report_content.closing_note}
                </p>
              </div>
            </article>
          )}
        </div>
      )}

      <ConfirmDialog
        open={confirmRegenerateOpen}
        title="Susun Ulang Narasi Laporan"
        message="Anda telah menyunting isi laporan secara manual. Menyusun ulang akan mengganti ringkasan dengan hasil terbaru dari data aktivitas."
        confirmLabel="Susun Ulang"
        onCancel={() => setConfirmRegenerateOpen(false)}
        onConfirm={() => {
          setConfirmRegenerateOpen(false);
          runGenerate(true);
        }}
      />
    </div>
  );
}
