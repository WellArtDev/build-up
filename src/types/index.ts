export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  meta?: {
    total: number;
    page: number;
    limit: number;
  };
}

export type SportType = 'football' | 'basketball' | 'martial_arts' | 'swimming' | 'other';

export type SubscriptionTier = 'starter' | 'growth' | 'professional' | 'enterprise';

export type SubscriptionStatus = 'trial' | 'active' | 'suspended' | 'cancelled';

export type UserRole = 'super_admin' | 'academy_owner' | 'academy_admin' | 'coach' | 'parent';

export type StudentStatus = 'active' | 'alumni' | 'suspended';

export type Gender = 'male' | 'female';

export type ScheduleType = 'training' | 'match' | 'tournament';

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

export type TransactionType = 'income' | 'expense' | 'spp_payment';

export type TransactionStatus = 'pending' | 'paid' | 'overdue' | 'cancelled';

export type TournamentStatus = 'upcoming' | 'ongoing' | 'completed';

export type AchievementType = 'individual' | 'team';

export type AnnouncementTarget = 'all' | 'parents' | 'students' | 'coaches';

export type AnnouncementPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface Tenant {
  id: number;
  name: string;
  slug: string;
  sport_type: SportType;
  address: string;
  phone: string;
  email: string;
  subscription_tier: SubscriptionTier;
  subscription_status: SubscriptionStatus;
  trial_ends_at: string;
  settings: TenantSettings;
  created_at: string;
  updated_at: string;
}

export interface TenantSettings {
  wablas_api_key?: string;
  wablas_sender?: string;
  qris_enabled?: boolean;
  bank_transfer_enabled?: boolean;
  notification_preferences?: Record<string, boolean>;
  logo_url?: string;
  color_scheme?: string;
}

export interface User {
  id: number;
  tenant_id: number | null;
  email: string;
  name: string;
  role: UserRole;
  phone: string;
  avatar: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Student {
  id: number;
  tenant_id: number;
  student_code: string;
  name: string;
  nik: string;
  nisn: string;
  date_of_birth: string;
  gender: Gender;
  position: string;
  photo: string | null;
  address: string;
  parent_contact: string;
  parent_email: string;
  previous_clubs: string;
  status: StudentStatus;
  age_group: string;
  enrollment_date: string;
  created_at: string;
  updated_at: string;
}

export interface Coach {
  id: number;
  tenant_id: number;
  user_id: number;
  license_number: string;
  specialization: string;
  experience_years: number;
  bio: string;
  created_at: string;
  updated_at: string;
}

export interface Schedule {
  id: number;
  tenant_id: number;
  title: string;
  type: ScheduleType;
  age_group: string;
  coach_id: number;
  date: string;
  start_time: string;
  end_time: string;
  location: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface Attendance {
  id: number;
  tenant_id: number;
  schedule_id: number;
  student_id: number;
  status: AttendanceStatus;
  check_in_time: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface Assessment {
  id: number;
  tenant_id: number;
  student_id: number;
  coach_id: number;
  assessment_date: string;
  assessment_period: string;
  technical_first_touch: number;
  technical_passing: number;
  technical_dribbling: number;
  technical_shooting: number;
  tactical_positioning: number;
  tactical_decision_making: number;
  physical_stamina: number;
  physical_speed_agility: number;
  physical_strength: number;
  mental_discipline: number;
  mental_teamwork: number;
  mental_fighting_spirit: number;
  coach_notes: string;
  evidence_photos: string[];
  created_at: string;
  updated_at: string;
}

export interface FinancialTransaction {
  id: number;
  tenant_id: number;
  student_id: number | null;
  type: TransactionType;
  amount: number;
  description: string;
  category: string;
  payment_method: string;
  status: TransactionStatus;
  due_date: string;
  paid_date: string | null;
  invoice_number: string;
  created_at: string;
  updated_at: string;
}

export interface Tournament {
  id: number;
  tenant_id: number;
  name: string;
  organizer: string;
  start_date: string;
  end_date: string;
  location: string;
  age_category: string;
  tournament_type: string;
  status: TournamentStatus;
  created_at: string;
  updated_at: string;
}

export interface TournamentParticipant {
  id: number;
  tenant_id: number;
  tournament_id: number;
  student_id: number;
  position: string;
  jersey_number: number;
  created_at: string;
  updated_at: string;
}

export interface Achievement {
  id: number;
  tenant_id: number;
  tournament_id: number | null;
  student_id: number | null;
  achievement_type: AchievementType;
  title: string;
  description: string;
  rank_position: number;
  certificate_file: string | null;
  date_achieved: string;
  created_at: string;
  updated_at: string;
}

export interface Announcement {
  id: number;
  tenant_id: number;
  title: string;
  content: string;
  target_audience: AnnouncementTarget;
  priority: AnnouncementPriority;
  sent_via_whatsapp: boolean;
  scheduled_at: string | null;
  created_by: number;
  created_at: string;
  updated_at: string;
}

export interface TenantSetting {
  id: number;
  tenant_id: number;
  setting_key: string;
  setting_value: unknown;
  created_at: string;
  updated_at: string;
}
