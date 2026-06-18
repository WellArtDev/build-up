import mysql2 from 'mysql2/promise';

declare global {
  // eslint-disable-next-line no-var
  var _mysqlPool: mysql2.Pool | undefined;
}

const poolConfig: mysql2.PoolOptions = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'buildup_user',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'buildup',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
};

export function getPool(): mysql2.Pool {
  if (!globalThis._mysqlPool) {
    globalThis._mysqlPool = mysql2.createPool(poolConfig);
  }
  return globalThis._mysqlPool;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function query<T>(sql: string, params?: any[]): Promise<T> {
  const pool = getPool();
  const [rows] = await pool.execute(sql, params);
  return rows as T;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function queryOne<T>(sql: string, params?: any[]): Promise<T | null> {
  const rows = await query<T[]>(sql, params);
  return rows[0] || null;
}
