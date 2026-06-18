import { getPool } from './index';
import type { PoolConnection } from 'mysql2/promise';

/**
 * Execute a callback within a database transaction.
 * Auto-rollback on error, auto-commit on success.
 */
export async function withTransaction<T>(
  fn: (conn: PoolConnection) => Promise<T>,
): Promise<T> {
  const pool = getPool();
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();
    const result = await fn(conn);
    await conn.commit();
    return result;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

/**
 * Execute query with timeout.
 * Default: 10 seconds.
 */
export async function queryWithTimeout<T>(
  sql: string,
  params: unknown[] = [],
  timeoutMs = 10000,
): Promise<T> {
  const pool = getPool();
  const conn = await pool.getConnection();

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [rows] = await Promise.race([
      conn.execute(sql, params),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(`Query timeout after ${timeoutMs}ms`)), timeoutMs),
      ),
    ]) as [unknown, unknown];
    return rows as T;
  } finally {
    conn.release();
  }
}
