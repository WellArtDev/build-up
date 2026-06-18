import { getPool } from './index';

/**
 * Database health check — used by monitoring and startup.
 */
export async function checkDbHealth(): Promise<{ ok: boolean; latency: number; error?: string }> {
  const start = Date.now();
  try {
    const pool = getPool();
    await pool.execute('SELECT 1');
    return { ok: true, latency: Date.now() - start };
  } catch (err) {
    return { ok: false, latency: Date.now() - start, error: err instanceof Error ? err.message : String(err) };
  }
}

/**
 * Get pool statistics for monitoring.
 */
export function getPoolStats() {
  const pool = getPool();
  // mysql2 pool doesn't expose stats directly; track via wrapper in production
  return {
    configuredLimit: (pool as unknown as { config?: { connectionLimit?: number } }).config?.connectionLimit || 10,
    status: 'ok',
  };
}
