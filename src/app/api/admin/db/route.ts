import { NextRequest, NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';
import { query } from '@/lib/db';
import { getAuthContext } from '@/lib/auth/middleware';
import { handleApiError } from '@/lib/api/handleError';

/**
 * POST /api/admin/db — run DB operations from super admin panel (no SSH needed)
 * Actions: migrate, seed, indexes, demo-data, status
 */
export async function POST(req: NextRequest) {
  try {
    await getAuthContext(['super_admin']);

    const { action } = await req.json();
    const results: string[] = [];

    switch (action) {
      case 'migrate': {
        const sql = readFileSync(join(process.cwd(), 'src', 'lib', 'db', 'schema.sql'), 'utf-8');
        const statements = sql.split(';').map((s) => s.trim()).filter((s) => s.length > 0 && !s.startsWith('--'));
        for (const stmt of statements) {
          try {
            await query(stmt + ';');
            results.push(`✓ ${stmt.substring(0, 60)}...`);
          } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            // Ignore "already exists" errors
            if (msg.includes('already exists') || msg.includes('ER_DUP_')) {
              results.push(`• ${stmt.substring(0, 60)}... (skip — already exists)`);
            } else {
              results.push(`✗ ${stmt.substring(0, 60)}... — ${msg}`);
            }
          }
        }
        break;
      }

      case 'indexes': {
        const sql = readFileSync(join(process.cwd(), 'src', 'lib', 'db', 'indexes.sql'), 'utf-8');
        const statements = sql.split(';').map((s) => s.trim()).filter((s) => s.length > 0 && !s.startsWith('--'));
        for (const stmt of statements) {
          try {
            await query(stmt + ';');
            results.push(`✓ ${stmt.substring(0, 60)}...`);
          } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            if (msg.includes('Duplicate') || msg.includes('already exists')) {
              results.push(`• ${stmt.substring(0, 60)}... (skip)`);
            } else {
              results.push(`✗ ${stmt.substring(0, 60)}... — ${msg}`);
            }
          }
        }
        break;
      }

      case 'demo-data': {
        const sql = readFileSync(join(process.cwd(), 'src', 'lib', 'db', 'demo-data.sql'), 'utf-8');
        const statements = sql.split(';').map((s) => s.trim()).filter((s) => s.length > 0 && !s.startsWith('--'));
        for (const stmt of statements) {
          try {
            await query(stmt + ';');
            if (!stmt.includes('INSERT IGNORE') || !stmt.includes('IGNORE')) {
              results.push(`✓ ${stmt.substring(0, 60)}...`);
            }
          } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            if (msg.includes('Duplicate') || msg.includes('ER_DUP_')) {
              results.push(`• Skip — data already exists`);
            } else if (msg.includes('Cannot add')) {
              results.push(`• Skip — constraint`);
            } else {
              results.push(`✗ ${stmt.substring(0, 60)}... — ${msg}`);
            }
          }
        }
        if (results.length === 0) results.push('✅ Demo data loaded (no new statements executed)');
        break;
      }

      case 'status': {
        const tables = await query('SHOW TABLES');
        const counts: Record<string, number> = {};
        const tableList = (tables as Record<string, string>[]).map((r) => Object.values(r)[0]);

        for (const table of tableList) {
          const row = await query(`SELECT COUNT(*) as c FROM \`${table}\``);
          counts[table] = (row as { c: number }[])[0]?.c || 0;
        }

        return NextResponse.json({
          success: true,
          data: {
            tables: tableList.length,
            counts,
            dbName: process.env.DB_NAME || 'unknown',
            timestamp: new Date().toISOString(),
          },
        });
      }

      default:
        return NextResponse.json({ success: false, error: `Unknown action: ${action}. Available: migrate, seed, indexes, demo-data, status` }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: { results } });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      availableActions: ['migrate', 'indexes', 'demo-data', 'status'],
      description: 'POST /api/admin/db with { action: "migrate" | "indexes" | "demo-data" | "status" }',
    },
  });
}
