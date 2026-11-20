/* Komponen akar aplikasi Jejak Kinerja AI: mengelola sesi ASN, isolasi data per akun, navigasi, dan seluruh aksi fitur */

import { useCallback, useState } from 'react';
import { AppShell } from './components/AppShell';
import { DashboardView } from './components/DashboardView';
import { LoginView } from './components/LoginView';
import { MonthlyReportView } from './components/MonthlyReportView';
import { ProfileView } from './components/ProfileView';
import { QuickAddModal } from './components/QuickAddModal';
import { TargetSubmitPayload, TargetsView } from './components/TargetsView';
import { ToastList, ToastMessage } from './components/Toast';
import { WeeklyRecapView } from './components/WeeklyRecapView';
import { ActivitySubmitPayload, WorklogView } from './components/WorklogView';
import {
  appendAuditLog,
  authenticateAsn,
  buildSeedState,
  getUserScopedData,
  loadAppState,
  logoutAsn,
  saveAppState,
  saveWeeklyRecapNote,
  upsertMonthlyReport,
} from './lib/storage';
import {
  Activity,
  ActivityAttachment,
  AppState,
  MonthlyReport,
  NavSection,
  PerformanceTarget,
  QuickAddItemDraft,
} from './types';

function makeId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export default function App() {
  const [appState, setAppState] = useState<AppState>(() => loadAppState());
  const [activeSection, setActiveSection] = useState<NavSection>('dashboard');
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [worklogTargetFilter, setWorklogTargetFilter] = useState<string>('');
  const [openNewActivityTrigger, setOpenNewActivityTrigger] = useState(0);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const pushToast = useCallback(
    (type: ToastMessage['type'], text: string) => {
      const id = makeId('toast');
      setToasts((prev) => [...prev, { id, type, text }]);
      window.setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    },
    []
  );

  function handleLogin(identifier: string, password: string): string | null {
    const result = authenticateAsn(appState, identifier, password);
    if (result.error) return result.error;
    setAppState(result.nextState);
    setActiveSection('dashboard');
    setWorklogTargetFilter('');
    if (result.profile) {
      pushToast('success', `Selamat datang, ${result.profile.full_name}.`);
    }
    return null;
  }

  function handleLogout() {
    const next = logoutAsn(appState);
    setAppState(next);
    setActiveSection('dashboard');
    pushToast('info', 'Anda telah keluar dari akun ASN.');
  }

  const currentUserId = appState.current_user_id;
  if (!currentUserId) {
    return (
      <>
        <LoginView onLogin={handleLogin} />
        <ToastList
          toasts={toasts}
          onDismiss={(id) =>
            setToasts((prev) => prev.filter((t) => t.id !== id))
          }
        />
      </>
    );
  }

  const scoped = getUserScopedData(appState, currentUserId);
  if (!scoped.profile) {
    const reset = logoutAsn(appState);
    setAppState(reset);
    return null;
  }

  const profile = scoped.profile;
  const unreadNotifications = scoped.notifications.filter(
    (n) => !n.read_at
  ).length;

  function commitState(next: AppState) {
    saveAppState(next);
    setAppState(next);
  }

  function handleSaveQuickAddDrafts(drafts: QuickAddItemDraft[]) {
    const now = new Date().toISOString();
    const newActivities: Activity[] = drafts.map((d) => ({
      id: makeId('act'),
      user_id: profile.user_id,
      target_id: d.target_id,
      activity_date: d.activity_date,
      title: d.title.trim(),
      description: d.description.trim(),
      category: d.category,
      output_description: d.output_description.trim(),
      output_quantity: d.output_quantity,
      output_unit: d.output_unit,
      duration_minutes: null,
      status: d.status,
      priority: 'Sedang',
      tags: ['catat-cepat'],
      challenges: '',
      follow_up: '',
      created_at: now,
      updated_at: now,
    }));

    let next: AppState = {
      ...appState,
      activities: [...newActivities, ...appState.activities],
    };
    next = appendAuditLog(
      next,
      profile.user_id,
      'quick_add_activities',
      'activity',
      newActivities[0]?.id ?? 'batch',
      { jumlah: newActivities.length }
    );
    commitState(next);
    pushToast(
      'success',
      `${newActivities.length} aktivitas berhasil disimpan.`
    );
  }

  function handleSaveActivity(payload: ActivitySubmitPayload) {
    const now = new Date().toISOString();
    const isEdit = Boolean(payload.id);
    const activityId = payload.id ?? makeId('act');

    // Pastikan ASN hanya dapat mengubah aktivitas miliknya sendiri
    if (isEdit) {
      const existing = appState.activities.find((a) => a.id === activityId);
      if (!existing || existing.user_id !== profile.user_id) {
        pushToast('error', 'Anda tidak memiliki akses untuk mengubah aktivitas ini.');
        return;
      }
    }

    const updatedRecord: Activity = {
      id: activityId,
      user_id: profile.user_id,
      target_id: payload.target_id,
      activity_date: payload.activity_date,
      title: payload.title,
      description: payload.description,
      category: payload.category,
      output_description: payload.output_description,
      output_quantity: payload.output_quantity,
      output_unit: payload.output_unit,
      duration_minutes: payload.duration_minutes,
      status: payload.status,
      priority: payload.priority,
      tags: payload.tags,
      challenges: payload.challenges,
      follow_up: payload.follow_up,
      created_at: isEdit
        ? appState.activities.find((a) => a.id === activityId)?.created_at ?? now
        : now,
      updated_at: now,
    };

    const nextActivities = isEdit
      ? appState.activities.map((a) => (a.id === activityId ? updatedRecord : a))
      : [updatedRecord, ...appState.activities];

    const newAttachments: ActivityAttachment[] = payload.pendingAttachments.map(
      (file) => ({
        id: makeId('att'),
        activity_id: activityId,
        user_id: profile.user_id,
        file_name: file.file_name,
        file_path: `private/${profile.user_id}/${activityId}/${file.file_name}`,
        mime_type: file.mime_type,
        file_size: file.file_size,
        data_url: file.data_url,
        uploaded_by: profile.user_id,
        created_at: now,
      })
    );

    const remainingAttachments = appState.activity_attachments.filter(
      (att) =>
        !(
          att.user_id === profile.user_id &&
          payload.removedAttachmentIds.includes(att.id)
        )
    );

    let next: AppState = {
      ...appState,
      activities: nextActivities,
      activity_attachments: [...newAttachments, ...remainingAttachments],
    };
    next = appendAuditLog(
      next,
      profile.user_id,
      isEdit ? 'update_activity' : 'create_activity',
      'activity',
      activityId,
      { judul: updatedRecord.title }
    );
    commitState(next);
    pushToast(
      'success',
      isEdit
        ? 'Perubahan aktivitas berhasil disimpan.'
        : 'Aktivitas baru berhasil disimpan.'
    );
  }

  function handleDeleteActivity(activityId: string) {
    const target = appState.activities.find((a) => a.id === activityId);
    if (!target || target.user_id !== profile.user_id) {
      pushToast('error', 'Aktivitas tidak ditemukan pada akun Anda.');
      return;
    }

    let next: AppState = {
      ...appState,
      activities: appState.activities.filter((a) => a.id !== activityId),
      activity_attachments: appState.activity_attachments.filter(
        (att) => att.activity_id !== activityId
      ),
    };
    next = appendAuditLog(
      next,
      profile.user_id,
      'delete_activity',
      'activity',
      activityId,
      { judul: target.title }
    );
    commitState(next);
    pushToast('success', 'Aktivitas berhasil dihapus.');
  }

  function handleSaveTarget(payload: TargetSubmitPayload) {
    const now = new Date().toISOString();
    const isEdit = Boolean(payload.id);
    const targetId = payload.id ?? makeId('tgt');

    if (isEdit) {
      const existing = appState.performance_targets.find(
        (t) => t.id === targetId
      );
      if (!existing || existing.user_id !== profile.user_id) {
        pushToast('error', 'Target kinerja tidak ditemukan pada akun Anda.');
        return;
      }
    }

    const record: PerformanceTarget = {
      id: targetId,
      user_id: profile.user_id,
      title: payload.title,
      description: payload.description,
      indicator: payload.indicator,
      target_value: payload.target_value,
      unit: payload.unit,
      period_start: payload.period_start,
      period_end: payload.period_end,
      status: payload.status,
      created_at: isEdit
        ? appState.performance_targets.find((t) => t.id === targetId)
            ?.created_at ?? now
        : now,
    };

    const nextTargets = isEdit
      ? appState.performance_targets.map((t) => (t.id === targetId ? record : t))
      : [record, ...appState.performance_targets];

    let next: AppState = {
      ...appState,
      performance_targets: nextTargets,
    };
    next = appendAuditLog(
      next,
      profile.user_id,
      isEdit ? 'update_target' : 'create_target',
      'performance_target',
      targetId,
      { nama: record.title, status: record.status }
    );
    commitState(next);
    pushToast(
      'success',
      isEdit
        ? 'Target kinerja berhasil diperbarui.'
        : 'Target kinerja baru berhasil dibuat.'
    );
  }

  function handleToggleArchiveTarget(targetId: string) {
    const target = appState.performance_targets.find(
      (t) => t.id === targetId && t.user_id === profile.user_id
    );
    if (!target) return;
    const nextStatus = target.status === 'Aktif' ? 'Diarsipkan' : 'Aktif';
    let next: AppState = {
      ...appState,
      performance_targets: appState.performance_targets.map((t) =>
        t.id === targetId ? { ...t, status: nextStatus } : t
      ),
    };
    next = appendAuditLog(
      next,
      profile.user_id,
      'archive_toggle_target',
      'performance_target',
      targetId,
      { status: nextStatus }
    );
    commitState(next);
    pushToast(
      'info',
      nextStatus === 'Diarsipkan'
        ? `Target "${target.title}" diarsipkan.`
        : `Target "${target.title}" diaktifkan kembali.`
    );
  }

  function handleSaveWeeklyRecap(
    weekStart: string,
    weekEnd: string,
    summary: string
  ) {
    const next = saveWeeklyRecapNote(
      appState,
      profile.user_id,
      weekStart,
      weekEnd,
      summary
    );
    setAppState(next);
    pushToast('success', 'Ringkasan mingguan berhasil disimpan.');
  }

  function handleSaveMonthlyReport(report: MonthlyReport) {
    const next = upsertMonthlyReport(appState, report);
    setAppState(next);
  }

  function handleLogReportExport(
    report: MonthlyReport,
    format: 'PDF' | 'DOCX' | 'XLSX',
    fileName: string
  ) {
    const next = appendAuditLog(
      appState,
      profile.user_id,
      'export_report',
      'monthly_report',
      report.id,
      { format, file_name: fileName }
    );
    commitState(next);
  }

  function handleSaveProfile(patch: {
    full_name: string;
    nip: string;
    job_title: string;
    unit_name: string;
    supervisor_name: string;
  }) {
    let next: AppState = {
      ...appState,
      profiles: appState.profiles.map((p) =>
        p.user_id === profile.user_id ? { ...p, ...patch } : p
      ),
    };
    next = appendAuditLog(
      next,
      profile.user_id,
      'update_profile',
      'profile',
      profile.id,
      { full_name: patch.full_name }
    );
    commitState(next);
    pushToast('success', 'Profil ASN berhasil diperbarui.');
  }

  function handleMarkNotificationRead(notifId: string) {
    const now = new Date().toISOString();
    const next: AppState = {
      ...appState,
      notifications: appState.notifications.map((n) =>
        n.id === notifId && n.user_id === profile.user_id
          ? { ...n, read_at: now }
          : n
      ),
    };
    commitState(next);
  }

  function handleResetDemoData() {
    const fresh = buildSeedState();
    const restored: AppState = {
      ...fresh,
      current_user_id: profile.user_id,
    };
    commitState(restored);
    pushToast('info', 'Data demo dikembalikan ke kondisi awal.');
  }

  return (
    <AppShell
      profile={profile}
      activeSection={activeSection}
      unreadNotifications={unreadNotifications}
      onNavigate={(section) => {
        if (section !== 'worklog') {
          setWorklogTargetFilter('');
        }
        setActiveSection(section);
      }}
      onOpenQuickAdd={() => setQuickAddOpen(true)}
      onLogout={handleLogout}
    >
      {activeSection === 'dashboard' ? (
        <DashboardView
          profile={profile}
          activities={scoped.activities}
          targets={scoped.targets}
          reports={scoped.reports}
          onNavigate={setActiveSection}
          onOpenQuickAdd={() => setQuickAddOpen(true)}
          onOpenNewActivity={() => {
            setActiveSection('worklog');
            setOpenNewActivityTrigger((c) => c + 1);
          }}
        />
      ) : null}

      {activeSection === 'worklog' ? (
        <WorklogView
          activities={scoped.activities}
          targets={scoped.targets}
          attachments={scoped.attachments}
          initialFilterTargetId={worklogTargetFilter}
          openCreateTrigger={openNewActivityTrigger}
          onSaveActivity={handleSaveActivity}
          onDeleteActivity={handleDeleteActivity}
          onOpenQuickAdd={() => setQuickAddOpen(true)}
        />
      ) : null}

      {activeSection === 'targets' ? (
        <TargetsView
          targets={scoped.targets}
          activities={scoped.activities}
          onSaveTarget={handleSaveTarget}
          onToggleArchive={handleToggleArchiveTarget}
          onViewLinkedActivities={(targetId) => {
            setWorklogTargetFilter(targetId);
            setActiveSection('worklog');
          }}
        />
      ) : null}

      {activeSection === 'weekly' ? (
        <WeeklyRecapView
          activities={scoped.activities}
          targets={scoped.targets}
          savedRecaps={scoped.weeklyRecaps}
          onSaveRecap={handleSaveWeeklyRecap}
        />
      ) : null}

      {activeSection === 'monthly' ? (
        <MonthlyReportView
          profile={profile}
          activities={scoped.activities}
          targets={scoped.targets}
          reports={scoped.reports}
          onSaveReport={handleSaveMonthlyReport}
          onLogExport={handleLogReportExport}
          onNotify={pushToast}
        />
      ) : null}

      {activeSection === 'profile' ? (
        <ProfileView
          profile={profile}
          notifications={scoped.notifications}
          auditLogs={scoped.auditLogs}
          onSaveProfile={handleSaveProfile}
          onMarkNotificationRead={handleMarkNotificationRead}
          onResetDemoData={handleResetDemoData}
          onLogout={handleLogout}
        />
      ) : null}

      <QuickAddModal
        open={quickAddOpen}
        targets={scoped.targets}
        onClose={() => setQuickAddOpen(false)}
        onSaveDrafts={handleSaveQuickAddDrafts}
      />

      <ToastList
        toasts={toasts}
        onDismiss={(id) =>
          setToasts((prev) => prev.filter((t) => t.id !== id))
        }
      />
    </AppShell>
  );
}
