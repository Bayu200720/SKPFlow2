/* Halaman Profil ASN: data kepegawaian, notifikasi personal, riwayat audit log, dan pengaturan akun demo */

import { FormEvent, useRef, useState } from 'react';
import { Bell, Check, LogOut, RotateCcw, Save } from 'lucide-react';
import { formatWaktuIndonesia } from '../lib/format';
import {
  ValidationErrors,
  focusFirstError,
  validateProfileForm,
} from '../lib/validation';
import { AuditLog, PersonalNotification, Profile } from '../types';
import { ConfirmDialog } from './ConfirmDialog';

interface ProfileViewProps {
  profile: Profile;
  notifications: PersonalNotification[];
  auditLogs: AuditLog[];
  onSaveProfile: (patch: {
    full_name: string;
    nip: string;
    job_title: string;
    unit_name: string;
    supervisor_name: string;
  }) => void;
  onMarkNotificationRead: (notifId: string) => void;
  onResetDemoData: () => void;
  onLogout: () => void;
}

export function ProfileView({
  profile,
  notifications,
  auditLogs,
  onSaveProfile,
  onMarkNotificationRead,
  onResetDemoData,
  onLogout,
}: ProfileViewProps) {
  const [fullName, setFullName] = useState(profile.full_name);
  const [nip, setNip] = useState(profile.nip);
  const [jobTitle, setJobTitle] = useState(profile.job_title);
  const [unitName, setUnitName] = useState(profile.unit_name);
  const [supervisorName, setSupervisorName] = useState(profile.supervisor_name);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);

  const nameRef = useRef<HTMLInputElement | null>(null);
  const nipRef = useRef<HTMLInputElement | null>(null);
  const jobRef = useRef<HTMLInputElement | null>(null);
  const unitRef = useRef<HTMLInputElement | null>(null);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const formErrors = validateProfileForm({
      full_name: fullName,
      nip,
      job_title: jobTitle,
      unit_name: unitName,
    });

    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      focusFirstError(formErrors, {
        full_name: nameRef.current,
        nip: nipRef.current,
        job_title: jobRef.current,
        unit_name: unitRef.current,
      });
      return;
    }

    setErrors({});
    onSaveProfile({
      full_name: fullName.trim(),
      nip: nip.trim().replace(/\s+/g, ''),
      job_title: jobTitle.trim(),
      unit_name: unitName.trim(),
      supervisor_name: supervisorName.trim(),
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-neutral-900">
            Profil ASN
          </h2>
          <p className="mt-1 text-sm text-neutral-600">
            Identitas pegawai digunakan pada kepala laporan kinerja bulanan Anda.
          </p>
        </div>

        <button
          type="button"
          onClick={onLogout}
          className="min-h-[44px] inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-900 hover:bg-neutral-50 self-start sm:self-auto"
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
          <span>Keluar Akun</span>
        </button>
      </div>

      {/* Form Profil ASN */}
      <section className="rounded-2xl bg-white border border-neutral-200 p-6">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">
          Identitas Pegawai
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label
                htmlFor="prof-name"
                className="block text-sm font-medium text-neutral-900"
              >
                Nama Lengkap &amp; Gelar *
              </label>
              <input
                ref={nameRef}
                id="prof-name"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full min-h-[44px] rounded-xl border border-neutral-200 bg-white px-3.5 py-2 text-base text-neutral-900"
              />
              {errors.full_name ? (
                <p className="text-xs text-red-800">{errors.full_name}</p>
              ) : null}
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="prof-nip"
                className="block text-sm font-medium text-neutral-900"
              >
                NIP *
              </label>
              <input
                ref={nipRef}
                id="prof-nip"
                type="text"
                inputMode="numeric"
                value={nip}
                onChange={(e) => setNip(e.target.value)}
                className="w-full min-h-[44px] rounded-xl border border-neutral-200 bg-white px-3.5 py-2 text-base text-neutral-900 tabular-nums"
              />
              {errors.nip ? (
                <p className="text-xs text-red-800">{errors.nip}</p>
              ) : null}
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="prof-job"
                className="block text-sm font-medium text-neutral-900"
              >
                Jabatan *
              </label>
              <input
                ref={jobRef}
                id="prof-job"
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                className="w-full min-h-[44px] rounded-xl border border-neutral-200 bg-white px-3.5 py-2 text-base text-neutral-900"
              />
              {errors.job_title ? (
                <p className="text-xs text-red-800">{errors.job_title}</p>
              ) : null}
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="prof-unit"
                className="block text-sm font-medium text-neutral-900"
              >
                Unit Kerja *
              </label>
              <input
                ref={unitRef}
                id="prof-unit"
                type="text"
                value={unitName}
                onChange={(e) => setUnitName(e.target.value)}
                className="w-full min-h-[44px] rounded-xl border border-neutral-200 bg-white px-3.5 py-2 text-base text-neutral-900"
              />
              {errors.unit_name ? (
                <p className="text-xs text-red-800">{errors.unit_name}</p>
              ) : null}
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <label
                htmlFor="prof-supervisor"
                className="block text-sm font-medium text-neutral-900"
              >
                Atasan Langsung (Referensi)
              </label>
              <input
                id="prof-supervisor"
                type="text"
                value={supervisorName}
                onChange={(e) => setSupervisorName(e.target.value)}
                className="w-full min-h-[44px] rounded-xl border border-neutral-200 bg-white px-3.5 py-2 text-base text-neutral-900"
              />
            </div>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setConfirmResetOpen(true)}
              className="min-h-[44px] inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              <span>Reset Data Demo</span>
            </button>

            <button
              type="submit"
              className="min-h-[44px] inline-flex items-center gap-2 rounded-xl bg-blue-700 px-5 py-2 text-sm font-medium text-white hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2"
            >
              <Save className="h-4 w-4" aria-hidden="true" />
              <span>Simpan Profil</span>
            </button>
          </div>
        </form>
      </section>

      {/* Notifikasi Personal */}
      <section className="rounded-2xl bg-white border border-neutral-200 p-6 space-y-3">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-neutral-700" aria-hidden="true" />
          <h3 className="text-lg font-semibold text-neutral-900">
            Notifikasi Personal
          </h3>
        </div>
        {notifications.length === 0 ? (
          <p className="text-sm text-neutral-600">Tidak ada notifikasi.</p>
        ) : (
          <ul className="divide-y divide-neutral-200">
            {notifications.map((notif) => (
              <li
                key={notif.id}
                className="py-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="space-y-0.5">
                  <p className="text-sm font-medium text-neutral-900">
                    {notif.title}
                  </p>
                  <p className="text-sm text-neutral-600">{notif.message}</p>
                  <p className="text-xs text-neutral-500">
                    {formatWaktuIndonesia(notif.created_at)}
                  </p>
                </div>
                {notif.read_at ? (
                  <span className="text-xs text-neutral-500 whitespace-nowrap">
                    Sudah dibaca
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => onMarkNotificationRead(notif.id)}
                    className="min-h-[40px] inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-50 whitespace-nowrap self-start sm:self-auto"
                  >
                    <Check className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Tandai dibaca</span>
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Audit Log Akun */}
      <section className="rounded-2xl bg-white border border-neutral-200 p-6 space-y-3">
        <h3 className="text-lg font-semibold text-neutral-900">
          Riwayat Audit Aktivitas Akun
        </h3>
        {auditLogs.length === 0 ? (
          <p className="text-sm text-neutral-600">
            Belum ada catatan audit pada akun ini.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-neutral-200 text-neutral-600">
                  <th className="py-2 pr-3 font-medium">Waktu</th>
                  <th className="py-2 pr-3 font-medium">Aksi</th>
                  <th className="py-2 pr-3 font-medium">Objek</th>
                  <th className="py-2 font-medium">Keterangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {auditLogs.slice(0, 20).map((log) => (
                  <tr key={log.id}>
                    <td className="py-2 pr-3 whitespace-nowrap text-xs text-neutral-600 tabular-nums">
                      {formatWaktuIndonesia(log.created_at)}
                    </td>
                    <td className="py-2 pr-3 font-medium text-neutral-900">
                      {log.action}
                    </td>
                    <td className="py-2 pr-3 text-neutral-700">
                      {log.entity_type}
                    </td>
                    <td className="py-2 text-xs text-neutral-600">
                      {Object.entries(log.metadata)
                        .map(([k, v]) => `${k}: ${String(v)}`)
                        .join(' · ') || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <ConfirmDialog
        open={confirmResetOpen}
        title="Reset Data Demo"
        message="Seluruh catatan tambahan Anda di browser akan dikembalikan ke data contoh awal. Lanjutkan?"
        confirmLabel="Reset Data"
        destructive
        onCancel={() => setConfirmResetOpen(false)}
        onConfirm={() => {
          setConfirmResetOpen(false);
          onResetDemoData();
        }}
      />
    </div>
  );
}
