-- BuildUp Database Indexes
-- Run after schema migration for production performance

-- Student search (name, code, NIK)
CREATE INDEX IF NOT EXISTS idx_students_tenant ON students(tenant_id);
CREATE INDEX IF NOT EXISTS idx_students_name ON students(name);
CREATE INDEX IF NOT EXISTS idx_students_code ON students(student_code);
CREATE INDEX IF NOT EXISTS idx_students_nik ON students(nik);
CREATE INDEX IF NOT EXISTS idx_students_status ON students(tenant_id, status);

-- Users
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_tenant ON users(tenant_id);

-- Assessments
CREATE INDEX IF NOT EXISTS idx_assessments_tenant_student ON assessments(tenant_id, student_id);
CREATE INDEX IF NOT EXISTS idx_assessments_date ON assessments(assessment_date);

-- Schedules
CREATE INDEX IF NOT EXISTS idx_schedules_tenant_date ON schedules(tenant_id, date);

-- Attendance
CREATE INDEX IF NOT EXISTS idx_attendance_schedule ON attendance(schedule_id);
CREATE INDEX IF NOT EXISTS idx_attendance_tenant ON attendance(tenant_id);

-- Financial
CREATE INDEX IF NOT EXISTS idx_finances_tenant ON financial_transactions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_finances_status ON financial_transactions(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_finances_date ON financial_transactions(paid_date);

-- Coaches
CREATE INDEX IF NOT EXISTS idx_coaches_tenant ON coaches(tenant_id);

-- Announcements
CREATE INDEX IF NOT EXISTS idx_announcements_tenant ON announcements(tenant_id);
CREATE INDEX IF NOT EXISTS idx_announcements_priority ON announcements(tenant_id, priority);

-- Tournaments
CREATE INDEX IF NOT EXISTS idx_tournaments_tenant ON tournaments(tenant_id);

-- Achievements
CREATE INDEX IF NOT EXISTS idx_achievements_tenant ON achievements(tenant_id);

-- Tenant Settings
CREATE INDEX IF NOT EXISTS idx_tenant_settings_key ON tenant_settings(tenant_id, setting_key);
