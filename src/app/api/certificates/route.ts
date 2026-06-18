import { NextRequest, NextResponse } from 'next/server';
import { queryOne } from '@/lib/db';
import { getAuthContext } from '@/lib/auth/middleware';
import { handleApiError } from '@/lib/api/handleError';

/**
 * POST /api/certificates — generate a certificate for student achievement
 * Returns an HTML certificate page; in production, use puppeteer for PDF.
 * For now: returns HTML that browser can print-to-PDF.
 */
export async function POST(req: NextRequest) {
  try {
    const ctx = await getAuthContext();
    const { achievement_id } = await req.json();

    const achievement = await queryOne<{
      id: number; title: string; description: string; rank_position: number;
      achievement_type: string; date_achieved: string;
      student_name: string; tournament_name: string | null;
    }>(
      `SELECT a.*, s.name as student_name, t.name as tournament_name
       FROM achievements a
       LEFT JOIN students s ON a.student_id = s.id
       LEFT JOIN tournaments t ON a.tournament_id = t.id
       WHERE a.id = ? AND a.tenant_id = ?`,
      [achievement_id, ctx.tenantId || 0],
    );

    if (!achievement) {
      return NextResponse.json({ success: false, error: 'Prestasi tidak ditemukan' }, { status: 404 });
    }

    const html = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <title>Sertifikat - ${achievement.title}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Georgia', serif; background: #fff; }
    .certificate {
      width: 800px; min-height: 600px; margin: 0 auto; padding: 60px;
      border: 4px double #1a1a2e; position: relative;
      text-align: center; background: linear-gradient(135deg, #f9f9f9 0%, #fff 100%);
    }
    .certificate::before { content: ''; position: absolute; top: 12px; left: 12px; right: 12px; bottom: 12px; border: 1px solid #ccc; pointer-events: none; }
    .logo { font-size: 28px; font-weight: bold; color: #1a1a2e; margin-bottom: 10px; }
    .logo span { color: #CCFF00; background: #0A0A0C; padding: 2px 8px; }
    .title { font-size: 36px; color: #1a1a2e; margin-bottom: 20px; font-style: italic; }
    .body { font-size: 16px; color: #444; line-height: 1.8; margin-bottom: 30px; }
    .student-name { font-size: 32px; color: #1a1a2e; font-weight: bold; margin: 20px 0; border-bottom: 2px solid #1a1a2e; display: inline-block; padding-bottom: 4px; }
    .detail { font-size: 14px; color: #666; margin: 20px 0; }
    .details-row { display: flex; justify-content: center; gap: 40px; margin: 20px 0; font-size: 14px; color: #555; }
    .footer { margin-top: 40px; font-size: 12px; color: #888; display: flex; justify-content: space-between; border-top: 1px solid #ddd; padding-top: 20px; }
  </style>
</head>
<body>
  <div class="certificate">
    <div class="logo">Build<span>Up</span></div>
    <div class="title">SERTIFIKAT PRESTASI</div>
    <p class="body">Dengan bangga diberikan kepada:</p>
    <div class="student-name">${achievement.student_name || 'Atlet Muda'}</div>
    <p class="body">Atas prestasi:</p>
    <div class="detail">
      <strong style="font-size:22px;color:#1a1a2e">${achievement.title}</strong>
    </div>
    <p style="color:#555;font-size:15px">${achievement.description || ''}</p>
    <div class="details-row">
      <span>🏆 ${achievement.achievement_type === 'individual' ? 'Perorangan' : 'Tim'}</span>
      <span>🥇 Peringkat #${achievement.rank_position}</span>
      <span>📅 ${achievement.date_achieved}</span>
    </div>
    ${achievement.tournament_name ? `<p style="font-size:13px;color:#666">Turnamen: ${achievement.tournament_name}</p>` : ''}
    <div class="footer">
      <span>BuildUp — Grassroots Sports Platform</span>
      <span>ID: CERT-${String(achievement.id).padStart(6, '0')}</span>
    </div>
  </div>
  <script>window.print();</script>
</body>
</html>`;

    return new NextResponse(html, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  } catch (err) {
    return handleApiError(err);
  }
}
