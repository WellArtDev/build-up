import 'dotenv/config';
import { query } from './index';
import { readFileSync } from 'fs';
import { join } from 'path';

async function migrate() {
  console.log('Running database migrations...\n');

  const sql = readFileSync(join(process.cwd(), 'src', 'lib', 'db', 'schema.sql'), 'utf-8');

  // Split by semicolons, filter empty
  const statements = sql
    .split(';')
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !s.startsWith('--') && s !== '');

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];
    const preview = statement.substring(0, 80).replace(/\n/g, ' ');
    try {
      await query(statement + ';');
      console.log(`  ✓ ${preview}...`);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`  ✗ ${preview}...`);
      console.error(`    ${message}`);
    }
  }

  console.log('\nMigration complete.');
  process.exit(0);
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
