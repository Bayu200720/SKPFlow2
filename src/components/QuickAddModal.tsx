/* Modal Quick Add: input kalimat alami, pemisahan aktivitas oleh asisten lokal, dan pratinjau konfirmasi sebelum simpan */

import { FormEvent, useRef, useState } from 'react';
import { Check, CheckSquare, Square, Wand2, X } from 'lucide-react';
import { ACTIVITY_CATEGORIES, ACTIVITY_STATUSES } from '../config';
import { splitNaturalLanguageQuickAdd } from '../lib/aiAssistant';
import { getEligibleTargetsForDate } from '../lib/calculations';
import { getTodayISO } from '../lib/format';
import { PerformanceTarget, QuickAddItemDraft } from '../types';

interface QuickAddModalProps {
  open: boolean;
  targets: PerformanceTarget[];
  onClose: () => void;
  onSaveDrafts: (drafts: QuickAddItemDraft[]) => void;
}

const EXAMPLE_TEXT =
  'Hari ini melakukan backup database SIMOPPA, mengecek server, dan memperbaiki bug login aplikasi.';

export function QuickAddModal({
  open,
  targets,
  onClose,
  onSaveDrafts,
}: QuickAddModalProps) {
  const [rawText, setRawText] = useState('');
  const [activityDate, setActivityDate] = useState(getTodayISO());
  const [optionalOutput, setOptionalOutput] = useState('');
  const [drafts, setDrafts] = useState<QuickAddItemDraft[] | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const textAreaRef = useRef<HTMLTextAreaElement | null>(null);

  if (!open) return null;

  function resetAndClose() {
    setRawText('');
    setOptionalOutput('');
    setDrafts(null);
    setErrorMsg(null);
    onClose();
  }

  function handleAnalyze(e: FormEvent) {
    e.preventDefault();
    if (!rawText.trim()) {
      setErrorMsg(
        'Tuliskan pekerjaan yang Anda lakukan terlebih dahulu, misalnya melakukan backup database SIMOPPA.'
      );
      textAreaRef.current?.focus();
      return;
    }
    if (!activityDate.trim()) {
      setErrorMsg('Pilih tanggal pelaksanaan aktivitas.');
      return;
    }

    setErrorMsg(null);
    const parsed = splitNaturalLanguageQuickAdd(
      rawText,
      activityDate,
      optionalOutput,
      targets
    );
    setDrafts(parsed);
  }

  function handleSaveDirect() {
    if (!rawText.trim()) {
      setErrorMsg(
        'Tuliskan pekerjaan yang Anda lakukan terlebih dahulu, misalnya rapat koordinasi teknis.'
      );
      textAreaRef.current?.focus();
      return;
    }
    if (!activityDate.trim()) {
      setErrorMsg('Pilih tanggal pelaksanaan aktivitas.');
      return;
    }

    const single = splitNaturalLanguageQuickAdd(
      rawText.replace(/,|;/g, ' '),
      activityDate,
      optionalOutput,
      targets
    ).slice(0, 1);

    if (single.length > 0) {
      single[0].title = rawText.trim().slice(0, 120);
      single[0].description = rawText.trim();
      onSaveDrafts(single);
      resetAndClose();
    }
  }

  function updateDraft(id: string, patch: Partial<QuickAddItemDraft>) {
    setDrafts((prev) =>
      prev ? prev.map((d) => (d.id === id ? { ...d, ...patch } : d)) : prev
    );
  }

  function handleConfirmSave() {
    if (!drafts) return;
    const selected = drafts.filter((d) => d.selected && d.title.trim());
    if (selected.length === 0) {
      setErrorMsg(
        'Pilih minimal satu aktivitas dengan judul terisi sebelum menyimpan.'
      );
      return;
    }
    onSaveDrafts(selected);
    resetAndClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-neutral-900/50 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="quick-add-title"
    >
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.06),0_8px_24px_rgba(0,0,0,0.08)]">
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-neutral-200">
          <div>
            <h2
              id="quick-add-title"
              className="text-lg font-semibold text-neutral-900"
            >
              Catat Cepat Aktivitas
            </h2>
            <p className="mt-1 text-sm text-neutral-600">
              Tulis pekerjaan dengan kalimat biasa; sistem membantu memecah dan merapikan untuk Anda tinjau.
            </p>
          </div>
          <button
            type="button"
            onClick={resetAndClose}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700"
            aria-label="Tutup Catat Cepat"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {!drafts ? (
          <form onSubmit={handleAnalyze} className="mt-5 space-y-4" noValidate>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <label
                  htmlFor="quick-add-text"
                  className="block text-sm font-medium text-neutral-900"
                >
                  Apa yang Anda kerjakan?
                </label>
                <button
                  type="button"
                  onClick={() => setRawText(EXAMPLE_TEXT)}
                  className="text-xs font-medium text-blue-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 rounded"
                >
                  Isi contoh kalimat
                </button>
              </div>
              <textarea
                ref={textAreaRef}
                id="quick-add-text"
                rows={4}
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder="Contoh: Hari ini melakukan backup database SIMOPPA, mengecek server, dan memperbaiki bug login aplikasi."
                className="w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-base text-neutral-900 placeholder:text-neutral-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label
                  htmlFor="quick-add-date"
                  className="block text-sm font-medium text-neutral-900"
                >
                  Tanggal Pelaksanaan
                </label>
                <input
                  id="quick-add-date"
                  type="date"
                  value={activityDate}
                  onChange={(e) => setActivityDate(e.target.value)}
                  className="w-full min-h-[44px] rounded-xl border border-neutral-200 bg-white px-3.5 py-2 text-base text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700"
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="quick-add-output"
                  className="block text-sm font-medium text-neutral-900"
                >
                  Hasil / Output (opsional)
                </label>
                <input
                  id="quick-add-output"
                  type="text"
                  value={optionalOutput}
                  onChange={(e) => setOptionalOutput(e.target.value)}
                  placeholder="Contoh: 1 laporan pengecekan"
                  className="w-full min-h-[44px] rounded-xl border border-neutral-200 bg-white px-3.5 py-2 text-base text-neutral-900 placeholder:text-neutral-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700"
                />
              </div>
            </div>

            {errorMsg ? (
              <p
                role="alert"
                className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-800"
              >
                {errorMsg}
              </p>
            ) : null}

            <div className="pt-2 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={handleSaveDirect}
                className="min-h-[44px] rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-900 hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 whitespace-nowrap"
              >
                Simpan Langsung
              </button>
              <button
                type="submit"
                className="min-h-[44px] inline-flex items-center gap-2 rounded-xl bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2 whitespace-nowrap"
              >
                <Wand2 className="h-4 w-4" aria-hidden="true" />
                <span>Tinjau Saran AI</span>
              </button>
            </div>
          </form>
        ) : (
          <div className="mt-5 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm text-neutral-700">
                Ditemukan <span className="font-semibold tabular-nums">{drafts.length}</span> butir aktivitas. Periksa dan ubah sebelum disimpan.
              </p>
              <button
                type="button"
                onClick={() => setDrafts(null)}
                className="text-sm font-medium text-blue-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 rounded"
              >
                Ubah teks awal
              </button>
            </div>

            <div className="space-y-4">
              {drafts.map((item, idx) => {
                const eligibleTargets = getEligibleTargetsForDate(
                  targets,
                  item.activity_date
                );
                return (
                  <div
                    key={item.id}
                    className={`rounded-2xl border p-4 space-y-3 ${
                      item.selected
                        ? 'border-blue-700 bg-blue-50/40'
                        : 'border-neutral-200 bg-neutral-50 opacity-75'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          updateDraft(item.id, { selected: !item.selected })
                        }
                        className="min-h-[44px] inline-flex items-center gap-2 text-sm font-medium text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 rounded"
                      >
                        {item.selected ? (
                          <CheckSquare
                            className="h-5 w-5 text-blue-700"
                            aria-hidden="true"
                          />
                        ) : (
                          <Square
                            className="h-5 w-5 text-neutral-500"
                            aria-hidden="true"
                          />
                        )}
                        <span>Aktivitas {idx + 1}</span>
                      </button>
                      <span className="text-xs text-neutral-600">
                        {item.recommended_target_reason}
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-neutral-700 mb-1">
                          Judul Aktivitas
                        </label>
                        <input
                          type="text"
                          value={item.title}
                          onChange={(e) =>
                            updateDraft(item.id, { title: e.target.value })
                          }
                          className="w-full min-h-[44px] rounded-xl border border-neutral-200 bg-white px-3 py-2 text-base text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-neutral-700 mb-1">
                          Narasi Formal
                        </label>
                        <textarea
                          rows={2}
                          value={item.description}
                          onChange={(e) =>
                            updateDraft(item.id, { description: e.target.value })
                          }
                          className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-base text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700"
                        />
                      </div>

                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <div>
                          <label className="block text-xs font-medium text-neutral-700 mb-1">
                            Kategori
                          </label>
                          <select
                            value={item.category}
                            onChange={(e) =>
                              updateDraft(item.id, { category: e.target.value })
                            }
                            className="w-full min-h-[44px] rounded-xl border border-neutral-200 bg-white px-3 py-2 text-base text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700"
                          >
                            {ACTIVITY_CATEGORIES.map((cat) => (
                              <option key={cat} value={cat}>
                                {cat}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-neutral-700 mb-1">
                            Target Kinerja (Aktif)
                          </label>
                          <select
                            value={item.target_id ?? ''}
                            onChange={(e) =>
                              updateDraft(item.id, {
                                target_id: e.target.value || null,
                              })
                            }
                            className="w-full min-h-[44px] rounded-xl border border-neutral-200 bg-white px-3 py-2 text-base text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700"
                          >
                            <option value="">Tanpa target terkait</option>
                            {eligibleTargets.map((t) => (
                              <option key={t.id} value={t.id}>
                                {t.title}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-neutral-700 mb-1">
                            Status
                          </label>
                          <select
                            value={item.status}
                            onChange={(e) =>
                              updateDraft(item.id, {
                                status: e.target.value as QuickAddItemDraft['status'],
                              })
                            }
                            className="w-full min-h-[44px] rounded-xl border border-neutral-200 bg-white px-3 py-2 text-base text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700"
                          >
                            {ACTIVITY_STATUSES.map((st) => (
                              <option key={st} value={st}>
                                {st}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-neutral-700 mb-1">
                          Output / Hasil (opsional)
                        </label>
                        <input
                          type="text"
                          value={item.output_description}
                          onChange={(e) =>
                            updateDraft(item.id, {
                              output_description: e.target.value,
                            })
                          }
                          placeholder="Contoh: Arsip cadangan database terverifikasi"
                          className="w-full min-h-[44px] rounded-xl border border-neutral-200 bg-white px-3 py-2 text-base text-neutral-900 placeholder:text-neutral-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {errorMsg ? (
              <p
                role="alert"
                className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-800"
              >
                {errorMsg}
              </p>
            ) : null}

            <div className="pt-2 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={resetAndClose}
                className="min-h-[44px] rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-900 hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmSave}
                className="min-h-[44px] inline-flex items-center gap-2 rounded-xl bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2 whitespace-nowrap"
              >
                <Check className="h-4 w-4" aria-hidden="true" />
                <span>Simpan Aktivitas Terpilih</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
