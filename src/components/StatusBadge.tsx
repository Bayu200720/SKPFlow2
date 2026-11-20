/* Komponen penanda status dengan kombinasi warna semantik, ikon, dan label teks eksplisit */

import {
  AlertCircle,
  Archive,
  CheckCircle2,
  Clock,
  FileEdit,
  FileCheck2,
} from 'lucide-react';
import {
  ActivityPriority,
  ActivityStatus,
  ReportStatus,
  TargetStatus,
} from '../types';

export function ActivityStatusBadge({ status }: { status: ActivityStatus }) {
  if (status === 'Selesai') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-800 whitespace-nowrap shrink-0">
        <CheckCircle2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        <span>Selesai</span>
      </span>
    );
  }
  if (status === 'Sedang dikerjakan') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-md bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-800 whitespace-nowrap shrink-0">
        <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        <span>Sedang dikerjakan</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-800 whitespace-nowrap shrink-0">
      <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      <span>Belum dimulai</span>
    </span>
  );
}

export function PriorityLabel({ priority }: { priority: ActivityPriority }) {
  if (priority === 'Tinggi') {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-red-800 bg-red-50 px-2 py-0.5 rounded-md whitespace-nowrap shrink-0">
        <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        <span>Prioritas Tinggi</span>
      </span>
    );
  }
  return (
    <span className="text-xs text-neutral-600 whitespace-nowrap shrink-0">
      Prioritas {priority}
    </span>
  );
}

export function TargetStatusBadge({ status }: { status: TargetStatus }) {
  if (status === 'Aktif') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-800 whitespace-nowrap shrink-0">
        <CheckCircle2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        <span>Aktif</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-800 whitespace-nowrap shrink-0">
      <Archive className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      <span>Diarsipkan</span>
    </span>
  );
}

export function ReportStatusBadge({
  status,
}: {
  status: ReportStatus | 'Belum dibuat';
}) {
  if (status === 'Final') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-800 whitespace-nowrap shrink-0">
        <FileCheck2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        <span>Final (Personal)</span>
      </span>
    );
  }
  if (status === 'Draft') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-md bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800 whitespace-nowrap shrink-0">
        <FileEdit className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        <span>Draft</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-800 whitespace-nowrap shrink-0">
      <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      <span>Belum dibuat</span>
    </span>
  );
}
