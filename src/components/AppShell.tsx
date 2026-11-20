/* Kerangka navigasi responsif: sidebar dan topbar pada desktop, topbar ringkas dan bar aksi menempel di bawah layar pada mobile */

import {
  CalendarRange,
  ClipboardList,
  FileText,
  LayoutDashboard,
  LogOut,
  Plus,
  Target,
  UserCircle2,
} from 'lucide-react';
import { ReactNode } from 'react';
import { NavSection, Profile } from '../types';

interface AppShellProps {
  profile: Profile;
  activeSection: NavSection;
  unreadNotifications: number;
  onNavigate: (section: NavSection) => void;
  onOpenQuickAdd: () => void;
  onLogout: () => void;
  children: ReactNode;
}

const DESKTOP_NAV_ITEMS: {
  id: NavSection;
  label: string;
  icon: typeof LayoutDashboard;
}[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'worklog', label: 'Aktivitas Harian', icon: ClipboardList },
  { id: 'targets', label: 'Target Kinerja', icon: Target },
  { id: 'weekly', label: 'Rekap Mingguan', icon: CalendarRange },
  { id: 'monthly', label: 'Laporan Bulanan', icon: FileText },
  { id: 'profile', label: 'Profil', icon: UserCircle2 },
];

const SECTION_TITLES: Record<NavSection, string> = {
  dashboard: 'Dashboard',
  worklog: 'Aktivitas Harian',
  targets: 'Target Kinerja',
  weekly: 'Rekap Mingguan',
  monthly: 'Laporan Bulanan',
  profile: 'Profil ASN',
};

export function AppShell({
  profile,
  activeSection,
  unreadNotifications,
  onNavigate,
  onOpenQuickAdd,
  onLogout,
  children,
}: AppShellProps) {
  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 flex">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex lg:w-60 lg:flex-col lg:fixed lg:inset-y-0 bg-white border-r border-neutral-200 z-20">
        <div className="flex h-16 items-center px-6 border-b border-neutral-200">
          <span className="text-lg font-semibold tracking-tight text-neutral-900 whitespace-nowrap">
            Jejak Kinerja AI
          </span>
        </div>

        <nav
          className="flex-1 px-3 py-4 space-y-1 overflow-y-auto"
          aria-label="Navigasi utama ASN"
        >
          {DESKTOP_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                className={`w-full min-h-[44px] flex items-center justify-between gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2 ${
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                }`}
              >
                <span className="flex items-center gap-3 whitespace-nowrap">
                  <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>{item.label}</span>
                </span>
                {item.id === 'profile' && unreadNotifications > 0 ? (
                  <span className="text-xs font-medium text-blue-700 tabular-nums">
                    {unreadNotifications}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-neutral-200 space-y-3">
          <div className="text-sm">
            <p className="font-medium text-neutral-900 truncate">
              {profile.full_name}
            </p>
            <p className="text-xs text-neutral-600 truncate">
              {profile.job_title}
            </p>
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="w-full min-h-[44px] flex items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 whitespace-nowrap"
          >
            <LogOut className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>Keluar</span>
          </button>
        </div>
      </aside>

      {/* Area Konten Utama */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-60">
        {/* Topbar Desktop & Mobile (Tinggi mobile 48px agar total elemen menempel <= 15%) */}
        <header className="sticky top-0 z-20 h-12 lg:h-16 bg-white border-b border-neutral-200 px-4 lg:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <span className="lg:hidden text-base font-semibold tracking-tight text-neutral-900 whitespace-nowrap shrink-0">
              Jejak Kinerja AI
            </span>
            <h1 className="hidden lg:block text-lg font-semibold text-neutral-900 truncate">
              {SECTION_TITLES[activeSection]}
            </h1>
          </div>

          <div className="flex items-center gap-2 lg:gap-4 shrink-0">
            {/* Akses Rekap Mingguan & Profil pada mobile dari topbar ringkas */}
            <button
              type="button"
              onClick={() => onNavigate('weekly')}
              className={`lg:hidden min-h-[44px] px-2.5 flex items-center gap-1 rounded-xl text-xs font-medium whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 ${
                activeSection === 'weekly'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <CalendarRange className="h-4 w-4" aria-hidden="true" />
              <span>Rekap</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('profile')}
              className={`lg:hidden min-h-[44px] min-w-[44px] px-2 flex items-center justify-center rounded-xl text-xs font-medium whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 ${
                activeSection === 'profile'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
              aria-label="Buka Profil ASN"
            >
              <UserCircle2 className="h-5 w-5" aria-hidden="true" />
            </button>

            <span className="hidden lg:inline text-sm text-neutral-600 whitespace-nowrap">
              {profile.unit_name}
            </span>
            <button
              type="button"
              onClick={onOpenQuickAdd}
              className="hidden lg:inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2 whitespace-nowrap shrink-0"
            >
              <Plus className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>Catat Cepat</span>
            </button>
          </div>
        </header>

        <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-6 pb-24 lg:px-8 lg:py-8 lg:pb-12">
          {children}
        </main>
      </div>

      {/* Bar Aksi Menempel di Bawah Layar (Mobile) — tinggi 56px + topbar 48px = 104px (14% dari 740px) */}
      <nav
        className="lg:hidden fixed bottom-0 inset-x-0 z-30 h-14 bg-white border-t border-neutral-200 px-2 flex items-center justify-around gap-1"
        aria-label="Navigasi bawah mobile"
      >
        <button
          type="button"
          onClick={() => onNavigate('dashboard')}
          className={`min-h-[44px] min-w-[44px] flex flex-col items-center justify-center rounded-xl px-2 text-xs font-medium whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 ${
            activeSection === 'dashboard'
              ? 'text-blue-700 bg-blue-50'
              : 'text-neutral-600'
          }`}
        >
          <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
          <span>Beranda</span>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('worklog')}
          className={`min-h-[44px] min-w-[44px] flex flex-col items-center justify-center rounded-xl px-2 text-xs font-medium whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 ${
            activeSection === 'worklog'
              ? 'text-blue-700 bg-blue-50'
              : 'text-neutral-600'
          }`}
        >
          <ClipboardList className="h-4 w-4" aria-hidden="true" />
          <span>Aktivitas</span>
        </button>

        <button
          type="button"
          onClick={onOpenQuickAdd}
          className="min-h-[44px] flex items-center justify-center gap-1.5 rounded-xl bg-blue-700 px-3.5 py-2 text-xs font-medium text-white hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2 whitespace-nowrap shrink-0"
        >
          <Plus className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>Catat Cepat</span>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('targets')}
          className={`min-h-[44px] min-w-[44px] flex flex-col items-center justify-center rounded-xl px-2 text-xs font-medium whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 ${
            activeSection === 'targets'
              ? 'text-blue-700 bg-blue-50'
              : 'text-neutral-600'
          }`}
        >
          <Target className="h-4 w-4" aria-hidden="true" />
          <span>Target</span>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('monthly')}
          className={`min-h-[44px] min-w-[44px] flex flex-col items-center justify-center rounded-xl px-2 text-xs font-medium whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 ${
            activeSection === 'monthly'
              ? 'text-blue-700 bg-blue-50'
              : 'text-neutral-600'
          }`}
        >
          <FileText className="h-4 w-4" aria-hidden="true" />
          <span>Laporan</span>
        </button>
      </nav>
    </div>
  );
}
