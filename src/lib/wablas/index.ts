/**
 * Wablas WhatsApp Gateway Integration
 * Docs: https://wablas.com/documentation/api
 *
 * Base URL: https://wablas.com
 * Auth: Authorization header with {token}.{secret_key}
 */

const WABLAS_BASE = process.env.WABLAS_API_URL || 'https://wablas.com';

interface WablasConfig {
  token: string;
  secretKey: string;
  sender?: string;
}

interface SendMessageParams {
  phone: string;
  message: string;
  config: WablasConfig;
  isGroup?: boolean;
  priority?: boolean;
}

interface SendInvoiceParams {
  phone: string;
  studentName: string;
  amount: number;
  dueDate: string;
  invoiceNumber: string;
  paymentInfo: string;
  config: WablasConfig;
}

interface SendAnnouncementParams {
  phones: string[];
  title: string;
  content: string;
  priority: string;
  config: WablasConfig;
}

/**
 * Check if Wablas API is configured and responding
 */
export async function testConnection(config: WablasConfig): Promise<{ ok: boolean; message: string }> {
  try {
    const res = await fetch(`${WABLAS_BASE}/api/device/info?token=${config.token}`, {
      headers: { Authorization: config.token },
    });

    if (!res.ok) {
      return { ok: false, message: `HTTP ${res.status}: Gagal terhubung ke Wablas` };
    }

    const data = await res.json();
    if (data.status) {
      return { ok: true, message: `Terhubung: ${data.name || 'Device'} (${data.phone || '-'})` };
    }
    return { ok: false, message: data.message || 'Gagal menghubungkan device' };
  } catch {
    return { ok: false, message: 'Tidak dapat terhubung ke server Wablas' };
  }
}

/**
 * Get device info / credit balance
 */
export async function getDeviceInfo(config: WablasConfig) {
  try {
    const res = await fetch(`${WABLAS_BASE}/api/device/info?token=${config.token}`, {
      headers: { Authorization: config.token },
    });
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * Send a single WhatsApp message
 */
export async function sendMessage(params: SendMessageParams) {
  try {
    const auth = `${params.config.token}.${params.config.secretKey}`;
    const body = new URLSearchParams({
      phone: params.phone,
      message: params.message,
      ...(params.isGroup ? { isGroup: 'true' } : {}),
      ...(params.priority ? { priority: 'true' } : {}),
    });

    const res = await fetch(`${WABLAS_BASE}/api/send-message`, {
      method: 'POST',
      headers: {
        Authorization: auth,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });

    return await res.json();
  } catch (err) {
    return { status: false, message: err instanceof Error ? err.message : 'Failed' };
  }
}

/**
 * Send bulk messages (V2 endpoint — JSON array under "data" key)
 */
export async function sendBulkMessage(
  messages: { phone: string; message: string }[],
  config: WablasConfig,
) {
  try {
    const auth = `${config.token}.${config.secretKey}`;
    const res = await fetch(`${WABLAS_BASE}/api/v2/send-message`, {
      method: 'POST',
      headers: {
        Authorization: auth,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data: messages }),
    });

    return await res.json();
  } catch (err) {
    return { status: false, message: err instanceof Error ? err.message : 'Failed' };
  }
}

/**
 * Send invoice notification via WhatsApp
 */
export async function sendInvoiceNotification(params: SendInvoiceParams) {
  const message = `🏟️ *BuildUp — Invoice SPP*\n\n` +
    `Halo Orang Tua/Wali,\n\n` +
    `Berikut tagihan SPP untuk ananda *${params.studentName}*:\n\n` +
    `📋 No. Invoice: *${params.invoiceNumber}*\n` +
    `💰 Jumlah: *Rp ${params.amount.toLocaleString('id-ID')}*\n` +
    `📅 Jatuh Tempo: *${params.dueDate}*\n\n` +
    `Metode Pembayaran:\n${params.paymentInfo}\n\n` +
    `_Pesan ini dikirim otomatis oleh sistem BuildUp._`;

  return sendMessage({ phone: params.phone, message, config: params.config });
}

/**
 * Send payment reminder
 */
export async function sendPaymentReminder(params: SendInvoiceParams) {
  const message = `⚠️ *Pengingat Pembayaran SPP*\n\n` +
    `Halo Orang Tua/Wali,\n\n` +
    `Tagihan SPP untuk ananda *${params.studentName}* akan jatuh tempo:\n\n` +
    `📋 Invoice: *${params.invoiceNumber}*\n` +
    `💰 Jumlah: *Rp ${params.amount.toLocaleString('id-ID')}*\n` +
    `📅 Batas: *${params.dueDate}*\n\n` +
    `Mohon segera diselesaikan. Terima kasih.\n\n` +
    `_Pesan otomatis dari BuildUp_`;

  return sendMessage({ phone: params.phone, message, config: params.config });
}

/**
 * Send announcement broadcast
 */
export async function sendAnnouncement(params: SendAnnouncementParams) {
  const priorityEmoji = params.priority === 'urgent' ? '🔴' : params.priority === 'high' ? '🟡' : '🔵';
  const baseMessage = `${priorityEmoji} *[${params.priority.toUpperCase()}]* ${params.title}\n\n${params.content}\n\n_${params.priority === 'urgent' ? 'Mohon segera ditindaklanjuti.' : 'Terima kasih atas perhatiannya.'}_`;

  if (params.phones.length === 1) {
    return sendMessage({
      phone: params.phones[0],
      message: baseMessage,
      config: params.config,
    });
  }

  // Bulk send
  const messages = params.phones.map((phone) => ({ phone, message: baseMessage }));
  return sendBulkMessage(messages, params.config);
}

/**
 * Send OTP / verification code
 */
export async function sendOTP(phone: string, code: string, config: WablasConfig) {
  const message = `🔐 *Kode Verifikasi BuildUp*\n\nKode OTP Anda: *${code}*\n\nBerlaku 5 menit. Jangan bagikan kode ini ke siapapun.\n\n_BuildUp Security_`;

  const auth = `${config.token}.${config.secretKey}`;
  const body = new URLSearchParams({ phone, message, flag: 'instant' });

  const res = await fetch(`${WABLAS_BASE}/api/send-message`, {
    method: 'POST',
    headers: {
      Authorization: auth,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  });

  return await res.json();
}

/**
 * Get message report
 */
export async function getMessageReport(
  date: string,
  config: WablasConfig,
  filters?: { phone?: string; status?: string; type?: string },
) {
  try {
    const params = new URLSearchParams({ date, ...filters });
    const res = await fetch(`${WABLAS_BASE}/api/report/message?${params}`, {
      headers: { Authorization: config.token },
    });
    return await res.json();
  } catch {
    return null;
  }
}
