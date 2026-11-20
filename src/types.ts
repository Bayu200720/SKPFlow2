/* Definisi tipe data aplikasi Jejak Kinerja AI sesuai model data PRD */

export type UserRole = 'employee';

export type ActivityStatus = 'Belum dimulai' | 'Sedang dikerjakan' | 'Selesai';
export type ActivityPriority = 'Rendah' | 'Sedang' | 'Tinggi';
export type TargetStatus = 'Aktif' | 'Diarsipkan';
export type ReportStatus = 'Draft' | 'Final';

export type NavSection =
  | 'dashboard'
  | 'worklog'
  | 'targets'
  | 'weekly'
  | 'monthly'
  | 'profile';

export interface Unit {
  id: string;
  name: string;
  parent_unit_id: string | null;
}

export interface Profile {
  id: string;
  user_id: string;
  email: string;
  demo_password: string;
  full_name: string;
  nip: string;
  job_title: string;
  unit_id: string;
  unit_name: string;
  supervisor_name: string;
  role: UserRole;
  created_at: string;
}

export interface PerformanceTarget {
  id: string;
  user_id: string;
  title: string;
  description: string;
  indicator: string;
  target_value: number | null;
  unit: string;
  period_start: string;
  period_end: string;
  status: TargetStatus;
  created_at: string;
}

export interface Activity {
  id: string;
  user_id: string;
  target_id: string | null;
  activity_date: string;
  title: string;
  description: string;
  category: string;
  output_description: string;
  output_quantity: number | null;
  output_unit: string;
  duration_minutes: number | null;
  status: ActivityStatus;
  priority: ActivityPriority;
  tags: string[];
  challenges: string;
  follow_up: string;
  created_at: string;
  updated_at: string;
}

export interface ActivityAttachment {
  id: string;
  activity_id: string;
  user_id: string;
  file_name: string;
  file_path: string;
  mime_type: string;
  file_size: number;
  data_url: string;
  uploaded_by: string;
  created_at: string;
}

export interface MonthlyReportActivityRow {
  activity_id: string;
  activity_date: string;
  title: string;
  output_text: string;
  has_output: boolean;
  target_title: string;
}

export interface MonthlyReportTargetRow {
  target_id: string;
  title: string;
  indicator: string;
  target_display: string;
  realization_display: string;
  supporting_count: number;
}

export interface MonthlyReportOutputSummary {
  unit: string;
  total_quantity: number;
  activity_count: number;
}

export interface MonthlyReportContent {
  header: {
    full_name: string;
    nip: string;
    job_title: string;
    unit_name: string;
    period_label: string;
  };
  executive_summary: string;
  activity_rows: MonthlyReportActivityRow[];
  target_rows: MonthlyReportTargetRow[];
  output_recap: MonthlyReportOutputSummary[];
  challenges_and_followup: string;
  closing_note: string;
}

export interface MonthlyReport {
  id: string;
  user_id: string;
  month: number;
  year: number;
  summary: string;
  report_content: MonthlyReportContent;
  status: ReportStatus;
  has_manual_edits: boolean;
  submitted_at: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface WeeklyRecapNote {
  id: string;
  user_id: string;
  week_start: string;
  week_end: string;
  summary: string;
  updated_at: string;
}

export interface PersonalNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  read_at: string | null;
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  metadata: Record<string, string | number | boolean | null>;
  created_at: string;
}

export interface AppState {
  version: number;
  current_user_id: string | null;
  units: Unit[];
  profiles: Profile[];
  performance_targets: PerformanceTarget[];
  activities: Activity[];
  activity_attachments: ActivityAttachment[];
  monthly_reports: MonthlyReport[];
  weekly_recaps: WeeklyRecapNote[];
  notifications: PersonalNotification[];
  audit_logs: AuditLog[];
}

export interface QuickAddItemDraft {
  id: string;
  selected: boolean;
  activity_date: string;
  title: string;
  description: string;
  category: string;
  target_id: string | null;
  recommended_target_reason: string;
  output_description: string;
  output_quantity: number | null;
  output_unit: string;
  status: ActivityStatus;
}
