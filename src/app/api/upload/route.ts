import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth/middleware';
import { handleApiError } from '@/lib/api/handleError';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(req: NextRequest) {
  try {
    const ctx = await getAuthContext(['academy_owner', 'academy_admin', 'coach', 'super_admin']);

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const type = formData.get('type') as string || 'general'; // student_photo, evidence, certificate, logo

    if (!file) {
      return NextResponse.json({ success: false, error: 'File wajib diupload' }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ success: false, error: 'Tipe file tidak diizinkan. Gunakan JPG, PNG, WEBP, GIF, atau PDF' }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ success: false, error: 'Ukuran file maksimal 5MB' }, { status: 400 });
    }

    // Tenant-isolated storage
    const tenantId = ctx.tenantId || 'admin';
    const uploadDir = join(process.cwd(), 'public', 'uploads', String(tenantId), type);
    await mkdir(uploadDir, { recursive: true });

    const ext = file.name.split('.').pop() || 'jpg';
    const filename = `${randomUUID()}.${ext}`;
    const filepath = join(uploadDir, filename);

    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filepath, buffer);

    const url = `/uploads/${tenantId}/${type}/${filename}`;

    return NextResponse.json({ success: true, data: { url, filename } });
  } catch (err) {
    return handleApiError(err);
  }
}
