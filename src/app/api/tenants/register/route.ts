import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const registerSchema = z.object({
  academyName: z.string().min(3, 'Nama akademi minimal 3 karakter'),
  academySlug: z.string().min(3).regex(/^[a-z0-9-]+$/, 'Format slug tidak valid'),
  sportType: z.enum(['football', 'basketball', 'martial_arts', 'swimming', 'other']),
  address: z.string().min(5, 'Alamat wajib diisi'),
  phone: z.string().min(8, 'Nomor telepon wajib diisi'),
  email: z.string().email('Format email tidak valid'),
  ownerName: z.string().min(3, 'Nama pemilik wajib diisi'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = registerSchema.safeParse(body);

    if (!validated.success) {
      const firstError = validated.error.issues[0];
      return NextResponse.json(
        { success: false, error: firstError.message },
        { status: 400 },
      );
    }

    const { academyName, academySlug, sportType, address, phone, email, ownerName, password } = validated.data;

    // Check existing email
    const existingUser = await queryOne<{ id: number }>(
      'SELECT id FROM users WHERE email = ?',
      [email],
    );
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Email sudah terdaftar' },
        { status: 409 },
      );
    }

    // Check existing slug
    const existingSlug = await queryOne<{ id: number }>(
      'SELECT id FROM tenants WHERE slug = ?',
      [academySlug],
    );
    if (existingSlug) {
      return NextResponse.json(
        { success: false, error: 'Nama akademi sudah digunakan' },
        { status: 409 },
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const trialEnds = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000);

    // Create tenant
    const tenantResult = await query(
      `INSERT INTO tenants (name, slug, sport_type, address, phone, email, subscription_tier, subscription_status, trial_ends_at, settings)
       VALUES (?, ?, ?, ?, ?, ?, 'starter', 'trial', ?, ?)`,
      [
        academyName,
        academySlug,
        sportType,
        address,
        phone,
        email,
        trialEnds,
        JSON.stringify({ qris_enabled: true, bank_transfer_enabled: true }),
      ],
    );

    const tenantId = (tenantResult as { insertId: number }).insertId;

    // Create owner user
    await query(
      `INSERT INTO users (tenant_id, email, password_hash, name, role, phone, is_active)
       VALUES (?, ?, ?, ?, 'academy_owner', ?, TRUE)`,
      [tenantId, email, passwordHash, ownerName, phone],
    );

    return NextResponse.json({
      success: true,
      data: {
        tenantId,
        slug: academySlug,
        name: academyName,
        sportType,
        trialEnds,
      },
    });
  } catch (err) {
    console.error('Registration error:', err);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan saat pendaftaran' },
      { status: 500 },
    );
  }
}
