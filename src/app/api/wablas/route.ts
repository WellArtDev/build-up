import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth/middleware';
import { handleApiError } from '@/lib/api/handleError';
import { queryOne } from '@/lib/db';
import * as wablas from '@/lib/wablas';

interface TenantSettings {
  settings: {
    wablas_api_key?: string;
    wablas_token?: string;
    wablas_secret_key?: string;
    use_buildup_wablas?: boolean;
  };
}

/**
 * GET /api/wablas?action=test — test Wablas connection for the tenant
 * POST /api/wablas?action=send-invoice — send invoice notification
 * POST /api/wablas?action=send-reminder — send payment reminder
 * POST /api/wablas?action=broadcast — send announcement broadcast
 */
export async function GET(req: NextRequest) {
  try {
    const ctx = await getAuthContext(['academy_owner', 'academy_admin', 'super_admin']);
    const url = new URL(req.url);
    const action = url.searchParams.get('action') || 'test';

    // Get tenant config
    const tenant = await queryOne<TenantSettings>(
      'SELECT settings FROM tenants WHERE id = ?',
      [ctx.tenantId || 1],
    );

    const settings = tenant?.settings || {};
    const useBuildup = settings.use_buildup_wablas !== false; // default: use BuildUp's Wablas

    // Build config — prefer tenant's own API keys, fallback to platform default
    const config = {
      token: settings.wablas_token || process.env.WABLAS_TOKEN || '',
      secretKey: settings.wablas_secret_key || process.env.WABLAS_SECRET_KEY || '',
    };

    if (!config.token) {
      return NextResponse.json({
        success: false,
        error: 'Wablas belum dikonfigurasi. Silakan isi API Key di Pengaturan.',
        source: useBuildup ? 'buildUp' : 'tenant',
      }, { status: 400 });
    }

    if (action === 'test') {
      const result = await wablas.testConnection(config);
      return NextResponse.json({ success: result.ok, data: result });
    }

    return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const ctx = await getAuthContext(['academy_owner', 'academy_admin', 'super_admin']);
    const url = new URL(req.url);
    const action = url.searchParams.get('action') || '';

    const tenant = await queryOne<TenantSettings>(
      'SELECT settings FROM tenants WHERE id = ?',
      [ctx.tenantId || 1],
    );
    const settings = tenant?.settings || {};
    const config = {
      token: settings.wablas_token || process.env.WABLAS_TOKEN || '',
      secretKey: settings.wablas_secret_key || process.env.WABLAS_SECRET_KEY || '',
    };

    if (!config.token) {
      return NextResponse.json({ success: false, error: 'Wablas belum dikonfigurasi' }, { status: 400 });
    }

    const body = await req.json();

    switch (action) {
      case 'send-invoice': {
        const result = await wablas.sendInvoiceNotification({
          phone: body.phone,
          studentName: body.student_name,
          amount: body.amount,
          dueDate: body.due_date,
          invoiceNumber: body.invoice_number,
          paymentInfo: body.payment_info || 'QRIS / Transfer Bank (lihat aplikasi)',
          config,
        });
        return NextResponse.json({ success: !!result?.status, data: result });
      }

      case 'send-reminder': {
        const result = await wablas.sendPaymentReminder({
          phone: body.phone,
          studentName: body.student_name,
          amount: body.amount,
          dueDate: body.due_date,
          invoiceNumber: body.invoice_number,
          paymentInfo: body.payment_info || '',
          config,
        });
        return NextResponse.json({ success: !!result?.status, data: result });
      }

      case 'broadcast': {
        const result = await wablas.sendAnnouncement({
          phones: body.phones || [body.phone],
          title: body.title,
          content: body.content,
          priority: body.priority || 'normal',
          config,
        });
        return NextResponse.json({ success: !!result?.status, data: result });
      }

      case 'send-otp': {
        const result = await wablas.sendOTP(body.phone, body.code, config);
        return NextResponse.json({ success: !!result?.status, data: result });
      }

      default:
        return NextResponse.json({ success: false, error: `Unknown action: ${action}` }, { status: 400 });
    }
  } catch (err) {
    return handleApiError(err);
  }
}
