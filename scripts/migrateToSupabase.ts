import dotenv from 'dotenv';
import {
  hasSupabaseCredentials,
  connectSupabase,
  migrateJsonToSupabase,
  runSupabaseReadWriteVerification,
} from '../server/services/supabaseService.js';

dotenv.config();

async function main() {
  console.log('===================================================================');
  console.log('REVIEWLYTICS — Supabase PostgreSQL Migration & Reconciliation Tool');
  console.log('===================================================================');

  const creds = hasSupabaseCredentials();
  if (!creds.configured) {
    console.error(
      `[STOP] Missing required Supabase environment variables: ${creds.missingVars.join(', ')}`
    );
    console.error(
      'Please configure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env or environment secrets before running migration.'
    );
    process.exit(1);
  }

  console.log('[1/3] Verifying Supabase PostgreSQL connection & schema...');
  const conn = await connectSupabase();
  if (!conn.connected) {
    console.error(`[STOP] Supabase connection failed: ${conn.message}`);
    console.error(
      'Ensure you have applied supabase/migrations/20261026000001_initial_reviewlytics_schema.sql to your Supabase project.'
    );
    process.exit(1);
  }

  console.log('[2/3] Running safe read/write/cleanup verification test...');
  const rwTest = await runSupabaseReadWriteVerification();
  console.log(`  - Read Test: ${rwTest.readPass ? 'PASS' : 'FAIL'}`);
  console.log(`  - Safe Write/Read-Back Test: ${rwTest.writePass ? 'PASS' : 'FAIL'}`);
  if (!rwTest.readPass || !rwTest.writePass) {
    console.error(`[STOP] Verification failed: ${rwTest.message}`);
    process.exit(1);
  }

  console.log('[3/3] Migrating & reconciling records from data/*.json -> Supabase PostgreSQL...');
  const report = await migrateJsonToSupabase();

  console.log('\n--- Migration & Reconciliation Summary ---');
  console.log('Source Records (data/*.json):', report.sourceCounts);
  console.log('Imported / Upserted Records:', report.importedCounts);
  console.log('Destination Records in Supabase:', report.destinationCounts);
  console.log('Skipped / Invalid Records:', report.skippedOrFailed.length);
  if (report.skippedOrFailed.length > 0) {
    report.skippedOrFailed.forEach(item => {
      console.warn(`  [SKIP] ${item.entity} (${item.id}): ${item.reason}`);
    });
  }

  console.log('\nMigration complete!');
}

main().catch(err => {
  console.error('Migration script failed with unexpected error:', err.message);
  process.exit(1);
});
