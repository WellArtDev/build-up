// Instrumentation runs on server startup.
// Validates environment, database connectivity.
import { validateEnv } from '@/lib/env/validate';

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { ok, missing } = validateEnv();
    if (!ok) {
      console.warn(`⚠️  BuildUp: Missing env vars: ${missing.join(', ')}`);
      console.warn('⚠️  Some features may not work correctly.');
    } else {
      console.log('✅ BuildUp: All required environment variables present');
    }
  }
}
