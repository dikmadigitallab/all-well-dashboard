// Aplica migrations SQL no Supabase via conexão direta ao banco (pg)
// Tenta múltiplos padrões de hostname até conectar

import { readFileSync, readdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '../..');

const envContent = readFileSync(resolve(projectRoot, '.env'), 'utf-8');
const env = Object.fromEntries(
  envContent.split('\n').filter(Boolean).map(line => {
    const eqIdx = line.indexOf('=');
    return [line.slice(0, eqIdx).trim(), line.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '')];
  })
);

const REF = env.SUPABASE_PROJECT_ID || env.VITE_SUPABASE_PROJECT_ID;
const PW = env.SENHABD;

if (!REF || !PW) {
  console.error('❌ SUPABASE_PROJECT_ID ou SENHABD não encontrados no .env');
  process.exit(1);
}

const REGIONS = [
  'us-east-1','us-east-2','us-west-1','us-west-2',
  'sa-east-1','eu-west-1','eu-west-2','eu-central-1',
  'ap-southeast-1','ap-southeast-2','ap-northeast-1','ca-central-1'
];

function candidates(ref, pw) {
  const e = encodeURIComponent(pw);
  const list = [];
  for (const r of REGIONS) {
    list.push({ label: `pooler ${r} txn`,  conn: `postgresql://postgres.${ref}:${e}@aws-0-${r}.pooler.supabase.com:6543/postgres` });
    list.push({ label: `pooler ${r} sess`, conn: `postgresql://postgres.${ref}:${e}@aws-0-${r}.pooler.supabase.com:5432/postgres` });
  }
  list.push({ label: 'direct db.{ref}', conn: `postgresql://postgres:${e}@db.${ref}.supabase.co:5432/postgres` });
  return list;
}

async function findConnection(cands) {
  for (const c of cands) {
    try {
      const pool = new pg.Pool({ connectionString: c.conn, ssl: { rejectUnauthorized: false }, max: 1, connectionTimeoutMillis: 5000 });
      const client = await pool.connect();
      const res = await client.query('SELECT version()');
      client.release();
      return { pool, label: c.label, conn: c.conn, version: res.rows[0].version };
    } catch { /* next */ }
  }
  return null;
}

async function main() {
  const cands = candidates(REF, PW);
  console.log(`📦 ${REF}`);
  console.log(`🔌 Testando conexões...\n`);

  const conn = await findConnection(cands);
  if (!conn) {
    console.error('❌ Nenhuma conexão funcionou. Verifique SENHABD.');
    console.error('\n📋 Ache a string correta em:');
    console.error('   https://supabase.com/dashboard/project/' + REF + '/settings/database\n');
    process.exit(1);
  }

  console.log(`✅ Conectado via ${conn.label}`);
  console.log(`   ${conn.version.split(',')[0]}\n`);

  const dir = resolve(projectRoot, 'supabase/migrations');
  const files = readdirSync(dir).filter(f => f.endsWith('.sql')).sort();

  for (const file of files) {
    const sql = readFileSync(resolve(dir, file), 'utf-8').trim();
    if (!sql) { console.log(`⏭️  ${file} — vazio`); continue; }
    process.stdout.write(`▶️  ${file}... `);
    try {
      await conn.pool.query(sql);
      console.log('✅');
    } catch (err) {
      const m = err.message || '';
      if (m.includes('already exists') || m.includes('duplicate key')) {
        console.log('⚠️  Já existe');
      } else {
        console.log(`❌ ${m.slice(0, 160)}`);
      }
    }
  }

  await conn.pool.end();
  console.log('\n🏁 Finalizado!');
}

main().catch(err => { console.error(`\n💥 ${err.message}`); process.exit(1); });
