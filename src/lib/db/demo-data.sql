-- Demo Data for SSB Garuda Muda (tenant_id=1)
-- Run after seed: mysql -u root -pwella buildup_db < src/lib/db/demo-data.sql

-- More students (3 additional)
INSERT IGNORE INTO students (id, tenant_id, student_code, name, nik, nisn, date_of_birth, gender, position, age_group, address, parent_contact, parent_email, enrollment_date, status) VALUES
(6, 1, 'SSB001006', 'Raka Wijaya', '3174060706100006', '0011223349', '2013-05-20', 'male', 'Defender', 'U-14', 'Jl. Melati No. 3, Jaksel', '08551234572', 'parent.raka@email.com', '2024-03-15', 'active'),
(7, 1, 'SSB001007', 'Putri Anjani', '3174070807110007', '0011223350', '2015-12-01', 'female', 'Midfielder', 'U-10', 'Jl. Anggrek No. 7, Jaksel', '08551234573', 'parent.putri@email.com', '2024-04-20', 'active'),
(8, 1, 'SSB001008', 'Faiz Ramadhan', '3174080908120008', '0011223351', '2012-08-14', 'male', 'Goalkeeper', 'U-14', 'Jl. Kenanga No. 5, Jaksel', '08551234574', 'parent.faiz@email.com', '2024-05-01', 'active');

-- Second coach
INSERT IGNORE INTO users (id, tenant_id, email, password_hash, name, role, phone, is_active) VALUES
(6, 1, 'coach2@garuda.id', '$2a$12$LJ3m4ys3GZfnYMz8kVsKaOjVYH6UAVmJKdSgVH3P7xCcPySgYB8Gi', 'Rina Hermawan', 'coach', '08211567893', TRUE);
INSERT IGNORE INTO coaches (id, tenant_id, user_id, license_number, specialization, experience_years, bio) VALUES
(2, 1, 6, 'LIC-AFC-2024-002', 'Goalkeeper Specialist, Physical Training', 5, 'Pelatih kiper berpengalaman, mantan kiper Timnas U-19');

-- More schedules (id 4-6)
INSERT INTO schedules (tenant_id, title, type, age_group, coach_id, date, start_time, end_time, location, notes) VALUES
(1, 'Latihan Kiper Khusus', 'training', 'U-14', 2, DATE_ADD(CURDATE(), INTERVAL 2 DAY), '15:00:00', '17:00:00', 'Lapangan Garuda, Jaksel', 'Latihan khusus kiper — bawa sarung tangan'),
(1, 'Latihan Fisik Mingguan', 'training', 'Semua', 1, DATE_ADD(CURDATE(), INTERVAL 5 DAY), '06:00:00', '08:00:00', 'Stadion Mini Garuda', 'Lari pagi + physical conditioning'),
(1, 'Turnamen Antar SSB', 'tournament', 'U-12', 1, DATE_ADD(CURDATE(), INTERVAL 14 DAY), '08:00:00', '17:00:00', 'Lapangan Merdeka', 'Turnamen tahunan');

-- More assessments (4 additional)
INSERT INTO assessments (tenant_id, student_id, coach_id, assessment_date, assessment_period, technical_first_touch, technical_passing, technical_dribbling, technical_shooting, tactical_positioning, tactical_decision_making, physical_stamina, physical_speed_agility, physical_strength, mental_discipline, mental_teamwork, mental_fighting_spirit, coach_notes) VALUES
(1, 2, 1, DATE_SUB(CURDATE(), INTERVAL 5 DAY), 'Juni 2024 Minggu 2', 8, 7, 8, 6, 7, 7, 8, 9, 7, 9, 8, 8, 'Dimas berkembang pesat di dribbling dan speed. Teruskan latihan passing panjang.'),
(1, 3, 1, DATE_SUB(CURDATE(), INTERVAL 3 DAY), 'Juni 2024 Minggu 2', 6, 7, 5, 5, 8, 7, 7, 6, 8, 7, 7, 8, 'Posisi defender sangat cocok. Positioning dan strength bagus.'),
(1, 4, 1, DATE_SUB(CURDATE(), INTERVAL 2 DAY), 'Juni 2024 Minggu 3', 7, 8, 7, 6, 7, 6, 7, 8, 5, 8, 9, 8, 'Skill teknis solid, teamwork excellent. Tambah porsi latihan strength.'),
(1, 6, 1, DATE_SUB(CURDATE(), INTERVAL 1 DAY), 'Juni 2024 Minggu 3', 6, 6, 6, 5, 7, 6, 7, 7, 7, 8, 7, 7, 'Raka adaptasi baik. Perlu lebih percaya diri saat duel udara.');

-- Financial transactions (5 new)
INSERT INTO financial_transactions (tenant_id, student_id, type, amount, description, category, payment_method, status, due_date, paid_date, invoice_number) VALUES
(1, 2, 'spp_payment', 150000, 'SPP Juli 2024', 'SPP', 'QRIS', 'paid', '2024-07-10', '2024-07-08', 'INV-GAR-2024-003'),
(1, 3, 'spp_payment', 150000, 'SPP Juli 2024', 'SPP', 'Transfer', 'paid', '2024-07-10', '2024-07-05', 'INV-GAR-2024-004'),
(1, 4, 'spp_payment', 150000, 'SPP Juli 2024', 'SPP', 'QRIS', 'pending', DATE_ADD(CURDATE(), INTERVAL 10 DAY), NULL, 'INV-GAR-2024-005'),
(1, NULL, 'income', 500000, 'Sponsor lokal', 'Sponsorship', 'Transfer', 'paid', NULL, CURDATE(), 'INV-GAR-INC-001'),
(1, NULL, 'expense', 250000, 'Bola latihan (5 pcs)', 'Equipment', 'Cash', 'paid', NULL, CURDATE(), 'INV-GAR-EXP-001');

-- Tournaments (2)
INSERT INTO tournaments (tenant_id, name, organizer, start_date, end_date, location, age_category, tournament_type, status) VALUES
(1, 'Piala Garuda Cup 2024', 'SSB Garuda Muda', DATE_ADD(CURDATE(), INTERVAL 30 DAY), DATE_ADD(CURDATE(), INTERVAL 32 DAY), 'Stadion Utama GBK', 'U-12', 'Piala', 'upcoming'),
(1, 'Liga Junior Jakarta', 'Dispora DKI', DATE_SUB(CURDATE(), INTERVAL 60 DAY), DATE_SUB(CURDATE(), INTERVAL 45 DAY), 'Lapangan Senayan', 'U-14', 'Liga', 'completed');

-- Achievements (2)
INSERT INTO achievements (tenant_id, student_id, tournament_id, achievement_type, title, description, rank_position, date_achieved) VALUES
(1, 1, 2, 'individual', 'Top Scorer Liga Junior', 'Mencetak 8 gol selama turnamen', 1, DATE_SUB(CURDATE(), INTERVAL 45 DAY)),
(1, NULL, 2, 'team', 'Juara 2 Liga Junior Jakarta', 'Prestasi tim U-14', 2, DATE_SUB(CURDATE(), INTERVAL 45 DAY));

-- Announcements (2)
INSERT INTO announcements (tenant_id, title, content, target_audience, priority, created_by) VALUES
(1, 'Libur Nasional — Latihan Ditiadakan', 'Sehubungan dengan Hari Kemerdekaan, jadwal latihan 17 Agustus DITIADAKAN. Latihan normal kembali 19 Agustus.', 'all', 'high', 2),
(1, 'Pendaftaran Garuda Cup 2024', 'Turnamen tahunan Garuda Cup akan dilaksanakan bulan depan. Siswa yang berminat harap menghubungi coach. Biaya pendaftaran Rp 50.000/siswa.', 'students', 'normal', 2);

-- Attendance for schedule 1
INSERT IGNORE INTO attendance (tenant_id, schedule_id, student_id, status, check_in_time, notes) VALUES
(1, 1, 1, 'present', CONCAT(DATE_SUB(CURDATE(), INTERVAL 0 DAY), ' 15:25:00'), NULL),
(1, 1, 2, 'present', CONCAT(DATE_SUB(CURDATE(), INTERVAL 0 DAY), ' 15:30:00'), NULL),
(1, 1, 4, 'late', CONCAT(DATE_SUB(CURDATE(), INTERVAL 0 DAY), ' 15:55:00'), 'Macet di perjalanan'),
(1, 1, 3, 'absent', NULL, NULL),
(1, 1, 5, 'present', CONCAT(DATE_SUB(CURDATE(), INTERVAL 0 DAY), ' 15:20:00'), NULL);
