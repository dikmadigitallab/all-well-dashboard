// Debug de conexão — testa cada candidato com feedback detalhado
import pg from 'pg';

const REF = 'gsxznhzbvcmkytfhkvug';
const PW = '7bBjTGaalBDCA30z';

const REGIONS = ['us-east-1', 'sa-east-1', 'eu-west-1', 'us-west-2'];

async function test(label, connStr) {
  process.stdout.write(`${label}... `);
  const pool = new pg.Pool({
    connectionString: connStr,
    ssl: { rejectUnauthorized: false },
    max: 1,
    connectionTimeoutMillis: 8000
  });
  try {
    const client = await pool.connect();
    const res = await client.query('SELECT 1 AS ok');
    client.release();
    console.log(`✅ (connected!)`);
    return true;
  } catch (err) {
    console.log(`❌ ${err.message.slice(0, 120)}`);
    return false;
  } finally {
    await pool.end().catch(() => {});
  }
}

const e = encodeURIComponent(PW);

console.log('=== Pooler (postgres.{ref} username) ===\n');
for (const r of REGIONS) {
  await test(`pooler ${r}:6543`, `postgresql://postgres.${REF}:${e}@aws-0-${r}.pooler.supabase.com:6543/postgres`);
  await test(`pooler ${r}:5432`, `postgresql://postgres.${REF}:${e}@aws-0-${r}.pooler.supabase.com:5432/postgres`);
}

console.log('\n=== Pooler (postgres username) ===\n');
for (const r of REGIONS) {
  await test(`pooler ${r}:6543`, `postgresql://postgres:${e}@aws-0-${r}.pooler.supabase.com:6543/postgres`);
  await test(`pooler ${r}:5432`, `postgresql://postgres:${e}@aws-0-${r}.pooler.supabase.com:5432/postgres`);
}

console.log('\n=== Direct ===\n');
await test('direct db.{ref}:5432', `postgresql://postgres:${e}@db.${REF}.supabase.co:5432/postgres`);
