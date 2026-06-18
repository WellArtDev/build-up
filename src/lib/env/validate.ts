/**
 * Environment validation on startup.
 * Called by instrumentation.ts or on first API request.
 */

interface EnvCheck {
  key: string;
  required: boolean;
  value: string | undefined;
}

export function validateEnv(): { ok: boolean; missing: string[] } {
  const checks: EnvCheck[] = [
    { key: 'DB_HOST', required: true, value: process.env.DB_HOST },
    { key: 'DB_USER', required: true, value: process.env.DB_USER },
    { key: 'DB_PASSWORD', required: true, value: process.env.DB_PASSWORD },
    { key: 'DB_NAME', required: true, value: process.env.DB_NAME },
    { key: 'NEXTAUTH_URL', required: true, value: process.env.NEXTAUTH_URL },
    { key: 'NEXTAUTH_SECRET', required: true, value: process.env.NEXTAUTH_SECRET },
    { key: 'WABLAS_TOKEN', required: false, value: process.env.WABLAS_TOKEN },
    { key: 'WABLAS_SECRET_KEY', required: false, value: process.env.WABLAS_SECRET_KEY },
  ];

  const missing = checks
    .filter((c) => c.required && !c.value)
    .map((c) => c.key);

  if (missing.length > 0) {
    console.error(`❌ Missing required env vars: ${missing.join(', ')}`);
  }

  return { ok: missing.length === 0, missing };
}
