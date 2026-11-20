/* Halaman Target Kinerja (SKP Mandiri): ASN membuat, menyunting, mengarsipkan, dan memantau realisasi targetnya */

import { FormEvent, useRef, useState } from 'react';
import { Archive, ArchiveRestore, ArrowRight, Pencil, Plus, X } from 'lucide-react';
import { calculateTargetRealization } from '../lib/calculations';
import { formatDesimal, formatTanggalIndonesia, getTodayISO } from '../lib/format';
import {
  ValidationErrors,
  focusFirstError,
  parseDecimalInput,
  validateTargetForm,
} from '../lib/validation';
import { Activity, PerformanceTarget, TargetStatus } from '../types';
import { TargetStatusBadge } from './StatusBadge';

export interface TargetSubmitPayload {
  id?: string;
  title: string;
  description: string;
  indicator: string;
  target_value: number | null;
  unit: string;
  period_start: string;
  period_end: string;
  status: TargetStatus;
}

interface TargetsViewProps {
  targets: PerformanceTarget[];
  activities: Activity[];
  onSaveTarget: (payload: TargetSubmitPayload) => void;
  onToggleArchive: (targetId: string) => void;
  onViewLinkedActivities: (targetId: string) => void;
}

export function TargetsView({
  targets,
  activities,
  onSaveTarget,
  onToggleArchive,
  onViewLinkedActivities,
}: TargetsViewProps) {
  const [tabStatus, setTabStatus] = useState<TargetStatus>('Aktif');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTarget, setEditingTarget] = useState<PerformanceTarget | null>(
    null
  );

  const currentYear = getTodayISO().slice(0, 4);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [indicator, setIndicator] = useState('');
  const [targetValueRaw, setTargetValueRaw] = useState('');
  const [unit, setUnit] = useState('');
  const [periodStart, setPeriodStart] = useState(`${currentYear}-01-01`);
  const [periodEnd, setPeriodEnd] = useState(`${currentYear}-12-31`);
  const [status, setStatus] = useState<TargetStatus>('Aktif');
  const [errors, setErrors] = useState<ValidationErrors>({});

  const titleRef = useRef<HTMLInputElement | null>(null);
  const indicatorRef = useRef<HTMLInputElement | null>(null);
  const valueRef = useRef<HTMLInputElement | null>(null);
  const startRef = useRef<HTMLInputElement | null>(null);
  const endRef = useRef<HTMLInputElement | null>(null);

  function openNewTarget() {
    setEditingTarget(null);
    setTitle('');
    setDescription('');
    setIndicator('');
    setTargetValueRaw('');
    setUnit('');
    setPeriodStart(`${currentYear}-01-01`);
    setPeriodEnd(`${currentYear}-12-31`);
    setStatus('Aktif');
    setErrors({});
    setIsModalOpen(true);
  }

  function openEditTarget(target: PerformanceTarget) {
    setEditingTarget(target);
    setTitle(target.title);
    setDescription(target.description);
    setIndicator(target.indicator);
    setTargetValueRaw(
      target.target_value !== null ? formatDesimal(target.target_value) : ''
    );
    setUnit(target.unit);
    setPeriodStart(target.period_start);
    setPeriodEnd(target.period_end);
    setStatus(target.status);
    setErrors({});
    setIsModalOpen(true);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const formErrors = validateTargetForm({
      title,
      indicator,
      target_value_raw: targetValueRaw,
      period_start: periodStart,
      period_end: periodEnd,
    });

    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      focusFirstError(formErrors, {
        title: titleRef.current,
        indicator: indicatorRef.current,
        target_value: valueRef.current,
        period_start: startRef.current,
        period_end: endRef.current,
      });
      return;
    }

    const parsedValue = parseDecimalInput(targetValueRaw);
    onSaveTarget({
      id: editingTarget?.id,
      title: title.trim(),
      description: description.trim(),
      indicator: indicator.trim(),
      target_value:
        parsedValue !== null && !Number.isNaN(parsedValue) ? parsedValue : null,
      unit: unit.trim(),
      period_start: periodStart.trim(),
      period_end: periodEnd.trim(),
      status,
    });
    setIsModalOpen(false);
  }

  const visibleTargets = targets.filter((t) => t.status === tabStatus);
  const activeCount = targets.filter((t) => t.status === 'Aktif').length;
  const archivedCount = targets.filter((t) => t.status === 'Diarsipkan').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-neutral-900">
            Target Kinerja (SKP Mandiri)
          </h2>
          <p className="mt-1 text-sm text-neutral-600">
            Kelola target kinerja Anda sendiri; realisasi dihitung langsung dari aktivitas tercatat.
          </p>
        </div>

        <button
          type="button"
          onClick={openNewTarget}
          className="min-h-[44px] inline-flex items-center gap-2 rounded-xl bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2 whitespace-nowrap self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          <span>Tambah Target</span>
        </button>
      </div>

      {/* Tab Status Target */}
      <div className="inline-flex rounded-xl bg-neutral-200/70 p-1 gap-1">
        <button
          type="button"
          onClick={() => setTabStatus('Aktif')}
          className={`min-h-[40px] rounded-lg px-4 py-1.5 text-sm font-medium transition-colors whitespace-nowrap tabular-nums ${
            tabStatus === 'Aktif'
              ? 'bg-white text-neutral-900 shadow-sm'
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          Aktif ({activeCount})
        </button>
        <button
          type="button"
          onClick={() => setTabStatus('Diarsipkan')}
          className={`min-h-[40px] rounded-lg px-4 py-1.5 text-sm font-medium transition-colors whitespace-nowrap tabular-nums ${
            tabStatus === 'Diarsipkan'
              ? 'bg-white text-neutral-900 shadow-sm'
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          Diarsipkan ({archivedCount})
        </button>
      </div>

      {visibleTargets.length === 0 ? (
        <div className="rounded-2xl bg-white border border-neutral-200 p-8 text-center space-y-3">
          <p className="text-sm text-neutral-600">
            {tabStatus === 'Aktif'
              ? 'Belum ada target kinerja aktif. Tambahkan target untuk menautkan aktivitas harian Anda.'
              : 'Belum ada target kinerja yang diarsipkan.'}
          </p>
          {tabStatus === 'Aktif' ? (
            <button
              type="button"
              onClick={openNewTarget}
              className="min-h-[44px] inline-flex items-center gap-2 rounded-xl bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              <span>Buat Target Pertama</span>
            </button>
          ) : null}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {visibleTargets.map((target) => {
            const realization = calculateTargetRealization(target, activities);
            return (
              <article
                key={target.id}
                className="rounded-2xl bg-white border border-neutral-200 p-6 flex flex-col justify-between gap-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 min-w-0">
                      <TargetStatusBadge status={target.status} />
                      <h3 className="text-lg font-semibold text-neutral-900">
                        {target.title}
                      </h3>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => openEditTarget(target)}
                        className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-blue-700 hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700"
                        aria-label={`Edit target ${target.title}`}
                      >
                        <Pencil className="h-4 w-4" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onToggleArchive(target.id)}
                        className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-neutral-600 hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700"
                        aria-label={
                          target.status === 'Aktif'
                            ? `Arsipkan target ${target.title}`
                            : `Aktifkan kembali ${target.title}`
                        }
                      >
                        {target.status === 'Aktif' ? (
                          <Archive className="h-4 w-4" aria-hidden="true" />
                        ) : (
                          <ArchiveRestore className="h-4 w-4" aria-hidden="true" />
                        )}
                      </button>
                    </div>
                  </div>

                  {target.description ? (
                    <p className="text-sm text-neutral-600">
                      {target.description}
                    </p>
                  ) : null}

                  <div className="text-xs text-neutral-600 space-y-1">
                    <p>
                      <span className="font-medium text-neutral-900">
                        Indikator:
                      </span>{' '}
                      {target.indicator}
                    </p>
                    <p>
                      <span className="font-medium text-neutral-900">
                        Periode:
                      </span>{' '}
                      {formatTanggalIndonesia(target.period_start)} –{' '}
                      {formatTanggalIndonesia(target.period_end)}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-neutral-200 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-neutral-600">Realisasi Tercatat</span>
                    <span className="font-semibold text-neutral-900 tabular-nums">
                      {realization.displayText}
                    </span>
                  </div>

                  {realization.progressPercent !== null ? (
                    <div className="space-y-1">
                      <div className="h-2 w-full rounded-full bg-neutral-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-blue-700 transition-transform duration-200"
                          style={{ width: `${realization.progressPercent}%` }}
                        />
                      </div>
                      <p className="text-xs text-neutral-600 tabular-nums">
                        {realization.progressPercent}% dari target ·{' '}
                        {realization.linkedCount} aktivitas tertaut
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-neutral-600 tabular-nums">
                      {realization.linkedCount} aktivitas tertaut (
                      {realization.completedCount} selesai)
                    </p>
                  )}

                  <button
                    type="button"
                    onClick={() => onViewLinkedActivities(target.id)}
                    className="min-h-[40px] inline-flex items-center gap-1.5 text-sm font-medium text-blue-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 rounded"
                  >
                    <span>Lihat aktivitas terkait</span>
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Modal Tambah / Edit Target */}
      {isModalOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-neutral-900/50 sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="target-modal-title"
        >
          <div className="w-full max-w-xl max-h-[92vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.06),0_8px_24px_rgba(0,0,0,0.08)]">
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-neutral-200">
              <h2
                id="target-modal-title"
                className="text-lg font-semibold text-neutral-900"
              >
                {editingTarget ? 'Edit Target Kinerja' : 'Tambah Target Kinerja'}
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-neutral-500 hover:bg-neutral-100"
                aria-label="Tutup form target"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4" noValidate>
              <div className="space-y-1.5">
                <label
                  htmlFor="tgt-title"
                  className="block text-sm font-medium text-neutral-900"
                >
                  Nama Target Kinerja *
                </label>
                <input
                  ref={titleRef}
                  id="tgt-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Pengelolaan layanan TI"
                  className="w-full min-h-[44px] rounded-xl border border-neutral-200 bg-white px-3.5 py-2 text-base text-neutral-900"
                />
                {errors.title ? (
                  <p className="text-xs text-red-800">{errors.title}</p>
                ) : null}
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="tgt-desc"
                  className="block text-sm font-medium text-neutral-900"
                >
                  Deskripsi Target
                </label>
                <textarea
                  id="tgt-desc"
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Uraian singkat ruang lingkup target"
                  className="w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2 text-base text-neutral-900"
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="tgt-indicator"
                  className="block text-sm font-medium text-neutral-900"
                >
                  Indikator Keberhasilan *
                </label>
                <input
                  ref={indicatorRef}
                  id="tgt-indicator"
                  type="text"
                  value={indicator}
                  onChange={(e) => setIndicator(e.target.value)}
                  placeholder="Contoh: Jumlah pemeliharaan sistem yang selesai tepat waktu"
                  className="w-full min-h-[44px] rounded-xl border border-neutral-200 bg-white px-3.5 py-2 text-base text-neutral-900"
                />
                {errors.indicator ? (
                  <p className="text-xs text-red-800">{errors.indicator}</p>
                ) : null}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label
                    htmlFor="tgt-value"
                    className="block text-sm font-medium text-neutral-900"
                  >
                    Nilai Target (opsional)
                  </label>
                  <input
                    ref={valueRef}
                    id="tgt-value"
                    type="text"
                    inputMode="decimal"
                    value={targetValueRaw}
                    onChange={(e) => setTargetValueRaw(e.target.value)}
                    placeholder="Contoh: 12"
                    className="w-full min-h-[44px] rounded-xl border border-neutral-200 bg-white px-3.5 py-2 text-base text-neutral-900"
                  />
                  {errors.target_value ? (
                    <p className="text-xs text-red-800">{errors.target_value}</p>
                  ) : null}
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="tgt-unit"
                    className="block text-sm font-medium text-neutral-900"
                  >
                    Satuan (opsional)
                  </label>
                  <input
                    id="tgt-unit"
                    type="text"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="Contoh: Laporan"
                    className="w-full min-h-[44px] rounded-xl border border-neutral-200 bg-white px-3.5 py-2 text-base text-neutral-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label
                    htmlFor="tgt-start"
                    className="block text-sm font-medium text-neutral-900"
                  >
                    Periode Mulai *
                  </label>
                  <input
                    ref={startRef}
                    id="tgt-start"
                    type="date"
                    value={periodStart}
                    onChange={(e) => setPeriodStart(e.target.value)}
                    className="w-full min-h-[44px] rounded-xl border border-neutral-200 bg-white px-3.5 py-2 text-base text-neutral-900"
                  />
                  {errors.period_start ? (
                    <p className="text-xs text-red-800">{errors.period_start}</p>
                  ) : null}
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="tgt-end"
                    className="block text-sm font-medium text-neutral-900"
                  >
                    Periode Selesai *
                  </label>
                  <input
                    ref={endRef}
                    id="tgt-end"
                    type="date"
                    value={periodEnd}
                    onChange={(e) => setPeriodEnd(e.target.value)}
                    className="w-full min-h-[44px] rounded-xl border border-neutral-200 bg-white px-3.5 py-2 text-base text-neutral-900"
                  />
                  {errors.period_end ? (
                    <p className="text-xs text-red-800">{errors.period_end}</p>
                  ) : null}
                </div>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="tgt-status"
                  className="block text-sm font-medium text-neutral-900"
                >
                  Status Target
                </label>
                <select
                  id="tgt-status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as TargetStatus)}
                  className="w-full min-h-[44px] rounded-xl border border-neutral-200 bg-white px-3.5 py-2 text-base text-neutral-900"
                >
                  <option value="Aktif">Aktif</option>
                  <option value="Diarsipkan">Diarsipkan</option>
                </select>
              </div>

              <div className="pt-3 flex flex-wrap justify-end gap-3 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="min-h-[44px] rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-900 hover:bg-neutral-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="min-h-[44px] rounded-xl bg-blue-700 px-5 py-2 text-sm font-medium text-white hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2"
                >
                  {editingTarget ? 'Simpan Perubahan' : 'Simpan Target'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
