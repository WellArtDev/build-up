import { z } from 'zod';

/**
 * Shared validation schemas for all API endpoints.
 * Import and use in route handlers — consistent validation everywhere.
 */

export const email = z.string().email('Format email tidak valid');
export const phone = z.string().regex(/^(\+62|62|0)8[1-9][0-9]{6,11}$/, 'Format nomor HP tidak valid');
export const nik = z.string().regex(/^\d{16}$/, 'NIK harus 16 digit').optional().or(z.literal(''));
export const password = z.string().min(6, 'Password minimal 6 karakter');
export const name = z.string().min(2, 'Minimal 2 karakter').max(255);
export const idNumber = z.coerce.number().int().positive();

// --- Auth ---
export const loginSchema = z.object({
  email: email,
  password: z.string().min(1, 'Password wajib diisi'),
});

export const registerSchema = z.object({
  academyName: z.string().min(3, 'Nama akademi minimal 3 karakter'),
  academySlug: z.string().min(3).regex(/^[a-z0-9-]+$/, 'Format slug tidak valid'),
  sportType: z.enum(['football', 'basketball', 'martial_arts', 'swimming', 'other']),
  address: z.string().min(5, 'Alamat wajib diisi'),
  phone: z.string().min(8, 'Nomor telepon wajib diisi'),
  email: email,
  ownerName: name,
  password: password,
});

export const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, 'Password lama wajib diisi'),
  newPassword: password,
});

// --- Students ---
export const createStudentSchema = z.object({
  name: z.string().min(2, 'Nama wajib diisi'),
  nik: z.string().optional(),
  nisn: z.string().optional(),
  date_of_birth: z.string().optional(),
  gender: z.enum(['male', 'female']).optional(),
  position: z.string().optional(),
  address: z.string().optional(),
  parent_contact: z.string().optional(),
  parent_email: z.string().email().optional().or(z.literal('')),
  age_group: z.string().optional(),
});

export const updateStudentSchema = z.object({
  name: z.string().optional(),
  nik: z.string().optional(),
  nisn: z.string().optional(),
  date_of_birth: z.string().optional(),
  gender: z.enum(['male', 'female']).optional(),
  position: z.string().optional(),
  address: z.string().optional(),
  parent_contact: z.string().optional(),
  parent_email: z.string().email().optional().or(z.literal('')),
  age_group: z.string().optional(),
  status: z.enum(['active', 'alumni', 'suspended']).optional(),
  previous_clubs: z.string().optional(),
});

// --- Assessments ---
export const createAssessmentSchema = z.object({
  student_id: z.number().int().positive('Siswa wajib dipilih'),
  assessment_date: z.string().min(1, 'Tanggal wajib diisi'),
  assessment_period: z.string().optional(),
  technical_first_touch: z.number().int().min(1).max(10).optional(),
  technical_passing: z.number().int().min(1).max(10).optional(),
  technical_dribbling: z.number().int().min(1).max(10).optional(),
  technical_shooting: z.number().int().min(1).max(10).optional(),
  tactical_positioning: z.number().int().min(1).max(10).optional(),
  tactical_decision_making: z.number().int().min(1).max(10).optional(),
  physical_stamina: z.number().int().min(1).max(10).optional(),
  physical_speed_agility: z.number().int().min(1).max(10).optional(),
  physical_strength: z.number().int().min(1).max(10).optional(),
  mental_discipline: z.number().int().min(1).max(10).optional(),
  mental_teamwork: z.number().int().min(1).max(10).optional(),
  mental_fighting_spirit: z.number().int().min(1).max(10).optional(),
  coach_notes: z.string().max(2000).optional(),
});

// --- Schedules ---
export const createScheduleSchema = z.object({
  title: z.string().min(2, 'Judul wajib diisi'),
  type: z.enum(['training', 'match', 'tournament']).optional(),
  age_group: z.string().optional(),
  coach_id: z.number().int().positive().optional().nullable(),
  date: z.string().min(1, 'Tanggal wajib diisi'),
  start_time: z.string().min(1, 'Waktu mulai wajib diisi'),
  end_time: z.string().min(1, 'Waktu selesai wajib diisi'),
  location: z.string().max(500).optional(),
  notes: z.string().max(2000).optional(),
});

// --- Finances ---
export const createTransactionSchema = z.object({
  type: z.enum(['income', 'expense', 'spp_payment']),
  amount: z.number().positive('Jumlah harus > 0'),
  description: z.string().max(500).optional(),
  category: z.string().max(100).optional(),
  payment_method: z.string().max(50).optional(),
  student_id: z.number().int().positive().optional().nullable(),
  due_date: z.string().optional(),
});

// --- Coaches ---
export const createCoachSchema = z.object({
  name: name,
  email: email,
  phone: z.string().optional(),
  license_number: z.string().max(100).optional(),
  specialization: z.string().max(255).optional(),
  experience_years: z.number().int().min(0).max(60).optional(),
  bio: z.string().max(2000).optional(),
  password: z.string().min(6).optional(),
});

// --- Tournaments ---
export const createTournamentSchema = z.object({
  name: z.string().min(2, 'Nama turnamen wajib diisi'),
  organizer: z.string().optional(),
  start_date: z.string().min(1, 'Tanggal mulai wajib diisi'),
  end_date: z.string().min(1, 'Tanggal selesai wajib diisi'),
  location: z.string().max(500).optional(),
  age_category: z.string().optional(),
  tournament_type: z.string().max(100).optional(),
});

// --- Achievements ---
export const createAchievementSchema = z.object({
  achievement_type: z.enum(['individual', 'team']),
  title: z.string().min(2, 'Judul wajib diisi'),
  description: z.string().max(2000).optional(),
  rank_position: z.number().int().min(1).optional(),
  date_achieved: z.string().min(1, 'Tanggal wajib diisi'),
  student_id: z.number().int().positive().optional().nullable(),
  tournament_id: z.number().int().positive().optional().nullable(),
});

// --- Announcements ---
export const createAnnouncementSchema = z.object({
  title: z.string().min(2, 'Judul wajib diisi'),
  content: z.string().min(1, 'Konten wajib diisi'),
  target_audience: z.enum(['all', 'parents', 'students', 'coaches']).optional(),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).optional(),
});

// --- Attendance ---
export const attendanceRecordsSchema = z.object({
  records: z.array(z.object({
    student_id: z.number().int().positive(),
    status: z.enum(['present', 'absent', 'late', 'excused']),
    notes: z.string().max(500).optional(),
  })),
});

// --- URL Params ---
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(50).optional().default(20),
  search: z.string().max(100).optional(),
  status: z.string().max(30).optional(),
  type: z.string().max(30).optional(),
  age_group: z.string().max(20).optional(),
  sport: z.string().max(30).optional(),
  location: z.string().max(100).optional(),
  student_id: z.coerce.number().int().positive().optional(),
});

/**
 * Validate and sanitize request body. Returns parsed data or error.
 */
export function validateBody<T>(schema: z.ZodSchema<T>, body: unknown): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(body);
  if (!result.success) {
    return { success: false, error: result.error.issues[0]?.message || 'Validasi gagal' };
  }
  return { success: true, data: result.data };
}

/**
 * Validate URL search params. Returns parsed data or defaults.
 */
export function validateQueryParams(req: { url: string }, schema = paginationSchema) {
  const url = new URL(req.url);
  const params: Record<string, string> = {};
  url.searchParams.forEach((v, k) => { params[k] = v; });
  const result = schema.safeParse(params);
  return result.success ? result.data : { page: 1, limit: 20 };
}
