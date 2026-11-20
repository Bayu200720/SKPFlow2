/* Halaman Aktivitas Harian (Daily Worklog): pencarian, multi-filter, timeline, detail, form tambah/ubah, dan unggah bukti dukung */

import { ChangeEvent, FormEvent, useEffect, useRef, useState } from 'react';
import {
  Download,
  Eye,
  FileText,
  Filter,
  Paperclip,
  Pencil,
  Plus,
  Search,
  Trash2,
  Upload,
  Wand2,
  X,
} from 'lucide-react';
import {
  ACTIVITY_CATEGORIES,
  ACTIVITY_PRIORITIES,
  ACTIVITY_STATUSES,
  OUTPUT_UNITS_SUGGESTIONS,
} from '../config';
import {
  formalizeActivityNarrative,
  suggestActiveTarget,
  suggestCategory,
} from '../lib/aiAssistant';
import {
  ActivityFilters,
  filterActivities,
  getEligibleTargetsForDate,
  isTargetActiveForDate,
} from '../lib/calculations';
import {
  formatDesimal,
  formatDurasi,
  formatTanggalIndonesia,
  formatUkuranBerkas,
  getTodayISO,
} from '../lib/format';
import {
  ValidationErrors,
  focusFirstError,
  parseDecimalInput,
  parseIntegerInput,
  validateActivityForm,
  validateAttachmentFile,
} from '../lib/validation';
import {
  Activity,
  ActivityAttachment,
  ActivityPriority,
  ActivityStatus,
  PerformanceTarget,
} from '../types';
import { ConfirmDialog } from './ConfirmDialog';
import { ActivityStatusBadge, PriorityLabel } from './StatusBadge';

export interface ActivitySubmitPayload {
  id?: string;
  activity_date: string;
  title: string;
  description: string;
  category: string;
  target_id: string | null;
  output_description: string;
  output_quantity: number | null;
  output_unit: string;
  duration_minutes: number | null;
  status: ActivityStatus;
  priority: ActivityPriority;
  tags: string[];
  challenges: string;
  follow_up: string;
  pendingAttachments: {
    file_name: string;
    mime_type: string;
    file_size: number;
    data_url: string;
  }[];
  removedAttachmentIds: string[];
}

interface WorklogViewProps {
  activities: Activity[];
  targets: PerformanceTarget[];
  attachments: ActivityAttachment[];
  initialFilterTargetId?: string;
  openCreateTrigger: number;
  onSaveActivity: (payload: ActivitySubmitPayload) => void;
  onDeleteActivity: (activityId: string) => void;
  onOpenQuickAdd: () => void;
}

const DEFAULT_FILTERS: ActivityFilters = {
  keyword: '',
  dateFrom: '',
  dateTo: '',
  monthYear: '',
  category: '',
  targetId: '',
  status: '',
  priority: '',
  hasAttachment: 'all',
};

export function WorklogView({
  activities,
  targets,
  attachments,
  initialFilterTargetId,
  openCreateTrigger,
  onSaveActivity,
  onDeleteActivity,
  onOpenQuickAdd,
}: WorklogViewProps) {
  const [filters, setFilters] = useState<ActivityFilters>(() => ({
    ...DEFAULT_FILTERS,
    targetId: initialFilterTargetId ?? '',
  }));
  const [showFilters, setShowFilters] = useState(Boolean(initialFilterTargetId));
  const [detailActivity, setDetailActivity] = useState<Activity | null>(null);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Activity | null>(null);

  // State form aktivitas
  const [activityDate, setActivityDate] = useState(getTodayISO());
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(ACTIVITY_CATEGORIES[0]);
  const [targetId, setTargetId] = useState('');
  const [outputDesc, setOutputDesc] = useState('');
  const [outputQtyRaw, setOutputQtyRaw] = useState('');
  const [outputUnit, setOutputUnit] = useState('');
  const [durationRaw, setDurationRaw] = useState('');
  const [status, setStatus] = useState<ActivityStatus>('Selesai');
  const [priority, setPriority] = useState<ActivityPriority>('Sedang');
  const [tagsRaw, setTagsRaw] = useState('');
  const [challenges, setChallenges] = useState('');
  const [followUp, setFollowUp] = useState('');
  const [pendingFiles, setPendingFiles] = useState<
    { file_name: string; mime_type: string; file_size: number; data_url: string }[]
  >([]);
  const [removedAttachmentIds, setRemovedAttachmentIds] = useState<string[]>([]);
  const [attachmentError, setAttachmentError] = useState<string | null>(null);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [aiNote, setAiNote] = useState<string | null>(null);

  const dateRef = useRef<HTMLInputElement | null>(null);
  const titleRef = useRef<HTMLInputElement | null>(null);
  const qtyRef = useRef<HTMLInputElement | null>(null);
  const durRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (initialFilterTargetId !== undefined) {
      setFilters((prev) => ({ ...prev, targetId: initialFilterTargetId }));
      if (initialFilterTargetId) setShowFilters(true);
    }
  }, [initialFilterTargetId]);

  useEffect(() => {
    if (openCreateTrigger > 0) {
      openNewForm();
    }
  }, [openCreateTrigger]);

  function openNewForm() {
    setEditingActivity(null);
    setActivityDate(getTodayISO());
    setTitle('');
    setDescription('');
    setCategory(ACTIVITY_CATEGORIES[0]);
    setTargetId('');
    setOutputDesc('');
    setOutputQtyRaw('');
    setOutputUnit('');
    setDurationRaw('');
    setStatus('Selesai');
    setPriority('Sedang');
    setTagsRaw('');
    setChallenges('');
    setFollowUp('');
    setPendingFiles([]);
    setRemovedAttachmentIds([]);
    setAttachmentError(null);
    setErrors({});
    setAiNote(null);
    setIsFormOpen(true);
  }

  function openEditForm(act: Activity) {
    setEditingActivity(act);
    setActivityDate(act.activity_date);
    setTitle(act.title);
    setDescription(act.description);
    setCategory(act.category);
    setTargetId(act.target_id ?? '');
    setOutputDesc(act.output_description);
    setOutputQtyRaw(
      act.output_quantity !== null ? formatDesimal(act.output_quantity) : ''
    );
    setOutputUnit(act.output_unit);
    setDurationRaw(
      act.duration_minutes !== null ? String(act.duration_minutes) : ''
    );
    setStatus(act.status);
    setPriority(act.priority);
    setTagsRaw(act.tags.join(', '));
    setChallenges(act.challenges);
    setFollowUp(act.follow_up);
    setPendingFiles([]);
    setRemovedAttachmentIds([]);
    setAttachmentError(null);
    setErrors({});
    setAiNote(null);
    setIsFormOpen(true);
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    setAttachmentError(null);
    const files = Array.from(fileList);

    for (const file of files) {
      const fileErr = validateAttachmentFile(file);
      if (fileErr) {
        setAttachmentError(fileErr);
        e.target.value = '';
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = typeof reader.result === 'string' ? reader.result : '';
        setPendingFiles((prev) => [
          ...prev,
          {
            file_name: file.name,
            mime_type: file.type || 'application/octet-stream',
            file_size: file.size,
            data_url: dataUrl,
          },
        ]);
      };
      reader.readAsDataURL(file);
    }

    e.target.value = '';
  }

  function handleFormalizeAI() {
    if (!title.trim() && !description.trim()) {
      setAiNote('Isi judul atau deskripsi terlebih dahulu sebelum merapikan narasi.');
      return;
    }
    const result = formalizeActivityNarrative({
      title,
      description,
      output_description: outputDesc,
    });
    setTitle(result.title);
    setDescription(result.description);
    setAiNote('Narasi telah dirapikan ke bahasa dinas; silakan periksa sebelum menyimpan.');
  }

  function handleSuggestMappingAI() {
    const sourceText = `${title} ${description}`.trim();
    if (!sourceText) {
      setAiNote('Isi judul atau deskripsi agar sistem dapat menyarankan kategori dan target.');
      return;
    }
    const cat = suggestCategory(sourceText);
    const tgt = suggestActiveTarget(sourceText, activityDate, targets);
    setCategory(cat);
    if (tgt.target_id) {
      setTargetId(tgt.target_id);
    }
    setAiNote(`Saran kategori: ${cat}. ${tgt.reason}.`);
  }

  function handleSubmitForm(e: FormEvent) {
    e.preventDefault();
    const formErrors = validateActivityForm({
      activity_date: activityDate,
      title,
      output_quantity_raw: outputQtyRaw,
      duration_minutes_raw: durationRaw,
    });

    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      focusFirstError(formErrors, {
        activity_date: dateRef.current,
        title: titleRef.current,
        output_quantity: qtyRef.current,
        duration_minutes: durRef.current,
      });
      return;
    }

    const parsedQty = parseDecimalInput(outputQtyRaw);
    const parsedDur = parseIntegerInput(durationRaw);
    const cleanTags = tagsRaw
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    onSaveActivity({
      id: editingActivity?.id,
      activity_date: activityDate.trim(),
      title: title.trim(),
      description: description.trim(),
      category,
      target_id: targetId || null,
      output_description: outputDesc.trim(),
      output_quantity: parsedQty !== null && !Number.isNaN(parsedQty) ? parsedQty : null,
      output_unit: outputUnit.trim(),
      duration_minutes: parsedDur !== null && !Number.isNaN(parsedDur) ? parsedDur : null,
      status,
      priority,
      tags: cleanTags,
      challenges: challenges.trim(),
      follow_up: followUp.trim(),
      pendingAttachments: pendingFiles,
      removedAttachmentIds,
    });

    setIsFormOpen(false);
  }

  const targetMap = new Map(targets.map((t) => [t.id, t]));
  const filteredActivities = filterActivities(activities, attachments, filters);
  const eligibleTargets = getEligibleTargetsForDate(targets, activityDate);
  const currentEditingTarget =
    editingActivity?.target_id ? targetMap.get(editingActivity.target_id) : null;
  const showArchivedTargetOption =
    currentEditingTarget &&
    !isTargetActiveForDate(currentEditingTarget, activityDate);

  const existingEditAttachments = editingActivity
    ? attachments.filter(
        (att) =>
          att.activity_id === editingActivity.id &&
          !removedAttachmentIds.includes(att.id)
      )
    : [];

  return (
    <div className="space-y-6">
      {/* Header dan Tombol Tambah */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-neutral-900">
            Aktivitas Harian
          </h2>
          <p className="mt-1 text-sm text-neutral-600">
            Catat, cari, dan kelola pekerjaan harian beserta bukti dukung Anda.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onOpenQuickAdd}
            className="min-h-[44px] inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-900 hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 whitespace-nowrap"
          >
            <Wand2 className="h-4 w-4" aria-hidden="true" />
            <span>Catat Cepat</span>
          </button>
          <button
            type="button"
            onClick={openNewForm}
            className="min-h-[44px] inline-flex items-center gap-2 rounded-xl bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2 whitespace-nowrap"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            <span>Tambah Aktivitas</span>
          </button>
        </div>
      </div>

      {/* Toolbar Pencarian & Multi-Filter */}
      <section className="rounded-2xl bg-white border border-neutral-200 p-4 space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500"
              aria-hidden="true"
            />
            <input
              type="search"
              value={filters.keyword}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, keyword: e.target.value }))
              }
              placeholder="Cari judul, output, kategori, atau tag aktivitas"
              aria-label="Cari aktivitas"
              className="w-full min-h-[44px] rounded-xl border border-neutral-200 bg-white pl-10 pr-3.5 py-2 text-base text-neutral-900 placeholder:text-neutral-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowFilters((v) => !v)}
              className={`min-h-[44px] inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 whitespace-nowrap ${
                showFilters
                  ? 'border-blue-700 bg-blue-50 text-blue-700'
                  : 'border-neutral-200 bg-white text-neutral-900 hover:bg-neutral-50'
              }`}
            >
              <Filter className="h-4 w-4" aria-hidden="true" />
              <span>Filter</span>
            </button>
            <button
              type="button"
              onClick={() => setFilters(DEFAULT_FILTERS)}
              className="min-h-[44px] rounded-xl border border-neutral-200 bg-white px-3.5 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 whitespace-nowrap"
            >
              Reset
            </button>
          </div>
        </div>

        {showFilters ? (
          <div className="pt-3 border-t border-neutral-200 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">
                Dari Tanggal
              </label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) =>
                  setFilters((p) => ({ ...p, dateFrom: e.target.value }))
                }
                className="w-full min-h-[44px] rounded-xl border border-neutral-200 bg-white px-3 py-2 text-base text-neutral-900"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">
                Sampai Tanggal
              </label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) =>
                  setFilters((p) => ({ ...p, dateTo: e.target.value }))
                }
                className="w-full min-h-[44px] rounded-xl border border-neutral-200 bg-white px-3 py-2 text-base text-neutral-900"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">
                Bulan / Tahun
              </label>
              <input
                type="month"
                value={filters.monthYear}
                onChange={(e) =>
                  setFilters((p) => ({ ...p, monthYear: e.target.value }))
                }
                className="w-full min-h-[44px] rounded-xl border border-neutral-200 bg-white px-3 py-2 text-base text-neutral-900"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">
                Kategori
              </label>
              <select
                value={filters.category}
                onChange={(e) =>
                  setFilters((p) => ({ ...p, category: e.target.value }))
                }
                className="w-full min-h-[44px] rounded-xl border border-neutral-200 bg-white px-3 py-2 text-base text-neutral-900"
              >
                <option value="">Semua kategori</option>
                {ACTIVITY_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">
                Target Kinerja
              </label>
              <select
                value={filters.targetId}
                onChange={(e) =>
                  setFilters((p) => ({ ...p, targetId: e.target.value }))
                }
                className="w-full min-h-[44px] rounded-xl border border-neutral-200 bg-white px-3 py-2 text-base text-neutral-900"
              >
                <option value="">Semua target</option>
                <option value="__none__">Tanpa target terkait</option>
                {targets.map((t) => (
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
                value={filters.status}
                onChange={(e) =>
                  setFilters((p) => ({
                    ...p,
                    status: e.target.value as ActivityFilters['status'],
                  }))
                }
                className="w-full min-h-[44px] rounded-xl border border-neutral-200 bg-white px-3 py-2 text-base text-neutral-900"
              >
                <option value="">Semua status</option>
                {ACTIVITY_STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">
                Prioritas
              </label>
              <select
                value={filters.priority}
                onChange={(e) =>
                  setFilters((p) => ({
                    ...p,
                    priority: e.target.value as ActivityFilters['priority'],
                  }))
                }
                className="w-full min-h-[44px] rounded-xl border border-neutral-200 bg-white px-3 py-2 text-base text-neutral-900"
              >
                <option value="">Semua prioritas</option>
                {ACTIVITY_PRIORITIES.map((pr) => (
                  <option key={pr} value={pr}>
                    {pr}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">
                Bukti Dukung
              </label>
              <select
                value={filters.hasAttachment}
                onChange={(e) =>
                  setFilters((p) => ({
                    ...p,
                    hasAttachment: e.target
                      .value as ActivityFilters['hasAttachment'],
                  }))
                }
                className="w-full min-h-[44px] rounded-xl border border-neutral-200 bg-white px-3 py-2 text-base text-neutral-900"
              >
                <option value="all">Semua</option>
                <option value="yes">Ada bukti dukung</option>
                <option value="no">Belum ada bukti dukung</option>
              </select>
            </div>
          </div>
        ) : null}
      </section>

      {/* Daftar / Timeline Aktivitas */}
      <p className="text-sm text-neutral-600 tabular-nums">
        Menampilkan {filteredActivities.length} dari {activities.length} aktivitas
      </p>

      {filteredActivities.length === 0 ? (
        <div className="rounded-2xl bg-white border border-neutral-200 p-8 text-center space-y-3">
          <p className="text-sm text-neutral-600">
            Tidak ada aktivitas yang cocok dengan filter saat ini.
          </p>
          <button
            type="button"
            onClick={openNewForm}
            className="min-h-[44px] inline-flex items-center gap-2 rounded-xl bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            <span>Tambah Aktivitas</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredActivities.map((act) => {
            const actAttachments = attachments.filter(
              (att) => att.activity_id === act.id
            );
            const linkedTarget = act.target_id
              ? targetMap.get(act.target_id)
              : null;

            return (
              <article
                key={act.id}
                className="rounded-2xl bg-white border border-neutral-200 p-4 sm:p-6 space-y-3"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <ActivityStatusBadge status={act.status} />
                      <PriorityLabel priority={act.priority} />
                    </div>
                    <h3 className="text-base font-semibold text-neutral-900">
                      {act.title}
                    </h3>
                    <p className="text-xs text-neutral-600">
                      {formatTanggalIndonesia(act.activity_date)} · {act.category}
                      {linkedTarget ? ` · Target: ${linkedTarget.title}` : ''}
                      {act.duration_minutes
                        ? ` · ${formatDurasi(act.duration_minutes)}`
                        : ''}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => setDetailActivity(act)}
                      className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center gap-1.5 rounded-xl px-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700"
                      aria-label={`Lihat detail ${act.title}`}
                    >
                      <Eye className="h-4 w-4" aria-hidden="true" />
                      <span className="hidden sm:inline">Detail</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => openEditForm(act)}
                      className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center gap-1.5 rounded-xl px-2.5 text-sm font-medium text-blue-700 hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700"
                      aria-label={`Edit ${act.title}`}
                    >
                      <Pencil className="h-4 w-4" aria-hidden="true" />
                      <span className="hidden sm:inline">Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(act)}
                      className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-xl text-red-700 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700"
                      aria-label={`Hapus ${act.title}`}
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>

                {act.description ? (
                  <p className="text-sm text-neutral-700 leading-relaxed">
                    {act.description}
                  </p>
                ) : null}

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-600 pt-1">
                  <span>
                    Output:{' '}
                    {act.output_description || act.output_quantity !== null
                      ? `${act.output_description}${
                          act.output_quantity !== null
                            ? ` (${formatDesimal(act.output_quantity)}${
                                act.output_unit ? ` ${act.output_unit}` : ''
                              })`
                            : ''
                        }`
                      : 'Belum dicatat'}
                  </span>
                  {actAttachments.length > 0 ? (
                    <span className="inline-flex items-center gap-1 font-medium text-neutral-800 tabular-nums">
                      <Paperclip className="h-3.5 w-3.5" aria-hidden="true" />
                      {actAttachments.length} bukti dukung
                    </span>
                  ) : null}
                  {act.tags.length > 0 ? (
                    <span>Tag: {act.tags.join(', ')}</span>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Modal Detail Aktivitas */}
      {detailActivity ? (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-neutral-900/50 sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="detail-activity-title"
        >
          <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl bg-white p-6 space-y-4 shadow-[0_1px_2px_rgba(0,0,0,0.06),0_8px_24px_rgba(0,0,0,0.08)]">
            <div className="flex items-start justify-between gap-4 pb-3 border-b border-neutral-200">
              <div>
                <h2
                  id="detail-activity-title"
                  className="text-lg font-semibold text-neutral-900"
                >
                  {detailActivity.title}
                </h2>
                <p className="mt-1 text-xs text-neutral-600">
                  {formatTanggalIndonesia(detailActivity.activity_date)} ·{' '}
                  {detailActivity.category}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDetailActivity(null)}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-neutral-500 hover:bg-neutral-100"
                aria-label="Tutup detail aktivitas"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              <ActivityStatusBadge status={detailActivity.status} />
              <PriorityLabel priority={detailActivity.priority} />
            </div>

            <div className="space-y-3 text-sm">
              <div>
                <p className="font-medium text-neutral-900">Deskripsi</p>
                <p className="mt-1 text-neutral-700">
                  {detailActivity.description || '-'}
                </p>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <p className="font-medium text-neutral-900">Target Kinerja</p>
                  <p className="mt-1 text-neutral-700">
                    {detailActivity.target_id
                      ? targetMap.get(detailActivity.target_id)?.title ?? '-'
                      : 'Tidak ditautkan'}
                  </p>
                </div>
                <div>
                  <p className="font-medium text-neutral-900">Durasi</p>
                  <p className="mt-1 text-neutral-700">
                    {formatDurasi(detailActivity.duration_minutes)}
                  </p>
                </div>
              </div>
              <div>
                <p className="font-medium text-neutral-900">Output / Hasil</p>
                <p className="mt-1 text-neutral-700">
                  {detailActivity.output_description || '-'}{' '}
                  {detailActivity.output_quantity !== null
                    ? `(${formatDesimal(detailActivity.output_quantity)} ${detailActivity.output_unit})`
                    : ''}
                </p>
              </div>
              {detailActivity.challenges ? (
                <div>
                  <p className="font-medium text-neutral-900">Kendala</p>
                  <p className="mt-1 text-neutral-700">
                    {detailActivity.challenges}
                  </p>
                </div>
              ) : null}
              {detailActivity.follow_up ? (
                <div>
                  <p className="font-medium text-neutral-900">Tindak Lanjut</p>
                  <p className="mt-1 text-neutral-700">
                    {detailActivity.follow_up}
                  </p>
                </div>
              ) : null}

              <div>
                <p className="font-medium text-neutral-900 mb-2">
                  Bukti Dukung Terlampir
                </p>
                {attachments.filter((a) => a.activity_id === detailActivity.id)
                  .length === 0 ? (
                  <p className="text-neutral-600">Belum ada berkas bukti dukung.</p>
                ) : (
                  <ul className="space-y-2">
                    {attachments
                      .filter((a) => a.activity_id === detailActivity.id)
                      .map((att) => (
                        <li
                          key={att.id}
                          className="flex items-center justify-between gap-3 rounded-xl border border-neutral-200 px-3 py-2"
                        >
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-neutral-900 truncate">
                              {att.file_name}
                            </p>
                            <p className="text-xs text-neutral-600 tabular-nums">
                              {formatUkuranBerkas(att.file_size)}
                            </p>
                          </div>
                          <a
                            href={att.data_url}
                            download={att.file_name}
                            className="min-h-[44px] inline-flex items-center gap-1.5 rounded-xl px-3 text-xs font-medium text-blue-700 hover:bg-blue-50 whitespace-nowrap"
                          >
                            <Download className="h-4 w-4" aria-hidden="true" />
                            <span>Unduh</span>
                          </a>
                        </li>
                      ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Modal Tambah / Edit Aktivitas */}
      {isFormOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-neutral-900/50 sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="form-activity-title"
        >
          <div className="w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.06),0_8px_24px_rgba(0,0,0,0.08)]">
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-neutral-200">
              <h2
                id="form-activity-title"
                className="text-lg font-semibold text-neutral-900"
              >
                {editingActivity ? 'Edit Aktivitas' : 'Tambah Aktivitas Baru'}
              </h2>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-neutral-500 hover:bg-neutral-100"
                aria-label="Tutup form aktivitas"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="mt-5 space-y-4" noValidate>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label
                    htmlFor="act-date"
                    className="block text-sm font-medium text-neutral-900"
                  >
                    Tanggal Aktivitas *
                  </label>
                  <input
                    ref={dateRef}
                    id="act-date"
                    type="date"
                    value={activityDate}
                    onChange={(e) => setActivityDate(e.target.value)}
                    className="w-full min-h-[44px] rounded-xl border border-neutral-200 bg-white px-3.5 py-2 text-base text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700"
                  />
                  {errors.activity_date ? (
                    <p className="text-xs text-red-800">{errors.activity_date}</p>
                  ) : null}
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="act-status"
                    className="block text-sm font-medium text-neutral-900"
                  >
                    Status
                  </label>
                  <select
                    id="act-status"
                    value={status}
                    onChange={(e) =>
                      setStatus(e.target.value as ActivityStatus)
                    }
                    className="w-full min-h-[44px] rounded-xl border border-neutral-200 bg-white px-3.5 py-2 text-base text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700"
                  >
                    {ACTIVITY_STATUSES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="act-title"
                  className="block text-sm font-medium text-neutral-900"
                >
                  Judul Aktivitas *
                </label>
                <input
                  ref={titleRef}
                  id="act-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Pemeliharaan database SIMOPPA"
                  className="w-full min-h-[44px] rounded-xl border border-neutral-200 bg-white px-3.5 py-2 text-base text-neutral-900 placeholder:text-neutral-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700"
                />
                {errors.title ? (
                  <p className="text-xs text-red-800">{errors.title}</p>
                ) : null}
              </div>

              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label
                    htmlFor="act-desc"
                    className="block text-sm font-medium text-neutral-900"
                  >
                    Deskripsi Pelaksanaan
                  </label>
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={handleFormalizeAI}
                      className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 rounded"
                    >
                      <Wand2 className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Rapikan Narasi</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleSuggestMappingAI}
                      className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 rounded"
                    >
                      <span>Sarankan Kategori & Target</span>
                    </button>
                  </div>
                </div>
                <textarea
                  id="act-desc"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Jelaskan langkah kerja yang dilakukan secara ringkas"
                  className="w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-base text-neutral-900 placeholder:text-neutral-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700"
                />
                {aiNote ? (
                  <p className="rounded-xl bg-blue-50 px-3 py-2 text-xs text-blue-700">
                    {aiNote}
                  </p>
                ) : null}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label
                    htmlFor="act-category"
                    className="block text-sm font-medium text-neutral-900"
                  >
                    Kategori
                  </label>
                  <select
                    id="act-category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full min-h-[44px] rounded-xl border border-neutral-200 bg-white px-3.5 py-2 text-base text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700"
                  >
                    {ACTIVITY_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="act-target"
                    className="block text-sm font-medium text-neutral-900"
                  >
                    Target Kinerja Terkait (opsional)
                  </label>
                  <select
                    id="act-target"
                    value={targetId}
                    onChange={(e) => setTargetId(e.target.value)}
                    className="w-full min-h-[44px] rounded-xl border border-neutral-200 bg-white px-3.5 py-2 text-base text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700"
                  >
                    <option value="">Tidak ditautkan ke target</option>
                    {eligibleTargets.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.title}
                      </option>
                    ))}
                    {showArchivedTargetOption && currentEditingTarget ? (
                      <option value={currentEditingTarget.id}>
                        {currentEditingTarget.title} (Diarsipkan / luar periode)
                      </option>
                    ) : null}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="sm:col-span-3 space-y-1.5">
                  <label
                    htmlFor="act-output-desc"
                    className="block text-sm font-medium text-neutral-900"
                  >
                    Output atau Hasil (opsional)
                  </label>
                  <input
                    id="act-output-desc"
                    type="text"
                    value={outputDesc}
                    onChange={(e) => setOutputDesc(e.target.value)}
                    placeholder="Contoh: Arsip cadangan database terverifikasi"
                    className="w-full min-h-[44px] rounded-xl border border-neutral-200 bg-white px-3.5 py-2 text-base text-neutral-900 placeholder:text-neutral-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="act-output-qty"
                    className="block text-sm font-medium text-neutral-900"
                  >
                    Kuantitas Output
                  </label>
                  <input
                    ref={qtyRef}
                    id="act-output-qty"
                    type="text"
                    inputMode="decimal"
                    value={outputQtyRaw}
                    onChange={(e) => setOutputQtyRaw(e.target.value)}
                    placeholder="Contoh: 2 atau 1,5"
                    className="w-full min-h-[44px] rounded-xl border border-neutral-200 bg-white px-3.5 py-2 text-base text-neutral-900"
                  />
                  {errors.output_quantity ? (
                    <p className="text-xs text-red-800">
                      {errors.output_quantity}
                    </p>
                  ) : null}
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="act-output-unit"
                    className="block text-sm font-medium text-neutral-900"
                  >
                    Satuan Output
                  </label>
                  <input
                    id="act-output-unit"
                    type="text"
                    list="output-unit-list"
                    value={outputUnit}
                    onChange={(e) => setOutputUnit(e.target.value)}
                    placeholder="Contoh: Dokumen"
                    className="w-full min-h-[44px] rounded-xl border border-neutral-200 bg-white px-3.5 py-2 text-base text-neutral-900"
                  />
                  <datalist id="output-unit-list">
                    {OUTPUT_UNITS_SUGGESTIONS.map((u) => (
                      <option key={u} value={u} />
                    ))}
                  </datalist>
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="act-duration"
                    className="block text-sm font-medium text-neutral-900"
                  >
                    Durasi (menit)
                  </label>
                  <input
                    ref={durRef}
                    id="act-duration"
                    type="text"
                    inputMode="numeric"
                    value={durationRaw}
                    onChange={(e) => setDurationRaw(e.target.value)}
                    placeholder="Contoh: 90"
                    className="w-full min-h-[44px] rounded-xl border border-neutral-200 bg-white px-3.5 py-2 text-base text-neutral-900"
                  />
                  {errors.duration_minutes ? (
                    <p className="text-xs text-red-800">
                      {errors.duration_minutes}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label
                    htmlFor="act-priority"
                    className="block text-sm font-medium text-neutral-900"
                  >
                    Prioritas
                  </label>
                  <select
                    id="act-priority"
                    value={priority}
                    onChange={(e) =>
                      setPriority(e.target.value as ActivityPriority)
                    }
                    className="w-full min-h-[44px] rounded-xl border border-neutral-200 bg-white px-3.5 py-2 text-base text-neutral-900"
                  >
                    {ACTIVITY_PRIORITIES.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="act-tags"
                    className="block text-sm font-medium text-neutral-900"
                  >
                    Tag (pisahkan koma)
                  </label>
                  <input
                    id="act-tags"
                    type="text"
                    value={tagsRaw}
                    onChange={(e) => setTagsRaw(e.target.value)}
                    placeholder="Contoh: simoppa, database"
                    className="w-full min-h-[44px] rounded-xl border border-neutral-200 bg-white px-3.5 py-2 text-base text-neutral-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label
                    htmlFor="act-challenges"
                    className="block text-sm font-medium text-neutral-900"
                  >
                    Kendala (opsional)
                  </label>
                  <textarea
                    id="act-challenges"
                    rows={2}
                    value={challenges}
                    onChange={(e) => setChallenges(e.target.value)}
                    placeholder="Catat hambatan bila ada"
                    className="w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2 text-base text-neutral-900"
                  />
                </div>
                <div className="space-y-1.5">
                  <label
                    htmlFor="act-followup"
                    className="block text-sm font-medium text-neutral-900"
                  >
                    Tindak Lanjut (opsional)
                  </label>
                  <textarea
                    id="act-followup"
                    rows={2}
                    value={followUp}
                    onChange={(e) => setFollowUp(e.target.value)}
                    placeholder="Rencana langkah lanjutan"
                    className="w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2 text-base text-neutral-900"
                  />
                </div>
              </div>

              {/* Unggah Bukti Dukung */}
              <div className="space-y-2 pt-2 border-t border-neutral-200">
                <label
                  htmlFor="act-files"
                  className="block text-sm font-medium text-neutral-900"
                >
                  Bukti Dukung (PDF, JPG, PNG, DOC/DOCX, XLS/XLSX, maks. 5 MB)
                </label>
                <label
                  htmlFor="act-files"
                  className="min-h-[44px] inline-flex cursor-pointer items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-900 hover:bg-neutral-50 focus-within:ring-2 focus-within:ring-blue-700"
                >
                  <Upload className="h-4 w-4" aria-hidden="true" />
                  <span>Pilih Berkas</span>
                  <input
                    id="act-files"
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
                    onChange={handleFileChange}
                    className="sr-only"
                  />
                </label>

                {attachmentError ? (
                  <p role="alert" className="text-xs text-red-800">
                    {attachmentError}
                  </p>
                ) : null}

                {existingEditAttachments.length > 0 || pendingFiles.length > 0 ? (
                  <ul className="space-y-2 pt-1">
                    {existingEditAttachments.map((att) => (
                      <li
                        key={att.id}
                        className="flex items-center justify-between gap-2 rounded-xl border border-neutral-200 px-3 py-2 text-sm"
                      >
                        <span className="flex items-center gap-2 min-w-0">
                          <FileText
                            className="h-4 w-4 shrink-0 text-neutral-500"
                            aria-hidden="true"
                          />
                          <span className="truncate">{att.file_name}</span>
                          <span className="text-xs text-neutral-500 shrink-0 tabular-nums">
                            {formatUkuranBerkas(att.file_size)}
                          </span>
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setRemovedAttachmentIds((p) => [...p, att.id])
                          }
                          className="min-h-[36px] px-2 text-xs font-medium text-red-700 hover:underline"
                        >
                          Hapus
                        </button>
                      </li>
                    ))}
                    {pendingFiles.map((file, idx) => (
                      <li
                        key={`${file.file_name}-${idx}`}
                        className="flex items-center justify-between gap-2 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-sm"
                      >
                        <span className="flex items-center gap-2 min-w-0">
                          <FileText
                            className="h-4 w-4 shrink-0 text-blue-700"
                            aria-hidden="true"
                          />
                          <span className="truncate">{file.file_name}</span>
                          <span className="text-xs text-neutral-600 shrink-0 tabular-nums">
                            {formatUkuranBerkas(file.file_size)}
                          </span>
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setPendingFiles((p) => p.filter((_, i) => i !== idx))
                          }
                          className="min-h-[36px] px-2 text-xs font-medium text-red-700 hover:underline"
                        >
                          Batalkan
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>

              <div className="pt-3 flex flex-wrap justify-end gap-3 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="min-h-[44px] rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-900 hover:bg-neutral-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="min-h-[44px] rounded-xl bg-blue-700 px-5 py-2 text-sm font-medium text-white hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2"
                >
                  {editingActivity ? 'Simpan Perubahan' : 'Simpan Aktivitas'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Hapus Aktivitas"
        message={
          deleteTarget
            ? `Aktivitas "${deleteTarget.title}" beserta lampirannya akan dihapus permanen dari catatan Anda.`
            : ''
        }
        confirmLabel="Hapus Aktivitas"
        destructive
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) {
            onDeleteActivity(deleteTarget.id);
            setDeleteTarget(null);
          }
        }}
      />
    </div>
  );
}
