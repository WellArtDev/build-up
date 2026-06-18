import 'dotenv/config';
import { query } from './index';
import bcrypt from 'bcryptjs';

async function seed() {
  console.log('Seeding database...\n');

  const passwordHash = await bcrypt.hash('password123', 12);
  const now = new Date();
  const trialEnds = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000);

  // 1. Super Admin
  console.log('  Creating super admin...');
  await query(
    `INSERT INTO users (tenant_id, email, password_hash, name, role, phone, is_active)
     VALUES (NULL, ?, ?, 'Super Admin', 'super_admin', '081234567890', TRUE)`,
    ['superadmin@buildup.id', passwordHash],
  );

  // 2. Demo Academy
  console.log('  Creating demo academy...');
  const tenantResult = await query(
    `INSERT INTO tenants (name, slug, sport_type, address, phone, email, subscription_tier, subscription_status, trial_ends_at, settings)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      'SSB Garuda Muda',
      'ssb-garuda-muda',
      'football',
      'Jl. Merdeka No. 10, Jakarta Selatan',
      '08211567890',
      'garuda@email.com',
      'starter',
      'trial',
      trialEnds,
      JSON.stringify({
        qris_enabled: true,
        bank_transfer_enabled: true,
        logo_url: null,
      }),
    ],
  );

  const tenantId = (tenantResult as { insertId: number }).insertId || 1;

  // 3. Academy Owner
  console.log('  Creating academy owner...');
  const ownerResult = await query(
    `INSERT INTO users (tenant_id, email, password_hash, name, role, phone, is_active)
     VALUES (?, ?, ?, ?, ?, ?, TRUE)`,
    [tenantId, 'owner@garuda.id', passwordHash, 'Budi Santoso', 'academy_owner', '08211567891'],
  );

  const ownerId = (ownerResult as { insertId: number }).insertId;

  // 4. Coach
  console.log('  Creating coach...');
  const coachUserResult = await query(
    `INSERT INTO users (tenant_id, email, password_hash, name, role, phone, is_active)
     VALUES (?, ?, ?, ?, ?, ?, TRUE)`,
    [tenantId, 'coach@garuda.id', passwordHash, 'Andi Prasetyo', 'coach', '08211567892'],
  );

  const coachUserId = (coachUserResult as { insertId: number }).insertId;

  const coachResult = await query(
    `INSERT INTO coaches (tenant_id, user_id, license_number, specialization, experience_years, bio)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [tenantId, coachUserId, 'LIC-AFC-2024-001', 'Youth Development, Tactical Analysis', 8, 'Pelatih bersertifikat AFC dengan pengalaman 8 tahun membina usia muda.'],
  );

  const coachId = (coachResult as { insertId: number }).insertId;

  // 5. Students
  console.log('  Creating demo students...');
  const students = [
    { name: 'Rizky Pratama', nik: '3174010201050001', nisn: '0011223344', dob: '2015-03-15', gender: 'male', position: 'Striker', ageGroup: 'U-10', parent: '08551234567', parentEmail: 'parent.rizky@email.com' },
    { name: 'Dimas Ardiansyah', nik: '3174020302060002', nisn: '0011223345', dob: '2015-07-22', gender: 'male', position: 'Midfielder', ageGroup: 'U-10', parent: '08551234568', parentEmail: 'parent.dimas@email.com' },
    { name: 'Ahmad Fauzi', nik: '3174030403070003', nisn: '0011223346', dob: '2014-11-08', gender: 'male', position: 'Defender', ageGroup: 'U-12', parent: '08551234569', parentEmail: 'parent.ahmad@email.com' },
    { name: 'Siti Nuraini', nik: '3174040504080004', nisn: '0011223347', dob: '2014-01-30', gender: 'female', position: 'Winger', ageGroup: 'U-12', parent: '08551234570', parentEmail: 'parent.siti@email.com' },
    { name: 'Bima Sakti', nik: '3174050605090005', nisn: '0011223348', dob: '2016-09-12', gender: 'male', position: 'Goalkeeper', ageGroup: 'U-8', parent: '08551234571', parentEmail: 'parent.bima@email.com' },
  ];

  const studentIds: number[] = [];
  for (let i = 0; i < students.length; i++) {
    const s = students[i];
    const code = `SSB${tenantId.toString().padStart(3, '0')}${(i + 1).toString().padStart(3, '0')}`;
    const result = await query(
      `INSERT INTO students (tenant_id, student_code, name, nik, nisn, date_of_birth, gender, position, photo, address, parent_contact, parent_email, previous_clubs, status, age_group, enrollment_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NULL, ?, ?, ?, '', 'active', ?, CURDATE())`,
      [tenantId, code, s.name, s.nik, s.nisn, s.dob, s.gender, s.position, 'Jl. Cempaka Indah, Jakarta', s.parent, s.parentEmail, s.ageGroup],
    );
    studentIds.push((result as { insertId: number }).insertId);
  }

  // 6. Parent user
  console.log('  Creating parent user...');
  await query(
    `INSERT INTO users (tenant_id, email, password_hash, name, role, phone, is_active)
     VALUES (?, ?, ?, ?, ?, ?, TRUE)`,
    [tenantId, 'parent.rizky@email.com', passwordHash, 'Sari Pratama', 'parent', '08551234567'],
  );

  // 7. Demo schedules
  console.log('  Creating demo schedules...');
  await query(
    `INSERT INTO schedules (tenant_id, title, type, age_group, coach_id, date, start_time, end_time, location, notes)
     VALUES
     (?, 'Latihan Rutin Selasa', 'training', 'U-10', ?, CURDATE() + INTERVAL 1 DAY, '15:30:00', '17:30:00', 'Lapangan Garuda, Jaksel', 'Bawa sepatu dan air minum sendiri'),
     (?, 'Latihan Rutin Kamis', 'training', 'U-12', ?, CURDATE() + INTERVAL 3 DAY, '15:30:00', '17:30:00', 'Lapangan Garuda, Jaksel', 'Fokus passing dan positioning'),
     (?, 'Friendly Match vs SSB Elang', 'match', 'U-12', ?, CURDATE() + INTERVAL 6 DAY, '08:00:00', '10:30:00', 'Lapangan Merdeka', 'Datang 30 menit sebelum kick-off')`,
    [tenantId, coachId, tenantId, coachId, tenantId, coachId],
  );

  // 8. Demo assessments
  console.log('  Creating demo assessment...');
  const assessDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  await query(
    `INSERT INTO assessments (tenant_id, student_id, coach_id, assessment_date, assessment_period,
       technical_first_touch, technical_passing, technical_dribbling, technical_shooting,
       tactical_positioning, tactical_decision_making,
       physical_stamina, physical_speed_agility, physical_strength,
       mental_discipline, mental_teamwork, mental_fighting_spirit,
       coach_notes)
     VALUES (?, ?, ?, ?, 'Juni 2024 Minggu 1', 7, 6, 7, 5, 6, 5, 7, 8, 6, 8, 7, 9, 'Siswa menunjukkan perkembangan bagus. Perlu tingkatkan shooting accuracy.')`,
    [tenantId, studentIds[0], coachId, assessDate],
  );

  // 9. Demo financial
  console.log('  Creating demo transactions...');
  await query(
    `INSERT INTO financial_transactions (tenant_id, student_id, type, amount, description, category, payment_method, status, due_date, paid_date, invoice_number)
     VALUES
     (?, ?, 'spp_payment', 150000, 'SPP Juni 2024', 'SPP', 'QRIS', 'paid', '2024-06-10', '2024-06-08', 'INV-GAR-2024-001'),
     (?, ?, 'spp_payment', 150000, 'SPP Juli 2024', 'SPP', 'Transfer', 'pending', CURDATE() + INTERVAL 5 DAY, NULL, 'INV-GAR-2024-002')`,
    [tenantId, studentIds[0], tenantId, studentIds[0]],
  );

  // 10. Demo announcements
  console.log('  Creating demo announcements...');
  await query(
    `INSERT INTO announcements (tenant_id, title, content, target_audience, priority, created_by)
     VALUES
     (?, 'Jadwal Latihan Liburan', 'Latihan selama liburan sekolah tetap berjalan seperti biasa. Mohon kehadiran tepat waktu.', 'all', 'high', ?),
     (?, 'Pembayaran SPP Juli', 'Orang tua dimohon untuk melakukan pembayaran SPP Juli sebelum tanggal 10. Terima kasih.', 'parents', 'normal', ?)`,
    [tenantId, ownerId, tenantId, ownerId],
  );

  console.log('\n✅ Seed complete!');
  console.log('\nDemo credentials:');
  console.log('  Super Admin: superadmin@buildup.id / password123');
  console.log('  Academy Owner: owner@garuda.id / password123');
  console.log('  Coach: coach@garuda.id / password123');
  console.log('  Parent: parent.rizky@email.com / password123');

  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
